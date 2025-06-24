import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLocationPermissionRequest } from '../components/common/PermissionManager';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import EventCard from '../components/home/EventCard';
import WeatherCard from '../components/home/WeatherCard';
import TrialExpiredModal from '../components/trial/TrialExpiredModal';
import { eventsService, TravelEvent } from '../lib/eventsApi';
import { userDataService, UserStats } from '../lib/userDataService';
import { 
  MapPin, Calendar, Shield, Clock, 
  Plus, ArrowRight, Zap, Globe, AlertTriangle,
  RefreshCw, Crown
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentDestination, destinations } = useUserDestinations();
  const { userLocation, locationPermission, isTracking, startLocationTracking } = useLocationContext();
  const { isTrialActive, trialDaysRemaining, subscriptionStatus, isSubscribed } = useSubscription();
  const { requestLocationForContext } = useLocationPermissionRequest();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  // Check if trial has expired
  const isTrialExpired = subscriptionStatus === 'expired';
  const isPremiumUser = isSubscribed;

  // Get user's display name
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Traveler';
  };

  // Show trial expired modal when trial expires
  useEffect(() => {
    if (isTrialExpired && !isPremiumUser) {
      console.log('🔔 Trial expired, showing upgrade modal');
      setShowTrialExpiredModal(true);
    }
  }, [isTrialExpired, isPremiumUser]);

  // Load real user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        console.log('📊 Loading real user data for:', user.id);
        
        // Load user statistics
        const stats = await userDataService.calculateUserStats(user.id);
        setUserStats(stats);
        
        // Track page view activity
        await userDataService.trackActivity(user.id, 'home_page_viewed', {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        });
        
        console.log('✅ Real user data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Stats for dashboard - using real data with proper fallbacks
  const stats = [
    {
      label: 'Travel Plans',
      value: userStats?.totalTrips || destinations.length || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Active travel destinations and plans',
      trend: (userStats?.totalTrips || destinations.length) > 0 ? 'Active explorer' : 'Start planning your next adventure'
    },
    {
      label: 'Safety Score',
      value: userStats ? `${userStats.safetyScore}%` : (safetyAlerts.length === 0 ? '95%' : `${Math.max(60, 95 - safetyAlerts.length * 10)}%`),
      icon: Shield,
      color: userStats ? 
        (userStats.safetyScore >= 90 ? 'text-green-600' : userStats.safetyScore >= 70 ? 'text-yellow-600' : 'text-red-600') :
        (safetyAlerts.length === 0 ? 'text-green-600' : 'text-yellow-600'),
      bgColor: userStats ? 
        (userStats.safetyScore >= 90 ? 'bg-green-50' : userStats.safetyScore >= 70 ? 'bg-yellow-50' : 'bg-red-50') :
        (safetyAlerts.length === 0 ? 'bg-green-50' : 'bg-yellow-50'),
      borderColor: userStats ? 
        (userStats.safetyScore >= 90 ? 'border-green-200' : userStats.safetyScore >= 70 ? 'border-yellow-200' : 'border-red-200') :
        (safetyAlerts.length === 0 ? 'border-green-200' : 'border-yellow-200'),
      description: 'Current safety status for your locations',
      trend: safetyAlerts.length === 0 ? 'Excellent safety record' : `${safetyAlerts.length} alert${safetyAlerts.length > 1 ? 's' : ''} to review`
    },
    {
      label: 'Days Tracked',
      value: userStats?.daysTracked || Math.max(1, Math.floor((Date.now() - (user?.created_at ? new Date(user.created_at).getTime() : Date.now())) / (1000 * 60 * 60 * 24))),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Total days of travel tracking',
      trend: (userStats?.daysTracked || 1) > 30 ? 'Experienced traveler' : 'Building your travel history'
    }
  ];

  // Add trial status to stats if user is in trial
  if (isTrialActive || isTrialExpired) {
    stats.push({
      label: 'Trial Status',
      value: isTrialExpired ? 'Expired' : `${trialDaysRemaining} Days`,
      icon: Crown,
      color: isTrialExpired ? 'text-red-600' : trialDaysRemaining <= 1 ? 'text-orange-600' : 'text-purple-600',
      bgColor: isTrialExpired ? 'bg-red-50' : trialDaysRemaining <= 1 ? 'bg-orange-50' : 'bg-purple-50',
      borderColor: isTrialExpired ? 'border-red-200' : trialDaysRemaining <= 1 ? 'border-orange-200' : 'border-purple-200',
      description: isTrialExpired ? 'Trial has ended - upgrade to continue' : 'Premium trial remaining',
      trend: isTrialExpired ? 'Upgrade to Premium' : 'Enjoying premium features'
    });
  }

  // Fetch events for current destination or user location
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    console.log('🎪 Starting events fetch...');
    console.log('📍 Current user location:', userLocation);
    console.log('🎯 Current destination:', currentDestination);
    console.log('🔐 Location permission:', locationPermission);
    
    try {
      let eventsData;
      let locationName = '';
      
      if (currentDestination) {
        // Use destination location
        locationName = `${currentDestination.name}, ${currentDestination.country}`;
        console.log('🎯 Fetching events for destination:', locationName);
        eventsData = await eventsService.getTravelEvents(locationName);
      } else if (userLocation?.latitude && userLocation?.longitude) {
        // Use current GPS location with enhanced logging
        const lat = userLocation.latitude;
        const lng = userLocation.longitude;
        const accuracy = userLocation.accuracy || 'unknown';
        
        locationName = `${lat}, ${lng}`;
        console.log(`📍 Fetching events for GPS location: ${lat}, ${lng} (accuracy: ${accuracy}m)`);
        
        // Try to get events near location with different radius based on accuracy
        const radius = userLocation.accuracy && userLocation.accuracy > 1000 ? 50 : 25; // Larger radius for less accurate locations
        console.log(`🔍 Using ${radius}km radius for event search`);
        
        eventsData = await eventsService.getEventsNearLocation(lat, lng, radius);
        
        // If no events found with current radius, try a larger radius
        if (!eventsData?.events || eventsData.events.length === 0) {
          console.log('🔍 No events found, trying larger radius (50km)...');
          eventsData = await eventsService.getEventsNearLocation(lat, lng, 50);
        }
      } else {
        // Enhanced location handling
        console.log('🔍 No location available, attempting to get location...');
        
        if (locationPermission === 'granted' && !isTracking) {
          console.log('🚀 Starting location tracking for events...');
          startLocationTracking();
          
          // Wait a bit for location to be acquired
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (userLocation?.latitude && userLocation?.longitude) {
            console.log('✅ Got location after tracking start, fetching events...');
            locationName = `${userLocation.latitude}, ${userLocation.longitude}`;
            eventsData = await eventsService.getEventsNearLocation(
              userLocation.latitude, 
              userLocation.longitude, 
              25
            );
          }
        } else if (locationPermission === 'prompt' || locationPermission === 'unknown') {
          console.log('📋 Prompting for location permission for events...');
          // Use intelligent permission request for events
          requestLocationForContext({
            reason: 'accuracy_needed',
            feature: 'Local Events & Activities',
            importance: 'high',
            benefits: [
              'Discover events and activities near you',
              'Get recommendations based on your current location',
              'Find local experiences and cultural events',
              'Never miss out on nearby travel opportunities'
            ]
          });
        }
        
        // Enhanced fallback logic
        if (!eventsData) {
          console.log('🏙️ Using fallback location for events...');
          
          if (destinations.length > 0) {
            const fallbackDest = destinations[0];
            locationName = `${fallbackDest.name}, ${fallbackDest.country}`;
            console.log('🎯 Using user destination as fallback:', locationName);
            eventsData = await eventsService.getTravelEvents(locationName);
          } else {
            // Use a major city with many events as ultimate fallback
            const fallbackCities = [
              'New York, NY',
              'London, UK', 
              'Paris, France',
              'Tokyo, Japan',
              'Sydney, Australia'
            ];
            const randomCity = fallbackCities[Math.floor(Math.random() * fallbackCities.length)];
            locationName = randomCity;
            console.log('🌎 Using random global city as fallback:', locationName);
            eventsData = await eventsService.getTravelEvents(locationName);
          }
        }
      }
      
      if (eventsData && eventsData.events && eventsData.events.length > 0) {
        const eventCount = eventsData.events.length;
        setEvents(eventsData.events.slice(0, 6)); // Limit to 6 events
        console.log(`✅ Loaded ${eventCount} events for ${locationName}`);
        console.log('📋 Events:', eventsData.events.map(e => ({ title: e.title, location: e.location })));
      } else {
        setEvents([]);
        console.log(`⚠️ No events found for ${locationName}`);
        
        // Try alternative search if we have a specific location
        if (userLocation?.latitude && userLocation?.longitude) {
          console.log('🔄 Trying alternative events search...');
          try {
            // Try with a much larger radius as last resort
            const alternativeEvents = await eventsService.getEventsNearLocation(
              userLocation.latitude, 
              userLocation.longitude, 
              100 // 100km radius
            );
            
            if (alternativeEvents?.events && alternativeEvents.events.length > 0) {
              setEvents(alternativeEvents.events.slice(0, 6));
              console.log(`✅ Found ${alternativeEvents.events.length} events with 100km radius`);
            } else {
              console.log('❌ No events found even with 100km radius');
            }
          } catch (altError) {
            console.error('❌ Alternative events search failed:', altError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Enhanced useEffect with better dependency tracking
  useEffect(() => {
    console.log('🔄 Events fetch triggered by dependency change');
    fetchEvents();
  }, [currentDestination, userLocation?.latitude, userLocation?.longitude, locationPermission, isTracking]);

  const handleRequestLocationForFeatures = () => {
    requestLocationForContext({
      reason: 'feature_request',
      feature: 'Enhanced Travel Experience',
      importance: 'high',
      benefits: [
        'Get personalized recommendations for your area',
        'Receive location-based safety alerts',
        'Discover local events and activities',
        'Access real-time weather and travel conditions'
      ]
    });
  };

  if (isLoading) {
    return (
      <PageContainer 
        title={`${greeting}, ${getUserName()}!`}
        subtitle="Stay safe and informed on your journey"
      >
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 animate-pulse">
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-12 bg-slate-200 rounded mb-3"></div>
                  <div className="h-6 bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer 
        title={`${greeting}, ${getUserName()}!`}
        subtitle="Stay safe and informed on your journey"
      >
        <div className="card p-8 text-center bg-red-50 border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {greeting}, {getUserName()}!
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's your personalized travel dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={() => refreshData()}
            className="btn btn-ghost p-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/add-destination')}
            className="btn btn-primary hidden sm:flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`card p-4 flex-1 border-l-4 ${stat.borderColor}`}
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

          {/* Safety Alerts */}
          {safetyAlerts.length > 0 && (
            <div className="card p-4 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 text-red-500" />
                Active Safety Alerts
              </h3>
              <div className="space-y-3">
                {safetyAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50/50 rounded-lg">
                    <div className="w-5 h-5 text-red-500 mt-1 flex-shrink-0">
                      <Zap />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-700">{alert.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
              {safetyAlerts.length > 3 && (
                <button
                  onClick={() => navigate('/alerts')}
                  className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline"
                >
                  View all {safetyAlerts.length} alerts
                </button>
              )}
            </div>
          )}

          {/* Upcoming Travel Plans */}
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                Upcoming Plans
              </h3>
              <button
                onClick={() => navigate('/add-destination')}
                className="btn btn-outline btn-sm mt-3 sm:mt-0"
              >
                Manage Plans
              </button>
            </div>
            {destinations.filter(d => new Date(d.endDate) >= new Date()).length > 0 ? (
              <ul className="space-y-3">
                {destinations
                  .filter(d => new Date(d.endDate) >= new Date())
                  .slice(0, 3)
                  .map(dest => (
                    <li key={dest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50/70 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-800">{dest.name}, {dest.country}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(dest.startDate).toLocaleDateString()} - {new Date(dest.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium px-2 py-1 rounded-full mt-2 sm:mt-0 ${dest.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {dest.isActive ? 'Active' : 'Upcoming'}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="mt-4 text-lg font-semibold text-slate-800">No Upcoming Trips</h4>
                <p className="mt-1 text-slate-500">
                  Time to plan your next adventure!
                </p>
                <button
                  onClick={() => navigate('/add-destination')}
                  className="btn btn-primary mt-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Travel Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side content) */}
        <div className="space-y-6">
          <WeatherCard />
          
          <div className="card p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Local Events & Activities
            </h3>
            {isLoadingEvents ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto text-slate-400 animate-spin" />
                <p className="mt-4 text-slate-500">Finding local events...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
                <button
                  onClick={() => navigate('/explore', { state: { focus: 'events' } })}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:underline pt-2"
                >
                  Discover more events
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="mt-4 text-lg font-semibold text-slate-800">No Events Found</h4>
                <p className="mt-1 text-slate-500">
                  Couldn't find events for your location.
                </p>
                <button
                  onClick={fetchEvents}
                  className="btn btn-outline btn-sm mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TrialExpiredModal
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
      />
    </PageContainer>
  );
};

export default HomePage;