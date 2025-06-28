import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrial } from '../contexts/TrialContext';
import { useLocation } from '../contexts/LocationContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { PageContainer } from '../components/layout/PageContainer';
import { StatisticsCard } from '../components/home/StatisticsCard';
import WeatherCard from '../components/home/WeatherCard';
import SafetyTipCard from '../components/home/SafetyTipCard';
import TravelPlanItem from '../components/home/TravelPlanItem';
import ActivityItem from '../components/home/ActivityItem';
import EventCard from '../components/home/EventCard';
import QuickActionButtons from '../components/home/QuickActionButtons';
import CreatePlanModal from '../components/home/CreatePlanModal';
import TrialExpiredModal from '../components/trial/TrialExpiredModal';
import TrialBanner from '../components/trial/TrialBanner';
import { 
  MapPin, 
  Calendar, 
  Shield, 
  TrendingUp, 
  Plus, 
  RefreshCw,
  Clock,
  Users,
  Star,
  AlertTriangle
} from 'lucide-react';
import { getUserStatistics } from '../lib/userStatisticsService';
import { getTravelPlans } from '../lib/travelPlansService';
import { getAISafetyInsights } from '../lib/aiSafetyService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTrialActive, isTrialExpired, daysLeft } = useTrial();
  const { currentLocation } = useLocation();
  const { 
    weatherData, 
    safetyAlerts, 
    localEvents, 
    isLoading, 
    refreshData 
  } = useRealTimeData();

  const [userStats, setUserStats] = useState({
    travel_plans_count: 0,
    safety_score: 95,
    days_tracked: 0
  });
  const [travelPlans, setTravelPlans] = useState([]);
  const [aiSafetyInsights, setAiSafetyInsights] = useState([]);
  const [isLoadingAISafety, setIsLoadingAISafety] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);

  useEffect(() => {
    if (isTrialExpired) {
      setShowTrialExpiredModal(true);
    }
  }, [isTrialExpired]);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [stats, plans] = await Promise.all([
        getUserStatistics(user.id),
        getTravelPlans(user.id)
      ]);

      setUserStats(stats || { travel_plans_count: 0, safety_score: 95, days_tracked: 0 });
      setTravelPlans(plans || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAISafetyInsights = async () => {
    if (!user || !currentLocation) return;

    setIsLoadingAISafety(true);
    try {
      const insights = await getAISafetyInsights(
        user.id,
        currentLocation.city || 'Current Location'
      );
      setAiSafetyInsights(insights || []);
    } catch (error) {
      console.error('Error loading AI safety insights:', error);
    } finally {
      setIsLoadingAISafety(false);
    }
  };

  useEffect(() => {
    if (currentLocation && user) {
      loadAISafetyInsights();
    }
  }, [currentLocation, user]);

  const handleRefreshData = async () => {
    await Promise.all([
      refreshData(),
      loadUserData(),
      loadAISafetyInsights()
    ]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler';
  };

  const greeting = getGreeting();

  const stats = [
    {
      icon: MapPin,
      label: 'Travel Plans',
      value: userStats.travel_plans_count,
      description: 'Active destinations',
      trend: '+2 this month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    },
    {
      icon: Shield,
      label: 'Safety Score',
      value: `${userStats.safety_score}%`,
      description: 'Current rating',
      trend: '+5% this week',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500'
    },
    {
      icon: Calendar,
      label: 'Days Tracked',
      value: userStats.days_tracked,
      description: 'Total monitoring',
      trend: 'Since joining',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500'
    }
  ];

  const recentActivities = [
    {
      icon: Shield,
      title: 'Safety alert reviewed',
      description: 'Weather warning for Tokyo',
      time: '2 hours ago',
      type: 'safety'
    },
    {
      icon: MapPin,
      title: 'New destination added',
      description: 'Paris, France',
      time: '1 day ago',
      type: 'destination'
    },
    {
      icon: Star,
      title: 'Travel story shared',
      description: 'Amazing experience in Bali',
      time: '3 days ago',
      type: 'story'
    }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
            {`${greeting}, ${getUserName()}`}
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's your personalized travel dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={handleRefreshData}
            className="btn btn-ghost p-2"
          >
            <RefreshCw className={`w-5 h-5 ${(isLoading || isLoadingAISafety) ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/add-destination')}
            className="btn btn-primary hidden sm:flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Stats and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trial Banner */}
          {isTrialActive && (
            <TrialBanner daysLeft={daysLeft} />
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`card p-4 border-l-4 ${stat.borderColor}`}
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
                  <h3 className="text-sm font-semibold text-slate-800">{stat.label}</h3>
                  <p className="text-xs text-slate-500">{stat.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <QuickActionButtons onCreatePlan={() => setShowCreatePlanModal(true)} />

          {/* Travel Plans */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Your Travel Plans</h2>
              <button 
                onClick={() => setShowCreatePlanModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plan
              </button>
            </div>
            <div className="space-y-3">
              {travelPlans.length > 0 ? (
                travelPlans.slice(0, 3).map((plan) => (
                  <TravelPlanItem key={plan.id} plan={plan} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No travel plans yet</p>
                  <p className="text-sm">Create your first plan to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Weather, Safety, Events */}
        <div className="space-y-6">
          {/* Weather Card */}
          {weatherData && (
            <WeatherCard 
              weather={weatherData} 
              location={currentLocation?.city || 'Current Location'} 
            />
          )}

          {/* Safety Tips */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              AI Safety Insights
            </h2>
            {isLoadingAISafety ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : aiSafetyInsights.length > 0 ? (
              <div className="space-y-3">
                {aiSafetyInsights.slice(0, 3).map((tip, index) => (
                  <SafetyTipCard key={index} tip={tip} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No safety insights available</p>
              </div>
            )}
          </div>

          {/* Safety Alerts */}
          {safetyAlerts && safetyAlerts.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Safety Alerts
              </h2>
              <div className="space-y-3">
                {safetyAlerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-medium text-orange-900">{alert.title}</h3>
                    <p className="text-sm text-orange-700 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Events */}
          {localEvents && localEvents.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Local Events
              </h2>
              <div className="space-y-3">
                {localEvents.slice(0, 2).map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onPlanCreated={loadUserData}
      />

      <TrialExpiredModal
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
      />
    </PageContainer>
  );
};

export default HomePage;