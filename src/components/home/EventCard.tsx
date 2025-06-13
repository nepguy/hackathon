import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  attendees: number;
  category: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card card-hover group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md text-white">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
          {event.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-1" />
            {formatDate(event.date)}
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock size={14} className="mr-1" />
            {event.time}
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users size={14} className="mr-1" />
            {event.attendees} attending
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;