import { OrderWithDetails, OrderStatus } from '@/entities/order';
import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: OrderWithDetails;
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: order.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleChatClick = () => {
    if (order.chat_id) {
      router.push(`/chat/${order.chat_id}`);
    }
  };

  const getStatusColor = (status: OrderStatus | null) => {
    switch (status) {
      case 'pending_funds':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus | null) => {
    switch (status) {
      case 'pending_funds':
        return 'Ожидает оплаты';
      case 'in_progress':
        return 'В работе';
      case 'done':
        return 'Выполнено';
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
        <h3 className="font-semibold text-black text-sm line-clamp-2">{order.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Description */}
      {order.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{order.description}</p>
      )}

      {/* Applicant Info */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Соискатель:</span>
          {order.chat_id && (
            <button
              onClick={handleChatClick}
              className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              Написать
            </button>
          )}
        </div>
        <p className="text-xs text-black font-medium">
          {order.applicant.first_name} {order.applicant.last_name}
        </p>
      </div>

      {/* Services */}
      {order.order_services.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Услуги ({order.order_services.length}):</p>
          <div className="space-y-1">
            {order.order_services.slice(0, 2).map((service) => (
              <div key={service.id} className="text-xs text-gray-600 truncate">
                • {service.service.title}
              </div>
            ))}
            {order.order_services.length > 2 && (
              <div className="text-xs text-gray-500">
                +{order.order_services.length - 2} еще
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>
          {order.price ? `€${order.price.toLocaleString()}` : 'Цена не указана'}
        </span>
        <span>
          {order.deadline_at ? new Date(order.deadline_at).toLocaleDateString('ru-RU') : 'Дедлайн не указан'}
        </span>
      </div>
    </div>
  );
}
