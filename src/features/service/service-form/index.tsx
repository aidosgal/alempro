import { useState, useEffect } from 'react';
import { Service, CreateServiceData, UpdateServiceData } from '@/entities/service';

interface ServiceFormProps {
  service?: Service;
  organizationId: string;
  onSubmit: (data: CreateServiceData | UpdateServiceData) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
}

export function ServiceForm({ service, organizationId, onSubmit, onCancel, loading }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    durationType: 'fixed' as 'fixed' | 'range',
    duration_days: 1,
    duration_min_days: 1,
    duration_max_days: 7
  });

  useEffect(() => {
    if (service) {
      const durationType = service.duration_days ? 'fixed' : 'range';
      setFormData({
        title: service.title || '',
        description: service.description || '',
        price: service.price || 0,
        durationType,
        duration_days: service.duration_days || 1,
        duration_min_days: service.duration_min_days || 1,
        duration_max_days: service.duration_max_days || 7
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = service 
      ? {
          id: service.id,
          title: formData.title,
          description: formData.description || null,
          price: formData.price || null,
          duration_days: formData.durationType === 'fixed' ? formData.duration_days : null,
          duration_min_days: formData.durationType === 'range' ? formData.duration_min_days : null,
          duration_max_days: formData.durationType === 'range' ? formData.duration_max_days : null
        } as UpdateServiceData
      : {
          title: formData.title,
          description: formData.description || null,
          price: formData.price || null,
          duration_days: formData.durationType === 'fixed' ? formData.duration_days : null,
          duration_min_days: formData.durationType === 'range' ? formData.duration_min_days : null,
          duration_max_days: formData.durationType === 'range' ? formData.duration_max_days : null,
          organization_id: organizationId
        } as CreateServiceData;

    const success = await onSubmit(submitData);
    if (success && !service) {
      // Reset form only for create mode
      setFormData({
        title: '',
        description: '',
        price: 0,
        durationType: 'fixed',
        duration_days: 1,
        duration_min_days: 1,
        duration_max_days: 7
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold text-black mb-6">
        {service ? 'Редактировать услугу' : 'Создать новую услугу'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-2">
              Название услуги *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              required
              placeholder="Например: Оформление рабочей визы"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black h-24 resize-none"
              placeholder="Подробное описание услуги"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Цена (€)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Длительность выполнения
          </label>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  checked={formData.durationType === 'fixed'}
                  onChange={(e) => setFormData({ ...formData, durationType: e.target.value as 'fixed' | 'range' })}
                  className="mr-2"
                />
                Фиксированная
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="range"
                  checked={formData.durationType === 'range'}
                  onChange={(e) => setFormData({ ...formData, durationType: e.target.value as 'fixed' | 'range' })}
                  className="mr-2"
                />
                Диапазон
              </label>
            </div>

            {formData.durationType === 'fixed' ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  min="1"
                  placeholder="1"
                />
                <span className="text-gray-600">дней</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">От</span>
                <input
                  type="number"
                  value={formData.duration_min_days}
                  onChange={(e) => setFormData({ ...formData, duration_min_days: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  min="1"
                  placeholder="1"
                />
                <span className="text-gray-600">до</span>
                <input
                  type="number"
                  value={formData.duration_max_days}
                  onChange={(e) => setFormData({ ...formData, duration_max_days: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  min="1"
                  placeholder="7"
                />
                <span className="text-gray-600">дней</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Сохранение...' : (service ? 'Обновить' : 'Создать')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded hover:border-black transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
