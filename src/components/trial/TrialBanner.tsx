import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Clock, X, Zap, ArrowRight } from 'lucide-react';
import { useTrial } from '../../contexts/TrialContext';

const TrialBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isTrialActive, trialDaysRemaining, isTrialExpired } = useTrial();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if dismissed or if user is premium
  if (isDismissed || (!isTrialActive && !isTrialExpired)) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isTrialExpired) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg animate-slide-down-from-top">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">Your 3-day trial has expired</p>
                <p className="text-sm opacity-90">Upgrade to Premium to continue using advanced features</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUpgrade}
                className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Upgrade Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTrialActive) {
    const urgencyLevel = trialDaysRemaining <= 1 ? 'urgent' : trialDaysRemaining <= 2 ? 'warning' : 'info';
    
    const bgColor = {
      urgent: 'from-red-600 to-pink-600',
      warning: 'from-amber-500 to-orange-600',
      info: 'from-blue-600 to-purple-600'
    }[urgencyLevel];

    return (
      <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${bgColor} text-white shadow-lg animate-slide-down-from-top`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">
                  {trialDaysRemaining === 0 
                    ? 'Trial expires today!' 
                    : `${trialDaysRemaining} day${trialDaysRemaining > 1 ? 's' : ''} left in your trial`
                  }
                </p>
                <p className="text-sm opacity-90">
                  Enjoying GuardNomad? Upgrade to keep all premium features
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUpgrade}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;