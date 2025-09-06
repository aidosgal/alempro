import { create } from 'zustand';
import { createClient } from '@/shared/supabase/client';
import { OrderWithDetails, OrderServiceStatus, UpdateOrderStatusData, UpdateOrderServiceStatusData } from './types';

interface OrderStore {
  orders: OrderWithDetails[];
  loading: boolean;
  error: string | null;
  viewMode: 'orders' | 'services';
  
  // Actions
  fetchOrders: (organizationId: string) => Promise<void>;
  updateOrderStatus: (data: UpdateOrderStatusData) => Promise<boolean>;
  updateOrderServiceStatus: (data: UpdateOrderServiceStatusData) => Promise<boolean>;
  setViewMode: (mode: 'orders' | 'services') => void;
  clearError: () => void;
  getChatId: (applicantId: string, organizationId: string) => Promise<string | null>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  viewMode: 'orders',

  fetchOrders: async (organizationId: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      
      // Fetch orders with all related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_services (
            id,
            services (
              id,
              title,
              price
            )
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      console.log('Orders fetched:', ordersData?.length || 0, ordersData);

      // Fetch applicants
      const applicantIds = ordersData?.map(order => order.applicant_id) || [];
      const { data: applicantsData, error: applicantsError } = await supabase
        .from('applicants')
        .select('id, first_name, last_name, created_at, user_id')
        .in('id', applicantIds);

      if (applicantsError) throw applicantsError;

      // Fetch chats for applicants
      const { data: chatsData } = await supabase
        .from('chats')
        .select('id, applicant_id')
        .eq('organization_id', organizationId)
        .in('applicant_id', applicantIds);

      // Build complete orders with details
      const ordersWithDetails: OrderWithDetails[] = (ordersData || []).map(order => {
        const applicant = applicantsData?.find(app => app.id === order.applicant_id);
        const chat = chatsData?.find(chat => chat.applicant_id === order.applicant_id);

        return {
          id: order.id,
          title: order.title,
          description: order.description,
          price: order.price,
          created_at: order.created_at,
          deadline_at: order.deadline_at,
          applicant_id: order.applicant_id,
          organization_id: order.organization_id,
          status: order.status,
          applicant: {
            id: applicant?.id || '',
            first_name: applicant?.first_name || null,
            last_name: applicant?.last_name || null,
            created_at: applicant?.created_at || null,
            user_id: applicant?.user_id || null,
            phone: null, // Will be null until we add phone to applicants table
            email: null, // Will be null until we add email to applicants table
          },
          order_services: (order.order_services || []).map((os: {
            id: string;
            services?: {
              id: string;
              title: string;
              price: number | null;
            };
          }) => ({
            id: os.id,
            service: {
              id: os.services?.id || '',
              title: os.services?.title || '',
              price: os.services?.price || null,
            },
            status: 'not_started' as OrderServiceStatus // Default status
          })),
          chat_id: chat?.id || null,
        };
      });

      console.log('Orders with details built:', ordersWithDetails.length, ordersWithDetails);
      set({ orders: ordersWithDetails, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        loading: false 
      });
      console.error('Error fetching orders:', error);
    }
  },

  updateOrderStatus: async (data: UpdateOrderStatusData) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: data.status })
        .eq('id', data.orderId);

      if (error) throw error;

      // Update local state
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order =>
        order.id === data.orderId 
          ? { ...order, status: data.status }
          : order
      );
      
      set({ orders: updatedOrders, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update order status',
        loading: false 
      });
      return false;
    }
  },

  updateOrderServiceStatus: async (data: UpdateOrderServiceStatusData) => {
    // Since we don't have status field in order_services table, 
    // we'll store this locally for now
    const currentOrders = get().orders;
    const updatedOrders = currentOrders.map(order => ({
      ...order,
      order_services: order.order_services.map(service =>
        service.id === data.orderServiceId
          ? { ...service, status: data.status }
          : service
      )
    }));
    
    set({ orders: updatedOrders });
    return true;
  },

  getChatId: async (applicantId: string, organizationId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chats')
        .select('id')
        .eq('applicant_id', applicantId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error fetching chat ID:', error);
      return null;
    }
  },

  setViewMode: (mode: 'orders' | 'services') => set({ viewMode: mode }),
  clearError: () => set({ error: null })
}));
