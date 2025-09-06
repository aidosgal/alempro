import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors 
} from '@dnd-kit/core';
import { useState } from 'react';
import { OrderWithDetails, OrderStatus, OrderServiceStatus } from '@/entities/order';
import { OrderCard } from '../order-card';
import { ServiceCard } from '../service-card';
import { KanbanColumn } from '../kanban-column';

interface OrderKanbanProps {
  orders: OrderWithDetails[];
  viewMode: 'orders' | 'services';
  onOrderStatusChange?: (orderId: string, status: OrderStatus) => void;
  onServiceStatusChange?: (orderServiceId: string, status: OrderServiceStatus) => void;
}

export function OrderKanban({ 
  orders, 
  viewMode,
  onOrderStatusChange,
  onServiceStatusChange
}: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (viewMode === 'orders') {
      // Handle order status change
      if (onOrderStatusChange && overId !== activeId) {
        const newStatus = overId as OrderStatus;
        onOrderStatusChange(activeId, newStatus);
      }
    } else {
      // Handle service status change  
      if (onServiceStatusChange && overId !== activeId) {
        const newStatus = overId as OrderServiceStatus;
        onServiceStatusChange(activeId, newStatus);
      }
    }
    
    setActiveId(null);
  };
  
  if (viewMode === 'orders') {
    // Regular kanban with orders
    const orderColumns: { id: OrderStatus; title: string }[] = [
      { id: 'pending_funds', title: 'Ожидает оплаты' },
      { id: 'in_progress', title: 'В работе' },
      { id: 'done', title: 'Выполнено' }
    ];

    const getOrdersByStatus = (status: OrderStatus) => {
      return orders.filter(order => order.status === status);
    };

    const activeOrder = activeId ? orders.find(order => order.id === activeId) : null;

    return (
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {orderColumns.map((column) => {
            const columnOrders = getOrdersByStatus(column.id);
            
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={columnOrders.length}
              >
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        
        <DragOverlay>
          {activeOrder && <OrderCard order={activeOrder} />}
        </DragOverlay>
      </DndContext>
    );
  } else {
    // Detailed kanban with services
    const serviceColumns: { id: OrderServiceStatus; title: string }[] = [
      { id: 'not_started', title: 'Не начато' },
      { id: 'in_progress', title: 'В работе' },
      { id: 'on_hold', title: 'Приостановлено' },
      { id: 'completed', title: 'Выполнено' }
    ];

    // Flatten all services from all orders
    const allServices = orders.flatMap(order => 
      order.order_services.map(service => ({
        id: service.id,
        order: {
          id: order.id,
          title: order.title,
          applicant: order.applicant,
          chat_id: order.chat_id,
        },
        service: service.service,
        status: service.status,
      }))
    );

    const getServicesByStatus = (status: OrderServiceStatus) => {
      return allServices.filter(service => service.status === status);
    };

    const activeService = activeId ? allServices.find(service => service.id === activeId) : null;

    return (
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {serviceColumns.map((column) => {
            const columnServices = getServicesByStatus(column.id);
            
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={columnServices.length}
              >
                {columnServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        
        <DragOverlay>
          {activeService && <ServiceCard service={activeService} />}
        </DragOverlay>
      </DndContext>
    );
  }
}
