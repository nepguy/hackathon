import React from 'react';
import { SafetyTip } from '../../types';
import { ChevronRight } from 'lucide-react';

interface SafetyTipCardProps {
  tip: SafetyTip;
}

const SafetyTipCard: React.FC<SafetyTipCardProps> = ({ tip }) => {
  return (
    <div className="card card-interactive mb-4 overflow-hidden group">
      <div className="h-32 w-full overflow-hidden relative">
        <img 
          src={tip.imageUrl} 
          alt={tip.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&auto=format&q=60';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 relative">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{tip.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">{tip.description}</p>
        <button className="flex items-center text-primary-600 text-sm font-medium relative overflow-hidden group-hover:text-blue-700">
          Read more <ChevronRight size={16} className="ml-1" />
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
        </button>
      </div>
    </div>
  );
};

export default SafetyTipCard;

export { SafetyTipCard };