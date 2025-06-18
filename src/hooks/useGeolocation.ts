import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onLocationUpdate?: (position: UserLocation) => void;
  onError?: (error: GeolocationError) => void;
}

export interface UseGeolocationReturn {
  position: UserLocation | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  getCurrentPosition: () => void;
  startWatching: () => void;
  stopWatching: () => void;
  clearError: () => void;
}

const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    watch = false,
    onLocationUpdate,
    onError,
  } = options;

  const [position, setPosition] = useState<UserLocation | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const isSupported = 'geolocation' in navigator;

  const mapGeolocationError = (error: GeolocationPositionError): GeolocationError => {
    const errorTypes: Record<number, GeolocationError['type']> = {
      1: 'PERMISSION_DENIED',
      2: 'POSITION_UNAVAILABLE',
      3: 'TIMEOUT',
    };

    const messages: Record<number, string> = {
      1: 'Location access denied by user',
      2: 'Location information unavailable',
      3: 'Location request timed out',
    };

    return {
      code: error.code,
      message: messages[error.code] || 'Unknown geolocation error',
      type: errorTypes[error.code] || 'POSITION_UNAVAILABLE',
    };
  };

  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const newPosition: UserLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading || undefined,
        speed: pos.coords.speed || undefined,
        timestamp: pos.timestamp,
      };

      setPosition(newPosition);
      setError(null);
      setIsLoading(false);
      onLocationUpdate?.(newPosition);
    },
    [onLocationUpdate]
  );

  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      const mappedError = mapGeolocationError(error);
      setError(mappedError);
      setIsLoading(false);
      onError?.(mappedError);
    },
    [onError]
  );

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      const notSupportedError: GeolocationError = {
        code: -1,
        message: 'Geolocation is not supported by this browser',
        type: 'NOT_SUPPORTED',
      };
      setError(notSupportedError);
      onError?.(notSupportedError);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, onError]);

  const startWatching = useCallback(() => {
    if (!isSupported || watchId !== null) return;

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    setWatchId(id);
  }, [isSupported, watchId, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsLoading(false);
    }
  }, [watchId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-start watching if enabled
  useEffect(() => {
    if (watch && isSupported) {
      startWatching();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, isSupported, startWatching, watchId]);

  return {
    position,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError,
  };
};

export default useGeolocation; 