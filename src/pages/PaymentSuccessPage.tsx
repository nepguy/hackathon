import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Crown, Shield, Zap } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'processing'>('processing');

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    if (paymentIntent && paymentIntentClientSecret) {
      // Verify payment status with your backend
      verifyPayment(paymentIntent);
    } else {
      setPaymentStatus('error');
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/verify-payment/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'succeeded') {
        setPaymentStatus('success');
        // Update user subscription status in your database
        await updateUserSubscription(data.subscription);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSubscription = async (subscriptionData: any) => {
    try {
      // Update user subscription in Supabase or your database
      console.log('Updating user subscription:', subscriptionData);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your subscription...</p>
        </div>
      </PageContainer>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
          <p className="text-gray-600 mb-8">
            There was an issue processing your payment. Please try again or contact support.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto text-center py-16">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TravelSafe Premium!</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your subscription is now active. Enjoy advanced travel safety features and AI-powered insights.
        </p>

        {/* Premium Features Unlocked */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 Premium Features Unlocked</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">AI-Powered Insights</h4>
                <p className="text-sm text-gray-600">Personalized travel recommendations and real-time analysis</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Priority Safety Alerts</h4>
                <p className="text-sm text-gray-600">Instant notifications about safety conditions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Premium Support</h4>
                <p className="text-sm text-gray-600">Priority customer support and assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Unlimited Access</h4>
                <p className="text-sm text-gray-600">All premium features and future updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Start Using Premium Features
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Manage Subscription
          </button>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help getting started?
          </p>
          <a
            href="mailto:support@travelsafe.com"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Contact Premium Support
          </a>
        </div>
      </div>
    </PageContainer>
  );
};

export default PaymentSuccessPage;