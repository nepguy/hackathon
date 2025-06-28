import React, { useState, useEffect } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import AgentAlerts from '../components/alerts/AgentAlerts';
import PageContainer from '../components/layout/PageContainer';
import AlertFilters from '../components/alerts/AlertFilters';
import { AlertTriangle, MapPin, Calendar, Bell, Newspaper, Globe, Navigation, Shield, Clock } from 'lucide-react';

import { useRealTimeData } from '../hooks/useRealTimeData';
import { databaseService } from '../lib/database';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { RefreshCw } from 'lucide-react';
import AlertItem from '../components/alerts/AlertItem';
import { newsService } from '../lib/newsApi';
import { NewsArticle } from '../lib/newsApi';
import DestinationManager from '../components/destinations/DestinationManager';
import { eventsService } from '../lib/eventsApi';
import { geminiAiService } from '../lib/geminiAi';

const AlertsPage: React.FC = () => {
  const routerLocation = useRouterLocation();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('local');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { currentDestination } = useUserDestinations();
  const { userLocation } = useLocation();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();


  // Handle navigation state for events and destinations focus
  useEffect(() => {
    const state = routerLocation.state as any;
    if (state?.focus === 'events') {
      setActiveTab('events');
    } else if (state?.focus === 'destinations') {
      setActiveTab('destinations');
    }
  }, [routerLocation.state]);

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

  // Enhanced content loading with location and tag awareness
  useEffect(() => {
    const fetchContentForActiveTab = async () => {
      const currentLocation = locationStatus.location;
      
      if (activeTab === 'news' && currentLocation) {
        await loadLocationSpecificNews(currentLocation);
      } else if (activeTab === 'events' && currentLocation) {
        await loadLocationSpecificEvents(currentLocation);
      } else if (activeTab === 'agent' && currentLocation) {
        await loadLocationSpecificAIInsights(currentLocation);
      }
    };
    fetchContentForActiveTab();
  }, [activeTab, currentDestination, activeFilters]);

  const loadLocationSpecificNews = async (location: string) => {
    setNewsLoading(true);
    try {
      // Extract country and city for more targeted news
      let country, city;
      const parts = location.split(',').map(p => p.trim());
      
      if (parts.length > 1) {
        city = parts[0];
        country = parts[parts.length - 1];
      } else {
        country = parts[0];
      }

      // Build search query with location and active filters
      let searchQuery = `${city || country} travel`;
      if (activeFilters.length > 0) {
        searchQuery += ` ${activeFilters.join(' ')}`;
      }

      console.log(`📰 Loading location-specific news for: ${location} with filters: ${activeFilters.join(', ')}`);
      
      const response = await newsService.searchNews(searchQuery, country);
      setNewsArticles(response.articles || []);
    } catch (error) {
      console.error('Error loading location-specific news:', error);
      setNewsArticles([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const loadLocationSpecificEvents = async (location: string) => {
    setEventsLoading(true);
    try {
      let searchLocation = location;
      
      // Use GPS coordinates if available for better accuracy
      if (userLocation?.latitude && userLocation?.longitude) {
        searchLocation = `${userLocation.latitude},${userLocation.longitude}`;
      }

      // Filter events by active tags
      let eventQuery = '';
      if (activeFilters.length > 0) {
        eventQuery = activeFilters.join(' ');
      }

      console.log(`🎉 Loading location-specific events for: ${location} with filters: ${activeFilters.join(', ')}`);
      
      const response = await eventsService.searchEvents(searchLocation, eventQuery);
      setEvents(response?.events || []);
    } catch (error) {
      console.error('❌ Error loading location-specific events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadLocationSpecificAIInsights = async (location: string) => {
    setAiLoading(true);
    try {
      const parts = location.split(',').map(p => p.trim());
      const city = parts.length > 1 ? parts[0] : undefined;
      const country = parts[parts.length - 1];

      console.log(`🤖 Loading AI insights for: ${location} with focus: ${activeFilters.join(', ')}`);

      // Get location-specific AI insights with filter consideration
      const locationContext = {
        country,
        city,
        coordinates: userLocation?.latitude ? {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        } : undefined
      };

      const safetyData = await geminiAiService.getLocationSafetyData(locationContext);
      
      // Filter insights based on active filters
      let filteredInsights = safetyData.activeAlerts;
      if (activeFilters.length > 0) {
        filteredInsights = safetyData.activeAlerts.filter(alert =>
          activeFilters.some(filter =>
            alert.type.toLowerCase().includes(filter.toLowerCase()) ||
            alert.title.toLowerCase().includes(filter.toLowerCase()) ||
            alert.description.toLowerCase().includes(filter.toLowerCase())
          )
        );
      }

      setAiInsights([
        {
          id: 'safety-score',
          type: 'insight',
          title: `Safety Score for ${location}`,
          description: `Current safety rating: ${safetyData.safetyScore}/100 (${safetyData.riskLevel} risk)`,
          score: safetyData.safetyScore,
          riskLevel: safetyData.riskLevel
        },
        ...filteredInsights.map(alert => ({
          ...alert,
          type: 'ai-alert'
        })),
        {
          id: 'emergency-contacts',
          type: 'emergency',
          title: `Emergency Contacts in ${location}`,
          description: 'Important emergency numbers for your location',
          contacts: safetyData.emergencyNumbers
        }
      ]);
    } catch (error) {
      console.error('❌ Error loading AI insights:', error);
      setAiInsights([]);
    } finally {
      setAiLoading(false);
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
      count: events.length,
      description: `Events and activities in ${locationStatus.location || 'your area'}`
    },
    { 
      id: 'news', 
      label: 'Live News', 
      icon: Newspaper, 
      count: newsArticles.length,
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
      count: aiInsights.length,
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
                onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'local' && (
            <div className="space-y-4 sm:space-y-6">
              <AlertFilters 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
              
              {sortedAlerts.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    {activeFilters.length > 0 ? 'No Matching Alerts' : 'No Alerts Found'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeFilters.length > 0 
                      ? `No alerts match your filters (${activeFilters.join(', ')}) for ${locationStatus.location || 'your location'}.`
                      : currentDestination 
                        ? `No safety alerts for ${currentDestination.destination}. This is good news!`
                        : 'Add a destination to receive personalized safety alerts.'
                    }
                  </p>
                  {activeFilters.length > 0 && (
                    <button
                      onClick={() => setActiveFilters([])}
                      className="mt-3 sm:mt-4 btn-outline text-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      {sortedAlerts.length} alert{sortedAlerts.length !== 1 ? 's' : ''} for {locationStatus.location}
                      {activeFilters.length > 0 && (
                        <span className="text-xs sm:text-sm text-gray-500 font-normal">
                          {' '}(filtered by {activeFilters.join(', ')})
                        </span>
                      )}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {unreadCount} unread
                    </div>
                  </div>
                  {sortedAlerts.map((alert) => (
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

          {activeTab === 'events' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Local Events in {locationStatus.location || 'Your Area'}
                  </h3>
                  {activeFilters.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Filtered by: {activeFilters.join(', ')}
                    </p>
                  )}
                </div>
                <AlertFilters 
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {eventsLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card p-3 sm:p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                  <p className="text-sm text-gray-500">
                    {activeFilters.length > 0 
                      ? `No events match your filters for ${locationStatus.location}.`
                      : `No events found for ${locationStatus.location || 'your area'}.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {events.map((event, index) => (
                    <div key={index} className="card p-3 sm:p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{event.title}</h4>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-2 sm:space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.date}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </div>
                        </div>
                        {event.image && (
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover ml-3 sm:ml-4"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Travel News for {locationStatus.location || 'Your Location'}
                  </h3>
                  {activeFilters.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Filtered by: {activeFilters.join(', ')}
                    </p>
                  )}
                </div>
                <AlertFilters 
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {newsLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card p-3 sm:p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : newsArticles.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No News Found</h3>
                  <p className="text-sm text-gray-500">
                    No recent travel news for {locationStatus.location || 'your location'}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {newsArticles.map((article, index) => (
                    <div key={index} className="card p-3 sm:p-6 hover:shadow-lg transition-all duration-300">
                      <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{article.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">{article.publishedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    AI Insights for {locationStatus.location || 'Your Location'}
                  </h3>
                  {activeFilters.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Focused on: {activeFilters.join(', ')}
                    </p>
                  )}
                </div>
                <AlertFilters 
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {aiLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card p-3 sm:p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <AgentAlerts />
                  
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="card p-3 sm:p-6">
                      <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{insight.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{insight.description}</p>
                      
                      {insight.type === 'insight' && insight.score && (
                        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                insight.score >= 80 ? 'bg-green-500' :
                                insight.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${insight.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {insight.score}/100
                          </span>
                        </div>
                      )}
                      
                      {insight.contacts && (
                        <div className="space-y-0.5 sm:space-y-1">
                          {insight.contacts.map((contact: string, i: number) => (
                            <p key={i} className="text-xs sm:text-sm text-gray-600">{contact}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'destinations' && (
            <DestinationManager />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AlertsPage;