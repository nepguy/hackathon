import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import AlertItem from '../components/alerts/AlertItem';
import AlertFilters from '../components/alerts/AlertFilters';
import AgentControl from '../components/alerts/AgentControl';
import AgentAlerts from '../components/alerts/AgentAlerts';
import DestinationManager from '../components/destinations/DestinationManager';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { useLocation } from '../contexts/LocationContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { newsService, NewsArticle } from '../lib/newsApi';
import { databaseService } from '../lib/database';
import { SafetyAlert } from '../types';
import { 
  Shield, MapPin, AlertTriangle, Settings, 
  Globe, Bell, BellOff, Filter, RefreshCw, 
  ExternalLink, Clock, Newspaper
} from 'lucide-react';

const AlertsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'local' | 'agent' | 'control' | 'destinations' | 'news'>('local');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const { currentDestination } = useUserDestinations();
  const { userLocation } = useLocation();
  const { safetyAlerts, isLoading, error, refreshData } = useRealTimeData();
  
  const handleFilterChange = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f: string) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    // Update in database - this would need to be implemented in the database service
    // For now, we'll just update the local state
    // await databaseService.markAlertAsRead(id);
    await refreshData();
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

  // Fetch real news data
  const fetchNewsData = async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    
    try {
      const location = currentDestination?.name || currentDestination?.country;
      
      // Fetch different types of news in parallel
      const [safetyNews, travelNews, weatherNews] = await Promise.all([
        newsService.getSafetyAlerts(location),
        newsService.getTravelNews(location),
        newsService.getWeatherNews(location)
      ]);

      // Combine and deduplicate articles
      const allArticles = [
        ...safetyNews.articles,
        ...travelNews.articles,
        ...weatherNews.articles
      ];

      // Remove duplicates based on title
      const uniqueArticles = allArticles.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
      );

      // Sort by severity and publish date
      const sortedNews = uniqueArticles.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      setNewsArticles(sortedNews.slice(0, 20)); // Limit to 20 articles
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsError('Failed to load news. Please try again later.');
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Load news when component mounts or destination changes
  useEffect(() => {
    if (activeTab === 'news') {
      fetchNewsData();
    }
  }, [activeTab, currentDestination]);

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
      count: newsArticles.length,
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
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer 
        title="Safety Alerts"
        subtitle="Stay informed about safety conditions worldwide"
      >
        <div className="card p-8 text-center bg-red-50 border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Alerts</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </PageContainer>
    );
  }

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
                  {locationStatus.hasLocation && (
                    <p className="text-xs text-blue-600">
                      📍 {locationStatus.source === 'GPS' 
                        ? `GPS Location (±${Math.round(locationStatus.accuracy || 0)}m)` 
                        : `Location: ${locationStatus.location}`
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                  title="Toggle notifications"
                >
                  {unreadCount > 0 ? (
                    <Bell className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-blue-400" />
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">Live</span>
                </div>
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
                      <button 
                        onClick={refreshData}
                        className="btn-ghost flex items-center space-x-2"
                      >
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

          {activeTab === 'news' && (
            <div className="space-y-6">
              {/* News Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-slate-900">Live News & Alerts</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Live</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={fetchNewsData}
                    disabled={isLoadingNews}
                    className="btn-ghost flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingNews ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <div className="text-sm text-slate-600">
                    {newsArticles.length} articles
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingNews && (
                <div className="card p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading latest news and alerts...</p>
                </div>
              )}

              {/* Error State */}
              {newsError && (
                <div className="card p-6 bg-red-50 border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="font-medium text-red-800">Unable to load news</h4>
                      <p className="text-red-600 text-sm">{newsError}</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchNewsData}
                    className="mt-4 btn-primary bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* News Articles */}
              {!isLoadingNews && !newsError && newsArticles.length === 0 && (
                <div className="card p-8 text-center">
                  <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No News Available</h3>
                  <p className="text-slate-600">
                    No recent news found for your current destination. Try refreshing or check back later.
                  </p>
                </div>
              )}

              {!isLoadingNews && newsArticles.length > 0 && (
                <div className="space-y-4">
                  {newsArticles.map((article) => (
                    <div key={article.url} className="card p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start space-x-4">
                        {article.image && (
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              article.severity === 'high' ? 'bg-red-100 text-red-800' :
                              article.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {article.severity}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              article.category === 'safety' ? 'bg-orange-100 text-orange-800' :
                              article.category === 'travel' ? 'bg-blue-100 text-blue-800' :
                              article.category === 'weather' ? 'bg-cyan-100 text-cyan-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {article.category}
                            </span>
                            {article.location && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                {article.location}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                            {article.title}
                          </h4>
                          
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {article.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                              </div>
                              <span>{article.source.name}</span>
                            </div>
                            
                            <a 
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <span>Read more</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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