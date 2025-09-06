export interface Chat {
  id: string;
  applicant_id: string;
  organization_id: string;
  created_at: string | null;
  last_message_at: string | null;
  last_message_text: string | null;
  last_sender: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
  sender_applicant_id: string | null;
  sender_organization_manager_id: string | null;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  filename: string;
  filesize: number;
  filetype: string;
  url: string;
  created_at: string | null;
}

export interface MessageOrder {
  id: string;
  message_id: string;
  order_id: string;
  created_at: string | null;
  order?: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    deadline_at: string | null;
    status: string | null;
    order_services?: {
      id: string;
      service: {
        id: string;
        title: string;
        price: number | null;
      };
    }[];
  };
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    name: string;
    type: 'applicant' | 'manager';
  };
  attachments?: MessageAttachment[];
  orders?: MessageOrder[];
}

export interface ChatWithApplicant extends Chat {
  applicant: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    user_id: string | null;
  };
}

export interface MessageMetadata {
  type?: 'text' | 'image' | 'document' | 'order';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  orderId?: string;
  services?: string[];
  price?: number;
  deadline?: string;
  description?: string;
}

export interface CreateMessageData {
  chatId: string;
  content: string;
  metadata?: MessageMetadata;
}

export interface CreateOrderData {
  chatId: string;
  title: string;
  description?: string;
  services: string[];
  price?: number;
  deadline?: string;
}
