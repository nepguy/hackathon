import { supabase } from './supabase';

export interface StoryComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
  // Virtual fields for display
  author?: {
    name: string;
    avatar: string;
  };
}

export interface CreateCommentData {
  story_id: string;
  content: string;
}

class StoryCommentsService {
  /**
   * Get all comments for a specific story using the new JSONB approach
   */
  async getStoryComments(storyId: string): Promise<StoryComment[]> {
    try {
      // Use the new database function to get comments
      const { data, error } = await supabase
        .rpc('get_story_comments', { 
          story_id_param: storyId,
          limit_param: 50,
          offset_param: 0
        });

      if (error) {
        if (error.code === '42883') {
          console.warn('⚠️ Comments functions not found. Please run the database migration.');
          console.warn('📋 See the new SQL migration for setup instructions.');
          // Fallback to direct query if functions don't exist
          return this.getCommentsDirectQuery(storyId);
        } else {
          console.error('Error fetching story comments:', error);
        }
        return [];
      }

      // Transform the JSONB data to our interface
      const comments = Array.isArray(data) ? data : [];
      return comments.map((comment: any) => ({
        ...comment,
        author: {
          name: comment.author_name || `Traveler ${comment.user_id.substring(0, 8)}`,
          avatar: comment.user_id.substring(0, 2).toUpperCase()
        }
      }));
    } catch (error) {
      console.error('Error in getStoryComments:', error);
      return [];
    }
  }

  /**
   * Fallback method to get comments directly from travel_stories table
   */
  private async getCommentsDirectQuery(storyId: string): Promise<StoryComment[]> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('comments')
        .eq('id', storyId)
        .single();

      if (error) {
        console.error('Error fetching comments directly:', error);
        return [];
      }

