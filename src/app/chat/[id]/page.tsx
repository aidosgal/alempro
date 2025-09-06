'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';
import { useChatStore, ChatWithApplicant, CreateMessageData, CreateOrderData } from '@/entities/chat';
import { ChatList, MessageList, MessageInput, CreateOrderModal, DebugMessageButtons } from '@/features/chat';
import ChatLayout from '@/widgets/layout/ChatLayout';
import { createClient } from '@/shared/supabase/client';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const { user } = useAuthStore();
  const { 
    chats, 
    currentChat, 
    messages, 
    loading, 
    error, 
    fetchChats, 
    fetchMessages, 
    sendMessage, 
    setCurrentChat, 
    subscribeToChats, 
    subscribeToMessages, 
    clearError 
  } = useChatStore();
  
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const supabase = createClient();

  const fetchOrganizationId = useCallback(async () => {
    try {
      setLoadingOrganization(true);
      
      const { data: manager, error: managerError } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (managerError || !manager) {
        console.error('Manager not found:', managerError);
        return;
      }

      const { data: orgUser, error: orgError } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('manager_id', manager.id)
        .single();

      if (orgError || !orgUser) {
        console.error('Organization not found:', orgError);
        return;
      }

      setOrganizationId(orgUser.organization_id);
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoadingOrganization(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    if (user) {
      fetchOrganizationId();
    }
  }, [user, fetchOrganizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchChats(organizationId);
      
      // Subscribe to real-time updates for chats
      const unsubscribeChats = subscribeToChats(organizationId);
      return unsubscribeChats;
    }
  }, [organizationId, fetchChats, subscribeToChats]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
      
      // Subscribe to real-time updates for messages
      const unsubscribeMessages = subscribeToMessages(chatId);
      return unsubscribeMessages;
    }
  }, [chatId, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    if (chats.length > 0 && chatId) {
      const chat = chats.find(c => c.id === chatId);
      setCurrentChat(chat || null);
    }
  }, [chats, chatId, setCurrentChat]);

  const handleChatSelect = (chat: ChatWithApplicant) => {
    router.push(`/chat/${chat.id}`);
  };

  const handleSendMessage = async (data: CreateMessageData) => {
    await sendMessage(data);
  };

  const handleCreateOrder = async (data: CreateOrderData) => {
    if (!organizationId || !currentChat) return;

    try {
      const supabase = createClient();
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          title: data.title,
          description: data.description,
          price: data.price,
          deadline_at: data.deadline ? new Date(data.deadline).toISOString() : null,
          applicant_id: currentChat.applicant_id,
          organization_id: organizationId,
          status: 'pending_funds'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order services
      if (data.services.length > 0) {
        const orderServices = data.services.map(serviceId => ({
          order_id: orderData.id,
          service_id: serviceId
        }));

        const { error: servicesError } = await supabase
          .from('order_services')
          .insert(orderServices);

        if (servicesError) throw servicesError;
      }

      // Send message about the order
      await sendMessage({
        chatId: data.chatId,
        content: `Создан новый заказ: ${data.title}`,
        metadata: {
          type: 'order',
          orderId: orderData.id,
          description: data.description,
          price: data.price,
          deadline: data.deadline,
          services: data.services
        }
      });

      setShowOrderModal(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (loadingOrganization) {
    return (
      <ChatLayout sidebar={<div className="p-4">Loading...</div>}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ChatLayout>
    );
  }

  if (!organizationId) {
    return (
      <ChatLayout sidebar={<div className="p-4">No organization found</div>}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600">Организация не найдена</p>
            <p className="text-gray-500 text-sm mt-2">Обратитесь к администратору</p>
          </div>
        </div>
      </ChatLayout>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-black">Чаты</h1>
        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              Закрыть
            </button>
          </div>
        )}
      </div>
      
      {/* Chat list */}
      <ChatList 
        chats={chats}
        currentChatId={chatId}
        onChatSelect={handleChatSelect}
      />
    </div>
  );

  if (!currentChat) {
    return (
      <ChatLayout sidebar={sidebar}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500">Чат не найден</p>
            <button
              onClick={() => router.push('/chat')}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Вернуться к списку чатов
            </button>
          </div>
        </div>
      </ChatLayout>
    );
  }

  const getApplicantName = (applicant: ChatWithApplicant['applicant']) => {
    const name = `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim();
    return name || 'Unnamed User';
  };

  return (
    <ChatLayout sidebar={sidebar}>
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {getApplicantName(currentChat.applicant).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-black">
                  {getApplicantName(currentChat.applicant)}
                </h2>
                <p className="text-sm text-gray-500">
                  Чат с соискателем
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push(`/order?chatId=${chatId}`)}
              className="text-gray-500 hover:text-gray-700"
              title="Перейти к заказам"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <MessageList 
          messages={messages}
          loading={loading}
        />

        {/* Message input */}
        <MessageInput
          chatId={chatId}
          onSendMessage={handleSendMessage}
          onCreateOrder={() => setShowOrderModal(true)}
          disabled={loading}
        />

        {/* Create order modal */}
        <CreateOrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onCreateOrder={handleCreateOrder}
          chatId={chatId}
          organizationId={organizationId}
        />
      </div>
    </ChatLayout>
  );
}
