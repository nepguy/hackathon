// src/lib/exaUnifiedService.ts - Unified Exa.ai Service for All Intelligence Needs
import Exa from 'exa-js';

// Enhanced interfaces for unified service
export interface ScamAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location?: string;
  scamType: 'phishing' | 'fraud' | 'theft' | 'romance' | 'investment' | 'travel' | 'other';
  source: {
    name: string;
    url: string;
    credibility: 'government' | 'verified' | 'community';
  };
  reportedDate: string;
  affectedAreas: string[];
  warningLevel: 'immediate' | 'caution' | 'advisory';
}

export interface TravelSafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alertType: 'security' | 'health' | 'weather' | 'political' | 'transport' | 'natural-disaster';
  location: string;
  source: {
    name: string;
    url: string;
    authority: 'government' | 'international' | 'local' | 'verified';
  };
  issuedDate: string;
  affectedRegions: string[];
  recommendations: string[];
}

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: {
    name: string;
    address: string;
  };
  category: 'cultural' | 'business' | 'entertainment' | 'sports' | 'education' | 'community' | 'food' | 'travel';
  isFree: boolean;
  eventUrl: string;
  source: {
    name: string;
    url: string;
  };
}

export interface LocalNews {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
    type: 'local' | 'regional' | 'national';
  };
  category: 'breaking' | 'politics' | 'business' | 'crime' | 'weather' | 'traffic' | 'community' | 'sports';
  location: string;
}

class ExaUnifiedService {
  private exa: Exa;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache
  private API_KEY: string;
  private isApiAvailable = true;

  constructor() {
    this.API_KEY = import.meta.env.VITE_EXA_API_KEY;
    if (!this.API_KEY || this.API_KEY === 'your_exa_api_key') {
      console.warn('⚠️ Exa API key not found in environment variables');
      this.isApiAvailable = false;
    } else {
      try {
        this.exa = new Exa(this.API_KEY);
        console.log('✅ Exa Unified Service initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Exa client:', error);
        this.isApiAvailable = false;
      }
    }
  }

  private async safeExaCall<T>(
    operation: () => Promise<T>,
    fallbackData: T,
    operationName: string
  ): Promise<T> {
    if (!this.isApiAvailable) {
      console.log(`🔄 Using fallback data for ${operationName} (API not available)`);
      return fallbackData;
    }

    try {
      return await operation();
    } catch (error) {
      console.warn(`⚠️ Exa API call failed for ${operationName}, using fallback:`, error);
      // Mark API as temporarily unavailable
      this.isApiAvailable = false;
      // Re-enable after 5 minutes
      setTimeout(() => {
        this.isApiAvailable = true;
        console.log('🔄 Exa API re-enabled for retry');
      }, 5 * 60 * 1000);
      return fallbackData;
    }
  }

  private getCacheKey(type: string, params: Record<string, unknown>): string {
    return `${type}_${JSON.stringify(params)}`;
  }

