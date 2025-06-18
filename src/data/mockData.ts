// This file is now deprecated - all data comes from real sources
// Keeping minimal data for fallback purposes only

export const currentWeather = {
  location: 'Loading...',
  temperature: 0,
  condition: 'Loading',
  icon: 'cloud',
  high: 0,
  low: 0
};

// Fallback data - real data comes from APIs and database
export const fallbackDestinations = [
  {
    id: 'fallback-1',
    name: 'Loading',
    country: 'Loading',
    description: 'Loading destination data...',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format&q=60',
    safetyScore: 0,
    tags: ['Loading']
  }
];

export const fallbackUser = {
  id: 'fallback',
  name: 'Loading User',
  email: 'loading@example.com',
  profileImage: 'https://ui-avatars.com/api/?name=Loading&background=3b82f6&color=fff&size=128',
  theme: 'light' as const,
  notificationPreferences: {
    weather: true,
    security: true,
    health: true,
    transportation: true,
    scam: true,
    safety: true
  }
};