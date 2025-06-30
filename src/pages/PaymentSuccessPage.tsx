import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Shield, Zap, ArrowRight, Receipt, Download, Mail } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageContainer from '../components/layout/PageContainer';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  
  useEffect(() => {
    // Refresh subscription status to reflect the new purchase
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Guard Nomand Premium!</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your subscription is now active. Enjoy advanced travel safety features and AI-powered insights.
          </p>
        </div>

        {/* Premium Features Unlocked */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 Premium Features Unlocked</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">AI-Powered Safety Insights</h4>
                <p className="text-sm text-gray-600">Real-time location-based safety analysis and personalized recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Priority Safety Alerts</h4>
                <p className="text-sm text-gray-600">Instant notifications about safety conditions in your location</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Premium Support</h4>
                <p className="text-sm text-gray-600">Priority customer support and 24/7 assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Unlimited Access</h4>
                <p className="text-sm text-gray-600">All premium features and future updates included</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Notice */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Confirmation</h3>
                <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">Confirmation Email Sent</h5>
                <p className="text-blue-700 text-sm mt-1">
                  A detailed receipt and subscription information has been sent to your email address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Start Using Premium Features</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Manage Subscription
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              View Safety Alerts
            </button>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-4">What's Next?</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
              <span>Explore your enhanced dashboard with real-time location-based safety data</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
              <span>Set up personalized safety alerts for your travel destinations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
              <span>Access AI-powered travel insights and location-specific recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
              <span>Download the mobile app for real-time alerts on the go</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help getting started with your premium features?
          </p>
          <a
            href="mailto:support@guardnomand.com"
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