import React, { useState } from 'react';
import { SafetyAlert } from '../../types';
import { 
  AlertTriangle, CloudRain, Stethoscope, Bus, Shield, ShieldAlert, 
  ChevronDown, ChevronUp, Info, ExternalLink, Clock, MapPin
} from 'lucide-react';
import { userStatisticsService } from '../../lib/userStatisticsService';
import { useAuth } from '../../contexts/AuthContext';

interface AlertItemProps {
  alert: SafetyAlert;
  onMarkAsRead: (id: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onMarkAsRead }) => {
  const { user } = useAuth();
  const [showTips, setShowTips] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />;
      case 'security':
        return <Shield className="w-4 h-4 md:w-5 md:h-5 text-red-500" />;
      case 'health':
        return <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-green-500" />;
      case 'transportation':
        return <Bus className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />;
      case 'scam':
        return <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-emerald-50 border-emerald-100 text-emerald-800';
      case 'medium':
        return 'bg-amber-50 border-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-50 border-red-100 text-red-800';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all duration-300 ${
      !alert.read ? 'ring-1 ring-blue-200' : ''
    }`}>
      <div className={`p-3 md:p-4 ${getSeverityColor(alert.severity)}`}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-1">
                {alert.title}
              </h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
              {!alert.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
              {alert.description}
            </p>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5" />
                <span className="ml-1 line-clamp-1">{alert.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5" />
                <span className="ml-1">{formatTime(alert.timestamp)}</span>
              </div>
              {alert.source && (
                <div className="flex items-center">
                  <Info className="w-3.5 h-3.5" />
                  <span className="ml-1 line-clamp-1">Source: {alert.source}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Prevention Tips */}
        {alert.tips && alert.tips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              <span className="ml-1.5">Safety Tips</span>
              {showTips ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </button>
            
            {showTips && (
              <div className="mt-2 space-y-2">
                {alert.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white/80 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {!alert.read && (
              <button 
                onClick={() => {
                  onMarkAsRead(alert.id);
                  if (user && (alert.severity === 'high' || alert.severity === 'medium')) {
                    console.log('🛡️ Incident potentially prevented by alert acknowledgment');
                    const scoreChange = alert.severity === 'high' ? -5 : -2;
                    userStatisticsService.getUserStatistics(user.id).then(stats => {
                      if (stats) {
                        userStatisticsService.updateSafetyScore(user.id, stats.safety_score + scoreChange);
                      }
                    });
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark as read
              </button>
            )}
            {alert.source && (
              <button className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="ml-1">View source</span>
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 capitalize">
            {alert.type}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;