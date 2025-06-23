import React, { useState, useEffect } from 'react';
import { 
  MapPin, Layers, Zap, AlertTriangle, Cloud, Calendar, 
  Wifi, Thermometer, Locate, Navigation
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import GoogleMapComponent from '../components/map/GoogleMap';
import { useLocation } from '../contexts/LocationContext';
import { eventsService, TravelEvent } from '../lib/eventsApi';

const MapPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('alerts');
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapZoom, setMapZoom] = useState(12);
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  // Use LocationContext instead of manual geolocation
  const { 
    userLocation, 
    isTracking, 
    locationPermission, 
    requestLocationPermission, 
    startLocationTracking,
    locationError,
    clearLocationError
  } = useLocation();
  
  // Enhanced useEffect with better dependency tracking
  useEffect(() => {
    console.log('🔄 Events fetch triggered by dependency change');
    fetchEvents();
  }, [userLocation?.latitude, userLocation?.longitude, locationPermission, isTracking]);

  // Fetch events for map display
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    console.log('🎪 Fetching events for map display...');
    
    try {
      let eventsData;
      
      if (userLocation?.latitude && userLocation?.longitude) {
        console.log(`📍 Fetching events for map location: ${userLocation.latitude}, ${userLocation.longitude}`);
        eventsData = await eventsService.getEventsNearLocation(
          userLocation.latitude, 
          userLocation.longitude, 
          25 // 25km radius for map view
        );
      } else {
        console.log('🌎 Using default location for map events');
        eventsData = await eventsService.getTravelEvents('New York, NY');
      }
      
      if (eventsData && eventsData.events) {
        setEvents(eventsData.events.slice(0, 10)); // Show up to 10 events on map
        console.log(`✅ Loaded ${eventsData.events.length} events for map display`);
      } else {
        setEvents([]);
        console.log('⚠️ No events found for map display');
      }
    } catch (error) {
      console.error('❌ Error fetching events for map:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  // Auto-center map when user location is available
  useEffect(() => {
    if (userLocation && isTracking) {
      console.log('📍 Updating map center to user location:', userLocation);
      
      setMapCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude
      });
      
      // Enhanced zoom logic based on location accuracy
      let zoomLevel = 12; // Default zoom
      
      if (userLocation.accuracy) {
        // More precise zoom levels based on accuracy
        if (userLocation.accuracy <= 10) {
          zoomLevel = 18; // Very accurate - street level
        } else if (userLocation.accuracy <= 25) {
          zoomLevel = 17; // Accurate - building level
        } else if (userLocation.accuracy <= 50) {
          zoomLevel = 16; // Good - neighborhood level
        } else if (userLocation.accuracy <= 100) {
          zoomLevel = 15; // Fair - area level
        } else if (userLocation.accuracy <= 200) {
          zoomLevel = 14; // Poor - district level
        } else if (userLocation.accuracy <= 500) {
          zoomLevel = 13; // Very poor - city area
        } else if (userLocation.accuracy <= 1000) {
          zoomLevel = 12; // Bad - city level
        } else {
          zoomLevel = 11; // Very bad - regional level
        }
      }
      
      console.log(`🔍 Setting zoom level to ${zoomLevel} (accuracy: ${userLocation.accuracy}m)`);
      setMapZoom(zoomLevel);
    }
  }, [userLocation, isTracking]);
  
  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const handleMapClick = (location: google.maps.LatLngLiteral) => {
    console.log('Map clicked at:', location);
  };

  const handleGetLocation = async () => {
    console.log('🎯 User requested location access');
    
    if (locationPermission !== 'granted') {
      console.log('📋 Requesting location permission...');
      const permission = await requestLocationPermission();
      console.log('📋 Permission result:', permission);
    }
    
    if (!isTracking) {
      console.log('🚀 Starting location tracking...');
      startLocationTracking();
    } else {
      console.log('✅ Location tracking already active');
      // Force a fresh location update
      if (userLocation) {
        setMapCenter({
          lat: userLocation.latitude,
          lng: userLocation.longitude
        });
        setMapZoom(16); // Zoom in for better view
      }
    }
  };

  const layerStats = {
    alerts: { count: 12, active: 3 },
    weather: { count: 8, active: 2 },
    events: { count: 15, active: 5 },
    connectivity: { count: 25, active: 20 },
    temperature: { count: 1, active: 1 }
  };

  const getLocationButtonContent = () => {
    if (locationError) {
      return (
        <>
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Try Again</span>
        </>
      );
    }
    
    if (userLocation && isTracking) {
      return (
        <>
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Located</span>
        </>
      );
    }
    
    return (
      <>
        <Locate className="w-5 h-5" />
        <span className="font-medium">My Location</span>
      </>
    );
  };

  const quickActions = [
    { 
      label: 'My Location', 
      icon: Locate, 
      action: handleGetLocation,
      color: locationError ? 'from-red-500 to-red-600' : 
             (userLocation && isTracking) ? 'from-green-500 to-emerald-500' :
             'from-blue-500 to-indigo-500',
      content: getLocationButtonContent()
    },
    { 
      label: 'Safety Zones', 
      icon: AlertTriangle, 
      action: () => setActiveLayer('alerts'),
      color: 'from-red-500 to-orange-500'
    },
    { 
      label: 'Weather', 
      icon: Cloud, 
      action: () => setActiveLayer('weather'),
      color: 'from-sky-500 to-blue-500'
    },
  ];

  return (
    <PageContainer 
      title="Interactive Map"
      subtitle="Visualize safety information and real-time data"
      padding={false}
    >
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        
        {/* Map Container */}
        <div className="absolute inset-0">
          <GoogleMapComponent 
            center={mapCenter}
            zoom={mapZoom}
            activeLayer={activeLayer}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Location Error Toast */}
        {locationError && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Location Error</p>
                  <p className="text-xs mt-1">{locationError.message}</p>
                </div>
                <button 
                  onClick={() => {
                    clearLocationError();
                  }}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls - Top Left */}
        <div className="absolute top-6 left-6 z-10 flex flex-col space-y-3">
          {/* Layer Stats */}
          <div className="glass p-4 rounded-2xl">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Active Layer</span>
            </div>
            <div className="text-sm text-slate-600 capitalize">
              {activeLayer} • {layerStats[activeLayer as keyof typeof layerStats]?.active} active
            </div>
          </div>

          {/* Quick Actions */}
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={index === 0 && !!locationError}
              className={`glass p-3 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              {index === 0 ? action.content : (
                <>
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Floating Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <div className="glass p-3 rounded-xl">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Navigation className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Events Panel - Right Side (when events layer is active) */}
        {activeLayer === 'events' && (
          <div className="absolute top-6 right-20 z-10 w-80 max-h-96 overflow-hidden">
            <div className="kit-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Local Events
                </h3>
                {isLoadingEvents && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <h4 className="font-medium text-green-900 text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-green-700 mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-xs text-green-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{event.location.name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-600">
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        {event.isFree && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {isLoadingEvents ? 'Loading events...' : 'No events found nearby'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Layer Selection - Bottom */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="glass p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-slate-900">Map Layers</span>
              </div>
              <div className="text-sm text-slate-600">
                Click to toggle layers
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {[
                { id: 'alerts', label: 'Safety', icon: AlertTriangle, color: 'text-red-600' },
                { id: 'weather', label: 'Weather', icon: Cloud, color: 'text-blue-600' },
                { id: 'events', label: 'Events', icon: Calendar, color: 'text-green-600' },
                { id: 'connectivity', label: 'WiFi', icon: Wifi, color: 'text-purple-600' },
                { id: 'temperature', label: 'Temp', icon: Thermometer, color: 'text-orange-600' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`p-3 rounded-xl text-center transition-all duration-300 ${
                    activeLayer === layer.id
                      ? 'bg-white shadow-lg scale-105'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <layer.icon 
                    className={`w-6 h-6 mx-auto mb-1 ${
                      activeLayer === layer.id ? layer.color : 'text-slate-500'
                    }`} 
                  />
                  <div className={`text-xs font-medium ${
                    activeLayer === layer.id ? 'text-slate-900' : 'text-slate-600'
                  }`}>
                    {layer.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {layerStats[layer.id as keyof typeof layerStats]?.count || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        {activeLayer === 'alerts' && (
          <div className="absolute bottom-32 right-6 z-10">
            <div className="glass p-4 rounded-xl">
              <h4 className="font-medium text-slate-900 mb-3">Safety Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-700">High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-700">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700">Information</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default MapPage;