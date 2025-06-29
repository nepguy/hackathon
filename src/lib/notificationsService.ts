import { supabase } from './supabase';
import { userDataService } from './userDataService';

export interface Notification {
  id: string;
  user_id: string; // recipient
  actor_id: string; // who performed the action
  actor_name: string;
  actor_avatar?: string;
  type: 'like' | 'comment' | 'follow' | 'story_share';
  content: string;
  story_id?: string;
  story_title?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCreate {
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'story_share';
  content: string;
  story_id?: string;
}

class NotificationsService {
  /**
   * Create a new notification
   */
  async createNotification(notification: NotificationCreate): Promise<boolean> {
    try {
      // Don't create notification if user is notifying themselves
      if (notification.user_id === notification.actor_id) {
        return true;
      }

      // Get actor information
      const actorInfo = await userDataService.getUserDisplayInfo(notification.actor_id);
      if (!actorInfo) {
        console.warn('Could not get actor info for notification');
        return false;
      }

      // Get story title if story_id is provided
      let storyTitle = '';
      if (notification.story_id) {
        const { data: story } = await supabase
          .from('travel_stories')
          .select('title')
          .eq('id', notification.story_id)
          .single();
        
        storyTitle = story?.title || 'your post';
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          actor_id: notification.actor_id,
          actor_name: actorInfo.name,
          actor_avatar: actorInfo.avatar_url,
          type: notification.type,
          content: notification.content,
          story_id: notification.story_id,
          story_title: storyTitle,
          is_read: false
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      console.log('✅ Notification created successfully');
      return true;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return false;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Helper method to create like notification
   */
  async createLikeNotification(storyId: string, storyOwnerId: string, likerUserId: string): Promise<boolean> {
    return this.createNotification({
      user_id: storyOwnerId,
      actor_id: likerUserId,
      type: 'like',
      content: 'liked your post',
      story_id: storyId
    });
  }

  /**
   * Helper method to create comment notification
   */
  async createCommentNotification(storyId: string, storyOwnerId: string, commenterUserId: string): Promise<boolean> {
    return this.createNotification({
      user_id: storyOwnerId,
      actor_id: commenterUserId,
      type: 'comment',
      content: 'commented on your post',
      story_id: storyId
    });
  }
}

// Create and export singleton instance
export const notificationsService = new NotificationsService();

// React hook for components
export const useNotifications = () => {
  return {
    createNotification: notificationsService.createNotification.bind(notificationsService),
    getUserNotifications: notificationsService.getUserNotifications.bind(notificationsService),
    markAsRead: notificationsService.markAsRead.bind(notificationsService),
    markAllAsRead: notificationsService.markAllAsRead.bind(notificationsService),
    getUnreadCount: notificationsService.getUnreadCount.bind(notificationsService),
    deleteNotification: notificationsService.deleteNotification.bind(notificationsService),
    createLikeNotification: notificationsService.createLikeNotification.bind(notificationsService),
    createCommentNotification: notificationsService.createCommentNotification.bind(notificationsService),
  };
}; 