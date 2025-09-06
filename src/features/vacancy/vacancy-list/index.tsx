import { VacancyWithDetails } from '@/entities/vacancy';
import { VacancyCard } from '../vacancy-card';

interface VacancyListProps {
  vacancies: VacancyWithDetails[];
  loading: boolean;
  onEdit: (vacancy: VacancyWithDetails) => void;
  onDelete: (id: string) => void;
}

export function VacancyList({ vacancies, loading, onEdit, onDelete }: VacancyListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (vacancies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Нет созданных вакансий</p>
        <p className="text-gray-500 text-sm mt-2">Создайте первую вакансию для начала работы</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      {vacancies.map((vacancy) => (
        <VacancyCard
          key={vacancy.id}
          vacancy={vacancy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
