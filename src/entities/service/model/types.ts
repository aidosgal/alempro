import { Tables } from '@/shared/types/database';

export type Service = Tables<'services'>;

export interface CreateServiceData {
  title: string;
  description: string | null;
  price: number | null;
  duration_days: number | null;
  duration_min_days: number | null;
  duration_max_days: number | null;
  organization_id: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}
