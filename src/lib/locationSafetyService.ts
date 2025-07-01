/**
 * Location-based Safety Service for GuardNomad
 * Provides real-time, location-specific safety alerts and scores
 * Shared data across users in the same location for efficiency
 */

import { exaUnifiedService } from './exaUnifiedService';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country: string;
  region?: string;
}

interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  isLocationSpecific: boolean;
  distanceFromUser?: number; // in km
}

class LocationSafetyService {
  private userLocationCache = new Map<string, { location: UserLocation; timestamp: number }>();
  private readonly LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Update user's current location
   */
  async updateUserLocation(userId: string, location: UserLocation): Promise<void> {
    this.userLocationCache.set(userId, {
      location,
      timestamp: Date.now()
    });

    console.log(`📍 Updated location for user ${userId}:`, location.city || location.country);
  }

  /**
   * Get current location-specific alerts for a user
   */
  async getUserLocationAlerts(userId: string): Promise<SafetyAlert[]> {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      console.warn('⚠️ No location data available for user:', userId);
      return [];
    }

    const { location } = userLocationData;
    
    try {
      const locationString = location.city ? `${location.city}, ${location.country}` : location.country;
      
      const [scamAlerts, localNews] = await Promise.allSettled([
        exaUnifiedService.getScamAlerts(locationString),
        exaUnifiedService.getLocalNews(locationString)
      ]);

      const safetyAlerts: SafetyAlert[] = [];

      // Process scam alerts
      if (scamAlerts.status === 'fulfilled' && scamAlerts.value.length > 0) {
        scamAlerts.value.forEach((alert: any) => {
          safetyAlerts.push({
            id: alert.id || `scam-${Date.now()}`,
            title: alert.title || 'Scam Alert',
            description: alert.description || 'Be aware of local scam activities',
            severity: (alert.severity || 'high') as SafetyAlert['severity'],
            type: 'scam',
            location: locationString,
            isLocationSpecific: true,
            distanceFromUser: 0
          });
        });
      }

      // Process news for safety alerts
      if (localNews.status === 'fulfilled' && localNews.value.length > 0) {
        const safetyNews = localNews.value.filter((news: any) => 
          ['crime', 'breaking'].includes(news.category)
        );
        
        safetyNews.forEach((news: any) => {
          safetyAlerts.push({
            id: news.id || `news-${Date.now()}`,
            title: news.title,
            description: news.description || news.content,
            severity: (news.category === 'breaking' ? 'high' : 'medium') as SafetyAlert['severity'],
            type: 'news',
            location: locationString,
        isLocationSpecific: true,
            distanceFromUser: 0
          });
        });
      }

      console.log(`🚨 Found ${safetyAlerts.length} location-specific alerts for user ${userId}`);
      return safetyAlerts;

    } catch (error) {
      console.error('❌ Error fetching location alerts:', error);
      return [];
    }
  }

  /**
   * Get safety score for user's current location
   */
  async getUserLocationSafetyScore(userId: string): Promise<{
    score: number;
    riskLevel: string;
    summary: string;
    location: string;
  } | null> {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      console.warn('⚠️ No location data available for user:', userId);
      return null;
    }

    const { location } = userLocationData;
    
    try {
      const locationString = location.city 
        ? `${location.city}, ${location.country}` 
        : location.country;

      // Use available backend methods to calculate safety score
      const [scamAlerts, localNews] = await Promise.allSettled([
        exaUnifiedService.getScamAlerts(locationString),
        exaUnifiedService.getLocalNews(locationString)
      ]);

      let score = 80; // Base score
      let riskLevel = 'medium';
      let summary = 'Moderate safety conditions';

      // Adjust score based on scam alerts
      if (scamAlerts.status === 'fulfilled' && scamAlerts.value.length > 0) {
        score -= scamAlerts.value.length * 15;
        riskLevel = 'high';
        summary = 'Elevated risk due to reported scam activities';
      }

      // Adjust score based on news
      if (localNews.status === 'fulfilled' && localNews.value.length > 0) {
        const crimeNews = localNews.value.filter((news: any) => 
          ['crime', 'breaking'].includes(news.category)
        );
        if (crimeNews.length > 0) {
          score -= crimeNews.length * 10;
          if (riskLevel === 'medium') {
            riskLevel = 'elevated';
            summary = 'Some safety concerns based on recent news';
          }
        }
      }

      // Ensure score doesn't go below 0
      score = Math.max(0, score);

      console.log(`🛡️ Safety score for user ${userId} at ${locationString}: ${score}/100`);

      return {
        score,
        riskLevel,
        summary,
        location: locationString
      };

    } catch (error) {
      console.error('❌ Error fetching safety score:', error);
      return null;
    }
  }

  /**
   * Get comprehensive safety data for user's location
   */
  async getUserLocationSafetyData(userId: string): Promise<any | null> {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      console.warn('⚠️ No location data available for user:', userId);
      return null;
    }

    const { location } = userLocationData;
    
    try {
      // Use available backend methods to get safety data
      const locationString = location.city ? `${location.city}, ${location.country}` : location.country;
      
      const [scamAlerts, localNews] = await Promise.allSettled([
        exaUnifiedService.getScamAlerts(locationString),
        exaUnifiedService.getLocalNews(locationString)
      ]);

      // Build comprehensive safety data from available sources
      const safetyData: any = {
        safetyScore: 75,
        riskLevel: 'medium',
        activeAlerts: [],
        commonScams: [],
        emergencyNumbers: ['112', '911'], // Generic emergency numbers
        location: locationString
      };

      // Process scam alerts
      if (scamAlerts.status === 'fulfilled' && scamAlerts.value.length > 0) {
        safetyData.activeAlerts.push(...scamAlerts.value);
        safetyData.commonScams.push(...scamAlerts.value.map((alert: any) => alert.title || 'Unknown scam'));
        safetyData.riskLevel = 'high';
        safetyData.safetyScore = 60;
      }

      // Process news for safety context
      if (localNews.status === 'fulfilled' && localNews.value.length > 0) {
        const safetyRelatedNews = localNews.value.filter((news: any) => 
          ['crime', 'breaking'].includes(news.category)
        );
        if (safetyRelatedNews.length > 0) {
          safetyData.activeAlerts.push(...safetyRelatedNews);
          if (safetyData.riskLevel === 'medium') {
            safetyData.riskLevel = 'elevated';
            safetyData.safetyScore = 65;
          }
        }
      }

      console.log(`📊 Comprehensive safety data retrieved for user ${userId}`);
      return safetyData;

    } catch (error) {
      console.error('❌ Error fetching comprehensive safety data:', error);
      return null;
    }
  }

  /**
   * Get nearby safety alerts (within specified radius)
   */
  async getNearbyAlerts(
    userId: string, 
    radiusKm: number = 10
  ): Promise<SafetyAlert[]> {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      return [];
    }

    const { location } = userLocationData;
    
    // For now, we'll get alerts for the current location
    // In the future, this could be expanded to check nearby cities/regions using radiusKm
    console.log(`🔍 Searching for alerts within ${radiusKm}km of user location`);
    
    const alerts = await this.getUserLocationAlerts(userId);
    
    return alerts.filter(alert => {
      // Check if alert location matches user location
      return alert.location.toLowerCase().includes(location.city?.toLowerCase() || '') ||
        alert.location.toLowerCase().includes(location.country.toLowerCase());
    });
  }

  /**
   * Check if user has moved to a new significant location
   */
  hasUserLocationChanged(
    userId: string, 
    newLocation: UserLocation, 
    significantDistanceKm: number = 5
  ): boolean {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      return true; // First time location
    }

    const { location: oldLocation } = userLocationData;
    
    // Calculate distance between old and new location
    const distance = this.calculateDistance(
      oldLocation.lat, oldLocation.lng,
      newLocation.lat, newLocation.lng
    );

    return distance > significantDistanceKm;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get cached location for user
   */
  getUserLocation(userId: string): UserLocation | null {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      return null;
    }

    // Check if location data is still fresh
    if (Date.now() - userLocationData.timestamp > this.LOCATION_CACHE_DURATION) {
      this.userLocationCache.delete(userId);
      return null;
    }

    return userLocationData.location;
  }

  /**
   * Clear user's location data (e.g., on logout)
   */
  clearUserLocation(userId: string): void {
    this.userLocationCache.delete(userId);
    console.log(`🗑️ Cleared location data for user ${userId}`);
  }

  /**
   * Get emergency information for user's current location
   */
  async getEmergencyInfo(userId: string): Promise<{
    emergencyNumbers: string[];
    nearestHospital?: string;
    nearestPoliceStation?: string;
    embassyContact?: string;
  } | null> {
    const safetyData = await this.getUserLocationSafetyData(userId);
    
    if (!safetyData) {
      return null;
    }

    return {
      emergencyNumbers: safetyData.emergencyNumbers,
      // These could be enhanced with additional location-based services
      nearestHospital: 'Contact local emergency services',
      nearestPoliceStation: 'Contact local police',
      embassyContact: 'Contact your country\'s embassy'
    };
  }

  /**
   * Get location-specific travel tips
   */
  async getLocationTips(userId: string): Promise<string[]> {
    const safetyData = await this.getUserLocationSafetyData(userId);
    
    if (!safetyData) {
      return [
        'Stay aware of your surroundings',
        'Keep important documents secure',
        'Stay connected with family/friends'
      ];
    }

    return [
      `Current safety score: ${safetyData.safetyScore}/100 (${safetyData.riskLevel} risk)`,
      ...safetyData.commonScams.map((scam: string) => `Watch out for: ${scam}`),
      'Keep emergency numbers handy',
      'Stay informed about local conditions'
    ];
  }
}

// Export singleton instance
export const locationSafetyService = new LocationSafetyService();
export default locationSafetyService;

// Export types
export type { UserLocation, SafetyAlert }; 