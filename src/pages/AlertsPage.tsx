import React, { useState, useEffect, useCallback } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { PageContainer } from '../components/layout/PageContainer';
import { AlertTriangle, MapPin, Calendar, Bell, Newspaper, Globe, Navigation, Shield, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';

import { useUserDestinations } from '../contexts/UserDestinationContext';
import { eventsApiService } from '../lib/eventsApi';
import type { LocalEvent } from '../lib/eventsApi';
import DestinationManager from '../components/destinations/DestinationManager';
import NotificationsSection from '../components/alerts/NotificationsSection';

type TabType = 'news' | 'scams' | 'events' | 'safety' | 'destinations' | 'local' | 'notifications';

const AlertsPage: React.FC = () => {
  const routerLocation = useRouterLocation();
  const { userLocation } = useLocation();
  const [activeFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const { currentDestination } = useUserDestinations();
  const { safetyAlerts, isLoading, refreshData } = useRealTimeData();

  // Local data states
  const [localNews, setLocalNews] = useState<any[]>([]);
  const [scamAlerts, setScamAlerts] = useState<any[]>([]);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [travelSafety, setTravelSafety] = useState<any[]>([]);
  const [, setUnifiedLoading] = useState(false);

  // Handle navigation state for events focus
  useEffect(() => {
    const state = routerLocation.state as any;
    if (state?.focus === 'events') {
      setActiveTab('events');
    }
  }, [routerLocation.state]);

  // Parse URL params for initial tab
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const tab = params.get('tab') as TabType;
    if (tab && ['news', 'scams', 'events', 'safety', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [routerLocation]);


  
  // Enhanced personalized alerts with location and tag filtering
  const getPersonalizedAlerts = () => {
    let filteredAlerts = safetyAlerts;

    // Filter by active filters (tags)
    if (activeFilters.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        activeFilters.some(filter => 
          alert.type.toLowerCase().includes(filter.toLowerCase()) ||
          alert.title.toLowerCase().includes(filter.toLowerCase()) ||
          alert.description.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Enhanced location filtering
    if (currentDestination) {
      const destinationParts = currentDestination.destination.toLowerCase().split(',');
      filteredAlerts = filteredAlerts.filter(alert => {
        const alertLocation = alert.location?.toLowerCase() || '';
        const alertDescription = alert.description.toLowerCase();
        
        return destinationParts.some(part => 
          alertLocation.includes(part.trim()) ||
          alertDescription.includes(part.trim())
        );
      });
    }

    return filteredAlerts.sort((a, b) => {
      // Prioritize by severity and recency
      if (a.severity !== b.severity) {
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const getLocationStatus = () => {
    if (currentDestination) {
      return {
        hasLocation: true,
        location: currentDestination.destination,
        source: 'destination' as const,
        accuracy: null
      };
    }
    
    if (userLocation) {
      return {
        hasLocation: true,
        location: `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
        source: 'GPS' as const,
        accuracy: userLocation.accuracy
      };
    }

    return {
      hasLocation: false,
      location: null,
      source: null,
      accuracy: null
    };
  };

  const locationStatus = getLocationStatus();
  const sortedAlerts = getPersonalizedAlerts();
  const unreadCount = sortedAlerts.filter(alert => !alert.read).length;

  // Load local data using our own services
  const loadUnifiedData = useCallback(async () => {
    if (!userLocation) return;
    
    const locationString = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    
    setUnifiedLoading(true);
    try {
      console.log('🔄 Loading local data for:', locationString);
      
      // Load events using our new events API
      const events = await eventsApiService.getEventsForLocation(locationString, {
        includeEventbrite: true,
        includeLocal: true,
        maxResults: 10
      });
      
      setLocalEvents(events);
      console.log('🎉 Loaded local events:', events.length);

      // Set fallback data for other sections
      setLocalNews([
        {
          id: 'news-1',
          title: 'Local Travel Update',
          summary: 'Current travel conditions and updates for your area.',
          category: 'travel',
          publishedAt: new Date().toISOString(),
          source: { name: 'Local News', url: '#' }
        }
      ]);
      
      setScamAlerts([
        {
          id: 'scam-1',
          title: 'General Travel Safety',
          description: 'Stay alert and verify information from official sources.',
          severity: 'medium',
          location: locationString,
          reportedAt: new Date().toISOString()
        }
      ]);
      
      setTravelSafety([
        {
          id: 'safety-1',
          title: 'Travel Safety Guidelines',
          description: 'Follow local guidelines and stay informed about current conditions.',
          severity: 'info',
          issuedDate: new Date().toISOString(),
          source: { name: 'Travel Authority', url: '#' }
        }
      ]);

    } catch (error) {
      console.error('❌ Failed to load local data:', error);
    } finally {
      setUnifiedLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    loadUnifiedData();
  }, [loadUnifiedData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading intelligence data...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'news':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Local News ({localNews.length})
              </h3>
              <span className="text-sm text-gray-500">Travel Updates</span>
            </div>
            
            {localNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No local news available for your location</p>
              </div>
            ) : (
              localNews.map((article, index) => (
                <div key={`${article.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{article.title}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      article.category === 'breaking' ? 'bg-red-100 text-red-800' :
                      article.category === 'crime' ? 'bg-orange-100 text-orange-800' :
                      article.category === 'weather' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {article.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{article.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  {article.url !== '#' && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                    >
                      Read more <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'scams':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Scam Alerts ({scamAlerts.length})
              </h3>
              <span className="text-sm text-gray-500">Powered by Exa.ai</span>
            </div>
            
            {scamAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent scam alerts for your location</p>
              </div>
            ) : (
              scamAlerts.map((alert, index) => (
                <div key={`${alert.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{alert.title}</h4>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {alert.scamType}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        alert.source.credibility === 'government' ? 'bg-green-500' :
                        alert.source.credibility === 'verified' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></span>
                      {alert.source.name}
                    </span>
                    <span>{new Date(alert.reportedDate).toLocaleDateString()}</span>
                  </div>
                  {alert.source.url !== '#' && (
                    <a
                      href={alert.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 hover:text-red-800 text-sm mt-2"
                    >
                      View details <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Local Events ({localEvents.length})
              </h3>
              <span className="text-sm text-gray-500">Powered by Exa.ai</span>
            </div>
            
            {localEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming events found for your location</p>
              </div>
            ) : (
              localEvents.map((event, index) => (
                <div key={`${event.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{event.title}</h4>
                    <div className="flex space-x-2">
                      {event.price?.isFree && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Free
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location.name}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="capitalize">{event.source}</span>
                  </div>
                  {event.ticketUrl && event.ticketUrl !== '#' && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-800 text-sm mt-2"
                    >
                      View event <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'safety':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Travel Safety ({travelSafety.length})
              </h3>
              <span className="text-sm text-gray-500">Powered by Exa.ai</span>
            </div>
            
            {travelSafety.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No travel advisories for your location</p>
              </div>
            ) : (
              travelSafety.map((alert, index) => (
                <div key={`${alert.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{alert.title}</h4>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                        {alert.alertType}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                  
                  {alert.recommendations && alert.recommendations.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Recommendations:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {alert.recommendations.slice(0, 3).map((rec: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        alert.source?.authority === 'government' ? 'bg-green-500' :
                        alert.source?.authority === 'international' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></span>
                      {alert.source?.name || 'Unknown Source'}
                    </span>
                    <span>{new Date(alert.issuedDate).toLocaleDateString()}</span>
                  </div>
                  {alert.source?.url && alert.source.url !== '#' && (
                    <a
                      href={alert.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm mt-2"
                    >
                      Official advisory <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'destinations':
        return (
          <div className="space-y-4">
            <DestinationManager />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <NotificationsSection />
          </div>
        );

      case 'local':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                My Alerts ({unreadCount})
              </h3>
              <button
                onClick={refreshData}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            
            {sortedAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No alerts for your destinations</p>
              </div>
            ) : (
              sortedAlerts.map((alert, index) => (
                <div key={`${alert.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{alert.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'low' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{alert.type}</span>
                    <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };



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
    <PageContainer>
      <div className="flex flex-col space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Safety Alerts</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Stay informed about safety conditions worldwide
          </p>
        </div>

        {/* Location Status */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                {locationStatus.hasLocation 
                  ? `Monitoring: ${locationStatus.location}`
                  : 'No location selected'}
              </span>
            </div>
            {locationStatus.hasLocation && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                via {locationStatus.source}
              </span>
            )}
          </div>
        </div>

        {/* Tabs Navigation - Mobile Optimized */}
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex space-x-2 min-w-max">
            <TabButton
              active={activeTab === 'news'}
              onClick={() => setActiveTab('news')}
              icon={<Newspaper className="w-4 h-4" />}
              label="Live News"
            />
            <TabButton
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
              icon={<Calendar className="w-4 h-4" />}
              label="Local Events"
            />
            <TabButton
              active={activeTab === 'safety'}
              onClick={() => setActiveTab('safety')}
              icon={<Shield className="w-4 h-4" />}
              label="Safety"
            />
            <TabButton
              active={activeTab === 'destinations'}
              onClick={() => setActiveTab('destinations')}
              icon={<Navigation className="w-4 h-4" />}
              label="Destinations"
            />
            <TabButton
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4">
            {renderContent()}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </PageContainer>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
      transition-colors whitespace-nowrap
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default AlertsPage;