import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import PricingPlans from '../components/payment/PricingPlans';
import RevenueCatPayment from '../components/payment/RevenueCatPayment';
import { Check, Star, Zap, Shield, Globe, Crown } from 'lucide-react';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const planDetails = {
    premium_monthly: {
      name: 'Premium Monthly',
      price: 10.99,
      currency: 'EUR'
    },
    premium_yearly: {
      name: 'Premium Yearly',
      price: 99.99,
      currency: 'EUR'
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    navigate('/payment-success');
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };
  
  // If user is already subscribed, show subscription management instead
  if (isSubscribed) {
    return (
      <PageContainer
        title="Subscription Management"
        subtitle="Manage your premium subscription"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            You're already a Premium member!
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You already have an active premium subscription. You can manage your subscription from your profile.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Subscription
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer
        title="Premium Plans"
        subtitle="Sign in to access premium features"
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Please sign in to view subscription plans
          </h3>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </PageContainer>
    );
  }

  if (showPaymentForm && selectedPlan) {
    const plan = planDetails[selectedPlan as keyof typeof planDetails];
    
    return (
      <PageContainer
        title="Complete Purchase"
        subtitle={`Complete your ${plan.name} subscription`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-gray-600">
                  You're subscribing to premium features
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  €{plan.price}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedPlan.includes('yearly') ? 'per year' : 'per month'}
                </div>
              </div>
            </div>
          </div>

          <RevenueCatPayment
            planId={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Premium Plans"
      subtitle="Unlock advanced travel safety features"
    >
      <div className="max-w-6xl mx-auto">
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Safety First</h3>
            <p className="text-sm text-gray-600">Real-time alerts and protection</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Powered</h3>
            <p className="text-sm text-gray-600">Smart travel insights</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Global Coverage</h3>
            <p className="text-sm text-gray-600">Worldwide travel support</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
            <p className="text-sm text-gray-600">Best-in-class features</p>
          </div>
        </div>

        <PricingPlans onSelectPlan={handleSelectPlan} />
        
        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm">50+ Countries</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PricingPage;