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
    title: 'Avoid ATM Skimming Devices',
    description: 'Check ATMs for unusual attachments before use. Cover your PIN and use machines inside banks when possible.',
    imageUrl: 'https://images.pexels.com/photos/3943883/pexels-photo-3943883.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Recognize Common Travel Scams',
    description: 'Be aware of fake police checkpoints, overcharging taxis, and gem investment frauds. Research common scams for your destination.',
    imageUrl: 'https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'Secure Your Valuables',
    description: 'Use hotel safes, keep bags in front on public transport, and never leave laptops unattended in cafes.',
    imageUrl: 'https://images.pexels.com/photos/7180617/pexels-photo-7180617.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '4',
    title: 'Book Through Official Channels',
    description: 'Always book accommodations and tours through verified platforms. Avoid wire transfers to unknown parties.',
    imageUrl: 'https://images.pexels.com/photos/5386754/pexels-photo-5386754.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '5',
    title: 'Verify Currency Exchange',
    description: 'Only use official exchange bureaus or banks. Avoid street money changers who may pass counterfeit currency.',
    imageUrl: 'https://images.pexels.com/photos/3943883/pexels-photo-3943883.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '6',
    title: 'Document Everything',
    description: 'Take photos of rental cars before use, keep receipts, and document any pre-existing damage to avoid scams.',
    imageUrl: 'https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg?auto=compress&cs=tinysrgb&w=800'
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
    title: 'ATM Skimming Alert - Bangkok',
    description: 'New skimming devices detected in tourist areas. Use bank ATMs only.',
    timestamp: '2025-06-13T14:30:00Z'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Fake Police Checkpoint - Cambodia',
    description: 'Travelers report fake checkpoints between Siem Reap and Phnom Penh.',
    timestamp: '2025-06-13T09:15:00Z'
  },
  {
    id: '3',
    type: 'tip',
    title: 'New Safety Tip: Taxi Scams',
    description: 'Learn how to avoid overcharging taxi scams at airports.',
    timestamp: '2025-06-12T18:45:00Z'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Gem Investment Fraud - Delhi',
    description: 'Tourists targeted with fake gem investment opportunities.',
    timestamp: '2025-06-12T16:20:00Z'
  },
  {
    id: '5',
    type: 'alert',
    title: 'Cafe Theft Increase - Barcelona',
    description: 'Distraction theft targeting laptops and phones in cafes.',
    timestamp: '2025-06-11T10:30:00Z'
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
  // Bangkok, Thailand specific alerts
  {
    id: '1',
    type: 'scam',
    title: 'ATM Skimming Devices Found in Bangkok Tourist Areas',
    description: 'Multiple ATM skimming devices have been discovered at popular tourist locations in Bangkok, including Khao San Road and Siam Square. Travelers should use ATMs inside banks and cover their PIN when entering.',
    location: 'Bangkok, Thailand',
    severity: 'high',
    timestamp: '2025-06-13T10:30:00Z',
    read: false,
    source: 'Thai Tourist Police',
    tips: [
      'Use ATMs inside banks or hotels',
      'Cover your PIN when entering',
      'Check for unusual devices attached to ATMs',
      'Monitor your bank statements regularly'
    ]
  },
  {
    id: '2',
    type: 'scam',
    title: 'Fake Taxi Meter Scams in Bangkok',
    description: 'Reports of taxi drivers using rigged meters or refusing to use meters in Bangkok. Always insist on using the meter or agree on a price before starting your journey.',
    location: 'Bangkok, Thailand',
    severity: 'medium',
    timestamp: '2025-06-12T14:15:00Z',
    read: false,
    source: 'Bangkok Metropolitan Administration',
    tips: [
      'Always insist the driver uses the meter',
      'Use ride-hailing apps like Grab',
      'Know the approximate fare beforehand',
      'Keep small bills for exact payment'
    ]
  },
  {
    id: '3',
    type: 'health',
    title: 'Dengue Fever Alert in Bangkok',
    description: 'Increased cases of dengue fever reported in Bangkok during rainy season. Use mosquito repellent and avoid stagnant water areas.',
    location: 'Bangkok, Thailand',
    severity: 'medium',
    timestamp: '2025-06-11T09:00:00Z',
    read: true,
    source: 'Thailand Ministry of Health',
    tips: [
      'Use DEET-based mosquito repellent',
      'Wear long sleeves during dawn and dusk',
      'Stay in air-conditioned accommodations',
      'Seek medical attention for fever symptoms'
    ]
  },
  
  // Paris, France specific alerts
  {
    id: '4',
    type: 'scam',
    title: 'Pickpocketing Surge in Paris Metro',
    description: 'Increased pickpocketing incidents reported on Paris Metro lines 1, 4, 6, and 9, especially during rush hours. Keep valuables secure and stay alert.',
    location: 'Paris, France',
    severity: 'high',
    timestamp: '2025-06-13T16:45:00Z',
    read: false,
    source: 'Paris Police Prefecture',
    tips: [
      'Keep bags zipped and in front of you',
      'Avoid displaying expensive items',
      'Be extra cautious during rush hours',
      'Use inside pockets for valuables'
    ]
  },
  {
    id: '5',
    type: 'scam',
    title: 'Gold Ring Scam Near Eiffel Tower',
    description: 'Tourists report being approached by individuals claiming to have found gold rings near the Eiffel Tower. This is a common distraction scam.',
    location: 'Paris, France',
    severity: 'medium',
    timestamp: '2025-06-12T11:20:00Z',
    read: false,
    source: 'Paris Tourism Office',
    tips: [
      'Ignore strangers approaching with "found" items',
      'Keep walking and avoid engagement',
      'Stay in groups when possible',
      'Report suspicious activity to police'
    ]
  },
  {
    id: '6',
    type: 'safety',
    title: 'Protest Activity in Central Paris',
    description: 'Planned demonstrations in central Paris may cause traffic disruptions and crowd control measures. Avoid large gatherings.',
    location: 'Paris, France',
    severity: 'low',
    timestamp: '2025-06-10T08:30:00Z',
    read: true,
    source: 'French Interior Ministry',
    tips: [
      'Check local news for updates',
      'Use alternative transportation routes',
      'Avoid large crowds and demonstrations',
      'Keep identification documents with you'
    ]
  },

  // General travel alerts (will show for all destinations)
  {
    id: '7',
    type: 'weather',
    title: 'Severe Weather Warning - Southeast Asia',
    description: 'Tropical storm approaching Southeast Asian region. Heavy rainfall and strong winds expected.',
    location: 'Southeast Asia',
    severity: 'high',
    timestamp: '2025-06-13T06:00:00Z',
    read: false,
    source: 'Regional Weather Service',
    tips: [
      'Monitor weather updates regularly',
      'Avoid outdoor activities during storms',
      'Keep emergency supplies ready',
      'Follow local evacuation orders if issued'
    ]
  },
  {
    id: '8',
    type: 'scam',
    title: 'Fake Booking Website Scams Targeting Travelers',
    description: 'Fraudulent hotel and flight booking websites are targeting international travelers. Always book through verified platforms.',
    location: 'Global',
    severity: 'medium',
    timestamp: '2025-06-09T12:00:00Z',
    read: true,
    source: 'International Travel Security',
    tips: [
      'Use only verified booking platforms',
      'Check website SSL certificates',
      'Read reviews from multiple sources',
      'Pay with credit cards for protection'
    ]
  },
  {
    id: '9',
    type: 'health',
    title: 'Travel Health Insurance Reminder',
    description: 'Ensure you have adequate travel health insurance coverage before departing. Medical costs abroad can be substantial.',
    location: 'Global',
    severity: 'low',
    timestamp: '2025-06-08T10:00:00Z',
    read: true,
    source: 'World Health Organization',
    tips: [
      'Purchase comprehensive travel insurance',
      'Carry insurance documents with you',
      'Know your coverage limitations',
      'Keep emergency contact numbers handy'
    ]
  },

  // Additional Bangkok alerts
  {
    id: '10',
    type: 'scam',
    title: 'Gem Scam Targeting Tourists in Bangkok',
    description: 'Tourists are being approached by well-dressed individuals offering "special deals" on gems and jewelry. These are elaborate scams.',
    location: 'Bangkok, Thailand',
    severity: 'high',
    timestamp: '2025-06-07T15:30:00Z',
    read: false,
    source: 'Thai Consumer Protection',
    tips: [
      'Never buy expensive items from street vendors',
      'Ignore unsolicited gem or jewelry offers',
      'Research reputable dealers beforehand',
      'Be wary of "limited time" offers'
    ]
  },

  // Additional Paris alerts
  {
    id: '11',
    type: 'scam',
    title: 'Petition Scam in Tourist Areas of Paris',
    description: 'Groups of people approaching tourists with clipboards asking for signatures on petitions, while accomplices pickpocket victims.',
    location: 'Paris, France',
    severity: 'medium',
    timestamp: '2025-06-06T13:45:00Z',
    read: false,
    source: 'Paris Tourist Information',
    tips: [
      'Politely decline to sign petitions from strangers',
      'Keep hands on your belongings',
      'Move away from groups approaching you',
      'Stay alert in crowded tourist areas'
    ]
  },
  {
    id: '12',
    type: 'safety',
    title: 'Increased Security Measures at Paris Airports',
    description: 'Enhanced security screening procedures at Charles de Gaulle and Orly airports. Allow extra time for check-in and security.',
    location: 'Paris, France',
    severity: 'low',
    timestamp: '2025-06-05T07:00:00Z',
    read: true,
    source: 'Paris Airports Authority',
    tips: [
      'Arrive at airport 3 hours early for international flights',
      'Pack liquids according to regulations',
      'Have identification ready for multiple checks',
      'Consider using airport fast-track services'
    ]
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
    transportation: true,
    scam: true,
    safety: true
  }
};