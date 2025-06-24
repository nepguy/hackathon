import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Globe, Map, Bell, User
} from 'lucide-react';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    {
      path: '/home',
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-t border-slate-200/80">
      <div className="container-max flex justify-around items-center h-16 sm:h-20">
        {tabs.map((tab) => {
          const isActive = tab.exactPath
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center h-full w-full group transition-colors duration-200"
            >
              <div className={`
                relative flex items-center justify-center w-12 h-8
                transition-all duration-300 ease-out
              `}>
                <tab.icon 
                  className={`
                    w-6 h-6 transition-all duration-300
                    ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}
                  `} 
                />
              </div>
              <span className={`
                text-xs font-medium transition-all duration-300
                ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}
              `}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-t-full animate-scale-in"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;