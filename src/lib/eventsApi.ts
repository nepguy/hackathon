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

class EventsService {
  private apiKey: string;
  private baseUrl = 'https://www.eventbriteapi.com/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_EVENTBRITE_API_KEY;
    if (!this.apiKey) {
      console.warn('Eventbrite API key not found in environment variables');
    }
  }

  private async fetchEvents(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Eventbrite API key not configured');
    }

    const queryParams = new URLSearchParams(params);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  private transformEvent(event: EventbriteEvent): TravelEvent {
    return {
      id: event.id,
      title: event.name?.text || 'Untitled Event',
      description: event.description?.text || '',
      startDate: event.start?.local || new Date().toISOString(),
      endDate: event.end?.local || new Date().toISOString(),
      location: {
        name: event.venue?.name || 'TBD',
        address: event.venue ? 
          `${event.venue.address.address_1}, ${event.venue.address.city}, ${event.venue.address.region}` : 
          'Location TBD',
        coordinates: {
          lat: parseFloat(event.venue?.latitude || '0'),
          lng: parseFloat(event.venue?.longitude || '0')
        }
      },
      category: event.category?.name || 'Other',
      isFree: event.is_free,
      price: event.ticket_availability?.minimum_ticket_price?.display,
      imageUrl: event.logo?.url,
      eventUrl: event.url,
      source: 'eventbrite'
    };
  }

  // Public API methods
  async searchEvents(
    query: string, 
    location?: string, 
    categoryId?: string
  ): Promise<EventsApiResponse> {
    const params: Record<string, string> = {
      q: query,
      'sort_by': 'date',
      expand: 'venue,ticket_availability,category'
    };

    if (location) {
      params['location.address'] = location;
      params['location.within'] = '50km';
    }

    if (categoryId) {
      params['categories'] = categoryId;
    }

    try {
      const data = await this.fetchEvents('/events/search/', params);
      
      return {
        events: (data.events || []).map((event: EventbriteEvent) => this.transformEvent(event)),
        pagination: data.pagination
      };
    } catch (error) {
      console.warn('Eventbrite API unavailable, using fallback events:', error);
      // Return fallback events when API fails
      return this.getFallbackEvents(location, query);
    }
  }

  private getFallbackEvents(location?: string, query?: string): EventsApiResponse {
    const fallbackEvents: TravelEvent[] = [
      {
        id: 'fallback-1',
        title: 'Local Cultural Festival',
        description: 'Experience local culture and traditions in a vibrant festival setting.',
        startDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        location: {
          name: location || 'City Center',
          address: location || 'Downtown Area',
          coordinates: { lat: 0, lng: 0 }
        },
        category: 'Culture & Arts',
        isFree: false,
        price: '$25.00',
        eventUrl: '#',
        source: 'eventbrite'
      },
      {
        id: 'fallback-2',
        title: 'Food & Wine Tasting',
        description: 'Discover local flavors and culinary traditions.',
        startDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
        endDate: new Date(Date.now() + 86400000 * 7 + 10800000).toISOString(), // +3 hours
        location: {
          name: location || 'Local Venue',
          address: location || 'Restaurant District',
          coordinates: { lat: 0, lng: 0 }
        },
        category: 'Food & Drink',
        isFree: false,
        price: '$45.00',
        eventUrl: '#',
        source: 'eventbrite'
      },
      {
        id: 'fallback-3',
        title: 'Free Walking Tour',
        description: 'Explore the city with a knowledgeable local guide.',
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        endDate: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), // +2 hours
        location: {
          name: location || 'Meeting Point',
          address: location || 'Tourist Information Center',
          coordinates: { lat: 0, lng: 0 }
        },
        category: 'Tours & Travel',
        isFree: true,
        eventUrl: '#',
        source: 'eventbrite'
      }
    ];

    return { events: fallbackEvents };
  }

  async getTravelEvents(location?: string): Promise<EventsApiResponse> {
    try {
      return await this.searchEvents(
        'travel OR tourism OR culture OR festival OR museum OR exhibition', 
        location,
        '113' // Travel & Outdoor category ID
      );
    } catch (error) {
      console.warn('Falling back to sample travel events');
      return this.getFallbackEvents(location, 'travel');
    }
  }

  async getFoodEvents(location?: string): Promise<EventsApiResponse> {
    return this.searchEvents(
      'food OR restaurant OR culinary OR wine OR tasting', 
      location,
      '110' // Food & Drink category ID
    );
  }

  async getCulturalEvents(location?: string): Promise<EventsApiResponse> {
    return this.searchEvents(
      'culture OR art OR music OR theater OR history', 
      location,
      '105' // Performing & Visual Arts category ID
    );
  }

  async getBusinessEvents(location?: string): Promise<EventsApiResponse> {
    return this.searchEvents(
      'business OR networking OR conference OR workshop', 
      location,
      '101' // Business & Professional category ID
    );
  }

  async getEventsNearLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 25
  ): Promise<EventsApiResponse> {
    const params: Record<string, string> = {
      'location.latitude': latitude.toString(),
      'location.longitude': longitude.toString(),
      'location.within': `${radiusKm}km`,
      'sort_by': 'distance',
      expand: 'venue,ticket_availability,category'
    };

    try {
      const data = await this.fetchEvents('/events/search/', params);
      
      return {
        events: (data.events || []).map((event: EventbriteEvent) => this.transformEvent(event)),
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Error fetching nearby events:', error);
      return { events: [] };
    }
  }

  async getFreeEvents(location?: string): Promise<EventsApiResponse> {
    const params: Record<string, string> = {
      'price': 'free',
      'sort_by': 'date',
      expand: 'venue,ticket_availability,category'
    };

    if (location) {
      params['location.address'] = location;
      params['location.within'] = '50km';
    }

    try {
      const data = await this.fetchEvents('/events/search/', params);
      
      return {
        events: (data.events || []).map((event: EventbriteEvent) => this.transformEvent(event)),
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Error fetching free events:', error);
      return { events: [] };
    }
  }

  async getEventsByDateRange(
    startDate: string, 
    endDate: string, 
    location?: string
  ): Promise<EventsApiResponse> {
    const params: Record<string, string> = {
      'start_date.range_start': startDate,
      'start_date.range_end': endDate,
      'sort_by': 'date',
      expand: 'venue,ticket_availability,category'
    };

    if (location) {
      params['location.address'] = location;
      params['location.within'] = '50km';
    }

    try {
      const data = await this.fetchEvents('/events/search/', params);
      
      return {
        events: (data.events || []).map((event: EventbriteEvent) => this.transformEvent(event)),
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return { events: [] };
    }
  }
}

export const eventsService = new EventsService(); 