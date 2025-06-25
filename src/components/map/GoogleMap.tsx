import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, AlertTriangle, Cloud, Navigation } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { TravelEvent } from '../../lib/eventsApi'; // Import TravelEvent

interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onMapClick?: (location: google.maps.LatLngLiteral) => void;
  activeLayer?: string;
  events?: TravelEvent[];
}

interface AlertMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  type: 'danger' | 'warning' | 'weather' | 'event';
  title: string;
  description: string;
}

// Global configuration for Google Maps with AdvancedMarkerElement support
const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry', 'marker'] as any, // Include marker library for AdvancedMarkerElement
  version: 'weekly' // Use weekly for latest features
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

// Create custom marker element using AdvancedMarkerElement best practices
const createAdvancedMarkerElement = (alert: AlertMarker): HTMLElement => {
  const markerElement = document.createElement('div');
  markerElement.className = `custom-marker marker-${alert.type}`;
  
  // Enhanced styling following Google's best practices
  markerElement.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    color: white;
    background: ${getMarkerBackground(alert.type)};
    cursor: pointer;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    z-index: 1;
  `;
  
  // Add hover effects
  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
    markerElement.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
  });
  
  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
    markerElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  });
  
  // Set appropriate icon
  markerElement.innerHTML = getMarkerIcon(alert.type);
  
  return markerElement;
};

// Get marker background based on type
const getMarkerBackground = (type: string): string => {
  switch (type) {
    case 'danger': return 'linear-gradient(135deg, #ef4444, #dc2626)';
    case 'weather': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
    case 'event': return 'linear-gradient(135deg, #4285f4, #2563eb)';
    default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }
};

// Get marker icon based on type
const getMarkerIcon = (type: string): string => {
  switch (type) {
    case 'danger': return '⚠️';
    case 'weather': return '🌧️';
    case 'warning': return '🚧';
    case 'event': return '📅';
    default: return '📍';
  }
};

// Create user location marker element
const createUserLocationMarkerElement = (): HTMLElement => {
  const markerElement = document.createElement('div');
  markerElement.className = 'user-location-marker';
  
  markerElement.style.cssText = `
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #4285f4 40%, rgba(66, 133, 244, 0.3) 70%);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    position: relative;
    animation: userLocationPulse 2s infinite;
  `;
  
  // Add CSS animation for pulse effect
  if (!document.getElementById('user-location-styles')) {
    const style = document.createElement('style');
    style.id = 'user-location-styles';
    style.textContent = `
      @keyframes userLocationPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  return markerElement;
};

// Create enhanced info window content
const createInfoWindowContent = (alert: AlertMarker): string => {
  return `
    <div class="advanced-info-window" style="
      padding: 16px;
      max-width: 280px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 12px;
      background: white;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    ">
      <div style="
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${getMarkerBackground(alert.type)};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 16px;
        ">
          ${getMarkerIcon(alert.type)}
        </div>
        <h3 style="
          font-weight: 600;
          font-size: 16px;
          margin: 0;
          color: #111827;
        ">${alert.title}</h3>
      </div>
      
      <p style="
        font-size: 14px;
        margin: 0 0 16px 0;
        color: #6b7280;
        line-height: 1.5;
      ">${alert.description}</p>
      
      <div style="
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        background: ${alert.type === 'danger' ? '#fef2f2' : alert.type === 'weather' ? '#eff6ff' : '#fffbeb'};
        color: ${alert.type === 'danger' ? '#991b1b' : alert.type === 'weather' ? '#1e40af' : '#92400e'};
        border: 1px solid ${alert.type === 'danger' ? '#fecaca' : alert.type === 'weather' ? '#bfdbfe' : '#fed7aa'};
      ">
        ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
      </div>
    </div>
  `;
};

