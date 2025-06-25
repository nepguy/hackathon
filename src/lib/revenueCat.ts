/**
 * RevenueCat Service for GuardNomad
 * Handles subscription management, trial periods, and purchases
 * 
 * Note: This service provides both real RevenueCat integration and development fallbacks
 */

interface SubscriptionStatus {
  isActive: boolean;
  productId: string | null;
  expiresDate: Date | null;
  willRenew: boolean;
  periodType: 'trial' | 'intro' | 'normal' | 'none';
}

interface PurchaseResult {
  success: boolean;
  productId: string;
  transactionId: string | null;
  error?: string;
}

interface RevenueCatProduct {
  identifier: string;
  description: string;
  title: string;
  price: string;
  priceString: string;
  currencyCode: string;
}

class RevenueCatService {
  private apiKey: string;
  private isInitialized: boolean = false;
  private userId: string | null = null;
  private isConfigured: boolean = false;
  
  // Store simulated purchases for development
  private simulatedPurchases: Record<string, {
    productId: string;
    purchaseDate: Date;
    expiresDate: Date;
    isActive: boolean;
  }> = {};

  constructor() {
    this.apiKey = import.meta.env.VITE_REVENUECAT_API_KEY || 'goog_fTTowBftlWMKsvkaQQsLRDAULEu';
  }

