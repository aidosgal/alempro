'use client';

import { useEffect, useRef } from 'react';
import { MessageWithSender } from '@/entities/chat';

interface MessageListProps {
  messages: MessageWithSender[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const renderMessageContent = (message: MessageWithSender) => {
    const metadata = message.metadata as { 
      type?: string; 
      fileName?: string; 
      fileSize?: number; 
      [key: string]: unknown; 
    } | null;
    
    // Handle order messages using the orders array
    if (message.orders && message.orders.length > 0) {
      const order = message.orders[0]; // Take the first order
      return (
        <div className="bg-white text-black bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
              </svg>
            </div>
            <span className="text-sm font-medium">📋 Новый заказ</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{order.order?.title || message.content}</p>
            {order.order?.description && (
              <p className="text-xs opacity-80">{order.order.description}</p>
            )}
            {order.order?.order_services && order.order.order_services.length > 0 && (
              <div>
                <p className="text-xs opacity-70 mb-1">Услуги:</p>
                <div className="flex flex-wrap gap-1">
                  {order.order.order_services.map((orderService: { 
                    id: string; 
                    service: { id: string; title: string; price: number | null } 
                  }) => (
                    <span 
                      key={orderService.id} 
                      className="inline-block bg-white bg-opacity-20 px-2 py-1 rounded text-xs"
                    >
                      {orderService.service?.title || 'Услуга'}
                      {orderService.service?.price && ` - €${orderService.service.price}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {order.order?.price && (
              <p className="text-xs opacity-80">💰 €{order.order.price}</p>
            )}
            {order.order?.deadline_at && (
              <p className="text-xs opacity-80">
                📅 {new Date(order.order.deadline_at).toLocaleDateString('ru-RU')}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${
                order.order?.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                order.order?.status === 'accepted' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                order.order?.status === 'rejected' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                'bg-gray-500 bg-opacity-20 text-gray-300'
              }`}>
                {order.order?.status === 'pending' ? 'В ожидании' :
                 order.order?.status === 'accepted' ? 'Принят' :
                 order.order?.status === 'rejected' ? 'Отклонен' :
                 order.order?.status || 'Неизвестно'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Handle attachment messages
    if (message.attachments && message.attachments.length > 0) {
      return (
        <div className="space-y-2">
          {message.attachments.map((attachment: { 
            id: string; 
            filename?: string; 
            filetype?: string; 
            url: string; 
            filesize?: number; 
          }) => {
            const isImage = attachment.filetype?.startsWith('image/');
            
            if (isImage) {
              return (
                <div key={attachment.id} className="relative">
                  <img 
                    src={attachment.url} 
                    alt={attachment.filename || 'Shared image'} 
                    width={400}
                    height={300}
                    className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                  {attachment.filename && (
                    <p className="text-xs opacity-70 mt-1">{attachment.filename}</p>
                  )}
                </div>
              );
            } else {
              return (
                <div key={attachment.id} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 max-w-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.filename || 'Document'}
                      </p>
                      {attachment.filesize && (
                        <p className="text-xs opacity-70">
                          {(attachment.filesize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm opacity-80 hover:opacity-100 underline"
                  >
                    Скачать файл
                  </a>
                </div>
              );
            }
          })}
        </div>
      );
    }
    
    // Handle legacy image messages (for backward compatibility)
    if (metadata?.type === 'image') {
      return (
        <div className="space-y-2">
          <div className="relative">
            <img 
              src={message.content} 
              alt="Shared image" 
              width={400}
              height={300}
              className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png';
              }}
              onClick={() => window.open(message.content, '_blank')}
            />
          </div>
          {metadata.fileName && typeof metadata.fileName === 'string' && (
            <p className="text-xs opacity-70">{metadata.fileName}</p>
          )}
        </div>
      );
    }
    
    // Handle legacy document messages (for backward compatibility)
    if (metadata?.type === 'document') {
      return (
        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {(typeof metadata.fileName === 'string' ? metadata.fileName : null) || 'Document'}
              </p>
              {metadata.fileSize && typeof metadata.fileSize === 'number' && (
                <p className="text-xs opacity-70">
                  {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
          <a 
            href={message.content} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm opacity-80 hover:opacity-100 underline"
          >
            Скачать файл
          </a>
        </div>
      );
    }
    
    // Default text message
    return (
      <div className="text-sm whitespace-pre-wrap break-words">
        {message.content}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Начните разговор</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.created_at ? new Date(message.created_at).toDateString() : 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, MessageWithSender[]>);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex-1"></div> {/* Spacer to push messages to bottom */}
      <div className="p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-xs text-gray-600">
                  {formatDate(dayMessages[0].created_at)}
                </span>
              </div>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-3">
              {dayMessages.map((message) => {
                const isManager = message.sender.type === 'manager';
                const metadata = message.metadata as { type?: string; [key: string]: unknown } | null;
                const hasOrder = message.orders && message.orders.length > 0;
                const hasAttachment = message.attachments && message.attachments.length > 0;
                const isLegacySpecialContent = metadata?.type && ['image', 'document', 'order'].includes(metadata.type);
                const isSpecialContent = hasOrder || hasAttachment || isLegacySpecialContent;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      isManager 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg ${isSpecialContent ? 'p-2' : 'px-4 py-2'}`}>
                      {/* Sender name for applicant messages */}
                      {!isManager && (
                        <p className={`text-xs mb-1 font-medium ${isSpecialContent ? 'px-2' : ''} ${
                          isManager ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {message.sender.name}
                        </p>
                      )}
                      
                      {/* Message content */}
                      <div className={`${isSpecialContent ? 'p-2' : ''}`}>
                        {renderMessageContent(message)}
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs mt-1 ${isSpecialContent ? 'px-2' : ''} ${
                        isManager 
                          ? 'text-gray-300' 
                          : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
