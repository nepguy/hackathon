import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PricingPlans from '../components/payment/PricingPlans';
import PaymentModal from '../components/payment/PaymentModal';
import { useAuth } from '../contexts/AuthContext';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Update user subscription status
    // This would typically involve updating the user's subscription in your database
    alert('Welcome to TravelSafe Premium! Your subscription is now active.');
    navigate('/home');
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPlanId(null);
  };

  return (
    <PageContainer
      title="Premium Plans"
      subtitle="Unlock advanced travel safety features"
    >
      <div className="max-w-6xl mx-auto">
        <PricingPlans onSelectPlan={handleSelectPlan} />
        
        {selectedPlanId && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handleCloseModal}
            planId={selectedPlanId}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default PricingPage;