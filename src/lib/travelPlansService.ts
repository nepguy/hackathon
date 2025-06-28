import { supabase } from './supabase';

export interface TravelPlan {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateTravelPlan {
  destination: string;
  start_date: string;
  end_date: string;
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
}

class TravelPlansService {
  /**
   * Get all travel plans for a user
   */
  async getUserTravelPlans(userId: string): Promise<TravelPlan[]> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching travel plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching travel plans:', error);
      return [];
    }
  }

  /**
   * Create a new travel plan
   */
  async createTravelPlan(userId: string, planData: CreateTravelPlan): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .insert({
          user_id: userId,
          destination: planData.destination,
          start_date: planData.start_date,
          end_date: planData.end_date,
          status: planData.status || 'planned'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating travel plan:', error);
        throw error;
      }

      console.log('✅ Travel plan created successfully');
      return data;
    } catch (error) {
      console.error('Error creating travel plan:', error);
      throw error;
    }
  }

  /**
   * Update a travel plan
   */
  async updateTravelPlan(planId: string, updates: Partial<CreateTravelPlan>): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error updating travel plan:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating travel plan:', error);
      throw error;
    }
  }

  /**
   * Delete a travel plan
   */
  async deleteTravelPlan(planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('travel_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting travel plan:', error);
        return false;
      }

      console.log('✅ Travel plan deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      return false;
    }
  }

  /**
   * Get active travel plans for a user
   */
  async getActiveTravelPlans(userId: string): Promise<TravelPlan[]> {
    try {
      const now = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching active travel plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active travel plans:', error);
      return [];
    }
  }

  /**
   * Get upcoming travel plans for a user
   */
  async getUpcomingTravelPlans(userId: string): Promise<TravelPlan[]> {
    try {
      const now = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['planned', 'active'])
        .gt('start_date', now)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming travel plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming travel plans:', error);
      return [];
    }
  }

  /**
   * Auto-activate travel plans that have started
   */
  async autoActivatePlans(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString().split('T')[0];
      
      // Auto-activate planned travels that have started
      await supabase
        .from('travel_plans')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .eq('status', 'planned')
        .lte('start_date', now);

      // Auto-complete active travels that have ended
      await supabase
        .from('travel_plans')
        .update({ status: 'completed' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .lt('end_date', now);

    } catch (error) {
      console.error('Error auto-activating plans:', error);
    }
  }
}

// Create and export singleton instance
export const travelPlansService = new TravelPlansService();

export const getTravelPlans = (userId: string) => travelPlansService.getUserTravelPlans(userId); 