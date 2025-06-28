import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, Shield, Info, CheckCircle, MapPin, 
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDestinations } from '../../contexts/UserDestinationContext';
import { useLocation } from '../../contexts/LocationContext';

interface SafetyAlert {
  id: string;
  type: 'safety' | 'weather' | 'transport' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  source: string;
}

const AgentAlerts: React.FC = () => {
  const { user } = useAuth();
  const { currentDestination } = useUserDestinations();
  const { userLocation } = useLocation();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get location context for safety data
  const getLocationContext = () => {
    if (currentDestination) {
      const parts = currentDestination.destination.split(',').map(p => p.trim());
      return {
        city: parts.length > 1 ? parts[0] : undefined,
        country: parts[parts.length - 1],
        coordinates: userLocation?.latitude ? {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        } : undefined
      };
    }
    return null;
  };

     const fetchLocationSafetyData = useCallback(async () => {
     const context = getLocationContext();
     if (!context || !user) return;

     setLoading(true);
     setError(null);

     try {
       console.log('🤖 Fetching AI safety data for:', context);
       
       // For now, create some mock alerts based on location
       // In the future, this could integrate with proper AI services
       const mockAlerts: SafetyAlert[] = [
         {
           id: `safety-alert-1`,
           type: 'safety' as const,
           severity: 'medium' as const,
           title: `General Safety Advisory`,
           description: `Be aware of common safety considerations in ${context.city || context.country}. Stay vigilant and follow local guidelines.`,
           location: context.city || context.country,
           timestamp: new Date().toISOString(),
           source: 'AI Safety Agent'
         },
         {
           id: `safety-alert-2`,
           type: 'transport' as const,
           severity: 'low' as const,
           title: `Transportation Safety`,
           description: `Use licensed transportation services and avoid traveling alone late at night in ${context.city || context.country}.`,
           location: context.city || context.country,
           timestamp: new Date().toISOString(),
           source: 'AI Safety Agent'
         }
       ];

       setAlerts(mockAlerts);
       console.log('✅ AI safety alerts loaded:', mockAlerts.length);
     } catch (err) {
       console.error('❌ Error fetching AI safety data:', err);
       setError('Failed to load AI safety data');
       setAlerts([]);
     } finally {
       setLoading(false);
     }
   }, [currentDestination, userLocation, user]);

  useEffect(() => {
    if (user && getLocationContext()) {
      fetchLocationSafetyData();
    }
  }, [user, fetchLocationSafetyData]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please login to view AI safety alerts</p>
      </div>
    );
  }

  if (!getLocationContext()) {
    return (
      <div className="card p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Add a destination to receive AI safety alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">AI Safety Alerts</h3>
        </div>
        <button
          onClick={fetchLocationSafetyData}
          disabled={loading}
          className="btn-ghost text-sm"
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="card p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h4>
          <p className="text-gray-600">
            No safety alerts for {getLocationContext()?.city || getLocationContext()?.country}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card p-4 border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {alert.location || 'Current Location'}
                    </span>
                    <span>{alert.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentAlerts; 