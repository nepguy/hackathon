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

// NEW: Enhanced AI-powered safety interfaces (replacing Gemini)
export interface LocationAlert {
  id: string;
  type: 'scam' | 'crime' | 'weather' | 'political' | 'health' | 'transport';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  affectedAreas: string[];
  validUntil?: string;
  source: string;
}

export interface LocationSafetyData {
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  safetyScore: number; // 0-100 (100 being safest)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: LocationAlert[];
  commonScams: string[];
  emergencyNumbers: string[];
  lastUpdated: string;
}

export interface TravelSafetyAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  actionableAdvice: string[];
  precautions: string[];
  emergencyContacts?: string[];
}

export interface LocationContext {
  country: string;
  city?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
}

class ExaUnifiedService {
  private exa!: Exa;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache
  private readonly SAFETY_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for safety data
  private API_KEY: string;
  private isApiAvailable = true;

  constructor() {
    this.API_KEY = import.meta.env.VITE_EXA_API_KEY;
    if (!this.API_KEY || this.API_KEY === 'your_exa_api_key') {
      console.warn('⚠️ Exa API key not found in environment variables or is invalid');
      console.log('🔄 Exa service will use fallback data - add VITE_EXA_API_KEY to your .env file');
      this.isApiAvailable = false;
      return;
    }
    
    try {
      this.exa = new Exa(this.API_KEY);
      console.log('✅ Exa Unified Service initialized with AI safety capabilities');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Exa client:', error);
      this.isApiAvailable = false;
    }
  }

