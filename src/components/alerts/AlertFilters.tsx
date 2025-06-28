import React from 'react';
import { 
  CloudRain, Shield, Stethoscope, Bus, AlertTriangle, ShieldAlert
} from 'lucide-react';

interface AlertFiltersProps {
  activeFilters: string[];
  onFilterChange: (filter: string) => void;
}

const AlertFilters: React.FC<AlertFiltersProps> = ({ 
  activeFilters, 
  onFilterChange 
}) => {
  const filters = [
    { id: 'scam', label: 'Scams', icon: AlertTriangle },
    { id: 'safety', label: 'Safety', icon: ShieldAlert },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'health', label: 'Health', icon: Stethoscope },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'transportation', label: 'Transport', icon: Bus },
  ];

  return (
    <div className="flex overflow-x-auto space-x-1.5 sm:space-x-2 pb-1 mb-2 sm:mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            activeFilters.includes(filter.id)
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <filter.icon size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default AlertFilters;