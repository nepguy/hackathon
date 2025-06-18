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

  constructor() {
    this.apiKey = import.meta.env.VITE_GNEWS_API_KEY;
    if (!this.apiKey) {
      console.warn('GNews API key not found in environment variables');
    }
  }

  private async fetchNews(params: Record<string, string>): Promise<NewsApiResponse> {
    if (!this.apiKey) {
      console.warn('GNews API key not configured, using fallback news');
      return this.getFallbackNews();
    }

    const queryParams = new URLSearchParams({
      ...params,
      token: this.apiKey,
      lang: 'en',
      max: '10'
    });

    try {
      console.log('Fetching news with params:', params);
      const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
      
      console.log('News API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('News API error response:', errorText);
        
        if (response.status === 403) {
          console.warn('News API access forbidden (403), using fallback news');
          return this.getFallbackNews();
        }
        
        throw new Error(`News API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('News API success response:', data);
      
      return {
        totalArticles: data.totalArticles || 0,
        articles: this.transformArticles(data.articles || [])
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      console.warn('Falling back to mock news data');
      return this.getFallbackNews();
    }
  }

  private getFallbackNews(): NewsApiResponse {
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
}

export const newsService = new NewsService(); 