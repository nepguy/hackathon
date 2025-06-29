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

import { QuickActionButtons } from '../components/home/QuickActionButtons';
import { CreatePlanModal } from '../components/home/CreatePlanModal';
import { TrialExpiredModal } from '../components/trial/TrialExpiredModal';
import { TrialBanner } from '../components/trial/TrialBanner';
import { Shield, MapPin, Calendar, Plus, RefreshCw, Globe, Clock } from 'lucide-react';
import { getUserStatistics } from '../lib/userStatisticsService';
import { getAISafetyInsights } from '../lib/aiSafetyService';
import { newsService } from '../lib/newsApi';
import { TravelPlan, Activity, SafetyTip } from '../types';
import { AISafetyAlert } from '../lib/aiSafetyService';
import { NewsArticle } from '../lib/newsApi';
import { useUserDestinations } from '../contexts/UserDestinationContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isTrialActive, isTrialExpired } = useTrial();
  const { userLocation } = useLocation();
  const { addDestination, destinations } = useUserDestinations();
  const { 
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
  const [travelNews, setTravelNews] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
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

  // Update travel plans when destinations change
  useEffect(() => {
    if (destinations.length >= 0) {
      const formattedPlans = destinations.map(dest => ({
        id: dest.id,
        destination: dest.destination,
        startDate: dest.startDate,
        endDate: dest.endDate,
        imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(dest.destination)}`,
        safetyScore: 85
      }));
      setTravelPlans(formattedPlans);
    }
  }, [destinations]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const stats = await getUserStatistics(user.id);
      setUserStats(stats || { travel_plans_count: 0, safety_score: 95, days_tracked: 0 });
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

  const loadTravelNews = async () => {
    if (!userLocation) return;
    
    setIsLoadingNews(true);
    try {
      console.log('📰 Loading travel news via Exa service');
              const newsData = await newsService.getTravelNews();
      setTravelNews(newsData.articles?.slice(0, 5) || []);
      console.log('✅ Travel news loaded successfully via Exa');
    } catch (error) {
      console.error('❌ Error loading travel news:', error);
      setTravelNews([]);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
      loadAISafetyInsights();
      loadTravelNews();
    }
  }, [user, userLocation]);

  const handleRefreshData = async () => {
    await Promise.all([
      refreshData(),
      loadUserData(),
      loadAISafetyInsights(),
      loadTravelNews()
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

  const handleCreatePlan = async (planData: {
    destination: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => {
    if (!user) {
      console.error('User must be logged in to create travel plans');
      return;
    }

    try {
      console.log('🛫 Creating travel plan:', planData);
      
      // Create the destination using the UserDestinationContext
      await addDestination({
        destination: planData.destination,
        startDate: planData.startDate,
        endDate: planData.endDate,
        status: 'planned',
        alertsEnabled: true
      });

      console.log('✅ Travel plan created successfully');
      
      // Refresh user data to show the new plan
      await loadUserData();
      
      // Close the modal
      setShowCreatePlanModal(false);
      
    } catch (error) {
      console.error('❌ Error creating travel plan:', error);
      // You might want to show an error message to the user here
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
          {isTrialActive && <TrialBanner />}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100">
                <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.travel_plans_count}</h3>
              <p className="text-sm text-slate-600">Travel Plans</p>
                  </div>
            
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-100">
                <Shield className="w-6 h-6 text-green-600" />
                </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.safety_score}%</h3>
              <p className="text-sm text-slate-600">Safety Score</p>
                </div>
            
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{userStats.days_tracked}</h3>
              <p className="text-sm text-slate-600">Days Tracked</p>
            </div>
          </div>

          <QuickActionButtons />

          {/* Enhanced 2-Column Layout for Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Travel Plans Section */}
            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Travel Plans
                </h2>
              <button 
                onClick={() => setShowCreatePlanModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plan
              </button>
            </div>
              <div className="space-y-4">
              {travelPlans.length > 0 ? (
                  travelPlans.map((plan) => (
                  <TravelPlanItem key={plan.id} plan={plan} />
                ))
              ) : (
                  <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                    <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Ready for your next adventure?</h3>
                    <p className="text-sm text-slate-500 mb-4">Create your first travel plan to get personalized safety insights</p>
                    <button 
                      onClick={() => setShowCreatePlanModal(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Travel Plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Travel News & Insights Section */}
            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-red-600" />
                  Travel Intelligence
                </h2>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Live</span>
              </div>
              
              {isLoadingNews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-3">Analyzing global travel conditions...</p>
                </div>
              ) : travelNews.length > 0 ? (
                <div className="space-y-4">
                  {travelNews.map((article) => (
                    <div key={article.url} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Read more →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center py-2 text-sm text-red-600 hover:text-red-700 font-medium">
                    View All Travel Alerts →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">All Clear!</h3>
                  <p className="text-sm text-slate-500 mb-2">No critical travel alerts for your area</p>
                  <p className="text-xs text-slate-400">We'll notify you of any important updates</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Section - Full Width */}
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all duration-300">
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streamlined Right Sidebar - Real-time Data Only */}
        <div className="space-y-6">
          <WeatherCard />

          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Safety Insights
            </h2>
            {isLoadingAISafety ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2">Analyzing safety data...</p>
              </div>
            ) : aiSafetyInsights.length > 0 ? (
              <div className="space-y-3">
                {aiSafetyInsights.slice(0, 2).map((tip) => (
                  <SafetyTipCard key={tip.id} tip={tip} />
                ))}
                <button className="w-full text-center py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                  View All Insights →
                </button>
              </div>
            ) : (
              <div className="text-center py-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">You're all set!</p>
                <p className="text-xs text-slate-500">No safety concerns detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreatePlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onSubmit={handleCreatePlan}
      />

      <TrialExpiredModal
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
      />
    </PageContainer>
  );
};

export default HomePage;