import { create } from 'zustand';
import { createClient } from '@/shared/supabase/client';
import { VacancyWithDetails, CreateVacancyData, UpdateVacancyData, VacancyDetails } from './types';

interface VacancyStore {
  vacancies: VacancyWithDetails[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchVacancies: (organizationId: string) => Promise<void>;
  createVacancy: (data: CreateVacancyData) => Promise<boolean>;
  updateVacancy: (data: UpdateVacancyData) => Promise<boolean>;
  deleteVacancy: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVacancyStore = create<VacancyStore>((set, get) => ({
  vacancies: [],
  loading: false,
  error: null,

  fetchVacancies: async (organizationId: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const vacanciesWithDetails = (data || []).map(vacancy => ({
        ...vacancy,
        details: vacancy.details as VacancyDetails
      }));

      set({ vacancies: vacanciesWithDetails, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch vacancies',
        loading: false 
      });
    }
  },

  createVacancy: async (data: CreateVacancyData) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('vacancies')
        .insert([{
          title: data.title,
          description: data.description,
          details: data.details as unknown,
          organization_id: data.organization_id
        }]);

      if (error) throw error;

      // Refresh vacancies list
      await get().fetchVacancies(data.organization_id);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create vacancy',
        loading: false 
      });
      return false;
    }
  },

  updateVacancy: async (data: UpdateVacancyData) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = {};
      
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.details) updateData.details = data.details as unknown;

      const { error } = await supabase
        .from('vacancies')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;

      // Update local state
      const currentVacancies = get().vacancies;
      const updatedVacancies = currentVacancies.map(vacancy =>
        vacancy.id === data.id 
          ? { 
              ...vacancy, 
              title: data.title || vacancy.title,
              description: data.description || vacancy.description,
              details: data.details || vacancy.details
            }
          : vacancy
      );
      
      set({ vacancies: updatedVacancies, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update vacancy',
        loading: false 
      });
      return false;
    }
  },

  deleteVacancy: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('vacancies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const currentVacancies = get().vacancies;
      const filteredVacancies = currentVacancies.filter(vacancy => vacancy.id !== id);
      
      set({ vacancies: filteredVacancies, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete vacancy',
        loading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
