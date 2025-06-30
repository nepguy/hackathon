// Stripe configuration for Guard Nomand
export const STRIPE_CONFIG = {
  // Product configuration
  PRODUCTS: {
    PREMIUM_MONTHLY: {
      priceId: 'price_1RdqIYB9CPEHO8sEKqrHiJ3t',
      name: 'Guard Nomand Premium Monthly',
      description: 'Access premium features and travel scam alerts across most destinations',
      mode: 'subscription'
    }
  },
  
  // API endpoints
  ENDPOINTS: {
    CHECKOUT: '/api/create-checkout',
    WEBHOOK: '/api/webhook'
  },
  
  // Success and cancel URLs
  URLS: {
    SUCCESS: `${window.location.origin}/payment-success`,
    CANCEL: `${window.location.origin}/pricing`
  }
};

export default STRIPE_CONFIG;