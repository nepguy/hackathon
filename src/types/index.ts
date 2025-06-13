export interface Weather {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  safetyScore: number;
}

export interface Activity {
  id: string;
  type: 'alert' | 'tip' | 'plan';
  title: string;
  description: string;
  timestamp: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  safetyScore: number;
  tags: string[];
}

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  timestamp: string;
  read: boolean;
  type: 'weather' | 'security' | 'health' | 'transportation';
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'alert' | 'event' | 'safety';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  theme: 'light' | 'dark' | 'system';
  notificationPreferences: {
    weather: boolean;
    security: boolean;
    health: boolean;
    transportation: boolean;
  };
}