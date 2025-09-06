import { OrderServiceStatus } from '@/entities/order';
import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';

interface ServiceCardProps {
  service: {
    id: string;
    order: {
      id: string;
      title: string;
      applicant: {
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        email: string | null;
      };
      chat_id: string | null;
    };
    service: {
      id: string;
      title: string;
      price: number | null;
    };
    status: OrderServiceStatus;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: service.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleChatClick = () => {
    if (service.order.chat_id) {
      router.push(`/chat?chatId=${service.order.chat_id}`);
    }
  };

  const getStatusColor = (status: OrderServiceStatus) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderServiceStatus) => {
    switch (status) {
      case 'not_started':
        return 'Не начато';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнено';
      case 'on_hold':
        return 'Приостановлено';
      default:
        return 'Не указан';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-black text-sm line-clamp-2">{service.service.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(service.status)}`}>
          {getStatusText(service.status)}
        </span>
      </div>

      {/* Order Info */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <p className="text-xs font-medium text-gray-700 mb-1">Заказ:</p>
        <p className="text-xs text-black font-medium line-clamp-1">{service.order.title}</p>
      </div>

      {/* Applicant Info */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Соискатель:</span>
          {service.order.chat_id && (
            <button
              onClick={handleChatClick}
              className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              Написать
            </button>
          )}
        </div>
        <p className="text-xs text-black font-medium">
          {service.order.applicant.first_name} {service.order.applicant.last_name}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>
          {service.service.price ? `€${service.service.price.toLocaleString()}` : 'Цена не указана'}
        </span>
      </div>
    </div>
  );
}
