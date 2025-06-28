import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDestinations } from '../contexts/UserDestinationContext';
import { databaseService } from '../lib/database';
import { SafetyAlert, TravelPlan, Activity } from '../types';

export interface RealTimeData {
  safetyAlerts: SafetyAlert[];
  travelPlans: TravelPlan[];
  recentActivity: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useRealTimeData = (): RealTimeData => {
  const { user } = useAuth();
  const { currentDestination } = useUserDestinations();
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateRecentActivity = useCallback((alerts: SafetyAlert[], plans: TravelPlan[]): Activity[] => {
    const activities: Activity[] = [];

    // Add recent alerts as activities
    alerts.slice(0, 3).forEach(alert => {
      activities.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: alert.title,
        description: alert.description.substring(0, 100) + '...',
        timestamp: alert.timestamp
      });
    });

    // Add recent travel plans as activities
    plans.slice(0, 2).forEach(plan => {
      activities.push({
        id: `plan-${plan.id}`,
        type: 'plan',
        title: `Trip to ${plan.destination}`,
        description: `Travel planned from ${new Date(plan.startDate).toLocaleDateString()}`,
        timestamp: new Date().toISOString()
      });
    });

    // Add some general tips
    activities.push({
      id: 'tip-1',
      type: 'tip',
      title: 'Safety Tip: Document Backup',
      description: 'Keep digital copies of important documents in cloud storage',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch data in parallel
      const [alerts, plans] = await Promise.all([
        databaseService.getSafetyAlerts(currentDestination?.destination),
        databaseService.getTravelPlans(user.id)
      ]);

      setSafetyAlerts(alerts);
      setTravelPlans(plans);
      setRecentActivity(generateRecentActivity(alerts, plans));
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentDestination?.destination, generateRecentActivity]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch - stable dependency
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscriptions - stable dependencies and cleanup
  useEffect(() => {
    if (!user) return;

    let unsubscribeAlerts: (() => void) | null = null;
    let unsubscribePlans: (() => void) | null = null;

    // Only create subscriptions once
    const setupSubscriptions = () => {
      unsubscribeAlerts = databaseService.subscribeToSafetyAlerts(
        setSafetyAlerts,
        currentDestination?.destination
      );

      unsubscribePlans = databaseService.subscribeToTravelPlans(
        user.id,
        setTravelPlans
      );
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      if (unsubscribeAlerts) {
        unsubscribeAlerts();
        unsubscribeAlerts = null;
      }
      if (unsubscribePlans) {
        unsubscribePlans();
        unsubscribePlans = null;
      }
    };
  }, [user?.id, currentDestination?.destination]); // Only depend on stable IDs

  return {
    safetyAlerts,
    travelPlans,
    recentActivity,
    isLoading,
    error,
    refreshData
  };
};

export const useSafetyTips = () => {
  const [tips] = useState([
    {
      id: '1',
      title: 'Avoid ATM Skimming Devices',
      description: 'Check ATMs for unusual attachments before use. Cover your PIN and use machines inside banks when possible.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&auto=format&q=60'
    },
    {
      id: '2',
      title: 'Recognize Common Travel Scams',
      description: 'Be aware of fake police checkpoints, overcharging taxis, and gem investment frauds. Research common scams for your destination.',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=400&fit=crop&auto=format&q=60'
    },
    {
      id: '3',
      title: 'Secure Your Valuables',
      description: 'Use hotel safes, keep bags in front on public transport, and never leave laptops unattended in cafes.',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=400&fit=crop&auto=format&q=60'
    },
    {
      id: '4',
      title: 'Book Through Official Channels',
      description: 'Always book accommodations and tours through verified platforms. Avoid wire transfers to unknown parties.',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=400&fit=crop&auto=format&q=60'
    }
  ]);

  return { tips };
};

export const useDestinationData = () => {
  const [destinations] = useState([
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      description: 'The City of Lights offers art, culture, and exquisite cuisine with excellent safety standards.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 85,
      tags: ['City', 'Culture', 'Food']
    },
    {
      id: '2',
      name: 'Tokyo',
      country: 'Japan',
      description: 'A blend of traditional culture and cutting-edge technology in one of the world\'s safest cities.',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 92,
      tags: ['City', 'Technology', 'Culture']
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      description: 'Tropical paradise with stunning beaches and rich cultural heritage.',
      imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 78,
      tags: ['Beach', 'Nature', 'Culture']
    },
    {
      id: '4',
      name: 'New York',
      country: 'USA',
      description: 'The city that never sleeps, offering endless entertainment options.',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 80,
      tags: ['City', 'Entertainment', 'Food']
    },
    {
      id: '5',
      name: 'Barcelona',
      country: 'Spain',
      description: 'Stunning architecture, vibrant nightlife, and Mediterranean beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 82,
      tags: ['City', 'Beach', 'Architecture']
    },
    {
      id: '6',
      name: 'Santorini',
      country: 'Greece',
      description: 'Iconic white-washed buildings and breathtaking ocean views.',
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&auto=format&q=60',
      safetyScore: 88,
      tags: ['Beach', 'Island', 'Scenic']
    }
  ]);

  return { destinations };
};