import { 
  Weather, SafetyTip, TravelPlan, Activity, 
  Destination, SafetyAlert, MapMarker, User 
} from '../types';

export const currentWeather: Weather = {
  location: 'Paris, France',
  temperature: 22,
  condition: 'Partly Cloudy',
  icon: 'cloud-sun',
  high: 24,
  low: 18
};

export const safetyTips: SafetyTip[] = [
  {
    id: '1',
    title: 'Keep Documents Secure',
    description: 'Always keep a digital copy of important documents in your email or cloud storage.',
    imageUrl: 'https://images.pexels.com/photos/3943883/pexels-photo-3943883.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Stay Alert in Public Transport',
    description: 'Keep an eye on your belongings and be aware of your surroundings when using public transportation.',
    imageUrl: 'https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'Research Local Customs',
    description: 'Understanding local customs and laws can help you avoid misunderstandings and stay safe.',
    imageUrl: 'https://images.pexels.com/photos/7180617/pexels-photo-7180617.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '4',
    title: 'Share Your Itinerary',
    description: 'Always share your travel plans with a trusted friend or family member.',
    imageUrl: 'https://images.pexels.com/photos/5386754/pexels-photo-5386754.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export const travelPlans: TravelPlan[] = [
  {
    id: '1',
    destination: 'Paris, France',
    startDate: '2025-06-15',
    endDate: '2025-06-22',
    imageUrl: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 85
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    startDate: '2025-09-10',
    endDate: '2025-09-20',
    imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 92
  }
];

export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Weather Alert for Paris',
    description: 'Heavy rainfall expected in the next 48 hours.',
    timestamp: '2025-05-20T14:30:00Z'
  },
  {
    id: '2',
    type: 'tip',
    title: 'New Safety Tip',
    description: 'Check out our latest safety tip about public transportation.',
    timestamp: '2025-05-19T09:15:00Z'
  },
  {
    id: '3',
    type: 'plan',
    title: 'Trip to Tokyo Added',
    description: 'Your trip to Tokyo has been added to your travel plans.',
    timestamp: '2025-05-18T11:45:00Z'
  }
];

export const popularDestinations: Destination[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    description: 'The City of Lights offers art, culture, and exquisite cuisine.',
    imageUrl: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 85,
    tags: ['City', 'Culture', 'Food']
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    description: 'A blend of traditional culture and cutting-edge technology.',
    imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 92,
    tags: ['City', 'Technology', 'Culture']
  },
  {
    id: '3',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning beaches and rich cultural heritage.',
    imageUrl: 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 78,
    tags: ['Beach', 'Nature', 'Culture']
  },
  {
    id: '4',
    name: 'New York',
    country: 'USA',
    description: 'The city that never sleeps, offering endless entertainment options.',
    imageUrl: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 80,
    tags: ['City', 'Entertainment', 'Food']
  },
  {
    id: '5',
    name: 'Barcelona',
    country: 'Spain',
    description: 'Stunning architecture, vibrant nightlife, and Mediterranean beaches.',
    imageUrl: 'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 82,
    tags: ['City', 'Beach', 'Architecture']
  },
  {
    id: '6',
    name: 'Santorini',
    country: 'Greece',
    description: 'Iconic white-washed buildings and breathtaking ocean views.',
    imageUrl: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800',
    safetyScore: 88,
    tags: ['Beach', 'Island', 'Scenic']
  }
];

export const safetyAlerts: SafetyAlert[] = [
  {
    id: '1',
    title: 'Heavy Rainfall Alert',
    description: 'Heavy rainfall expected in Paris over the next 48 hours. Possible flooding in low-lying areas.',
    severity: 'medium',
    location: 'Paris, France',
    timestamp: '2025-05-20T14:30:00Z',
    read: false,
    type: 'weather'
  },
  {
    id: '2',
    title: 'Public Transportation Strike',
    description: 'Metro workers on strike in Barcelona. Expect significant delays and limited service.',
    severity: 'medium',
    location: 'Barcelona, Spain',
    timestamp: '2025-05-19T09:15:00Z',
    read: true,
    type: 'transportation'
  },
  {
    id: '3',
    title: 'Dengue Fever Outbreak',
    description: 'Health authorities report increased cases of dengue fever in Bali. Take precautions against mosquito bites.',
    severity: 'high',
    location: 'Bali, Indonesia',
    timestamp: '2025-05-18T11:45:00Z',
    read: false,
    type: 'health'
  },
  {
    id: '4',
    title: 'Pickpocketing Increase',
    description: 'Recent increase in pickpocketing incidents reported around major tourist attractions in Rome.',
    severity: 'medium',
    location: 'Rome, Italy',
    timestamp: '2025-05-17T16:20:00Z',
    read: false,
    type: 'security'
  },
  {
    id: '5',
    title: 'Heat Wave Warning',
    description: 'Extreme temperatures expected in Athens over the next week. Stay hydrated and avoid prolonged sun exposure.',
    severity: 'high',
    location: 'Athens, Greece',
    timestamp: '2025-05-16T10:30:00Z',
    read: true,
    type: 'weather'
  }
];

export const mapMarkers: MapMarker[] = [
  {
    id: '1',
    lat: 48.8566,
    lng: 2.3522,
    type: 'alert',
    title: 'Heavy Rainfall Alert',
    description: 'Heavy rainfall expected over the next 48 hours.',
    severity: 'medium'
  },
  {
    id: '2',
    lat: 41.3851,
    lng: 2.1734,
    type: 'alert',
    title: 'Transportation Strike',
    description: 'Metro workers on strike. Expect delays.',
    severity: 'medium'
  },
  {
    id: '3',
    lat: -8.4095,
    lng: 115.1889,
    type: 'alert',
    title: 'Health Alert',
    description: 'Dengue fever outbreak reported.',
    severity: 'high'
  },
  {
    id: '4',
    lat: 40.7128,
    lng: -74.0060,
    type: 'event',
    title: 'Cultural Festival',
    description: 'Annual cultural festival taking place this weekend.'
  },
  {
    id: '5',
    lat: 35.6762,
    lng: 139.6503,
    type: 'safety',
    title: 'Safe Tourist Zone',
    description: 'Area with increased security and tourist assistance.'
  }
];

export const currentUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  profileImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800',
  theme: 'light',
  notificationPreferences: {
    weather: true,
    security: true,
    health: true,
    transportation: true
  }
};