import React from 'react';
import { 
  Layers, AlertTriangle, Cloud, CalendarCheck, 
  Wifi, Thermometer, ZoomIn, ZoomOut 
} from 'lucide-react';

interface MapControlsProps {
  onLayerChange: (layer: string) => void;
  activeLayer: string;
}

const MapControls: React.FC<MapControlsProps> = ({ onLayerChange, activeLayer }) => {
  const layers = [
    { id: 'alerts', label: 'Safety Alerts', icon: AlertTriangle },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'events', label: 'Events', icon: CalendarCheck },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi },
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Map Layers</h3>
        <div className="flex flex-wrap gap-2">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                activeLayer === layer.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <layer.icon size={14} className="mr-1" />
              {layer.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-2 flex items-center justify-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <div className="h-6 border-r border-gray-200"></div>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <ZoomOut size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default MapControls;