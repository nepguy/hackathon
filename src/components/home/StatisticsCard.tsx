import React, { useState, useEffect } from 'react';
import { useUserStatistics } from '../../lib/userStatisticsService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { locationSafetyService } from '../../lib/locationSafetyService';
import { Calendar, Shield, Clock, MapPin } from 'lucide-react';

interface StatisticsCardProps {
  className?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ className = '' }) => {
  const { statistics, loading } = useUserStatistics();
  const { user } = useAuth();
  const { userLocation } = useLocation();
  const [locationSafetyScore, setLocationSafetyScore] = useState<{
    score: number;
    riskLevel: string;
    location: string;
  } | null>(null);
  const [loadingSafety, setLoadingSafety] = useState(false);

  // Function to get location info from coordinates
  const getLocationInfo = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return {
        city: data.city || data.locality || undefined,
        country: data.countryName || 'Unknown'
      };
    } catch (error) {
      console.warn('Could not determine location info:', error);
      return { country: 'Unknown' };
    }
  };

  // Fetch location-based safety score
  useEffect(() => {
    if (user && userLocation) {
      const fetchSafetyScore = async () => {
        setLoadingSafety(true);
        try {
          const info = await getLocationInfo(userLocation.latitude, userLocation.longitude);
          
          // Update user location in safety service
          await locationSafetyService.updateUserLocation(user.id, {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
            city: info.city,
            country: info.country || 'Unknown'
          });

          // Get safety score
          const safetyScore = await locationSafetyService.getUserLocationSafetyScore(user.id);
          setLocationSafetyScore(safetyScore);
        } catch (error) {
          console.error('Error fetching location safety score:', error);
        } finally {
          setLoadingSafety(false);
        }
      };

      fetchSafetyScore();
    }
  }, [user, userLocation]);

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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSafetyScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getSafetyScoreBorder = (score: number) => {
    if (score >= 80) return 'border-green-200';
    if (score >= 60) return 'border-yellow-200';
    if (score >= 40) return 'border-orange-200';
    return 'border-red-200';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentSafetyScore = locationSafetyScore?.score || 75;
  const currentRiskLevel = locationSafetyScore?.riskLevel || 'medium';
  const currentLocation = locationSafetyScore?.location || 'Unknown Location';

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
      label: 'Location Safety',
      value: loadingSafety ? '...' : `${currentSafetyScore}/100`,
      icon: Shield,
      color: getSafetyScoreColor(currentSafetyScore),
      bgColor: getSafetyScoreBg(currentSafetyScore),
      borderColor: getSafetyScoreBorder(currentSafetyScore),
      description: loadingSafety ? 'Loading safety data...' : `${currentRiskLevel.toUpperCase()} risk - ${currentLocation}`,
      subtitle: locationSafetyScore ? (
        <div className="flex items-center space-x-1 mt-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className={`text-xs font-medium ${getRiskLevelColor(currentRiskLevel)}`}>
            {currentRiskLevel.toUpperCase()} RISK
          </span>
        </div>
      ) : null
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
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`card p-3 sm:p-4 flex-1 border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
          <div>
            <h3 className="text-sm sm:text-md font-semibold text-slate-800">{stat.label}</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{stat.description}</p>
            {stat.subtitle && stat.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCard;

export { StatisticsCard };