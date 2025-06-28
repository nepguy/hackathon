import React from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, DollarSign } from 'lucide-react';
import { TravelEvent } from '../../lib/eventsApi';

// Keep the old Event interface for backward compatibility
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
  event: Event | TravelEvent;
  showExternalLink?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showExternalLink = false }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if this is a TravelEvent or legacy Event
  const isTravelEvent = (event: Event | TravelEvent): event is TravelEvent => {
    return 'startDate' in event;
  };

  const getEventData = () => {
    if (isTravelEvent(event)) {
      return {
        title: event.title,
        description: event.description,
        date: event.startDate,
        time: formatTime(event.startDate),
        location: typeof event.location === 'object' ? event.location.address : event.location,
        imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop',
        category: event.category,
        price: event.isFree ? 'Free' : event.price || 'Paid',
        eventUrl: event.eventUrl
      };
    } else {
      return {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        imageUrl: event.imageUrl,
        category: event.category,
        attendees: event.attendees
      };
    }
  };

  const eventData = getEventData();

  return (
    <div className="card card-hover group">
      <div className="relative h-32 sm:h-48 overflow-hidden">
        <img
          src={eventData.imageUrl}
          alt={eventData.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop';
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md text-white">
            {eventData.category}
          </span>
          {isTravelEvent(event) && eventData.price && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-500/80 backdrop-blur-md text-white flex items-center">
              <DollarSign size={10} className="mr-1" />
              {eventData.price}
            </span>
          )}
        </div>
      </div>
      
      <div className="mobile-card space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
          {eventData.title}
        </h3>
        
        <p className="text-xs text-gray-600 line-clamp-2">
          {eventData.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs">
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-1" />
            {formatDate(eventData.date)}
          </div>
          
          <div className="flex items-center text-gray-600 ml-1.5">
            <Clock size={14} className="mr-1" />
            {eventData.time}
          </div>
          
          {!isTravelEvent(event) && eventData.attendees && (
            <div className="flex items-center text-gray-600 ml-1.5">
              <Users size={14} className="mr-1" />
              {eventData.attendees} attending
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center text-gray-600 text-sm flex-1 min-w-0">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1 text-xs">{eventData.location}</span>
          </div>
          
          {showExternalLink && isTravelEvent(event) && eventData.eventUrl && (
            <a
              href={eventData.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;