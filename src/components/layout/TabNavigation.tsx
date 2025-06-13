import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Globe, Map, Bell, User, 
  HomeIcon, GlobeIcon, MapIcon, BellIcon, UserIcon 
} from 'lucide-react';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  
  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      exactPath: true
    },
    {
      path: '/explore',
      label: 'Explore',
      icon: Globe,
      exactPath: false
    },
    {
      path: '/map',
      label: 'Map',
      icon: Map,
      exactPath: false
    },
    {
      path: '/alerts',
      label: 'Alerts',
      icon: Bell,
      exactPath: false
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      exactPath: false
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-1 px-2 z-10">
      {tabs.map((tab) => {
        const isActive = tab.exactPath
          ? location.pathname === tab.path
          : location.pathname.startsWith(tab.path);
        
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`tab-item ${isActive ? 'tab-active' : 'tab-inactive'}`}
          >
            <tab.icon size={22} className={`mb-1 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
            <span className="text-xs">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default TabNavigation;