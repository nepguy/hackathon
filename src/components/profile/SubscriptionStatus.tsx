import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Crown, Calendar, CreditCard, RefreshCw, Check, X } from 'lucide-react';

const SubscriptionStatus: React.FC = () => {
  const navigate = useNavigate();
  const { isSubscribed, isLoading, subscription, refreshSubscription } = useSubscription();

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-purple-600" />
            Subscription
          </h3>
        </div>
        <div className="flex justify-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-purple-600" />
            Subscription
          </h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h4>
          <p className="text-gray-600 mb-6">
            Upgrade to Premium to unlock advanced safety features and AI-powered insights.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-colors"
          >
            View Premium Plans
          </button>
        </div>
        
        <div className="mt-6 border-t border-gray-100 pt-6">
          <button
            onClick={() => refreshSubscription()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Subscription Status</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Crown className="w-5 h-5 mr-2 text-purple-600" />
          Premium Subscription
        </h3>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          Active
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Subscription Details */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Guard Nomand Premium
              </h4>
              <p className="text-sm text-gray-600">
                All premium features included
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Next Billing Date</span>
              </div>
              <div className="font-semibold text-gray-900">
                {subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'Unknown'}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <CreditCard className="w-4 h-4" />
                <span>Auto-Renewal</span>
              </div>
              <div className="font-semibold text-gray-900">
                {subscription?.cancel_at_period_end ? 'Disabled' : 'Enabled'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Method */}
        {subscription?.payment_method_brand && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Payment Method</h5>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 capitalize">{subscription.payment_method_brand}</span>
              {subscription.payment_method_last4 && (
                <span className="text-gray-500">•••• {subscription.payment_method_last4}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Subscription Management */}
        <div className="space-y-3">
          <button
            onClick={() => window.open('https://billing.stripe.com/p/login/test_28o5nA9Oj8Ql9OM288', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Manage Subscription</span>
            <CreditCard className="w-5 h-5 text-gray-500" />
          </button>
          
          <button
            onClick={() => window.open('https://billing.stripe.com/p/login/test_28o5nA9Oj8Ql9OM288', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Cancel Subscription</span>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Refresh Button */}
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={() => refreshSubscription()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Subscription Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;