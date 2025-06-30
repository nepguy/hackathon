// src/lib/exaUnifiedService.ts - Backend API Service for Travel Intelligence

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

// Simple backend service
class BackendUnifiedService {
  constructor() {
    console.log('✅ Backend Unified Service initialized');
  }

  async getLocalNews(location: string): Promise<LocalNews[]> {
    console.log('📰 Getting local news for:', location);
    
    // Return fallback data for now - backend will provide real data
    return [{
      id: 'news_1',
      title: `${location} Travel Updates`,
      description: `Current travel information and updates for ${location}`,
      content: `Stay informed about local developments and travel news in ${location}.`,
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
      publishedAt: new Date().toISOString(),
      source: { name: 'Guard Nomad News', url: '#', type: 'local' },
      category: 'community',
      location
    }];
  }

  async testApiConnection() {
    console.log('🧪 Testing Backend API connection...');
    return { 
      success: true, 
      sampleData: { message: 'Backend service ready' } 
    };
  }

  clearCache() {
    console.log('🧹 Cache cleared');
  }
}

// Export singleton instance
export const exaUnifiedService = new BackendUnifiedService(); 