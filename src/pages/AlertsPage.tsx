import React, { useState, useEffect, useCallback } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { PageContainer } from '../components/layout/PageContainer';
import { AlertTriangle, MapPin, Calendar, Bell, Newspaper, Globe, Navigation, Shield, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';

import { useUserDestinations } from '../contexts/UserDestinationContext';
import { exaUnifiedService } from '../lib/exaUnifiedService';
import type { LocalNews, ScamAlert, LocalEvent, TravelSafetyAlert } from '../lib/exaUnifiedService';
import DestinationManager from '../components/destinations/DestinationManager';

type TabType = 'news' | 'scams' | 'events' | 'safety' | 'destinations' | 'local';

const AlertsPage: React.FC = () => {
  const routerLocation = useRouterLocation();
  const { userLocation } = useLocation();
  const [activeFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const { currentDestination } = useUserDestinations();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();

  // Exa unified data states
  const [localNews, setLocalNews] = useState<LocalNews[]>([]);
  const [scamAlerts, setScamAlerts] = useState<ScamAlert[]>([]);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [travelSafety, setTravelSafety] = useState<TravelSafetyAlert[]>([]);
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
    if (tab && ['news', 'scams', 'events', 'safety'].includes(tab)) {
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

  // Load unified data using Exa
  const loadUnifiedData = useCallback(async () => {
    if (!userLocation) return;
    
    const locationString = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    
    setUnifiedLoading(true);
    try {
      console.log('🔄 Loading unified data via Exa for:', locationString);
      
      const [news, scams, events, safety] = await Promise.allSettled([
        exaUnifiedService.getLocalNews(locationString),
        exaUnifiedService.getScamAlerts(locationString),
        exaUnifiedService.getLocalEvents(locationString),
        exaUnifiedService.getTravelSafetyAlerts(locationString)
      ]);

      if (news.status === 'fulfilled') {
        setLocalNews(news.value);
        console.log('📰 Loaded local news via Exa:', news.value.length);
      }

      if (scams.status === 'fulfilled') {
        setScamAlerts(scams.value);
        console.log('🚨 Loaded scam alerts via Exa:', scams.value.length);
      }

      if (events.status === 'fulfilled') {
        setLocalEvents(events.value);
        console.log('🎉 Loaded local events via Exa:', events.value.length);
      }

      if (safety.status === 'fulfilled') {
        setTravelSafety(safety.value);
        console.log('🛡️ Loaded travel safety via Exa:', safety.value.length);
      }

    } catch (error) {
      console.error('❌ Failed to load unified data:', error);
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
              <span className="text-sm text-gray-500">Powered by Exa.ai</span>
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
                      {event.isFree && (
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
                    <span>{event.source.name}</span>
                  </div>
                  {event.eventUrl !== '#' && (
                    <a
                      href={event.eventUrl}
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
                  
                  {alert.recommendations.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Recommendations:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {alert.recommendations.slice(0, 3).map((rec, index) => (
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
                        alert.source.authority === 'government' ? 'bg-green-500' :
                        alert.source.authority === 'international' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></span>
                      {alert.source.name}
                    </span>
                    <span>{new Date(alert.issuedDate).toLocaleDateString()}</span>
                  </div>
                  {alert.source.url !== '#' && (
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

  const tabs = [
    { 
      id: 'local', 
      label: 'My Alerts', 
      icon: Bell, 
      count: unreadCount,
      description: `Personalized alerts for ${locationStatus.location || 'your destinations'}`
    },
    { 
      id: 'events', 
      label: 'Local Events', 
      icon: Calendar, 
      count: localEvents.length,
      description: `Events and activities in ${locationStatus.location || 'your area'}`
    },
    { 
      id: 'news', 
      label: 'Live News', 
      icon: Newspaper, 
      count: localNews.length,
      description: `Real-time news for ${locationStatus.location || 'your location'}`
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
      count: 0,
      description: `AI-powered intelligence for ${locationStatus.location || 'your location'}`
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
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Location Status with Filter Context */}
        {locationStatus.hasLocation && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <span className="font-medium text-blue-900 text-sm sm:text-base">
                    {locationStatus.source === 'GPS' ? 'Current Location' : 'Monitoring Location'}
                  </span>
                  <p className="text-xs sm:text-sm text-blue-700">{locationStatus.location}</p>
                  {activeFilters.length > 0 && (
                    <p className="text-xs text-blue-600">
                      Filtering by: {activeFilters.join(', ')}
                    </p>
                  )}
                  {locationStatus.accuracy && (
                    <p className="text-xs text-blue-600">
                      Accuracy: ±{Math.round(locationStatus.accuracy)}m
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={refreshData}
                className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                title="Refresh location-specific data"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800 text-sm">
                Error loading alerts: {error}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Tab Navigation with Descriptions */}
        <div className="border-b border-gray-200 pb-1">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 sm:py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Tab Description */}
          <div className="mt-1 sm:mt-2 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {renderContent()}
        </div>
      </div>
    </PageContainer>
  );
};

export default AlertsPage;