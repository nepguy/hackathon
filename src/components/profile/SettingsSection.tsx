import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Moon, Bell, Lock, HelpCircle, LogOut,
  ChevronRight 
} from 'lucide-react';

const SettingsSection: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Appearance',
          value: 'Light',
          color: 'text-indigo-500',
        },
        {
          icon: Bell,
          label: 'Notifications',
          value: 'On',
          color: 'text-accent-500',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Lock,
          label: 'Privacy',
          color: 'text-primary-500',
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          color: 'text-secondary-500',
        },
        {
          icon: LogOut,
          label: 'Log out',
          color: 'text-danger-500',
          onClick: handleSignOut,
        },
      ],
    },
  ];

  return (
    <div className="mt-2">
      {settingsGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4 sm:mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 px-1">
            {group.title}
          </h3>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {group.items.map((item, itemIndex) => (
              <div 
                key={itemIndex}
                className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-100 transition-colors ${
                  itemIndex !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={item.onClick}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`${item.color}`}>
                    <item.icon size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-gray-900 font-medium text-sm">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && (
                    <span className="text-xs sm:text-sm text-gray-500 mr-2">{item.value}</span>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsSection;