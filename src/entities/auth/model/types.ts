import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  phone?: string;
}

export interface AuthSession extends Session {
  user: User;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface OTPStep {
  phone: string;
  step: 'phone' | 'otp';
}
