import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Zap, Shield, Globe, ArrowRight, X } from 'lucide-react';

import { useStatistics } from '../../lib/userDataService';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { stats } = useStatistics();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const handleContinueFree = () => {
    // User can continue with limited features
    onClose();
    
    // Track that user declined premium
    console.log('User declined premium upgrade after trial');
  };

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Get personalized travel recommendations and real-time safety analysis'
    },
    {
      icon: Shield,
      title: 'Priority Safety Alerts',
      description: 'Instant notifications about safety conditions and travel advisories'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: `Access comprehensive safety data for ${stats.countriesCovered}+ countries worldwide`
    },
    {
      icon: Star,
      title: 'Premium Support',
      description: 'Priority customer support and exclusive travel guides'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your Trial Has Ended</h2>
            <p className="text-xl opacity-90">
              Thanks for trying GuardNomad Premium! Ready to continue your safe travels?
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* What You'll Miss */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Continue with Premium Features
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 text-center">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Special Offer</h4>
            <div className="flex items-baseline justify-center space-x-2 mb-2">
              <span className="text-3xl font-bold text-blue-600">€10.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600">
              Or save 24% with yearly plan • Cancel anytime
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Upgrade to Premium</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleContinueFree}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Continue with Basic Features
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-green-500 mb-1" />
              <span>7-day guarantee</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-5 h-5 text-yellow-500 mb-1" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-5 h-5 text-blue-500 mb-1" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;