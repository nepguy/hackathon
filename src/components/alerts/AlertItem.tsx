import React from 'react';
import { SafetyAlert } from '../../types';
import { 
  AlertTriangle, CloudRain, Stethoscope, Bus, Shield,
} from 'lucide-react';

interface AlertItemProps {
  alert: SafetyAlert;
  onMarkAsRead: (id: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onMarkAsRead }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain size={18} className="text-primary-500" />;
      case 'security':
        return <Shield size={18} className="text-danger-500" />;
      case 'health':
        return <Stethoscope size={18} className="text-secondary-500" />;
      case 'transportation':
        return <Bus size={18} className="text-accent-500" />;
      default:
        return <AlertTriangle size={18} className="text-danger-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-secondary-100 text-secondary-800';
      case 'medium':
        return 'bg-accent-100 text-accent-800';
      case 'high':
        return 'bg-danger-100 text-danger-800';
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
      className={`card p-4 mb-3 border-l-4 ${
        !alert.read ? 'border-l-primary-500' : 'border-l-gray-200'
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
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{alert.location}</span>
            <span className="text-gray-500">{formatTime(alert.timestamp)}</span>
          </div>
        </div>
      </div>
      
      {!alert.read && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-right">
          <button 
            onClick={() => onMarkAsRead(alert.id)}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertItem;