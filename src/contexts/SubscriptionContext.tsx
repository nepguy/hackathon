import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { revenueCatService } from '../lib/revenueCat';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'none';
  productId: string | null;
  expiresDate: Date | null;
  willRenew: boolean;
  isLoading: boolean;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
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
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired' | 'none'>('none');
  const [productId, setProductId] = useState<string | null>(null);
  const [expiresDate, setExpiresDate] = useState<Date | null>(null);
  const [willRenew, setWillRenew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setIsSubscribed(false);
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setSubscriptionStatus('none');
      setProductId(null);
      setExpiresDate(null);
      setWillRenew(false);
      return;
    }

    setIsLoading(true);
    try {
      // Initialize RevenueCat if not already done
      await revenueCatService.initialize(user.id);

      // Get subscription status
      const status = await revenueCatService.getSubscriptionStatus();
      const trialActive = await revenueCatService.isInTrialPeriod();
      const trialDays = await revenueCatService.getTrialDaysRemaining();

      // Check for simulated purchases in development
      const hasSimulatedPurchase = revenueCatService.hasSimulatedPurchase();

      const newIsSubscribed = status.isActive || hasSimulatedPurchase;
      setIsSubscribed(newIsSubscribed);
      setIsTrialActive(trialActive);
      setTrialDaysRemaining(trialDays);
      setProductId(status.productId);
      setExpiresDate(status.expiresDate);
      setWillRenew(status.willRenew);

      // Determine overall status
      let newStatus: 'active' | 'trial' | 'expired' | 'none';
      if (newIsSubscribed) {
        if (trialActive) {
          newStatus = 'trial';
        } else {
          newStatus = 'active';
        }
      } else if (status.expiresDate && status.expiresDate < new Date()) {
        newStatus = 'expired';
      } else {
        newStatus = 'none';
      }
      setSubscriptionStatus(newStatus);

      console.log('📊 Subscription status updated:', {
        isSubscribed: newIsSubscribed,
        isTrialActive: trialActive,
        trialDaysRemaining: trialDays,
        status: newStatus,
      });
    } catch (error) {
      console.error('❌ Error refreshing subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ User not authenticated');
      return false;
    }

    setIsLoading(true);
    try {
      // In development, simulate purchase
      if (import.meta.env.DEV) {
        const result = await revenueCatService.simulatePurchase(productId);
        if (result.success) {
          await refreshSubscriptionStatus();
          return true;
        }
        return false;
      }

      // In production, handle real purchase
      const result = await revenueCatService.purchaseProduct(productId);
      if (result.success) {
        await refreshSubscriptionStatus();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Purchase error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshSubscriptionStatus]);

  const restorePurchases = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await revenueCatService.restorePurchases();
      await refreshSubscriptionStatus();
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshSubscriptionStatus]);

  // Initialize subscription status when user changes
  useEffect(() => {
    refreshSubscriptionStatus();
  }, [user, refreshSubscriptionStatus]);

  const contextValue: SubscriptionContextType = {
    isSubscribed,
    isTrialActive,
    trialDaysRemaining,
    subscriptionStatus,
    productId,
    expiresDate,
    willRenew,
    isLoading,
    purchaseProduct,
    restorePurchases,
    refreshSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};