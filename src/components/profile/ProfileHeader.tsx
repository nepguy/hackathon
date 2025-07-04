import React from 'react';
import { User } from '@supabase/supabase-js';
import { Edit2 } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  // Get user metadata or fallback to defaults
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3183ff&color=fff&size=96`;

  return (
    <div className="flex flex-col items-center pt-4 pb-6">
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="w-full h-full object-cover"
          />
        </div>
        <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 sm:p-1.5 rounded-full shadow-md">
          <Edit2 size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
      <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-gray-900">{displayName}</h2>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{user.email}</p>
    </div>
  );
};

export default ProfileHeader;