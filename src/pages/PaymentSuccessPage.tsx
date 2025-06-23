import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Shield, Zap, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageContainer from '../components/layout/PageContainer';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscriptionStatus } = useSubscription();

  useEffect(() => {
    // In a real implementation, you would:
    // 1. Verify the payment with your backend
    // 2. Update user subscription status in database
    // 3. Send confirmation email
    console.log('Payment successful - updating user subscription status');
    
    // Update trial status to premium
    refreshSubscriptionStatus();
  }, []);

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
          Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GuardNomad Premium!</span>
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Start Using Premium Features</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Manage Subscription
          </button>
        </div>

        {/* What's Next */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-4">What's Next?</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
              <span>Explore your enhanced dashboard with premium features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
              <span>Set up personalized safety alerts for your destinations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
              <span>Access AI-powered travel insights and recommendations</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help getting started?
          </p>
          <a
            href="mailto:support@guardnomad.com"
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