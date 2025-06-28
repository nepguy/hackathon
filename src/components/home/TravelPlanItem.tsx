import React from 'react';
import { TravelPlan } from '../../types';
import { Calendar, Shield } from 'lucide-react';

interface TravelPlanItemProps {
  plan: TravelPlan;
}

const TravelPlanItem: React.FC<TravelPlanItemProps> = ({ plan }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getColorByScore = (score: number) => {
    if (score >= 85) return 'text-secondary-600';
    if (score >= 70) return 'text-accent-500';
    return 'text-danger-500';
  };

  const scoreColor = getColorByScore(plan.safetyScore);

  return (
    <div className="card card-hover mb-3 flex items-center overflow-hidden">
      <div className="w-24 h-24 flex-shrink-0">
        <img 
          src={plan.imageUrl} 
          alt={plan.destination} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 flex-grow">
        <h3 className="font-semibold text-gray-900">{plan.destination}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar size={14} className="mr-1" />
          <span>
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </span>
        </div>
        <div className={`flex items-center text-xs font-medium mt-2 ${scoreColor}`}>
          <Shield size={14} className="mr-1" />
          <span>Safety Score: {plan.safetyScore}</span>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanItem;

export { TravelPlanItem };