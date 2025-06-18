import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import AlertItem from '../components/alerts/AlertItem';
import AlertFilters from '../components/alerts/AlertFilters';
import AgentControl from '../components/alerts/AgentControl';
import AgentAlerts from '../components/alerts/AgentAlerts';
import DestinationManager from '../components/destinations/DestinationManager';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { safetyAlerts } from '../data/mockData';
import { SafetyAlert } from '../types';
import { 
  Shield, MapPin, AlertTriangle, Settings, 
  Globe, Bell, BellOff, Filter, RefreshCw
} from 'lucide-react';

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

  const unreadCount = sortedAlerts.filter(alert => !alert.read).length;

  const tabs = [
    { 
      id: 'local', 
      label: 'My Alerts', 
      icon: Bell, 
      count: unreadCount,
      description: 'Personalized alerts for your destinations'
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

  return (
    <PageContainer 
      title="Safety Alerts"
      subtitle="Stay informed about safety conditions worldwide"
    >
      <div className="space-y-6 stagger-children">
        
        {/* Current Destination Status */}
        {currentDestination && (
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900">
                    {currentDestination.name}, {currentDestination.country}
                  </h3>
                  <p className="text-blue-700">
                    {unreadCount} active alerts • Monitoring enabled
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Live</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="card p-1 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-4 rounded-xl text-left transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-lg text-blue-600'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <tab.icon className={`w-5 h-5 ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{tab.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'local' && (
            <div className="space-y-6">
              {!currentDestination ? (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Active Destination
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Add and activate a travel destination to receive personalized safety alerts and real-time updates.
                  </p>
                  <button
                    onClick={() => setActiveTab('destinations')}
                    className="btn-primary"
                  >
                    Add Destination
                  </button>
                </div>
              ) : (
                <>
                  {/* Alert Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="btn-ghost flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                      </button>
                      <button className="btn-ghost flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </button>
                    </div>
                    <div className="text-sm text-slate-600">
                      {sortedAlerts.length} total alerts
                    </div>
                  </div>

                  <AlertFilters 
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                  
                  {sortedAlerts.length === 0 ? (
                    <div className="card p-8 text-center">
                      <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-2">All Clear!</h3>
                      <p className="text-slate-600">
                        {activeFilters.length > 0 
                          ? "No alerts match your current filters."
                          : `No active alerts for ${currentDestination.name}. Your destination appears to be safe.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedAlerts.map((alert: SafetyAlert) => (
                        <AlertItem 
                          key={alert.id} 
                          alert={alert} 
                          onMarkAsRead={handleMarkAsRead} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'destinations' && (
            <DestinationManager />
          )}

          {activeTab === 'agent' && (
            <AgentAlerts searchLocation={currentDestination?.name || ''} />
          )}

          {activeTab === 'control' && (
            <AgentControl />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AlertsPage;