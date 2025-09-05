import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, AuthSession } from './types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),
      
      setSession: (session) => 
        set({ 
          session, 
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          isLoading: false 
        }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => 
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false,
          isLoading: false 
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
