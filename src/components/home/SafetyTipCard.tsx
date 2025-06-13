import React from 'react';
import { SafetyTip } from '../../types';
import { ChevronRight } from 'lucide-react';

interface SafetyTipCardProps {
  tip: SafetyTip;
}

const SafetyTipCard: React.FC<SafetyTipCardProps> = ({ tip }) => {
  return (
    <div className="card card-hover mb-4 overflow-hidden">
      <div className="h-32 w-full overflow-hidden">
        <img 
          src={tip.imageUrl} 
          alt={tip.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tip.description}</p>
        <button className="flex items-center text-primary-600 text-sm font-medium">
          Read more <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default SafetyTipCard;