import { useState, useEffect, useCallback } from 'react';

export interface LocationPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<boolean>;
}

const PERMISSION_STORAGE_KEY = 'guardnomad_location_permission';
const POSITION_STORAGE_KEY = 'guardnomad_last_position';
const POSITION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useLocationPermission = (): LocationPermissionState => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  // Check if we have cached permission status
  const getCachedPermissionStatus = useCallback((): boolean => {
    try {
      const cached = localStorage.getItem(PERMISSION_STORAGE_KEY);
      return cached === 'granted';
    } catch {
      return false;
    }
  }, []);

  // Cache permission status
  const setCachedPermissionStatus = useCallback((granted: boolean): void => {
    try {
      localStorage.setItem(PERMISSION_STORAGE_KEY, granted ? 'granted' : 'denied');
    } catch (error) {
      console.warn('Failed to cache permission status:', error);
    }
  }, []);

  // Get cached position if still valid
  const getCachedPosition = useCallback((): GeolocationPosition | null => {
    try {
      const cached = localStorage.getItem(POSITION_STORAGE_KEY);
      if (!cached) return null;

      const { position: cachedPos, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (within 5 minutes)
      if (now - timestamp < POSITION_CACHE_DURATION) {
        return cachedPos;
      }
    } catch (error) {
      console.warn('Failed to get cached position:', error);
    }
    return null;
  }, []);

  // Cache position
  const setCachedPosition = useCallback((pos: GeolocationPosition): void => {
    try {
      const cacheData = {
        position: pos,
        timestamp: Date.now()
      };
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache position:', error);
    }
  }, []);

  // Check current permission status
  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Check if we have browser permission API
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        const granted = result.state === 'granted';
        setHasPermission(granted);
        setCachedPermissionStatus(granted);
        
        if (granted) {
          // Try to get cached position first
          const cached = getCachedPosition();
          if (cached) {
            setPosition(cached);
            setError(null);
            return true;
          }
        }
        
        return granted;
      } else {
        // Fallback: check cached status
        const cached = getCachedPermissionStatus();
        setHasPermission(cached);
        
        if (cached) {
          const cachedPos = getCachedPosition();
          if (cachedPos) {
            setPosition(cachedPos);
            setError(null);
          }
        }
        
        return cached;
      }
    } catch (error) {
      console.warn('Error checking geolocation permission:', error);
      setError('Failed to check location permission');
      return false;
    }
  }, [getCachedPermissionStatus, getCachedPosition, setCachedPermissionStatus]);

  // Request location permission and get current position
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      setPosition(position);
      setHasPermission(true);
      setCachedPermissionStatus(true);
      setCachedPosition(position);
      setError(null);
      
      console.log('✅ Location permission granted and position obtained');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to get your location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services in your browser settings.';
          setCachedPermissionStatus(false);
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your GPS/network connection.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = `Location error: ${error.message || 'Unknown error'}`;
          break;
      }

      setError(errorMessage);
      setHasPermission(false);
      console.warn('❌ Location permission denied or failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setCachedPermissionStatus, setCachedPosition]);

  // Watch position changes (optional - for real-time tracking)

  // Initialize permission check on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    isLoading,
    error,
    position,
    requestPermission,
    checkPermission
  };
};

// Utility function to show location permission dialog
export const showLocationPermissionDialog = (
  onAccept: () => void,
  onDecline: () => void
): void => {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
      <div class="flex items-center mb-4">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Enable Location Access</h3>
      </div>
      
      <p class="text-gray-600 mb-6">
        Guard Nomand needs access to your location to provide:
      </p>
      
      <ul class="text-sm text-gray-600 mb-6 space-y-2">
        <li class="flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Local safety alerts and travel warnings
        </li>
        <li class="flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Real-time weather updates
        </li>
        <li class="flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Nearby events and attractions
        </li>
        <li class="flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Emergency location sharing
        </li>
      </ul>
      
      <div class="flex space-x-3">
        <button id="decline-location" class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Not Now
        </button>
        <button id="accept-location" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Enable Location
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  const acceptBtn = dialog.querySelector('#accept-location');
  const declineBtn = dialog.querySelector('#decline-location');

  const cleanup = () => {
    document.body.removeChild(dialog);
  };

  acceptBtn?.addEventListener('click', () => {
    cleanup();
    onAccept();
  });

  declineBtn?.addEventListener('click', () => {
    cleanup();
    onDecline();
  });

  // Close on backdrop click
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      cleanup();
      onDecline();
    }
  });
}; 