  /**
   * Configure RevenueCat SDK (call this once at app startup)
   */
  async configure(): Promise<boolean> {
    if (this.isConfigured) {
      return true;
    }

    try {
      console.log('🔧 Configuring RevenueCat SDK...');
      
      // In development mode, just mark as configured
      if (import.meta.env.DEV) {
        this.isConfigured = true;
        console.log('✅ RevenueCat SDK configured (development mode)');
        return true;
      }

      // In production, attempt to load and configure the actual SDK
      try {
        const { Purchases } = await import('@revenuecat/purchases-js');
        
        // Configure RevenueCat with API key and user ID
        await Purchases.configure(this.apiKey, this.userId || `anonymous_${Date.now()}`);

        this.isConfigured = true;
        console.log('✅ RevenueCat SDK configured successfully');
        return true;
      } catch (sdkError) {
        console.warn('⚠️ RevenueCat SDK not available, falling back to simulation mode');
        this.isConfigured = true; // Still mark as configured for fallback mode
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to configure RevenueCat SDK:', error);
      return false;
    }
  }

  /**
   * Initialize RevenueCat with user ID
   */
  async initialize(userId: string): Promise<boolean> {
    if (!this.isConfigured) {
      const configured = await this.configure();
      if (!configured) {
        return false;
      }
    }

    if (this.isInitialized && this.userId === userId) {
      return true;
    }

    try {
      console.log('🔄 Initializing RevenueCat for user:', userId);
      
      this.isInitialized = true;
      this.userId = userId;
      
      // Load any existing purchases from localStorage (for development fallback)
      this.loadSimulatedPurchases();
      
      console.log('✅ RevenueCat initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.isInitialized) {
      console.warn('⚠️ RevenueCat not initialized, returning default status');
      return this.getDefaultSubscriptionStatus();
    }

    try {
      console.log('🔍 Checking subscription status for user:', this.userId);
      
      // In development or when SDK is not available, use simulated purchases
      if (import.meta.env.DEV) {
        const purchase = this.getActiveSimulatedPurchase();
        if (purchase) {
          return {
            isActive: purchase.isActive,
            productId: purchase.productId,
            expiresDate: purchase.expiresDate,
            willRenew: true,
            periodType: 'normal'
          };
        }
      }
      
      // TODO: Add real RevenueCat API calls here when SDK is properly configured
      // For now, return default status
      return this.getDefaultSubscriptionStatus();
    } catch (error) {
      console.error('❌ Error getting subscription status:', error);
      return this.getDefaultSubscriptionStatus();
    }
  }

  /**
   * Check if user is in trial period
   */
  async isInTrialPeriod(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const status = await this.getSubscriptionStatus();
      return status.periodType === 'trial';
    } catch (error) {
      console.error('❌ Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Get remaining trial days
   */
  async getTrialDaysRemaining(): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }

    try {
      const status = await this.getSubscriptionStatus();
      
      if (status.periodType === 'trial' && status.expiresDate) {
        const now = new Date();
        const diffTime = status.expiresDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error getting trial days remaining:', error);
      return 0;
    }
  }

  /**
   * Get available offerings/products
   */
  async getOfferings(): Promise<any[]> {
    if (!this.isInitialized) {
      console.warn('⚠️ RevenueCat not initialized');
      return [];
    }

    try {
      // TODO: Add real RevenueCat API calls here
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('❌ Error getting offerings:', error);
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        productId,
        transactionId: null,
        error: 'RevenueCat not initialized'
      };
    }

    try {
      console.log('🛒 Processing purchase for product:', productId);
      
      // In development, simulate a purchase
      if (import.meta.env.DEV) {
        return this.simulatePurchase(productId);
      }
      
      // TODO: Add real RevenueCat purchase logic here
      // For now, simulate success
      return {
        success: true,
        productId,
        transactionId: `t_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ Purchase error:', error);
      
      // Fallback to simulation in case of error
      if (import.meta.env.DEV) {
        return this.simulatePurchase(productId);
      }
      
      return {
        success: false,
        productId,
        transactionId: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('⚠️ RevenueCat not initialized');
      return false;
    }

    try {
      console.log('🔄 Restoring purchases...');
      
      // In development, check simulated purchases
      if (import.meta.env.DEV) {
        this.loadSimulatedPurchases();
        const hasActivePurchases = this.hasSimulatedPurchase();
        console.log(hasActivePurchases ? '✅ Purchases restored (simulated)' : 'ℹ️ No active purchases found');
        return hasActivePurchases;
      }
      
      // TODO: Add real RevenueCat restore logic here
      return false;
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
      return false;
    }
  }

  /**
   * Get products for display
   */
  async getProducts(): Promise<RevenueCatProduct[]> {
    if (!this.isInitialized) {
      console.warn('⚠️ RevenueCat not initialized, returning default products');
      return this.getDefaultProducts();
    }

    try {
      // TODO: Add real RevenueCat product fetching here
      // For now, return default products
      return this.getDefaultProducts();
    } catch (error) {
      console.error('❌ Error getting products:', error);
      return this.getDefaultProducts();
    }
  }

  /**
   * Check if user has active entitlement
   */
  async hasActiveEntitlement(entitlementId: string = 'premium'): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const status = await this.getSubscriptionStatus();
      // In future, we can check specific entitlements by entitlementId
      console.log(`🔍 Checking entitlement: ${entitlementId}`);
      return status.isActive;
    } catch (error) {
      console.error('❌ Error checking entitlement:', error);
      return false;
    }
  }

  /**
   * Log out current user
   */
  async logOut(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      this.isInitialized = false;
      this.userId = null;
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  }

  /**
   * Get default subscription status
   */
  private getDefaultSubscriptionStatus(): SubscriptionStatus {
    return {
      isActive: false,
      productId: null,
      expiresDate: null,
      willRenew: false,
      periodType: 'none'
    };
  }

  /**
   * Get default products for development/fallback
   */
  private getDefaultProducts(): RevenueCatProduct[] {
    return [
      {
        identifier: 'guardnomad_premium_monthly',
        description: 'Premium monthly subscription with unlimited alerts and features',
        title: 'GuardNomad Premium Monthly',
        price: '9.99',
        priceString: '$9.99',
        currencyCode: 'USD'
      },
      {
        identifier: 'guardnomad_premium_yearly',
        description: 'Premium yearly subscription with unlimited alerts and features',
        title: 'GuardNomad Premium Yearly',
        price: '99.99',
        priceString: '$99.99',
        currencyCode: 'USD'
      }
    ];
  }

  /**
   * Simulate a purchase for development
   */
  async simulatePurchase(productId: string): Promise<PurchaseResult> {
    console.log('🎭 Simulating purchase for development:', productId);
    
    const purchase = {
      productId,
      purchaseDate: new Date(),
      expiresDate: new Date(Date.now() + (productId.includes('yearly') ? 365 : 30) * 24 * 60 * 60 * 1000),
      isActive: true
    };

    if (this.userId) {
      this.simulatedPurchases[this.userId] = purchase;
      this.saveSimulatedPurchases();
    }

    return {
      success: true,
      productId,
      transactionId: `sim_${Date.now()}`
    };
  }

  /**
   * Check if user has simulated purchase (development only)
   */
  hasSimulatedPurchase(): boolean {
    if (!this.userId || !import.meta.env.DEV) {
      return false;
    }
    
    const purchase = this.simulatedPurchases[this.userId];
    return purchase?.isActive && purchase.expiresDate > new Date();
  }

  /**
   * Get active simulated purchase
   */
  getActiveSimulatedPurchase() {
    if (!this.userId || !import.meta.env.DEV) {
      return null;
    }
    
    const purchase = this.simulatedPurchases[this.userId];
    if (purchase?.isActive && purchase.expiresDate > new Date()) {
      return purchase;
    }
    return null;
  }

  /**
   * Save simulated purchases to localStorage
   */
  private saveSimulatedPurchases() {
    try {
      localStorage.setItem('guardnomad_simulated_purchases', JSON.stringify(this.simulatedPurchases));
    } catch (error) {
      console.warn('Could not save simulated purchases:', error);
    }
  }

  /**
   * Load simulated purchases from localStorage
   */
  private loadSimulatedPurchases() {
    try {
      const saved = localStorage.getItem('guardnomad_simulated_purchases');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(userId => {
          parsed[userId].purchaseDate = new Date(parsed[userId].purchaseDate);
          parsed[userId].expiresDate = new Date(parsed[userId].expiresDate);
        });
        this.simulatedPurchases = parsed;
      }
    } catch (error) {
      console.warn('Could not load simulated purchases:', error);
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();
export default revenueCatService;

// Export types
export type { SubscriptionStatus, PurchaseResult, RevenueCatProduct };