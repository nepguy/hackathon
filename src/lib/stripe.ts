import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

export { stripePromise };

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 10.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Real-time safety alerts',
      'AI-powered travel insights',
      'Premium weather forecasts',
      'Priority customer support',
      'Unlimited destinations',
      'Advanced map features',
      'Offline access',
      'Custom alert preferences'
    ],
    popular: true
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 99.99,
    currency: 'EUR',
    interval: 'year',
    features: [
      'All Premium Monthly features',
      '2 months free (24% savings)',
      'Exclusive travel guides',
      'VIP support channel',
      'Early access to new features',
      'Travel insurance discounts'
    ]
  }
];

export class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}
  
  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPaymentIntent(amount: number, currency: string = 'EUR'): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createSubscription(planId: string, customerId?: string): Promise<any> {
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}