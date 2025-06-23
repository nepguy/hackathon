/**
 * Lingo API Service for Multilingual Support
 * Provides translation services for GuardNomad application
 */

interface LingoTranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface LingoTranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

interface LingoLanguage {
  code: string;
  name: string;
  nativeName: string;
}

class LingoApiService {
  private apiKey: string;
  private baseUrl: string;
  private supportedLanguages: LingoLanguage[];

  constructor() {
    this.apiKey = import.meta.env.VITE_LINGO_API_KEY || 'api_h3t3ldxy0grgxztcbvmls844';
    this.baseUrl = 'https://api.lingo.com/v1';
    this.supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
      { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
      { code: 'da', name: 'Danish', nativeName: 'Dansk' },
      { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
      { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
      { code: 'pl', name: 'Polish', nativeName: 'Polski' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย' }
    ];
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): LingoLanguage[] {
    return this.supportedLanguages;
  }

  /**
   * Detect language of given text
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.language || 'en';
    } catch (error) {
      console.warn('Language detection failed, defaulting to English:', error);
      return 'en';
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(request: LingoTranslationRequest): Promise<LingoTranslationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          target_language: request.targetLanguage,
          source_language: request.sourceLanguage || 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        translatedText: data.translated_text || request.text,
        sourceLanguage: data.source_language || 'en',
        targetLanguage: request.targetLanguage,
        confidence: data.confidence || 0.95,
      };
    } catch (error) {
      console.warn('Translation failed, returning original text:', error);
      return {
        translatedText: request.text,
        sourceLanguage: request.sourceLanguage || 'en',
        targetLanguage: request.targetLanguage,
        confidence: 0,
      };
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts: string[], targetLanguage: string, sourceLanguage?: string): Promise<LingoTranslationResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
          target_language: targetLanguage,
          source_language: sourceLanguage || 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.translations || texts.map(text => ({
        translatedText: text,
        sourceLanguage: sourceLanguage || 'en',
        targetLanguage,
        confidence: 0,
      }));
    } catch (error) {
      console.warn('Batch translation failed, returning original texts:', error);
      return texts.map(text => ({
        translatedText: text,
        sourceLanguage: sourceLanguage || 'en',
        targetLanguage,
        confidence: 0,
      }));
    }
  }

  /**
   * Get user's preferred language from browser or localStorage
   */
  getUserPreferredLanguage(): string {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('guardnomad-language');
    if (savedLanguage && this.supportedLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }

    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (this.supportedLanguages.some(lang => lang.code === browserLanguage)) {
      return browserLanguage;
    }

    // Default to English
    return 'en';
  }

  /**
   * Set user's preferred language
   */
  setUserPreferredLanguage(languageCode: string): void {
    if (this.supportedLanguages.some(lang => lang.code === languageCode)) {
      localStorage.setItem('guardnomad-language', languageCode);
    }
  }

  /**
   * Translate app interface strings
   */
  async translateAppStrings(targetLanguage: string): Promise<Record<string, string>> {
    const appStrings = {
      'welcome': 'Welcome to GuardNomad',
      'safety_companion': 'Your Travel Safety Companion',
      'current_location': 'Current Location',
      'events_nearby': 'Events Nearby',
      'weather_forecast': 'Weather Forecast',
      'safety_alerts': 'Safety Alerts',
      'travel_plans': 'Travel Plans',
      'explore': 'Explore',
      'map': 'Map',
      'profile': 'Profile',
      'settings': 'Settings',
      'no_events_found': 'No events found',
      'location_access_denied': 'Location access denied',
      'enable_location': 'Enable Location',
      'get_location': 'Get My Location',
      'loading': 'Loading...',
      'try_again': 'Try Again',
      'error_occurred': 'An error occurred',
      'high_risk': 'High Risk',
      'medium_risk': 'Medium Risk',
      'low_risk': 'Low Risk',
      'temperature': 'Temperature',
      'humidity': 'Humidity',
      'wind_speed': 'Wind Speed',
      'visibility': 'Visibility',
      'pressure': 'Pressure',
      'today': 'Today',
      'tomorrow': 'Tomorrow',
      'forecast': 'Forecast',
      'my_location': 'My Location',
      'safety_zones': 'Safety Zones',
      'local_events': 'Local Events & Activities',
      'discover_events': 'Discover Local Events',
      'no_events_nearby': 'No Events Nearby',
      'enable_location_access': 'Enable Location Access',
      'explore_all_events': 'Explore All Events'
    };

    if (targetLanguage === 'en') {
      return appStrings;
    }

    try {
      const translations = await this.translateBatch(
        Object.values(appStrings),
        targetLanguage,
        'en'
      );

      const translatedStrings: Record<string, string> = {};
      Object.keys(appStrings).forEach((key, index) => {
        translatedStrings[key] = translations[index]?.translatedText || appStrings[key as keyof typeof appStrings];
      });

      return translatedStrings;
    } catch (error) {
      console.warn('Failed to translate app strings:', error);
      return appStrings;
    }
  }
}

// Export singleton instance
export const lingoService = new LingoApiService();
export default lingoService; 