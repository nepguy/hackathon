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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 shadow-lg">
      <div className="container-max flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = tab.exactPath
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center h-full w-full group transition-colors duration-200 py-2"
            >
              <div className={`
                relative flex items-center justify-center w-12 h-8
                transition-all duration-300 ease-out
              `}>
                <tab.icon 
                  className={`
                    w-5 h-5 transition-all duration-500
                    ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}
                  `} 
                />
              </div>
              <span className={`
                text-[10px] sm:text-xs font-medium transition-all duration-300
                ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}
              `}>
                {tab.label}
                <div className={`h-0.5 w-0 bg-blue-500 mx-auto transition-all duration-300 ${isActive ? 'w-full' : 'group-hover:w-1/2'}`}></div>
              </span>

              {isActive && (
                <div className="absolute bottom-0 w-6 sm:w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-full animate-scale-in"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;