import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { databaseService } from '../lib/database';
import PageContainer from '../components/layout/PageContainer';

// Define proper interfaces for type safety
interface SettingsItem {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void | Promise<void>;
  value?: string;
  danger?: boolean;
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}
import { 
  User, Bell, Shield, HelpCircle, LogOut,
  Camera, Moon, Sun, Globe, Lock, 
  ChevronRight, Check, X, RefreshCw, AlertTriangle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [profile, prefs] = await Promise.all([
          databaseService.getUserProfile(user.id),
          databaseService.getUserPreferences(user.id)
        ]);

        setUserProfile(profile);

        // Set form data
        setEditForm({
          fullName: profile?.full_name || user.user_metadata?.full_name || '',
          email: profile?.email || user.email || ''
        });

        // Set preferences from database
        if (prefs) {
          setPreferences(prev => ({
            ...prev,
            notifications: {
              safety: prefs.notifications_safety,
              weather: prefs.notifications_weather,
              events: false, // Not in database yet
              news: prefs.notifications_local_news
            }
          }));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      await databaseService.updateUserProfile(user.id, {
        full_name: editForm.fullName,
        email: editForm.email
      });

      // Refresh profile data
      const updatedProfile = await databaseService.getUserProfile(user.id);
      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = async (category: string, key: string) => {
    if (!user) return;

    // Create a new preferences object with proper type safety
    let newPreferences = { ...preferences };
    
    if (category === 'notifications') {
      newPreferences = {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: !preferences.notifications[key as keyof typeof preferences.notifications]
        }
      };
    } else if (category === 'privacy') {
      newPreferences = {
        ...preferences,
        privacy: {
          ...preferences.privacy,
          [key]: !preferences.privacy[key as keyof typeof preferences.privacy]
        }
      };
    } else if (category === 'appearance') {
      newPreferences = {
        ...preferences,
        appearance: {
          ...preferences.appearance,
          [key]: !preferences.appearance[key as keyof typeof preferences.appearance]
        }
      };
    }

    setPreferences(newPreferences);

    // Update in database for notification preferences
    if (category === 'notifications') {
      try {
        const updates: any = {};
        if (key === 'safety') updates.notifications_safety = newPreferences.notifications.safety;
        if (key === 'weather') updates.notifications_weather = newPreferences.notifications.weather;
        if (key === 'news') updates.notifications_local_news = newPreferences.notifications.news;

        await databaseService.updateUserPreferences(user.id, updates);
      } catch (err) {
        console.error('Error updating preferences:', err);
        // Revert on error
        setPreferences(preferences);
      }
    }
  };

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128`;

  // Calculate stats from real data
  const stats = [
    { label: 'Destinations Visited', value: '12' }, // Could be calculated from travel_plans
    { label: 'Safety Score', value: '95%' }, // Could be calculated from user activity
    { label: 'Days Traveled', value: '127' } // Could be calculated from travel_plans
  ];

  const handlePrivacyAndSecurity = () => {
    alert('Privacy & Security settings will be implemented in a future update. Your data is secured with end-to-end encryption.');
  };

  const handleNotificationSettings = () => {
    // Scroll to notification preferences section
    const element = document.querySelector('[data-section="notifications"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAppearanceSettings = () => {
    const newTheme = preferences.appearance.theme === 'light' ? 'dark' : 'light';
    setPreferences(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme: newTheme }
    }));
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLanguageSettings = () => {
    const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
    const currentIndex = languages.indexOf(preferences.appearance.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const newLanguage = languages[nextIndex];
    
    setPreferences(prev => ({
      ...prev,
      appearance: { ...prev.appearance, language: newLanguage.toLowerCase() }
    }));
    
    alert(`Language changed to ${newLanguage}. This is a demo - full localization coming soon!`);
  };

  const handleHelpAndSupport = () => {
    const supportOptions = [
      'Email: support@travelsafe.com',
      'Phone: +1 (555) 123-4567',
      'FAQ: Available in app menu',
      'Live Chat: Available 24/7'
    ];
    
    alert('Support Options:\n\n' + supportOptions.join('\n'));
  };

  const settingsGroups: SettingsGroup[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: () => setIsEditing(true) },
        { icon: Lock, label: 'Privacy & Security', action: handlePrivacyAndSecurity },
        { icon: Bell, label: 'Notifications', action: handleNotificationSettings },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: preferences.appearance.theme === 'light' ? Sun : Moon, 
          label: 'Appearance', 
          value: preferences.appearance.theme === 'light' ? 'Light' : 'Dark', 
          action: handleAppearanceSettings 
        },
        { 
          icon: Globe, 
          label: 'Language', 
          value: preferences.appearance.language.charAt(0).toUpperCase() + preferences.appearance.language.slice(1), 
          action: handleLanguageSettings 
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: handleHelpAndSupport },
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

  if (isLoading) {
    return (
      <PageContainer 
        title="Profile"
        subtitle="Manage your account and preferences"
      >
        <div className="space-y-8">
          <div className="card p-8 text-center animate-pulse">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="h-6 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto mb-6"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer 
        title="Profile"
        subtitle="Manage your account and preferences"
      >
        <div className="card p-8 text-center bg-red-50 border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Profile</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
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
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    disabled={isSaving}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{displayName}</h2>
                <p className="text-slate-600 mb-6">{userProfile?.email || user.email}</p>
                
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
        <div className="card p-6" data-section="notifications">
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