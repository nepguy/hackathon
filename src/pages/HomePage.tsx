import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import PageContainer from '../components/layout/PageContainer';
import { 
  MapPin, Calendar, Shield, TrendingUp, Clock, 
  Plus, ArrowRight, Zap, Globe, AlertTriangle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { currentDestination, destinations } = useUserDestinations();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  const stats = [
    { label: 'Active Alerts', value: '3', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Safety Score', value: '92%', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Destinations', value: destinations.length.toString(), icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const quickActions = [
    { label: 'View Alerts', icon: AlertTriangle, color: 'from-red-500 to-orange-500', path: '/alerts' },
    { label: 'Explore Map', icon: MapPin, color: 'from-blue-500 to-indigo-500', path: '/map' },
    { label: 'Add Destination', icon: Plus, color: 'from-emerald-500 to-teal-500', path: '/explore' },
  ];

  const recentActivity = [
    { type: 'alert', title: 'New safety alert for Bangkok', time: '2 hours ago', severity: 'medium' },
    { type: 'update', title: 'Weather conditions updated', time: '4 hours ago', severity: 'low' },
    { type: 'tip', title: 'New travel tip available', time: '1 day ago', severity: 'info' },
  ];

  return (
    <PageContainer 
      title={`${greeting}, ${user?.user_metadata?.full_name || 'Traveler'}!`}
      subtitle="Stay safe and informed on your journey"
    >
      <div className="space-y-8 stagger-children">
        
        {/* Current Destination Card */}
        {currentDestination && (
          <div className="card p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-100 font-medium">Currently Active</span>
                </div>
                <MapPin className="w-6 h-6 text-blue-200" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {currentDestination.name}, {currentDestination.country}
              </h2>
              
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(currentDestination.startDate).toLocaleDateString()} - 
                    {new Date(currentDestination.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card p-4 text-center">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-500" />
            Quick Actions
          </h3>
          
          <div className="grid gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`card p-4 bg-gradient-to-r ${action.color} text-white hover:shadow-xl transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          
          <div className="card p-6 space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.severity === 'medium' ? 'bg-amber-500' :
                  activity.severity === 'low' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tip of the Day */}
        <div className="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-2">Safety Tip of the Day</h4>
              <p className="text-emerald-800 leading-relaxed">
                Always keep digital copies of important documents stored securely in the cloud. 
                This ensures you can access them even if your physical documents are lost or stolen.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default HomePage;