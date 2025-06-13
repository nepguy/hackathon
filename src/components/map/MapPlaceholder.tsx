import React from 'react';
import { MapPin, Layers, Navigation, Locate, AlertTriangle } from 'lucide-react';

const MapPlaceholder: React.FC = () => {
  return (
    <div className="relative h-[calc(100vh-160px)] w-full bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-100 to-primary-200 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-4 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Map</h3>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            View safety information, weather alerts, and points of interest on this interactive map.
          </p>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="bg-white p-2 rounded-md shadow-md">
          <Layers size={20} className="text-gray-700" />
        </button>
        <button className="bg-white p-2 rounded-md shadow-md">
          <Navigation size={20} className="text-gray-700" />
        </button>
        <button className="bg-white p-2 rounded-md shadow-md">
          <Locate size={20} className="text-gray-700" />
        </button>
      </div>
      
      {/* Alert Markers */}
      <div className="absolute top-1/4 left-1/3">
        <div className="relative">
          <AlertTriangle size={24} className="text-danger-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="absolute bottom-1/3 right-1/4">
        <div className="relative">
          <AlertTriangle size={24} className="text-accent-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;