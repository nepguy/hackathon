import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTrial } from '../contexts/TrialContext';
import { useLocation } from '../contexts/LocationContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { PageContainer } from '../components/layout/PageContainer';
import { WeatherCard } from '../components/home/WeatherCard';
import { SafetyTipCard } from '../components/home/SafetyTipCard';
import { TravelPlanItem } from '../components/home/TravelPlanItem';
import { ActivityItem } from '../components/home/ActivityItem';
import { EventCard, Event } from '../components/home/EventCard';
import { QuickActionButtons } from '../components/home/QuickActionButtons';
import { CreatePlanModal } from '../components/home/CreatePlanModal';
import { TrialExpiredModal } from '../components/trial/TrialExpiredModal';
import { TrialBanner } from '../components/trial/TrialBanner';
import { Shield, MapPin, Calendar, Plus, RefreshCw } from 'lucide-react';
import { getUserStatistics } from '../lib/userStatisticsService';
import { getTravelPlans } from '../lib/travelPlansService';
import { getAISafetyInsights } from '../lib/aiSafetyService';
import { TravelPlan, Activity, SafetyTip } from '../types';
import { AISafetyAlert } from '../lib/aiSafetyService';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isTrialActive, isTrialExpired } = useTrial();
  const { userLocation } = useLocation();
  const { 
    recentActivity,
    isLoading, 
    refreshData 
  } = useRealTimeData();

  const [userStats, setUserStats] = useState({
    travel_plans_count: 0,
    safety_score: 95,
    days_tracked: 0
  });
  
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [aiSafetyInsights, setAiSafetyInsights] = useState<SafetyTip[]>([]);
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
      setTravelPlans(plans.map(plan => ({
        id: plan.id,
        destination: plan.destination,
        startDate: plan.start_date,
        endDate: plan.end_date,
        imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(plan.destination)}`,
        safetyScore: 85
      })));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAISafetyInsights = async () => {
    if (!user || !userLocation) return;

    setIsLoadingAISafety(true);
    try {
      const insights = await getAISafetyInsights(
        user.id,
        userLocation.latitude.toString() + ',' + userLocation.longitude.toString()
      ) as AISafetyAlert[];
      
      // Convert AISafetyAlert to SafetyTip
      const safetyTips = insights.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.message || alert.title,
        imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(alert.type)}`
      }));
      
      setAiSafetyInsights(safetyTips);
    } catch (error) {
      console.error('Error loading AI safety insights:', error);
    } finally {
      setIsLoadingAISafety(false);
    }
  };

  useEffect(() => {
    if (userLocation && user) {
      loadAISafetyInsights();
    }
  }, [userLocation, user]);

  const handleRefreshData = async () => {
    await Promise.all([
      refreshData(),
      loadUserData(),
      loadAISafetyInsights()
    ]);
  };

  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'plan',
      title: 'New Travel Plan Created',
      description: 'Trip to Paris planned for next month',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'alert',
      title: 'Weather Alert',
      description: 'Heavy rain expected in your area',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'tip',
      title: 'Safety Tip',
      description: 'Always keep your documents secure while traveling',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler'}!
            </h1>
            <p className="text-slate-600 mt-1">
              Stay safe and informed with your travel dashboard
            </p>
          </div>
          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isTrialActive && <TrialBanner />}
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.travel_plans_count}</h3>
              <p className="text-sm text-slate-600">Travel Plans</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-100">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.safety_score}%</h3>
              <p className="text-sm text-slate-600">Safety Score</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.days_tracked}</h3>
              <p className="text-sm text-slate-600">Days Tracked</p>
            </div>
          </div>

          <QuickActionButtons />

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Travel Plans</h2>
              <button 
                onClick={() => setShowCreatePlanModal(true)}
                className="btn btn-ghost btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plan
              </button>
            </div>
            <div className="space-y-4">
              {travelPlans.map((plan) => (
                <TravelPlanItem key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <WeatherCard />

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Safety Insights</h2>
            {isLoadingAISafety ? (
              <div className="text-center py-4">Loading safety insights...</div>
            ) : aiSafetyInsights.length > 0 ? (
              <div className="space-y-3">
                {aiSafetyInsights.slice(0, 3).map((tip) => (
                  <SafetyTipCard key={tip.id} tip={tip} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                No safety insights available
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Local Events</h2>
            <div className="space-y-3">
              {recentActivity.filter(activity => activity.type === 'plan').map((activity) => {
                const event: Event = {
                  id: activity.id,
                  title: activity.title,
                  description: activity.description,
                  date: activity.timestamp,
                  time: new Date(activity.timestamp).toLocaleTimeString(),
                  location: 'Local',
                  imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(activity.type)}`,
                  attendees: 0,
                  category: activity.type
                };
                return <EventCard key={activity.id} event={event} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <CreatePlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onSubmit={loadUserData}
      />

      <TrialExpiredModal
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
      />
    </PageContainer>
  );
};

export default HomePage;