      const comments = data?.comments || [];
      return comments.map((comment: any) => ({
        ...comment,
        author: {
          name: comment.author_name || `Traveler ${comment.user_id.substring(0, 8)}`,
          avatar: comment.user_id.substring(0, 2).toUpperCase()
        }
      }));
    } catch (error) {
      console.error('Error in getCommentsDirectQuery:', error);
      return [];
    }
  }

  /**
   * Create a new comment using the database function
   */
  async createComment(userId: string, commentData: CreateCommentData): Promise<StoryComment | null> {
    try {
      // Get story owner info for notifications
      const { data: story } = await supabase
        .from('travel_stories')
        .select('user_id')
        .eq('id', commentData.story_id)
        .single();

      // Get user name for better comment display
      const { userDataService } = await import('./userDataService');
      const userInfo = await userDataService.getUserDisplayInfo(userId);
      const authorName = userInfo?.name || `Traveler ${userId.substring(0, 8)}`;

      // Use the new database function to add comment
      const { data, error } = await supabase
        .rpc('add_story_comment', {
          story_id_param: commentData.story_id,
          user_id_param: userId,
          content_param: commentData.content,
          author_name_param: authorName
        });

      if (error) {
        if (error.code === '42883') {
          const functionError = new Error('Comments functions not found. Please run the database migration. See the SQL migration file for setup instructions.');
          functionError.name = 'DatabaseSetupError';
          throw functionError;
        }
        console.error('Error creating comment:', error);
        throw error;
      }

      // Create notification for comment (if not commenting on own story)
      if (story?.user_id && story.user_id !== userId) {
        try {
          const { notificationsService } = await import('./notificationsService');
          await notificationsService.createCommentNotification(commentData.story_id, story.user_id, userId);
        } catch (notifError) {
          console.warn('Failed to create comment notification:', notifError);
          // Don't fail the comment operation if notification fails
        }
      }

      console.log('✅ Comment created successfully:', data);
      
      // Return with author data
      return {
        ...data,
        author: {
          name: authorName,
          avatar: userInfo?.initials || userId.substring(0, 2).toUpperCase()
        }
      };
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  }

  /**
   * Update an existing comment in the JSONB array
   */
  async updateComment(commentId: string, content: string, storyId: string): Promise<StoryComment | null> {
    try {
      // Get current story to update the specific comment
      const { data: story, error: fetchError } = await supabase
        .from('travel_stories')
        .select('comments')
        .eq('id', storyId)
        .single();

      if (fetchError) {
        console.error('Error fetching story for comment update:', fetchError);
        throw fetchError;
      }

      // Update the specific comment in the array
      const comments = story.comments || [];
      const updatedComments = comments.map((comment: any) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content,
            updated_at: new Date().toISOString()
          };
        }
        return comment;
      });

      // Save back to database
      const { data, error } = await supabase
        .from('travel_stories')
        .update({ 
          comments: updatedComments,
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .select('comments')
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      // Find and return the updated comment
      const updatedComment = updatedComments.find((c: any) => c.id === commentId);
      if (updatedComment) {
        return {
          ...updatedComment,
          author: {
            name: updatedComment.author_name || `Traveler ${updatedComment.user_id.substring(0, 8)}`,
            avatar: updatedComment.user_id.substring(0, 2).toUpperCase()
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment from the JSONB array
   */
  async deleteComment(commentId: string, storyId: string): Promise<boolean> {
    try {
      // Get current story to remove the specific comment
      const { data: story, error: fetchError } = await supabase
        .from('travel_stories')
        .select('comments, comments_count')
        .eq('id', storyId)
        .single();

      if (fetchError) {
        console.error('Error fetching story for comment deletion:', fetchError);
        return false;
      }

      // Remove the specific comment from the array
      const comments = story.comments || [];
      const filteredComments = comments.filter((comment: any) => comment.id !== commentId);

      // Update the story with new comments array and decremented count
      const { error } = await supabase
        .from('travel_stories')
        .update({ 
          comments: filteredComments,
          comments_count: Math.max(0, (story.comments_count || 0) - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId);

      if (error) {
        console.error('Error deleting comment:', error);
        return false;
      }

      console.log('✅ Comment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  }

  /**
   * Get comment count for a specific story
   */
  async getCommentCount(storyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('comments_count')
        .eq('id', storyId)
        .single();

      if (error) {
        console.error('Error getting comment count:', error);
        return 0;
      }

      return data?.comments_count || 0;
    } catch (error) {
      console.error('Error in getCommentCount:', error);
      return 0;
    }
  }

  /**
   * Get user's own comments across all stories
   */
  async getUserComments(userId: string): Promise<StoryComment[]> {
    try {
      const { data, error } = await supabase
        .from('travel_stories')
        .select('id, title, location, comments')
        .not('comments', 'eq', '[]')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user comments:', error);
        return [];
      }

      // Extract user's comments from all stories
      const userComments: StoryComment[] = [];
      data.forEach((story: any) => {
        const comments = story.comments || [];
        const storyUserComments = comments
          .filter((comment: any) => comment.user_id === userId)
          .map((comment: any) => ({
            ...comment,
            story_title: story.title,
            story_location: story.location,
            author: {
              name: comment.author_name || `Traveler ${comment.user_id.substring(0, 8)}`,
              avatar: comment.user_id.substring(0, 2).toUpperCase()
            }
          }));
        userComments.push(...storyUserComments);
      });

      // Sort by creation date
      return userComments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error in getUserComments:', error);
      return [];
    }
  }
}

// Create and export singleton instance
export const storyCommentsService = new StoryCommentsService();

// React hook for components
export const useStoryComments = () => {
  return {
    getStoryComments: storyCommentsService.getStoryComments.bind(storyCommentsService),
    createComment: storyCommentsService.createComment.bind(storyCommentsService),
    updateComment: storyCommentsService.updateComment.bind(storyCommentsService),
    deleteComment: storyCommentsService.deleteComment.bind(storyCommentsService),
    getCommentCount: storyCommentsService.getCommentCount.bind(storyCommentsService),
    getUserComments: storyCommentsService.getUserComments.bind(storyCommentsService),
  };
}; 