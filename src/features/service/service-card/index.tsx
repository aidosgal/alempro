import { Service } from '@/entities/service';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Цена не указана';
    return `${price.toLocaleString()} ₸`;
  };

  const formatDuration = (service: Service) => {
    if (service.duration_days) {
      return `${service.duration_days} дн.`;
    }
    if (service.duration_min_days && service.duration_max_days) {
      return `${service.duration_min_days}-${service.duration_max_days} дн.`;
    }
    if (service.duration_min_days) {
      return `от ${service.duration_min_days} дн.`;
    }
    if (service.duration_max_days) {
      return `до ${service.duration_max_days} дн.`;
    }
    return 'Длительность не указана';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black mb-2">{service.title}</h3>
          {service.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(service)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-black transition-colors"
          >
            Редактировать
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:border-red-500 hover:text-red-800 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Цена:</span>
          <span className="font-medium">{formatPrice(service.price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Длительность:</span>
          <span className="font-medium">{formatDuration(service)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Создано:</span>
          <span className="font-medium">
            {service.created_at ? new Date(service.created_at).toLocaleDateString('ru-RU') : 'Не указано'}
          </span>
        </div>
      </div>
    </div>
  );
}
