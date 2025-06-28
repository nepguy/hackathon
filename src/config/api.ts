// API Configuration
export const API_CONFIG = {
  // Backend API URL - change this for production
  BASE_URL: import.meta.env.VITE_API_URL || 'https://guardnomad-api.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    SCRAPE: '/api/scrape',
    QUICK_ALERTS: '/api/quick-alerts',
    BATCH_COUNTRIES: '/api/batch-countries',
    STATUS: '/api/status',
    FILES: '/api/files',
    DATA: '/api/data',
    
    // Eventbrite endpoints
    EVENTBRITE_TEST: '/api/eventbrite/test',
    EVENTBRITE_EVENTS: '/api/eventbrite/events',
    EVENTBRITE_ALERTS: '/api/eventbrite/alerts',
    EVENTBRITE_EXPORT: '/api/eventbrite/export',
    
    // GNews endpoints
    GNEWS_TEST: '/api/gnews/test',
    GNEWS_NEWS: '/api/gnews/news',
    GNEWS_ALERTS: '/api/gnews/alerts',
    GNEWS_BREAKING: '/api/gnews/breaking',
    GNEWS_EXPORT: '/api/gnews/export',
    
    // Automation endpoints
    AUTOMATION_START: '/api/automation/start',
    AUTOMATION_RUN: '/api/automation/run-now'
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// RevenueCat Configuration
export const REVENUECAT_CONFIG = {
  API_KEY: import.meta.env.VITE_REVENUECAT_API_KEY || 'goog_fTTowBftlWMKsvkaQQsLRDAULEu',
  ENTITLEMENTS: {
    PREMIUM: 'premium'
  },
  PRODUCTS: {
    MONTHLY: 'premium_monthly',
    YEARLY: 'premium_yearly'
  }
};

export default API_CONFIG; 