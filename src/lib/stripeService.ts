import { STRIPE_CONFIG } from '../config/stripe';
import { supabase } from './supabase';

interface CreateCheckoutOptions {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
}

class StripeService {
  private static instance: StripeService;
  private supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    if (!this.supabaseUrl) {
      console.warn('⚠️ Supabase URL not found in environment variables');
    }
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(options: CreateCheckoutOptions): Promise<{ sessionId: string; url: string } | null> {
    try {
      if (!this.supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const { priceId, mode, successUrl, cancelUrl } = options;

      // Get the current user's JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User must be logged in to create a checkout session');
      }

      // Call the Supabase Edge Function to create a checkout session
      const response = await fetch(`${this.supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: successUrl || STRIPE_CONFIG.URLS.SUCCESS,
          cancel_url: cancelUrl || STRIPE_CONFIG.URLS.CANCEL
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  /**
   * Get the user's current subscription status
   */
  async getUserSubscription(): Promise<any> {
    try {
      // Query the stripe_user_subscriptions view
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Check if the user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      
      if (!subscription) {
        return false;
      }

      // Check if subscription is active or trialing
      return ['active', 'trialing'].includes(subscription.subscription_status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get the user's order history
   */
  async getUserOrders(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }
}

export const stripeService = StripeService.getInstance();
export default stripeService;