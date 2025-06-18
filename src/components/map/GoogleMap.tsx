import React, { useCallback, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, AlertTriangle, Cloud } from 'lucide-react';

interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onMapClick?: (location: google.maps.LatLngLiteral) => void;
  activeLayer?: string;
}

interface AlertMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  type: 'danger' | 'warning' | 'weather';
  title: string;
  description: string;
}

const mockAlerts: AlertMarker[] = [
  {
    id: '1',
    position: { lat: 40.7128, lng: -74.0060 },
    type: 'danger',
    title: 'Safety Alert',
    description: 'Avoid this area due to recent security incidents'
  },
  {
    id: '2',
    position: { lat: 40.7580, lng: -73.9855 },
    type: 'weather',
    title: 'Weather Warning',
    description: 'Heavy rain expected in this area'
  },
  {
    id: '3',
    position: { lat: 40.7505, lng: -73.9934 },
    type: 'warning',
    title: 'Construction Zone',
    description: 'Road construction may cause delays'
  }
];

const Map: React.FC<GoogleMapProps & { map: google.maps.Map | null; setMap: (map: google.maps.Map | null) => void }> = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 12,
  onMapClick,
  activeLayer,
  map,
  setMap
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const initializeMap = useCallback(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });
      
      setMap(newMap);
      
      if (onMapClick) {
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }
        });
      }
    }
  }, [center, zoom, onMapClick, map, setMap]);

  const createAlertMarkers = useCallback(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    
    mockAlerts.forEach(alert => {
      const icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: alert.type === 'danger' ? '#ef4444' : alert.type === 'weather' ? '#3b82f6' : '#f59e0b',
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      };

      const marker = new google.maps.Marker({
        position: alert.position,
        map: map,
        icon: icon,
        title: alert.title
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">${alert.title}</h3>
            <p class="text-xs text-gray-600 mt-1">${alert.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
  }, [map, markers]);

  React.useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  React.useEffect(() => {
    if (map && activeLayer === 'alerts') {
      createAlertMarkers();
    } else {
      // Clear markers when alerts layer is not active
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
    }
  }, [map, activeLayer, createAlertMarkers, markers]);

  return <div ref={ref} className="w-full h-full" />;
};

const GoogleMapComponent: React.FC<GoogleMapProps> = (props) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <MapPin size={48} className="mx-auto mb-4 text-primary-500 animate-pulse" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Map Failed to Load</h3>
              <p className="text-sm text-red-600">
                Please check your internet connection and try again.
              </p>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return <Map {...props} map={map} setMap={setMap} />;
    }
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-50 rounded-lg">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">API Key Missing</h3>
          <p className="text-sm text-yellow-600">
            Google Maps API key is not configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Wrapper
        apiKey={apiKey}
        render={render}
        libraries={['places', 'geometry']}
      />
    </div>
  );
};

export default GoogleMapComponent; 