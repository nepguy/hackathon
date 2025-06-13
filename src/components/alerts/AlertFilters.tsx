import React from 'react';
import { 
  CloudRain, Shield, Stethoscope, Bus 
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
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'health', label: 'Health', icon: Stethoscope },
    { id: 'transportation', label: 'Transport', icon: Bus },
  ];

  return (
    <div className="flex overflow-x-auto space-x-2 pb-1 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            activeFilters.includes(filter.id)
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <filter.icon size={14} className="mr-1" />
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default AlertFilters;