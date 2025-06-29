import React, { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useLocationPermission, showLocationPermissionDialog } from '../../hooks/useLocationPermission';
import { useLocation } from '../../contexts/LocationContext';

interface LocationPermissionGuardProps {
  children: React.ReactNode;
  requireLocation?: boolean;
  showPrompt?: boolean;
}

const LocationPermissionGuard: React.FC<LocationPermissionGuardProps> = ({
  children,
  requireLocation = false,
  showPrompt = true
}) => {
  const { hasPermission, requestPermission, error, position } = useLocationPermission();
  const { userLocation } = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Check if we should show location prompt
  useEffect(() => {
    // Don't show if we already have permission or position
    if (hasPermission || userLocation || position) {
      return;
    }

    // Don't show if we've already prompted in this session
    if (hasPrompted) {
      return;
    }

    // Don't show if user explicitly disabled prompts
    if (!showPrompt) {
      return;
    }

    // Show dialog after a short delay for better UX
    const timer = setTimeout(() => {
      setShowDialog(true);
      setHasPrompted(true);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [hasPermission, userLocation, position, hasPrompted, showPrompt]);

  const handleAcceptLocation = async () => {
    setShowDialog(false);
    try {
      const granted = await requestPermission();
      if (granted) {
        console.log('✅ Location permission granted');
      } else {
        console.log('❌ Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const handleDeclineLocation = () => {
    setShowDialog(false);
    console.log('📍 Location permission declined by user');
  };

  // If location is required and not available, show a blocking message
  if (requireLocation && !hasPermission && !userLocation && !position) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Location Access Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            This feature requires access to your location to provide personalized travel alerts and recommendations.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleAcceptLocation}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Enable Location Access
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {/* Location Permission Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Enable Location</h3>
                </div>
                
                <button
                  onClick={handleDeclineLocation}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Guard Nomand works best with location access to provide:
              </p>
              
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Real-time safety alerts for your area
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Local weather and travel conditions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Nearby events and attractions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Emergency location sharing
                </li>
              </ul>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeclineLocation}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Not Now
                </button>
                <button
                  onClick={handleAcceptLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationPermissionGuard;