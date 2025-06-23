import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import RevenueCatPricing from '../components/payment/RevenueCatPricing';
import { useAuth } from '../contexts/AuthContext';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePurchaseSuccess = () => {
    // Navigate to success page or home
    navigate('/home');
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

  return (
    <PageContainer
      title="Premium Plans"
      subtitle="Unlock advanced travel safety features"
    >
      <div className="max-w-6xl mx-auto">
        <RevenueCatPricing onPurchaseSuccess={handlePurchaseSuccess} />
      </div>
    </PageContainer>
  );
};

export default PricingPage;