const Map: React.FC<GoogleMapProps & { map: google.maps.Map | null; setMap: (map: google.maps.Map | null) => void }> = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 12,
  onMapClick,
  activeLayer,
  events,
  map,
  setMap
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { userLocation, isTracking } = useLocation();

  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  markersRef.current = markers;

  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  userMarkerRef.current = userMarker;

  const initializeMap = useCallback(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: 'DEMO_MAP_ID', // Use your Cloud-based Map ID
        // Enhanced map options for better UX
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false
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

  // Auto-center map on user location with improved accuracy handling
  useEffect(() => {
    if (map && userLocation && isTracking) {
      const userCenter = {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      };
      
      // Smoothly pan to user location
      map.panTo(userCenter);
      
      // Enhanced zoom level calculation based on accuracy
      if (userLocation.accuracy) {
        let accuracyZoom: number;
        if (userLocation.accuracy <= 10) accuracyZoom = 18;      // Very accurate
        else if (userLocation.accuracy <= 50) accuracyZoom = 16; // Good accuracy
        else if (userLocation.accuracy <= 100) accuracyZoom = 15; // Moderate accuracy
        else if (userLocation.accuracy <= 500) accuracyZoom = 13; // Low accuracy
        else accuracyZoom = 11; // Very low accuracy
        
        map.setZoom(accuracyZoom);
        console.log(`📍 Set zoom to ${accuracyZoom} based on accuracy: ${userLocation.accuracy}m`);
      }
    }
  }, [map, userLocation, isTracking]);

  // Create AdvancedMarkerElement markers with clustering
  const createAdvancedMarkers = useCallback(async () => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.map) marker.map = null;
    });
    
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    
    // Check if AdvancedMarkerElement is available
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
      console.error('AdvancedMarkerElement not available. Make sure to include the marker library.');
      return;
    }

    try {
      // Create markers using AdvancedMarkerElement
      for (const alert of mockAlerts) {
        const markerElement = createAdvancedMarkerElement(alert);
        
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: alert.position,
          map: map,
          content: markerElement,
          title: alert.title,
          // Enhanced collision behavior
          gmpClickable: true
        });

        // Improved zoom-based visibility with smooth transitions
        const updateMarkerVisibility = () => {
          const currentZoom = map.getZoom() || 12;
          const shouldShow = currentZoom >= 10;
          
          if (shouldShow && !marker.map) {
            marker.map = map;
            markerElement.style.opacity = '0';
            markerElement.style.transform = 'scale(0.5)';
            setTimeout(() => {
              markerElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              markerElement.style.opacity = '1';
              markerElement.style.transform = 'scale(1)';
            }, 50);
          } else if (!shouldShow && marker.map) {
            markerElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            markerElement.style.opacity = '0';
            markerElement.style.transform = 'scale(0.5)';
            setTimeout(() => {
              marker.map = null;
            }, 300);
          }
        };

        // Initial visibility check
        updateMarkerVisibility();

        // Listen to zoom changes
        map.addListener('zoom_changed', updateMarkerVisibility);

        // Create enhanced info window
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(alert),
          maxWidth: 320,
          pixelOffset: new google.maps.Size(0, -10)
        });

        // Add click listener
        marker.addListener('click', () => {
          // Close any open info windows
          markersRef.current.forEach(m => {
            if ((m as any).infoWindow) {
              (m as any).infoWindow.close();
            }
          });
          
          infoWindow.open({
            anchor: marker,
            map: map
          });
          
          // Store reference for cleanup
          (marker as any).infoWindow = infoWindow;
        });

        newMarkers.push(marker);
      }
      
      console.log(`✅ Created ${newMarkers.length} AdvancedMarkerElement markers`);
    } catch (error) {
      console.error('Error creating AdvancedMarkerElement markers:', error);
    }
    
    setMarkers(newMarkers);
  }, [map]);

  const createEventMarkers = useCallback(async () => {
    if (!map || !events) return;
    
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
      console.error('AdvancedMarkerElement not available.');
      return;
    }

    try {
      for (const event of events) {
        if (!event.location.coordinates.lat || !event.location.coordinates.lng) continue;

        const markerElement = createAdvancedMarkerElement({
          id: event.id,
          position: event.location.coordinates,
          type: 'event' as any, // Cast for now, can be a new type
          title: event.title,
          description: event.description,
        });
        
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: event.location.coordinates,
          map: map,
          content: markerElement,
          title: event.title,
          gmpClickable: true
        });

        newMarkers.push(marker);
      }
      console.log(`✅ Created ${newMarkers.length} Event markers`);
    } catch (error) {
      console.error('Error creating Event markers:', error);
    }
    
    setMarkers(newMarkers);
  }, [map, events]);

  // Update user location marker with AdvancedMarkerElement
  const updateUserLocationMarker = useCallback(async () => {
    if (!map || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
    }

    try {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        console.error('AdvancedMarkerElement not available for user location marker');
        return;
      }

      const markerElement = createUserLocationMarkerElement();
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map,
        content: markerElement,
        title: 'Your Current Location',
        gmpClickable: true,
        zIndex: 1000 // Ensure user marker is always on top
      });

      setUserMarker(marker);

      // Add accuracy circle if available and reasonable
      if (userLocation.accuracy && userLocation.accuracy < 1000) {
        new google.maps.Circle({
          strokeColor: '#4285f4',
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: '#4285f4',
          fillOpacity: 0.1,
          map: map,
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
          radius: userLocation.accuracy,
          clickable: false
        });
      }

      console.log(`📍 Updated user location marker with AdvancedMarkerElement`);
    } catch (error) {
      console.error('Error creating user location AdvancedMarkerElement:', error);
    }
  }, [map, userLocation]);

  // Initialize map
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Handle alert markers based on active layer
  useEffect(() => {
    // Always clear markers when layer changes
    markersRef.current.forEach(marker => {
      if (marker.map) marker.map = null;
    });
    setMarkers([]);

    if (map) {
      if (activeLayer === 'alerts') {
        createAdvancedMarkers();
      } else if (activeLayer === 'events') {
        createEventMarkers();
      }
    }
  }, [map, activeLayer, createAdvancedMarkers, createEventMarkers]);

  // Update user location marker
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