  private async safeExaCall<T>(
    operation: () => Promise<T>,
    fallbackData: T,
    operationName: string = 'operation'
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

  private getCachedData(cacheKey: string, customDuration?: number): unknown | null {
    const cached = this.cache.get(cacheKey);
    const duration = customDuration || this.CACHE_DURATION;
    if (cached && Date.now() - cached.timestamp < duration) {
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

  private generateLocationKey(lat: number, lng: number): string {
    const roundedLat = Math.round(lat * 100) / 100; // ~1km precision
    const roundedLng = Math.round(lng * 100) / 100;
    return `${roundedLat},${roundedLng}`;
  }

  // 🛡️ NEW: AI-POWERED SAFETY ANALYSIS (Replacing Gemini)
  async getLocationSafetyData(location: LocationContext): Promise<LocationSafetyData> {
    const cacheKey = this.getCacheKey('safety_data', { 
      country: location?.country || 'Unknown', 
      city: location?.city || '', 
      coordinates: location?.coordinates || null
    });
    const cached = this.getCachedData(cacheKey, this.SAFETY_CACHE_DURATION) as LocationSafetyData | null;
    if (cached) {
      console.log('🛡️ Using cached safety data');
      return cached;
    }

    return this.safeExaCall(
      async () => {
        const locationString = location.city 
          ? `${location.city}, ${location.country}` 
          : location.country;

        console.log('🛡️ Exa AI safety analysis for:', locationString);

        // Multi-query approach for comprehensive safety intelligence
        const safetyQueries = [
          `Current safety alerts crime reports ${locationString}`,
          `Travel warnings security advisories ${locationString}`,
          `Tourist scams fraud alerts ${locationString}`,
          `Emergency services police contact ${locationString}`
        ];

        const safetyResults = await Promise.all(
          safetyQueries.map(query => 
            this.exa.searchAndContents(query, {
              type: 'neural',
              useAutoprompt: true,
              numResults: 8,
              text: true,
              highlights: {
                numSentences: 4,
                highlightsPerUrl: 2
              },
              includeDomains: ['state.gov', 'fco.gov.uk', 'travel.gc.ca', 'smartraveller.gov.au', 'police.uk', 'local.gov'],
              startPublishedDate: this.getDateDaysAgo(30)
            })
          )
        );

        // Process and analyze safety data
        const allResults = safetyResults.flatMap(response => response.results || []);
        
        const activeAlerts = this.extractLocationAlerts(allResults, locationString);
        const commonScams = this.extractCommonScams(allResults, locationString);
        const emergencyNumbers = this.extractEmergencyNumbers(allResults, location.country);
        const safetyScore = this.calculateSafetyScore(activeAlerts, allResults);
        const riskLevel = this.determineRiskLevel(safetyScore, activeAlerts);

        const safetyData: LocationSafetyData = {
          location: locationString,
          country: location.country,
          coordinates: location.coordinates || { lat: 0, lng: 0 },
          safetyScore,
          riskLevel,
          activeAlerts,
          commonScams,
          emergencyNumbers,
          lastUpdated: new Date().toISOString()
        };

        this.setCachedData(cacheKey, safetyData);
        console.log(`🛡️ Generated safety analysis: ${safetyScore}% safety score, ${activeAlerts.length} alerts`);
        
        return safetyData;
      },
      this.getDefaultSafetyData(location),
      'AI Safety Analysis'
    );
  }

  // 🚨 NEW: Location-specific alerts (Replacing Gemini)
  async getLocationSpecificAlerts(
    userLocation: { lat: number; lng: number },
    country: string,
    city?: string
  ): Promise<LocationAlert[]> {
    const locationContext: LocationContext = {
      country,
      city,
      coordinates: userLocation
    };

    const safetyData = await this.getLocationSafetyData(locationContext);
    return safetyData.activeAlerts;
  }

  // 📊 NEW: Location safety score (Replacing Gemini)
  async getLocationSafetyScore(
    userLocation: { lat: number; lng: number },
    country: string,
    city?: string
  ): Promise<{ score: number; riskLevel: string; summary: string }> {
    const locationContext: LocationContext = {
      country,
      city,
      coordinates: userLocation
    };

    const safetyData = await this.getLocationSafetyData(locationContext);
    
    return {
      score: safetyData.safetyScore,
      riskLevel: safetyData.riskLevel,
      summary: `${safetyData.location} has a ${safetyData.safetyScore}% safety score with ${safetyData.activeAlerts.length} active alerts.`
    };
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
        
        // Enhanced location-specific search query
        const searchQuery = `${location} local news current events today ${categoryFilter}`;
        
        // Get location-specific domains and filters
        const { includeDomains, excludeDomains } = this.getLocationSpecificDomains(location);
        
        console.log('📰 Exa search for local news:', searchQuery);
        console.log('🌍 Using domains for', location, ':', includeDomains.slice(0, 5));

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 15,
          text: true,
          highlights: {
            numSentences: 3,
            highlightsPerUrl: 1
          },
          includeDomains: includeDomains,
          excludeDomains: excludeDomains,
          startPublishedDate: this.getDateDaysAgo(7) // Last week
        });

        const localNews: LocalNews[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: this.sanitizeText(result.title) || 'Local News Update',
          description: this.sanitizeDescription(result.highlights?.[0] || result.text || ''),
          content: this.sanitizeText(result.text) || 'Content not available',
          url: result.url,
          imageUrl: this.getReliableImageUrl('news'),
          publishedAt: result.publishedDate || new Date().toISOString(),
          source: {
            name: this.extractSourceName(result.url),
            url: result.url,
            type: this.determineSourceType(result.url)
          },
          category: this.categorizeNews(result.title, result.text || ''),
          location: location
        }));

