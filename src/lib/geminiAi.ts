// src/lib/geminiAi.ts - Enhanced Travel Safety AI Service

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface LocationSafetyData {
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  safetyScore: number; // 0-100 (100 being safest)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: LocationAlert[];
  commonScams: string[];
  emergencyNumbers: string[];
  lastUpdated: string;
}

interface LocationAlert {
  id: string;
  type: 'scam' | 'crime' | 'weather' | 'political' | 'health' | 'transport';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  affectedAreas: string[];
  validUntil?: string;
  source: string;
}

interface TravelSafetyAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  actionableAdvice: string[];
  precautions: string[];
  emergencyContacts?: string[];
}

interface LocationContext {
  country: string;
  city?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
}

// Cache for location-based safety data (shared across users in same location)
const locationSafetyCache = new Map<string, { data: LocationSafetyData; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Generate location key for caching (rounds coordinates to ~1km precision)
 */
function generateLocationKey(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 100) / 100; // ~1km precision
  const roundedLng = Math.round(lng * 100) / 100;
  return `${roundedLat},${roundedLng}`;
}

/**
 * Get comprehensive location-based safety data using AI
 */
export const getLocationSafetyData = async (
  location: LocationContext
): Promise<LocationSafetyData> => {
  if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set in .env file");
    return getDefaultSafetyData(location);
  }

  // Check cache first if we have coordinates
  if (location.coordinates) {
    const cacheKey = generateLocationKey(location.coordinates.lat, location.coordinates.lng);
    const cached = locationSafetyCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🎯 Using cached safety data for location:', location.city || location.country);
      return cached.data;
    }
  }

  const locationString = location.city 
    ? `${location.city}, ${location.country}` 
    : location.country;

  const prompt = `
    As a travel safety expert, provide current real-time safety information for: ${locationString}
    ${location.coordinates ? `(Coordinates: ${location.coordinates.lat}, ${location.coordinates.lng})` : ''}

    Analyze current conditions and provide a JSON response with this exact structure:
    {
      "safetyScore": 85,
      "riskLevel": "low",
      "activeAlerts": [
        {
          "id": "unique-id",
          "type": "scam|crime|weather|political|health|transport",
          "severity": "low|medium|high|critical",
          "title": "Alert title",
          "description": "Detailed description",
          "actionRequired": "What travelers should do",
          "affectedAreas": ["specific areas affected"],
          "source": "Source of information"
        }
      ],
      "commonScams": [
        "List of 3-5 current common scams in this location"
      ],
      "emergencyNumbers": [
        "Police: +country-code-number",
        "Medical: +country-code-number",
        "Tourist Police: +country-code-number"
      ]
    }

    Focus on:
    - Current real threats and scams active in this specific location
    - Recent crime trends or safety incidents
    - Weather-related safety concerns
    - Political or social unrest
    - Health advisories
    - Transportation safety issues
    - Tourist-specific risks and scams

    Provide accurate, up-to-date information based on known patterns for this location.
    Safety score: 100=very safe, 0=extremely dangerous.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ "text": prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          
          const safetyData: LocationSafetyData = {
            location: locationString,
            country: location.country,
            coordinates: location.coordinates || { lat: 0, lng: 0 },
            safetyScore: Math.max(0, Math.min(100, aiData.safetyScore || 75)),
            riskLevel: aiData.riskLevel || 'medium',
            activeAlerts: (aiData.activeAlerts || []).map((alert: any, index: number) => ({
              id: alert.id || `alert-${Date.now()}-${index}`,
              type: alert.type || 'crime',
              severity: alert.severity || 'medium',
              title: alert.title || 'Safety Alert',
              description: alert.description || 'Stay vigilant in this area',
              actionRequired: alert.actionRequired || 'Exercise caution',
              affectedAreas: alert.affectedAreas || [locationString],
              source: alert.source || 'AI Analysis'
            })),
            commonScams: aiData.commonScams || [
              'ATM skimming devices',
              'Fake taxi meters',
              'Pickpocketing in crowded areas'
            ],
            emergencyNumbers: aiData.emergencyNumbers || ['Police: 911', 'Medical: 911'],
            lastUpdated: new Date().toISOString()
          };

          // Cache the result if we have coordinates
          if (location.coordinates) {
            const cacheKey = generateLocationKey(location.coordinates.lat, location.coordinates.lng);
            locationSafetyCache.set(cacheKey, {
              data: safetyData,
              timestamp: Date.now()
            });
          }

          console.log('🛡️ Generated fresh safety data for:', locationString);
          return safetyData;
        }
      } catch (parseError) {
        console.warn('Could not parse AI response, using fallback data');
      }
    }

    throw new Error('No valid response from AI service');

  } catch (error) {
    console.error("Error generating location safety data:", error);
    return getDefaultSafetyData(location);
  }
};

/**
 * Get location-specific alerts for current user position
 */
export const getLocationSpecificAlerts = async (
  userLocation: { lat: number; lng: number },
  country: string,
  city?: string
): Promise<LocationAlert[]> => {
  const locationContext: LocationContext = {
    country,
    city,
    coordinates: userLocation
  };

  const safetyData = await getLocationSafetyData(locationContext);
  return safetyData.activeAlerts;
};

/**
 * Get safety score for user's current location
 */
export const getLocationSafetyScore = async (
  userLocation: { lat: number; lng: number },
  country: string,
  city?: string
): Promise<{ score: number; riskLevel: string; summary: string }> => {
  const locationContext: LocationContext = {
    country,
    city,
    coordinates: userLocation
  };

  const safetyData = await getLocationSafetyData(locationContext);
  
  let summary = '';
  if (safetyData.safetyScore >= 80) {
    summary = 'Generally safe area with standard precautions recommended';
  } else if (safetyData.safetyScore >= 60) {
    summary = 'Moderate risk area - stay alert and follow safety guidelines';
  } else if (safetyData.safetyScore >= 40) {
    summary = 'Higher risk area - exercise increased caution';
  } else {
    summary = 'High risk area - consider avoiding or take extra precautions';
  }

  return {
    score: safetyData.safetyScore,
    riskLevel: safetyData.riskLevel,
    summary
  };
};

/**
 * Default safety data fallback
 */
function getDefaultSafetyData(location: LocationContext): LocationSafetyData {
  const locationString = location.city 
    ? `${location.city}, ${location.country}` 
    : location.country;

  return {
    location: locationString,
    country: location.country,
    coordinates: location.coordinates || { lat: 0, lng: 0 },
    safetyScore: 75,
    riskLevel: 'medium',
    activeAlerts: [
      {
        id: `default-${Date.now()}`,
        type: 'crime',
        severity: 'medium',
        title: 'General Safety Advisory',
        description: 'Exercise standard travel precautions in this area',
        actionRequired: 'Stay aware of surroundings and keep valuables secure',
        affectedAreas: [locationString],
        source: 'Default Advisory'
      }
    ],
    commonScams: [
      'ATM skimming and card fraud',
      'Fake taxi services',
      'Pickpocketing in tourist areas',
      'Overcharging by vendors'
    ],
    emergencyNumbers: [
      'Police: Contact local authorities',
      'Medical: Contact local emergency services',
      'Embassy: Contact your country\'s embassy'
    ],
    lastUpdated: new Date().toISOString()
  };
}

export const geminiAiService = {
  getLocationSafetyData,
  getLocationSpecificAlerts,
  getLocationSafetyScore,
};

// Export types
export type { LocationSafetyData, LocationAlert, TravelSafetyAnalysis, LocationContext }; 