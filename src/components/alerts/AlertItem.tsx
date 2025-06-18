import React, { useState } from 'react';
import { SafetyAlert } from '../../types';
import { 
  AlertTriangle, CloudRain, Stethoscope, Bus, Shield, ShieldAlert, ChevronDown, ChevronUp, Info
} from 'lucide-react';

interface AlertItemProps {
  alert: SafetyAlert;
  onMarkAsRead: (id: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onMarkAsRead }) => {
  const [showTips, setShowTips] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain size={18} className="text-blue-500" />;
      case 'security':
        return <Shield size={18} className="text-red-500" />;
      case 'health':
        return <Stethoscope size={18} className="text-green-500" />;
      case 'transportation':
        return <Bus size={18} className="text-purple-500" />;
      case 'scam':
        return <AlertTriangle size={18} className="text-orange-500" />;
      case 'safety':
        return <ShieldAlert size={18} className="text-indigo-500" />;
      default:
        return <AlertTriangle size={18} className="text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border p-4 mb-3 border-l-4 ${
        !alert.read ? 'border-l-blue-500' : 'border-l-gray-200'
      }`}
    >
      <div className="flex items-start">
        <div className="mt-1 mr-3">
          {getTypeIcon(alert.type)}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
          
          {/* Source information */}
          {alert.source && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Info size={12} className="mr-1" />
              <span>Source: {alert.source}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{alert.location}</span>
            <span className="text-gray-500">{formatTime(alert.timestamp)}</span>
          </div>
        </div>
      </div>
      
      {/* Prevention Tips */}
      {alert.tips && alert.tips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
          >
            <span>Prevention Tips</span>
            {showTips ? (
              <ChevronUp size={16} className="ml-1" />
            ) : (
              <ChevronDown size={16} className="ml-1" />
            )}
          </button>
          
          {showTips && (
            <ul className="space-y-1 text-sm text-gray-600">
              {alert.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {!alert.read && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-right">
          <button 
            onClick={() => onMarkAsRead(alert.id)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertItem;