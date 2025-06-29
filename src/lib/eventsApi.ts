

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  url: string;
  logo?: {
    url: string;
  };
  venue?: {
    name: string;
    address: {
      address_1: string;
      city: string;
      region: string;
      country: string;
      postal_code: string;
    };
    latitude: string;
    longitude: string;
  };
  category: {
    id: string;
    name: string;
  };
  is_free: boolean;
  ticket_availability: {
    minimum_ticket_price?: {
      currency: string;
      value: number;
      display: string;
    };
  };
}

export interface TravelEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  isFree: boolean;
  price?: string;
  imageUrl?: string;
  eventUrl: string;
  source: 'eventbrite';
}

export interface EventsApiResponse {
  events: TravelEvent[];
  pagination?: {
    page_number: number;
    page_size: number;
    total_items: number;
  };
}

// Legacy interface for backward compatibility
export interface TravelEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  isFree: boolean;
  price?: string;
  imageUrl?: string;
  eventUrl: string;
  source: 'eventbrite';
}

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  category: string;
  price?: {
    min: number;
    max: number;
    currency: string;
    isFree: boolean;
  };
  organizer: {
    name: string;
    url?: string;
  };
  ticketUrl?: string;
  imageUrl?: string;
  source: 'eventbrite' | 'local' | 'fallback';
  tags: string[];
  attendeeCount?: number;
  rating?: number;
}

class EventsApiService {
  private requestCache = new Map<string, { data: LocalEvent[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private readonly REQUEST_LIMIT = 10; // requests per minute
  private requestCount = 0;
  private requestResetTime = Date.now() + 60000; // 1 minute from now

  // Rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    if (now > this.requestResetTime) {
      this.requestCount = 0;
      this.requestResetTime = now + 60000;
    }
    
    if (this.requestCount >= this.REQUEST_LIMIT) {
      console.warn('⚠️ Events API rate limit reached. Using cached data.');
      return false;
    }
    
    this.requestCount++;
    return true;
  }

