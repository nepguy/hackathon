import React, { useState, useEffect } from 'react';
import { Search, Play, Download, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import TravelAlertAPI, { ScrapingStatus, CsvFile, AlertRecord } from '../../lib/travelAlertApi';

const AgentControl: React.FC = () => {
  const [status, setStatus] = useState<ScrapingStatus | null>(null);
  const [files, setFiles] = useState<CsvFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [customUrls, setCustomUrls] = useState('');
  const [apiStatus, setApiStatus] = useState({
    eventbrite: null as boolean | null,
    gnews: null as boolean | null,
    backend: null as boolean | null
  });
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    fetchStatus();
    fetchFiles();
    testApiConnections();
  }, []);

  const fetchStatus = async () => {
    try {
      const statusData = await TravelAlertAPI.getStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const filesData = await TravelAlertAPI.getFiles();
      setFiles(filesData.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const testApiConnections = async () => {
    try {
      const [healthCheck, eventbriteTest, gnewsTest] = await Promise.allSettled([
        TravelAlertAPI.healthCheck(),
        TravelAlertAPI.testEventbrite(),
        TravelAlertAPI.testGNews()
      ]);

      setApiStatus({
        backend: healthCheck.status === 'fulfilled',
        eventbrite: eventbriteTest.status === 'fulfilled' ? 
          (eventbriteTest.value as any).connected : false,
        gnews: gnewsTest.status === 'fulfilled' ? 
          (gnewsTest.value as any).connected : false
      });
    } catch (error) {
      console.error('Failed to test API connections:', error);
    }
  };

  const handleQuickSearch = async () => {
    if (!searchLocation.trim()) return;
    
    setLoading(true);
    try {
      const [govAlerts, eventAlerts, newsAlerts] = await Promise.all([
        TravelAlertAPI.getQuickAlerts(searchLocation),
        TravelAlertAPI.getEventAlerts(searchLocation),
        TravelAlertAPI.getNewsAlerts(searchLocation)
      ]);

      const allAlerts = [
        ...(govAlerts.data?.alerts || []),
        ...(eventAlerts.alerts || []),
        ...(newsAlerts.alerts || [])
      ];

      setAlerts(allAlerts);
      await fetchFiles(); // Refresh files list
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomScrape = async () => {
    if (!customUrls.trim()) return;
    
    setLoading(true);
    try {
      const urls = customUrls.split('\n').filter(url => url.trim());
      const result = await TravelAlertAPI.scrapeData(urls, 'travel_alerts', searchLocation);
      
      if (result.status === 'success') {
        await fetchFiles();
        alert(`Successfully scraped ${result.data.records_exported} records!`);
      }
    } catch (error) {
      console.error('Failed to scrape custom URLs:', error);
      alert('Failed to scrape URLs. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutomation = async () => {
    setLoading(true);
    try {
      await TravelAlertAPI.runAutomationNow();
      await fetchStatus();
      alert('Automation started successfully!');
    } catch (error) {
      console.error('Failed to run automation:', error);
      alert('Failed to start automation. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isOnline: boolean | null) => {
    if (isOnline === null) return <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />;
    return isOnline ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (isOnline: boolean | null) => {
    if (isOnline === null) return 'Testing...';
    return isOnline ? 'Connected' : 'Disconnected';
  };

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (riskLevel >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Backend API</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.backend)}
              <span className="text-sm text-gray-600">{getStatusText(apiStatus.backend)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Eventbrite</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.eventbrite)}
              <span className="text-sm text-gray-600">{getStatusText(apiStatus.eventbrite)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">GNews</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.gnews)}
              <span className="text-sm text-gray-600">{getStatusText(apiStatus.gnews)}</span>
            </div>
          </div>
        </div>
        
        {status && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium">
                {status.is_running ? 'Running' : 'Ready'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Records:</span>
              <span className="ml-2 font-medium">{status.total_records.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Run:</span>
              <span className="ml-2 font-medium">
                {status.last_run ? new Date(status.last_run).toLocaleString() : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Files:</span>
              <span className="ml-2 font-medium">{files.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Location Search</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Enter location (e.g., Bangkok, Thailand)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleQuickSearch}
            disabled={loading || !searchLocation.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        
        {alerts.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Found {alerts.length} alerts:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskColor(alert.risk_rating)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium">{alert.scam_type}</h5>
                      <p className="text-sm mt-1">{alert.description.substring(0, 100)}...</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded">
                      Risk: {alert.risk_rating}/10
                    </span>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  And {alerts.length - 5} more alerts...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom URL Scraping */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom URL Scraping</h3>
        <textarea
          value={customUrls}
          onChange={(e) => setCustomUrls(e.target.value)}
          placeholder="Enter URLs (one per line)&#10;https://example.com/travel-advisory&#10;https://another-site.com/safety-info"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleCustomScrape}
          disabled={loading || !customUrls.trim()}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Scrape URLs
        </button>
      </div>

      {/* Automation Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Controls</h3>
        <div className="flex gap-4">
          <button
            onClick={handleRunAutomation}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Now
          </button>
          <button
            onClick={() => { fetchStatus(); fetchFiles(); testApiConnections(); }}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Recent Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Data Files</h3>
          <div className="space-y-2">
            {files.slice(0, 10).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{file.filename}</h4>
                  <p className="text-sm text-gray-500">
                    {file.records.toLocaleString()} records • {new Date(file.created).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentControl; 