import { supabase } from './supabase';

export interface TravelStory {
  id: string;
  user_id: string;
  title: string;
  location: string;
  travel_date: string;
  description: string;
  tags: string[];
  images: string[];
  rating: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  safety_tips: string[];
  budget_range?: string;
  duration?: string;
  travel_style?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelStoryData {
  title: string;
  location: string;
  travel_date: string;
  description: string;
  tags: string[];
  rating: number;
  budget_range?: string;
  duration?: string;
  travel_style?: string;
  images?: string[];
}

class TravelStoriesService {
  /**
   * Fetch all travel stories with optional filtering
   */
  async getTravelStories(filters?: {
    location?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<TravelStory[]> {
    try {
      let query = supabase
        .from('travel_stories')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') {
          console.warn('⚠️ travel_stories table does not exist. Please run the database migration.');
          console.warn('📋 See DATABASE_SETUP_INSTRUCTIONS.md for setup steps.');
        } else {
          console.error('Error fetching travel stories:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTravelStories:', error);
      return [];
    }
  }

  /**
   * Get travel stories by specific user
   */
  async getUserTravelStories(userId: string): Promise<TravelStory[]> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user travel stories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTravelStories:', error);
      return [];
    }
  }

  /**
   * Get a single travel story by ID
   */
  async getTravelStoryById(id: string): Promise<TravelStory | null> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching travel story:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTravelStoryById:', error);
      return null;
    }
  }

  /**
   * Create a new travel story
   */
  async createTravelStory(userId: string, storyData: CreateTravelStoryData): Promise<TravelStory | null> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .insert({
          user_id: userId,
          ...storyData,
          images: storyData.images || [],
          safety_tips: [], // Can be added later
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating travel story:', error);
        throw error;
      }

      console.log('✅ Travel story created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createTravelStory:', error);
      throw error;
    }
  }

  /**
   * Update an existing travel story
   */
  async updateTravelStory(id: string, updates: Partial<CreateTravelStoryData>): Promise<TravelStory | null> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating travel story:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTravelStory:', error);
      throw error;
    }
  }

  /**
   * Delete a travel story
   */
  async deleteTravelStory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('travel_stories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting travel story:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTravelStory:', error);
      return false;
    }
  }

  /**
   * Like/Unlike a travel story
   */
  async toggleLike(storyId: string, increment: boolean = true): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_story_likes', {
        story_id: storyId,
        increment_by: increment ? 1 : -1
      });

      if (error) {
        console.error('Error toggling like:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleLike:', error);
      return false;
    }
  }

  /**
   * Search travel stories by text
   */
  async searchTravelStories(searchQuery: string, limit: number = 20): Promise<TravelStory[]> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching travel stories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchTravelStories:', error);
      return [];
    }
  }

  /**
   * Get travel stories statistics - Optimized single query
   */
  async getStoriesStats(): Promise<{
    totalStories: number;
    totalLocations: number;
    totalTags: string[];
    averageRating: number;
  }> {
    try {
      // Single optimized query to get all data at once
      const { data: allStories, error } = await supabase
        .from('travel_stories')
        .select('location, tags, rating');

      if (error) {
        if (error.code === '42P01') {
          console.warn('⚠️ travel_stories table does not exist. Please run the database migration.');
          console.warn('📋 See DATABASE_SETUP_INSTRUCTIONS.md for setup steps.');
        } else {
          console.error('Error getting stories stats:', error);
        }
        return {
          totalStories: 0,
          totalLocations: 0,
          totalTags: [],
          averageRating: 0
        };
      }

      if (!allStories || allStories.length === 0) {
        return {
          totalStories: 0,
          totalLocations: 0,
          totalTags: [],
          averageRating: 0
        };
      }

      // Process data efficiently
      const uniqueLocations = new Set(allStories.map((story: any) => story.location));
      const allTagsFlat = allStories.flatMap((story: any) => story.tags || []);
      const uniqueTags = Array.from(new Set(allTagsFlat.filter((tag: any) => typeof tag === 'string'))) as string[];
      const validRatings = allStories.filter((story: any) => story.rating > 0).map((story: any) => story.rating);
      const averageRating = validRatings.length > 0 
        ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length 
        : 0;

      return {
        totalStories: allStories.length,
        totalLocations: uniqueLocations.size,
        totalTags: uniqueTags,
        averageRating: Number(averageRating.toFixed(1))
      };
    } catch (error: any) {
      console.error('Error getting stories stats:', error);
      return {
        totalStories: 0,
        totalLocations: 0,
        totalTags: [],
        averageRating: 0
      };
    }
  }
}

// Create and export singleton instance
export const travelStoriesService = new TravelStoriesService();

// Hook for React components
export const useTravelStories = () => {
  return {
    getTravelStories: travelStoriesService.getTravelStories.bind(travelStoriesService),
    getUserTravelStories: travelStoriesService.getUserTravelStories.bind(travelStoriesService),
    getTravelStoryById: travelStoriesService.getTravelStoryById.bind(travelStoriesService),
    createTravelStory: travelStoriesService.createTravelStory.bind(travelStoriesService),
    updateTravelStory: travelStoriesService.updateTravelStory.bind(travelStoriesService),
    deleteTravelStory: travelStoriesService.deleteTravelStory.bind(travelStoriesService),
    toggleLike: travelStoriesService.toggleLike.bind(travelStoriesService),
    searchTravelStories: travelStoriesService.searchTravelStories.bind(travelStoriesService),
    getStoriesStats: travelStoriesService.getStoriesStats.bind(travelStoriesService),
  };
}; 