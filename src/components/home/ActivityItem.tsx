import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '../../types';
import { Bell, LightbulbIcon, Map } from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const navigate = useNavigate();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Bell size={16} className="text-red-500" />;
      case 'tip':
        return <LightbulbIcon size={16} className="text-yellow-500" />;
      case 'plan':
        return <Map size={16} className="text-blue-600" />;
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

  const handleClick = () => {
    switch (activity.type) {
      case 'alert':
        navigate('/alerts');
        break;
      case 'tip':
        navigate('/explore');
        break;
      case 'plan':
        navigate('/alerts?tab=destinations');
        break;
      default:
        navigate('/alerts');
    }
  };

  return (
    <div
      className="flex items-start py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-all duration-300 rounded-lg px-2 hover:shadow-md group"
      onClick={handleClick}
    >
      <div className="mt-1 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        {getIcon(activity.type)}
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
        <p className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-700 transition-colors">{activity.description}</p>
        <div className="w-0 h-0.5 bg-blue-500/0 group-hover:bg-blue-500/100 group-hover:w-1/2 transition-all duration-500"></div>
      </div>
      <div className="text-xs text-gray-500 ml-2 transition-all duration-300 group-hover:text-blue-500">
        {formatTime(activity.timestamp)}
      </div>
    </div>
  );
};

export default ActivityItem;

export { ActivityItem };