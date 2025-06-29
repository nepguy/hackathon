import { exaUnifiedService } from './exaUnifiedService';
import { locationSafetyService } from './locationSafetyService';

export interface AISafetyAlert {
  id: string;
  type: 'safety' | 'weather' | 'health' | 'security' | 'transportation' | 'cultural';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: 'ai' | 'news' | 'weather' | 'local_authority';
  timestamp: string;
  actionable_advice: string[];
  relevant_links?: string[];
  expires_at?: string;
}

export interface LocationContext {
  destination: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  country: string;
  city?: string;
  travel_dates?: {
    start: string;
    end: string;
  };
  user_location?: {
    lat: number;
    lng: number;
    country: string;
    city?: string;
  };
}

class AISafetyService {
  private readonly ALERT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private alertCache = new Map<string, { alerts: AISafetyAlert[], timestamp: number }>();

  /**
   * Generate comprehensive AI-powered safety alerts for a destination
   */
  async generateSafetyAlerts(context: LocationContext): Promise<AISafetyAlert[]> {
    const cacheKey = this.getCacheKey(context);
    
    // Validate context
    if (!context || (!context.destination && !context.coordinates)) {
      console.warn('❌ Invalid location context provided to generateSafetyAlerts');
      return this.getFallbackAlerts({ destination: 'Unknown', country: 'Unknown' });
    }
    
    // Check cache first
    const cached = this.alertCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.ALERT_CACHE_DURATION) {
      console.log('🔄 Returning cached AI safety alerts');
      return cached.alerts;
    }

