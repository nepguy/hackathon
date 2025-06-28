import React from 'react';
import { Destination } from '../../types';
import { Shield, MapPin } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const getSafetyColor = (score: number) => {
    if (score >= 85) return 'text-secondary-600 bg-secondary-100';
    if (score >= 70) return 'text-accent-600 bg-accent-100';
    return 'text-danger-600 bg-danger-100';
  };

  const safetyColor = getSafetyColor(destination.safetyScore);

  return (
    <div className="card card-hover overflow-hidden mb-4">
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img 
          src={destination.imageUrl} 
          alt={destination.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
        <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs font-medium flex items-center ${safetyColor}`}>
          <Shield size={12} className="mr-1" />
          <span>{destination.safetyScore}</span>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{destination.name}</h3>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1 mb-1 sm:mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{destination.country}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">{destination.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {destination.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;