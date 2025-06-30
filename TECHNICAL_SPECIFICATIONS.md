# Technical Specifications - Travel Safety Application

## Component Interface Specifications

### HomePage Component Interface
```typescript
interface HomePageProps {}

interface HomePageState {
  userStats: {
    travel_plans_count: number;
    safety_score: number;
    days_tracked: number;
  };
  travelPlans: TravelPlan[];
  aiSafetyInsights: SafetyTip[];
  isLoadingAISafety: boolean;
  showCreatePlanModal: boolean;
  showTrialExpiredModal: boolean;
}
```

### Context Interfaces

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

#### TrialContext
```typescript
interface TrialContextType {
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialExpiresAt: Date | null;
  isTrialExpired: boolean;
  isPremiumUser: boolean;
  startTrial: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  checkTrialStatus: () => Promise<void>;
}
```

#### LocationContext
```typescript
interface LocationContextType {
  userLocation: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  updateLocation: (location: LocationData) => void;
}
```

## Type Definitions

### Core Types
```typescript
interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  safetyScore: number;
}

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface Activity {
  id: string;
  type: 'alert' | 'tip' | 'plan';
  title: string;
  description: string;
  timestamp: string;
}

interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  timestamp: string;
  read: boolean;
  type: 'weather' | 'security' | 'health' | 'transportation' | 'scam' | 'safety';
  source?: string;
  tips?: string[];
}

interface AISafetyAlert {
  id: string;
  type: 'safety' | 'weather' | 'health' | 'security' | 'transportation' | 'cultural';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  location: string;
  coordinates?: { lat: number; lng: number; };
  source: 'ai' | 'news' | 'weather' | 'local_authority';
  timestamp: string;
  actionable_advice: string[];
  relevant_links?: string[];
  expires_at?: string;
}
```

## Service API Specifications

### AI Safety Service
```typescript
class AISafetyService {
  async generateSafetyAlerts(context: LocationContext): Promise<AISafetyAlert[]>
  async getLocationSafetyData(location: LocationData): Promise<SafetyData>
  async analyzeNewsForThreats(location: string): Promise<AISafetyAlert[]>
  async generateWeatherAlerts(location: LocationData): Promise<AISafetyAlert[]>
  clearExpiredCache(): void
  getAlertStats(alerts: AISafetyAlert[]): AlertStats
}
```

### Travel Plans Service
```typescript
interface TravelPlansService {
  getUserTravelPlans(userId: string): Promise<TravelPlan[]>
  createTravelPlan(userId: string, plan: CreateTravelPlanData): Promise<TravelPlan>
  updateTravelPlan(planId: string, updates: Partial<TravelPlan>): Promise<TravelPlan>
  deleteTravelPlan(planId: string): Promise<void>
  calculateSafetyScore(destination: string): Promise<number>
}
```

### User Statistics Service
```typescript
interface UserStatisticsService {
  getUserStatistics(userId: string): Promise<UserStats>
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void>
  trackActivity(userId: string, activity: ActivityData): Promise<void>
  calculateSafetyScore(userId: string): Promise<number>
}
```

## Database Schema Details

### Supabase Tables

#### users (Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_metadata JSONB
);
```

#### user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  premium_trial_active BOOLEAN DEFAULT false,
  premium_trial_expires_at TIMESTAMPTZ,
  theme VARCHAR(20) DEFAULT 'system',
  notifications JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### travel_plans
```sql
CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  safety_score INTEGER DEFAULT 85,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### safety_alerts
```sql
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  location VARCHAR,
  coordinates POINT,
  source VARCHAR(50),
  read BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_statistics
```sql
CREATE TABLE user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  travel_plans_count INTEGER DEFAULT 0,
  safety_score INTEGER DEFAULT 95,
  days_tracked INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Integration Specifications

