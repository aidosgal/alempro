'use client';

import { ChatWithApplicant } from '@/entities/chat';
import { useRouter } from 'next/navigation';

interface ChatListProps {
  chats: ChatWithApplicant[];
  currentChatId?: string;
  onChatSelect: (chat: ChatWithApplicant) => void;
}

export function ChatList({ chats, currentChatId, onChatSelect }: ChatListProps) {
  const router = useRouter();

  const handleChatClick = (chat: ChatWithApplicant) => {
    onChatSelect(chat);
    router.push(`/chat/${chat.id}`);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getApplicantName = (applicant: ChatWithApplicant['applicant']) => {
    const name = `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim();
    return name || 'Unnamed User';
  };

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Нет активных чатов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => handleChatClick(chat)}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
            currentChatId === chat.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-medium text-sm">
                  {getApplicantName(chat.applicant).charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-black text-sm truncate">
                    {getApplicantName(chat.applicant)}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTime(chat.last_message_at)}
                  </span>
                </div>
                
                {chat.last_message_text && (
                  <p className="text-sm text-gray-600 truncate">
                    {chat.last_sender === 'manager' ? 'Вы: ' : ''}
                    {chat.last_message_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
