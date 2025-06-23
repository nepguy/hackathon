import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Check, AlertTriangle, RefreshCw, Shield, ArrowRight } from 'lucide-react';

interface RevenueCatPaymentProps {
  planId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RevenueCatPayment: React.FC<RevenueCatPaymentProps> = ({ 
  planId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { purchaseProduct, isLoading } = useSubscription();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get plan details based on planId
  const getPlanDetails = () => {
    const plans = {
      'premium_monthly': {
        name: 'Premium Monthly',
        price: '€10.99',
        period: 'month',
        description: 'Full access to all premium features'
      },
      'premium_yearly': {
        name: 'Premium Yearly',
        price: '€99.99',
        period: 'year',
        description: 'Full access to all premium features (save 24%)'
      }
    };
    
    return plans[planId as keyof typeof plans] || {
      name: 'Unknown Plan',
      price: '€0.00',
      period: 'unknown',
      description: 'Unknown plan details'
    };
  };

  const plan = getPlanDetails();

  const handlePurchase = async () => {
    setStatus('processing');
    setErrorMessage(null);
    
    try {
      const success = await purchaseProduct(planId);
      
      if (success) {
        setStatus('success');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/payment-success');
          }
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('The purchase could not be completed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // Reset status if planId changes
  useEffect(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, [planId]);

  if (status === 'processing' || isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h3>
        <p className="text-gray-600 mb-6">
          Please wait while we securely process your payment...
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Your payment is being processed securely</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
        <p className="text-gray-600 mb-6">
          Welcome to GuardNomad Premium! Your subscription is now active.
        </p>
        <div className="animate-pulse text-blue-600">
          Redirecting to your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600">
          Secure payment for {plan.name}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">{plan.name}</span>
          <span className="font-bold text-gray-900">
            {plan.price}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Billed per {plan.period} • Cancel anytime
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Payment Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* RevenueCat Payment Info */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment with RevenueCat</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your payment will be processed securely through RevenueCat, a trusted payment provider for mobile and web applications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Shield className="w-5 h-5" />
          <span>Subscribe to {plan.name}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default RevenueCatPayment;