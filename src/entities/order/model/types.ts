import { Tables, Database } from '@/shared/types/database';

export type Order = Tables<'orders'>;
export type OrderService = Tables<'order_services'>;
export type Applicant = Tables<'applicants'>;
export type Chat = Tables<'chats'>;

// Order statuses based on database enum
export type OrderStatus = Database['public']['Enums']['order_status'];

// Order service statuses (custom enum for order services)
export type OrderServiceStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

export interface ApplicantWithAuth {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  user_id: string | null;
  phone: string | null;
  email: string | null;
}

export interface OrderWithDetails {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  created_at: string | null;
  deadline_at: string;
  applicant_id: string;
  organization_id: string;
  status: OrderStatus | null;
  applicant: ApplicantWithAuth;
  order_services: Array<{
    id: string;
    service: {
      id: string;
      title: string;
      price: number | null;
    };
    status: OrderServiceStatus;
  }>;
  chat_id: string | null;
}

export interface KanbanColumn {
  id: OrderStatus | OrderServiceStatus;
  title: string;
  orders?: OrderWithDetails[];
  services?: Array<{
    id: string;
    order: OrderWithDetails;
    service: {
      id: string;
      title: string;
      price: number | null;
    };
    status: OrderServiceStatus;
  }>;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderServiceStatusData {
  orderServiceId: string;
  status: OrderServiceStatus;
}
