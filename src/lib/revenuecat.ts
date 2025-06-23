import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';

// RevenueCat Configuration
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'your_revenuecat_public_key';

export interface SubscriptionPlan {
  id: string;
  identifier: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  period: string;
  popular?: boolean;
  features: string[];
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserId: userId,
      });
      
      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<SubscriptionPlan[]> {
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        console.warn('No current offering found');
        return this.getFallbackPlans();
      }

      return this.transformPackagesToPlans(currentOffering.availablePackages);
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return this.getFallbackPlans();
    }
  }

  private transformPackagesToPlans(packages: PurchasesPackage[]): SubscriptionPlan[] {
    return packages.map((pkg, index) => ({
      id: pkg.identifier,
      identifier: pkg.identifier,
      title: pkg.product.title || `Premium ${pkg.packageType}`,
      description: pkg.product.description || 'Premium TravelSafe features',
      price: pkg.product.priceString,
      priceAmount: pkg.product.price,
      currency: pkg.product.currencyCode,
      period: this.getPeriodFromPackageType(pkg.packageType),
      popular: index === 0, // Mark first package as popular
      features: this.getFeaturesByPackageType(pkg.packageType)
    }));
  }

  private getPeriodFromPackageType(packageType: string): string {
    switch (packageType.toLowerCase()) {
      case 'monthly':
        return 'month';
      case 'annual':
      case 'yearly':
        return 'year';
      case 'weekly':
        return 'week';
      default:
        return 'month';
    }
  }

  private getFeaturesByPackageType(packageType: string): string[] {
    const baseFeatures = [
      'Real-time safety alerts',
      'AI-powered travel insights',
      'Premium weather forecasts',
      'Priority customer support',
      'Unlimited destinations',
      'Advanced map features',
      'Offline access',
      'Custom alert preferences'
    ];

    if (packageType.toLowerCase().includes('annual') || packageType.toLowerCase().includes('yearly')) {
      return [
        ...baseFeatures,
        '2 months free (save 17%)',
        'Exclusive travel guides',
        'VIP support channel',
        'Early access to new features',
        'Travel insurance discounts'
      ];
    }

    return baseFeatures;
  }

  private getFallbackPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'premium_monthly',
        identifier: 'premium_monthly',
        title: 'Premium Monthly',
        description: 'Monthly subscription to TravelSafe Premium',
        price: '€10.99',
        priceAmount: 10.99,
        currency: 'EUR',
        period: 'month',
        popular: true,
        features: [
          'Real-time safety alerts',
          'AI-powered travel insights',
          'Premium weather forecasts',
          'Priority customer support',
          'Unlimited destinations',
          'Advanced map features',
          'Offline access',
          'Custom alert preferences'
        ]
      },
      {
        id: 'premium_yearly',
        identifier: 'premium_yearly',
        title: 'Premium Yearly',
        description: 'Yearly subscription to TravelSafe Premium',
        price: '€99.99',
        priceAmount: 99.99,
        currency: 'EUR',
        period: 'year',
        features: [
          'All Premium Monthly features',
          '2 months free (save 17%)',
          'Exclusive travel guides',
          'VIP support channel',
          'Early access to new features',
          'Travel insurance discounts'
        ]
      }
    ];
  }

  async purchasePackage(packageIdentifier: string): Promise<PurchaseResult> {
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        return {
          success: false,
          error: 'No offerings available'
        };
      }

      const packageToPurchase = currentOffering.availablePackages.find(
        pkg => pkg.identifier === packageIdentifier
      );

      if (!packageToPurchase) {
        return {
          success: false,
          error: 'Package not found'
        };
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      return {
        success: true,
        customerInfo
      };
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.userCancelled) {
        return {
          success: false,
          error: 'Purchase cancelled by user'
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return {
        success: true,
        customerInfo
      };
    } catch (error: any) {
      console.error('Restore purchases error:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases'
      };
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }

  async isUserPremium(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return false;

      // Check if user has any active entitlements
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async logIn(userId: string): Promise<CustomerInfo> {
    return await Purchases.logIn(userId);
  }

  async logOut(): Promise<CustomerInfo> {
    return await Purchases.logOut();
  }

  formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

export default RevenueCatService;