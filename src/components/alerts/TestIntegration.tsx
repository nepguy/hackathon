import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import TravelAlertAPI from '../../lib/travelAlertApi';

const TestIntegration: React.FC = () => {
  const [status, setStatus] = useState<{
    backend: boolean | null;
    health: any;
    files: any;
    error: string | null;
  }>({
    backend: null,
    health: null,
    files: null,
    error: null
  });

  const testConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, backend: null, error: null }));
      
      // Test health endpoint
      const healthData = await TravelAlertAPI.healthCheck();
      console.log('Health check:', healthData);
      
      // Test files endpoint
      const filesData = await TravelAlertAPI.getFiles();
      console.log('Files check:', filesData);
      
      setStatus({
        backend: true,
        health: healthData,
        files: filesData,
        error: null
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus(prev => ({
        ...prev,
        backend: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (isOnline: boolean | null) => {
    if (isOnline === null) return <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />;
    return isOnline ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend Integration Test</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Backend API Connection</h4>
            <p className="text-sm text-gray-600">http://localhost:5000</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.backend)}
            <span className="text-sm font-medium">
              {status.backend === null ? 'Testing...' : status.backend ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {status.health && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Health Check Results</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Status: {status.health.status}</div>
              <div>Agent Ready: {status.health.agent_ready ? 'Yes' : 'No'}</div>
              <div>Timestamp: {new Date(status.health.timestamp).toLocaleString()}</div>
            </div>
          </div>
        )}

        {status.files && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Files Check Results</h4>
            <div className="text-sm text-blue-700">
              Available CSV files: {status.files.files?.length || 0}
            </div>
          </div>
        )}

        {status.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Connection Error</h4>
            <p className="text-sm text-red-700">{status.error}</p>
            <div className="mt-3 text-xs text-red-600">
              <p>Troubleshooting:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Make sure backend is running: python api_server.py</li>
                <li>Check if port 5000 is available</li>
                <li>Verify CORS settings in backend</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={testConnection}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Test Connection Again
        </button>
      </div>
    </div>
  );
};

export default TestIntegration; 