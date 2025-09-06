import { Service } from '@/entities/service';
import { ServiceCard } from '../service-card';

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceList({ services, loading, onEdit, onDelete }: ServiceListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Нет созданных услуг</p>
        <p className="text-gray-500 text-sm mt-2">Создайте первую услугу для начала работы</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
