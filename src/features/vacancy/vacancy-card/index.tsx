import { useState } from 'react';
import { VacancyWithDetails } from '@/entities/vacancy';

interface VacancyCardProps {
  vacancy: VacancyWithDetails;
  onEdit: (vacancy: VacancyWithDetails) => void;
  onDelete: (id: string) => void;
}

export function VacancyCard({ vacancy, onEdit, onDelete }: VacancyCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatSalary = (salary: any) => {
    if (!salary) return 'Не указана';
    return `${salary.from}-${salary.to} ${salary.currency} / ${salary.period}`;
  };

  const formatLocation = (location: any) => {
    if (!location) return 'Не указано';
    return `${location.city}, ${location.country}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black mb-2">{vacancy.title}</h3>
          {vacancy.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vacancy.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(vacancy)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-black transition-colors"
          >
            Редактировать
          </button>
          <button
            onClick={() => onDelete(vacancy.id)}
            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:border-red-500 hover:text-red-800 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Зарплата:</span>
          <span className="font-medium">{formatSalary(vacancy.details?.salary)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Локация:</span>
          <span className="font-medium">{formatLocation(vacancy.details?.location)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Создано:</span>
          <span className="font-medium">
            {vacancy.created_at ? new Date(vacancy.created_at).toLocaleDateString('ru-RU') : 'Не указано'}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 text-sm text-gray-600 hover:text-black transition-colors"
      >
        {showDetails ? 'Скрыть детали' : 'Показать детали'}
      </button>

      {showDetails && vacancy.details && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {vacancy.details.offers && vacancy.details.offers.length > 0 && (
            <div>
              <h4 className="font-medium text-black mb-2">Предложения:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {vacancy.details.offers.map((offer, index) => (
                  <li key={index}>{offer}</li>
                ))}
              </ul>
            </div>
          )}

          {vacancy.details.requirements && vacancy.details.requirements.length > 0 && (
            <div>
              <h4 className="font-medium text-black mb-2">Требования:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {vacancy.details.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
