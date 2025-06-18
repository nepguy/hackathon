import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import EventCard from '../components/home/EventCard';
import WeatherCard from '../components/home/WeatherCard';
import { eventsService, TravelEvent } from '../lib/eventsApi';
import { 
  MapPin, Calendar, Shield, TrendingUp, Clock, 
  Plus, ArrowRight, Zap, Globe, AlertTriangle,
  RefreshCw
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentDestination, destinations } = useUserDestinations();
  const { userLocation, locationPermission, getCurrentLocation } = useLocationContext();
  const { safetyAlerts, travelPlans, recentActivity, isLoading, error, refreshData } = useRealTimeData();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
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

  // Calculate real stats from data
  const getStats = () => {
    const unreadAlerts = safetyAlerts.filter(alert => !alert.read).length;
    const avgSafetyScore = travelPlans.length > 0 
      ? Math.round(travelPlans.reduce((sum, plan) => sum + plan.safetyScore, 0) / travelPlans.length)
      : 92;

    return [
      { 
        label: 'Active Alerts', 
        value: unreadAlerts.toString(), 
        icon: AlertTriangle, 
        color: unreadAlerts > 0 ? 'text-amber-600' : 'text-emerald-600', 
        bg: unreadAlerts > 0 ? 'bg-amber-100' : 'bg-emerald-100' 
      },
      { 
        label: 'Safety Score', 
        value: `${avgSafetyScore}%`, 
        icon: Shield, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100' 
      },
      { 
        label: 'Destinations', 
        value: destinations.length.toString(), 
        icon: Globe, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100' 
      },
    ];
  };

  const stats = getStats();

  const quickActions = [
    { 
      label: 'View Alerts', 
      icon: AlertTriangle, 
      color: 'from-red-500 to-orange-500', 
      action: () => navigate('/alerts')
    },
    { 
      label: 'Explore Map', 
      icon: MapPin, 
      color: 'from-blue-500 to-indigo-500', 
      action: () => navigate('/map')
    },
    { 
      label: 'Add Destination', 
      icon: Plus, 
      color: 'from-emerald-500 to-teal-500', 
      action: () => navigate('/explore')
    },
  ];

  // Fetch events for current destination or user location
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    
    try {
      let eventsData;
      
      if (currentDestination) {
        // Use destination location
        const location = `${currentDestination.name}, ${currentDestination.country}`;
        console.log('Fetching events for destination:', location);
        eventsData = await eventsService.getTravelEvents(location);
      } else if (userLocation?.latitude && userLocation?.longitude) {
        // Use current GPS location
        console.log('Fetching events for GPS location:', userLocation.latitude, userLocation.longitude);
        eventsData = await eventsService.getEventsNearLocation(
          userLocation.latitude, 
          userLocation.longitude, 
          25 // 25km radius
        );
      } else {
        // Try to get location if not available
        if (locationPermission === 'granted' || locationPermission === 'prompt') {
          console.log('Attempting to get current location...');
          getCurrentLocation();
        }
        
        // Fallback to general travel events with a default location
        console.log('Using fallback location for events');
        eventsData = await eventsService.getTravelEvents('New York, NY'); // Default fallback
      }
      
      setEvents(eventsData.events.slice(0, 6)); // Limit to 6 events
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Load events when component mounts or destination changes
  useEffect(() => {
    fetchEvents();
  }, [currentDestination, userLocation?.latitude, userLocation?.longitude]);

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
    <PageContainer 
      title={`${greeting}, ${getUserName()}!`}
      subtitle="Stay safe and informed on your journey"
    >
      <div className="space-y-8 stagger-children">
        
        {/* Current Destination Card */}
        {currentDestination && (
          <div className="card p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-100 font-medium">Currently Active</span>
                </div>
                <MapPin className="w-6 h-6 text-blue-200" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {currentDestination.name}, {currentDestination.country}
              </h2>
              
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(currentDestination.startDate).toLocaleDateString()} - 
                    {new Date(currentDestination.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Card */}
          <WeatherCard 
            location={currentDestination ? `${currentDestination.name}, ${currentDestination.country}` : undefined}
            coordinates={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined}
          />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card p-4 text-center">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-500" />
            Quick Actions
          </h3>
          
          <div className="grid gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`card p-4 bg-gradient-to-r ${action.color} text-white hover:shadow-xl transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Upcoming Events
              {currentDestination && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  in {currentDestination.name}
                </span>
              )}
            </h3>
            {events.length > 0 && (
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
          
          {isLoadingEvents ? (
            <div className="card p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-medium text-slate-900 mb-2">No Events Found</h4>
              <p className="text-slate-600 text-sm">
                {currentDestination 
                  ? `No events found for ${currentDestination.name}. Check back later!`
                  : 'Add a destination to see upcoming events.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  showExternalLink={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          
          <div className="card p-6 space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'alert' ? 'bg-amber-500' :
                    activity.type === 'plan' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Tip of the Day */}
        <div className="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-2">Safety Tip of the Day</h4>
              <p className="text-emerald-800 leading-relaxed">
                Always keep digital copies of important documents stored securely in the cloud. 
                This ensures you can access them even if your physical documents are lost or stolen.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default HomePage;