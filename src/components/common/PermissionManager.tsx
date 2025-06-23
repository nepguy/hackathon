import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Shield, AlertTriangle, Navigation, X } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

interface PermissionManagerProps {
  children?: React.ReactNode;
}

interface PermissionPromptContext {
  reason: 'app_startup' | 'returning_user' | 'accuracy_needed' | 'feature_request';
  feature: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  benefits: string[];
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ children }) => {
  const {
    locationPermission,
    requestLocationPermission,
    userLocation,
    getCurrentLocation
  } = useLocation();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [promptContext, setPromptContext] = useState<PermissionPromptContext | null>(null);
  const [hasShownStartupPrompt, setHasShownStartupPrompt] = useState(false);
  const [userSession, setUserSession] = useState({
    sessionStart: Date.now(),
    isReturningUser: false,
    lastLocationCheck: 0
  });

  // Check if user is returning (based on localStorage)
  useEffect(() => {
    const lastSession = localStorage.getItem('lastAppSession');
    const now = Date.now();
    
    if (lastSession) {
      const lastSessionTime = parseInt(lastSession);
      const timeDiff = now - lastSessionTime;
      
      // Consider returning user if last session was more than 30 minutes ago
      if (timeDiff > 30 * 60 * 1000) {
        setUserSession(prev => ({
          ...prev,
          isReturningUser: true
        }));
      }
    }
    
    // Update last session time
    localStorage.setItem('lastAppSession', now.toString());
    
    // Cleanup on unmount
    return () => {
      localStorage.setItem('lastAppSession', Date.now().toString());
    };
  }, []);

  // Determine if we should prompt for location based on context
  const shouldPromptForLocation = useCallback((context: PermissionPromptContext): boolean => {
    // Never prompt if already granted
    if (locationPermission === 'granted') return false;
    
    // Never prompt if explicitly denied (respect user choice)
    if (locationPermission === 'denied') return false;
    
    // Don't spam prompts - check timing
    const lastPrompt = localStorage.getItem('lastLocationPrompt');
    if (lastPrompt) {
      const timeSinceLastPrompt = Date.now() - parseInt(lastPrompt);
      // Don't prompt more than once every 2 hours
      if (timeSinceLastPrompt < 2 * 60 * 60 * 1000) return false;
    }
    
    // If we already have recent location data, be less aggressive with prompts
    if (userLocation) {
      const locationAge = Date.now() - userLocation.timestamp;
      // If location is less than 10 minutes old and accuracy is good, don't prompt for medium/low importance
      if (locationAge < 10 * 60 * 1000 && userLocation.accuracy < 100) {
        if (context.importance === 'medium' || context.importance === 'low') {
          return false;
        }
      }
    }
    
    // Context-based decision making
    switch (context.reason) {
      case 'app_startup':
        // Only prompt on startup if returning user and location is critical
        return userSession.isReturningUser && context.importance === 'critical';
      
      case 'returning_user':
        // Prompt returning users for high/critical features
        return context.importance === 'critical' || context.importance === 'high';
      
      case 'accuracy_needed':
        // Always prompt when accuracy is needed for core functionality
        return context.importance === 'critical';
      
      case 'feature_request':
        // Prompt when user actively tries to use location-dependent features
        return true;
      
      default:
        return false;
    }
  }, [locationPermission, userSession.isReturningUser, userLocation]);

  // Smart location prompting based on app context
  const requestLocationForContext = useCallback((context: PermissionPromptContext) => {
    if (shouldPromptForLocation(context)) {
      setPromptContext(context);
      setShowLocationPrompt(true);
      localStorage.setItem('lastLocationPrompt', Date.now().toString());
    }
  }, [shouldPromptForLocation]);

  // Handle location permission approval
  const handleLocationApproval = async () => {
    try {
      const permission = await requestLocationPermission();
      if (permission === 'granted') {
        // Get current location immediately after permission granted
        getCurrentLocation();
        setShowLocationPrompt(false);
        setPromptContext(null);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  // Handle prompt dismissal
  const handlePromptDismiss = () => {
    setShowLocationPrompt(false);
    setPromptContext(null);
    
    // Track dismissal to avoid being too pushy
    const dismissalCount = parseInt(localStorage.getItem('locationPromptDismissals') || '0');
    localStorage.setItem('locationPromptDismissals', (dismissalCount + 1).toString());
  };

  // Auto-check for location needs on app startup
  useEffect(() => {
    if (!hasShownStartupPrompt && locationPermission !== 'granted') {
      const timer = setTimeout(() => {
        // Prompt for location on startup for returning users
        if (userSession.isReturningUser) {
          requestLocationForContext({
            reason: 'returning_user',
            feature: 'Travel Safety Alerts',
            importance: 'critical',
            benefits: [
              'Real-time safety alerts for your current location',
              'Local weather and emergency updates',
              'Nearby events and travel information',
              'Enhanced scam detection based on location patterns'
            ]
          });
        }
        setHasShownStartupPrompt(true);
      }, 2000); // Give app time to load

      return () => clearTimeout(timer);
    }
  }, [hasShownStartupPrompt, locationPermission, userSession.isReturningUser, requestLocationForContext]);

  // Expose the permission request function globally
  useEffect(() => {
    // Make the function available globally for other components
    (window as any).requestLocationForContext = requestLocationForContext;
    
    return () => {
      delete (window as any).requestLocationForContext;
    };
  }, [requestLocationForContext]);

  // Render permission prompt modal
  const renderLocationPrompt = () => {
    if (!showLocationPrompt || !promptContext) return null;

    const getPromptTitle = () => {
      switch (promptContext.reason) {
        case 'app_startup':
        case 'returning_user':
          return 'Welcome back! Enable location for better travel safety';
        case 'accuracy_needed':
          return 'Location access needed for accurate information';
        case 'feature_request':
          return `Enable location for ${promptContext.feature}`;
        default:
          return 'Enable location access';
      }
    };

    const getPriorityColor = () => {
      switch (promptContext.importance) {
        case 'critical':
          return 'text-red-600 bg-red-50 border-red-200';
        case 'high':
          return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'medium':
          return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'low':
          return 'text-gray-600 bg-gray-50 border-gray-200';
        default:
          return 'text-blue-600 bg-blue-50 border-blue-200';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Location Access
              </h3>
            </div>
            <button
              onClick={handlePromptDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Priority indicator */}
          <div className={`mb-4 p-3 rounded-lg border ${getPriorityColor()}`}>
            <div className="flex items-center">
              {promptContext.importance === 'critical' ? (
                <AlertTriangle className="w-4 h-4 mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm font-medium">
                {promptContext.importance === 'critical' ? 'Critical for Safety' :
                 promptContext.importance === 'high' ? 'Highly Recommended' :
                 promptContext.importance === 'medium' ? 'Recommended' : 'Optional'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {getPromptTitle()}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Your travel safety app works best with location access. Here's how it helps:
            </p>
            
            {/* Benefits list */}
            <ul className="space-y-2">
              {promptContext.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <Navigation className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy note */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
              <div className="text-xs text-gray-600">
                <strong>Privacy Protected:</strong> Your location is only used to provide relevant safety information and is never shared with third parties.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleLocationApproval}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Allow Location Access
            </button>
            <button
              onClick={handlePromptDismiss}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center mt-3">
            You can change location permissions anytime in your browser settings or app profile.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {children}
      {renderLocationPrompt()}
    </>
  );
};

// Helper hook for other components to request location contextually
export const useLocationPermissionRequest = () => {
  const requestLocationForContext = (window as any).requestLocationForContext;
  
  return {
    requestLocationForContext: requestLocationForContext || (() => {
      console.warn('PermissionManager not available');
    })
  };
};

export default PermissionManager; 