import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Globe, RefreshCw, Wifi, WifiOff, ExternalLink, Sparkles } from 'lucide-react';
import { saverTravelAlertService, SaverApiResponse, SaverAlert } from '../../lib/travelAlertApi';
import { addConnectionListener, subscribeSafetyAlerts, fetchSafetyAlerts } from '../../lib/supabase';
import { geminiAiService } from '../../lib/geminiAi';

interface AgentAlertsProps {
  searchLocation?: string;
}

interface ConnectionStatus {
  saver: 'online' | 'offline' | 'loading';
  supabase: 'online' | 'offline' | 'loading';
}

interface EnhancedAlert {
  id: string;
  content: string;
  isLoading: boolean;
}

export const AgentAlerts: React.FC<AgentAlertsProps> = () => {
  const [saverAlerts, setSaverAlerts] = useState<SaverApiResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    saver: 'loading',
    supabase: 'loading'
  });
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [enhancedAlerts, setEnhancedAlerts] = useState<Record<string, EnhancedAlert>>({});

  // Check connection status and set up realtime monitoring
  useEffect(() => {
    checkConnections();
    
    // Set up Supabase realtime connection monitoring
    const removeConnectionListener = addConnectionListener((connected) => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        supabase: connected ? 'online' : 'offline' 
      }));
    });
    
    // Subscribe to safety alerts realtime updates
    const unsubscribeSafetyAlerts = subscribeSafetyAlerts((alerts) => {
      setSafetyAlerts(alerts);
    });
    
    // Initial fetch of safety alerts
    fetchSafetyAlerts().then(setSafetyAlerts);
    
    return () => {
      removeConnectionListener();
      unsubscribeSafetyAlerts();
    };
  }, []);

  const handleGenerateEnhancedAlert = useCallback(async (alert: SaverAlert) => {
    const alertId = alert.id;
    
    setEnhancedAlerts(prev => ({
      ...prev,
      [alertId]: { id: alertId, content: '', isLoading: true }
    }));

    const promptData = {
      headline: alert.title,
      country_name: alert.location,
      details: alert.message,
      advice: 'Stay informed and follow local guidance.' // Placeholder as 'advice' is not in SaverAlert
    };

    try {
      const enhancedContent = await geminiAiService.generateEnhancedAlert(promptData);
      setEnhancedAlerts(prev => ({
        ...prev,
        [alertId]: { id: alertId, content: enhancedContent, isLoading: false }
      }));
    } catch (error) {
      console.error('Failed to generate enhanced alert:', error);
      setEnhancedAlerts(prev => ({
        ...prev,
        [alertId]: { id: alertId, content: 'Error generating analysis.', isLoading: false }
      }));
    }
  }, []);

  const checkConnections = async () => {
    // Check Saver system status only
    try {
      const status = await saverTravelAlertService.getSystemStatus();
      setSystemStatus(status);
      setConnectionStatus(prev => ({ 
        ...prev, 
        saver: status.status 
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        saver: 'offline' 
      }));
    }
    
    // Supabase connection is now monitored via realtime listeners
    // No need to poll the database
  };

  const fetchSaverAlerts = async (location?: string) => {
    setIsRefreshing(true);
    try {
      let response: SaverApiResponse;
      
      if (location) {
        response = await saverTravelAlertService.getLocationAlerts(location);
      } else {
        // Get general alerts from database
        response = await saverTravelAlertService.queryDatabase();
      }
      
      setSaverAlerts(response);
    } catch (error) {
      console.error('Error fetching Saver alerts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation.trim()) {
      fetchSaverAlerts(selectedLocation.trim());
    }
  };

  const handleScrapeGovernmentData = async (country: string, source: string) => {
    setIsRefreshing(true);
    try {
      await saverTravelAlertService.scrapeGovernmentSource(country, source);
      // Refresh alerts after scraping
      if (selectedLocation) {
        await fetchSaverAlerts(selectedLocation);
      }
    } catch (error) {
      console.error('Error scraping government data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🛡️ Saver Travel Alert System
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time alerts from government and official sources
            </p>
          </div>
        </div>
        
        <button
          onClick={checkConnections}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Saver System</span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus.saver === 'online' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                connectionStatus.saver === 'online' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.saver}
              </span>
            </div>
          </div>
          {systemStatus && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>Total Alerts: <span className="font-medium">{systemStatus.totalAlerts}</span></div>
              <div>High Severity: <span className="font-medium text-red-600">{systemStatus.highSeverity}</span></div>
              <div>Active Locations: <span className="font-medium">{systemStatus.activeLocations}</span></div>
              <div>Last Update: <span className="font-medium">{new Date(systemStatus.lastUpdate).toLocaleTimeString()}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Supabase Database</span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus.supabase === 'online' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                connectionStatus.supabase === 'online' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.supabase}
              </span>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Real-time updates and data synchronization
          </div>
        </div>
      </div>

      {/* Location Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Search Travel Alerts</h3>
        <form onSubmit={handleLocationSubmit} className="flex space-x-4">
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            placeholder="Enter location (e.g., Thailand, Paris, New York)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isRefreshing || !selectedLocation.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Search Alerts
          </button>
        </form>
      </div>

      {/* Government Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Government Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { country: 'Thailand', flag: '🇹🇭', sources: ['US State Dept', 'UK Gov', 'US Embassy', 'Smartraveller', 'Canada Travel'] },
            { country: 'France', flag: '🇫🇷', sources: ['US State Dept', 'UK Gov', 'EU Travel'] },
            { country: 'Spain', flag: '🇪🇸', sources: ['US State Dept', 'UK Gov', 'EU Travel'] },
            { country: 'Italy', flag: '🇮🇹', sources: ['US State Dept', 'UK Gov', 'EU Travel'] },
            { country: 'Germany', flag: '🇩🇪', sources: ['US State Dept', 'UK Gov', 'EU Travel'] }
          ].map((country) => (
            <div key={country.country} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">{country.flag}</span>
                <span className="font-medium">{country.country}</span>
              </div>
              <div className="space-y-2">
                {country.sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => handleScrapeGovernmentData(country.country, source)}
                    disabled={isRefreshing}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Safety Alerts from Database */}
      {safetyAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              🔄 Real-time Safety Alerts ({safetyAlerts.length})
            </h3>
            <div className="flex items-center space-x-2">
              {connectionStatus.supabase === 'online' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">Live Updates</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {safetyAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {alert.title || 'Safety Alert'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                      {alert.message || alert.description || 'Alert details...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{alert.location || 'Global'}</span>
                      <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saver Alerts Results */}
      {saverAlerts && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Travel Alerts ({saverAlerts.total} found)
            </h3>
            <a
              href="https://saver-7tda.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Saver</span>
            </a>
          </div>
          
          {saverAlerts.status === 'error' && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">
                {saverAlerts.message || 'Error fetching alerts'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {saverAlerts.alerts.map((alert) => {
              const alertId = alert.id;
              const enhancedAlert = enhancedAlerts[alertId];

              return (
                <div key={alert.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-red-600 dark:text-red-400">{alert.title}</h4>
                    <span className="text-sm text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <strong>Source:</strong> {alert.source}
                  </div>

                  {enhancedAlert ? (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                      {enhancedAlert.isLoading ? (
                        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Generating AI insights...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-800 dark:text-blue-200">{enhancedAlert.content}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateEnhancedAlert(alert)}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Get AI Insights</span>
                    </button>
                  )}
                  
                  {alert.url && (
                    <div className="mt-3 text-right">
                      <a
                        href={alert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end"
                      >
                        View Original Source <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {saverAlerts.alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts found for the selected location.</p>
              <p className="text-sm mt-2">This is good news! The area appears to be safe.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Links */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
          🌐 Saver System Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Data Sources</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• US State Department Travel Advisories</li>
              <li>• UK Government Travel Guidance</li>
              <li>• Embassy Safety Notifications</li>
              <li>• Smartraveller (Australia) Alerts</li>
              <li>• Canada Travel Health Notices</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Alert Types</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Travel Safety Warnings</li>
              <li>• Scam & Fraud Alerts</li>
              <li>• Health & Medical Advisories</li>
              <li>• Security Threat Notifications</li>
              <li>• Emergency Contact Information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 