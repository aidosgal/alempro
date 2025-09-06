'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/entities/auth';
import { OrderStatus, OrderServiceStatus, OrderWithDetails, useOrderStore } from '@/entities/order';
import { OrderKanban } from '@/features/order';
import { createClient } from '@/shared/supabase/client';
import DefaultLayout from '@/widgets/layout/DefaultLayout';

export default function OrderPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  
  const { 
    orders, 
    loading, 
    error, 
    viewMode,
    fetchOrders, 
    updateOrderStatus,
    updateOrderServiceStatus,
    setViewMode,
    clearError 
  } = useOrderStore();

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);

  const fetchOrganizationId = useCallback(async () => {
    try {
      setLoadingOrganization(true);
      
      // Get manager by user_id
      const { data: manager, error: managerError } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (managerError || !manager) {
        console.error('Manager not found:', managerError);
        return;
      }

      // Get organization by manager_id
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
      fetchOrders(organizationId);
    }
  }, [organizationId, fetchOrders]);

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus({ orderId, status });
  };

  const handleServiceStatusChange = async (orderServiceId: string, status: OrderServiceStatus) => {
    await updateOrderServiceStatus({ orderServiceId, status });
  };

  if (loadingOrganization) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (!organizationId) {
    return (
      <DefaultLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Организация не найдена</p>
            <p className="text-gray-500 text-sm mt-2">Обратитесь к администратору</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Канбан заказов</h1>
            <p className="text-gray-600 mt-1">Управление заказами и услугами</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('orders')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'orders'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Заказы
            </button>
            <button
              onClick={() => setViewMode('services')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'services'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Услуги
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 text-sm mt-2"
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Всего заказов</h3>
            <div className="text-2xl font-bold text-black">{orders.length}</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">В работе</h3>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((order: OrderWithDetails) => order.status === 'in_progress').length}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Выполнено</h3>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((order: OrderWithDetails) => order.status === 'done').length}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Общая сумма</h3>
            <div className="text-2xl font-bold text-black">
              €{orders.reduce((sum: number, order: OrderWithDetails) => sum + (order.price || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && (
          <OrderKanban
            orders={orders}
            viewMode={viewMode}
            onOrderStatusChange={handleOrderStatusChange}
            onServiceStatusChange={handleServiceStatusChange}
          />
        )}
      </div>
    </DefaultLayout>
  );
}