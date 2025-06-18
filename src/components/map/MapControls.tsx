import React from 'react';
import { 
  Layers, AlertTriangle, Cloud, CalendarCheck, 
  Wifi, Thermometer, MapPin, Navigation 
} from 'lucide-react';

interface MapControlsProps {
  onLayerChange: (layer: string) => void;
  activeLayer: string;
}

const MapControls: React.FC<MapControlsProps> = ({ onLayerChange, activeLayer }) => {
  const layers = [
    { id: 'alerts', label: 'Safety Alerts', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'weather', label: 'Weather', icon: Cloud, color: 'text-blue-600' },
    { id: 'events', label: 'Events', icon: CalendarCheck, color: 'text-green-600' },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi, color: 'text-purple-600' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-600' },
  ];

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
            <span className="text-sm font-medium text-gray-700">Map Tools</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
              title="Get my location"
            >
              <Navigation size={16} className="text-gray-700" />
            </button>
          </div>
        </div>
        
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