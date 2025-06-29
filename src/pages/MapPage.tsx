import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, Cloud, Calendar, 
  Wifi, Thermometer, Navigation, X
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

  const layerOptions = useMemo(() => [
    { id: 'alerts', label: 'Safety', icon: AlertTriangle, count: 12, color: 'red' },
    { id: 'weather', label: 'Weather', icon: Cloud, count: 8, color: 'blue' },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length, color: 'purple' },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi, count: 25, color: 'green' },
    { id: 'temperature', label: 'Temp', icon: Thermometer, count: 1, color: 'orange' },
  ], [events.length]);

  return (
    <PageContainer 
      title="Interactive Map"
      subtitle="Visualize safety information and real-time data"
      padding={false}
    >
      <div className="relative h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] overflow-hidden rounded-lg">
        
        {/* Map Container */}
        <div className="absolute inset-0">
          <GoogleMapComponent 
            center={mapCenter}
            zoom={mapZoom}
            activeLayer={activeLayer}
            onMapClick={handleMapClick}
            events={events}
          />
        </div>

        {/* Location Error Toast */}
        {locationError && (
          <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-3 sm:px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="font-bold text-sm sm:text-base">Location Error</p>
                  <p className="text-xs sm:text-sm">{locationError.message}</p>
                </div>
                <button 
                  onClick={clearLocationError}
                  className="ml-4 p-1 rounded-full hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Location Button */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
            <button
            onClick={handleGetLocation}
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg transition-all duration-300
              ${locationError ? 'bg-red-500 hover:bg-red-600' : (isTracking && userLocation) ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
              text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white hover:scale-110`}
            aria-label="Get my location"
          >
            {isTracking && !userLocation && !locationError ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
        </div>

        {/* Layer Content Panel */}
        <div className="absolute bottom-20 sm:bottom-24 left-2 right-2 sm:left-4 sm:right-4 z-10 max-h-48 overflow-hidden">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                {(() => {
                  const activeLayerOption = layerOptions.find(l => l.id === activeLayer);
                  const IconComponent = activeLayerOption?.icon || AlertTriangle;
                  return (
                    <>
                      <IconComponent className="w-5 h-5 mr-2" />
                      {activeLayerOption?.label || 'Information'}
                    </>
                  );
                })()}
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeLayer === 'alerts' && (
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">High Crime Area</p>
                        <p className="text-xs text-red-600 dark:text-red-300">Avoid walking alone after dark</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Construction Zone</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">Expect delays and detours</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeLayer === 'weather' && (
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Cloud className="w-4 h-4 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Rain Expected</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">Bring an umbrella</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeLayer === 'events' && (
                  <div className="space-y-2">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{event.title}</p>
                                                     <p className="text-xs text-purple-600 dark:text-purple-300">
                             {typeof event.location === 'string' ? event.location : event.location?.address || 'Location not specified'}
                           </p>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events found in this area</p>
                      </div>
                    )}
                  </div>
                )}
                {activeLayer === 'connectivity' && (
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Wifi className="w-4 h-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Free WiFi Available</p>
                        <p className="text-xs text-green-600 dark:text-green-300">Strong signal strength</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeLayer === 'temperature' && (
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Thermometer className="w-4 h-4 text-orange-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Current Temperature</p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">22°C - Perfect for walking</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Layer Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-around p-1 sm:p-2">
              {layerOptions.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 p-1 sm:p-2 rounded-lg w-16 h-16 sm:w-20 sm:h-20 transition-all duration-200
                    ${
                    activeLayer === layer.id
                        ? `bg-${layer.color}-500 text-white shadow-lg scale-105`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="relative">
                    <layer.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                    {layer.count > 0 && (
                      <div className="absolute top-0 right-0 -mr-1 -mt-1">
                        <span className={`flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 bg-${layer.color}-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-800`}>
                          {layer.count}
                        </span>
                  </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium">{layer.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MapPage;