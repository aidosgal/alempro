'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/entities/auth';
import { VacancyWithDetails, CreateVacancyData, UpdateVacancyData, useVacancyStore } from '@/entities/vacancy';
import { VacancyForm, VacancyList } from '@/features/vacancy';
import { createClient } from '@/shared/supabase/client';
import DefaultLayout from '@/widgets/layout/DefaultLayout';

export default function VacancyPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  
  const { 
    vacancies, 
    loading, 
    error, 
    fetchVacancies, 
    createVacancy, 
    updateVacancy, 
    deleteVacancy,
    clearError 
  } = useVacancyStore();

  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<VacancyWithDetails | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrganizationId();
    }
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      fetchVacancies(organizationId);
    }
  }, [organizationId, fetchVacancies]);

  const fetchOrganizationId = async () => {
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
  };

  const handleSubmit = async (data: CreateVacancyData | UpdateVacancyData): Promise<boolean> => {
    if ('id' in data) {
      // Update existing vacancy
      const success = await updateVacancy(data as UpdateVacancyData);
      if (success) {
        setShowForm(false);
        setEditingVacancy(null);
      }
      return success;
    } else {
      // Create new vacancy
      const success = await createVacancy(data as CreateVacancyData);
      if (success) {
        setShowForm(false);
      }
      return success;
    }
  };

  const handleEditVacancy = (vacancy: VacancyWithDetails) => {
    setEditingVacancy(vacancy);
    setShowForm(true);
  };

  const handleDeleteVacancy = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      await deleteVacancy(id);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVacancy(null);
    clearError();
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
            <h1 className="text-2xl font-bold text-black">Управление вакансиями</h1>
            <p className="text-gray-600 mt-1">Создавайте и управляйте вакансиями для найма персонала</p>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Создать вакансию
            </button>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Всего вакансий</h3>
            <div className="text-2xl font-bold text-black">{vacancies.length}</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Активных вакансий</h3>
            <div className="text-2xl font-bold text-black">{vacancies.length}</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-600 mb-2">За этот месяц</h3>
            <div className="text-2xl font-bold text-black">
              {vacancies.filter((v: VacancyWithDetails) => {
                if (!v.created_at) return false;
                const created = new Date(v.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <VacancyForm
            vacancy={editingVacancy || undefined}
            organizationId={organizationId}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            loading={loading}
          />
        )}

        {/* Vacancy List */}
        {!showForm && (
          <VacancyList
            vacancies={vacancies}
            loading={loading}
            onEdit={handleEditVacancy}
            onDelete={handleDeleteVacancy}
          />
        )}
      </div>
    </DefaultLayout>
  );
}