import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { stripePromise } from '../../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { SUBSCRIPTION_PLANS } from '../../lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId);

  useEffect(() => {
    if (isOpen && selectedPlan) {
      createPaymentIntent();
    }
  }, [isOpen, selectedPlan]);

  const createPaymentIntent = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(selectedPlan.price * 100), // Convert to cents
          currency: selectedPlan.currency.toLowerCase(),
          planId: selectedPlan.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.client_secret);
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Payment intent creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing secure payment...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={createPaymentIntent}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : clientSecret && selectedPlan ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm
              planId={selectedPlan.id}
              amount={selectedPlan.price}
              currency={selectedPlan.currency}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentModal;