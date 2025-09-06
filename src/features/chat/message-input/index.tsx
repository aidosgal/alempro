'use client';

import { useState, useRef } from 'react';
import { CreateMessageData } from '@/entities/chat';

interface MessageInputProps {
  onSendMessage: (data: CreateMessageData) => void;
  onCreateOrder: () => void;
  chatId: string;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onCreateOrder, chatId, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage({
        chatId,
        content: message.trim(),
        metadata: { type: 'text' }
      });
      setMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Import Supabase client
      const { createClient } = await import('@/shared/supabase/client');
      const supabase = createClient();
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Create the message first
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content: file.type.startsWith('image/') ? 'Изображение' : 'Документ',
          sender_applicant_id: userData.user.id,
          metadata: { type: 'attachment' }
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create the attachment record
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageData.id,
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          url: publicUrl
        });

      if (attachmentError) throw attachmentError;

      // Update chat's last message
      await supabase
        .from('chats')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_text: file.type.startsWith('image/') ? '📷 Изображение' : '📄 Документ',
          last_sender: 'applicant'
        })
        .eq('id', chatId);

    } catch (error) {
      console.error('File upload error:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Прикрепить файл"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          
          {/* Create order button */}
          <button
            type="button"
            onClick={onCreateOrder}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Создать заказ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
        
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Написать сообщение..."
            disabled={disabled}
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
