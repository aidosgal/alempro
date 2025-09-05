'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';
import AuthLayout from '@/widgets/layout/AuthLayout';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        });

        if (error) {
          console.error('Error confirming auth:', error);
        } else {
          router.push('/');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router, supabase.auth]);

  return (
    <AuthLayout>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-black mb-2">Подтверждение входа</h1>
          <p className="text-gray-500 text-sm">Пожалуйста, подождите...</p>
        </div>
      </div>
    </AuthLayout>
  );
}