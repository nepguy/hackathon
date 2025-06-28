import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStatisticsService } from '../lib/userStatisticsService';
import { travelPlansService, type TravelPlan, type CreateTravelPlan } from '../lib/travelPlansService';
import { useAuth } from './AuthContext';

// Use TravelPlan interface but maintain backward compatibility
export interface UserDestination {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  alertsEnabled: boolean;
}

interface UserDestinationContextType {
  destinations: UserDestination[];
  currentDestination: UserDestination | null;
  loading: boolean;
  addDestination: (destination: Omit<UserDestination, 'id'>) => Promise<void>;
  removeDestination: (id: string) => Promise<void>;
  setCurrentDestination: (destination: UserDestination | null) => void;
  updateDestination: (id: string, updates: Partial<UserDestination>) => Promise<void>;
  getActiveDestinations: () => UserDestination[];
  getUpcomingDestinations: () => UserDestination[];
  refreshDestinations: () => Promise<void>;
}

const UserDestinationContext = createContext<UserDestinationContextType | undefined>(undefined);

export const useUserDestinations = () => {
  const context = useContext(UserDestinationContext);
  if (context === undefined) {
    throw new Error('useUserDestinations must be used within a UserDestinationProvider');
  }
  return context;
};

// Convert TravelPlan to UserDestination for backward compatibility
const convertTravelPlanToDestination = (plan: TravelPlan): UserDestination => ({
  id: plan.id,
  destination: plan.destination,
  startDate: plan.start_date,
  endDate: plan.end_date,
  status: plan.status,
  alertsEnabled: plan.status === 'active' || plan.status === 'planned', // Enable alerts for active/planned trips
});

// Convert UserDestination to CreateTravelPlan
const convertDestinationToTravelPlan = (destination: Omit<UserDestination, 'id'>): CreateTravelPlan => ({
  destination: destination.destination,
  start_date: destination.startDate,
  end_date: destination.endDate,
  status: destination.status || 'planned',
});

export const UserDestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<UserDestination[]>([]);
  const [currentDestination, setCurrentDestination] = useState<UserDestination | null>(null);
  const [loading, setLoading] = useState(true);

  // Load destinations from database on mount and when user changes
  useEffect(() => {
    if (user) {
      loadDestinationsFromDatabase();
    } else {
      // Clear destinations when user logs out
      setDestinations([]);
      setCurrentDestination(null);
      setLoading(false);
    }
  }, [user]);

  const loadDestinationsFromDatabase = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Auto-activate plans first
      await travelPlansService.autoActivatePlans(user.id);
      
      // Then fetch all travel plans
      const travelPlans = await travelPlansService.getUserTravelPlans(user.id);
      const userDestinations = travelPlans.map(convertTravelPlanToDestination);
      setDestinations(userDestinations);
      
      // Set current destination to the first active one
      const active = userDestinations.find((d: UserDestination) => d.status === 'active');
      if (active) {
        setCurrentDestination(active);
      } else if (userDestinations.length > 0) {
        // If no active destinations, set the first upcoming one
        const upcoming = userDestinations.find(d => d.status === 'planned' && new Date(d.startDate) >= new Date());
        setCurrentDestination(upcoming || userDestinations[0]);
      }
      
      console.log(`📍 Loaded ${userDestinations.length} destinations for user`);
    } catch (error) {
      console.error('Error loading destinations from database:', error);
      // Fallback to localStorage for backward compatibility
      loadDestinationsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadDestinationsFromLocalStorage = () => {
    const savedDestinations = localStorage.getItem('userDestinations');
    if (savedDestinations) {
      const parsed = JSON.parse(savedDestinations);
      setDestinations(parsed);
      
      // Set current destination to the first active one
      const active = parsed.find((d: UserDestination) => d.status === 'active');
      if (active) {
        setCurrentDestination(active);
      }
    }
  };

  // Update travel plans count in user statistics when destinations change
  useEffect(() => {
    if (user && destinations.length >= 0) {
      userStatisticsService.updateUserStatistics(user.id, {
        travel_plans_count: destinations.length
      });
    }
  }, [user, destinations.length]);

  // Save destinations to localStorage for offline backup
  useEffect(() => {
    if (destinations.length > 0) {
      localStorage.setItem('userDestinations', JSON.stringify(destinations));
    }
  }, [destinations]);

  const addDestination = async (destination: Omit<UserDestination, 'id'>) => {
    if (!user) throw new Error('User must be logged in to add destinations');
    
    try {
      // Save to database first
      const travelPlanData = convertDestinationToTravelPlan(destination);
      const newTravelPlan = await travelPlansService.createTravelPlan(user.id, travelPlanData);
      
      if (newTravelPlan) {
        const newDestination = convertTravelPlanToDestination(newTravelPlan);
        setDestinations(prev => [...prev, newDestination]);
        
        // Update user statistics
        await userStatisticsService.incrementStatistic(user.id, 'travel_plans_count');
        
        console.log('✅ Destination added to database and UI');
      }
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  };

  const removeDestination = async (id: string) => {
    if (!user) throw new Error('User must be logged in to remove destinations');
    
    try {
      // Remove from database first
      const success = await travelPlansService.deleteTravelPlan(id);
      
      if (success) {
        setDestinations(prev => prev.filter(d => d.id !== id));
        if (currentDestination?.id === id) {
          setCurrentDestination(null);
        }
        
        // Update user statistics
        if (destinations.length > 0) {
          await userStatisticsService.updateUserStatistics(user.id, {
            travel_plans_count: destinations.length - 1
          });
        }
        
        console.log('✅ Destination removed from database and UI');
      }
    } catch (error) {
      console.error('Error removing destination:', error);
      throw error;
    }
  };

  const updateDestination = async (id: string, updates: Partial<UserDestination>) => {
    if (!user) throw new Error('User must be logged in to update destinations');
    
    try {
      // Convert updates to database format
      const dbUpdates: Partial<CreateTravelPlan> = {};
      if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      
      // Update in database first
      const updatedTravelPlan = await travelPlansService.updateTravelPlan(id, dbUpdates);
      
      if (updatedTravelPlan) {
        setDestinations(prev => 
          prev.map(d => d.id === id ? { ...d, ...updates } : d)
        );
        
        if (currentDestination?.id === id) {
          setCurrentDestination(prev => prev ? { ...prev, ...updates } : null);
        }
        
        console.log('✅ Destination updated in database and UI');
      }
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  };

  const refreshDestinations = async () => {
    await loadDestinationsFromDatabase();
  };

  const getActiveDestinations = () => {
    const now = new Date();
    return destinations.filter(d => {
      const startDate = new Date(d.startDate);
      const endDate = new Date(d.endDate);
      return d.alertsEnabled && d.status === 'active' && startDate <= now && now <= endDate;
    });
  };

  const getUpcomingDestinations = () => {
    const now = new Date();
    return destinations.filter(d => {
      const startDate = new Date(d.startDate);
      return d.status === 'planned' && startDate > now;
    });
  };

  return (
    <UserDestinationContext.Provider value={{
      destinations,
      currentDestination,
      loading,
      addDestination,
      removeDestination,
      setCurrentDestination,
      updateDestination,
      getActiveDestinations,
      getUpcomingDestinations,
      refreshDestinations
    }}>
      {children}
    </UserDestinationContext.Provider>
  );
}; 