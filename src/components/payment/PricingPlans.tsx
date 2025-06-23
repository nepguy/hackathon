import React, { useState } from 'react';
import { Check, Star, Zap, Shield, Globe, Crown } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PaymentService } from '../../lib/stripe';
import { useAuth } from '../../contexts/AuthContext';

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const paymentService = PaymentService.getInstance();

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      alert('Please sign in to subscribe to a plan');
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      await onSelectPlan(planId);
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId.includes('yearly')) return Crown;
    return Star;
  };

  const getPlanColor = (planId: string, popular?: boolean) => {
    if (popular) return 'from-blue-600 to-purple-600';
    if (planId.includes('yearly')) return 'from-amber-500 to-orange-600';
    return 'from-emerald-500 to-teal-600';
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium Plan</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock advanced travel safety features and AI-powered insights to make your journeys safer and more informed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = getPlanIcon(plan.id);
          const isPopular = plan.popular;
          const isYearly = plan.interval === 'year';
          const isSelected = selectedPlan === plan.id;
          const isProcessing = isLoading && isSelected;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getPlanColor(plan.id, isPopular)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {paymentService.formatPrice(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                  {isYearly && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Save 24% annually
                      </span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Get Premium Access</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure payment powered by Stripe</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Why Choose Premium?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h4>
            <p className="text-gray-600 text-sm">
              Get personalized travel recommendations and real-time safety analysis powered by advanced AI.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Priority Safety Alerts</h4>
            <p className="text-gray-600 text-sm">
              Receive instant notifications about safety conditions, weather changes, and travel advisories.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Global Coverage</h4>
            <p className="text-gray-600 text-sm">
              Access comprehensive safety data and travel insights for 195+ countries worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-6 py-3 rounded-full">
          <Shield className="w-5 h-5" />
          <span className="font-medium">30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;