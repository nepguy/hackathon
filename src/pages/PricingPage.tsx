import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import StripeCheckout from '../components/payment/StripeCheckout';
import { Check, Star, Zap, Shield, Globe, Crown } from 'lucide-react';
import { useStatistics } from '../lib/userDataService';
import { STRIPE_CONFIG } from '../config/stripe';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const { stats } = useStatistics();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelectPlan = (priceId: string) => {
    setSelectedPlan(priceId);
    setShowCheckout(true);
  };

  const handleCancelCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };
  
  // If user is already subscribed, show subscription management instead
  if (isSubscribed) {
    return (
      <PageContainer
        title="Subscription Management"
        subtitle="Manage your premium subscription"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            You're already a Premium member!
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You already have an active premium subscription. You can manage your subscription from your profile.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Subscription
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer
        title="Premium Plans"
        subtitle="Sign in to access premium features"
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Please sign in to view subscription plans
          </h3>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </PageContainer>
    );
  }

  if (showCheckout && selectedPlan) {
    const product = STRIPE_CONFIG.PRODUCTS.PREMIUM_MONTHLY;
    
    return (
      <PageContainer
        title="Complete Purchase"
        subtitle={`Complete your ${product.name} subscription`}
      >
        <div className="max-w-2xl mx-auto">
          <StripeCheckout
            priceId={product.priceId}
            productName={product.name}
            description={product.description}
            price="€9.99/month"
            mode="subscription"
            onCancel={handleCancelCheckout}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Premium Plans"
      subtitle="Unlock advanced travel safety features"
    >
      <div className="max-w-6xl mx-auto">
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Safety First</h3>
            <p className="text-sm text-gray-600">Real-time alerts and protection</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Powered</h3>
            <p className="text-sm text-gray-600">Smart travel insights</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Global Coverage</h3>
            <p className="text-sm text-gray-600">Worldwide travel support</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
            <p className="text-sm text-gray-600">Best-in-class features</p>
          </div>
        </div>

        {/* Pricing Plan */}
        <div className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock advanced travel safety features and AI-powered insights to make your journeys safer and more informed.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative bg-white rounded-2xl shadow-xl border-2 border-blue-500 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Guard Nomand Premium</h3>
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">
                      €9.99
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Real-time safety alerts for your destinations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">AI-powered travel insights</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Premium weather forecasts</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Priority customer support</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Unlimited destinations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Advanced map features</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Offline access</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">Custom alert preferences</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(STRIPE_CONFIG.PRODUCTS.PREMIUM_MONTHLY.priceId)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Security Note */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure payment • Cancel anytime</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">{stats.safetyRating.toFixed(1)}/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{stats.countriesCovered}+ Countries</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PricingPage;