import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { popularDestinations } from '../data/mockData';
import { 
  Search, Filter, MapPin, Shield, Star, TrendingUp,
  X, ChevronRight, Globe, Users, Award
} from 'lucide-react';

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['All', 'Popular', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure'];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Filter destinations based on search and category
  const filteredDestinations = popularDestinations.filter((destination) => {
    const matchesSearch = searchQuery === '' || 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || 
      destination.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const getSafetyColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const featuredStats = [
    { label: 'Countries', value: '195+', icon: Globe },
    { label: 'Travelers', value: '50K+', icon: Users },
    { label: 'Safety Rating', value: '4.9', icon: Award },
  ];

  return (
    <PageContainer 
      title="Explore Destinations"
      subtitle="Discover safe and amazing places to visit"
    >
      <div className="space-y-8 stagger-children">
        
        {/* Featured Stats */}
        <div className="grid grid-cols-3 gap-4">
          {featuredStats.map((stat, index) => (
            <div key={index} className="card p-4 text-center">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
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
              placeholder="Search destinations..."
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
              {filteredDestinations.length} destinations found
            </h3>
            {searchQuery && (
              <p className="text-sm text-slate-600">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by popularity</span>
          </div>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="card p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No destinations found</h3>
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
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="card p-0 overflow-hidden group">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={destination.imageUrl} 
                      alt={destination.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Safety Score Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 ${getSafetyColor(destination.safetyScore)}`}>
                      <Shield className="w-4 h-4" />
                      <span>{destination.safetyScore}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {destination.name}
                          </h3>
                          <div className="flex items-center text-slate-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{destination.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {destination.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {destination.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        Popular destination
                      </div>
                      <button className="btn-primary flex items-center space-x-2 group">
                        <span>Explore</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
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