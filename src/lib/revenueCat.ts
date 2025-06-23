/**
 * RevenueCat Service for GuardNomad
 * Handles subscription management, trial periods, and purchases
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

class RevenueCatService {
  private apiKey: string;
  private isInitialized: boolean = false;
  private userId: string | null = null;
  
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
   * Initialize RevenueCat with user ID
   */
  async initialize(userId: string): Promise<boolean> {
    if (this.isInitialized && this.userId === userId) {
      return true;
    }

    try {
      console.log('🔄 Initializing RevenueCat for user:', userId);
      
      // In a real implementation, this would initialize the RevenueCat SDK
      // RevenueCat.configure(this.apiKey, userId);
      
      this.isInitialized = true;
      this.userId = userId;
      
      // Load any existing purchases from localStorage (for development)
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
      return {
        isActive: false,
        productId: null,
        expiresDate: null,
        willRenew: false,
        periodType: 'none'
      };
    }

    try {
      console.log('🔍 Checking subscription status for user:', this.userId);
      
      // In development, use simulated purchases
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
      
      // In production, this would call the RevenueCat SDK
      // const customerInfo = await RevenueCat.getCustomerInfo();
      
      // For now, return a default inactive status
      return {
        isActive: false,
        productId: null,
        expiresDate: null,
        willRenew: false,
        periodType: 'none'
      };
    } catch (error) {
      console.error('❌ Error getting subscription status:', error);
      return {
        isActive: false,
        productId: null,
        expiresDate: null,
        willRenew: false,
        periodType: 'none'
      };
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
      // In a real implementation, this would check with RevenueCat
      // const customerInfo = await RevenueCat.getCustomerInfo();
      // return customerInfo.entitlements.active['premium']?.periodType === 'trial';
      
      // For now, check with database via user preferences
      return false;
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
      // In a real implementation, this would calculate from RevenueCat data
      // const customerInfo = await RevenueCat.getCustomerInfo();
      // const trialExpiry = customerInfo.entitlements.active['premium']?.expirationDate;
      // if (!trialExpiry) return 0;
      // return Math.max(0, Math.ceil((trialExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      
      // For now, return 0 (will be handled by TrialContext)
      return 0;
    } catch (error) {
      console.error('❌ Error getting trial days remaining:', error);
      return 0;
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
      
      // In production, this would call the RevenueCat SDK
      // const purchaseResult = await RevenueCat.purchaseProduct(productId);
      
      // For now, return a simulated success
      return {
        success: true,
        productId,
        transactionId: `t_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ Purchase error:', error);
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
      return false;
    }

    try {
      console.log('🔄 Restoring purchases for user:', this.userId);
      
      // In production, this would call the RevenueCat SDK
      // await RevenueCat.restorePurchases();
      
      // For development, just check simulated purchases
      if (import.meta.env.DEV) {
        this.loadSimulatedPurchases();
        return this.hasSimulatedPurchase();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
      return false;
    }
  }

  /**
   * Get available products
   */
  async getProducts(): Promise<any[]> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      // In production, this would fetch from RevenueCat
      // const offerings = await RevenueCat.getOfferings();
      // return offerings.current?.availablePackages || [];
      
      // For now, return mock products
      return [
        {
          identifier: 'premium_monthly',
          title: 'Premium Monthly',
          description: 'Full access to all premium features',
          price: 10.99,
          priceString: '€10.99',
          currencyCode: 'EUR',
          period: 'month'
        },
        {
          identifier: 'premium_yearly',
          title: 'Premium Yearly',
          description: 'Full access to all premium features',
          price: 99.99,
          priceString: '€99.99',
          currencyCode: 'EUR',
          period: 'year'
        }
      ];
    } catch (error) {
      console.error('❌ Error getting products:', error);
      return [];
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
      // In production, this would check with RevenueCat
      // const customerInfo = await RevenueCat.getCustomerInfo();
      // return !!customerInfo.entitlements.active[entitlementId];
      
      // For development, check simulated purchases
      if (import.meta.env.DEV) {
        return this.hasSimulatedPurchase();
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking entitlement:', error);
      return false;
    }
  }

  // Development helpers for simulating RevenueCat behavior

  /**
   * Simulate a purchase (for development only)
   */
  async simulatePurchase(productId: string): Promise<PurchaseResult> {
    if (!this.userId) {
      return {
        success: false,
        productId,
        transactionId: null,
        error: 'User not authenticated'
      };
    }

    console.log('🧪 Simulating purchase for product:', productId);
    
    // Create expiration date based on product
    const now = new Date();
    let expiresDate: Date;
    
    if (productId.includes('monthly')) {
      expiresDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (productId.includes('yearly')) {
      expiresDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
    } else {
      expiresDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days default
    }
    
    // Store the simulated purchase
    const purchase = {
      productId,
      purchaseDate: now,
      expiresDate,
      isActive: true
    };
    
    this.simulatedPurchases[this.userId] = purchase;
    this.saveSimulatedPurchases();
    
    console.log('✅ Simulated purchase successful:', purchase);
    
    return {
      success: true,
      productId,
      transactionId: `sim_${Date.now()}`
    };
  }

  /**
   * Check if user has a simulated purchase
   */
  hasSimulatedPurchase(): boolean {
    if (!this.userId) return false;
    
    const purchase = this.simulatedPurchases[this.userId];
    if (!purchase) return false;
    
    // Check if purchase is still active
    const now = new Date();
    if (purchase.expiresDate < now) {
      purchase.isActive = false;
      this.saveSimulatedPurchases();
      return false;
    }
    
    return purchase.isActive;
  }

  /**
   * Get active simulated purchase
   */
  getActiveSimulatedPurchase() {
    if (!this.userId) return null;
    
    const purchase = this.simulatedPurchases[this.userId];
    if (!purchase) return null;
    
    // Check if purchase is still active
    const now = new Date();
    if (purchase.expiresDate < now) {
      purchase.isActive = false;
      this.saveSimulatedPurchases();
      return null;
    }
    
    return purchase.isActive ? purchase : null;
  }

  /**
   * Save simulated purchases to localStorage
   */
  private saveSimulatedPurchases() {
    localStorage.setItem('guardnomad_simulated_purchases', JSON.stringify(this.simulatedPurchases));
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
          if (parsed[userId]) {
            parsed[userId].purchaseDate = new Date(parsed[userId].purchaseDate);
            parsed[userId].expiresDate = new Date(parsed[userId].expiresDate);
          }
        });
        
        this.simulatedPurchases = parsed;
      }
    } catch (error) {
      console.error('❌ Error loading simulated purchases:', error);
      this.simulatedPurchases = {};
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();
export default revenueCatService;