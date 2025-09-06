import { create } from 'zustand';
import { createClient } from '@/shared/supabase/client';
import { Chat, ChatWithApplicant, Message, MessageWithSender, CreateMessageData } from './types';

interface ChatStore {
  chats: ChatWithApplicant[];
  currentChat: ChatWithApplicant | null;
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchChats: (organizationId: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (data: CreateMessageData) => Promise<boolean>;
  handleCreateOrder: (
    chatId: string,
    title: string,
    description: string,
    price: number,
    deadlineAt: string,
    serviceIds: string[]
  ) => Promise<void>;
  setCurrentChat: (chat: ChatWithApplicant | null) => void;
  clearError: () => void;
  subscribeToMessages: (chatId: string) => () => void;
  subscribeToChats: (organizationId: string) => () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,

  fetchChats: async (organizationId: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          applicant:applicants (
            id,
            first_name,
            last_name,
            user_id
          )
        `)
        .eq('organization_id', organizationId)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (chatsError) throw chatsError;

      const chatsWithApplicant: ChatWithApplicant[] = (chatsData || []).map(chat => ({
        id: chat.id,
        applicant_id: chat.applicant_id,
        organization_id: chat.organization_id,
        created_at: chat.created_at,
        last_message_at: chat.last_message_at,
        last_message_text: chat.last_message_text,
        last_sender: chat.last_sender,
        applicant: {
          id: chat.applicant?.id || '',
          first_name: chat.applicant?.first_name || null,
          last_name: chat.applicant?.last_name || null,
          user_id: chat.applicant?.user_id || null,
        }
      }));

      set({ chats: chatsWithApplicant, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chats',
        loading: false 
      });
      console.error('Error fetching chats:', error);
    }
  },

  fetchMessages: async (chatId: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender_applicant:applicants (
            id,
            first_name,
            last_name
          ),
          sender_manager:organization_users (
            id,
            managers (
              first_name,
              last_name
            )
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch message attachments
      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: attachmentsData } = await supabase
        .from('message_attachments')
        .select('*')
        .in('message_id', messageIds);

      // Fetch message orders with order details
      const { data: messageOrdersData } = await supabase
        .from('message_orders')
        .select(`
          *,
          order:orders (
            id,
            title,
            description,
            price,
            deadline_at,
            status,
            order_services (
              id,
              service:services (
                id,
                title,
                price
              )
            )
          )
        `)
        .in('message_id', messageIds);

      const messagesWithSender: MessageWithSender[] = (messagesData || []).map(message => {
        let sender = {
          id: '',
          name: 'Unknown',
          type: 'applicant' as 'applicant' | 'manager'
        };

        if (message.sender_applicant_id && message.sender_applicant) {
          sender = {
            id: message.sender_applicant.id,
            name: `${message.sender_applicant.first_name || ''} ${message.sender_applicant.last_name || ''}`.trim(),
            type: 'applicant'
          };
        } else if (message.sender_organization_manager_id && message.sender_manager) {
          sender = {
            id: message.sender_manager.id,
            name: `${message.sender_manager.managers?.first_name || ''} ${message.sender_manager.managers?.last_name || ''}`.trim(),
            type: 'manager'
          };
        }

        // Get attachments for this message
        const attachments = attachmentsData?.filter(att => att.message_id === message.id) || [];
        
        // Get orders for this message
        const orders = messageOrdersData?.filter(order => order.message_id === message.id) || [];

        return {
          id: message.id,
          chat_id: message.chat_id,
          content: message.content,
          created_at: message.created_at,
          metadata: message.metadata,
          sender_applicant_id: message.sender_applicant_id,
          sender_organization_manager_id: message.sender_organization_manager_id,
          sender,
          attachments,
          orders
        };
      });

      set({ messages: messagesWithSender, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        loading: false 
      });
      console.error('Error fetching messages:', error);
    }
  },

  sendMessage: async (data: CreateMessageData) => {
    try {
      const supabase = createClient();
      
      // Get current manager ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: manager } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!manager) throw new Error('Manager not found');

      const { data: orgUser } = await supabase
        .from('organization_users')
        .select('id')
        .eq('manager_id', manager.id)
        .single();

      if (!orgUser) throw new Error('Organization user not found');

      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: data.chatId,
          content: data.content,
          metadata: data.metadata || null,
          sender_organization_manager_id: orgUser.id
        }]);

      if (error) throw error;

      // Update chat's last message
      await supabase
        .from('chats')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_text: data.content,
          last_sender: 'manager'
        })
        .eq('id', data.chatId);

      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
      console.error('Error sending message:', error);
      return false;
    }
  },

  handleCreateOrder: async (
    chatId: string,
    title: string,
    description: string,
    price: number,
    deadlineAt: string,
    serviceIds: string[]
  ) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          title,
          description,
          price,
          deadline_at: deadlineAt,
          status: 'pending',
          created_by: userData.user.id
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order services
      if (serviceIds.length > 0) {
        const orderServices = serviceIds.map(serviceId => ({
          order_id: orderData.id,
          service_id: serviceId
        }));

        const { error: servicesError } = await supabase
          .from('order_services')
          .insert(orderServices);

        if (servicesError) throw servicesError;
      }

      // Create the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content: `📋 Order created: ${title}`,
          sender_applicant_id: userData.user.id,
          metadata: { type: 'order' }
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Link the order to the message
      const { error: messageOrderError } = await supabase
        .from('message_orders')
        .insert({
          message_id: messageData.id,
          order_id: orderData.id
        });

      if (messageOrderError) throw messageOrderError;

      // Refresh messages to show the new order
      await get().fetchMessages(chatId);
      
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create order',
        loading: false 
      });
      console.error('Error creating order:', error);
    }
  },

  subscribeToMessages: (chatId: string) => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Message change:', payload);
          // Refetch messages when there's a change
          get().fetchMessages(chatId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToChats: (organizationId: string) => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`chats-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('Chat change:', payload);
          // Refetch chats when there's a change
          get().fetchChats(organizationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  setCurrentChat: (chat: ChatWithApplicant | null) => set({ currentChat: chat }),
  clearError: () => set({ error: null })
}));
