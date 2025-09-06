import { create } from 'zustand';
import { createClient } from '@/shared/supabase/client';
import { Service, CreateServiceData, UpdateServiceData } from './types';

interface ServiceStore {
  services: Service[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchServices: (organizationId: string) => Promise<void>;
  createService: (data: CreateServiceData) => Promise<boolean>;
  updateService: (data: UpdateServiceData) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async (organizationId: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ services: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch services',
        loading: false 
      });
    }
  },

  createService: async (data: CreateServiceData) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('services')
        .insert([{
          title: data.title,
          description: data.description,
          price: data.price,
          duration_days: data.duration_days,
          duration_min_days: data.duration_min_days,
          duration_max_days: data.duration_max_days,
          organization_id: data.organization_id
        }]);

      if (error) throw error;

      // Refresh services list
      await get().fetchServices(data.organization_id);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create service',
        loading: false 
      });
      return false;
    }
  },

  updateService: async (data: UpdateServiceData) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.duration_days !== undefined) updateData.duration_days = data.duration_days;
      if (data.duration_min_days !== undefined) updateData.duration_min_days = data.duration_min_days;
      if (data.duration_max_days !== undefined) updateData.duration_max_days = data.duration_max_days;

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;

      // Update local state
      const currentServices = get().services;
      const updatedServices = currentServices.map(service =>
        service.id === data.id 
          ? { 
              ...service, 
              title: data.title || service.title,
              description: data.description !== undefined ? data.description : service.description,
              price: data.price !== undefined ? data.price : service.price,
              duration_days: data.duration_days !== undefined ? data.duration_days : service.duration_days,
              duration_min_days: data.duration_min_days !== undefined ? data.duration_min_days : service.duration_min_days,
              duration_max_days: data.duration_max_days !== undefined ? data.duration_max_days : service.duration_max_days
            }
          : service
      );
      
      set({ services: updatedServices, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update service',
        loading: false 
      });
      return false;
    }
  },

  deleteService: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const currentServices = get().services;
      const filteredServices = currentServices.filter(service => service.id !== id);
      
      set({ services: filteredServices, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete service',
        loading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
