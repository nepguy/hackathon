import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatistics } from '../lib/userStatisticsService';
import { databaseService } from '../lib/database';
import PageContainer from '../components/layout/PageContainer';
import SubscriptionStatus from '../components/profile/SubscriptionStatus';
import { 
  User, Settings, Shield, HelpCircle, LogOut,
  Camera, ChevronRight, TrendingUp, MapPin,
  Calendar, Award, Clock, Globe, Bell,
  Lock, Smartphone
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { statistics } = useUserStatistics();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profile = await databaseService.getUserProfile(user.id);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128`;

  // Real statistics from Supabase
  const stats = statistics ? [
    { 
      icon: MapPin,
      label: 'Travel Plans', 
      value: statistics.travel_plans_count.toString(),
      trend: statistics.travel_plans_count > 10 ? 'World Explorer' : statistics.travel_plans_count > 5 ? 'Active Traveler' : 'Getting Started',
      color: 'text-blue-600'
    },
    { 
      icon: Shield,
      label: 'Safety Score', 
      value: `${statistics.safety_score}%`,
      trend: statistics.safety_score >= 95 ? 'Excellent' : statistics.safety_score >= 85 ? 'Very Good' : 'Good',
      color: 'text-green-600'
    },
    { 
      icon: Calendar,
      label: 'Days Tracked', 
      value: statistics.days_tracked.toString(),
      trend: statistics.days_tracked > 100 ? 'Experienced' : statistics.days_tracked > 30 ? 'Regular' : 'Beginner',
      color: 'text-purple-600'
    },
    { 
      icon: Award,
      label: 'Achievement Level', 
      value: statistics.travel_plans_count > 20 ? 'Expert' : statistics.travel_plans_count > 10 ? 'Advanced' : statistics.travel_plans_count > 5 ? 'Intermediate' : 'Beginner',
      trend: 'Based on travel activity',
      color: 'text-yellow-600'
    }
  ] : [];

  const quickActions = [
    {
      icon: User,
      title: 'Personal Information',
      description: 'Manage your private details and emergency contacts',
      action: () => navigate('/personal-info'),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100'
    },
    {
      icon: Settings,
      title: 'App Settings',
      description: 'Customize notifications, privacy, and preferences',
      action: () => navigate('/profile-settings'),
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      iconBg: 'bg-gray-100'
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Get help, report issues, and contact support',
      action: () => {
        const supportOptions = [
          'Email: support@guardnomad.com',
          'Phone: +1 (555) 123-4567',
          'FAQ: Available in app menu',
          'Live Chat: Available 24/7'
        ];
        alert('Support Options:\n\n' + supportOptions.join('\n'));
      },
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconBg: 'bg-purple-100'
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      status: 'Active',
      statusColor: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Privacy Protection',
      status: 'Enabled',
      statusColor: 'text-green-600'
    },
    {
      icon: Bell,
      title: 'Emergency Alerts',
      status: 'Configured',
      statusColor: 'text-blue-600'
    },
    {
      icon: Smartphone,
      title: 'Two-Factor Auth',
      status: 'Recommended',
      statusColor: 'text-yellow-600'
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
        subtitle="Manage your account and travel preferences"
      >
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-8 animate-pulse">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Profile"
      subtitle="Manage your account and travel preferences"
    >
      <div className="space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h2>
                <p className="text-gray-600 mb-1">{userProfile?.email || user.email}</p>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Global Traveler
                  </span>
                </div>
                
                {/* Quick Status */}
                <div className="mt-4 flex items-center justify-center md:justify-start space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active Traveler</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-6 rounded-2xl border-2 text-left hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${action.color}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${action.iconBg}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <div className="flex items-center text-sm font-medium">
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Security Overview */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Security & Privacy Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <feature.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{feature.title}</span>
                </div>
                <div className={`text-sm font-medium ${feature.statusColor}`}>
                  {feature.status}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Your Account is Secure</h4>
                <p className="text-sm text-green-700">
                  All security features are active. Your personal data is encrypted and protected according to international privacy standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/alerts')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">View Travel Activity</span>
                  <p className="text-sm text-gray-600">See your recent alerts and travel history</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-gray-900">Explore Destinations</span>
                  <p className="text-sm text-gray-600">Discover new places and travel stories</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <div className="border-t pt-3 mt-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-red-50 rounded-xl transition-colors text-red-600"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5" />
                  <div>
                    <span className="font-medium">Sign Out</span>
                    <p className="text-sm text-red-500">Sign out of your GuardNomad account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 mb-2">Guard Nomand</h4>
          <p className="text-sm text-gray-600 mb-3">
            Your trusted companion for safe travels worldwide
          </p>
          <div className="text-xs text-gray-500">
            Version 1.0.0 • Made with ❤️ for travelers
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;