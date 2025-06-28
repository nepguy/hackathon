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
  severity: 'low' | 'medium' | 'high';
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
   * Generate AI-powered location-specific news and alerts
   */
  private async generateAINews(location: string): Promise<NewsApiResponse> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

    if (!apiKey || !apiKey.startsWith('AIza')) {
      console.warn('🔑 Gemini API key not available for AI news generation');
      throw new Error('AI service not available');
    }

    // Parse location for better context
    const locationParts = location.split(',').map(p => p.trim());
    const city = locationParts[0];
    const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : locationParts[0];

    const prompt = `
      As a professional travel news reporter, generate 5-6 realistic, current travel safety alerts and news for ${location} (January 2025).

      **REQUIREMENTS:**
      1. Create SPECIFIC, LOCALIZED alerts mentioning real areas, neighborhoods, or landmarks in ${city}
      2. Include diverse alert types: pickpocketing, bicycle theft, weather advisories, transportation issues, local events
      3. Make them sound like real news headlines with specific locations
      4. Use realistic timestamps (last 1-3 days)
      5. Vary severity levels from low to high
      6. Include actionable advice for travelers

      **EXAMPLES of the style wanted:**
      - "Increased Reports of Pickpocketing near ${city} Main Train Station"
      - "Elevated Bicycle Theft in [Local Park Name] and along [Local River/Street] Pathways" 
      - "Weather Advisory: Strong Winds Expected in [City] Downtown Area"
      - "Construction Delays on [Local Transport Line] - Allow Extra Travel Time"

      Return ONLY valid JSON array with this structure:
      [
        {
          "title": "Specific headline mentioning exact location in ${city}",
          "description": "Detailed description with specific areas, times, and circumstances. Mention exact neighborhoods, streets, or landmarks.",
          "content": "Full article content with actionable travel advice",
          "url": "#",
          "image": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
          "publishedAt": "${new Date(Date.now() - Math.random() * 259200000).toISOString()}",
          "source": { 
            "name": "Local Police Reports|${city} Tourism Authority|Regional Safety Network|${country} Travel Advisory", 
            "url": "#" 
          },
          "category": "safety|weather|travel|general",
          "severity": "low|medium|high",
          "location": "${location}"
        }
      ]

      **FOCUS ON ${city.toUpperCase()} SPECIFICALLY:**
      - Mention real-sounding local areas (train station, main square, shopping districts, parks)
      - Include local transportation (buses, trams, metro lines)
      - Reference weather conditions appropriate for ${country} in winter
      - Create alerts that tourists would actually encounter
      - Make each alert unique and location-specific

      Generate 5-6 diverse alerts covering different types of travel concerns.
    `;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ "text": prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No AI response received');
      }

      // Parse the JSON response
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      const aiArticles = JSON.parse(cleanedResponse);

      console.log('🤖 Generated', aiArticles.length, 'AI news articles for', location);

      return {
        totalArticles: aiArticles.length,
        articles: aiArticles.map((article: any) => ({
          ...article,
          source: typeof article.source === 'string' 
            ? { name: article.source, url: '#' }
            : article.source
        }))
      };

    } catch (error) {
      console.error('❌ AI news generation failed:', error);
      throw error;
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