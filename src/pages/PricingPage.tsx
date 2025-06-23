import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageContainer from '../components/layout/PageContainer';
import PricingPlans from '../components/payment/PricingPlans';
import PaymentForm from '../components/payment/PaymentForm';
import RevenueCatPayment from '../components/payment/RevenueCatPayment';
import { useAuth } from '../contexts/AuthContext';

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
        subtitle="Complete your subscription"
      >
        <RevenueCatPayment
          planId={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Premium Plans"
      subtitle="Unlock advanced travel safety features"
    >
      <div className="max-w-6xl mx-auto">
        <PricingPlans onSelectPlan={handleSelectPlan} />
      </div>
    </PageContainer>
  );
};

export default PricingPage;