  /**
   * Get events from Eventbrite API (simulated for demo)
   */
  private async getEventbriteEvents(_location: string, _radius: number = 25): Promise<LocalEvent[]> {
    try {
      // Note: In production, you would need to set up a backend proxy for Eventbrite API
      // as it requires OAuth and doesn't support CORS for client-side requests
      
      console.log('🎪 Simulating Eventbrite API call for:', location);
      
      // Simulate realistic Eventbrite events
      const simulatedEvents: LocalEvent[] = [
        {
          id: 'eb-1',
          title: 'Tech Meetup: AI & Travel Innovation',
          description: 'Join fellow travelers and tech enthusiasts to discuss how AI is revolutionizing the travel industry.',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          location: {
            name: 'Innovation Hub',
            address: 'Downtown Tech Center',
            latitude: 40.7128,
            longitude: -74.0060
          },
          category: 'Technology',
          price: {
            min: 0,
            max: 0,
            currency: 'USD',
            isFree: true
          },
          organizer: {
            name: 'Travel Tech Community',
            url: 'https://example.com'
          },
          ticketUrl: 'https://eventbrite.com/example',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
          source: 'eventbrite',
          tags: ['tech', 'ai', 'travel', 'networking'],
          attendeeCount: 45,
          rating: 4.7
        },
        {
          id: 'eb-2',
          title: 'Cultural Food Festival',
          description: 'Experience authentic cuisines from around the world in this vibrant food festival.',
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            name: 'Central Park',
            address: 'Main Park Area',
            latitude: 40.7829,
            longitude: -73.9654
          },
          category: 'Food & Drink',
          price: {
            min: 15,
            max: 25,
            currency: 'USD',
            isFree: false
          },
          organizer: {
            name: 'Cultural Events Co.',
            url: 'https://example.com'
          },
          ticketUrl: 'https://eventbrite.com/example',
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          source: 'eventbrite',
          tags: ['food', 'culture', 'festival', 'family'],
          attendeeCount: 230,
          rating: 4.9
        },
        {
          id: 'eb-3',
          title: 'Photography Workshop: Travel Stories',
          description: 'Learn to capture stunning travel photos and tell compelling stories through your lens.',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          location: {
            name: 'Photography Studio',
            address: 'Arts District',
            latitude: 40.7505,
            longitude: -73.9934
          },
          category: 'Arts & Culture',
          price: {
            min: 75,
            max: 75,
            currency: 'USD',
            isFree: false
          },
          organizer: {
            name: 'Visual Arts Academy',
            url: 'https://example.com'
          },
          ticketUrl: 'https://eventbrite.com/example',
          imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
          source: 'eventbrite',
          tags: ['photography', 'workshop', 'travel', 'arts'],
          attendeeCount: 12,
          rating: 4.8
        }
      ];

      return simulatedEvents;
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      return [];
    }
  }

  /**
   * Get local events from various sources
   */
  private async getLocalEvents(_location: string): Promise<LocalEvent[]> {
    try {
      // Simulate local events data
      const localEvents: LocalEvent[] = [
        {
          id: 'local-1',
          title: 'Weekly Farmers Market',
          description: 'Fresh local produce, artisanal goods, and community gathering every Saturday morning.',
          startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
          location: {
            name: 'Town Square',
            address: 'Main Street Plaza',
            latitude: 40.7589,
            longitude: -73.9851
          },
          category: 'Community',
          price: {
            min: 0,
            max: 0,
            currency: 'USD',
            isFree: true
          },
          organizer: {
            name: 'Local Community Board',
            url: 'https://example.com'
          },
          imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
          source: 'local',
          tags: ['market', 'local', 'community', 'food'],
          attendeeCount: 150,
          rating: 4.5
        },
        {
          id: 'local-2',
          title: 'Live Jazz Night',
          description: 'Enjoy smooth jazz performances by local artists in an intimate venue setting.',
          startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          location: {
            name: 'Blue Note Café',
            address: 'Music District',
            latitude: 40.7282,
            longitude: -74.0776
          },
          category: 'Music',
          price: {
            min: 20,
            max: 35,
            currency: 'USD',
            isFree: false
          },
          organizer: {
            name: 'Blue Note Entertainment',
            url: 'https://example.com'
          },
          imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
          source: 'local',
          tags: ['music', 'jazz', 'nightlife', 'entertainment'],
          attendeeCount: 80,
          rating: 4.6
        }
      ];

      return localEvents;
    } catch (error) {
      console.error('Error fetching local events:', error);
      return [];
    }
  }

  /**
   * Get fallback events when APIs are unavailable
   */
  private getFallbackEvents(_location: string): LocalEvent[] {
    return [
      {
        id: 'fallback-1',
        title: 'Community Walking Tour',
        description: 'Explore local history and hidden gems with experienced guides.',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Tourist Information Center',
          address: 'City Center',
        },
        category: 'Tours & Activities',
        price: {
          min: 0,
          max: 0,
          currency: 'USD',
          isFree: true
        },
        organizer: {
          name: 'Local Tourism Board'
        },
        source: 'fallback',
        tags: ['tour', 'walking', 'history', 'local'],
        rating: 4.3
      },
      {
        id: 'fallback-2',
        title: 'Art Gallery Opening',
        description: 'Discover new works by emerging local artists in this monthly showcase.',
        startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Contemporary Art Gallery',
          address: 'Arts Quarter',
        },
        category: 'Arts & Culture',
        price: {
          min: 0,
          max: 0,
          currency: 'USD',
          isFree: true
        },
        organizer: {
          name: 'Local Arts Council'
        },
        source: 'fallback',
        tags: ['art', 'gallery', 'culture', 'exhibition'],
        rating: 4.4
      }
    ];
  }

  /**
   * Get comprehensive events from multiple sources
   */
  async getEventsForLocation(location: string, options: {
    includeEventbrite?: boolean;
    includeLocal?: boolean;
    radius?: number;
    maxResults?: number;
  } = {}): Promise<LocalEvent[]> {
    const {
      includeEventbrite = true,
      includeLocal = true,
      radius = 25,
      maxResults = 20
    } = options;

    // Check cache first
    const cacheKey = `events-${location}-${JSON.stringify(options)}`;
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('💾 Using cached events data for:', location);
      return cached.data;
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      // Return cached data if available, otherwise fallback
      if (cached) {
        return cached.data;
      }
      return this.getFallbackEvents(location);
    }

    try {
      console.log('🎪 Fetching events for location:', location);
      
      const eventPromises: Promise<LocalEvent[]>[] = [];
      
      if (includeEventbrite) {
        eventPromises.push(this.getEventbriteEvents(location, radius));
      }
      
      if (includeLocal) {
        eventPromises.push(this.getLocalEvents(location));
      }

      const results = await Promise.allSettled(eventPromises);
      
      // Combine all successful results
      let allEvents: LocalEvent[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allEvents = allEvents.concat(result.value);
        }
      });

      // Add fallback events if we don't have enough
      if (allEvents.length < 3) {
        allEvents = allEvents.concat(this.getFallbackEvents(location));
      }

      // Sort by date and rating
      allEvents.sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        
        // Prioritize upcoming events
        if (Math.abs(dateA - dateB) < 24 * 60 * 60 * 1000) { // Within 1 day
          return (b.rating || 0) - (a.rating || 0); // Sort by rating
        }
        return dateA - dateB; // Sort by date
      });

      // Limit results
      const limitedEvents = allEvents.slice(0, maxResults);

      // Cache the results
      this.requestCache.set(cacheKey, {
        data: limitedEvents,
        timestamp: Date.now()
      });

      console.log(`✅ Loaded ${limitedEvents.length} events for ${location}`);
      return limitedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Return cached data if available, otherwise fallback
      if (cached) {
        console.log('📦 Using stale cached events due to error');
        return cached.data;
      }
      
      console.log('🔄 Using fallback events due to error');
      return this.getFallbackEvents(location);
    }
  }

  /**
   * Search events by category or keyword
   */
  async searchEvents(query: string, location?: string): Promise<LocalEvent[]> {
    const events = await this.getEventsForLocation(location || 'current location');
    
    const searchTerm = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.category.toLowerCase().includes(searchTerm) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Clear cache (useful for refresh functionality)
   */
  clearCache(): void {
    this.requestCache.clear();
    console.log('🗑️ Events cache cleared');
  }
}

