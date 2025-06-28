import React, { useState } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: {
    destination: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Travel Plan</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Where are you going?"
                    className="pl-10 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 py-2.5"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="pl-10 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 py-2.5"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="pl-10 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 py-2.5"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about your trip..."
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 py-2.5 px-3 h-24"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              >
                Create Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;
export { CreatePlanModal };