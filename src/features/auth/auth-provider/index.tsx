'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';
import { useAuthStore } from '@/entities/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AuthContextType {
  // Add auth context methods here if needed in the future
}

const AuthContext = createContext<AuthContextType>({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setSession, setLoading, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Session error:', error);
            logout();
          } else {
            setSession(session as Session | null);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session as Session | null);

        if (event === 'SIGNED_IN') {
          // If user is on auth pages and gets signed in, redirect to home
          if (pathname.startsWith('/auth')) {
            router.replace('/');
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
          // If user is on protected page and gets signed out, redirect to login
          if (!pathname.startsWith('/auth')) {
            router.replace('/auth/login');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading, logout, router, pathname, supabase.auth]);

  // Redirect logic for auth pages
  useEffect(() => {
    if (isAuthenticated && pathname.startsWith('/auth')) {
      router.replace('/');
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
