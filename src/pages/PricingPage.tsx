import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PricingPlans from '../components/payment/PricingPlans';
import PaymentForm from '../components/payment/PaymentForm';
import { useAuth } from '../contexts/AuthContext';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        title="Secure Payment"
        subtitle="Complete your subscription"
      >
        <PaymentForm
          planId={selectedPlan}
          planName={plan.name}
          amount={plan.price}
          currency={plan.currency}
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