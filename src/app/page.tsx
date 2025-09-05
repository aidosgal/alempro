'use client';

import { useAuthStore } from '@/entities/auth';
import { ProtectedRoute } from '@/features/auth';
import { createClient } from '@/shared/supabase/client';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/auth/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Добро пожаловать в Alem Pro
                </h1>
                {user?.phone && (
                  <p className="text-gray-600 mt-1">
                    Вы вошли как: {user.phone}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Главная панель
            </h2>
            <p className="text-gray-600">
              Добро пожаловать в систему управления вакансиями Alem Pro!
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
