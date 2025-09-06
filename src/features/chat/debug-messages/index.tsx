'use client';

import { useState } from 'react';
import { CreateMessageData, MessageMetadata } from '@/entities/chat';

interface DebugMessageButtonsProps {
  onSendMessage: (data: CreateMessageData) => void;
  chatId: string;
}

export function DebugMessageButtons({ onSendMessage, chatId }: DebugMessageButtonsProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sendTestImage = () => {
    const metadata: MessageMetadata = {
      type: 'image',
      fileName: 'test-image.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg'
    };

    onSendMessage({
      chatId,
      content: 'https://via.placeholder.com/300x200?text=Test+Image',
      metadata
    });
  };

  const sendTestDocument = () => {
    const metadata: MessageMetadata = {
      type: 'document',
      fileName: 'document.pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf'
    };

    onSendMessage({
      chatId,
      content: 'https://example.com/test-document.pdf',
      metadata
    });
  };

  const sendTestOrder = () => {
    const metadata: MessageMetadata = {
      type: 'order',
      services: ['Перевод документов', 'Легализация документов'],
      price: 150,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    onSendMessage({
      chatId,
      content: 'Оформление документов для работы в Германии',
      metadata
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        🐛
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-48">
          <h3 className="text-sm font-medium mb-3">Debug Messages</h3>
          <div className="space-y-2">
            <button
              onClick={sendTestImage}
              className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
            >
              📷 Test Image
            </button>
            <button
              onClick={sendTestDocument}
              className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
            >
              📄 Test Document
            </button>
            <button
              onClick={sendTestOrder}
              className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
            >
              📋 Test Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
