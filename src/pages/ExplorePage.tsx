import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { 
  Search, Filter, MapPin, Heart, MessageCircle, 
  X, Users, Star, Globe, Shield,
  TrendingUp, Share2, Plus
} from 'lucide-react';
import { useTravelStories } from '../lib/travelStoriesService';
import type { TravelStory } from '../lib/travelStoriesService';
import ShareStoryModal from '../components/explore/ShareStoryModal';

const ExplorePage: React.FC = () => {
  const { getTravelStories, getStoriesStats } = useTravelStories();
  
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
  
  const categories = ['All', 'Solo Travel', 'Family', 'Adventure', 'Cultural', 'Budget', 'Luxury'];

  // Load travel stories from Supabase
  const loadTravelStories = useCallback(async () => {
    setLoading(true);
    try {
      const [stories, storyStats] = await Promise.all([
        getTravelStories({ limit: 50 }),
        getStoriesStats()
      ]);
      setTravelStories(stories);
      setStoriesStats(storyStats);
    } catch (error) {
      console.error('Error loading travel stories:', error);
    } finally {
      setLoading(false);
    }
  }, [getTravelStories, getStoriesStats]);

  useEffect(() => {
    loadTravelStories();
  }, [loadTravelStories]);

  const handleShareStorySuccess = () => {
    // Refresh stories when a new one is added
    loadTravelStories();
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
      <div className="space-y-8 stagger-children">
        
        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {communityStats.map((stat, index) => (
            <div key={index} className="card p-4 text-center hover:shadow-lg transition-all duration-300 group">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header with Share Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Travel Stories</h2>
            <p className="text-slate-600">Share your experiences and discover new destinations</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-primary flex items-center space-x-2 hover:shadow-lg transition-all duration-200 mt-4 sm:mt-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Share Your Story</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search travel stories, destinations..."
              className="input pl-12 pr-12"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-ghost flex items-center space-x-2 flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {filteredStories.length} travel stories found
            </h3>
            {searchQuery && (
              <p className="text-sm text-slate-600">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 mt-2 sm:mt-0">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by rating</span>
          </div>
        </div>

        {/* Travel Stories */}
        {filteredStories.length === 0 ? (
          <div className="card p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {loading ? 'Loading stories...' : 'No stories found'}
            </h3>
            <p className="text-slate-600 mb-4">
              {loading ? 'Please wait while we fetch travel stories' : 'Try adjusting your search or filter criteria'}
            </p>
            {!loading && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="btn-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredStories
              .sort((a, b) => b.rating - a.rating)
              .map((story) => {
                const displayData = getStoryDisplayData(story);
                return (
                  <div key={story.id} className="card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group">
                    {/* Author Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                          {displayData.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-900">{displayData.author.name}</h4>
                            {displayData.author.verified && 
                              <Shield className="w-4 h-4 text-blue-500" />
                            }
                          </div>
                          <p className="text-sm text-slate-600">
                            {displayData.destination.name}, {displayData.destination.country}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center space-x-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < story.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="sm:pl-13">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{story.title}</h3>
                      
                      {story.images && story.images.length > 0 && (
                        <div className="flex space-x-2 mb-4 overflow-x-auto">
                          {story.images.slice(0, 4).map((_, index) => (
                            <div key={index} className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                              📸
                            </div>
                          ))}
                          {story.images.length > 4 && (
                            <div className="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-lg text-slate-600 flex-shrink-0">
                              +{story.images.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-slate-700 leading-relaxed mb-4">
                        {story.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        {/* Tags */}
                        <div className="flex items-center space-x-2 overflow-x-auto">
                          {(story.tags || []).slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Date */}
                        <div className="flex-shrink-0 ml-4">
                          <span className="font-medium">{new Date(story.travel_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-200 mt-4 pt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition-colors duration-200">
                          <Heart className="w-5 h-5" />
                          <span className="font-medium">{story.likes_count}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition-colors duration-200">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{story.comments_count}</span>
                        </button>
                      </div>
                      <button className="btn-ghost flex items-center space-x-2 text-sm">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
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
    </PageContainer>
  );
};

export default ExplorePage;