    try {
      console.log('🤖 Generating AI safety alerts for:', context.destination || 'coordinates-based location');
      
      // Gather context information
      const contextData = await this.gatherContextData(context);
      
      // Generate AI-powered alerts
      const aiAlerts = await this.generateAIAlerts(context, contextData);
      
      // Merge with real-time data
      const realTimeAlerts = await this.getRealTimeAlerts(context);
      
      // Get Exa-based alerts
      const exaAlerts = await this.generateExaBasedAlerts(context);
      
      // Combine and prioritize alerts
      const allAlerts = [...aiAlerts, ...realTimeAlerts, ...exaAlerts];
      const prioritizedAlerts = this.prioritizeAlerts(allAlerts);
      
      // Use location safety service for backup data
      await this.useLocationSafetyService(context);
      
      // Cache the results
      this.alertCache.set(cacheKey, {
        alerts: prioritizedAlerts,
        timestamp: Date.now()
      });
      
      console.log(`✅ Generated ${prioritizedAlerts.length} AI safety alerts`);
      return prioritizedAlerts;
      
    } catch (error: any) {
      console.error('Error generating AI safety alerts:', error);
      // Return fallback alerts
      return this.getFallbackAlerts(context);
    }
  }

  /**
   * Gather contextual data for AI analysis
   */
  private async gatherContextData(context: LocationContext) {
    const data = {
      location_info: {} as any,
      recent_news: [] as any[],
      weather_conditions: {} as any,
      safety_stats: {} as any,
      travel_advisories: [] as any[]
    };

    try {
      // Get location safety information
      if (context.coordinates) {
        try {
          const safetyInfo = await exaUnifiedService.getLocationSafetyData({
            country: context.country,
            city: context.city,
            coordinates: context.coordinates
          });
          data.safety_stats = safetyInfo;
        } catch (error) {
          console.warn('Could not fetch safety stats:', error);
        }
      }

      // Get recent news using Exa.ai service
      try {
        console.log('🔍 Using Exa.ai service for news gathering');
        const newsData = await exaUnifiedService.getLocalNews(context.destination);
        data.recent_news = newsData.slice(0, 3) || [];
        console.log('✅ Successfully fetched news via Exa.ai service');
      } catch (error) {
        console.warn('Could not fetch recent news via Exa.ai:', error);
        data.recent_news = [];
      }

      // Add travel dates context
      if (context.travel_dates) {
        const now = new Date();
        const startDate = new Date(context.travel_dates.start);
        const isUpcoming = startDate > now;
        const daysUntilTrip = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        data.location_info = {
          ...data.location_info,
          travel_timeline: {
            is_upcoming: isUpcoming,
            days_until_trip: daysUntilTrip,
            trip_duration: Math.ceil(
              (new Date(context.travel_dates.end).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          }
        };
      }

    } catch (error) {
      console.warn('Error gathering context data:', error);
    }

    return data;
  }

  /**
   * Generate AI-powered safety alerts using Exa.ai service
   */
  private async generateAIAlerts(context: LocationContext, contextData: any): Promise<AISafetyAlert[]> {
    try {
      console.log('🤖 Generating AI alerts for:', context.destination);
      
      // First, try to get safety data from Exa.ai service
      if (context.coordinates || context.country) {
        try {
          const locationContext = {
            country: context.country,
            city: context.city,
            coordinates: context.coordinates
          };
          
          const safetyData = await exaUnifiedService.getLocationSafetyData(locationContext);
          
          if (safetyData && safetyData.activeAlerts && safetyData.activeAlerts.length > 0) {
            console.log(`✅ Got ${safetyData.activeAlerts.length} alerts from Exa.ai`);
            
            return safetyData.activeAlerts.map((alert: any, index: number) => ({
              id: `gemini-${Date.now()}-${index}`,
              type: this.mapAlertType(alert.type),
              severity: alert.severity || 'medium',
              title: alert.title || 'Safety Alert',
              message: alert.description || alert.message || '',
              location: context.destination,
              coordinates: context.coordinates,
              source: 'ai' as const,
              timestamp: new Date().toISOString(),
              actionable_advice: alert.actionRequired ? [alert.actionRequired] : [
                'Stay alert and aware of your surroundings',
                'Follow local safety guidelines',
                'Keep emergency contacts handy'
              ],
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }));
          }
          
          // If no active alerts but we have safety data, create a general safety alert
          if (safetyData && safetyData.safetyScore) {
            const generalAlert: AISafetyAlert = {
              id: `safety-score-${Date.now()}`,
              type: 'safety',
              severity: safetyData.riskLevel === 'critical' ? 'critical' : 
                        safetyData.riskLevel === 'high' ? 'high' : 'medium',
              title: `${context.destination} Safety Update`,
              message: `Current safety score: ${safetyData.safetyScore}/100. ${this.getSafetyMessage(safetyData.safetyScore, context.destination)}`,
              location: context.destination,
              coordinates: context.coordinates,
              source: 'ai' as const,
              timestamp: new Date().toISOString(),
              actionable_advice: safetyData.commonScams.length > 0 ? [
                `Be aware of common scams: ${safetyData.commonScams.slice(0, 2).join(', ')}`,
                'Keep valuables secure',
                'Stay in well-lit, populated areas',
                `Emergency numbers: ${safetyData.emergencyNumbers[0] || 'Local emergency services'}`
              ] : [
                'Stay alert and aware of your surroundings',
                'Follow local safety guidelines',
                'Keep emergency contacts handy'
              ],
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            console.log('✅ Generated safety score-based alert');
            return [generalAlert];
          }
        } catch (exaError) {
          console.warn('Exa.ai service unavailable, falling back to basic alerts:', exaError);
        }
      }
      
      // If no AI data available, use existing context data or generate basic alerts
      if (contextData.safety_stats && contextData.safety_stats.activeAlerts) {
        return contextData.safety_stats.activeAlerts.map((alert: any, index: number) => ({
          id: `context-${Date.now()}-${index}`,
          type: this.mapAlertType(alert.type),
          severity: alert.severity || 'medium',
          title: alert.title || 'Safety Alert',
          message: alert.description || alert.message || '',
          location: context.destination,
          coordinates: context.coordinates,
          source: 'ai' as const,
          timestamp: new Date().toISOString(),
          actionable_advice: alert.actionRequired ? [alert.actionRequired] : [],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }));
      }
      
      // Generate location-specific basic alerts
      return this.generateBasicAlerts(context);
    } catch (error) {
      console.error('Error generating AI alerts:', error);
      return this.generateBasicAlerts(context);
    }
  }

  /**
   * Get appropriate safety message based on safety score
   */
  private getSafetyMessage(score: number, destination: string): string {
    if (score >= 85) {
      return `${destination} is considered relatively safe. Continue following standard travel precautions.`;
    } else if (score >= 70) {
      return `${destination} has moderate safety concerns. Exercise increased caution and stay informed about local conditions.`;
    } else if (score >= 50) {
      return `${destination} has elevated safety risks. Take extra precautions and avoid high-risk areas.`;
    } else {
      return `${destination} has significant safety concerns. Consider avoiding non-essential travel and stay highly vigilant.`;
    }
  }

  /**
   * Map Exa.ai alert types to our alert types
   */
  private mapAlertType(exaType: string): AISafetyAlert['type'] {
    const typeMap: Record<string, AISafetyAlert['type']> = {
      'scam': 'security',
      'crime': 'security', 
      'weather': 'weather',
      'political': 'safety',
      'health': 'health',
      'transport': 'transportation'
    };
    return typeMap[exaType] || 'safety';
  }

  /**
   * Generate location-specific alerts when AI data is not available
   */
  private generateBasicAlerts(context: LocationContext): AISafetyAlert[] {
    const alerts: AISafetyAlert[] = [];
    
    console.log('🛡️ Generating location-specific alerts for:', context.destination);
    
    // Get location-specific advice based on country/region
    const locationAdvice = this.getLocationSpecificAdvice(context.country, context.city);
    
    // Add location-specific travel safety alert
    alerts.push({
      id: `location-safety-${Date.now()}`,
      type: 'safety',
      severity: locationAdvice.riskLevel,
      title: `${context.destination} Safety Alert`,
      message: `${locationAdvice.safetyMessage} Current security assessment: ${locationAdvice.riskDescription}`,
      location: context.destination,
      coordinates: context.coordinates,
      source: 'ai',
      timestamp: new Date().toISOString(),
      actionable_advice: locationAdvice.advice,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    // Add transportation alert if coordinates available
    if (context.coordinates) {
      alerts.push({
        id: `transport-${Date.now()}`,
        type: 'transportation',
        severity: 'medium',
        title: 'Transportation Safety',
        message: `Exercise caution with transportation in ${context.destination}. Verify legitimate services and routes.`,
        location: context.destination,
        coordinates: context.coordinates,
        source: 'ai',
        timestamp: new Date().toISOString(),
        actionable_advice: [
          'Use licensed transportation services',
          'Verify taxi meters are running',
          'Keep GPS tracking enabled',
          'Share your location with trusted contacts',
          'Avoid isolated transport stops after dark'
        ],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Add health and emergency preparedness
    alerts.push({
      id: `health-prep-${Date.now()}`,
      type: 'health',
      severity: 'low',
      title: 'Health & Emergency Preparedness',
      message: `Ensure you're prepared for health emergencies in ${context.destination}.`,
      location: context.destination,
      coordinates: context.coordinates,
      source: 'ai',
      timestamp: new Date().toISOString(),
      actionable_advice: [
        'Locate nearest medical facilities',
        'Have travel insurance documentation ready',
        'Keep emergency contacts in local format',
        'Know local emergency numbers',
        'Carry necessary medications with prescriptions'
      ],
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    console.log(`✅ Generated ${alerts.length} location-specific basic alerts`);
    return alerts;
  }

  /**
   * Get location-specific safety advice based on country and city
   */
  private getLocationSpecificAdvice(country: string, city?: string) {
    const countryLower = country.toLowerCase();
    
    // Country-specific safety assessments (basic knowledge-based)
    const countryData: Record<string, {
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      riskDescription: string;
      advice: string[];
    }> = {
      // Major tourist destinations
      'france': {
        riskLevel: 'medium' as const,
        riskDescription: 'Generally safe with standard tourist precautions needed',
        advice: [
          'Be aware of pickpockets in tourist areas and public transport',
          'Avoid protests and large gatherings',
          'Keep valuables secure in popular destinations',
          'Use hotel safes for important documents',
          'Emergency number: 112'
        ]
      },
      'spain': {
        riskLevel: 'medium' as const,
        riskDescription: 'Popular destination with typical urban safety concerns',
        advice: [
          'Watch for pickpockets in crowded areas',
          'Be cautious with bag snatching in tourist zones',
          'Avoid displaying expensive items openly',
          'Stay in well-lit areas at night',
          'Emergency number: 112'
        ]
      },
      'italy': {
        riskLevel: 'medium' as const,
        riskDescription: 'Generally safe with awareness needed in tourist areas',
        advice: [
          'Be alert for pickpockets near major attractions',
          'Avoid unofficial tour guides and street vendors',
          'Keep copies of important documents separate',
          'Use official taxi services',
          'Emergency number: 112'
        ]
      },
      'united kingdom': {
        riskLevel: 'low' as const,
        riskDescription: 'Low crime rates with standard urban precautions',
        advice: [
          'Be aware of petty theft in busy areas',
          'Mind the gap on public transport',
          'Carry umbrella for unpredictable weather',
          'Keep left when walking on sidewalks',
          'Emergency number: 999'
        ]
      },
      'germany': {
        riskLevel: 'low' as const,
        riskDescription: 'Very safe with excellent infrastructure',
        advice: [
          'Follow strict traffic rules',
          'Be punctual for appointments',
          'Separate waste properly',
          'Carry cash as cards not always accepted',
          'Emergency number: 112'
        ]
      },
      'japan': {
        riskLevel: 'low' as const,
        riskDescription: 'Extremely safe with unique cultural considerations',
        advice: [
          'Remove shoes when entering homes',
          'Bow slightly when greeting',
          'Avoid eating while walking',
          'Follow strict recycling rules',
          'Emergency number: 119 (fire/medical), 110 (police)'
        ]
      },
      'thailand': {
        riskLevel: 'medium' as const,
        riskDescription: 'Popular destination requiring cultural sensitivity',
        advice: [
          'Dress modestly at temples and religious sites',
          'Be cautious of tourist scams',
          'Drink bottled or purified water',
          'Respect the monarchy and religious customs',
          'Emergency number: 191'
        ]
      },
      'india': {
        riskLevel: 'high' as const,
        riskDescription: 'Complex destination requiring heightened awareness',
        advice: [
          'Be extremely cautious with food and water',
          'Dress conservatively, especially women',
          'Use prepaid taxis or ride-sharing apps',
          'Avoid isolated areas, especially after dark',
          'Emergency number: 100 (police), 108 (medical)'
        ]
      },
      'brazil': {
        riskLevel: 'high' as const,
        riskDescription: 'Beautiful country with significant safety concerns',
        advice: [
          'Avoid displaying wealth or expensive items',
          'Stay in tourist-friendly areas',
          'Use official transportation services',
          'Be extremely cautious at night',
          'Emergency number: 190 (police), 192 (medical)'
        ]
      },
      'united states': {
        riskLevel: 'medium' as const,
        riskDescription: 'Varies significantly by region and city',
        advice: [
          'Research specific city safety conditions',
          'Be aware of varying state laws',
          'Tip 15-20% at restaurants',
          'Carry ID at all times',
          'Emergency number: 911'
        ]
      }
    };

    const locationData = countryData[countryLower] || {
      riskLevel: 'medium' as const,
      riskDescription: 'Standard travel precautions recommended',
      advice: [
        'Research local customs and laws',
        'Keep important documents secure',
        'Stay aware of your surroundings',
        'Use official transportation services',
        'Locate nearest embassy or consulate'
      ]
    };

    // Add city-specific adjustments if available
    if (city) {
      const cityLower = city.toLowerCase();
      if (cityLower.includes('paris') || cityLower.includes('rome') || cityLower.includes('barcelona')) {
        locationData.advice.unshift('Extra caution needed in tourist-heavy areas');
      }
    }

    return {
      ...locationData,
      safetyMessage: `Traveling to ${country}${city ? `, ${city}` : ''}.`
    };
  }

  /**
   * Get real-time alerts from various sources
   */
  private async getRealTimeAlerts(context: LocationContext): Promise<AISafetyAlert[]> {
    const alerts: AISafetyAlert[] = [];

    console.log('🔄 Getting real-time alerts for:', context?.destination || 'coordinates-based location');

    try {
      // Weather-based alerts
      const weatherAlert = await this.generateWeatherAlert(context);
      if (weatherAlert) alerts.push(weatherAlert);

      // Add Exa-based alerts
      const exaAlerts = await this.generateExaBasedAlerts(context);
      alerts.push(...exaAlerts);

    } catch (error: any) {
      console.warn('Error fetching real-time alerts:', error?.message || error);
    }

    return alerts;
  }

  /**
   * Generate alerts using Exa.ai unified service
   */
  private async generateExaBasedAlerts(context: LocationContext): Promise<AISafetyAlert[]> {
    const alerts: AISafetyAlert[] = [];
    
    if (!context || (!context.destination && !context.coordinates)) {
      console.warn('❌ No location provided for Exa-based alerts');
      return [];
    }
    
    const locationString = context.destination || 
      (context.coordinates ? `${context.coordinates.lat.toFixed(4)}, ${context.coordinates.lng.toFixed(4)}` : '');
    
    if (!locationString) {
      console.warn('❌ Could not determine location string for Exa-based alerts');
      return [];
    }
    
    console.log('🔍 Getting Exa-based alerts for:', locationString);
    
    try {
      try {
        // Get travel safety alerts from Exa
        const safetyAlerts = await exaUnifiedService.getTravelSafetyAlerts(locationString);
        
        // Convert to AISafetyAlert format
        const convertedAlerts = safetyAlerts.map(alert => ({
          id: `exa-${alert.id}`,
          type: this.mapExaAlertType(alert.alertType),
          severity: alert.severity,
          title: alert.title,
          message: alert.description,
          location: alert.location,
          coordinates: context.coordinates,
          source: 'ai' as const,
          timestamp: alert.issuedDate,
          actionable_advice: alert.recommendations,
          relevant_links: [alert.source.url].filter(url => url !== '#'),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }));
        
        alerts.push(...convertedAlerts);
        console.log(`✅ Added ${convertedAlerts.length} Exa-based alerts`);
      } catch (exaError) {
        console.warn('❌ Error generating Exa-based alerts:', exaError);
      }
    } catch (error: any) {
      console.warn('❌ Error generating Exa-based alerts:', error?.message || error);
    }

    return alerts;
  }

  /**
   * Map Exa alert types to our alert types
   */
  private mapExaAlertType(exaType: string): AISafetyAlert['type'] {
    const typeMap: Record<string, AISafetyAlert['type']> = {
      'security': 'security',
      'health': 'health',
      'weather': 'weather',
      'political': 'safety',
      'transport': 'transportation',
      'natural-disaster': 'weather'
    };
    
    return typeMap[exaType] || 'safety';
  }

  /**
   * Generate weather-specific alerts
   */
  private async generateWeatherAlert(context: LocationContext): Promise<AISafetyAlert | null> {
    // This would integrate with weather API
    // For now, return a sample weather alert
    return {
      id: `weather-${Date.now()}`,
      type: 'weather',
      severity: 'medium',
      title: 'Weather Monitoring',
      message: `Stay updated on weather conditions in ${context.destination}. Check local forecasts for any severe weather warnings.`,
      location: context.destination,
      coordinates: context.coordinates,
      source: 'ai',
      timestamp: new Date().toISOString(),
      actionable_advice: [
        'Check daily weather forecasts',
        'Pack appropriate clothing for weather conditions',
        'Monitor local weather alerts and warnings'
      ]
    };
  }



  /**
   * Prioritize alerts by severity and relevance
   */
  private prioritizeAlerts(alerts: AISafetyAlert[]): AISafetyAlert[] {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return alerts
      .sort((a, b) => {
        // Sort by severity first
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        
        // Then by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, 8); // Limit to 8 total alerts
  }

  /**
   * Get fallback alerts when AI fails
   */
  private getFallbackAlerts(context: LocationContext | any): AISafetyAlert[] {
    const destination = context?.destination || 'your destination';
    
    return [
      {
        id: `fallback-general-${Date.now()}`,
        type: 'safety',
        severity: 'medium',
        title: 'General Travel Safety',
        message: `Stay alert and follow general safety practices while in ${destination}.`,
        location: destination,
        source: 'ai',
        timestamp: new Date().toISOString(),
        actionable_advice: [
          'Keep important documents secure',
          'Stay aware of your surroundings',
          'Have emergency contacts readily available',
          'Follow local laws and customs'
        ]
      },
      {
        id: `fallback-health-${Date.now()}`,
        type: 'health',
        severity: 'low',
        title: 'Health & Hygiene Reminder',
        message: `Remember to maintain good hygiene practices during your travels in ${destination}.`,
        location: destination,
        source: 'ai',
        timestamp: new Date().toISOString(),
        actionable_advice: [
          'Wash hands frequently',
          'Carry hand sanitizer',
          'Stay hydrated',
          'Be cautious with street food'
        ]
      }
    ];
  }

  /**
   * Generate cache key for location context
   */
  private getCacheKey(context: LocationContext | any): string {
    const destination = context?.destination || 'unknown';
    const country = context?.country || 'unknown';
    const coords = context?.coordinates?.lat ? `${context.coordinates.lat.toFixed(4)}-${context.coordinates.lng.toFixed(4)}` : 'no-coords';
    
    return `${destination}-${country}-${coords}`;
  }

  /**
   * Clear expired cache entries
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.alertCache.entries()) {
      if (now - value.timestamp >= this.ALERT_CACHE_DURATION) {
        this.alertCache.delete(key);
      }
    }
  }

  /**
   * Use location safety service for backup data and additional context
   */
  private async useLocationSafetyService(context: LocationContext | any): Promise<void> {
    try {
      if (context?.coordinates) {
        // Use locationSafetyService as a backup/additional data source
        // This provides redundancy in case primary AI service fails
        await locationSafetyService.updateUserLocation('system', {
          lat: context.coordinates.lat,
          lng: context.coordinates.lng,
          country: context.country || 'Unknown',
          city: context.city || undefined
        });
        console.log('🔄 Updated location safety service with context data');
      }
    } catch (error: any) {
      console.warn('Could not update location safety service:', error?.message || error);
    }
  }

  /**
   * Get alert statistics for user analytics
   */
  public getAlertStats(alerts: AISafetyAlert[]) {
    const stats = {
      total: alerts.length,
      by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
      by_type: { safety: 0, weather: 0, health: 0, security: 0, transportation: 0, cultural: 0 },
      ai_generated: alerts.filter(a => a.source === 'ai').length,
      actionable_items: alerts.reduce((sum, a) => sum + a.actionable_advice.length, 0)
    };

    alerts.forEach(alert => {
      stats.by_severity[alert.severity]++;
      stats.by_type[alert.type]++;
    });

    return stats;
  }
}

export const aiSafetyService = new AISafetyService();

export const getAISafetyInsights = async (_userId: string, destination: string) => {
  // Wrapper for backward compatibility
  return aiSafetyService.generateSafetyAlerts({
    destination: destination || 'Unknown',
    country: destination?.split(',').pop()?.trim() || 'Unknown',
    city: destination?.split(',')[0]?.trim() || undefined
  });
};