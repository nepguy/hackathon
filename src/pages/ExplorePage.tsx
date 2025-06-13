import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/explore/SearchBar';
import CategoryFilter from '../components/explore/CategoryFilter';
import DestinationCard from '../components/explore/DestinationCard';
import { popularDestinations } from '../data/mockData';
import { Destination } from '../types';

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Popular');
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  // Filter destinations based on search and category
  const filteredDestinations = popularDestinations.filter((destination) => {
    const matchesSearch = searchQuery === '' || 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'Popular' || 
      destination.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer title="Explore">
      <SearchBar onSearch={handleSearch} />
      
      <CategoryFilter onFilterChange={handleCategoryChange} />
      
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No destinations found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDestinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default ExplorePage;