import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import { 
  User, Settings, Bell, Shield, HelpCircle, LogOut,
  Edit2, Camera, Moon, Sun, Globe, Lock, 
  ChevronRight, Check, X
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  });
  
  const [preferences, setPreferences] = useState({
    notifications: {
      safety: true,
      weather: true,
      events: false,
      news: true
    },
    privacy: {
      shareLocation: false,
      publicProfile: false
    },
    appearance: {
      theme: 'light',
      language: 'en'
    }
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically update the user profile
    setIsEditing(false);
  };

  const togglePreference = (category: string, key: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: !prev[category as keyof typeof prev][key as keyof typeof prev[typeof category]]
      }
    }));
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128`;

  const stats = [
    { label: 'Destinations Visited', value: '12' },
    { label: 'Safety Score', value: '95%' },
    { label: 'Days Traveled', value: '127' }
  ];

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: () => setIsEditing(true) },
        { icon: Lock, label: 'Privacy & Security', action: () => {} },
        { icon: Bell, label: 'Notifications', action: () => {} },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Appearance', value: 'Light', action: () => {} },
        { icon: Globe, label: 'Language', value: 'English', action: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: () => {} },
        { icon: LogOut, label: 'Sign Out', action: handleSignOut, danger: true },
      ]
    }
  ];

  if (!user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Profile"
      subtitle="Manage your account and preferences"
    >
      <div className="space-y-8 stagger-children">
        
        {/* Profile Header */}
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 max-w-sm mx-auto">
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="input text-center"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="input text-center"
                  placeholder="Email"
                />
                <div className="flex space-x-3 justify-center">
                  <button onClick={handleSaveProfile} className="btn-primary flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-outline flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{displayName}</h2>
                <p className="text-slate-600 mb-6">{user.email}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 capitalize">{key} Alerts</div>
                  <div className="text-sm text-slate-600">
                    Receive notifications about {key.toLowerCase()} updates
                  </div>
                </div>
                <button
                  onClick={() => togglePreference('notifications', key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider px-1">
              {group.title}
            </h3>
            
            <div className="card p-0 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-slate-100' : ''
                  } ${item.danger ? 'text-red-600 hover:bg-red-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-500' : 'text-slate-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.value && (
                      <span className="text-sm text-slate-500">{item.value}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="card p-6 text-center bg-gradient-to-r from-slate-50 to-blue-50">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 mb-2">TravelSafe</h4>
          <p className="text-sm text-slate-600 mb-3">
            Your trusted companion for safe travels worldwide
          </p>
          <div className="text-xs text-slate-500">
            Version 1.0.0 • Made with ❤️ for travelers
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;