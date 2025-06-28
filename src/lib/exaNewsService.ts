// src/lib/exaNewsService.ts - Exa.ai Enhanced Travel News Service
import Exa from 'exa-js';
import type { NewsArticle, NewsApiResponse } from './newsApi';

interface ExaResult {
  id: string;
  url: string;
  title: string | null;
  text: string | null;
  highlights?: string[];
  publishedDate?: string | null;
  author?: string | null;
  score?: number;
}

class ExaNewsService {
  private exa: Exa;
  private cache = new Map<string, { data: NewsApiResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private readonly API_KEY: string;

  constructor() {
    this.API_KEY = import.meta.env.VITE_EXA_API_KEY;
    if (!this.API_KEY) {
      console.warn('⚠️ Exa API key not found in environment variables');
      throw new Error('Exa API key is required');
    }
    
    this.exa = new Exa(this.API_KEY);
    console.log('✅ Exa News Service initialized');
  }

  private getCacheKey(params: Record<string, any>): string {
    return JSON.stringify(params);
  }

  private getCachedData(cacheKey: string): NewsApiResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached Exa news data');
      return cached.data;
    }
    return null;
  }

  private setCachedData(cacheKey: string, data: NewsApiResponse): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.cache.size > 20) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private transformExaResults(results: ExaResult[], category: NewsArticle['category'] = 'general'): NewsArticle[] {
    return results.map((result) => {
      const title = result.title || 'Travel Alert';
      const text = result.text || '';
      const description = result.highlights?.[0] || (text ? text.substring(0, 200) + '...' : 'No description available');
      
      return {
        title,
        description,
        content: text || 'Content not available',
        url: result.url,
        image: this.getDefaultImage(category),
        publishedAt: result.publishedDate || new Date().toISOString(),
        source: {
          name: this.extractSourceName(result.url),
          url: result.url
        },
        category,
        severity: this.determineSeverity(title, text),
        location: this.extractLocation(title, text)
      };
    });
  }

  private getDefaultImage(category: NewsArticle['category']): string {
    const images = {
      travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
      safety: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      weather: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400',
      general: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'
    };
    return images[category] || images.general;
  }

  private extractSourceName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0].toUpperCase();
    } catch {
      return 'News Source';
    }
  }

  private determineSeverity(title: string, content: string): NewsArticle['severity'] {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('emergency') || text.includes('critical') || text.includes('danger') || 
        text.includes('urgent') || text.includes('terror') || text.includes('attack')) {
      return 'high';
    }
    
    if (text.includes('warning') || text.includes('alert') || text.includes('caution') || 
        text.includes('risk') || text.includes('incident')) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractLocation(title: string, content: string): string | undefined {
    const text = title + ' ' + content;
    // Simple location extraction - could be enhanced with NLP
    const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z][a-z]+)\b/g;
    const match = locationRegex.exec(text);
    return match ? match[0] : undefined;
  }

  /**
   * Get travel-specific news and alerts for a location
   */
  async getTravelNews(location?: string): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey({ type: 'travel', location });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = location 
        ? `Current travel alerts and safety incidents affecting travelers in ${location}:`
        : 'Recent travel safety alerts and incidents affecting international travelers:';

      console.log('🔍 Exa search for travel news:', searchQuery);

             const response = await this.exa.searchAndContents(searchQuery, {
         type: 'neural',
         useAutoprompt: true,
         numResults: 8,
         text: true,
         highlights: {
           numSentences: 2,
           highlightsPerUrl: 1
         },
         startPublishedDate: this.getDateDaysAgo(30) // Last 30 days
       });

             const articles = this.transformExaResults(response.results as ExaResult[], 'travel');
      
      const result: NewsApiResponse = {
        totalArticles: articles.length,
        articles
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Found ${articles.length} travel news articles via Exa`);
      
      return result;
    } catch (error) {
      console.error('❌ Exa travel news search failed:', error);
      return this.getFallbackNews('travel', location);
    }
  }

  /**
   * Get safety alerts and warnings for a specific location
   */
  async getSafetyAlerts(location?: string): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey({ type: 'safety', location });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = location 
        ? `Safety warnings and security alerts for travelers visiting ${location}:`
        : 'Current safety warnings and security alerts for international travelers:';

      console.log('🚨 Exa search for safety alerts:', searchQuery);

             const response = await this.exa.searchAndContents(searchQuery, {
         type: 'neural',
         useAutoprompt: true,
         numResults: 6,
         text: true,
         highlights: {
           numSentences: 3,
           highlightsPerUrl: 1
         },
         includeDomains: ['state.gov', 'gov.uk', 'smartraveller.gov.au', 'travel.gc.ca', 'auswaertiges-amt.de'],
         startPublishedDate: this.getDateDaysAgo(14) // Last 2 weeks
       });

             const articles = this.transformExaResults(response.results as ExaResult[], 'safety');
      
      const result: NewsApiResponse = {
        totalArticles: articles.length,
        articles
      };

      this.setCachedData(cacheKey, result);
      console.log(`🛡️ Found ${articles.length} safety alerts via Exa`);
      
      return result;
    } catch (error) {
      console.error('❌ Exa safety alerts search failed:', error);
      return this.getFallbackNews('safety', location);
    }
  }

  /**
   * Get weather-related travel alerts
   */
  async getWeatherNews(location?: string): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey({ type: 'weather', location });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = location 
        ? `Weather alerts and travel disruptions affecting ${location}:`
        : 'Weather alerts and travel disruptions affecting international travel:';

      console.log('🌤️ Exa search for weather news:', searchQuery);

             const response = await this.exa.searchAndContents(searchQuery, {
         type: 'neural',
         useAutoprompt: true,
         numResults: 5,
         text: true,
         highlights: {
           numSentences: 2,
           highlightsPerUrl: 1
         },
         startPublishedDate: this.getDateDaysAgo(7) // Last week
       });

       const articles = this.transformExaResults(response.results as ExaResult[], 'weather');
      
      const result: NewsApiResponse = {
        totalArticles: articles.length,
        articles
      };

      this.setCachedData(cacheKey, result);
      console.log(`⛈️ Found ${articles.length} weather alerts via Exa`);
      
      return result;
    } catch (error) {
      console.error('❌ Exa weather news search failed:', error);
      return this.getFallbackNews('weather', location);
    }
  }

  /**
   * Get breaking travel-related news
   */
  async getBreakingNews(): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey({ type: 'breaking' });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = 'Breaking news affecting international travel and tourism:';

      console.log('⚡ Exa search for breaking news:', searchQuery);

             const response = await this.exa.searchAndContents(searchQuery, {
         type: 'neural',
         useAutoprompt: true,
         numResults: 10,
         text: true,
         highlights: {
           numSentences: 2,
           highlightsPerUrl: 1
         },
         startPublishedDate: this.getDateDaysAgo(3) // Last 3 days
       });

       const articles = this.transformExaResults(response.results as ExaResult[], 'general');
      
      const result: NewsApiResponse = {
        totalArticles: articles.length,
        articles
      };

      this.setCachedData(cacheKey, result);
      console.log(`📰 Found ${articles.length} breaking news articles via Exa`);
      
      return result;
    } catch (error) {
      console.error('❌ Exa breaking news search failed:', error);
      return this.getFallbackNews('general');
    }
  }

  /**
   * Search for specific travel-related news
   */
  async searchNews(query: string, location?: string): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey({ type: 'search', query, location });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = location 
        ? `${query} ${location} travel news:`
        : `${query} travel news:`;

      console.log('🔎 Exa custom search:', searchQuery);

             const response = await this.exa.searchAndContents(searchQuery, {
         type: 'neural',
         useAutoprompt: true,
         numResults: 8,
         text: true,
         highlights: {
           numSentences: 2,
           highlightsPerUrl: 1
         },
         startPublishedDate: this.getDateDaysAgo(21) // Last 3 weeks
       });

       const articles = this.transformExaResults(response.results as ExaResult[], 'general');
      
      const result: NewsApiResponse = {
        totalArticles: articles.length,
        articles
      };

      this.setCachedData(cacheKey, result);
      console.log(`🎯 Found ${articles.length} search results via Exa`);
      
      return result;
    } catch (error) {
      console.error('❌ Exa search failed:', error);
      return this.getFallbackNews('general', location);
    }
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private getFallbackNews(category: NewsArticle['category'], location?: string): NewsApiResponse {
    const fallbackArticles: NewsArticle[] = [
      {
        title: `Travel Advisory: ${location || 'General'} Safety Guidelines`,
        description: 'Important safety information for travelers.',
        content: 'Stay informed about current travel conditions and safety recommendations.',
        url: '#',
        image: this.getDefaultImage(category),
        publishedAt: new Date().toISOString(),
        source: { name: 'Travel Safety Network', url: '#' },
        category,
        severity: 'medium',
        location: location || 'Global'
      }
    ];

    return {
      totalArticles: fallbackArticles.length,
      articles: fallbackArticles
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Exa news cache cleared');
  }
}

// Export singleton instance
export const exaNewsService = new ExaNewsService();
export default exaNewsService; 