        this.setCachedData(cacheKey, localNews);
        console.log(`📰 Found ${localNews.length} local news articles for ${location}`);
        return localNews;
      },
      this.getFallbackLocalNews(location),
      'Local News'
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
        const searchQuery = location 
          ? `${location} scam alerts fraud warnings security threats`
          : 'Recent scam alerts and fraud warnings';

        // Get location-specific security/government domains
        const securityDomains = this.getSecurityDomains(location);

        console.log('🚨 Exa search for scam alerts:', searchQuery);
        console.log('🛡️ Using security domains for', location || 'global', ':', securityDomains.slice(0, 3));

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 10,
          text: true,
          highlights: {
            numSentences: 2,
            highlightsPerUrl: 1
          },
          includeDomains: securityDomains,
          startPublishedDate: this.getDateDaysAgo(30) // Last month
        });

        const scamAlerts: ScamAlert[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: this.sanitizeText(result.title) || 'Scam Alert',
          description: this.sanitizeDescription(result.highlights?.[0] || result.text || ''),
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
        const searchQuery = `${location} upcoming events activities ${categoryFilter} 2024 2025`;

        // Get location-specific event domains
        const eventDomains = this.getEventDomains(location);

        console.log('🎉 Exa search for local events:', searchQuery);
        console.log('🎪 Using event domains for', location, ':', eventDomains.slice(0, 3));

        const response = await this.exa.searchAndContents(searchQuery, {
          type: 'neural',
          useAutoprompt: true,
          numResults: 12,
          text: true,
          highlights: {
            numSentences: 2,
            highlightsPerUrl: 1
          },
          includeDomains: eventDomains,
          startPublishedDate: this.getDateDaysAgo(14) // Last 2 weeks
        });

        const localEvents: LocalEvent[] = (response.results || []).map((result: any) => ({
          id: this.generateId(result.url),
          title: this.sanitizeText(result.title) || 'Local Event',
          description: this.sanitizeDescription(result.highlights?.[0] || result.text || ''),
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
          title: this.sanitizeText(result.title) || 'Travel Safety Alert',
          description: this.sanitizeDescription(result.highlights?.[0] || result.text || ''),
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

  // NEW: AI Safety Analysis Helper Methods
  private extractLocationAlerts(results: any[], locationString: string): LocationAlert[] {
    const alerts: LocationAlert[] = [];
    
    (results || []).forEach((result, index) => {
      if (result.title && result.text) {
        const alertType = this.determineAlertType(result.title, result.text);
        const severity = this.determineAlertSeverity(result.title, result.text);
        
        alerts.push({
          id: `exa_alert_${Date.now()}_${index}`,
          type: alertType,
          severity,
          title: result.title,
          description: result.highlights?.[0] || result.text.substring(0, 200) + '...',
          actionRequired: this.extractActionRequired(result.text),
          affectedAreas: this.extractAffectedAreas(result.text),
          source: this.extractSourceName(result.url),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        });
      }
    });
    
    return alerts.slice(0, 5); // Limit to 5 most relevant alerts
  }

  private extractCommonScams(results: any[], locationString: string): string[] {
    const scams: string[] = [];
    
    (results || []).forEach(result => {
      if (result.text) {
        const text = result.text.toLowerCase();
        if (text.includes('scam') || text.includes('fraud') || text.includes('theft')) {
          const scamDescription = this.extractScamDescription(result.text);
          if (scamDescription) {
            scams.push(scamDescription);
          }
        }
      }
    });
    
    return scams.slice(0, 3); // Top 3 scams
  }

  private extractEmergencyNumbers(results: any[], country: string): string[] {
    const numbers: string[] = [];
    
    // Default emergency numbers by country
    const defaultNumbers: Record<string, string[]> = {
      'Germany': ['Police: 110', 'Fire/Medical: 112', 'Tourist Hotline: +49-30-25002333'],
      'United States': ['Emergency: 911', 'Tourist Assistance: 1-800-555-0199'],
      'United Kingdom': ['Emergency: 999', 'Non-emergency Police: 101'],
      'France': ['Emergency: 112', 'Police: 17', 'Fire: 18'],
      'default': ['Emergency: 112', 'Police: Local emergency services', 'Medical: Local ambulance services']
    };
    
    // Extract from search results
    (results || []).forEach(result => {
      if (result.text) {
        const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
        const matches = result.text.match(phoneRegex);
        if (matches) {
          matches.slice(0, 2).forEach((match: string) => numbers.push(`Emergency: ${match}`));
        }
      }
    });
    
    // Use defaults if no numbers found
    if (numbers.length === 0) {
      numbers.push(...(defaultNumbers[country] || defaultNumbers['default']));
    }
    
    return numbers.slice(0, 3);
  }

  private calculateSafetyScore(alerts: LocationAlert[], allResults: any[]): number {
    let baseScore = 85; // Start with a good base score
    
    // Reduce score based on alert severity
    (alerts || []).forEach(alert => {
      switch (alert.severity) {
        case 'critical': baseScore -= 20; break;
        case 'high': baseScore -= 10; break;
        case 'medium': baseScore -= 5; break;
        case 'low': baseScore -= 2; break;
      }
    });
    
    // Factor in number of safety-related results
    const safetyResultsCount = allResults.filter(r => 
      r?.text && (r.text.toLowerCase().includes('crime') || 
                  r.text.toLowerCase().includes('danger') ||
                  r.text.toLowerCase().includes('warning'))
    ).length;
    
    if (safetyResultsCount > 10) baseScore -= 10;
    else if (safetyResultsCount > 5) baseScore -= 5;
    
    return Math.max(20, Math.min(100, baseScore)); // Keep between 20-100
  }

  private determineRiskLevel(safetyScore: number, alerts: LocationAlert[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalAlerts = (alerts || []).filter(a => a.severity === 'critical').length;
    const highAlerts = (alerts || []).filter(a => a.severity === 'high').length;
    
    if (criticalAlerts > 0 || safetyScore < 40) return 'critical';
    if (highAlerts > 1 || safetyScore < 60) return 'high';
    if (safetyScore < 80) return 'medium';
    return 'low';
  }

  private determineAlertType(title: string, content: string): LocationAlert['type'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('scam') || text.includes('fraud')) return 'scam';
    if (text.includes('crime') || text.includes('robbery') || text.includes('theft')) return 'crime';
    if (text.includes('weather') || text.includes('storm') || text.includes('flood')) return 'weather';
    if (text.includes('political') || text.includes('protest') || text.includes('unrest')) return 'political';
    if (text.includes('health') || text.includes('disease') || text.includes('medical')) return 'health';
    if (text.includes('transport') || text.includes('traffic') || text.includes('airport')) return 'transport';
    
    return 'crime'; // Default to crime for safety
  }

  private determineAlertSeverity(title: string, content: string): LocationAlert['severity'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('critical') || text.includes('urgent') || text.includes('immediate')) return 'critical';
    if (text.includes('high') || text.includes('warning') || text.includes('danger')) return 'high';
    if (text.includes('medium') || text.includes('caution') || text.includes('alert')) return 'medium';
    
    return 'low';
  }

  private extractActionRequired(content: string): string {
    const text = content.toLowerCase();
    
    if (text.includes('avoid')) return 'Avoid the affected area';
    if (text.includes('exercise caution')) return 'Exercise increased caution';
    if (text.includes('stay informed')) return 'Stay informed and monitor updates';
    if (text.includes('contact')) return 'Contact local authorities if needed';
    
    return 'Stay alert and follow local guidance';
  }

  private extractScamDescription(content: string): string | null {
    const sentences = content.split('.').filter(s => s.length > 20);
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (lower.includes('scam') || lower.includes('fraud') || lower.includes('theft')) {
        return sentence.trim().substring(0, 100) + '...';
      }
    }
    
    return null;
  }

  private getDefaultSafetyData(location: LocationContext): LocationSafetyData {
    const locationString = location.city ? `${location.city}, ${location.country}` : location.country;
    
    return {
      location: locationString,
      country: location.country,
      coordinates: location.coordinates || { lat: 0, lng: 0 },
      safetyScore: 75,
      riskLevel: 'medium',
      activeAlerts: [{
        id: 'default_alert_1',
        type: 'crime',
        severity: 'low',
        title: `General Safety Awareness for ${locationString}`,
        description: 'Stay aware of your surroundings and follow standard travel safety practices.',
        actionRequired: 'Exercise normal precautions',
        affectedAreas: [locationString],
        source: 'Guard Nomad Safety',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }],
      commonScams: [
        'Pickpocketing in crowded tourist areas',
        'Overcharging by taxi drivers',
        'Fake police or authority figures'
      ],
      emergencyNumbers: [
        'Emergency: 112',
        'Police: Local emergency services',
        'Tourist Assistance: Contact local tourism office'
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  private determineSourceType(url: string): 'local' | 'regional' | 'national' {
    const domain = url.toLowerCase();
    
    if (domain.includes('local') || domain.includes('patch.com') || domain.includes('nextdoor')) return 'local';
    if (domain.includes('regional') || domain.includes('state')) return 'regional';
    
    return 'national';
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
      location
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

  // 🧹 TEXT SANITIZATION METHODS
  private sanitizeText(text?: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Remove base64 data URLs
    cleaned = cleaned.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '');
    
    // Remove excessive whitespace and newlines
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove weird characters and encoding artifacts
    cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    return cleaned;
  }

  private sanitizeDescription(text: string): string {
    if (!text) return 'No description available';
    
    // First sanitize the text
    let cleaned = this.sanitizeText(text);
    
    // If it's still too long or empty after cleaning, create a proper description
    if (cleaned.length < 10) {
      return 'Local news and safety information';
    }
    
    // Truncate to reasonable length with proper word boundaries
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150);
      const lastSpace = cleaned.lastIndexOf(' ');
      if (lastSpace > 100) {
        cleaned = cleaned.substring(0, lastSpace);
      }
      cleaned += '...';
    }
    
    return cleaned;
  }

  private getReliableImageUrl(type: 'news' | 'safety' | 'event' | 'scam'): string {
    const imageMap = {
      news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop&auto=format',
      safety: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&auto=format',
      event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&auto=format',
      scam: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format'
    };
    
    return imageMap[type] || imageMap.news;
  }

  /**
   * Get location-specific event platforms for better regional event results
   */
  private getEventDomains(location: string): string[] {
    const locationLower = location.toLowerCase();
    
    // German event platforms
    if (locationLower.includes('germany') || locationLower.includes('magdeburg')) {
      return [
        'eventbrite.de', 'xing.com', 'meetup.com', 'facebook.com/events',
        'veranstaltungen.meinestadt.de', 'events.at', 'berlin.de/events',
        'muenchen.de', 'hamburg.de/events', 'magdeburg.de', 'sachsen-anhalt.de',
        'timeout.com', 'allevents.in', 'unternehmen-heute.de'
      ];
    }
    
    // UK event platforms
    if (locationLower.includes('uk') || locationLower.includes('england')) {
      return [
        'eventbrite.co.uk', 'meetup.com', 'facebook.com/events', 
        'timeout.com/london', 'visitlondon.com', 'whatson.co.uk',
        'ticketmaster.co.uk', 'seetickets.com', 'designmynight.com'
      ];
    }
    
    // European event platforms
    if (locationLower.includes('europe') || locationLower.includes('eu')) {
      return [
        'eventbrite.com', 'meetup.com', 'facebook.com/events',
        'timeout.com', 'allevents.in', 'events.at', 'ticketmaster.com',
        'viagogo.com', 'stubhub.com', 'songkick.com'
      ];
    }
    
    // US event platforms
    if (locationLower.includes('us') || locationLower.includes('america')) {
      return [
        'eventbrite.com', 'meetup.com', 'facebook.com/events',
        'patch.com', 'timeout.com', 'allevents.in', 'ticketmaster.com',
        'stubhub.com', 'bandsintown.com', 'songkick.com'
      ];
    }
    
    // Default international
    return [
      'eventbrite.com', 'meetup.com', 'facebook.com/events',
      'timeout.com', 'allevents.in', 'ticketmaster.com', 'songkick.com'
    ];
  }

  /**
   * Get location-specific security/government domains for scam alerts
   */
  private getSecurityDomains(location?: string): string[] {
    if (!location) {
      return [
        'interpol.int', 'europol.europa.eu', 'consumer.ftc.gov', 'ic3.gov',
        'scamwatch.gov.au', 'actionfraud.police.uk', 'bbb.org'
      ];
    }

    const locationLower = location.toLowerCase();
    
    // German security domains
    if (locationLower.includes('germany') || locationLower.includes('magdeburg')) {
      return [
        'bka.de', 'bsi.bund.de', 'polizei.de', 'verbraucherzentrale.de',
        'bundesnetzagentur.de', 'europol.europa.eu', 'bbb.org',
        'scamadviser.com', 'trustpilot.com'
      ];
    }
    
    // UK security domains
    if (locationLower.includes('uk') || locationLower.includes('england')) {
      return [
        'actionfraud.police.uk', 'ncsc.gov.uk', 'citizensadvice.org.uk',
        'which.co.uk', 'ico.org.uk', 'fca.org.uk', 'europol.europa.eu'
      ];
    }
    
    // European security domains
    if (locationLower.includes('europe') || locationLower.includes('eu')) {
      return [
        'europol.europa.eu', 'europarl.europa.eu', 'ecdl.org',
        'bsi.bund.de', 'ncsc.gov.uk', 'actionfraud.police.uk'
      ];
    }
    
    // US security domains
    if (locationLower.includes('us') || locationLower.includes('america')) {
      return [
        'ftc.gov', 'fbi.gov', 'ic3.gov', 'consumer.ftc.gov', 
        'bbb.org', 'fraud.org', 'aarp.org'
      ];
    }
    
    // Default international
    return [
      'interpol.int', 'europol.europa.eu', 'consumer.ftc.gov', 
      'scamwatch.gov.au', 'actionfraud.police.uk', 'bbb.org'
    ];
  }

  /**
   * Get location-specific domains for better regional news results
   */
  private getLocationSpecificDomains(location: string): { includeDomains: string[]; excludeDomains: string[] } {
    const locationLower = location.toLowerCase();
    
    // European/German domains
    if (locationLower.includes('germany') || locationLower.includes('deutschland') || 
        locationLower.includes('berlin') || locationLower.includes('munich') || 
        locationLower.includes('hamburg') || locationLower.includes('magdeburg')) {
      return {
        includeDomains: [
          'spiegel.de', 'bild.de', 'zeit.de', 'sueddeutsche.de', 'faz.net',
          'welt.de', 'focus.de', 'stern.de', 'tagesschau.de', 'zdf.de',
          'dw.com', 'deutsche-welle.de', 'mdr.de', 'ndr.de', 'br.de',
          'lokalkompass.de', 'news.de', 'gmx.net', 'web.de',
          // English sources covering Germany
          'thelocal.de', 'reuters.com', 'bbc.com', 'euronews.com'
        ],
        excludeDomains: [
          'patch.com', 'abc7.com', 'nbc.com', 'cbs.com', 'fox.com',
          'cnn.com', 'usatoday.com', 'washingtonpost.com', 'nytimes.com'
        ]
      };
    }
    
    // UK domains
    if (locationLower.includes('uk') || locationLower.includes('england') || 
        locationLower.includes('london') || locationLower.includes('britain')) {
      return {
        includeDomains: [
          'bbc.co.uk', 'guardian.co.uk', 'telegraph.co.uk', 'independent.co.uk',
          'dailymail.co.uk', 'mirror.co.uk', 'express.co.uk', 'metro.co.uk',
          'standard.co.uk', 'manchestereveningnews.co.uk', 'birminghammail.co.uk'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // France domains
    if (locationLower.includes('france') || locationLower.includes('paris') || locationLower.includes('lyon')) {
      return {
        includeDomains: [
          'lemonde.fr', 'figaro.fr', 'liberation.fr', 'franceinfo.fr',
          'bfmtv.com', 'leparisien.fr', 'ouest-france.fr', 'france24.com'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // Spain domains
    if (locationLower.includes('spain') || locationLower.includes('madrid') || locationLower.includes('barcelona')) {
      return {
        includeDomains: [
          'elpais.com', 'elmundo.es', 'abc.es', 'lavanguardia.com',
          'elperiodico.com', 'publico.es', 'rtve.es'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // Italy domains
    if (locationLower.includes('italy') || locationLower.includes('rome') || locationLower.includes('milan')) {
      return {
        includeDomains: [
          'corriere.it', 'repubblica.it', 'lastampa.it', 'gazzetta.it',
          'ansa.it', 'ilgiornale.it', 'ilmessaggero.it'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // Netherlands domains
    if (locationLower.includes('netherlands') || locationLower.includes('amsterdam') || locationLower.includes('holland')) {
      return {
        includeDomains: [
          'nu.nl', 'nos.nl', 'telegraaf.nl', 'volkskrant.nl', 'nrc.nl',
          'rtl.nl', 'ad.nl', 'dutchnews.nl'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // General European domains
    if (locationLower.includes('europe') || locationLower.includes('eu')) {
      return {
        includeDomains: [
          'euronews.com', 'politico.eu', 'reuters.com', 'bbc.com',
          'dw.com', 'france24.com', 'rt.com', 'euractiv.com'
        ],
        excludeDomains: ['patch.com', 'abc7.com', 'nbc.com', 'cbs.com']
      };
    }
    
    // US domains (fallback)
    if (locationLower.includes('us') || locationLower.includes('america') || locationLower.includes('usa')) {
      return {
        includeDomains: [
          'patch.com', 'nextdoor.com', 'local.news', 'abc7.com', 'nbc.com', 'cbs.com',
          'npr.org', 'pbs.org', 'usatoday.com', 'apnews.com'
        ],
        excludeDomains: []
      };
    }
    
    // Global/International domains (default)
    return {
      includeDomains: [
        'reuters.com', 'bbc.com', 'apnews.com', 'euronews.com', 
        'dw.com', 'france24.com', 'aljazeera.com', 'cnn.com'
      ],
      excludeDomains: ['patch.com', 'abc7.com', 'nextdoor.com'] // Exclude US-specific
    };
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