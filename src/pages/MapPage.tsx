import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import GoogleMapComponent from '../components/map/GoogleMap';
import MapControls from '../components/map/MapControls';
import { 
  Layers, Navigation, Locate, Zap, 
  AlertTriangle, Cloud, Calendar, Wifi, Thermometer, MapPin
} from 'lucide-react';

const MapPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('alerts');
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapZoom, setMapZoom] = useState(12);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');
  
  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const handleMapClick = (location: google.maps.LatLngLiteral) => {
    console.log('Map clicked at:', location);
  };

  const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied. Please enable location permissions in your browser settings.";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Please try again.";
      case error.TIMEOUT:
        return "Location request timed out. Please try again.";
      default:
        return "An unknown error occurred while retrieving your location.";
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setMapZoom(16);
        setLocationStatus('success');
        console.log('Location found:', position.coords);
      },
      (error) => {
        const errorMessage = getLocationErrorMessage(error);
        setLocationError(errorMessage);
        setLocationStatus('error');
        console.error('Geolocation error:', error);
        
        // Show user-friendly notification
        if (error.code === error.PERMISSION_DENIED) {
          // Suggest manual location entry or browser settings
          setTimeout(() => {
            if (confirm('Location access was denied. Would you like to manually enter your location or enable location permissions?')) {
              // Could open a location search modal here
              console.log('User wants to manually enter location');
            }
          }, 1000);
        }
      },
      options
    );
  };

  const layerStats = {
    alerts: { count: 12, active: 3 },
    weather: { count: 8, active: 2 },
    events: { count: 15, active: 5 },
    connectivity: { count: 25, active: 20 },
    temperature: { count: 1, active: 1 }
  };

  const getLocationButtonContent = () => {
    switch (locationStatus) {
      case 'loading':
        return (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Finding...</span>
          </>
        );
      case 'success':
        return (
          <>
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Located</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Try Again</span>
          </>
        );
      default:
        return (
          <>
            <Locate className="w-5 h-5" />
            <span className="font-medium">My Location</span>
          </>
        );
    }
  };

  const quickActions = [
    { 
      label: 'My Location', 
      icon: Locate, 
      action: handleGetLocation,
      color: locationStatus === 'error' ? 'from-red-500 to-red-600' : 
             locationStatus === 'success' ? 'from-green-500 to-emerald-500' :
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
        {locationStatus === 'error' && locationError && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Location Error</p>
                  <p className="text-xs mt-1">{locationError}</p>
                </div>
                <button 
                  onClick={() => setLocationStatus('idle')}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {locationStatus === 'success' && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <p className="font-medium text-sm">Location found successfully!</p>
                <button 
                  onClick={() => setLocationStatus('idle')}
                  className="ml-2 text-green-400 hover:text-green-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls - Top Left */}
        <div className="absolute top-6 left-6 space-y-3 z-10">
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
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={index === 0 && locationStatus === 'loading'}
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
        </div>

        {/* Floating Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <div className="glass p-3 rounded-xl">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Navigation className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

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