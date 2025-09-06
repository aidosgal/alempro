import { Tables } from '@/shared/types/database';

export interface VacancyDetails {
  offers: string[];
  salary: {
    to: number;
    from: number;
    period: string;
    currency: string;
  };
  location: {
    city: string;
    country: string;
  };
  requirements: string[];
}

export type Vacancy = Tables<'vacancies'>;

export interface VacancyWithDetails extends Omit<Vacancy, 'details'> {
  details: VacancyDetails;
}

export interface CreateVacancyData {
  title: string;
  description: string;
  details: VacancyDetails;
  organization_id: string;
}

export interface UpdateVacancyData extends Partial<CreateVacancyData> {
  id: string;
}
