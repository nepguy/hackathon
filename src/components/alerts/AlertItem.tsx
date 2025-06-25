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
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'health':
        return <Stethoscope className="w-5 h-5 text-green-500" />;
      case 'transportation':
        return <Bus className="w-5 h-5 text-purple-500" />;
      case 'scam':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
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
    <div className={`card p-0 overflow-hidden transition-all duration-300 ${
      !alert.read ? 'ring-2 ring-blue-200 shadow-lg' : ''
    }`}>
      <div className={`p-6 ${getSeverityColor(alert.severity)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {alert.title}
                </h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                {!alert.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                {alert.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(alert.timestamp)}</span>
                </div>
                {alert.source && (
                  <div className="flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Source: {alert.source}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Prevention Tips */}
        {alert.tips && alert.tips.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Safety Tips</span>
              {showTips ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showTips && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {alert.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            {!alert.read && (
              <button 
                onClick={() => {
                  onMarkAsRead(alert.id);
                  // Track incident prevention when user acknowledges a safety alert
                  if (user && (alert.severity === 'high' || alert.severity === 'medium')) {
                    console.log('🛡️ Incident potentially prevented by alert acknowledgment');
                    // Update safety score based on alert severity
                    const scoreChange = alert.severity === 'high' ? -5 : -2;
                    const currentScore = 95; // Default if not available
                    userStatisticsService.updateSafetyScore(user.id, currentScore + scoreChange);
                  }
                }}
                className="btn-ghost text-sm"
              >
                Mark as read
              </button>
            )}
            {alert.source && (
              <button className="btn-ghost text-sm flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>View source</span>
              </button>
            )}
          </div>
          
          <div className="text-xs text-slate-500 capitalize">
            {alert.type} alert
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;