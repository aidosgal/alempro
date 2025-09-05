'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';
import { OTPStep } from '@/entities/auth';

export const OTPLoginForm = () => {
  const [step, setStep] = useState<OTPStep>({ phone: '', step: 'phone' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    let formatted = cleaned;
    if (!formatted.startsWith('7') && formatted.length > 0) {
      formatted = '7' + formatted;
    }
    if (!formatted.startsWith('+7')) {
      formatted = '+7' + formatted.slice(1);
    }
    
    return formatted;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(step.phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        setError(error.message);
      } else {
        setStep({ phone: formattedPhone, step: 'otp' });
      }
    } catch {
      setError('Произошла ошибка при отправке SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: step.phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } catch {
      setError('Произошла ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: step.phone,
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError('Произошла ошибка при повторной отправке SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep({ phone: '', step: 'phone' });
    setOtp('');
    setError('');
  };

  if (step.step === 'otp') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-black mb-2">
            Подтверждение номера
          </h1>
          <p className="text-gray-500 text-sm">
            Мы отправили код на номер {step.phone}
          </p>
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full border-0 border-b-2 border-gray-200 bg-transparent p-4 text-center text-2xl tracking-[0.5em] focus:border-black focus:outline-none transition-colors"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? 'Проверка...' : 'Подтвердить'}
          </button>

          <div className="flex justify-between text-sm pt-4">
            <button
              type="button"
              onClick={handleBackToPhone}
              className="text-gray-500 hover:text-black transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Изменить номер
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-gray-500 hover:text-black disabled:opacity-50 transition-colors"
            >
              Отправить повторно
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-black mb-2">
          Добро пожаловать в Alem Pro
        </h1>
        <p className="text-gray-500 text-sm">
          Введите номер телефона для входа
        </p>
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-6">
        <div>
          <input
            id="phone"
            type="tel"
            value={step.phone}
            onChange={(e) => setStep({ ...step, phone: e.target.value })}
            placeholder="+7 (___) ___-__-__"
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent p-4 text-lg focus:border-black focus:outline-none transition-colors placeholder-gray-400"
            required
            autoComplete="tel"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading || !step.phone.trim()}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          {isLoading ? 'Отправка...' : 'Получить код'}
        </button>
      </form>
    </div>
  );
};
