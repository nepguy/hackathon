import React, { useState } from 'react';

interface CategoryFilterProps {
  onFilterChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onFilterChange }) => {
  const [activeCategory, setActiveCategory] = useState('Popular');
  
  const categories = [
    'Popular', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure'
  ];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-1.5 sm:space-x-2 pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeCategory === category
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;