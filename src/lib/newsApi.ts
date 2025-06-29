export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  category: 'travel' | 'safety' | 'weather' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
}

export interface NewsApiResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

class NewsService {
  private apiKey: string;
  private baseUrl = 'https://gnews.io/api/v4';
  private cache = new Map<string, { data: NewsApiResponse; timestamp: number }>();
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 10;

  constructor() {
    this.apiKey = import.meta.env.VITE_GNEWS_API_KEY;
    if (!this.apiKey) {
      console.warn('GNews API key not found in environment variables');
    }
  }

  private getCacheKey(params: Record<string, string>): string {
    return JSON.stringify(params);
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    const key = 'global';
    const limits = this.requestCounts.get(key);

    if (!limits || now > limits.resetTime) {
      // Reset rate limit window
      this.requestCounts.set(key, {
        count: 0,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return false;
    }

    return limits.count >= this.MAX_REQUESTS_PER_MINUTE;
  }

  private incrementRequestCount(): void {
    const key = 'global';
    const limits = this.requestCounts.get(key);
    if (limits) {
      limits.count++;
    }
  }

  private getCachedData(cacheKey: string): NewsApiResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached news data');
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
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private async fetchNews(params: Record<string, string>): Promise<NewsApiResponse> {
    const cacheKey = this.getCacheKey(params);
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    if (!this.apiKey) {
      console.warn('🔑 GNews API key not configured, using AI-generated news');
      return await this.getFallbackNews(params.q?.split(' ')?.[0]); // Pass location from query
    }

    // Check rate limiting
    if (this.isRateLimited()) {
      console.warn('⚠️ Rate limited! Using AI-generated news data');
      return await this.getFallbackNews(params.q?.split(' ')?.[0]); // Pass location from query
    }

    const queryParams = new URLSearchParams({
      ...params,
      token: this.apiKey,
      lang: 'en',
      max: '10'
    });

    try {
      console.log('🔄 Fetching fresh news with params:', params);
      this.incrementRequestCount();
      
      const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
      
      console.log('📡 News API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ News API error response:', errorText);
        
        if (response.status === 403 || response.status === 429) {
          console.warn('⚠️ News API access limited, using AI-generated news');
          return await this.getFallbackNews(params.q?.split(' ')?.[0]); // Pass location from query
        }
        
        throw new Error(`News API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ News API success response');
      
      const result = {
        totalArticles: data.totalArticles || 0,
        articles: this.transformArticles(data.articles || [])
      };

      // Cache the successful response
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      console.warn('📦 Falling back to AI-generated news data');
      return await this.getFallbackNews(params.q?.split(' ')?.[0]); // Pass location from query
    }
  }

  private async getFallbackNews(location?: string): Promise<NewsApiResponse> {
    try {
      // Try to generate AI-powered location-specific news
      if (location) {
        console.log('🤖 Generating AI news for location:', location);
        const aiNews = await this.generateAINews(location);
        if (aiNews.articles.length > 0) {
          return aiNews;
        }
      }
    } catch (error) {
      console.warn('❌ AI news generation failed, using static fallback:', error);
    }

    // Static fallback if AI fails or no location provided
    const fallbackArticles: NewsArticle[] = [
      {
        title: 'Travel Safety Advisory: General Guidelines for International Travel',
        description: 'Stay informed about current travel conditions and safety recommendations.',
        content: 'Travel safety remains a top priority for international travelers. Stay updated with local conditions.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { name: 'Travel Safety Network', url: '#' },
        category: 'safety',
        severity: 'medium',
        location: 'Global'
      },
      {
        title: 'Weather Update: Monitor Conditions Before Traveling',
        description: 'Check weather conditions and forecasts for your destination.',
        content: 'Weather conditions can significantly impact travel plans. Always check forecasts before departure.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { name: 'Weather Central', url: '#' },
        category: 'weather',
        severity: 'low',
        location: 'Global'
      },
      {
        title: 'Travel Tips: Essential Safety Measures for Modern Travelers',
        description: 'Important safety tips and best practices for international travel.',
        content: 'Modern travel requires awareness of various safety considerations and preventive measures.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        source: { name: 'Travel Guide Network', url: '#' },
        category: 'travel',
        severity: 'low',
        location: 'Global'
      }
    ];

    return {
      totalArticles: fallbackArticles.length,
      articles: fallbackArticles
    };
  }

  /**
   * Generate AI-powered location-specific news and alerts using Exa.ai
   */
  private async generateAINews(location: string): Promise<NewsApiResponse> {
    // Import Exa service for AI-powered news generation
    const { exaUnifiedService } = await import('./exaUnifiedService');
    
    try {
      console.log('🔍 Generating AI-powered news for', location, 'using Exa.ai');
      
      // Use Exa.ai to get real local news and safety alerts
      const [localNews, scamAlerts, safetyAlerts] = await Promise.all([
        exaUnifiedService.getLocalNews(location),
        exaUnifiedService.getScamAlerts(location),
        exaUnifiedService.getTravelSafetyAlerts(location)
      ]);

      // Combine all sources into news articles
      const articles: NewsArticle[] = [
        // Convert local news
        ...localNews.map(news => ({
          title: news.title,
          description: news.description,
          content: news.content,
          url: news.url,
          image: news.imageUrl || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
          publishedAt: news.publishedAt,
          source: {
            name: news.source.name,
            url: news.source.url
          },
          category: 'general' as const,
          severity: 'low' as const,
          location: news.location
        })),
        
        // Convert scam alerts to news format
        ...scamAlerts.map(alert => ({
          title: alert.title,
          description: alert.description,
          content: `${alert.description} Affected areas: ${alert.affectedAreas.join(', ')}`,
          url: alert.source.url,
          image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
          publishedAt: alert.reportedDate,
          source: {
            name: alert.source.name,
            url: alert.source.url
          },
          category: 'safety' as const,
          severity: alert.severity,
          location: alert.location || location
        })),
        
        // Convert safety alerts to news format
        ...safetyAlerts.map(alert => ({
          title: alert.title,
          description: alert.description,
          content: `${alert.description} Recommendations: ${alert.recommendations.join(', ')}`,
          url: alert.source.url,
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
          publishedAt: alert.issuedDate,
          source: {
            name: alert.source.name,
            url: alert.source.url
          },
          category: 'safety' as const,
          severity: alert.severity,
          location: alert.location
        }))
      ];

      console.log('🤖 Generated', articles.length, 'AI-powered news articles for', location);

      return {
        totalArticles: articles.length,
        articles: articles.slice(0, 10) // Limit to 10 most relevant
      };

    } catch (error) {
      console.error('❌ Exa.ai news generation failed:', error);
      throw new Error('AI service not available');
    }
  }



  private transformArticles(articles: any[]): NewsArticle[] {
    return articles.map(article => ({
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '',
      image: article.image || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || ''
      },
      category: this.categorizeArticle(article),
      severity: this.determineSeverity(article),
      location: this.extractLocation(article)
    }));
  }

  private categorizeArticle(article: any): NewsArticle['category'] {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = `${title} ${description}`;

    if (content.includes('travel') || content.includes('tourism') || content.includes('flight') || content.includes('airport')) {
      return 'travel';
    }
    if (content.includes('safety') || content.includes('security') || content.includes('crime') || content.includes('alert')) {
      return 'safety';
    }
    if (content.includes('weather') || content.includes('storm') || content.includes('hurricane') || content.includes('flood')) {
      return 'weather';
    }
    return 'general';
  }

  private determineSeverity(article: any): NewsArticle['severity'] {
    const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    
    const highSeverityKeywords = ['emergency', 'urgent', 'breaking', 'alert', 'warning', 'danger', 'critical', 'evacuation'];
    const mediumSeverityKeywords = ['caution', 'advisory', 'notice', 'update', 'change', 'disruption'];
    
    if (highSeverityKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    if (mediumSeverityKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private extractLocation(article: any): string | undefined {
    const content = `${article.title || ''} ${article.description || ''}`;
    
    // Simple location extraction - could be enhanced with NLP
    const locationPatterns = [
      /in ([A-Z][a-z]+ [A-Z][a-z]+)/g, // "in New York"
      /([A-Z][a-z]+, [A-Z][a-z]+)/g,   // "Paris, France"
      /([A-Z][a-z]+ [A-Z][a-z]+)/g      // "New York"
    ];

    for (const pattern of locationPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }
    return undefined;
  }

  // Public API methods
  async getTravelNews(country?: string): Promise<NewsApiResponse> {
    const query = country 
      ? `travel ${country} OR tourism ${country} OR flight ${country}`
      : 'travel OR tourism OR flight OR airport';
      
    return this.fetchNews({
      q: query,
      sortby: 'publishedAt'
    });
  }

  async getSafetyAlerts(location?: string): Promise<NewsApiResponse> {
    const query = location
      ? `safety alert ${location} OR security ${location} OR warning ${location}`
      : 'safety alert OR security warning OR travel advisory';
      
    return this.fetchNews({
      q: query,
      sortby: 'publishedAt'
    });
  }

  async getWeatherNews(location?: string): Promise<NewsApiResponse> {
    const query = location
      ? `weather ${location} OR storm ${location} OR hurricane ${location}`
      : 'weather alert OR storm warning OR hurricane';
      
    return this.fetchNews({
      q: query,
      sortby: 'publishedAt'
    });
  }

  async getBreakingNews(): Promise<NewsApiResponse> {
    return this.fetchNews({
      q: 'breaking news travel OR urgent travel alert',
      sortby: 'publishedAt'
    });
  }

  async searchNews(query: string, location?: string): Promise<NewsApiResponse> {
    const searchQuery = location ? `${query} ${location}` : query;
    
    return this.fetchNews({
      q: searchQuery,
      sortby: 'relevance'
    });
  }

  clearCache(): void {
    this.cache.clear();
    this.requestCounts.clear();
    console.log('📦 News cache cleared');
  }
}

export const newsService = new NewsService(); 