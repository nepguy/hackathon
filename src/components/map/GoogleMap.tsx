import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, AlertTriangle, Cloud, Navigation } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

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

// Global configuration to ensure consistent library loading
const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'] as any, // Type assertion to fix library type issue
  version: 'weekly' // Use stable version instead of beta
};

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

// Create custom marker element using standard HTML/CSS
const createMarkerElement = (alert: AlertMarker) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.style.cssText = `
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: white;
    background-color: ${alert.type === 'danger' ? '#ef4444' : alert.type === 'weather' ? '#3b82f6' : '#f59e0b'};
    cursor: pointer;
    position: relative;
    z-index: 1;
  `;
  markerElement.innerHTML = alert.type === 'danger' ? '⚠' : alert.type === 'weather' ? '🌧' : '🚧';
  return markerElement;
};

const createUserMarkerElement = () => {
  const markerElement = document.createElement('div');
  markerElement.className = 'user-marker';
  markerElement.style.cssText = `
    width: 16px;
    height: 16px;
    background-color: #4285f4;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  `;
  return markerElement;
};

const Map: React.FC<GoogleMapProps & { map: google.maps.Map | null; setMap: (map: google.maps.Map | null) => void }> = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 12,
  onMapClick,
  activeLayer,
  map,
  setMap
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { userLocation, isTracking } = useLocation();

  const initializeMap = useCallback(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
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

  const createAlertMarkers = useCallback(async () => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.map) marker.map = null;
    });
    
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    
    // Check if AdvancedMarkerElement is available
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      // Use modern AdvancedMarkerElement
      for (const alert of mockAlerts) {
        try {
          const markerElement = createMarkerElement(alert);
          
          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: alert.position,
            map: map,
            content: markerElement,
            title: alert.title
          });

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 200px;">
                <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 8px 0; color: #111827;">${alert.title}</h3>
                <p style="font-size: 12px; margin: 0 0 8px 0; color: #6b7280;">${alert.description}</p>
                <div style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; display: inline-block; ${
                  alert.type === 'danger' ? 'background-color: #fef2f2; color: #991b1b;' :
                  alert.type === 'weather' ? 'background-color: #eff6ff; color: #1e40af;' :
                  'background-color: #fffbeb; color: #92400e;'
                }">
                  ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        } catch (error) {
          console.error('Error creating advanced marker:', error);
          // Fall back to legacy markers
          createLegacyMarkers();
          return;
        }
      }
    } else {
      // Fall back to legacy markers
      createLegacyMarkers();
      return;
    }
    
    setMarkers(newMarkers);
  }, [map]);

  // Fallback to legacy markers
  const createLegacyMarkers = useCallback(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.map) marker.map = null;
    });
    
    const newMarkers: any[] = [];
    
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
          <div style="padding: 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${alert.title}</h3>
            <p style="font-size: 12px; margin: 0; color: #6b7280;">${alert.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers as any);
  }, [map]);

  // Update user location marker
  const updateUserLocationMarker = useCallback(async () => {
    if (!map || !userLocation) return;

    // Remove existing user marker
    if (userMarker) {
      userMarker.map = null;
    }

    try {
      // Try to use AdvancedMarkerElement if available
      if (window.google?.maps?.marker?.AdvancedMarkerElement) {
        const markerElement = createUserMarkerElement();
        
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: map,
          content: markerElement,
          title: 'Your Location'
        });

        setUserMarker(marker);
      } else {
        // Fallback to legacy marker
        const marker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285f4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          },
          title: 'Your Location',
        });

        setUserMarker(marker as any);
      }

      // Add accuracy circle if available
      if (userLocation.accuracy && userLocation.accuracy < 1000) {
        new google.maps.Circle({
          strokeColor: '#4285f4',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#4285f4',
          fillOpacity: 0.15,
          map: map,
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
          radius: userLocation.accuracy
        });
      }
    } catch (error) {
      console.error('Error creating user location marker:', error);
    }
  }, [map, userLocation]);

  // Initialize map - only run once
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Handle alert markers - only when layer changes
  useEffect(() => {
    if (map && activeLayer === 'alerts') {
      createAlertMarkers();
    } else if (map) {
      // Clear markers when alerts layer is not active
      markers.forEach(marker => {
        if (marker.map) marker.map = null;
      });
      setMarkers([]);
    }
  }, [map, activeLayer, createAlertMarkers]);

  // Update user location marker when location changes
  useEffect(() => {
    if (userLocation && isTracking) {
      updateUserLocationMarker();
    }
  }, [userLocation, isTracking, updateUserLocationMarker]);

  return <div ref={ref} className="w-full h-full" />;
};

const GoogleMapComponent: React.FC<GoogleMapProps> = (props) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MapPin size={32} className="text-blue-500 animate-pulse" />
                <Navigation size={32} className="text-emerald-500 animate-bounce" />
                <Cloud size={32} className="text-sky-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading interactive map with location services...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Map Failed to Load</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                Please check your internet connection and try again.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return <Map {...props} map={map} setMap={setMap} />;
    }
  };

  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">API Key Missing</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-300 mb-4">
            Google Maps API key is not configured.
          </p>
          <p className="text-xs text-yellow-500">
            Add VITE_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Wrapper
        apiKey={GOOGLE_MAPS_CONFIG.apiKey}
        render={render}
        libraries={GOOGLE_MAPS_CONFIG.libraries}
        version={GOOGLE_MAPS_CONFIG.version}
      />
    </div>
  );
};

export default GoogleMapComponent; 