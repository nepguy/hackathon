import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Crown, Calendar, CreditCard, RefreshCw, AlertTriangle, Check, X } from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isSubscribed, 
    productId, 
    expiresDate, 
    willRenew,
    isLoading,
    restorePurchases,
    refreshSubscriptionStatus
  } = useSubscription();
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductName = (id: string | null): string => {
    if (!id) return 'Unknown Plan';
    
    if (id.includes('monthly')) return 'Premium Monthly';
    if (id.includes('yearly')) return 'Premium Yearly';
    
    return 'Premium Plan';
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setRestoreError(null);
    setRestoreSuccess(false);
    
    try {
      await restorePurchases();
      setRestoreSuccess(true);
      
      // Refresh status after a short delay
      setTimeout(() => {
        refreshSubscriptionStatus();
      }, 1000);
    } catch (error) {
      setRestoreError('Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
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
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isRestoring ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Restore Purchases</span>
          </button>
          
          {restoreError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{restoreError}</span>
              </div>
            </div>
          )}
          
          {restoreSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Purchases restored successfully!</span>
              </div>
            </div>
          )}
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
                {getProductName(productId)}
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
                {formatDate(expiresDate)}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <CreditCard className="w-4 h-4" />
                <span>Auto-Renewal</span>
              </div>
              <div className="font-semibold text-gray-900">
                {willRenew ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Management */}
        <div className="space-y-3">
          <button
            onClick={() => window.open('https://www.revenuecat.com/manage', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Manage Subscription</span>
            <CreditCard className="w-5 h-5 text-gray-500" />
          </button>
          
          <button
            onClick={() => window.open('https://www.revenuecat.com/cancel', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Cancel Subscription</span>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Restore Purchases */}
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isRestoring ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Restore Purchases</span>
          </button>
          
          {restoreError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{restoreError}</span>
              </div>
            </div>
          )}
          
          {restoreSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Purchases restored successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;