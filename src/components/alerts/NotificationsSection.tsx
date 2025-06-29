import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bell, Check, Trash2, Users, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Temporary mock notification type until we implement the real service
interface Notification {
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

// Mock notifications service until we implement the real one
const useNotifications = () => {
  const getMockNotifications = (userId: string): Notification[] => {
    return [
      {
        id: '1',
        user_id: userId,
        actor_id: 'actor1',
        actor_name: 'Sarah Chen',
        type: 'like',
        content: 'liked your post',
        story_id: 'story1',
        story_title: 'My Trip to Paris',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: '2',
        user_id: userId,
        actor_id: 'actor2',
        actor_name: 'Mike Rodriguez',
        type: 'comment',
        content: 'commented on your post',
        story_id: 'story1',
        story_title: 'My Trip to Paris',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '3',
        user_id: userId,
        actor_id: 'actor3',
        actor_name: 'David Kim',
        type: 'follow',
        content: 'started following you',
        is_read: false,
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
  };

  return {
    getUserNotifications: async (userId: string) => getMockNotifications(userId),
    markAsRead: async () => true,
    markAllAsRead: async () => true,
    deleteNotification: async () => true,
    getUnreadCount: async () => 2
  };
};

const NotificationsSection: React.FC = () => {
  const { user } = useAuth();
  const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const notifs = await getUserNotifications(user.id);
      const count = await getUnreadCount(user.id);
      
      setNotifications(notifs);
      setUnreadCount(count);
      console.log('📬 Loaded notifications:', notifs.length, 'unread:', count);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (markingAsRead === notificationId) return;

    setMarkingAsRead(notificationId);
    try {
      const success = await markAsRead(notificationId);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const success = await markAllAsRead(user.id);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Decrease unread count if it was unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'story_share':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Sign in to view your notifications</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-2">
              You'll see likes, comments, and other interactions here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex space-x-3">
                  {/* Actor Avatar */}
                  <div className="flex-shrink-0">
                    {notification.actor_avatar ? (
                      <img
                        src={notification.actor_avatar}
                        alt={notification.actor_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {notification.actor_name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{notification.actor_name}</span>
                          {' '}
                          <span className="text-gray-600">{notification.content}</span>
                          {notification.story_title && (
                            <span className="font-medium text-gray-900">
                              {' "'}
                              {notification.story_title.length > 30 
                                ? `${notification.story_title.substring(0, 30)}...`
                                : notification.story_title
                              }
                              {'"'}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingAsRead === notification.id}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;