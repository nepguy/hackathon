import React, { useState } from 'react';
import { X, Upload, Calendar, MapPin, Tag, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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
      
      // Insert travel story into database
      const { data, error } = await supabase
        .from('travel_stories')
        .insert({
          user_id: user.id,
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
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating travel story:', error);
        alert('Failed to share your story. Please try again.');
        return;
      }

      console.log('✅ Travel story created successfully:', data);
      
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Travel Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Story Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story an engaging title..."
              className="input w-full"
              required
              disabled={loading}
            />
          </div>

          {/* Location and Date Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Tokyo, Japan"
                className="input w-full"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Travel Date *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input w-full"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Your Story *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Share your travel experience, tips, and memorable moments..."
              className="input w-full resize-none"
              required
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Travel Style Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <Chip
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Overall Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  disabled={loading}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Additional Details Row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <input
                id="budget"
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="$50-100/day"
                className="input w-full"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="7 days"
                className="input w-full"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                Travel Style
              </label>
              <select
                id="style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="input w-full"
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
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload Images (Optional)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="input w-full"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can upload multiple images to showcase your travel experience
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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