import React from 'react';
import { Activity } from '../../types';
import { Bell, LightbulbIcon, Map } from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Bell size={16} className="text-danger-500" />;
      case 'tip':
        return <LightbulbIcon size={16} className="text-accent-500" />;
      case 'plan':
        return <Map size={16} className="text-primary-600" />;
      default:
        return <Bell size={16} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="mt-1 mr-3">
        {getIcon(activity.type)}
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
      </div>
      <div className="text-xs text-gray-500 ml-2">
        {formatTime(activity.timestamp)}
      </div>
    </div>
  );
};

export default ActivityItem;

export { ActivityItem };