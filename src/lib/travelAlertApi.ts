// Travel Alert API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export interface ScrapingResult {
  status: string;
  message: string;
  data: {
    records_exported: number;
    csv_file: string;
    successful_extractions: number;
    failed_urls: string[];
  };
}

export interface AlertRecord {
  location: string;
  scam_type: string;
  description: string;
  risk_rating: number;
  frequency_rating: number;
  target_demographic: string;
  prevention_tips: string;
  severity: string;
  source_url: string;
  source_credibility: string;
  date_reported: string;
  scraped_at: string;
  event_type?: string;
  urgency?: string;
  news_source?: string;
  affected_locations?: string;
}

export interface ScrapingStatus {
  is_running: boolean;
  last_run: string | null;
  next_run: string | null;
  total_records: number;
  recent_files: Array<{
    filename: string;
    records: number;
    timestamp: string;
  }>;
}

export interface CsvFile {
  filename: string;
  size: number;
  created: string;
  records: number;
}

class TravelAlertAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; agent_ready: boolean }> {
    return this.request('/api/health');
  }

  // Core scraping endpoints
  async scrapeData(
    urls: string[], 
    dataType: string = 'travel_alerts', 
    locationFilter?: string,
    filename?: string
  ): Promise<ScrapingResult> {
    return this.request('/api/scrape', {
      method: 'POST',
      body: JSON.stringify({
        urls,
        data_type: dataType,
        location_filter: locationFilter,
        filename
      })
    });
  }

  async getQuickAlerts(country: string): Promise<ScrapingResult> {
    return this.request(`/api/quick-alerts/${country}`);
  }

  // Get actual alert data from CSV files
  async getAlertData(filename: string, limit: number = 100): Promise<{
    data: AlertRecord[];
    total_records: number;
    columns: string[];
    showing: number;
  }> {
    return this.request(`/api/data/${filename}?limit=${limit}`);
  }

  async batchCountries(countries: string[]): Promise<{
    status: string;
    results: Array<{
      country: string;
      records: number;
      file: string;
    }>;
    total_countries: number;
  }> {
    return this.request('/api/batch-countries', {
      method: 'POST',
      body: JSON.stringify({ countries })
    });
  }

  async getStatus(): Promise<ScrapingStatus> {
    return this.request('/api/status');
  }

  async getFiles(): Promise<{ files: CsvFile[] }> {
    return this.request('/api/files');
  }

  async getCsvData(filename: string, limit: number = 100): Promise<{
    data: AlertRecord[];
    total_records: number;
    columns: string[];
    showing: number;
  }> {
    return this.request(`/api/data/${filename}?limit=${limit}`);
  }

  // Eventbrite integration
  async testEventbrite(): Promise<{ status: string; connected: boolean; message: string }> {
    return this.request('/api/eventbrite/test');
  }

  async getLocationEvents(location: string, days: number = 30): Promise<{
    status: string;
    location: string;
    events_found: number;
    events: any[];
    days_ahead: number;
  }> {
    return this.request(`/api/eventbrite/events/${location}?days=${days}`);
  }

  async getEventAlerts(location: string, days: number = 30): Promise<{
    status: string;
    location: string;
    alerts_generated: number;
    alerts: AlertRecord[];
  }> {
    return this.request(`/api/eventbrite/alerts/${location}?days=${days}`);
  }

  async exportEventAlerts(location: string, filename?: string): Promise<{
    status: string;
    location: string;
    csv_file?: string;
    full_path?: string;
    message?: string;
  }> {
    return this.request(`/api/eventbrite/export/${location}`, {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  // GNews integration
  async testGNews(): Promise<{ status: string; connected: boolean; message: string }> {
    return this.request('/api/gnews/test');
  }

  async getLocationNews(location: string, days: number = 7): Promise<{
    status: string;
    location: string;
    articles_found: number;
    articles: any[];
    days_back: number;
  }> {
    return this.request(`/api/gnews/news/${location}?days=${days}`);
  }

  async getNewsAlerts(location: string, days: number = 7): Promise<{
    status: string;
    location: string;
    alerts_generated: number;
    alerts: AlertRecord[];
  }> {
    return this.request(`/api/gnews/alerts/${location}?days=${days}`);
  }

  async getBreakingNews(max: number = 20): Promise<{
    status: string;
    alerts_generated: number;
    alerts: AlertRecord[];
  }> {
    return this.request(`/api/gnews/breaking?max=${max}`);
  }

  async exportNewsAlerts(location: string, filename?: string): Promise<{
    status: string;
    location: string;
    csv_file?: string;
    full_path?: string;
    message?: string;
  }> {
    return this.request(`/api/gnews/export/${location}`, {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  // Automation endpoints
  async startAutomation(): Promise<{ status: string; next_run: string }> {
    return this.request('/api/automation/start', { method: 'POST' });
  }

  async runAutomationNow(): Promise<{ status: string }> {
    return this.request('/api/automation/run-now', { method: 'POST' });
  }
}

export default new TravelAlertAPI(); 