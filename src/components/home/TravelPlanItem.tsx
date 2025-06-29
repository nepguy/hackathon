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
      className="card card-interactive mb-3 flex items-center overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center overflow-hidden group">
        <MapPin className="w-8 h-8 text-blue-600 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-3 flex-grow group">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{plan.destination}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar size={14} className="mr-1 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-500" />
          <span>
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </span>
        </div>
        <div className={`flex items-center text-xs font-medium mt-2 ${scoreColor} transition-all duration-300 group-hover:translate-x-1`}>
          <Shield size={14} className="mr-1 transition-transform duration-300 group-hover:rotate-12" />
          <span>Safety Score: {plan.safetyScore}</span>
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanItem;

export { TravelPlanItem };