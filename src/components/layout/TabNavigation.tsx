import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Globe, Map, Bell, User
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 backdrop-blur-xl">
      <div className="flex justify-around items-center py-2 px-4">
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
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-100 text-blue-600 scale-110' 
                  : 'hover:bg-slate-100/80'
              }`}>
                <tab.icon size={22} />
              </div>
              <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                isActive ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;