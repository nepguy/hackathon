import React from 'react';
import { CloudRain, Shield, Stethoscope, Bus } from 'lucide-react';

interface NotificationPreferencesProps {
  preferences: {
    weather: boolean;
    security: boolean;
    health: boolean;
    transportation: boolean;
  };
  onPreferenceChange: (type: keyof NotificationPreferencesProps['preferences'], value: boolean) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ 
  preferences, 
  onPreferenceChange 
}) => {
  const preferencesConfig = [
    {
      type: 'weather' as keyof NotificationPreferencesProps['preferences'],
      label: 'Weather Alerts',
      icon: CloudRain,
      color: 'text-primary-500',
    },
    {
      type: 'security' as keyof NotificationPreferencesProps['preferences'],
      label: 'Security Alerts',
      icon: Shield,
      color: 'text-danger-500',
    },
    {
      type: 'health' as keyof NotificationPreferencesProps['preferences'],
      label: 'Health Alerts',
      icon: Stethoscope,
      color: 'text-secondary-500',
    },
    {
      type: 'transportation' as keyof NotificationPreferencesProps['preferences'],
      label: 'Transportation Alerts',
      icon: Bus,
      color: 'text-accent-500',
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
        Notification Preferences
      </h3>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {preferencesConfig.map((pref, index) => (
          <div 
            key={pref.type}
            className={`flex items-center justify-between p-4 ${
              index !== preferencesConfig.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center">
              <div className={`mr-3 ${pref.color}`}>
                <pref.icon size={20} />
              </div>
              <span className="text-gray-900 font-medium">{pref.label}</span>
            </div>
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences[pref.type]}
                  onChange={(e) => onPreferenceChange(pref.type, e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full 
                                rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                after:transition-all peer-checked:bg-primary-600">
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPreferences;