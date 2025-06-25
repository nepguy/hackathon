import React from 'react';
import { useUserStatistics } from '../../lib/userStatisticsService';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Shield, Clock } from 'lucide-react';

interface StatisticsCardProps {
  className?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ className = '' }) => {
  const { statistics, loading } = useUserStatistics();
  const { user } = useAuth();

  if (!user || loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getSafetyScoreBorder = (score: number) => {
    if (score >= 90) return 'border-green-200';
    if (score >= 70) return 'border-yellow-200';
    return 'border-red-200';
  };

  const stats = [
    {
      label: 'Travel Plans',
      value: statistics?.travel_plans_count || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Active travel destinations and plans'
    },
    {
      label: 'Safety Score',
      value: `${statistics?.safety_score || 95}%`,
      icon: Shield,
      color: getSafetyScoreColor(statistics?.safety_score || 95),
      bgColor: getSafetyScoreBg(statistics?.safety_score || 95),
      borderColor: getSafetyScoreBorder(statistics?.safety_score || 95),
      description: 'Current safety status for your locations'
    },
    {
      label: 'Days Tracked',
      value: statistics?.days_tracked || 0,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Total days of travel tracking'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`card p-4 flex-1 border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-slate-800">{stat.label}</h3>
            <p className="text-xs text-slate-500">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCard;