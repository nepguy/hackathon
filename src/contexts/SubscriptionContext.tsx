import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { stripeService } from '../lib/stripeService';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: any;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsSubscribed(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get subscription data from Stripe
      const subscriptionData = await stripeService.getUserSubscription();
      setSubscription(subscriptionData);
      
      // Check if subscription is active
      const hasActive = await stripeService.hasActiveSubscription();
      setIsSubscribed(hasActive);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch subscription when user changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription, user]);

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        isLoading,
        error,
        subscription,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};