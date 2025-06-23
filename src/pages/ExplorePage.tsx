import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { 
  Search, Filter, MapPin, Heart, MessageCircle, 
  X, Calendar, Users, Star, Globe,
  TrendingUp, Share2, ChevronRight
} from 'lucide-react';

interface TravelStory {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  destination: {
    name: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  rating: number;
  visitDate: string;
  safetyTips: string[];
  budgetRange: string;
  duration: string;
  travelStyle: string;
  createdAt: string;
}

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['All', 'Solo Travel', 'Family', 'Adventure', 'Cultural', 'Budget', 'Luxury'];
  
  // Mock travel stories from real users
  const travelStories: TravelStory[] = [
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        verified: true
      },
      destination: {
        name: 'Tokyo',
        country: 'Japan',
        coordinates: { lat: 35.6762, lng: 139.6503 }
      },
      title: 'Solo Female Travel in Tokyo: A Week of Discovery',
      content: 'Tokyo exceeded all my expectations! As a solo female traveler, I felt incredibly safe throughout my week-long stay. The public transportation is amazing, people are helpful despite the language barrier, and the food... don\'t get me started on the food! 🍜',
      images: ['🏙️', '🍣', '🚄'],
      tags: ['Solo Travel', 'Food', 'Culture', 'Safe'],
      likes: 234,
      comments: 45,
      shares: 12,
      rating: 5,
      visitDate: '2024-01-15',
      safetyTips: [
        'Download Google Translate with camera feature',
        'Keep cash handy - many places don\'t accept cards',
        'Learn basic Japanese greetings'
      ],
      budgetRange: '$80-120/day',
      duration: '7 days',
      travelStyle: 'Solo',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      author: {
        name: 'Mike Rodriguez',
        avatar: '👨‍💻',
        verified: true
      },
      destination: {
        name: 'Santorini',
        country: 'Greece',
        coordinates: { lat: 36.3932, lng: 25.4615 }
      },
      title: 'Honeymoon Paradise: Santorini on a Budget',
      content: 'My wife and I managed to have an amazing honeymoon in Santorini without breaking the bank. We stayed in Oia, watched the famous sunsets, and discovered some incredible local tavernas away from the tourist crowds. The locals were so welcoming!',
      images: ['🌅', '🏛️', '🍷'],
      tags: ['Couple', 'Budget', 'Romance', 'Photography'],
      likes: 189,
      comments: 32,
      shares: 28,
      rating: 5,
      visitDate: '2024-02-10',
      safetyTips: [
        'Book accommodations early for better prices',
        'Rent an ATV to explore the island',
        'Try local wines and olive oil'
      ],
      budgetRange: '$100-150/day for couple',
      duration: '5 days',
      travelStyle: 'Couple',
      createdAt: '2024-02-18'
    },
    {
      id: '3',
      author: {
        name: 'David Kim',
        avatar: '👨‍🎓',
        verified: false
      },
      destination: {
        name: 'Banff',
        country: 'Canada',
        coordinates: { lat: 51.4968, lng: -115.9281 }
      },
      title: 'Family Adventure in the Canadian Rockies',
      content: 'Took our kids (8 and 12) to Banff National Park and it was absolutely magical! The hiking trails are well-maintained, wildlife viewing was incredible, and Lake Louise took our breath away. Perfect for families who love nature.',
      images: ['🏔️', '🦌', '🛶'],
      tags: ['Family', 'Nature', 'Hiking', 'Wildlife'],
      likes: 156,
      comments: 24,
      shares: 15,
      rating: 4,
      visitDate: '2024-03-05',
      safetyTips: [
        'Bring bear spray when hiking',
        'Check weather conditions before heading out',
        'Book activities in advance during peak season'
      ],
      budgetRange: '$120-180/day for family',
      duration: '6 days',
      travelStyle: 'Family',
      createdAt: '2024-03-12'
    }
  ];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Filter stories based on search and category
  const filteredStories = travelStories.filter((story) => {
    const matchesSearch = searchQuery === '' || 
      story.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.destination.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || 
      story.tags.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase())) ||
      story.travelStyle.toLowerCase().includes(activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const communityStats = [
    { label: 'Travel Stories', value: '2.5K+', icon: Globe },
    { label: 'Active Travelers', value: '12K+', icon: Users },
    { label: 'Countries Covered', value: '89', icon: MapPin },
  ];

  return (
    <PageContainer 
      title="Travel Stories"
      subtitle="Discover real experiences from fellow travelers"
    >
      <div className="space-y-8 stagger-children">
        
        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4">
          {communityStats.map((stat, index) => (
            <div key={index} className="card p-4 text-center hover:shadow-lg transition-all duration-300 group">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by rating</span>
          </div>
        </div>

        {/* Travel Stories */}
        {filteredStories.length === 0 ? (
          <div className="card p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No stories found</h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="btn-primary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredStories
              .sort((a, b) => b.rating - a.rating)
              .map((story) => (
              <div key={story.id} className="card p-6 hover:shadow-xl transition-all duration-300 group">
                {/* Author Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                      {story.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{story.author.name}</span>
                        {story.author.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span>{story.destination.name}, {story.destination.country}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(story.visitDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{story.rating}</span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {story.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {story.content}
                  </p>
                  
                  {/* Images */}
                  <div className="flex space-x-2 mb-4">
                    {story.images.map((image, index) => (
                      <div key={index} className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl">
                        {image}
                      </div>
                    ))}
                  </div>
                  
                  {/* Travel Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-slate-900">{story.duration}</div>
                      <div className="text-xs text-slate-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-slate-900">{story.budgetRange}</div>
                      <div className="text-xs text-slate-500">Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-slate-900">{story.travelStyle}</div>
                      <div className="text-xs text-slate-500">Style</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-slate-900">{story.safetyTips.length}</div>
                      <div className="text-xs text-slate-500">Safety Tips</div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Engagement Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors duration-200">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{story.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-500 transition-colors duration-200">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{story.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{story.shares}</span>
                    </button>
                  </div>
                  <button className="btn-primary text-sm flex items-center space-x-2 group">
                    <span>Read Full Story</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default ExplorePage;