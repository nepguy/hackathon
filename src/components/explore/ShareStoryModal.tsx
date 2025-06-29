import React, { useState } from 'react';
import { X, Upload, Calendar, MapPin, Tag, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTravelStories } from '../../lib/travelStoriesService';

// Chip component adapted to current UI patterns
const Chip: React.FC<{
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, className = '', children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${className}`}
  >
    {children}
  </button>
);

const AVAILABLE_TAGS = [
  'Solo Travel',
  'Family',
  'Adventure',
  'Cultural',
  'Budget',
  'Luxury',
];

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ShareStoryModal: React.FC<ShareStoryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const { createTravelStory } = useTravelStories();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [budgetRange, setBudgetRange] = useState('');
  const [duration, setDuration] = useState('');
  const [travelStyle, setTravelStyle] = useState('');
  const [images, setImages] = useState<FileList | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDate('');
    setDescription('');
    setSelectedTags([]);
    setRating(0);
    setBudgetRange('');
    setDuration('');
    setTravelStyle('');
    setImages(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to share your story');
      return;
    }

    setLoading(true);

    try {
      // Handle image upload to Supabase storage
      const imageUrls: string[] = [];
      
      if (images && images.length > 0) {
        // For now, we'll store placeholder URLs
        // In a real implementation, you would upload to Supabase Storage
        for (let i = 0; i < Math.min(images.length, 4); i++) {
          imageUrls.push(`placeholder_image_${i + 1}.jpg`);
        }
      }
      
      // Insert travel story into database using service
      const data = await createTravelStory(user.id, {
        title,
        location,
        travel_date: date,
        description,
        tags: selectedTags,
        rating,
        budget_range: budgetRange,
        duration,
        travel_style: travelStyle,
        images: imageUrls
      });

      if (!data) {
        alert('Failed to share your story. Please try again.');
        return;
      }

      console.log('✅ Travel story created successfully via service:', data);
      
      // Reset form and close modal
      resetForm();
      onClose();
      onSubmit(); // Trigger refresh of stories list
      
      alert('Your travel story has been shared successfully! 🎉');
      
    } catch (error) {
      console.error('Error sharing story:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[99999] animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Share Your Travel Story</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Story Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story an engaging title..."
              className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Location and Date Row */}
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Tokyo, Japan"
                className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Travel Date *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Your Story *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Share your travel experience, tips, and memorable moments..."
              className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Travel Style Tags
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <Chip
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white hover:bg-blue-700 text-xs px-2 py-0.5 sm:px-3 sm:py-1'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-xs px-2 py-0.5 sm:px-3 sm:py-1'
                  }
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Overall Rating
            </label>
            <div className="flex space-x-0.5 sm:space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-0.5 sm:p-1 transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                  disabled={loading}
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Additional Details Row */}
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label htmlFor="budget" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Budget Range
              </label>
              <input
                id="budget"
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="$50-100/day"
                className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Duration
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="7 days"
                className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="style" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Travel Style
              </label>
              <select
                id="style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="">Select style</option>
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Group">Group</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="images" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload Images (Optional)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-3 sm:file:mr-4 file:py-1 file:px-3 sm:file:py-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You can upload multiple images to showcase your travel experience
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 sm:space-x-4 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 sm:px-6 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Share Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareStoryModal; 