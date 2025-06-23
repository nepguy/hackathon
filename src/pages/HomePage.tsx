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
  const { safetyAlerts, travelPlans, recentActivity, isLoading, error, refreshData } = useRealTimeData();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Check if trial has expired
  const isTrialExpired = subscriptionStatus === 'expired';
  const isPremiumUser = isSubscribed;
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

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
      
      setIsLoadingStats(true);
      try {
        console.log('📊 Loading real user data for:', user.id);
        
        // Load user statistics
        const stats = await userDataService.calculateUserStats(user.id);
        setUserStats(stats);
        
        // Load recent activities
        const activities = await userDataService.getRecentActivities(user.id, 8);
        setRealActivities(activities);
        
        // Track page view activity
        await userDataService.trackActivity(user.id, 'home_page_viewed', {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        });
        
        console.log('✅ Real user data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Stats for dashboard - now using real data
  const stats = userStats ? [
    {
      label: 'Travel Plans',
      value: userStats.totalTrips,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Active travel destinations and plans',
      trend: userStats.totalTrips > 10 ? `+${Math.floor(userStats.totalTrips * 0.1)} this month` : 'Start planning your next adventure'
    },
    {
      label: 'Safety Score',
      value: `${userStats.safetyScore}%`,
      icon: Shield,
      color: userStats.safetyScore >= 90 ? 'text-green-600' : userStats.safetyScore >= 70 ? 'text-yellow-600' : 'text-red-600',
      bgColor: userStats.safetyScore >= 90 ? 'bg-green-50' : userStats.safetyScore >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      borderColor: userStats.safetyScore >= 90 ? 'border-green-200' : userStats.safetyScore >= 70 ? 'border-yellow-200' : 'border-red-200',
      description: 'Current safety status for your locations',
      trend: userStats.safetyScore >= 90 ? 'Excellent safety record' : userStats.safetyScore >= 70 ? 'Good safety practices' : 'Review safety recommendations'
    },
    {
      label: 'Days Tracked',
      value: userStats.daysTracked,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Total days of travel tracking',
      trend: userStats.daysTracked > 100 ? 'Experienced traveler' : userStats.daysTracked > 30 ? 'Active explorer' : 'Getting started'
    }
  ] : [
    // Fallback stats while loading
    {
      label: 'Travel Plans',
      value: travelPlans.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Active travel destinations and plans',
      trend: travelPlans.length > 0 ? '+2 this month' : 'Start planning your next adventure'
    },
    {
      label: 'Safety Score',
      value: safetyAlerts.length === 0 ? '🟢 Safe' : `${safetyAlerts.length} Alert${safetyAlerts.length > 1 ? 's' : ''}`,
      icon: Shield,
      color: safetyAlerts.length === 0 ? 'text-green-600' : 'text-red-600',
      bgColor: safetyAlerts.length === 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: safetyAlerts.length === 0 ? 'border-green-200' : 'border-red-200',
      description: 'Current safety status for your locations',
      trend: safetyAlerts.length === 0 ? 'All clear' : 'Review alerts for safety'
    },
    {
      label: 'Recent Activity',
      value: recentActivity.length,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'New updates and notifications',
      trend: recentActivity.length > 0 ? 'New updates available' : 'All caught up'
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {getUserName()}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {currentDestination 
                ? `Currently planning: ${currentDestination.name}` 
                : 'Ready for your next adventure?'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/add-destination')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trip</span>
            </button>
          </div>
        </div>

        {/* Location Access Prompt */}
        {locationPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Better Travel Recommendations
                </h3>
                <p className="text-gray-600 mb-4">
                  Enable location access to get personalized safety alerts, local events, and accurate weather information for your travels.
                </p>
                <button
                  onClick={handleRequestLocationForFeatures}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enable Location Features
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`grid grid-cols-1 ${stats.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
          {stats.map((stat, index) => (
            <div key={index} className={`kit-card hover:shadow-md transition-all duration-300 ${stat.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">
                  {stat.description}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trial Status Card */}
        {(isTrialActive || isTrialExpired) && !isPremiumUser && (
          <div className={`bg-gradient-to-r ${
            isTrialExpired 
              ? 'from-red-50 to-pink-50 border-red-200' 
              : trialDaysRemaining <= 1 
                ? 'from-orange-50 to-red-50 border-orange-200'
                : 'from-purple-50 to-blue-50 border-purple-200'
          } border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isTrialExpired 
                    ? 'bg-red-100' 
                    : trialDaysRemaining <= 1 
                      ? 'bg-orange-100'
                      : 'bg-purple-100'
                }`}>
                  <Crown className={`w-6 h-6 ${
                    isTrialExpired 
                      ? 'text-red-600' 
                      : trialDaysRemaining <= 1 
                        ? 'text-orange-600'
                        : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isTrialExpired 
                      ? 'Trial Expired' 
                      : `${trialDaysRemaining} Day${trialDaysRemaining > 1 ? 's' : ''} Left`
                    }
                  </h3>
                  <p className="text-gray-600">
                    {isTrialExpired 
                      ? 'Upgrade to Premium to continue using advanced features'
                      : 'Your premium trial is active. Upgrade to keep these features forever!'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isTrialExpired
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isTrialExpired ? 'Upgrade Now' : 'View Plans'}
              </button>
            </div>
          </div>
        )}

        {/* Weather Widget */}
        <WeatherCard 
          location={currentDestination ? `${currentDestination.name}, ${currentDestination.country}` : undefined}
          coordinates={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined}
        />

        {/* Events Section */}
        <div className="kit-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Local Events & Activities
            </h2>
            <button
              onClick={() => navigate('/map')}
              className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {isLoadingEvents ? (
            <div className="mobile-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="kit-glass rounded-lg mobile-card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="mobile-grid">
              {events.map((event, index) => (
                <EventCard key={`${event.id}-${index}`} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="mobile-title font-medium text-gray-900 mb-2">
                {locationPermission !== 'granted' ? 'Discover Local Events' : 'No Events Nearby'}
              </h3>
              <p className="text-gray-500 mb-4 mobile-text">
                {locationPermission !== 'granted' 
                  ? 'Enable location access to discover events and activities near you' 
                  : userLocation 
                    ? `No events found within 25km of your current location`
                    : 'No events found for your current location'}
              </p>
              {locationPermission !== 'granted' ? (
                <button
                  onClick={handleRequestLocationForFeatures}
                  className="kit-button"
                >
                  Enable Location Access
                </button>
              ) : (
                <button
                  onClick={() => navigate('/map')}
                  className="kit-button bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                >
                  Explore All Events
                </button>
              )}
            </div>
          )}
        </div>

        {/* Safety Alerts */}
        {safetyAlerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Safety Alerts
              </h2>
              <button
                onClick={() => navigate('/alerts')}
                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {safetyAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{alert.title}</h4>
                    <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{alert.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/map')}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Globe className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">View Map</span>
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Shield className="w-6 h-6 text-red-600 mb-2" />
              <span className="text-sm font-medium text-red-900">Safety Center</span>
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Explore</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MapPin className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Profile</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
      />
    </PageContainer>
  );
};

export default HomePage;