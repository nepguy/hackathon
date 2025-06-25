import { supabase } from './supabase';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface UserStatistics {
  id: string;
  user_id: string;
  travel_plans_count: number;
  safety_score: number;
  days_tracked: number;
  created_at: string;
  updated_at: string;
}

class UserStatisticsService {
  /**
   * Get user statistics from Supabase
   */
  async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          return this.createUserStatistics(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return null;
    }
  }

  /**
   * Create initial user statistics
   */
  async createUserStatistics(userId: string): Promise<UserStatistics | null> {
    try {
      // Default values for new users
      const defaultStats = {
        user_id: userId,
        travel_plans_count: 0,
        safety_score: 95,
        days_tracked: 0
      };

      const { data, error } = await supabase
        .from('user_statistics')
        .insert(defaultStats)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Created initial user statistics');
      return data;
    } catch (error) {
      console.error('Error creating user statistics:', error);
      return null;
    }
  }

  /**
   * Update user statistics
   */
  async updateUserStatistics(userId: string, updates: Partial<UserStatistics>): Promise<UserStatistics | null> {
    try {
      // First check if statistics exist
      const existing = await this.getUserStatistics(userId);
      
      if (!existing) {
        // Create with the updates applied
        const defaultStats = {
          user_id: userId,
          travel_plans_count: updates.travel_plans_count || 0,
          safety_score: updates.safety_score || 95,
          days_tracked: updates.days_tracked || 0
        };

        const { data, error } = await supabase
          .from('user_statistics')
          .insert(defaultStats)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Update existing statistics
      const { data, error } = await supabase
        .from('user_statistics')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating user statistics:', error);
      return null;
    }
  }

  /**
   * Increment a specific statistic
   */
  async incrementStatistic(userId: string, field: 'travel_plans_count' | 'days_tracked', amount: number = 1): Promise<boolean> {
    try {
      // First get current value
      const stats = await this.getUserStatistics(userId);
      
      if (!stats) {
        // Create with the incremented value
        const defaultStats = {
          user_id: userId,
          travel_plans_count: field === 'travel_plans_count' ? amount : 0,
          safety_score: 95,
          days_tracked: field === 'days_tracked' ? amount : 0
        };

        const { error } = await supabase
          .from('user_statistics')
          .insert(defaultStats);

        if (error) throw error;
        return true;
      }

      // Calculate new value
      const newValue = (stats[field] || 0) + amount;
      
      // Update the specific field
      const { error } = await supabase
        .from('user_statistics')
        .update({ [field]: newValue })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error incrementing ${field}:`, error);
      return false;
    }
  }

  /**
   * Update safety score
   */
  async updateSafetyScore(userId: string, score: number): Promise<boolean> {
    try {
      // Ensure score is between 0 and 100
      const validScore = Math.max(0, Math.min(100, score));
      
      const { error } = await supabase
        .from('user_statistics')
        .update({ safety_score: validScore })
        .eq('user_id', userId);

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_statistics')
            .insert({
              user_id: userId,
              safety_score: validScore,
              travel_plans_count: 0,
              days_tracked: 0
            });

          if (insertError) throw insertError;
          return true;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating safety score:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time updates for user statistics
   * Note: Realtime is disabled to prevent WebSocket errors
   */
  subscribeToUserStatistics(userId: string, callback: (stats: UserStatistics) => void): () => void {
    console.log('🔇 Real-time subscription disabled for user statistics to prevent WebSocket errors');
    
    // Return a no-op unsubscribe function since realtime is disabled
    return () => {
      console.log('🔇 User statistics subscription cleanup (no-op)');
    };
  }
}

// Create and export singleton instance
export const userStatisticsService = new UserStatisticsService();

// React hook for components
export const useUserStatistics = () => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStatistics(null);
      setLoading(false);
      return;
    }

    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const stats = await userStatisticsService.getUserStatistics(user.id);
        setStatistics(stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching user statistics:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    // Subscribe to real-time updates
    const unsubscribe = userStatisticsService.subscribeToUserStatistics(
      user.id,
      (updatedStats) => {
        setStatistics(updatedStats);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  return {
    statistics,
    loading,
    error,
    updateStatistics: async (updates: Partial<UserStatistics>) => {
      if (!user) return null;
      return userStatisticsService.updateUserStatistics(user.id, updates);
    },
    incrementTravelPlans: async (amount: number = 1) => {
      if (!user) return false;
      return userStatisticsService.incrementStatistic(user.id, 'travel_plans_count', amount);
    },
    incrementDaysTracked: async (amount: number = 1) => {
      if (!user) return false;
      return userStatisticsService.incrementStatistic(user.id, 'days_tracked', amount);
    },
    updateSafetyScore: async (score: number) => {
      if (!user) return false;
      return userStatisticsService.updateSafetyScore(user.id, score);
    }
  };
};