// Helper function to convert LocalEvent to TravelEvent for backward compatibility
function convertToTravelEvent(localEvent: LocalEvent): TravelEvent {
  return {
    id: localEvent.id,
    title: localEvent.title,
    description: localEvent.description,
    startDate: localEvent.startDate,
    endDate: localEvent.endDate || localEvent.startDate,
    location: {
      name: localEvent.location.name,
      address: localEvent.location.address,
      coordinates: {
        lat: localEvent.location.latitude || 0,
        lng: localEvent.location.longitude || 0
      }
    },
    category: localEvent.category,
    isFree: localEvent.price?.isFree || false,
    price: localEvent.price?.isFree ? 'Free' : `$${localEvent.price?.min || 0}`,
    imageUrl: localEvent.imageUrl,
    eventUrl: localEvent.ticketUrl || '#',
    source: 'eventbrite'
  };
}

// Legacy service wrapper for backward compatibility
class LegacyEventsService {
  private apiService = new EventsApiService();

  async searchEvents(query: string, location?: string): Promise<{ events: TravelEvent[] }> {
    const localEvents = await this.apiService.searchEvents(query, location);
    return {
      events: localEvents.map(convertToTravelEvent)
    };
  }

  async getTravelEvents(location?: string): Promise<{ events: TravelEvent[] }> {
    const localEvents = await this.apiService.getEventsForLocation(location || 'current location');
    return {
      events: localEvents.map(convertToTravelEvent)
    };
  }

  async getEventsNearLocation(lat: number, lng: number, radius: number = 25): Promise<{ events: TravelEvent[] }> {
    const location = `${lat},${lng}`;
    const localEvents = await this.apiService.getEventsForLocation(location, { radius });
    return {
      events: localEvents.map(convertToTravelEvent)
    };
  }
}

// Create and export singleton instances
export const eventsApiService = new EventsApiService();
export const eventsService = new LegacyEventsService(); // Legacy export

// React hook for components
export const useEventsApi = () => {
  return {
    getEventsForLocation: eventsApiService.getEventsForLocation.bind(eventsApiService),
    searchEvents: eventsApiService.searchEvents.bind(eventsApiService),
    clearCache: eventsApiService.clearCache.bind(eventsApiService),
  };
}; 