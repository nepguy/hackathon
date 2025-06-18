import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Shield, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import TravelAlertAPI, { AlertRecord } from '../../lib/travelAlertApi';

interface AgentAlertsProps {
  searchLocation?: string;
}

const AgentAlerts: React.FC<AgentAlertsProps> = ({ searchLocation }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'government' | 'events' | 'news'>('government');
  const [alertsBySource, setAlertsBySource] = useState<{
    government: AlertRecord[];
    events: AlertRecord[];
    news: AlertRecord[];
  }>({
    government: [],
    events: [],
    news: []
  });

  useEffect(() => {
    if (searchLocation) {
      fetchAlerts(searchLocation);
    }
  }, [searchLocation]);

  const fetchAlerts = async (location: string) => {
    setLoading(true);
    try {
      // First, trigger scraping for the location
      const govScrapingPromise = TravelAlertAPI.getQuickAlerts(location);
      const eventAlertsPromise = TravelAlertAPI.getEventAlerts(location);
      const newsAlertsPromise = TravelAlertAPI.getNewsAlerts(location);

      const [govResponse, eventResponse, newsResponse] = await Promise.allSettled([
        govScrapingPromise,
        eventAlertsPromise,
        newsAlertsPromise
      ]);

      // Handle government alerts - these come from scraping result
      let govAlerts: AlertRecord[] = [];
      if (govResponse.status === 'fulfilled' && govResponse.value.status === 'success') {
        // If scraping was successful, try to get the CSV data
        const csvFile = govResponse.value.data?.csv_file;
        if (csvFile) {
          try {
            const csvData = await TravelAlertAPI.getAlertData(csvFile, 50);
            govAlerts = csvData.data || [];
          } catch (error) {
            console.warn('Could not fetch CSV data:', error);
          }
        }
      }

      // Handle event alerts - these come directly from the API
      const eventAlerts = eventResponse.status === 'fulfilled' ? 
        (eventResponse.value.alerts || []) : [];
      
      // Handle news alerts - these come directly from the API
      const newsAlerts = newsResponse.status === 'fulfilled' ? 
        (newsResponse.value.alerts || []) : [];

      setAlertsBySource({
        government: govAlerts,
        events: eventAlerts,
        news: newsAlerts
      });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 8) return 'bg-red-50 border-red-200';
    if (riskLevel >= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getRiskBadgeColor = (riskLevel: number) => {
    if (riskLevel >= 8) return 'bg-red-100 text-red-800';
    if (riskLevel >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-green-500" />;
    }
  };

  const getSourceIcon = (sourceCredibility: string) => {
    if (sourceCredibility.includes('Government')) return '🏛️';
    if (sourceCredibility.includes('Eventbrite')) return '🎫';
    if (sourceCredibility.includes('News')) return '📰';
    return '🔗';
  };

  const currentAlerts = alertsBySource[activeTab];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading AI-powered alerts...</span>
      </div>
    );
  }

  if (!searchLocation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Selected</h3>
        <p className="text-gray-500">
          Use the Agent Control panel to search for a location and get AI-powered travel alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'government', label: '🏛️ Government', count: alertsBySource.government.length },
            { key: 'events', label: '🎫 Events', count: alertsBySource.events.length },
            { key: 'news', label: '📰 Breaking News', count: alertsBySource.news.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Alert Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-blue-500 mr-2" />
          <span className="font-medium text-blue-900">
            Showing {currentAlerts.length} AI-analyzed alerts for {searchLocation}
          </span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Data sourced from {alertsBySource.government.length > 0 ? 'government advisories, ' : ''}
          {alertsBySource.events.length > 0 ? 'event monitoring, ' : ''}
          {alertsBySource.news.length > 0 ? 'breaking news' : ''}
        </p>
      </div>

      {/* Alerts List */}
      {currentAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
          <p className="text-gray-500">
            No {activeTab} alerts found for {searchLocation}. This could mean the area is currently safe 
            or our AI hasn't detected any relevant threats from this source.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentAlerts.map((alert, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 ${getRiskColor(alert.risk_rating)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(alert.severity)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {alert.scam_type}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeColor(alert.risk_rating)}`}>
                    Risk: {alert.risk_rating}/10
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{getSourceIcon(alert.source_credibility)}</span>
                  <span>{alert.source_credibility}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {alert.description}
              </p>

              {alert.prevention_tips && (
                <div className="mb-4 p-4 bg-white bg-opacity-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Prevention Tips
                  </h4>
                  <p className="text-sm text-gray-700">
                    {alert.prevention_tips}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(alert.date_reported).toLocaleDateString()}</span>
                  </div>
                  {alert.target_demographic && (
                    <div>
                      <span className="font-medium">Target:</span> {alert.target_demographic}
                    </div>
                  )}
                </div>
                
                {alert.source_url && (
                  <a
                    href={alert.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Source</span>
                  </a>
                )}
              </div>

              {/* Additional metadata for specific alert types */}
              {alert.event_type && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span><strong>Event Type:</strong> {alert.event_type.replace('_', ' ')}</span>
                    {alert.urgency && (
                      <span><strong>Urgency:</strong> {alert.urgency}</span>
                    )}
                    {alert.affected_locations && (
                      <span><strong>Affected Areas:</strong> {alert.affected_locations}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => searchLocation && fetchAlerts(searchLocation)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>
    </div>
  );
};

export default AgentAlerts; 