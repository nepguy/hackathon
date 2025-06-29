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
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache
  private activeRequests = new Set<string>();
  private ongoingPromises = new Map<string, Promise<any>>(); // Share ongoing promises

  /**
   * Execute request with intelligent caching and request deduplication
   */
  private async executeWithCache<T>(
    key: string, 
    requestFn: () => Promise<T>,
    skipCache: boolean = false
  ): Promise<T> {
    // Check if this request is already in progress
    if (this.ongoingPromises.has(key)) {
      console.log(`🔄 Waiting for ongoing request: ${key}`);
      // Wait for and share the result of the ongoing request
      try {
        return await this.ongoingPromises.get(key)!;
      } catch (error) {
        // If ongoing request fails, remove it and try again
        this.ongoingPromises.delete(key);
        this.activeRequests.delete(key);
        throw error;
      }
    }

    // Check cache first (unless skipped)
    if (!skipCache) {
      const cached = this.requestCache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log(`💾 Using cached data for: ${key}`);
        return cached.data;
      }
    }

    // Create and store the promise for sharing
    const promise = this.executeRequest<T>(key, requestFn);
    this.ongoingPromises.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up the ongoing promise
      this.ongoingPromises.delete(key);
    }
  }

  /**
   * Execute the actual request with proper cleanup
   */
  private async executeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Mark request as active
    this.activeRequests.add(key);

    try {
      console.log(`🌐 Making fresh request for: ${key}`);
      const result = await requestFn();
      
      // Cache the result
      this.requestCache.set(key, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Request completed successfully: ${key}`);
      return result;
    } finally {
      // Remove from active requests
      this.activeRequests.delete(key);
    }
  }

  /**
   * Fetch all travel stories with optional filtering
   */
  async getTravelStories(filters?: {
    location?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<TravelStory[]> {
    const cacheKey = `stories-${JSON.stringify(filters || {})}`;
    
    return this.executeWithCache(cacheKey, async () => {
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
    });
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

      // Clear cache when new story is created
      this.requestCache.clear();
      console.log('🗑️ Cache cleared after new story creation');
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
   * Like/Unlike a travel story - FIXED to match current database functions
   */
  async toggleLike(storyId: string, userId: string, isCurrentlyLiked: boolean): Promise<{ success: boolean; newLikesCount?: number; isLiked?: boolean }> {
    try {
      // Get story owner info for notifications
      const { data: story } = await supabase
        .from('travel_stories')
        .select('user_id')
        .eq('id', storyId)
        .single();

      // Use the existing functions that match your current database
      const functionName = isCurrentlyLiked ? 'unlike_story' : 'like_story';
      
      const { data, error } = await supabase.rpc(functionName, {
        story_id_param: storyId,
        user_id_param: userId
      });

      if (error) {
        console.error(`Error ${isCurrentlyLiked ? 'unliking' : 'liking'} story:`, error);
        return { success: false };
      }

      if (!data || !data.success) {
        console.log(`Cannot ${isCurrentlyLiked ? 'unlike' : 'like'} story: ${data?.message || 'Unknown error'}`);
        return { success: false };
      }

      // Create notification for like (if liking, not unliking, and not own story)
      const newIsLiked = data.action === 'liked';
      if (newIsLiked && story?.user_id && story.user_id !== userId) {
        try {
          const { notificationsService } = await import('./notificationsService');
          await notificationsService.createLikeNotification(storyId, story.user_id, userId);
        } catch (notifError) {
          console.warn('Failed to create like notification:', notifError);
          // Don't fail the like operation if notification fails
        }
      }

      // Clear cache to ensure fresh data on next fetch
      this.requestCache.clear();
      
      console.log(`✅ ${data.action} story ${storyId}. New count: ${data.new_likes_count}`);
      
      return { 
        success: true, 
        newLikesCount: data.new_likes_count,
        isLiked: newIsLiked
      };
    } catch (error) {
      console.error('Error in toggleLike:', error);
      return { success: false };
    }
  }

  /**
   * Check if user has liked a story - SIMPLIFIED VERSION
   */
  async hasUserLikedStory(storyId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_liked_story', {
        story_id_param: storyId,
        user_id_param: userId
      });

      if (error) {
        console.error('Error checking if user liked story:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in hasUserLikedStory:', error);
      return false;
    }
  }

  /**
   * Get all stories liked by user - FIXED to match current database
   */
  async getUserLikedStories(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_liked_stories', {
        user_id_param: userId
      });

      if (error) {
        console.error('Error getting user liked stories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserLikedStories:', error);
      return [];
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
    const cacheKey = 'stories-stats';
    
    return this.executeWithCache(cacheKey, async () => {
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
    });
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
    hasUserLikedStory: travelStoriesService.hasUserLikedStory.bind(travelStoriesService),
    getUserLikedStories: travelStoriesService.getUserLikedStories.bind(travelStoriesService),
    searchTravelStories: travelStoriesService.searchTravelStories.bind(travelStoriesService),
    getStoriesStats: travelStoriesService.getStoriesStats.bind(travelStoriesService),
  };
}; 