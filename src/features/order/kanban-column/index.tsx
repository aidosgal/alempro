import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { OrderStatus, OrderServiceStatus } from '@/entities/order';

interface KanbanColumnProps {
  id: OrderStatus | OrderServiceStatus;
  title: string;
  children: ReactNode;
  count: number;
}

export function KanbanColumn({ id, title, children, count }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const getColumnColor = (id: OrderStatus | OrderServiceStatus) => {
    switch (id) {
      case 'pending_funds':
        return 'border-yellow-200 bg-yellow-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'done':
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'not_started':
        return 'border-gray-200 bg-gray-50';
      case 'on_hold':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-80 border-2 rounded-lg transition-colors ${
        isOver ? 'border-blue-400 bg-blue-100' : getColumnColor(id)
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-black">{title}</h3>
          <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
            {count}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 space-y-3 min-h-96 max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