  private getCachedData(cacheKey: string): unknown | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Using cached data for: ${cacheKey}`);
      return cached.data;
    }
    return null;
  }

  private setCachedData(cacheKey: string, data: unknown): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private generateId(text: string): string {
    // Create a more unique ID by combining timestamp and hash
    const timestamp = Date.now().toString(36);
    const hash = btoa(text).replace(/[^a-zA-Z0-9]/g, '');
    return `${hash.substring(0, 12)}_${timestamp}`;
  }

  // 🔍 LOCAL NEWS - Replace NewsAPI, Bing News, Google News
  async getLocalNews(location: string, category?: string): Promise<LocalNews[]> {
    const cacheKey = this.getCacheKey('local_news', { location, category });
    const cached = this.getCachedData(cacheKey) as LocalNews[] | null;    
    if (cached) {
      console.log('📦 Using cached local news data');
      return cached;
    }

    return this.safeExaCall(
      async () => {
        const categoryFilter = category ? ` ${category}` : '';
        const searchQuery = `Local news and current events in ${location}${categoryFilter}:`;

        console.log('📰 Exa search for local news:', searchQuery);

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 12,
          text: true,
          highlights: {
            numSentences: 3,
            highlightsPerUrl: 1
          },
          includeDomains: ['patch.com', 'nextdoor.com', 'local.news', 'abc7.com', 'nbc.com', 'cbs.com'],
          startPublishedDate: this.getDateDaysAgo(7) // Last week
        });

        const localNews: LocalNews[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: result.title || 'Local News Update',
          description: result.highlights?.[0] || result.text?.substring(0, 200) + '...' || 'No description available',
          content: result.text || 'Content not available',
          url: result.url,
          imageUrl: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400`,
          publishedAt: result.publishedDate || new Date().toISOString(),
          source: {
            name: this.extractSourceName(result.url),
            url: result.url,
            type: 'local' as const
          },
          category: this.categorizeNews(result.title || '', result.text || ''),
          location,
          relevanceScore: result.score || 0.8
        }));

        this.setCachedData(cacheKey, localNews);
        console.log(`✅ Found ${localNews.length} local news articles via Exa`);
        return localNews;
      },
      this.getFallbackLocalNews(location),
      'local news'
    );
  }

  // 🚨 SCAM ALERTS - Replace ScamWatcher, government feeds
  async getScamAlerts(location?: string): Promise<ScamAlert[]> {
    const cacheKey = this.getCacheKey('scam_alerts', { location });
    const cached = this.getCachedData(cacheKey) as ScamAlert[] | null;    
    if (cached) {
      console.log('📦 Using cached scam alerts data');
      return cached;
    }

    return this.safeExaCall(
      async () => {
        const locationFilter = location ? ` affecting ${location}` : '';
        const searchQuery = `Recent scam alerts and fraud warnings${locationFilter}:`;

        console.log('🚨 Exa search for scam alerts:', searchQuery);

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 8,
          text: true,
          highlights: {
            numSentences: 2,
            highlightsPerUrl: 1
          },
          includeDomains: [
            'ftc.gov', 'fbi.gov', 'ic3.gov', 'scamwatch.gov.au', 
            'actionfraud.police.uk', 'consumer.ftc.gov', 'bbb.org'
          ],
          startPublishedDate: this.getDateDaysAgo(30) // Last month
        });

        const scamAlerts: ScamAlert[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: result.title || 'Scam Alert',
          description: result.highlights?.[0] || result.text?.substring(0, 200) + '...' || 'Scam warning',
          severity: this.determineScamSeverity(result.title || '', result.text || ''),
          location: location || this.extractLocation(result.title || '', result.text || ''),
          scamType: this.categorizeScam(result.title || '', result.text || ''),
          source: {
            name: this.extractSourceName(result.url),
            url: result.url,
            credibility: this.determineCredibility(result.url)
          },
          reportedDate: result.publishedDate || new Date().toISOString(),
          affectedAreas: location ? [location] : this.extractAffectedAreas(result.text || ''),
          warningLevel: this.determineWarningLevel(result.title || '', result.text || '')
        }));

        this.setCachedData(cacheKey, scamAlerts);
        console.log(`🛡️ Found ${scamAlerts.length} scam alerts via Exa`);
        return scamAlerts;
      },
      this.getFallbackScamAlerts(location),
      'scam alerts'
    );
  }

  // 🎉 LOCAL EVENTS - Replace Eventbrite, Meetup
  async getLocalEvents(location: string, category?: string): Promise<LocalEvent[]> {
    const cacheKey = this.getCacheKey('local_events', { location, category });
    const cached = this.getCachedData(cacheKey) as LocalEvent[] | null;    
    if (cached) {
      console.log('📦 Using cached local events data');
      return cached;
    }

    return this.safeExaCall(
      async () => {
        const categoryFilter = category ? ` ${category}` : '';
        const searchQuery = `Upcoming local events and activities in ${location}${categoryFilter}:`;

        console.log('🎉 Exa search for local events:', searchQuery);

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 10,
          text: true,
          highlights: {
            numSentences: 2,
            highlightsPerUrl: 1
          },
          includeDomains: [
            'eventbrite.com', 'meetup.com', 'facebook.com/events', 
            'patch.com', 'timeout.com', 'allevents.in'
          ],
          startPublishedDate: this.getDateDaysAgo(14) // Last 2 weeks
        });

        const localEvents: LocalEvent[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: result.title || 'Local Event',
          description: result.highlights?.[0] || result.text?.substring(0, 200) + '...' || 'Event details',
          startDate: this.extractEventDate(result.text || '') || new Date().toISOString(),
          location: {
            name: this.extractVenueName(result.text || '') || location,
            address: this.extractAddress(result.text || '') || location
          },
          category: this.categorizeEvent(result.title || '', result.text || ''),
          isFree: this.isEventFree(result.text || ''),
          eventUrl: result.url,
          source: {
            name: this.extractSourceName(result.url),
            url: result.url
          }
        }));

        this.setCachedData(cacheKey, localEvents);
        console.log(`🎊 Found ${localEvents.length} local events via Exa`);
        return localEvents;
      },
      this.getFallbackLocalEvents(location),
      'local events'
    );
  }

  // 🛡️ TRAVEL SAFETY - Replace Gov.travel, WHO, CDC
  async getTravelSafetyAlerts(location: string): Promise<TravelSafetyAlert[]> {
    const cacheKey = this.getCacheKey('travel_safety', { location });
    const cached = this.getCachedData(cacheKey) as TravelSafetyAlert[] | null;    
    if (cached) {
      console.log('📦 Using cached travel safety data');
      return cached;
    }

    return this.safeExaCall(
      async () => {
        const searchQuery = `Official travel safety alerts and advisories for ${location}:`;

        console.log('🛡️ Exa search for travel safety:', searchQuery);

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 6,
          text: true,
          highlights: {
            numSentences: 3,
            highlightsPerUrl: 1
          },
          includeDomains: [
            'state.gov', 'gov.uk', 'smartraveller.gov.au', 'travel.gc.ca',
            'who.int', 'cdc.gov', 'auswaertiges-amt.de', 'diplomatie.gouv.fr'
          ],
          startPublishedDate: this.getDateDaysAgo(60) // Last 2 months
        });

        const travelSafetyAlerts: TravelSafetyAlert[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: result.title || 'Travel Safety Alert',
          description: result.highlights?.[0] || result.text?.substring(0, 300) + '...' || 'Safety advisory',
          severity: this.determineTravelSafetySeverity(result.title || '', result.text || ''),
          alertType: this.categorizeTravelAlert(result.title || '', result.text || ''),
          location,
          source: {
            name: this.extractSourceName(result.url),
            url: result.url,
            authority: this.determineAuthority(result.url)
          },
          issuedDate: result.publishedDate || new Date().toISOString(),
          affectedRegions: this.extractAffectedRegions(result.text || '', location),
          recommendations: this.extractRecommendations(result.text || '')
        }));

        this.setCachedData(cacheKey, travelSafetyAlerts);
        console.log(`🛡️ Found ${travelSafetyAlerts.length} travel safety alerts via Exa`);
        return travelSafetyAlerts;
      },
      this.getFallbackTravelSafety(location),
      'travel safety alerts'
    );
  }

  // Helper methods for content analysis
  private extractSourceName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0].toUpperCase();
    } catch {
      return 'News Source';
    }
  }

  private categorizeNews(title: string, content: string): LocalNews['category'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('breaking') || text.includes('urgent')) return 'breaking';
    if (text.includes('crime') || text.includes('arrest') || text.includes('police')) return 'crime';
    if (text.includes('weather') || text.includes('storm') || text.includes('temperature')) return 'weather';
    if (text.includes('traffic') || text.includes('road') || text.includes('highway')) return 'traffic';
    if (text.includes('business') || text.includes('economy') || text.includes('market')) return 'business';
    if (text.includes('sport') || text.includes('game') || text.includes('team')) return 'sports';
    if (text.includes('politic') || text.includes('election') || text.includes('government')) return 'politics';
    
    return 'community';
  }

  private categorizeScam(title: string, content: string): ScamAlert['scamType'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('phishing') || text.includes('email') || text.includes('link')) return 'phishing';
    if (text.includes('romance') || text.includes('dating') || text.includes('relationship')) return 'romance';
    if (text.includes('investment') || text.includes('crypto') || text.includes('stock')) return 'investment';
    if (text.includes('travel') || text.includes('vacation') || text.includes('booking')) return 'travel';
    if (text.includes('theft') || text.includes('steal') || text.includes('rob')) return 'theft';
    
    return 'fraud';
  }

  private categorizeEvent(title: string, content: string): LocalEvent['category'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('concert') || text.includes('music') || text.includes('show')) return 'entertainment';
    if (text.includes('food') || text.includes('restaurant') || text.includes('dining')) return 'food';
    if (text.includes('art') || text.includes('museum') || text.includes('culture')) return 'cultural';
    if (text.includes('business') || text.includes('networking') || text.includes('conference')) return 'business';
    if (text.includes('sport') || text.includes('game') || text.includes('race')) return 'sports';
    if (text.includes('learn') || text.includes('workshop') || text.includes('class')) return 'education';
    if (text.includes('travel') || text.includes('tour') || text.includes('trip')) return 'travel';
    
    return 'community';
  }

  private determineScamSeverity(title: string, content: string): ScamAlert['severity'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('critical') || text.includes('urgent') || text.includes('immediate')) return 'critical';
    if (text.includes('warning') || text.includes('alert') || text.includes('danger')) return 'high';
    if (text.includes('caution') || text.includes('beware') || text.includes('notice')) return 'medium';
    
    return 'low';
  }

  private determineTravelSafetySeverity(title: string, content: string): TravelSafetyAlert['severity'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('do not travel') || text.includes('emergency') || text.includes('evacuate')) return 'critical';
    if (text.includes('reconsider travel') || text.includes('high risk') || text.includes('avoid')) return 'high';
    if (text.includes('exercise caution') || text.includes('increased caution')) return 'medium';
    
    return 'low';
  }

  private categorizeTravelAlert(title: string, content: string): TravelSafetyAlert['alertType'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('health') || text.includes('disease') || text.includes('medical')) return 'health';
    if (text.includes('weather') || text.includes('storm') || text.includes('hurricane')) return 'weather';
    if (text.includes('political') || text.includes('unrest') || text.includes('protest')) return 'political';
    if (text.includes('transport') || text.includes('flight') || text.includes('airport')) return 'transport';
    if (text.includes('earthquake') || text.includes('tsunami') || text.includes('volcano')) return 'natural-disaster';
    
    return 'security';
  }

  private determineCredibility(url: string): ScamAlert['source']['credibility'] {
    const domain = url.toLowerCase();
    
    if (domain.includes('.gov') || domain.includes('fbi.') || domain.includes('ftc.')) return 'government';
    if (domain.includes('bbb.org') || domain.includes('verified')) return 'verified';
    
    return 'community';
  }

  private determineAuthority(url: string): TravelSafetyAlert['source']['authority'] {
    const domain = url.toLowerCase();
    
    if (domain.includes('.gov') || domain.includes('state.gov')) return 'government';
    if (domain.includes('who.int') || domain.includes('cdc.gov')) return 'international';
    if (domain.includes('verified') || domain.includes('official')) return 'verified';
    
    return 'local';
  }

  private determineWarningLevel(title: string, content: string): ScamAlert['warningLevel'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('immediate') || text.includes('urgent') || text.includes('now')) return 'immediate';
    if (text.includes('caution') || text.includes('careful') || text.includes('aware')) return 'caution';
    
    return 'advisory';
  }

  // Content extraction helpers
  private extractLocation(title: string, content: string): string | undefined {
    const text = title + ' ' + content;
    const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z][a-z]+)\b/g;
    const match = locationRegex.exec(text);
    return match ? match[0] : undefined;
  }

  private extractAffectedAreas(content: string): string[] {
    const areas: string[] = [];
    const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z][a-z]+)\b/g;
    let match;
    
    while ((match = locationRegex.exec(content)) !== null && areas.length < 5) {
      areas.push(match[0]);
    }
    
    return areas;
  }

  private extractAffectedRegions(content: string, location: string): string[] {
    const regions = this.extractAffectedAreas(content);
    return regions.length > 0 ? regions : [location];
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const text = content.toLowerCase();
    
    const patterns = [
      /avoid\s+([^.]+)/g,
      /do not\s+([^.]+)/g,
      /exercise\s+([^.]+)/g,
      /consider\s+([^.]+)/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null && recommendations.length < 5) {
        recommendations.push(match[1].trim());
      }
    });
    
    return recommendations.length > 0 ? recommendations : ['Stay informed and follow local guidance'];
  }

  private extractEventDate(content: string): string | undefined {
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/;
    const match = content.match(dateRegex);
    return match ? new Date(match[0]).toISOString() : undefined;
  }

  private extractVenueName(content: string): string | undefined {
    const venueRegex = /at\s+([A-Z][^,.\n]+)/i;
    const match = content.match(venueRegex);
    return match ? match[1].trim() : undefined;
  }

  private extractAddress(content: string): string | undefined {
    const addressRegex = /\d+\s+[A-Z][^,\n]+,\s*[A-Z][^,\n]+/i;
    const match = content.match(addressRegex);
    return match ? match[0] : undefined;
  }

  private isEventFree(content: string): boolean {
    const text = content.toLowerCase();
    return text.includes('free') || text.includes('no cost') || text.includes('complimentary');
  }

  // Fallback methods
  private getFallbackLocalNews(location: string): LocalNews[] {
    return [{
      id: 'fallback_news_1',
      title: `${location} Travel Updates`,
      description: `Stay informed about local developments and travel news in ${location}.`,
      content: `Guard Nomad provides local news and updates for travelers in ${location}.`,
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
      publishedAt: new Date().toISOString(),
      source: { name: 'Guard Nomad News', url: '#', type: 'local' },
      category: 'community',
      location,
      relevanceScore: 0.7
    }];
  }

  private getFallbackScamAlerts(location?: string): ScamAlert[] {
    return [{
      id: 'fallback_scam_1',
      title: `${location ? `${location} Scam Alert` : 'General Fraud Awareness'}`,
      description: `Stay vigilant against common scams and fraudulent activities ${location ? `in ${location}` : 'while traveling'}.`,
      severity: 'medium',
      location: location || 'Global',
      scamType: 'fraud',
      source: { name: 'Guard Nomad Security', url: '#', credibility: 'verified' },
      reportedDate: new Date().toISOString(),
      affectedAreas: [location || 'Global'],
      warningLevel: 'advisory'
    }];
  }

  private getFallbackLocalEvents(location: string): LocalEvent[] {
    return [{
      id: 'fallback_event_1',
      title: `${location} Traveler Meetup`,
      description: `Connect with other travelers and explore ${location} together.`,
      startDate: new Date().toISOString(),
      location: { name: location, address: location },
      category: 'travel',
      isFree: true,
      eventUrl: '#',
      source: { name: 'Guard Nomad Events', url: '#' }
    }];
  }

  private getFallbackTravelSafety(location: string): TravelSafetyAlert[] {
    return [{
      id: 'fallback_safety_1',
      title: `${location} Travel Advisory`,
      description: `General travel safety information and recommendations for ${location}.`,
      severity: 'low',
      alertType: 'security',
      location,
      source: { name: 'Guard Nomad Safety', url: '#', authority: 'verified' },
      issuedDate: new Date().toISOString(),
      affectedRegions: [location],
      recommendations: ['Stay informed', 'Follow local guidance', 'Keep emergency contacts handy']
    }];
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Guard Nomad Exa service cache cleared');
  }
}

// Export singleton instance
export const exaUnifiedService = new ExaUnifiedService();