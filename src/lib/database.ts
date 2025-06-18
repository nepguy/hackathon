import { supabase } from './supabase';
import { SafetyAlert, TravelPlan } from '../types';

export interface DatabaseSafetyAlert {
  id: string;
  destination: string;
  alert_type: string;
  title: string;
  message: string;
  severity: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTravelPlan {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserPreferences {
  id: string;
  user_id: string;
  destination: string | null;
  notifications_safety: boolean;
  notifications_weather: boolean;
  notifications_local_news: boolean;
  premium_trial_active: boolean;
  premium_trial_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  // Safety Alerts
  async getSafetyAlerts(destination?: string): Promise<SafetyAlert[]> {
    try {
      let query = supabase
        .from('safety_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (destination) {
        query = query.ilike('destination', `%${destination}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapDatabaseAlertToSafetyAlert);
    } catch (error) {
      console.error('Error fetching safety alerts:', error);
      return [];
    }
  }

  async createSafetyAlert(alert: Omit<DatabaseSafetyAlert, 'id' | 'created_at' | 'updated_at'>): Promise<SafetyAlert | null> {
    try {
      const { data, error } = await supabase
        .from('safety_alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseAlertToSafetyAlert(data);
    } catch (error) {
      console.error('Error creating safety alert:', error);
      return null;
    }
  }

  async markAlertAsRead(alertId: string, userId?: string): Promise<boolean> {
    try {
      // For now, we'll store read status in localStorage since we don't have a user_alert_reads table
      // In a production app, you'd want to create a proper table for this
      const readAlerts = JSON.parse(localStorage.getItem('readAlerts') || '[]');
      if (!readAlerts.includes(alertId)) {
        readAlerts.push(alertId);
        localStorage.setItem('readAlerts', JSON.stringify(readAlerts));
      }
      
      // In the future, this would be:
      // const { error } = await supabase
      //   .from('user_alert_reads')
      //   .upsert([{ user_id: userId, alert_id: alertId, read_at: new Date().toISOString() }]);
      // if (error) throw error;
      
      // Log userId for future implementation
      if (userId) {
        console.log(`Alert ${alertId} marked as read for user ${userId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  async getReadAlerts(): Promise<string[]> {
    try {
      return JSON.parse(localStorage.getItem('readAlerts') || '[]');
    } catch (error) {
      console.error('Error getting read alerts:', error);
      return [];
    }
  }

  // Travel Plans
  async getTravelPlans(userId: string): Promise<TravelPlan[]> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapDatabasePlanToTravelPlan);
    } catch (error) {
      console.error('Error fetching travel plans:', error);
      return [];
    }
  }

  async createTravelPlan(plan: Omit<DatabaseTravelPlan, 'id' | 'created_at' | 'updated_at'>): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabasePlanToTravelPlan(data);
    } catch (error) {
      console.error('Error creating travel plan:', error);
      return null;
    }
  }

  async updateTravelPlan(id: string, updates: Partial<DatabaseTravelPlan>): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabasePlanToTravelPlan(data);
    } catch (error) {
      console.error('Error updating travel plan:', error);
      return null;
    }
  }

  // User Profile
  async getUserProfile(userId: string): Promise<DatabaseUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<DatabaseUserProfile>): Promise<DatabaseUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<DatabaseUserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<DatabaseUserPreferences>): Promise<DatabaseUserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }
  }

  // Helper methods to map database records to app types
  private mapDatabaseAlertToSafetyAlert(dbAlert: DatabaseSafetyAlert): SafetyAlert {
    const severityMap: Record<number, 'low' | 'medium' | 'high'> = {
      1: 'low',
      2: 'medium',
      3: 'high'
    };

    const typeMap: Record<string, SafetyAlert['type']> = {
      'warning': 'safety',
      'danger': 'security',
      'info': 'health'
    };

    return {
      id: dbAlert.id,
      title: dbAlert.title,
      description: dbAlert.message,
      severity: severityMap[dbAlert.severity] || 'low',
      location: dbAlert.destination,
      timestamp: dbAlert.created_at,
      read: false, // Default to unread
      type: typeMap[dbAlert.alert_type] || 'safety',
      source: 'Database',
      tips: [] // Can be enhanced to store tips in database
    };
  }

  private mapDatabasePlanToTravelPlan(dbPlan: DatabaseTravelPlan): TravelPlan {
    // Generate a placeholder image URL based on destination
    const imageUrl = this.getDestinationImageUrl(dbPlan.destination);
    
    return {
      id: dbPlan.id,
      destination: dbPlan.destination,
      startDate: dbPlan.start_date,
      endDate: dbPlan.end_date || dbPlan.start_date,
      imageUrl,
      safetyScore: this.calculateSafetyScore(dbPlan.destination) // Can be enhanced with real calculation
    };
  }

  private getDestinationImageUrl(destination: string): string {
    // Use a service like Unsplash for destination images
    const cleanDestination = destination.replace(/[^a-zA-Z0-9]/g, '+');
    return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&auto=format&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8${cleanDestination}%20travel%20destination|en&auto=format&fit=crop&w=800&q=60`;
  }

  private calculateSafetyScore(destination: string): number {
    // This could be enhanced with real safety data
    // For now, return a random score between 70-95
    const hash = destination.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 70 + Math.abs(hash % 26);
  }

  // Real-time subscriptions
  subscribeToSafetyAlerts(callback: (alerts: SafetyAlert[]) => void, destination?: string) {
    let channel = supabase
      .channel('safety_alerts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'safety_alerts' 
        }, 
        async () => {
          const alerts = await this.getSafetyAlerts(destination);
          callback(alerts);
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToTravelPlans(userId: string, callback: (plans: TravelPlan[]) => void) {
    let channel = supabase
      .channel('travel_plans_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'travel_plans',
          filter: `user_id=eq.${userId}`
        }, 
        async () => {
          const plans = await this.getTravelPlans(userId);
          callback(plans);
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const databaseService = new DatabaseService();