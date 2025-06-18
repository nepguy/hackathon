import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import AlertItem from '../components/alerts/AlertItem';
import AlertFilters from '../components/alerts/AlertFilters';
import AgentControl from '../components/alerts/AgentControl';
import AgentAlerts from '../components/alerts/AgentAlerts';
import TestIntegration from '../components/alerts/TestIntegration';
import DestinationManager from '../components/destinations/DestinationManager';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { safetyAlerts } from '../data/mockData';
import { SafetyAlert } from '../types';

const AlertsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(safetyAlerts);
  const [activeTab, setActiveTab] = useState<'local' | 'agent' | 'control' | 'destinations'>('local');
  const { currentDestination } = useUserDestinations();
  
  const handleFilterChange = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f: string) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map((alert: SafetyAlert) => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };
  
  // Filter alerts based on user's current destination and active filters
  const getPersonalizedAlerts = () => {
    let filteredAlerts = alerts;
    
    // Filter by user's current destination if available
    if (currentDestination) {
      filteredAlerts = alerts.filter((alert: SafetyAlert) => 
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

  return (
    <PageContainer title="Safety Alerts">
      {/* Current Destination Banner */}
      {currentDestination && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Currently monitoring: {currentDestination.name}, {currentDestination.country}
              </h3>
              <p className="text-sm text-blue-700">
                Showing personalized alerts for your travel destination
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('local')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'local'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📍 My Destination Alerts
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'destinations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🗺️ Manage Destinations
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🤖 AI Agent Data
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'control'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚙️ Agent Control
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'local' && (
        <>
          {!currentDestination ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Destination
                </h3>
                <p className="text-gray-600 mb-4">
                  Add and activate a travel destination to see personalized safety alerts.
                </p>
                <button
                  onClick={() => setActiveTab('destinations')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Destinations
                </button>
              </div>
            </div>
          ) : (
            <>
              <AlertFilters 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
              
              {sortedAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {activeFilters.length > 0 
                      ? "No alerts found for the selected filters in your destination."
                      : `No alerts found for ${currentDestination.name}, ${currentDestination.country}.`
                    }
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    This is good news! Your destination appears to be safe.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {sortedAlerts.filter((a: SafetyAlert) => !a.read).length} unread alerts for {currentDestination.name}
                    </p>
                  </div>
                  
                  {sortedAlerts.map((alert: SafetyAlert) => (
                    <AlertItem 
                      key={alert.id} 
                      alert={alert} 
                      onMarkAsRead={handleMarkAsRead} 
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'destinations' && (
        <DestinationManager />
      )}

      {activeTab === 'agent' && (
        <AgentAlerts searchLocation={currentDestination?.name || ''} />
      )}

      {activeTab === 'control' && (
        <div className="space-y-6">
          <TestIntegration />
          <AgentControl />
        </div>
      )}
    </PageContainer>
  );
};

export default AlertsPage;