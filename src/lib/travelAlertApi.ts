import { SafetyAlert } from '../types';
import { API_CONFIG } from '../config/api';

// Travel Alert API Configuration
const API_BASE_URL = 'https://guardnomad-api.onrender.com';

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

export interface GuardNomadAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  source: string;
  created_at: string;
  updated_at: string;
  alert_type: 'travel_alert' | 'scam_data' | 'safety_report';
  government_source?: string;
  url?: string;
}

export interface GuardNomadApiResponse {
  alerts: GuardNomadAlert[];
  total: number;
  status: 'success' | 'error';
  message?: string;
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

class GuardNomadTravelAlertService {
  private baseUrl = API_CONFIG.BASE_URL;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // Get all travel alerts for a specific location
  async getLocationAlerts(location: string): Promise<GuardNomadApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/alerts/${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Saver API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Saver alerts:', error);
      return this.getFallbackAlerts(location);
    }
  }

  // Query database for alerts
  async queryDatabase(location?: string, alertType?: string): Promise<GuardNomadApiResponse> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (alertType) params.append('type', alertType);

      const response = await fetch(`${this.baseUrl}/api/database/query?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Saver database query error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying Saver database:', error);
      return this.getFallbackAlerts(location);
    }
  }

  // Scrape fresh data from government sources
  async scrapeGovernmentSource(country: string, source: string): Promise<GuardNomadApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/scrape/government`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          country,
          source,
          data_type: 'travel_alerts'
        })
      });

      if (!response.ok) {
        throw new Error(`Saver scraping error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error scraping government source:', error);
      return { alerts: [], total: 0, status: 'error', message: 'Scraping failed' };
    }
  }

  // Get system status
  async getSystemStatus(): Promise<{
    totalAlerts: number;
    highSeverity: number;
    activeLocations: number;
    lastUpdate: string;
    status: 'online' | 'offline';
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Saver status error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Saver status:', error);
      return {
        totalAlerts: 0,
        highSeverity: 0,
        activeLocations: 0,
        lastUpdate: new Date().toISOString(),
        status: 'offline'
      };
    }
  }

  // Get country-specific alerts (Thailand, France, Spain, Italy, Germany)
  async getCountryAlerts(countryCode: string): Promise<GuardNomadApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/country/${countryCode}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Saver country alerts error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${countryCode} alerts:`, error);
      return this.getFallbackAlerts(countryCode);
    }
  }

  // Convert GuardNomad alert to our SafetyAlert format
  private transformGuardNomadAlert(guardNomadAlert: GuardNomadAlert): SafetyAlert {
    const typeMap: Record<string, SafetyAlert['type']> = {
      'travel_alert': 'safety',
      'scam_data': 'security',
      'safety_report': 'health'
    };

    return {
      id: guardNomadAlert.id,
      title: guardNomadAlert.title,
      description: guardNomadAlert.message,
      severity: guardNomadAlert.severity,
      location: guardNomadAlert.location,
      timestamp: guardNomadAlert.created_at,
      read: false,
      type: typeMap[guardNomadAlert.alert_type] || 'safety',
      source: guardNomadAlert.government_source || guardNomadAlert.source || 'GuardNomad System',
      tips: []
    };
  }

  // Get alerts in our app format
  async getAlertsForApp(location: string): Promise<SafetyAlert[]> {
    try {
      const guardNomadResponse = await this.getLocationAlerts(location);
      return guardNomadResponse.alerts.map(alert => this.transformGuardNomadAlert(alert));
    } catch (error) {
      console.error('Error getting alerts for app:', error);
      return this.getFallbackAlertsForApp(location);
    }
  }

  // Fallback alerts when GuardNomad is unavailable
  private getFallbackAlerts(location?: string): GuardNomadApiResponse {
    const fallbackAlerts: GuardNomadAlert[] = [
      {
        id: `fallback-${Date.now()}`,
        title: `Travel Advisory - ${location || 'Current Location'}`,
        message: `Exercise normal precautions when traveling to ${location || 'this area'}. Monitor local conditions and follow official guidance.`,
        severity: 'low',
        location: location || 'Unknown',
        source: 'Fallback System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        alert_type: 'travel_alert',
        government_source: 'Local Authorities'
      }
    ];

    return {
      alerts: fallbackAlerts,
      total: fallbackAlerts.length,
      status: 'success',
      message: 'Using fallback data - GuardNomad system unavailable'
    };
  }

  private getFallbackAlertsForApp(location: string): SafetyAlert[] {
    return [
      {
        id: `app-fallback-${Date.now()}`,
        title: `Safety Information - ${location}`,
        description: `Stay informed about local conditions in ${location}. Check official government travel advisories for the latest updates.`,
        severity: 'low',
        location,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'safety',
        source: 'Travel Safety System',
        tips: [
          'Monitor local news and official announcements',
          'Register with your embassy or consulate',
          'Keep emergency contacts readily available',
          'Stay aware of your surroundings'
        ]
      }
    ];
  }
}

// Export singleton instance
export const guardNomadTravelAlertService = new GuardNomadTravelAlertService();

// Export class for custom instances with API keys
export { GuardNomadTravelAlertService };

export default new TravelAlertAPI(); 