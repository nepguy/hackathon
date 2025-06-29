import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { databaseService } from '../lib/database';
import PageContainer from '../components/layout/PageContainer';
import LanguageSelector from '../components/common/LanguageSelector';
import SubscriptionManagement from '../components/payment/SubscriptionManagement';
import { 
  Bell, Shield, Moon, Sun, 
  Lock, Smartphone, MapPin,
  CheckCircle, AlertTriangle, Settings
} from 'lucide-react';

const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage } = useTranslation();
  const { } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState({
    notifications: {
      safety: true,
      weather: true,
      events: false,
      news: true,
      push: true,
      email: false,
      sms: false
    },
    privacy: {
      shareLocation: false,
      publicProfile: false,
      showOnlineStatus: true,
      allowMessages: false
    },
    appearance: {
      theme: 'light',
      language: currentLanguage,
      compactMode: false,
      animations: true
    },
    travel: {
      autoDetectLocation: true,
      offlineMode: false,
      emergencySharing: true,
      travelReminders: true
    }
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const prefs = await databaseService.getUserPreferences(user.id);

      if (prefs) {
        setPreferences(prev => ({
          ...prev,
          notifications: {
            safety: prefs.notifications_safety ?? true,
            weather: prefs.notifications_weather ?? true,
            events: prefs.notifications_events ?? false,
            news: prefs.notifications_local_news ?? true,
            push: prefs.push_notifications ?? true,
            email: prefs.email_notifications ?? false,
            sms: prefs.sms_notifications ?? false
          },
          privacy: {
            shareLocation: prefs.share_location ?? false,
            publicProfile: prefs.public_profile ?? false,
            showOnlineStatus: prefs.show_online_status ?? true,
            allowMessages: prefs.allow_messages ?? false
          },
          appearance: {
            theme: prefs.theme || 'light',
            language: prefs.language || currentLanguage,
            compactMode: prefs.compact_mode ?? false,
            animations: prefs.animations ?? true
          },
          travel: {
            autoDetectLocation: prefs.auto_detect_location ?? true,
            offlineMode: prefs.offline_mode ?? false,
            emergencySharing: prefs.emergency_sharing ?? true,
            travelReminders: prefs.travel_reminders ?? true
          }
        }));
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (category: string, key: string, value: boolean | string) => {
    if (!user) {
      console.error('❌ No user found for updating preferences');
      return;
    }

    console.log('🔧 Updating preference:', { category, key, value, userId: user.id });

    // Update local state immediately
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));

    try {
      // Map to database fields
      const updates: any = {};
      
      if (category === 'notifications') {
        if (key === 'safety') updates.notifications_safety = value;
        if (key === 'weather') updates.notifications_weather = value;
        if (key === 'events') updates.notifications_events = value;
        if (key === 'news') updates.notifications_local_news = value;
        if (key === 'push') updates.push_notifications = value;
        if (key === 'email') updates.email_notifications = value;
        if (key === 'sms') updates.sms_notifications = value;
      } else if (category === 'privacy') {
        if (key === 'shareLocation') updates.share_location = value;
        if (key === 'publicProfile') updates.public_profile = value;
        if (key === 'showOnlineStatus') updates.show_online_status = value;
        if (key === 'allowMessages') updates.allow_messages = value;
      } else if (category === 'appearance') {
        if (key === 'theme') updates.theme = value;
        if (key === 'language') updates.language = value;
        if (key === 'compactMode') updates.compact_mode = value;
        if (key === 'animations') updates.animations = value;
      } else if (category === 'travel') {
        if (key === 'autoDetectLocation') updates.auto_detect_location = value;
        if (key === 'offlineMode') updates.offline_mode = value;
        if (key === 'emergencySharing') updates.emergency_sharing = value;
        if (key === 'travelReminders') updates.travel_reminders = value;
      }

      await databaseService.updateUserPreferences(user.id, updates);
      
      // Show success message
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(null), 2000);

      // Apply theme changes immediately
      if (category === 'appearance' && key === 'theme') {
        document.documentElement.setAttribute('data-theme', value as string);
        document.documentElement.classList.toggle('dark', value === 'dark');
        localStorage.setItem('guardnomad-theme', value as string);
      }

    } catch (err) {
      console.error('Error updating preference:', err);
      // Revert local state on error
      loadPreferences();
      setError('Failed to update settings');
      setTimeout(() => setError(null), 3000);
    }
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        enabled ? 'translate-x-7' : 'translate-x-1'
      }`}></div>
    </button>
  );

  const SettingsSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, icon, children, description }) => (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingsItem: React.FC<{
    title: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  }> = ({ title, description, enabled, onChange }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  );

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
        title="Settings"
        subtitle="Customize your app experience and preferences"
      >
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Settings"
      subtitle="Customize your app experience and preferences"
    >
      <div className="space-y-6">
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Subscription Management */}
        <SubscriptionManagement />

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          icon={<Bell className="w-6 h-6 text-blue-600" />}
          description="Choose which notifications you want to receive"
        >
          <SettingsItem
            title="Safety Alerts"
            description="Get notified about safety warnings and security threats"
            enabled={preferences.notifications.safety}
            onChange={(value) => updatePreference('notifications', 'safety', value)}
          />
          <SettingsItem
            title="Weather Updates"
            description="Receive weather alerts and severe weather warnings"
            enabled={preferences.notifications.weather}
            onChange={(value) => updatePreference('notifications', 'weather', value)}
          />
          <SettingsItem
            title="Local Events"
            description="Get notified about events and activities in your area"
            enabled={preferences.notifications.events}
            onChange={(value) => updatePreference('notifications', 'events', value)}
          />
          <SettingsItem
            title="Travel News"
            description="Stay updated with travel-related news and updates"
            enabled={preferences.notifications.news}
            onChange={(value) => updatePreference('notifications', 'news', value)}
          />
          
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Delivery Methods
            </h4>
            <div className="space-y-3">
              <SettingsItem
                title="Push Notifications"
                description="Receive instant notifications on your device"
                enabled={preferences.notifications.push}
                onChange={(value) => updatePreference('notifications', 'push', value)}
              />
              <SettingsItem
                title="Email Notifications"
                description="Get notifications via email (daily digest)"
                enabled={preferences.notifications.email}
                onChange={(value) => updatePreference('notifications', 'email', value)}
              />
              <SettingsItem
                title="SMS Alerts"
                description="Receive critical alerts via SMS (emergency only)"
                enabled={preferences.notifications.sms}
                onChange={(value) => updatePreference('notifications', 'sms', value)}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection
          title="Privacy & Security"
          icon={<Lock className="w-6 h-6 text-red-600" />}
          description="Control your privacy and data sharing preferences"
        >
          <SettingsItem
            title="Share Location"
            description="Allow other travelers to see your general location"
            enabled={preferences.privacy.shareLocation}
            onChange={(value) => updatePreference('privacy', 'shareLocation', value)}
          />
          <SettingsItem
            title="Public Profile"
            description="Make your travel experiences visible to other users"
            enabled={preferences.privacy.publicProfile}
            onChange={(value) => updatePreference('privacy', 'publicProfile', value)}
          />
          <SettingsItem
            title="Show Online Status"
            description="Let other users see when you're online"
            enabled={preferences.privacy.showOnlineStatus}
            onChange={(value) => updatePreference('privacy', 'showOnlineStatus', value)}
          />
          <SettingsItem
            title="Allow Messages"
            description="Allow other travelers to send you messages"
            enabled={preferences.privacy.allowMessages}
            onChange={(value) => updatePreference('privacy', 'allowMessages', value)}
          />
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Data Protection</h4>
                <p className="text-sm text-green-700">
                  All your data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance Settings */}
        <SettingsSection
          title="Appearance"
          icon={preferences.appearance.theme === 'light' ? 
            <Sun className="w-6 h-6 text-yellow-600" /> : 
            <Moon className="w-6 h-6 text-blue-600" />
          }
          description="Customize the look and feel of the app"
        >
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Theme Mode</div>
              <div className="text-sm text-gray-600">Choose between light and dark theme</div>
            </div>
            <button
              onClick={() => updatePreference('appearance', 'theme', preferences.appearance.theme === 'light' ? 'dark' : 'light')}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                preferences.appearance.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform flex items-center justify-center ${
                preferences.appearance.theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
              }`}>
                {preferences.appearance.theme === 'dark' ? 
                  <Moon className="w-3 h-3 text-blue-600" /> : 
                  <Sun className="w-3 h-3 text-yellow-600" />
                }
              </div>
            </button>
          </div>

          <SettingsItem
            title="Compact Mode"
            description="Use a more compact interface with smaller elements"
            enabled={preferences.appearance.compactMode}
            onChange={(value) => updatePreference('appearance', 'compactMode', value)}
          />
          <SettingsItem
            title="Animations"
            description="Enable smooth animations and transitions"
            enabled={preferences.appearance.animations}
            onChange={(value) => updatePreference('appearance', 'animations', value)}
          />

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div>
              <div className="font-medium text-gray-900">App Language</div>
              <div className="text-sm text-gray-600">Select your preferred language</div>
            </div>
            <LanguageSelector />
          </div>
        </SettingsSection>

        {/* Travel Settings */}
        <SettingsSection
          title="Travel Preferences"
          icon={<MapPin className="w-6 h-6 text-green-600" />}
          description="Configure travel-specific features and settings"
        >
          <SettingsItem
            title="Auto-Detect Location"
            description="Automatically detect your location for relevant alerts"
            enabled={preferences.travel.autoDetectLocation}
            onChange={(value) => updatePreference('travel', 'autoDetectLocation', value)}
          />
          <SettingsItem
            title="Offline Mode"
            description="Download content for offline access during travel"
            enabled={preferences.travel.offlineMode}
            onChange={(value) => updatePreference('travel', 'offlineMode', value)}
          />
          <SettingsItem
            title="Emergency Sharing"
            description="Share your location with emergency contacts when traveling"
            enabled={preferences.travel.emergencySharing}
            onChange={(value) => updatePreference('travel', 'emergencySharing', value)}
          />
          <SettingsItem
            title="Travel Reminders"
            description="Get reminders about upcoming trips and preparations"
            enabled={preferences.travel.travelReminders}
            onChange={(value) => updatePreference('travel', 'travelReminders', value)}
          />
        </SettingsSection>

        {/* App Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h4 className="font-bold text-gray-900">GuardNomad Settings</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Customize your travel safety experience with personalized settings
            </p>
            <div className="text-xs text-gray-500">
              Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfileSettingsPage; 