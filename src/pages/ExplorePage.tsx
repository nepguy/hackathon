import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { 
  Search, Filter, MapPin, Heart, MessageCircle, 
  X, Users, Star, Globe, Shield,
  TrendingUp, Share2, Plus, Send
} from 'lucide-react';
import { useTravelStories } from '../lib/travelStoriesService';
import type { TravelStory } from '../lib/travelStoriesService';
import { useAuth } from '../contexts/AuthContext';
import ShareStoryModal from '../components/explore/ShareStoryModal';
import { useStoryComments, StoryComment } from '../lib/storyCommentsService';

const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const { toggleLike, getTravelStories, getStoriesStats, getUserLikedStories } = useTravelStories();
  const { getStoryComments, createComment } = useStoryComments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
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
  
  // Comment-related state
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const categories = ['All', 'Solo Travel', 'Family', 'Adventure', 'Cultural', 'Budget', 'Luxury'];

  // Load travel stories from Supabase - Fixed infinite loop
  const loadTravelStories = async () => {
    setLoading(true);
    try {
      const [stories, stats] = await Promise.all([
        getTravelStories({ limit: 50 }),
        getStoriesStats()
      ]);
      
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

  // Load stories only once on component mount
  useEffect(() => {
    loadTravelStories();
  }, []); // Empty dependency array - load only once

  const handleShareStorySuccess = async () => {
    // Refresh stories when a new one is added
    console.log('🔄 Refreshing stories after new story added');
    await loadTravelStories();
  };

  // Handle like/unlike functionality
  const handleLikeStory = async (storyId: string) => {
    if (!user) {
      alert('Please login to like stories');
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

  // Handle comment functionality
  const handleCommentStory = async (story: TravelStory) => {
    if (!user) {
      alert('Please login to comment on stories');
      return;
    }
    
    setSelectedStoryForComment(story);
    setShowCommentModal(true);
    setNewComment('');
    
    // Load comments for this story
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

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!user || !selectedStoryForComment || !newComment.trim()) {
      return;
    }

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

  // Handle closing comment modal
  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedStoryForComment(null);
    setComments([]);
    setNewComment('');
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Filter stories based on search and category
  const filteredStories = travelStories.filter((story) => {
    const matchesSearch = searchQuery === '' || 
      story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || 
      story.tags.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase())) ||
      (story.travel_style && story.travel_style.toLowerCase().includes(activeCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  // Create author data from user_id for display purposes
  const getStoryDisplayData = (story: TravelStory) => {
    // Generate display data from story properties
    const userInitials = story.user_id.substring(0, 2).toUpperCase();
    const userName = `Traveler ${story.user_id.substring(0, 8)}`;
    
    return {
      author: {
        avatar: userInitials,
        name: userName,
        verified: Math.random() > 0.7 // Some users are verified
      },
      destination: {
        name: story.location.split(',')[0] || story.location,
        country: story.location.split(',')[1]?.trim() || story.location
      }
    };
  };

  const communityStats = [
    { 
      label: 'Travel Stories', 
      value: storiesStats.totalStories.toString(), 
      icon: Globe 
    },
    { 
      label: 'Active Travelers', 
      value: travelStories.length > 0 ? new Set(travelStories.map(story => story.user_id)).size.toString() : '0', 
      icon: Users 
    },
    { 
      label: 'Countries Covered', 
      value: storiesStats.totalLocations.toString(), 
      icon: MapPin 
    },
  ];

  return (
    <PageContainer 
      title="Travel Stories"
      subtitle="Discover real experiences from fellow travelers"
    >
      <div className="space-y-6 sm:space-y-8 stagger-children">
        
        {/* Community Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {communityStats.map((stat, index) => (
            <div key={index} className="card p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 group">
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header with Share Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Travel Stories</h2>
            <p className="text-sm text-slate-600">Share your experiences and discover new destinations</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-primary flex items-center space-x-2 hover:shadow-lg transition-all duration-200 mt-3 sm:mt-0 w-full sm:w-auto text-sm py-2 px-3 sm:py-3 sm:px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Share Your Story</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search travel stories, destinations..."
              className="input pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-ghost flex items-center space-x-1 sm:space-x-2 flex-shrink-0 text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {filteredStories.length} travel stories found
            </h3>
            {searchQuery && (
              <p className="text-xs sm:text-sm text-slate-600">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 mt-2 sm:mt-0">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by rating</span>
          </div>
        </div>

        {/* Travel Stories */}
        {filteredStories.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {loading ? 'Loading stories...' : 'No stories found'}
            </h3>
            <p className="text-sm text-slate-600 mb-3 sm:mb-4">
              {loading ? 'Please wait while we fetch travel stories' : 'Try adjusting your search or filter criteria'}
            </p>
            {!loading && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="btn-primary text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredStories
              .sort((a, b) => b.rating - a.rating)
              .map((story) => {
                const displayData = getStoryDisplayData(story);
                return (
                  <div key={story.id} className="card p-3 sm:p-6 hover:shadow-xl transition-all duration-300 group">
                    {/* Author Header */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-lg flex-shrink-0">
                          {displayData.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{displayData.author.name}</h4>
                            {displayData.author.verified && 
                              <Shield className="w-4 h-4 text-blue-500" />
                            }
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {displayData.destination.name}, {displayData.destination.country}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < story.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="sm:pl-13">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">{story.title}</h3>
                      
                      {story.images && story.images.length > 0 && (
                        <div className="flex space-x-2 mb-3 sm:mb-4 overflow-x-auto">
                          {story.images.slice(0, 4).map((_, index) => (
                            <div key={index} className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                              📸
                            </div>
                          ))}
                          {story.images.length > 4 && (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-200 rounded-lg flex items-center justify-center text-base sm:text-lg text-slate-600 flex-shrink-0">
                              +{story.images.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                        {story.description}
                      </p>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                        {/* Tags */}
                        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
                          {(story.tags || []).slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs font-medium whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Date */}
                        <div className="flex-shrink-0 ml-2 sm:ml-4">
                          <span className="font-medium">{new Date(story.travel_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-200 mt-3 sm:mt-4 pt-3 sm:pt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <button 
                          onClick={() => handleLikeStory(story.id)}
                          disabled={likingStory === story.id}
                          className={`flex items-center transition-colors duration-200 ${
                            likedStories.has(story.id) 
                              ? 'text-red-500' 
                              : 'text-slate-600 hover:text-red-500'
                          } ${likingStory === story.id ? 'opacity-50' : ''}`}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                          <span className="font-medium ml-1 text-sm">{story.likes_count}</span>
                        </button>
                        <button 
                          onClick={() => handleCommentStory(story)}
                          className="flex items-center text-slate-600 hover:text-blue-500 transition-colors duration-200"
                        >
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-medium ml-1 text-sm">{story.comments_count}</span>
                        </button>
                      </div>
                      <button className="btn-ghost flex items-center text-xs sm:text-sm py-1 px-2">
                        <Share2 className="w-4 h-4" />
                        <span className="ml-1">Share</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </div>

      {/* Share Story Modal */}
      <ShareStoryModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSubmit={handleShareStorySuccess}
      />

      {/* Comment Modal */}
      {showCommentModal && selectedStoryForComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Comments</h3>
              <button
                onClick={handleCloseCommentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Story Info */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{selectedStoryForComment.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{selectedStoryForComment.location}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loadingComments ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-gray-500">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                  <p className="text-xs sm:text-sm font-medium">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                        {comment.author?.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-900">
                            {comment.author?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input */}
            {user && (
              <div className="p-4 sm:p-6 border-t border-gray-200">
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                    {user.id.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim() && !submittingComment) {
                            handleSubmitComment();
                          }
                        }
                      }}
                      placeholder="Write a comment... (Press Enter to submit, Shift+Enter for new line)"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows={2}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <span className="text-xs text-gray-500">
                        {newComment.length}/500 characters
                      </span>
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={handleCloseCommentModal}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || submittingComment}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2"
                        >
                          {submittingComment ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Post</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ExplorePage;