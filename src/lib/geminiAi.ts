// src/lib/geminiAi.ts - Enhanced Travel Safety AI Service

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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
 * Get comprehensive location-based safety data using AI with enhanced specificity
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

  // Enhanced location-specific prompt with more detail
  const prompt = `
    As a professional travel security advisor, provide HIGHLY SPECIFIC real-time safety intelligence for: ${locationString}
    ${location.coordinates ? `(Exact Coordinates: ${location.coordinates.lat}, ${location.coordinates.lng})` : ''}

    **CRITICAL REQUIREMENTS:**
    1. Focus ONLY on ${locationString} - not general country information
    2. Include specific neighborhood/district names where risks are higher
    3. Mention exact locations, streets, or areas tourists should avoid
    4. Reference current local events, protests, or incidents (December 2024/January 2025)
    5. Include timezone-specific advice (day vs night safety differences)
    6. Mention local transportation safety (specific metro lines, taxi companies, etc.)

    Return ONLY valid JSON with this exact structure:
    {
      "safetyScore": 85,
      "riskLevel": "low",
      "activeAlerts": [
        {
          "id": "alert-${Date.now()}-1",
          "type": "scam|crime|weather|political|health|transport",
          "severity": "low|medium|high|critical",
          "title": "Specific alert title mentioning exact location",
          "description": "Detailed description with specific areas, times, and circumstances",
          "actionRequired": "Exact steps travelers should take",
          "affectedAreas": ["List specific neighborhoods/districts in ${locationString}"],
          "source": "Local Police Reports/Tourism Authority/Recent Incidents"
        }
      ],
      "commonScams": [
        "Specific scam targeting tourists in ${locationString} with exact MO",
        "Local variants of common scams specific to this city",
        "Area-specific frauds mentioning exact locations/methods"
      ],
      "emergencyNumbers": [
        "Police: +${location.country === 'Germany' ? '49-' : ''}local-emergency-number",
        "Medical: +${location.country === 'Germany' ? '49-' : ''}local-ambulance",
        "Tourist Police: +${location.country === 'Germany' ? '49-' : ''}local-tourist-police"
      ]
    }

    **LOCATION-SPECIFIC FOCUS FOR ${locationString.toUpperCase()}:**
    ${location.city === 'Magdeburg' ? `
    - Focus on Magdeburg-specific risks: train station area, Hasselbachplatz nightlife district
    - Mention bicycle theft issues common in Magdeburg
    - Reference Elbe river area safety concerns
    - Include information about Saxon-Anhalt region-specific issues
    - Mention specific tram lines and safety considerations
    ` : ''}
    - Current crime hotspots and no-go areas within the city
    - Local scam variants targeting international visitors
    - Transportation safety (specific metro/bus lines, taxi services)
    - Seasonal/weather-related safety concerns for this exact location
    - Political demonstrations or civil unrest in specific districts
    - Health advisories specific to this city/region
    - Time-specific risks (day vs night safety in different areas)

    Provide ACTIONABLE, LOCATION-SPECIFIC advice. Avoid generic warnings.
    Safety score: 100=extremely safe, 0=immediate danger.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY, // Proper API key authentication
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ "text": prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (${response.status}):`, errorText);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      try {
        // Extract JSON from response with better parsing
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
              title: alert.title || `Safety Alert for ${locationString}`,
              description: alert.description || `Stay vigilant in ${locationString}`,
              actionRequired: alert.actionRequired || 'Exercise caution in this area',
              affectedAreas: alert.affectedAreas || [locationString],
              source: alert.source || 'AI Security Analysis'
            })),
            commonScams: aiData.commonScams || [
              `ATM skimming in ${locationString} tourist areas`,
              `Fake taxi services targeting visitors to ${locationString}`,
              `Pickpocketing in crowded areas of ${locationString}`
            ],
            emergencyNumbers: aiData.emergencyNumbers || [
              `Police: Contact ${location.country} emergency services`, 
              `Medical: Contact ${location.country} ambulance services`
            ],
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

          console.log(`🛡️ Generated location-specific safety data for: ${locationString}`);
          return safetyData;
        }
      } catch (parseError) {
        console.warn('Could not parse AI response, using location-specific fallback data:', parseError);
      }
    }

    throw new Error('No valid response from AI service');

  } catch (error) {
    console.error("Error generating location safety data:", error);
    return getLocationSpecificFallback(location);
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

/**
 * Enhanced location-specific fallback data
 */
function getLocationSpecificFallback(location: LocationContext): LocationSafetyData {
  const locationString = location.city 
    ? `${location.city}, ${location.country}` 
    : location.country;

  // Location-specific safety data for common destinations
  const locationProfiles: Record<string, Partial<LocationSafetyData>> = {
    'Magdeburg, Germany': {
      safetyScore: 85,
      riskLevel: 'low',
      activeAlerts: [
        {
          id: `magdeburg-${Date.now()}`,
          type: 'crime',
          severity: 'low',
          title: 'Bicycle Theft Alert in Magdeburg',
          description: 'Increased bicycle thefts reported near Magdeburg Central Station and University campus areas',
          actionRequired: 'Use high-quality locks and avoid leaving bicycles unattended for extended periods',
          affectedAreas: ['Hauptbahnhof area', 'University district', 'City center'],
          source: 'Local Police Reports'
        }
      ],
      commonScams: [
        'Bicycle rental scams near tourist areas',
        'Fake parking ticket scams in city center',
        'Overcharging at Hasselbachplatz bars and clubs'
      ],
      emergencyNumbers: [
        'Police: 110',
        'Medical: 112',
        'Fire Department: 112'
      ]
    }
    // Add more locations as needed
  };

  const profile = locationProfiles[locationString] || {};

  return {
    location: locationString,
    country: location.country,
    coordinates: location.coordinates || { lat: 0, lng: 0 },
    safetyScore: profile.safetyScore || 75,
    riskLevel: profile.riskLevel || 'medium',
    activeAlerts: profile.activeAlerts || [
      {
        id: `default-${Date.now()}`,
        type: 'crime',
        severity: 'medium',
        title: `General Safety Advisory for ${locationString}`,
        description: `Exercise standard travel precautions in ${locationString}`,
        actionRequired: 'Stay aware of surroundings and keep valuables secure',
        affectedAreas: [locationString],
        source: 'Default Advisory'
      }
    ],
    commonScams: profile.commonScams || [
      `ATM skimming targeting visitors in ${locationString}`,
      `Fake taxi services in ${locationString}`,
      `Pickpocketing in tourist areas of ${locationString}`,
      `Overcharging by vendors in ${locationString}`
    ],
    emergencyNumbers: profile.emergencyNumbers || [
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