import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import ProfileHeader from '../components/profile/ProfileHeader';
import SettingsSection from '../components/profile/SettingsSection';
import NotificationPreferences from '../components/profile/NotificationPreferences';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [notificationPreferences, setNotificationPreferences] = useState({
    weather: true,
    security: true,
    health: true,
    transportation: true,
  });
  
  const handlePreferenceChange = (
    type: keyof typeof notificationPreferences, 
    value: boolean
  ) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [type]: value,
    });
  };

  if (!user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader user={user} />
      
      <SettingsSection />
      
      <NotificationPreferences 
        preferences={notificationPreferences}
        onPreferenceChange={handlePreferenceChange}
      />
    </PageContainer>
  );
};

export default ProfilePage;