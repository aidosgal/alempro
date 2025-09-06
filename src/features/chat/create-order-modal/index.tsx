'use client';

import { useState, useEffect } from 'react';
import { CreateOrderData } from '@/entities/chat';
import { useServiceStore } from '@/entities/service';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (data: CreateOrderData) => void;
  chatId: string;
  organizationId: string;
}

export function CreateOrderModal({ 
  isOpen, 
  onClose, 
  onCreateOrder, 
  chatId, 
  organizationId 
}: CreateOrderModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    services: [] as string[],
    price: '',
    deadline: ''
  });

  const { services, fetchServices } = useServiceStore();

  useEffect(() => {
    if (isOpen && organizationId) {
      fetchServices(organizationId);
    }
  }, [isOpen, organizationId, fetchServices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: CreateOrderData = {
      chatId,
      title: formData.title,
      description: formData.description || undefined,
      services: formData.services,
      price: formData.price ? parseFloat(formData.price) : undefined,
      deadline: formData.deadline || undefined
    };

    onCreateOrder(orderData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      services: [],
      price: '',
      deadline: ''
    });
    onClose();
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const calculateTotalPrice = () => {
    return formData.services.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Создать заказ</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название заказа *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Введите название заказа"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              rows={3}
              placeholder="Описание заказа (необязательно)"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Услуги *
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {services.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Нет доступных услуг
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {service.title}
                          </span>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {service.price && (
                        <span className="text-sm font-medium text-gray-900">
                          €{service.price.toLocaleString()}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.services.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Выберите хотя бы одну услугу</p>
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Цена (€)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
              {formData.services.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Рекомендуемая цена: €{calculateTotalPrice().toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Срок выполнения
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || formData.services.length === 0}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Создать заказ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
