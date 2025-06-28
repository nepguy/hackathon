import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLocationPermissionRequest } from '../components/common/PermissionManager';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { useUserStatistics } from '../lib/userStatisticsService';
import { locationSafetyService } from '../lib/locationSafetyService';
import { aiSafetyService } from '../lib/aiSafetyService';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import EventCard from '../components/home/EventCard';
import WeatherCard from '../components/home/WeatherCard';
import TrialExpiredModal from '../components/trial/TrialExpiredModal';
import { eventsService, TravelEvent } from '../lib/eventsApi';
import { 
  MapPin, Calendar, Shield, Clock, 
  Plus, Zap, Globe, AlertTriangle,
  RefreshCw, Crown, Plane
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentDestination, destinations, getUpcomingDestinations, refreshDestinations } = useUserDestinations();
  const { userLocation, locationPermission, isTracking, startLocationTracking } = useLocationContext();
  const { isTrialActive, trialDaysRemaining, subscriptionStatus, isSubscribed } = useSubscription();
  const { requestLocationForContext } = useLocationPermissionRequest();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();
  const navigate = useNavigate();
  const { statistics, updateSafetyScore, incrementDaysTracked } = useUserStatistics();
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [aiSafetyAlerts, setAiSafetyAlerts] = useState<any[]>([]);
  const [isLoadingAISafety, setIsLoadingAISafety] = useState(false);
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

  // Initialize location tracking if permission granted and not already tracking
  useEffect(() => {
    if (user && locationPermission === 'granted' && !isTracking && !userLocation) {
      console.log('🗺️ Starting location tracking for safety monitoring');
      startLocationTracking();
    }
  }, [user, locationPermission, isTracking, userLocation, startLocationTracking]);

  // Request location permission if needed for enhanced features
  useEffect(() => {
    if (user && locationPermission === 'prompt' && destinations.length > 0) {
      console.log('📍 Requesting location permission for enhanced travel safety');
      requestLocationForContext({
        reason: 'feature_request',
        feature: 'Enhanced Travel Safety',
        importance: 'critical',
        benefits: [
          'Real-time safety alerts for your current location',
          'Location-specific weather and emergency updates',
          'Nearby events and travel information',
          'Enhanced scam detection based on location patterns'
        ]
      });
    }
  }, [user, locationPermission, destinations.length, requestLocationForContext]);

  // Initialize AI-based safety alerts and location tracking
  useEffect(() => {
    if (user) {
      initializeLocationBasedServices();
      updateDailyActivity();
    }
  }, [user, userLocation, currentDestination, destinations.length]);

  const initializeLocationBasedServices = async () => {
    if (!user) return;

    setIsLoadingAISafety(true);
    try {
      let context = null;

      // If user has active destinations, use the current destination
      if (currentDestination) {
        // Get coordinates for destination if not available
        let coordinates = undefined;
        if (!coordinates && currentDestination.destination) {
          try {
            // Try alternative geocoding approach with error handling
            console.log(`🌍 Attempting to geocode: ${currentDestination.destination}`);
            
            // Use a more reliable geocoding service or fallback approach
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentDestination.destination)}&limit=1`
            );
            
            if (!geocodeResponse.ok) {
              throw new Error(`Geocoding failed: ${geocodeResponse.status}`);
            }
            
            const geocodeData = await geocodeResponse.json();
            if (geocodeData && geocodeData.length > 0) {
              const result = geocodeData[0];
              coordinates = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
              };
              console.log(`✅ Geocoded ${currentDestination.destination}:`, coordinates);
            } else {
              console.warn(`⚠️ No geocoding results for: ${currentDestination.destination}`);
            }
          } catch (error) {
            console.warn('🔄 Geocoding failed, using fallback location data:', error);
            // Continue without coordinates - the AI service will work with text location
          }
        }

        // Extract country from destination
        const destinationParts = currentDestination.destination.split(',');
        const country = destinationParts.length > 1 
          ? destinationParts[destinationParts.length - 1].trim() 
          : destinationParts[0];
        const city = destinationParts.length > 1 
          ? destinationParts[0].trim() 
          : undefined;

        context = {
          destination: currentDestination.destination,
          coordinates,
          country,
          city,
          travel_dates: {
            start: currentDestination.startDate,
            end: currentDestination.endDate
          }
        };
      } 
      // If no destination but has location, use current location
      else if (userLocation) {
        let locationInfo = {
          country: 'Unknown',
          city: undefined as string | undefined
        };

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&localityLanguage=en`
          );
          const data = await response.json();
          locationInfo.country = data.countryName || 'Unknown';
          locationInfo.city = data.city || data.locality;
        } catch (error) {
          console.warn('Could not determine location info:', error);
        }

        context = {
          destination: `${locationInfo.city || 'Current Location'}, ${locationInfo.country}`,
          coordinates: {
            lat: userLocation.latitude,
            lng: userLocation.longitude
          },
          country: locationInfo.country,
          city: locationInfo.city,
          user_location: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
            country: locationInfo.country,
            city: locationInfo.city
          }
        };

        // Update location in safety service for legacy support and backup tracking
        locationSafetyService.updateUserLocation(user.id, {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          country: locationInfo.country,
          city: locationInfo.city
        });
        console.log('🗺️ Updated location safety service with current coordinates');
      }

      if (context) {
        console.log('🤖 Generating AI safety alerts for:', context.destination);
        
        // Use the new AI safety service
        const alerts = await aiSafetyService.generateSafetyAlerts(context);
        
        // Transform to match the expected format
        const transformedAlerts = alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          location: alert.location,
          timestamp: alert.timestamp,
          actionable_advice: alert.actionable_advice,
          relevant_links: alert.relevant_links
        }));

        setAiSafetyAlerts(transformedAlerts);
        console.log(`✅ Generated ${transformedAlerts.length} AI safety alerts`);

        // Update safety score based on alerts
        const criticalCount = alerts.filter(a => a.severity === 'critical').length;
        const highCount = alerts.filter(a => a.severity === 'high').length;
        const mediumCount = alerts.filter(a => a.severity === 'medium').length;
        
        // Calculate safety score (95 baseline, reduce for each alert)
        let newSafetyScore = 95;
        newSafetyScore -= criticalCount * 15; // -15 for each critical
        newSafetyScore -= highCount * 10;     // -10 for each high
        newSafetyScore -= mediumCount * 5;    // -5 for each medium
        newSafetyScore = Math.max(30, Math.min(100, newSafetyScore)); // Keep between 30-100

        // Update safety score in statistics
        await updateSafetyScore(newSafetyScore);

        console.log(`📊 Updated safety score to ${newSafetyScore} based on ${alerts.length} alerts`);
      } else {
        console.log('⚠️ No context available for AI safety alerts (no destination or location)');
        
        // Still try to provide some basic safety guidance
        setAiSafetyAlerts([{
          id: `general-${Date.now()}`,
          type: 'safety',
          severity: 'medium',
          title: 'General Travel Safety',
          message: 'Stay alert and follow general safety practices. Consider adding a destination to get location-specific safety insights.',
          location: 'General',
          timestamp: new Date().toISOString(),
          actionable_advice: [
            'Keep important documents secure',
            'Stay aware of your surroundings',
            'Have emergency contacts available',
            'Add a travel destination for personalized alerts'
          ]
        }]);
      }

    } catch (error) {
      console.error('Error initializing location-based services:', error);
      // Fallback to basic alert
      setAiSafetyAlerts([{
        id: `fallback-${Date.now()}`,
        type: 'safety',
        severity: 'medium',
        title: 'Stay Alert',
        message: 'Always stay aware of your surroundings and follow general safety practices.',
        location: 'General',
        timestamp: new Date().toISOString(),
        actionable_advice: [
          'Keep important documents secure',
          'Stay aware of your surroundings',
          'Have emergency contacts available'
        ]
      }]);
    } finally {
      setIsLoadingAISafety(false);
    }
  };

  const updateDailyActivity = async () => {
    if (!user) return;

    try {
      // Track daily activity (increment days tracked) - FIXED: Only once per calendar day
      const lastActiveDate = localStorage.getItem(`lastActive_${user.id}`);
      const today = new Date().toDateString();

      if (lastActiveDate !== today) {
        // Only increment days_tracked by 1 per calendar day
        await incrementDaysTracked(1);
        localStorage.setItem(`lastActive_${user.id}`, today);
        console.log('📊 Daily activity tracked for:', today);
      } else {
        console.log('📊 Already tracked today:', today);
      }
    } catch (error) {
      console.error('Error updating daily activity:', error);
    }
  };

  // Stats for dashboard - using real data with proper fallbacks
  const upcomingTrips = getUpcomingDestinations();
  const activeTrips = destinations.filter(d => d.status === 'active');
  
  const stats = [
    {
      label: 'Travel Plans',
      value: statistics?.travel_plans_count || destinations.length || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Active travel destinations and plans',
      trend: (statistics?.travel_plans_count || destinations.length) > 0 ? 'Active explorer' : 'Start planning your next adventure'
    },
    {
      label: 'Safety Score',
      value: statistics ? `${statistics.safety_score}%` : (aiSafetyAlerts.length === 0 ? '95%' : `${Math.max(60, 95 - aiSafetyAlerts.length * 10)}%`),
      icon: Shield,
      color: statistics ? 
        (statistics.safety_score >= 90 ? 'text-green-600' : statistics.safety_score >= 70 ? 'text-yellow-600' : 'text-red-600') :
        (aiSafetyAlerts.length === 0 ? 'text-green-600' : 'text-yellow-600'),
      bgColor: statistics ? 
        (statistics.safety_score >= 90 ? 'bg-green-50' : statistics.safety_score >= 70 ? 'bg-yellow-50' : 'bg-red-50') :
        (aiSafetyAlerts.length === 0 ? 'bg-green-50' : 'bg-yellow-50'),
      borderColor: statistics ? 
        (statistics.safety_score >= 90 ? 'border-green-200' : statistics.safety_score >= 70 ? 'border-yellow-200' : 'border-red-200') :
        (aiSafetyAlerts.length === 0 ? 'border-green-200' : 'border-yellow-200'),
      description: 'AI-powered location safety assessment',
      trend: aiSafetyAlerts.length === 0 ? 'Excellent safety record' : `${aiSafetyAlerts.length} AI alert${aiSafetyAlerts.length > 1 ? 's' : ''} to review`
    },
    {
      label: 'Days Tracked',
      value: statistics?.days_tracked || 0, // FIXED: Always use database value, no fallback calculation
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Days active on GuardNomad platform',
      trend: (statistics?.days_tracked || 0) > 30 ? 'Experienced traveler' : 'Building your travel history'
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

  const fetchEvents = async () => {
    if (!currentDestination && destinations.length === 0) return;
    
    setIsLoadingEvents(true);
    try {
      const destination = currentDestination?.destination || destinations[0]?.destination || 'Local';
      const eventsData = await eventsService.getTravelEvents(destination);
      setEvents(eventsData?.events?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDestination, destinations]);

  // Refresh data function
  const handleRefreshData = async () => {
    await Promise.all([
      refreshData(),
      refreshDestinations(),
      initializeLocationBasedServices(),
      fetchEvents()
    ]);
  };

  const formatDestinationName = (destination: string) => {
    // Split destination into city and country if it contains a comma
    const parts = destination.split(',');
    if (parts.length >= 2) {
      return {
        city: parts[0].trim(),
        country: parts.slice(1).join(',').trim()
      };
    }
    return {
      city: destination,
      country: ''
    };
  };

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={handleRefreshData} className="btn btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </PageContainer>
    );
          <div class="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
  return (
    <PageContainer>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          <div className="flex items-center space-x-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's your personalized travel dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={handleRefreshData}
            className="btn btn-ghost p-2"
              className="btn btn-primary flex items-center space-x-2 text-sm"
          >
            <RefreshCw className={`w-5 h-5 ${(isLoading || isLoadingAISafety) ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/add-destination')}
            className="btn btn-primary hidden sm:flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          </button>
        </div>
      </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Main content) */}
                  className={`card p-3 sm:p-4 flex-1 border-l-4 ${stat.borderColor}`}
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                key={index}
                    <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <h3 className="text-sm sm:text-md font-semibold text-slate-800">{stat.label}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{stat.description}</p>
                    <p className="text-xs text-slate-400 mt-1 hidden sm:block">{stat.trend}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-slate-800">{stat.label}</h3>
                  <p className="text-xs text-slate-500">{stat.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI-Powered Safety Alerts */}
          {(aiSafetyAlerts.length > 0 || safetyAlerts.length > 0) && (
            <div className="card p-4 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 text-red-500" />
                Active Safety Alerts
                {isLoadingAISafety && <RefreshCw className="w-4 h-4 ml-2 animate-spin text-blue-500" />}
              </h3>
              <div className="space-y-3">
                {/* AI-generated alerts first */}
                {aiSafetyAlerts.slice(0, 2).map((alert, index) => (
                  <div key={`ai-${index}`} className="flex items-start space-x-3 p-3 bg-orange-50/50 rounded-lg border border-orange-200">
                    <div className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0">
                      <Shield />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-orange-800">{alert.title}</h4>
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">AI</span>
                      </div>
                      <p className="text-sm text-orange-700">{alert.description}</p>
                      {alert.actionRequired && (
                        <p className="text-xs text-orange-600 mt-1 font-medium">Action: {alert.actionRequired}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Regular alerts */}
                {safetyAlerts.slice(0, 1).map((alert, index) => (
                  <div key={`regular-${index}`} className="flex items-start space-x-3 p-3 bg-red-50/50 rounded-lg">
                    <div className="w-5 h-5 text-red-500 mt-1 flex-shrink-0">
                      <Zap />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-700">{alert.description}</p>
            <div className="card p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
              </div>
              {(aiSafetyAlerts.length + safetyAlerts.length) > 3 && (
                <button
                  onClick={() => navigate('/alerts')}
                  className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline"
                  className="btn btn-outline btn-sm mt-2 sm:mt-0 text-xs"
                  View all {aiSafetyAlerts.length + safetyAlerts.length} alerts
                </button>
              )}
            </div>
          )}

          {/* Upcoming Travel Plans */}
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-green-700 mb-2 sm:mb-3 flex items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                Upcoming Plans
              </h3>
              <button
                onClick={() => navigate('/alerts', { state: { focus: 'destinations' } })}
                className="btn btn-outline btn-sm mt-3 sm:mt-0"
                        <div key={dest.id} className="flex items-center justify-between p-2 sm:p-3 bg-green-50/70 rounded-lg border border-green-200">
                Manage Plans
              </button>
            </div>
                              <p className="font-semibold text-green-800 text-sm">{city}{country && `, ${country}`}</p>
                              <p className="text-xs text-green-600">
            {activeTrips.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                  <Plane className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-800 rounded-full">
                </h4>
                <div className="space-y-2">
                  {activeTrips.map(dest => {
                    const { city, country } = formatDestinationName(dest.destination);
                    return (
                      <div key={dest.id} className="flex items-center justify-between p-3 bg-green-50/70 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-semibold text-green-800">{city}{country && `, ${country}`}</p>
                            <p className="text-sm text-green-600">
              <div className="card p-3 sm:p-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-700 mb-2 sm:mb-3">Planned Trips</h4>
                          </div>
                        </div>
                        <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          Active
                        <li key={dest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-slate-50/70 rounded-lg">
                      </div>
                    );
                    <div key={`ai-${index}`} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-orange-50/50 rounded-lg border border-orange-200">
                              <p className="font-semibold text-slate-800 text-sm">{city}{country && `, ${country}`}</p>
                              <p className="text-xs text-slate-600">
            )}

            {/* Upcoming Trips */}
                          <h4 className="font-semibold text-orange-800 text-sm sm:text-base">{alert.title}</h4>
                          <div className="text-xs font-medium px-2 py-0.5 rounded-full mt-2 sm:mt-0 bg-blue-100 text-blue-800">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">Planned Trips</h4>
                        <p className="text-xs sm:text-sm text-orange-700 line-clamp-2">{alert.description}</p>
                  {upcomingTrips.slice(0, 3).map(dest => {
                          <p className="text-xs text-orange-600 mt-1 font-medium hidden sm:block">Action: {alert.actionRequired}</p>
                    return (
                      <li key={dest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50/70 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-slate-500" />
                          <div>
                      className="mt-3 w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:underline"
                            <p className="text-sm text-slate-600">
                    <div key={`regular-${index}`} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-red-50/50 rounded-lg">
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium px-2 py-1 rounded-full mt-2 sm:mt-0 bg-blue-100 text-blue-800">
                <div className="text-center py-6 sm:py-8">
                  <Globe className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300" />
                  <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-slate-800">No Upcoming Trips</h4>
                  <p className="mt-1 text-sm text-slate-500">
                  })}
                </ul>
                {upcomingTrips.length > 3 && (
                  <button
                    className="btn btn-primary mt-4 sm:mt-6 text-sm"
                    className="mt-3 sm:mt-4 w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all {upcomingTrips.length} planned trips
                  </button>
                )}
              </div>
            ) : activeTrips.length === 0 ? (
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
            ) : null}
          </div>
        </div>

          <div className="space-y-4 sm:space-y-6">
        <div className="space-y-6">
          <WeatherCard />
            <div className="card p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Local Events & Activities
            </h3>
                <div className="text-center py-6 sm:py-8">
                  <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-slate-400 animate-spin" />
                  <p className="mt-3 sm:mt-4 text-sm text-slate-500">Finding local events...</p>
                <p className="mt-4 text-slate-500">Finding local events...</p>
              </div>
                <div className="space-y-3 sm:space-y-4">
              <div className="space-y-4">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
                <button
                    className="w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:underline pt-2"
                  className="w-full text-center text-sm font-medium text-blue-600 hover:underline pt-2"
                >
                  Discover more events
                </button>
              </div>
                <div className="text-center py-6 sm:py-8">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300" />
                  <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-slate-800">No Events Found</h4>
                  <p className="mt-1 text-sm text-slate-500">
                <p className="mt-1 text-slate-500">
                  Couldn't find events for your location.
                </p>
                <button
                    className="btn btn-outline btn-sm mt-3 sm:mt-4 text-xs"
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