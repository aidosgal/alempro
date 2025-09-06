import { useState, useEffect } from 'react';
import { VacancyWithDetails, VacancyDetails, CreateVacancyData, UpdateVacancyData } from '@/entities/vacancy';

interface VacancyFormProps {
  vacancy?: VacancyWithDetails;
  organizationId: string;
  onSubmit: (data: CreateVacancyData | UpdateVacancyData) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
}

export function VacancyForm({ vacancy, organizationId, onSubmit, onCancel, loading }: VacancyFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offers: [''],
    requirements: [''],
    salary: {
      from: 1000,
      to: 2000,
      period: 'месяц',
      currency: '€'
    },
    location: {
      city: '',
      country: ''
    }
  });

  useEffect(() => {
    if (vacancy) {
      setFormData({
        title: vacancy.title || '',
        description: vacancy.description || '',
        offers: vacancy.details?.offers || [''],
        requirements: vacancy.details?.requirements || [''],
        salary: vacancy.details?.salary || {
          from: 1000,
          to: 2000,
          period: 'месяц',
          currency: '€'
        },
        location: vacancy.details?.location || {
          city: '',
          country: ''
        }
      });
    }
  }, [vacancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const details: VacancyDetails = {
      offers: formData.offers.filter(offer => offer.trim() !== ''),
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      salary: formData.salary,
      location: formData.location
    };

    const submitData = vacancy 
      ? {
          id: vacancy.id,
          title: formData.title,
          description: formData.description,
          details
        } as UpdateVacancyData
      : {
          title: formData.title,
          description: formData.description,
          details,
          organization_id: organizationId
        } as CreateVacancyData;

    const success = await onSubmit(submitData);
    if (success) {
      // Reset form only for create mode
      if (!vacancy) {
        setFormData({
          title: '',
          description: '',
          offers: [''],
          requirements: [''],
          salary: {
            from: 1000,
            to: 2000,
            period: 'месяц',
            currency: '€'
          },
          location: {
            city: '',
            country: ''
          }
        });
      }
    }
  };

  const updateOffers = (index: number, value: string) => {
    const newOffers = [...formData.offers];
    newOffers[index] = value;
    setFormData({ ...formData, offers: newOffers });
  };

  const addOffer = () => {
    setFormData({ ...formData, offers: [...formData.offers, ''] });
  };

  const removeOffer = (index: number) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({ ...formData, offers: newOffers.length > 0 ? newOffers : [''] });
  };

  const updateRequirements = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements.length > 0 ? newRequirements : [''] });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold text-black mb-6">
        {vacancy ? 'Редактировать вакансию' : 'Создать новую вакансию'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Название вакансии *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              required
              placeholder="Например: Сварщик"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black h-20 resize-none"
              placeholder="Краткое описание вакансии"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Город *
            </label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location, city: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              required
              placeholder="Варшава"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Страна *
            </label>
            <input
              type="text"
              value={formData.location.country}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location, country: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              required
              placeholder="Польша"
            />
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Зарплата
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <input
                type="number"
                value={formData.salary.from}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  salary: { ...formData.salary, from: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                placeholder="От"
              />
            </div>
            <div>
              <input
                type="number"
                value={formData.salary.to}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  salary: { ...formData.salary, to: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                placeholder="До"
              />
            </div>
            <div>
              <select
                value={formData.salary.currency}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  salary: { ...formData.salary, currency: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              >
                <option value="€">€</option>
                <option value="$">$</option>
                <option value="₸">₸</option>
              </select>
            </div>
            <div>
              <select
                value={formData.salary.period}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  salary: { ...formData.salary, period: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              >
                <option value="час">час</option>
                <option value="день">день</option>
                <option value="месяц">месяц</option>
                <option value="год">год</option>
              </select>
            </div>
          </div>
        </div>

        {/* Offers */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Предложения
          </label>
          <div className="space-y-2">
            {formData.offers.map((offer, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={offer}
                  onChange={(e) => updateOffers(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="Например: Официальное трудоустройство"
                />
                {formData.offers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOffer(index)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:border-red-500 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOffer}
              className="text-sm text-gray-600 hover:text-black"
            >
              + Добавить предложение
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Требования
          </label>
          <div className="space-y-2">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirements(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="Например: Опыт работы от 1 года"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:border-red-500 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="text-sm text-gray-600 hover:text-black"
            >
              + Добавить требование
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Сохранение...' : (vacancy ? 'Обновить' : 'Создать')}
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
