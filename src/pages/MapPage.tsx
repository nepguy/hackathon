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
      <div className="relative h-[calc(100vh-200px)] overflow-hidden rounded-lg">
        
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
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="font-bold">Location Error</p>
                  <p className="text-sm">{locationError.message}</p>
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
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleGetLocation}
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300
              ${locationError ? 'bg-red-500 hover:bg-red-600' : (isTracking && userLocation) ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
              text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white`}
            aria-label="Get my location"
          >
            {isTracking && !userLocation && !locationError ? (
              <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Navigation className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Bottom Layer Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-around p-2">
              {layerOptions.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg w-20 h-20 transition-all duration-200
                    ${
                      activeLayer === layer.id
                        ? `bg-${layer.color}-500 text-white shadow-lg scale-105`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="relative">
                    <layer.icon className="w-7 h-7" />
                    {layer.count > 0 && (
                      <div className="absolute top-0 right-0 -mr-1 -mt-1">
                        <span className={`flex items-center justify-center h-5 w-5 bg-${layer.color}-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-800`}>
                          {layer.count}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{layer.label}</span>
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