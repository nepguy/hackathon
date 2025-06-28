/**
 * Location-based Safety Service for GuardNomad
 * Provides real-time, location-specific safety alerts and scores
 * Shared data across users in the same location for efficiency
 */

import { geminiAiService } from './geminiAi';
import type { LocationAlert, LocationSafetyData } from './geminiAi';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country: string;
  region?: string;
}

interface SafetyAlert extends LocationAlert {
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
      const alerts = await geminiAiService.getLocationSpecificAlerts(
        { lat: location.lat, lng: location.lng },
        location.country,
        location.city
      );

      // Convert to SafetyAlert format with location-specific flag
      const safetyAlerts: SafetyAlert[] = alerts.map(alert => ({
        ...alert,
        isLocationSpecific: true,
        distanceFromUser: 0 // User is at this location
      }));

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
      const safetyScore = await geminiAiService.getLocationSafetyScore(
        { lat: location.lat, lng: location.lng },
        location.country,
        location.city
      );

      const locationString = location.city 
        ? `${location.city}, ${location.country}` 
        : location.country;

      console.log(`🛡️ Safety score for user ${userId} at ${locationString}: ${safetyScore.score}/100`);

      return {
        ...safetyScore,
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
  async getUserLocationSafetyData(userId: string): Promise<LocationSafetyData | null> {
    const userLocationData = this.userLocationCache.get(userId);
    
    if (!userLocationData) {
      console.warn('⚠️ No location data available for user:', userId);
      return null;
    }

    const { location } = userLocationData;
    
    try {
      const safetyData = await geminiAiService.getLocationSafetyData({
        country: location.country,
        city: location.city,
        region: location.region,
        coordinates: { lat: location.lat, lng: location.lng }
      });

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
      // Check if alert affects areas within the radius
      return alert.affectedAreas.some((area: string) => 
        area.toLowerCase().includes(location.city?.toLowerCase() || '') ||
        area.toLowerCase().includes(location.country.toLowerCase())
      );
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