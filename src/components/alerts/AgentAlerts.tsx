import React, { useState, useEffect, useCallback } from 'react';
import { Shield, MapPin, RefreshCw, AlertTriangle, Info, Clock, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { locationSafetyService } from '../../lib/locationSafetyService';
import type { SafetyAlert, UserLocation } from '../../lib/locationSafetyService';
import type { LocationSafetyData } from '../../lib/geminiAi';

interface AgentAlertsProps {
  searchLocation?: string;
}

interface LocationSafetyState {
  safetyData: LocationSafetyData | null;
  alerts: SafetyAlert[];
  safetyScore: {
    score: number;
    riskLevel: string;
    summary: string;
    location: string;
  } | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const AgentAlerts: React.FC<AgentAlertsProps> = () => {
  const { user } = useAuth();
  const { userLocation } = useLocation();
  const [locationSafety, setLocationSafety] = useState<LocationSafetyState>({
    safetyData: null,
    alerts: [],
    safetyScore: null,
    isLoading: false,
    lastUpdated: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{ city?: string; country?: string }>({});

  // Function to get location info from coordinates
  const getLocationInfo = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return {
        city: data.city || data.locality || undefined,
        country: data.countryName || 'Unknown'
      };
    } catch (error) {
      console.warn('Could not determine location info:', error);
      return { country: 'Unknown' };
    }
  };

  // Update user location in the safety service when location changes
  useEffect(() => {
    if (user && userLocation) {
      const updateLocationData = async () => {
        const info = await getLocationInfo(userLocation.latitude, userLocation.longitude);
        setLocationInfo(info);

        const location: UserLocation = {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          city: info.city,
          country: info.country || 'Unknown'
        };

        locationSafetyService.updateUserLocation(user.id, location);
        fetchLocationSafetyData();
      };

      updateLocationData();
    }
  }, [user, userLocation]);

  const fetchLocationSafetyData = async () => {
    if (!user) return;

    setLocationSafety(prev => ({ ...prev, isLoading: true }));

    try {
      // Fetch all location-based safety data in parallel
      const [safetyData, alerts, safetyScore] = await Promise.all([
        locationSafetyService.getUserLocationSafetyData(user.id),
        locationSafetyService.getUserLocationAlerts(user.id),
        locationSafetyService.getUserLocationSafetyScore(user.id)
      ]);

      setLocationSafety({
        safetyData,
        alerts,
        safetyScore,
        isLoading: false,
        lastUpdated: new Date()
      });

      console.log('🔄 Location safety data updated for user:', user.id);

    } catch (error) {
      console.error('❌ Error fetching location safety data:', error);
      setLocationSafety(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLocationSafetyData();
    setIsRefreshing(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    }
  };

  if (!user || !userLocation) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Location Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please enable location access to get personalized safety alerts for your area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Safety Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Location Safety Monitor
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{locationSafety.safetyScore?.location || 'Unknown Location'}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || locationSafety.isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${(isRefreshing || locationSafety.isLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Safety Score Display */}
        {locationSafety.safetyScore && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {locationSafety.safetyScore.score}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Safety Score</div>
            </div>
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(locationSafety.safetyScore.riskLevel)}`}>
                {locationSafety.safetyScore.riskLevel.toUpperCase()} RISK
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-900 dark:text-white">
                {locationSafety.safetyScore.summary}
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {locationSafety.lastUpdated && (
          <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {locationSafety.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Active Location Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Safety Alerts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current alerts and warnings for your location
          </p>
        </div>

        <div className="p-6">
          {locationSafety.isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading safety alerts...</p>
            </div>
          ) : locationSafety.alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Active Alerts
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                No immediate safety concerns detected for your current location.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {locationSafety.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 p-4 rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                            {alert.type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {alert.description}
                      </p>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                        <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                          Recommended Action:
                        </h5>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          {alert.actionRequired}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>Source: {alert.source}</span>
                        {alert.affectedAreas.length > 0 && (
                          <span>Areas: {alert.affectedAreas.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Common Scams Section */}
      {locationSafety.safetyData?.commonScams && locationSafety.safetyData.commonScams.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Common Scams in Your Area
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Be aware of these common tourist scams and fraud attempts
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationSafety.safetyData.commonScams.map((scam, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <span className="text-sm text-gray-900 dark:text-white">{scam}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Information */}
      {locationSafety.safetyData?.emergencyNumbers && locationSafety.safetyData.emergencyNumbers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Emergency Contacts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Important numbers for your current location
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationSafety.safetyData.emergencyNumbers.map((contact, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{contact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 