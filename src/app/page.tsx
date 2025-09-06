'use client';

import { useAuthStore } from '@/entities/auth';
import { createClient } from '@/shared/supabase/client';
import DefaultLayout from '@/widgets/layout/DefaultLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface DashboardStats {
  totalApplicants: number;
  totalOrders: number;
  totalVacancies: number;
  totalChats: number;
  totalServices: number;
  organizationBalance: number;
  recentOrders: RecentOrder[];
  activeChats: ActiveChat[];
  monthlyRevenue: number;
  completedOrdersToday: number;
}

interface RecentOrder {
  id: string;
  title: string;
  price: number | null;
  created_at: string | null;
}

interface ActiveChat {
  id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  applicant_id: string;
}

export default function Page() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Параллельные запросы для лучшей производительности
      const [
        applicantsResult,
        ordersResult,
        vacanciesResult,
        chatsResult,
        servicesResult,
        balanceResult,
        recentOrdersResult,
        activeChatsResult
      ] = await Promise.all([
        supabase.from('applicants').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, price, created_at', { count: 'exact' }),
        supabase.from('vacancies').select('id', { count: 'exact' }),
        supabase.from('chats').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('organization_balance').select('amount').single(),
        supabase.from('orders').select('id, title, price, created_at, deadline_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('chats').select('id, last_message_text, last_message_at, applicant_id').order('last_message_at', { ascending: false }).limit(5)
      ]);

      // Подсчет месячного дохода
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyOrders = ordersResult.data?.filter(order => 
        order.created_at?.startsWith(currentMonth)
      ) || [];
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.price || 0), 0);

      // Подсчет завершенных заказов сегодня
      const today = new Date().toISOString().slice(0, 10);
      const todayOrders = ordersResult.data?.filter(order => 
        order.created_at?.startsWith(today)
      ) || [];

      setStats({
        totalApplicants: applicantsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalVacancies: vacanciesResult.count || 0,
        totalChats: chatsResult.count || 0,
        totalServices: servicesResult.count || 0,
        organizationBalance: balanceResult.data?.amount || 0,
        recentOrders: recentOrdersResult.data || [],
        activeChats: activeChatsResult.data || [],
        monthlyRevenue,
        completedOrdersToday: todayOrders.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-black">Главная страница</h1>
          <p className="text-gray-600 mt-1">Обзор деятельности по найму персонала из СНГ</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Соискатели"
            value={stats?.totalApplicants || 0}
            subtitle="Всего зарегистрировано"
          />
          <StatCard
            title="Активные заказы"
            value={stats?.totalOrders || 0}
            subtitle="В обработке"
          />
          <StatCard
            title="Вакансии"
            value={stats?.totalVacancies || 0}
            subtitle="Опубликовано"
          />
          <StatCard
            title="Чаты"
            value={stats?.totalChats || 0}
            subtitle="Активные диалоги"
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            title="Баланс организации"
            value={`₸${stats?.organizationBalance?.toLocaleString() || 0}`}
            subtitle="Текущий баланс"
            large
          />
          <StatCard
            title="Доход за месяц"
            value={`₸${stats?.monthlyRevenue?.toLocaleString() || 0}`}
            subtitle="Поступления"
            large
          />
          <StatCard
            title="Заказы сегодня"
            value={stats?.completedOrdersToday || 0}
            subtitle="Новые заказы"
            large
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Последние заказы</h3>
            <div className="space-y-3">
              {stats?.recentOrders?.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-black">{order.title}</p>
                    <p className="text-sm text-gray-600">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : 'Дата не указана'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">₸{order.price?.toLocaleString() || 0}</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Нет данных</p>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Активные чаты</h3>
            <div className="space-y-3">
              {stats?.activeChats?.map((chat) => (
                <div key={chat.id} className="py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        ID: {chat.applicant_id?.slice(0, 8)}...
                      </p>
                      <p className="text-black text-sm line-clamp-2">
                        {chat.last_message_text || 'Нет сообщений'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString('ru-RU') : 'Дата не указана'}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Нет активных чатов</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionButton
              title="Создать вакансию"
              onClick={() => router.push('/vacancy')}
            />
            <ActionButton
              title="Просмотреть чаты"
              onClick={() => router.push('/chat')}
            />
            <ActionButton
              title="Управление заказами"
              onClick={() => router.push('/order')}
            />
            <ActionButton
              title="Услуги"
              onClick={() => router.push('/service')}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  large?: boolean;
}

function StatCard({ title, value, subtitle, large = false }: StatCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className={`font-bold text-black ${large ? 'text-2xl' : 'text-xl'} mb-1`}>
        {value}
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

interface ActionButtonProps {
  title: string;
  onClick: () => void;
}

function ActionButton({ title, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="border border-gray-300 rounded-lg p-4 text-center hover:border-black transition-colors duration-200 group"
    >
      <span className="text-black font-medium group-hover:text-black">{title}</span>
    </button>
  );
}
