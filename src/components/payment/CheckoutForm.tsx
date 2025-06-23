import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Shield, Lock, CreditCard, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutFormProps {
  planId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  planId,
  amount,
  currency,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          planId,
          userId: user?.id,
        }),
      });

      const { client_secret } = await response.json();

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
        <p className="text-gray-600 mb-6">
          Welcome to TravelSafe Premium! Your subscription is now active.
        </p>
        <div className="animate-pulse text-blue-600">
          Redirecting to your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
          <p className="text-gray-600">
            Secure payment for TravelSafe Premium
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">TravelSafe Premium</span>
            <span className="font-bold text-gray-900">
              {new Intl.NumberFormat('en-EU', {
                style: 'currency',
                currency: currency,
              }).format(amount)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Monthly subscription • Cancel anytime
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-800 font-medium">Payment Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Information
            </label>
            <div className="border border-gray-300 rounded-lg p-4">
              <PaymentElement
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
          </div>

          {/* Address Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Address
            </label>
            <div className="border border-gray-300 rounded-lg p-4">
              <AddressElement
                options={{
                  mode: 'billing',
                }}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Payment</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Your payment information is encrypted and secure. We use Stripe for payment processing.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Pay Securely</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;