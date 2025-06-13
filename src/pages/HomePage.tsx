import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import WeatherCard from '../components/home/WeatherCard';
import TravelPlanItem from '../components/home/TravelPlanItem';
import SafetyTipCard from '../components/home/SafetyTipCard';
import ActivityItem from '../components/home/ActivityItem';
import CreatePlanModal from '../components/home/CreatePlanModal';
import { 
  currentWeather, safetyTips, travelPlans, recentActivities 
} from '../data/mockData';
import { Calendar, LightbulbIcon, Clock, Plus } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localTravelPlans, setLocalTravelPlans] = useState(travelPlans);

  const handleCreatePlan = (planData: any) => {
    const newPlan = {
      id: String(Date.now()),
      destination: planData.destination,
      startDate: planData.startDate,
      endDate: planData.endDate,
      imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
      safetyScore: 85,
    };
    setLocalTravelPlans([newPlan, ...localTravelPlans]);
  };

  return (
    <>
      <PageContainer>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <WeatherCard weather={currentWeather} />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Calendar size={18} className="mr-2 text-primary-600" />
                Your Travel Plans
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full
                         text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                New Plan
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              {localTravelPlans.map((plan) => (
                <TravelPlanItem key={plan.id} plan={plan} />
              ))}
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Clock size={16} className="mr-2 text-secondary-600" />
                Recent Activity
              </h3>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <LightbulbIcon size={18} className="mr-2 text-accent-500" />
              Safety Tips
            </h2>
            
            <div className="space-y-4">
              {safetyTips.slice(0, 3).map((tip) => (
                <SafetyTipCard key={tip.id} tip={tip} />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
      
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlan}
      />
    </>
  );
};

export default HomePage;