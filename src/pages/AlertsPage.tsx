import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { AgentAlerts } from '../components/alerts/AgentAlerts';
import PageContainer from '../components/layout/PageContainer';
import AlertFilters from '../components/alerts/AlertFilters';
import { AlertTriangle, MapPin } from 'lucide-react';
import { SafetyAlert } from '../types';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { databaseService } from '../lib/database';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { Bell, Newspaper, Globe, Settings } from 'lucide-react';
import AlertItem from '../components/alerts/AlertItem';
const AlertsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('local');
  const { currentDestination } = useUserDestinations();
  const { userLocation } = useLocation();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleFilterChange = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f: string) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      // Mark alert as read in database
      const success = await databaseService.markAlertAsRead(id);
      if (success) {
        console.log(`Alert ${id} marked as read`);
        // Refresh data to update UI
        await refreshData();
      } else {
        console.error(`Failed to mark alert ${id} as read`);
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };
  
  // Filter alerts based on user's current destination and active filters
  const getPersonalizedAlerts = () => {
    let filteredAlerts = safetyAlerts;
    
    // Filter by user's current destination if available
    if (currentDestination) {
      filteredAlerts = safetyAlerts.filter((alert: SafetyAlert) => 
        alert.location.toLowerCase().includes(currentDestination.name.toLowerCase()) ||
        alert.location.toLowerCase().includes(currentDestination.country.toLowerCase())
      );
    }
    
    // Apply additional filters
    if (activeFilters.length > 0) {
      filteredAlerts = filteredAlerts.filter((alert: SafetyAlert) => 
        activeFilters.includes(alert.type)
      );
    }
    
    return filteredAlerts;
  };

  const personalizedAlerts = getPersonalizedAlerts();
  
  // Sort alerts: unread first, then by timestamp
  const sortedAlerts = [...personalizedAlerts].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = sortedAlerts.filter(alert => !alert.read).length;

  // Get location-based status for UI
  const getLocationStatus = () => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return {
        hasLocation: true,
        source: 'GPS',
        accuracy: userLocation.accuracy
      };
    } else if (currentDestination) {
      return {
        hasLocation: true,
        source: 'Destination',
        location: `${currentDestination.name}, ${currentDestination.country}`
      };
    }
    return { hasLocation: false };
  };

  const locationStatus = getLocationStatus();

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      // Format coordinates as a location string
      const lat = userLocation.latitude.toFixed(4);
      const lng = userLocation.longitude.toFixed(4);
      setSelectedLocation(`${lat}, ${lng}`);
    }
  }, [userLocation]);

  const tabs = [
    { 
      id: 'local', 
      label: 'My Alerts', 
      icon: Bell, 
      count: unreadCount,
      description: 'Personalized alerts for your destinations'
    },
    { 
      id: 'news', 
      label: 'Live News', 
      icon: Newspaper, 
      count: 0,
      description: 'Real-time travel and safety news'
    },
    { 
      id: 'destinations', 
      label: 'Destinations', 
      icon: MapPin, 
      description: 'Manage your travel destinations'
    },
    { 
      id: 'agent', 
      label: 'AI Insights', 
      icon: Globe, 
      description: 'Real-time AI-powered travel intelligence'
    },
    { 
      id: 'control', 
      label: 'Settings', 
      icon: Settings, 
      description: 'Configure alert preferences and sources'
    }
  ];

  if (isLoading) {
    return (
      <PageContainer 
        title="Safety Alerts"
        subtitle="Stay informed about safety conditions worldwide"
      >
        <div className="space-y-6">
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Safety Alerts"
      subtitle="Stay informed about safety conditions worldwide"
    >
      <div className="space-y-6">
        {/* Location Status */}
        {locationStatus.hasLocation && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <span className="font-medium text-blue-900">
                    {locationStatus.source === 'GPS' ? 'Current Location' : 'Monitoring Location'}
                  </span>
                  {locationStatus.location && (
                    <p className="text-sm text-blue-700">{locationStatus.location}</p>
                  )}
                  {locationStatus.accuracy && (
                    <p className="text-xs text-blue-600">
                      Accuracy: ±{Math.round(locationStatus.accuracy)}m
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">
                Error loading alerts: {error}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'local' && (
            <div className="space-y-6">
              <AlertFilters 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
              
              {sortedAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
                  <p className="text-gray-500">
                    {currentDestination 
                      ? `No safety alerts for ${currentDestination.name}. This is good news!`
                      : 'Add a destination to receive personalized safety alerts.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAlerts.map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'agent' && (
            <AgentAlerts searchLocation={selectedLocation || 'Global'} />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AlertsPage;