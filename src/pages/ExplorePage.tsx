import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { 
  Search, MapPin, Heart, MessageCircle, 
  X, Users, Star, Globe, Plus, Send, Edit3, Trash2, Check
} from 'lucide-react';
import { useTravelStories } from '../lib/travelStoriesService';
import type { TravelStory } from '../lib/travelStoriesService';
import { useAuth } from '../contexts/AuthContext';
import ShareStoryModal from '../components/explore/ShareStoryModal';
import { useStoryComments, StoryComment } from '../lib/storyCommentsService';

// Update ShareStoryModal props to match component interface


const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const { 
    getTravelStories, 
    toggleLike, 
    getStoriesStats, 
    getUserLikedStories 
  } = useTravelStories();
  const { 
    getStoryComments, 
    createComment,
    updateComment,
    deleteComment 
  } = useStoryComments();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showShareModal, setShowShareModal] = useState(false);
  const [travelStories, setTravelStories] = useState<TravelStory[]>([]);
  const [storiesStats, setStoriesStats] = useState({
    totalStories: 0,
    totalLocations: 0,
    totalTags: [] as string[],
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [likingStory, setLikingStory] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedStoryForComment, setSelectedStoryForComment] = useState<TravelStory | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const categories = ['All', 'Solo Travel', 'Family', 'Adventure', 'Cultural', 'Budget', 'Luxury'];

  // Load travel stories with proper author names from database
  const loadTravelStories = async () => {
    setLoading(true);
    try {
      // Get stories with user profile data by fetching separately and merging
      const { supabase } = await import('../lib/supabase');
      
      console.log('📚 Loading travel stories with user profiles...');
      
      // Get stories and profiles separately, then merge them
      const [storiesResult, profilesResult] = await Promise.all([
        supabase
          .from('travel_stories')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('user_profiles')
          .select('id, full_name, email')
      ]);

      let stories: TravelStory[] = [];
      
      if (storiesResult.error) {
        console.error('Error fetching stories:', storiesResult.error);
        // Final fallback to service method
        stories = await getTravelStories({ limit: 50 });
      } else {
        const storiesData = storiesResult.data || [];
        const profilesData = profilesResult.data || [];
        
        console.log(`📚 Found ${storiesData.length} stories and ${profilesData.length} user profiles`);
        
        // Create a map of user profiles for quick lookup
        const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
        
        // Merge stories with profile data
        stories = storiesData.map((story: any) => ({
          ...story,
          user_profiles: profilesMap.get(story.user_id) || null
        }));
      }

      const stats = await getStoriesStats();
      
      console.log('📚 Loaded travel stories:', stories?.length || 0);
      setTravelStories(stories || []);
      setStoriesStats(stats);

      // Load user's liked stories if user is logged in
      if (user) {
        try {
          const userLikedStoryIds = await getUserLikedStories(user.id);
          setLikedStories(new Set(userLikedStoryIds));
          console.log('💖 Loaded user liked stories:', userLikedStoryIds.length);
        } catch (error) {
          console.error('Error loading user liked stories:', error);
          setLikedStories(new Set());
        }
      } else {
        setLikedStories(new Set());
      }
    } catch (err) {
      console.error('Error loading travel stories:', err);
      setTravelStories([]);
      setStoriesStats({
        totalStories: 0,
        totalLocations: 0,
        totalTags: [],
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravelStories();
  }, []);

  const handleShareStorySuccess = async () => {
    console.log('✅ Story shared successfully, refreshing stories list');
    await loadTravelStories();
  };

  const handleLikeStory = async (storyId: string) => {
    if (!user) {
      alert('Please sign in to like stories');
      return;
    }

    if (likingStory === storyId) return; // Prevent double clicks

    setLikingStory(storyId);
    const isCurrentlyLiked = likedStories.has(storyId);
      
    try {
      const result = await toggleLike(storyId, user.id, isCurrentlyLiked);
      
      if (result.success) {
        // Update local state based on the result
        setLikedStories(prev => {
          const newSet = new Set(prev);
          if (result.isLiked) {
            newSet.add(storyId);
          } else {
            newSet.delete(storyId);
          }
          return newSet;
        });

        // Update story likes count in local state with the actual count from database
        setTravelStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, likes_count: result.newLikesCount || story.likes_count }
            : story
        ));

        console.log(`✅ ${result.isLiked ? 'Liked' : 'Unliked'} story ${storyId}. New count: ${result.newLikesCount}`);
      } else {
        console.error('Failed to toggle like - user may have already performed this action');
        // Refresh the liked stories to ensure UI is in sync
        if (user) {
          try {
            const userLikedStoryIds = await getUserLikedStories(user.id);
            setLikedStories(new Set(userLikedStoryIds));
          } catch (refreshError) {
            console.error('Error refreshing liked stories:', refreshError);
          }
        }
      }
    } catch (error) {
      console.error('Error liking story:', error);
    } finally {
      setLikingStory(null);
    }
  };

  const handleCommentStory = async (story: TravelStory) => {
    setSelectedStoryForComment(story);
    setShowCommentModal(true);
    setLoadingComments(true);

    try {
      const storyComments = await getStoryComments(story.id);
      setComments(storyComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !selectedStoryForComment || !newComment.trim()) return;

    setSubmittingComment(true);

    try {
      const comment = await createComment(user.id, {
        story_id: selectedStoryForComment.id,
        content: newComment.trim()
      });

      if (comment) {
        // Add new comment to the list
        setComments(prev => [...prev, comment]);
        setNewComment('');

        // Update the story's comment count in the main list
        setTravelStories(prev => prev.map(story => 
          story.id === selectedStoryForComment.id 
            ? { ...story, comments_count: story.comments_count + 1 }
            : story
        ));
        
        console.log('✅ Comment added successfully');
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      if (error.name === 'DatabaseSetupError') {
        alert('Comments feature needs database setup. Please check the console for setup instructions.');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedStoryForComment(null);
    setComments([]);
    setNewComment('');
    setEditingComment(null);
    setEditCommentContent('');
    setDeletingComment(null);
  };

  const handleEditComment = (comment: StoryComment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!selectedStoryForComment || !editCommentContent.trim()) return;

    try {
      const updatedComment = await updateComment(commentId, editCommentContent.trim(), selectedStoryForComment.id);
      if (updatedComment) {
        // Update the comments list
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? { ...comment, content: editCommentContent.trim() } : comment
        ));
        setEditingComment(null);
        setEditCommentContent('');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedStoryForComment) return;

    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    try {
      setDeletingComment(commentId);
      const success = await deleteComment(commentId, selectedStoryForComment.id);
      if (success) {
        // Remove the comment from the list
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        // Update the story's comment count
        setTravelStories((prev: any) => prev.map((story: any) => 
          story.id === selectedStoryForComment.id 
            ? { ...story, comments_count: (story.comments_count || 1) - 1 }
            : story
        ));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingComment(null);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Filter stories based on search and category
  const filteredStories = travelStories.filter((story: TravelStory) => {
    const matchesSearch = searchQuery === '' || 
      story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || 
      story.tags.some((tag: string) => tag.toLowerCase().includes(activeCategory.toLowerCase())) ||
      (story.travel_style && story.travel_style.toLowerCase().includes(activeCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Travel Stories</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Discover real experiences from fellow travelers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<Globe className="w-5 h-5 text-blue-600" />}
            value={storiesStats.totalLocations}
            label="Countries Covered"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-green-600" />}
            value={storiesStats.totalStories}
            label="Stories Shared"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search travel stories, destinations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Share Your Story</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex space-x-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery || activeCategory !== 'All' ? 'No matching stories found' : 'No stories found'}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery || activeCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Be the first to share your travel experience!'
                }
              </p>
            </div>
          ) : (
            filteredStories.map((story: TravelStory) => (
              <StoryCard
                key={story.id}
                story={story}
                isLiked={likedStories.has(story.id)}
                onLike={() => handleLikeStory(story.id)}
                onComment={() => handleCommentStory(story)}
                isLiking={likingStory === story.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareStoryModal
          isOpen={true}
          onClose={() => setShowShareModal(false)}
          onSubmit={handleShareStorySuccess}
        />
      )}

      {showCommentModal && selectedStoryForComment && (
        <CommentModal
          story={selectedStoryForComment}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          onSubmit={handleSubmitComment}
          onClose={handleCloseCommentModal}
          loading={loadingComments}
          submitting={submittingComment}
          currentUserId={user?.id}
          editingComment={editingComment}
          editCommentContent={editCommentContent}
          setEditCommentContent={setEditCommentContent}
          onEditComment={handleEditComment}
          onSaveEditComment={handleSaveEditComment}
          onCancelEditComment={handleCancelEditComment}
          onDeleteComment={handleDeleteComment}
          deletingComment={deletingComment}
        />
      )}
    </PageContainer>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 flex flex-col items-center justify-center text-center">
    <div className="mb-2">{icon}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Story Card Component
const StoryCard: React.FC<{
  story: TravelStory & { user_profiles?: { full_name: string; email: string } };
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  isLiking: boolean;
}> = ({ story, isLiked, onLike, onComment, isLiking }) => {
  // Get author name from profile or fallback
  const getAuthorName = () => {
    if (story.user_profiles?.full_name) {
      return story.user_profiles.full_name;
    }
    if (story.user_profiles?.email) {
      return story.user_profiles.email.split('@')[0];
    }
    return `Traveler ${story.user_id.substring(0, 8)}`;
  };

  const getAuthorInitials = () => {
    const name = getAuthorName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {story.images && story.images.length > 0 && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={story.images[0]}
            alt={story.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {getAuthorInitials()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{getAuthorName()}</p>
            <p className="text-xs text-gray-500">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{story.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <MapPin className="inline-block w-4 h-4 mr-1" />
              {story.location}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{story.rating?.toFixed(1) || '-'}</span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{story.description}</p>
        
        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {story.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{story.likes_count || 0}</span>
            </button>
            <button
              onClick={onComment}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{story.comments_count || 0}</span>
            </button>
          </div>
          {story.budget_range && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {story.budget_range}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Comment Modal Component
const CommentModal: React.FC<{
  story: TravelStory;
  comments: StoryComment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  submitting: boolean;
  currentUserId?: string;
  editingComment: string | null;
  editCommentContent: string;
  setEditCommentContent: (content: string) => void;
  onEditComment: (comment: StoryComment) => void;
  onSaveEditComment: (commentId: string) => void;
  onCancelEditComment: () => void;
  onDeleteComment: (commentId: string) => void;
  deletingComment: string | null;
}> = ({
  story,
  comments,
  newComment,
  setNewComment,
  onSubmit,
  onClose,
  loading,
  submitting,
  currentUserId,
  editingComment,
  editCommentContent,
  setEditCommentContent,
  onEditComment,
  onSaveEditComment,
  onCancelEditComment,
  onDeleteComment,
  deletingComment
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
    <div className="bg-white w-full md:w-[500px] md:rounded-lg max-h-[90vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">Comments on "{story.title}"</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{comment.author_name || 'Anonymous'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {currentUserId === comment.user_id && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditComment(comment)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit comment"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete comment"
                      >
                        {deletingComment === comment.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSaveEditComment(comment.id)}
                      disabled={!editCommentContent.trim()}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                        !editCommentContent.trim()
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={onCancelEditComment}
                      className="flex items-center space-x-1 px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSubmit}
            disabled={!newComment.trim() || submitting}
            className={`
              px-4 py-2 rounded-lg font-medium
              ${!newComment.trim() || submitting
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ExplorePage;