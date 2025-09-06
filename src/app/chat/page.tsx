'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';
import { useChatStore, ChatWithApplicant, CreateOrderData } from '@/entities/chat';
import { ChatList } from '@/features/chat';
import ChatLayout from '@/widgets/layout/ChatLayout';
import { createClient } from '@/shared/supabase/client';

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { chats, loading, error, fetchChats, subscribeToChats, clearError } = useChatStore();
  
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);

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
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToChats(organizationId);
      return unsubscribe;
    }
  }, [organizationId, fetchChats, subscribeToChats]);

  const handleChatSelect = (chat: ChatWithApplicant) => {
    router.push(`/chat/${chat.id}`);
  };

  const handleCreateOrder = async (data: CreateOrderData) => {
    if (!organizationId) return;

    try {
      // This will be handled by the individual chat page
      console.log('Creating order:', data);
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
        onChatSelect={handleChatSelect}
      />
    </div>
  );

  return (
    <ChatLayout sidebar={sidebar}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">Выберите чат</h2>
          <p className="text-gray-500">Выберите чат из списка слева, чтобы начать общение</p>
        </div>
      </div>
    </ChatLayout>
  );
}