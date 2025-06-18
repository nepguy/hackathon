import React from 'react';
import { 
  Layers, AlertTriangle, Cloud, CalendarCheck, 
  Wifi, Thermometer, MapPin, Navigation, 
  Play, Pause, RotateCcw 
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

interface MapControlsProps {
  onLayerChange: (layer: string) => void;
  activeLayer: string;
}

const MapControls: React.FC<MapControlsProps> = ({ onLayerChange, activeLayer }) => {
  const {
    userLocation,
    locationError,
    isLocationLoading,
    isLocationSupported,
    isTracking,
    locationPermission,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    clearLocationError,
    requestLocationPermission,
  } = useLocation();

  const layers = [
    { id: 'alerts', label: 'Safety Alerts', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'weather', label: 'Weather', icon: Cloud, color: 'text-blue-600' },
    { id: 'events', label: 'Events', icon: CalendarCheck, color: 'text-green-600' },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi, color: 'text-purple-600' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-600' },
  ];

  const handleLocationAction = async () => {
    if (locationPermission === 'denied') {
      alert('Location permission denied. Please enable location access in your browser settings.');
      return;
    }

    if (locationPermission === 'prompt') {
      const permission = await requestLocationPermission();
      if (permission === 'denied') {
        return;
      }
    }

    if (isTracking) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
  };

  const handleGetCurrentLocation = async () => {
    if (locationPermission === 'denied') {
      alert('Location permission denied. Please enable location access in your browser settings.');
      return;
    }

    if (locationPermission === 'prompt') {
      const permission = await requestLocationPermission();
      if (permission === 'denied') {
        return;
      }
    }

    getCurrentLocation();
  };

  return (
    <div className="p-4 bg-white">
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <Layers size={16} className="text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Map Layers</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeLayer === layer.id
                  ? 'bg-primary-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <layer.icon 
                size={18} 
                className={`mb-1 ${activeLayer === layer.id ? 'text-white' : layer.color}`} 
              />
              {layer.label}
            </button>
          ))}
        </div>
      </div>
      
              <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin size={16} className="text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Location Services</span>
          </div>
          <div className="flex items-center space-x-2">
            {isLocationSupported && (
              <>
                <button 
                  onClick={handleGetCurrentLocation}
                  disabled={isLocationLoading || locationPermission === 'denied'}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isLocationLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                  title="Get current location"
                >
                  <Navigation size={16} className={`${
                    isLocationLoading ? 'text-gray-500 animate-spin' : 'text-gray-700'
                  }`} />
                </button>
                <button 
                  onClick={handleLocationAction}
                  disabled={locationPermission === 'denied'}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isTracking
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'hover:bg-white hover:shadow-sm text-gray-700'
                  }`}
                  title={isTracking ? 'Stop location tracking' : 'Start location tracking'}
                >
                  {isTracking ? <Pause size={16} /> : <Play size={16} />}
                </button>
                {locationError && (
                  <button 
                    onClick={clearLocationError}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 text-red-600"
                    title="Clear location error"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Location Status */}
        {isLocationSupported && (
          <div className="mt-2">
            {userLocation && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
                <div className="flex items-center">
                  <Navigation size={12} className="mr-1" />
                  <span className="font-medium">Location: </span>
                  <span>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</span>
                </div>
                {userLocation.accuracy && (
                  <div className="mt-1">
                    <span className="font-medium">Accuracy: </span>
                    <span>{Math.round(userLocation.accuracy)}m</span>
                  </div>
                )}
              </div>
            )}
            
            {locationError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                <div className="flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  <span className="font-medium">Location Error: </span>
                  <span>{locationError.message}</span>
                </div>
              </div>
            )}
            
            {locationPermission === 'denied' && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                <div className="flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  <span className="font-medium">Permission Denied: </span>
                  <span>Enable location access in browser settings</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeLayer === 'alerts' && (
          <div className="mt-3 p-2 bg-white rounded border border-red-100">
            <div className="flex items-center text-xs text-red-600">
              <AlertTriangle size={12} className="mr-1" />
              <span className="font-medium">Safety Alerts Active</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Click on red markers to view detailed safety information
            </p>
          </div>
        )}
        
        {activeLayer === 'weather' && (
          <div className="mt-3 p-2 bg-white rounded border border-blue-100">
            <div className="flex items-center text-xs text-blue-600">
              <Cloud size={12} className="mr-1" />
              <span className="font-medium">Weather Layer Active</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Weather information will be displayed on the map
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapControls;