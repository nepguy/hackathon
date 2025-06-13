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
          className="flex flex-col items-center justify-center py-3 rounded-lg transition-transform hover:scale-105"
        >
          <div className={`p-3 rounded-full mb-2 ${action.color}`}>
            {action.icon}
          </div>
          <span className="text-xs font-medium text-gray-700">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionButtons;