import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { databaseService } from '../lib/database';

interface TrialContextType {
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialExpiresAt: Date | null;
  isTrialExpired: boolean;
  isPremiumUser: boolean;
  startTrial: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  checkTrialStatus: () => Promise<void>;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export const useTrial = (): TrialContextType => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
};

export const TrialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const TRIAL_DURATION_DAYS = 3;

  const calculateTrialStatus = (expiresAt: Date) => {
    const now = new Date();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    
    return {
      isActive: timeRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: timeRemaining <= 0
    };
  };

  const checkTrialStatus = async () => {
    if (!user) {
      setIsTrialActive(false);
      setTrialDaysRemaining(0);
      setTrialExpiresAt(null);
      setIsTrialExpired(false);
      setIsPremiumUser(false);
      return;
    }

    try {
      // Get user preferences which contain trial information
      const preferences = await databaseService.getUserPreferences(user.id);
      
      if (!preferences) {
        // New user - start trial automatically
        await startTrial();
        return;
      }

      // Check if user is premium
      if (preferences.premium_trial_active === false && preferences.premium_trial_expires_at) {
        // User had trial but it's not active - check if they're premium
        const profile = await databaseService.getUserProfile(user.id);
        if (profile?.premium_subscription_active) {
          setIsPremiumUser(true);
          setIsTrialActive(false);
          setIsTrialExpired(false);
          return;
        }
      }

      if (preferences.premium_trial_expires_at) {
        const expiresAt = new Date(preferences.premium_trial_expires_at);
        const status = calculateTrialStatus(expiresAt);
        
        setTrialExpiresAt(expiresAt);
        setIsTrialActive(status.isActive && preferences.premium_trial_active);
        setTrialDaysRemaining(status.daysRemaining);
        setIsTrialExpired(status.isExpired);
        
        // If trial expired, update database
        if (status.isExpired && preferences.premium_trial_active) {
          await databaseService.updateUserPreferences(user.id, {
            premium_trial_active: false
          });
        }
      } else {
        // No trial info - start trial for existing user
        await startTrial();
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  const startTrial = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000));
      
      await databaseService.updateUserPreferences(user.id, {
        premium_trial_active: true,
        premium_trial_expires_at: expiresAt.toISOString()
      });

      setIsTrialActive(true);
      setTrialDaysRemaining(TRIAL_DURATION_DAYS);
      setTrialExpiresAt(expiresAt);
      setIsTrialExpired(false);
      
      console.log('✅ Trial started successfully:', {
        expiresAt: expiresAt.toISOString(),
        daysRemaining: TRIAL_DURATION_DAYS
      });
    } catch (error) {
      console.error('Error starting trial:', error);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    try {
      // Update user profile to premium
      await databaseService.updateUserProfile(user.id, {
        premium_subscription_active: true,
        premium_subscription_started_at: new Date().toISOString()
      });

      // Deactivate trial
      await databaseService.updateUserPreferences(user.id, {
        premium_trial_active: false
      });

      setIsPremiumUser(true);
      setIsTrialActive(false);
      setIsTrialExpired(false);
      
      console.log('✅ User upgraded to premium');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  };

  // Check trial status when user changes or on mount
  useEffect(() => {
    checkTrialStatus();
  }, [user]);

  // Set up interval to check trial status every minute
  useEffect(() => {
    if (!user || isPremiumUser) return;

    const interval = setInterval(() => {
      if (trialExpiresAt) {
        const status = calculateTrialStatus(trialExpiresAt);
        setTrialDaysRemaining(status.daysRemaining);
        
        if (status.isExpired && isTrialActive) {
          setIsTrialActive(false);
          setIsTrialExpired(true);
          // Update database
          databaseService.updateUserPreferences(user.id, {
            premium_trial_active: false
          });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, trialExpiresAt, isTrialActive, isPremiumUser]);

  const contextValue: TrialContextType = {
    isTrialActive,
    trialDaysRemaining,
    trialExpiresAt,
    isTrialExpired,
    isPremiumUser,
    startTrial,
    upgradeToPremium,
    checkTrialStatus
  };

  return (
    <TrialContext.Provider value={contextValue}>
      {children}
    </TrialContext.Provider>
  );
};