'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Отладочная информация
    console.log('ProtectedRoute:', { isAuthenticated, isLoading, pathname });
    
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/auth')) {
      console.log('Redirecting to login from:', pathname);
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-gray-500 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !pathname.startsWith('/auth')) {
    return null;
  }

  return <>{children}</>;
};
