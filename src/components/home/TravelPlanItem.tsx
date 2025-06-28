import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelPlan } from '../../types';
import { Calendar, Shield, MapPin } from 'lucide-react';

interface TravelPlanItemProps {
  plan: TravelPlan;
}

const TravelPlanItem: React.FC<TravelPlanItemProps> = ({ plan }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getColorByScore = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreColor = getColorByScore(plan.safetyScore);

  const handleClick = () => {
    // Navigate to alerts page with destinations tab
    navigate('/alerts?tab=destinations');
  };

  return (
    <div 
      className="card card-hover mb-3 flex items-center overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        <MapPin className="w-8 h-8 text-blue-600" />
      </div>
      <div className="p-3 flex-grow">
        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{plan.destination}</h3>
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