### Gemini AI Integration
```typescript
interface GeminiAIService {
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': string
  }
  
  async getLocationSafetyData(context: LocationContext): Promise<SafetyData>
  async analyzeThreatLevel(location: string, newsData: any[]): Promise<ThreatAnalysis>
  async generateSafetyRecommendations(context: LocationContext): Promise<string[]>
}
```

### News API Integration
```typescript
interface NewsAPIService {
  endpoint: 'https://newsapi.org/v2/everything'
  apiKey: string
  
  async searchNews(query: string, location?: string): Promise<NewsResponse>
  async getLocationNews(location: string): Promise<Article[]>
  filterSafetyRelevantNews(articles: Article[]): Article[]
}
```

### Weather API Integration
```typescript
interface WeatherService {
  endpoint: 'https://api.openweathermap.org/data/2.5'
  apiKey: string
  
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData>
  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast>
  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]>
}
```

## Component Props Specifications

### ActivityItem Props
```typescript
interface ActivityItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  showTimestamp?: boolean;
}
```

### SafetyTipCard Props
```typescript
interface SafetyTipCardProps {
  tip: SafetyTip;
  onReadMore?: (tip: SafetyTip) => void;
  compact?: boolean;
}
```

### TravelPlanItem Props
```typescript
interface TravelPlanItemProps {
  plan: TravelPlan;
  onEdit?: (plan: TravelPlan) => void;
  onDelete?: (planId: string) => void;
  onView?: (plan: TravelPlan) => void;
}
```

### EventCard Props
```typescript
interface EventCardProps {
  event: Event | TravelEvent;
  showExternalLink?: boolean;
  onEventClick?: (event: Event | TravelEvent) => void;
}
```

### WeatherCard Props
```typescript
interface WeatherCardProps {
  location?: LocationData;
  compact?: boolean;
  showForecast?: boolean;
}
```

## Hook Specifications

### useRealTimeData Hook
```typescript
interface UseRealTimeDataReturn {
  safetyAlerts: SafetyAlert[];
  recentActivity: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

function useRealTimeData(): UseRealTimeDataReturn
```

### Custom Hook Patterns
```typescript
// Location-based data fetching
function useLocationData(location: LocationData | null): {
  weatherData: WeatherData | null;
  safetyAlerts: SafetyAlert[];
  localEvents: Event[];
  isLoading: boolean;
}

// AI insights hook
function useAISafetyInsights(userId: string, location: LocationData | null): {
  insights: SafetyTip[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}
```

## Environment Variables

### Required Environment Variables
```env
# ⚠️ SECURITY WARNING: Never commit real API keys to version control
# Use .env file for real values and keep it in .gitignore

# Supabase Configuration
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# AI Service Configuration
VITE_EXA_API_KEY=<your-exa-api-key>

# External APIs
VITE_NEWS_API_KEY=<your-news-api-key>
VITE_WEATHER_API_KEY=<your-weather-api-key>

# Application Configuration
VITE_APP_NAME=Travel Safety App
VITE_APP_VERSION=1.0.0
VITE_TRIAL_DURATION_DAYS=3
```

## Error Handling Patterns

### Service Error Handling
```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage in services
try {
  const data = await apiCall();
  return data;
} catch (error) {
  if (error instanceof ServiceError) {
    throw error;
  }
  throw new ServiceError('Unexpected error', 'UNKNOWN_ERROR');
}
```

### Component Error Boundaries
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

## Performance Optimization Strategies

### React Optimizations
```typescript
// Memoized components
const MemoizedActivityItem = React.memo(ActivityItem);
const MemoizedSafetyTipCard = React.memo(SafetyTipCard);

// Memoized values and callbacks
const memoizedStats = useMemo(() => calculateStats(data), [data]);
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);
```

### Data Fetching Optimizations
```typescript
// Cache strategies
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Debounced API calls
const debouncedSearch = useMemo(
  () => debounce((query: string) => searchAPI(query), 300),
  []
);
```

This technical specification provides the detailed implementation guidelines needed to recreate the travel safety application with consistent architecture and functionality. 