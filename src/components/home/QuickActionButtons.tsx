import React from 'react';
import { MapPin, Phone, Shield, Umbrella } from 'lucide-react';

const QuickActionButtons: React.FC = () => {
  const actions = [
    {
      label: 'Nearby',
      icon: <MapPin size={20} />,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Emergency',
      icon: <Phone size={20} />,
      color: 'bg-danger-100 text-danger-600',
    },
    {
      label: 'Safety',
      icon: <Shield size={20} />,
      color: 'bg-secondary-100 text-secondary-600',
    },
    {
      label: 'Insurance',
      icon: <Umbrella size={20} />,
      color: 'bg-accent-100 text-accent-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {actions.map((action, index) => (
        <button
          key={index}
          className="flex flex-col items-center justify-center py-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg group"
        >
          <div className={`p-3 rounded-full mb-2 ${action.color} transition-all duration-300 group-hover:shadow-md`}>
            <div className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              {action.icon}
            </div>
            <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-300"></div>
          </div>
          <span className="text-xs font-medium text-gray-700 transition-all duration-300 group-hover:text-blue-600">{action.label}</span>
          <div className="w-0 h-0.5 bg-blue-500/0 group-hover:bg-blue-500/100 group-hover:w-full transition-all duration-500"></div>
        </button>
      ))}
    </div>
  );
};

export default QuickActionButtons;

export { QuickActionButtons };