import React, { createContext, useContext, useEffect, useState } from 'react';
import useGeolocation, { UserLocation, GeolocationError } from '../hooks/useGeolocation';

interface LocationContextType {
  userLocation: UserLocation | null;
  locationError: GeolocationError | null;
  isLocationLoading: boolean;
  isLocationSupported: boolean;
  isTracking: boolean;
  locationPermission: PermissionState | 'unknown';
  getCurrentLocation: () => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  clearLocationError: () => void;
  requestLocationPermission: () => Promise<PermissionState>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
  enableHighAccuracy?: boolean;
  trackingInterval?: number;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
  autoStart = false,
  enableHighAccuracy = true,
  trackingInterval = 30000, // 30 seconds
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<PermissionState | 'unknown'>('prompt');

  const {
    position: userLocation,
    error: locationError,
    isLoading: isLocationLoading,
    isSupported: isLocationSupported,
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError: clearLocationError,
  } = useGeolocation({
    enableHighAccuracy,
    timeout: 15000,
    maximumAge: trackingInterval,
    watch: isTracking,
    onLocationUpdate: (location) => {
      console.log('Location updated:', location);
      // Store location in localStorage for persistence
      localStorage.setItem('lastKnownLocation', JSON.stringify({
        ...location,
        savedAt: Date.now()
      }));
    },
    onError: (error) => {
      console.error('Geolocation error:', error);
      if (error.type === 'PERMISSION_DENIED') {
        setLocationPermission('denied');
      }
    },
  });

  // Check location permission status
  const checkLocationPermission = async (): Promise<PermissionState | 'unknown'> => {
    if (!navigator.permissions) {
      setLocationPermission('unknown');
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });
      
      return permission.state;
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
      setLocationPermission('unknown');
      return 'unknown';
    }
  };

  const requestLocationPermission = async (): Promise<PermissionState> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          resolve('granted');
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('denied');
            resolve('denied');
          } else {
            resolve('prompt');
          }
        },
        { timeout: 5000 }
      );
    });
  };

  const startLocationTracking = () => {
    if (!isLocationSupported) {
      console.warn('Geolocation is not supported');
      return;
    }
    
    setIsTracking(true);
    startWatching();
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    stopWatching();
  };

  // Load last known location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('lastKnownLocation');
    if (savedLocation && !userLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        const age = Date.now() - parsed.savedAt;
        // Use cached location if it's less than 10 minutes old
        if (age < 600000) {
          console.log('Using cached location:', parsed);
        }
      } catch (error) {
        console.warn('Could not parse saved location:', error);
        localStorage.removeItem('lastKnownLocation');
      }
    }
  }, [userLocation]);

  // Check permissions on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (autoStart && isLocationSupported && locationPermission === 'granted') {
      startLocationTracking();
    }
  }, [autoStart, isLocationSupported, locationPermission]);

  const contextValue: LocationContextType = {
    userLocation,
    locationError,
    isLocationLoading,
    isLocationSupported,
    isTracking,
    locationPermission,
    getCurrentLocation: getCurrentPosition,
    startLocationTracking,
    stopLocationTracking,
    clearLocationError,
    requestLocationPermission,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}; 