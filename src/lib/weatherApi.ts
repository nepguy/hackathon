export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
  };
  forecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    avgTemp: number;
    maxWind: number;
    totalPrecip: number;
    avgHumidity: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    astro: {
      sunrise: string;
      sunset: string;
      moonrise: string;
      moonset: string;
    };
  }[];
  alerts?: any[];
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  type: 'weather' | 'air_quality' | 'uv' | 'wind' | 'precipitation';
  startTime: string;
  endTime: string;
  location: string;
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '0f0174b1af5541cfba8113204251806';
    if (!this.apiKey) {
      console.warn('Weather API key not found in environment variables');
    }
  }

  private async fetchWeatherData(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!this.apiKey) {
      console.warn('Weather API key not configured, using fallback data');
      return this.getFallbackWeatherData(params.q || 'Unknown Location');
    }

    const queryParams = new URLSearchParams({
      ...params,
      key: this.apiKey
    });

    try {
      console.log('Fetching weather data for:', params.q);
      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
      
      console.log('Weather API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API error response:', errorText);
        
        if (response.status === 403) {
          console.warn('Weather API access forbidden (403), using fallback data');
          return this.getFallbackWeatherData(params.q || 'Unknown Location');
        }
        
        throw new Error(`Weather API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Weather API success response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      console.warn('Falling back to mock weather data');
      return this.getFallbackWeatherData(params.q || 'Unknown Location');
    }
  }

  private getFallbackWeatherData(location: string): any {
    const locationName = location.split(',')[0] || 'Unknown Location';
    
    return {
      location: {
        name: locationName,
        region: 'Unknown Region',
        country: 'Unknown Country',
        lat: 0,
        lon: 0
      },
      current: {
        temp_c: 22,
        feelslike_c: 24,
        humidity: 65,
        wind_kph: 10,
        wind_dir: 'NW',
        pressure_mb: 1013,
        vis_km: 10,
        uv: 5,
        condition: {
          text: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          code: 1003
        }
      },
      forecast: {
        forecastday: [
          {
            date: new Date().toISOString().split('T')[0],
            day: {
              maxtemp_c: 25,
              mintemp_c: 18,
              avgtemp_c: 22,
              maxwind_kph: 15,
              totalprecip_mm: 0,
              avghumidity: 65,
              condition: {
                text: 'Partly cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                code: 1003
              }
            },
            astro: {
              sunrise: '06:30 AM',
              sunset: '07:30 PM',
              moonrise: '09:45 PM',
              moonset: '08:15 AM'
            }
          },
          {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            day: {
              maxtemp_c: 27,
              mintemp_c: 20,
              avgtemp_c: 24,
              maxwind_kph: 12,
              totalprecip_mm: 2,
              avghumidity: 70,
              condition: {
                text: 'Light rain',
                icon: '//cdn.weatherapi.com/weather/64x64/day/296.png',
                code: 1183
              }
            },
            astro: {
              sunrise: '06:31 AM',
              sunset: '07:29 PM',
              moonrise: '10:30 PM',
              moonset: '09:00 AM'
            }
          },
          {
            date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            day: {
              maxtemp_c: 23,
              mintemp_c: 16,
              avgtemp_c: 20,
              maxwind_kph: 18,
              totalprecip_mm: 0,
              avghumidity: 60,
              condition: {
                text: 'Sunny',
                icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                code: 1000
              }
            },
            astro: {
              sunrise: '06:32 AM',
              sunset: '07:28 PM',
              moonrise: '11:15 PM',
              moonset: '09:45 AM'
            }
          }
        ]
      },
      alerts: { alert: [] }
    };
  }

  private transformWeatherData(data: any): WeatherData {
    return {
      location: {
        name: data.location?.name || '',
        country: data.location?.country || '',
        region: data.location?.region || '',
        lat: data.location?.lat || 0,
        lon: data.location?.lon || 0
      },
      current: {
        temperature: Math.round(data.current?.temp_c || 0),
        feelsLike: Math.round(data.current?.feelslike_c || 0),
        humidity: data.current?.humidity || 0,
        windSpeed: data.current?.wind_kph || 0,
        windDirection: data.current?.wind_dir || '',
        pressure: data.current?.pressure_mb || 0,
        visibility: data.current?.vis_km || 0,
        uvIndex: data.current?.uv || 0,
        condition: {
          text: data.current?.condition?.text || '',
          icon: data.current?.condition?.icon || '',
          code: data.current?.condition?.code || 0
        }
      },
      forecast: (data.forecast?.forecastday || []).map((day: any) => ({
        date: day.date,
        maxTemp: Math.round(day.day?.maxtemp_c || 0),
        minTemp: Math.round(day.day?.mintemp_c || 0),
        avgTemp: Math.round(day.day?.avgtemp_c || 0),
        maxWind: day.day?.maxwind_kph || 0,
        totalPrecip: day.day?.totalprecip_mm || 0,
        avgHumidity: day.day?.avghumidity || 0,
        condition: {
          text: day.day?.condition?.text || '',
          icon: day.day?.condition?.icon || '',
          code: day.day?.condition?.code || 0
        },
        astro: {
          sunrise: day.astro?.sunrise || '',
          sunset: day.astro?.sunset || '',
          moonrise: day.astro?.moonrise || '',
          moonset: day.astro?.moonset || ''
        }
      })),
      alerts: data.alerts?.alert || []
    };
  }

  private generateWeatherAlerts(weatherData: WeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    // Temperature alerts
    if (weatherData.current.temperature > 35) {
      alerts.push({
        id: 'temp-high',
        title: 'Extreme Heat Warning',
        description: `Very high temperature of ${weatherData.current.temperature}°C. Stay hydrated and avoid prolonged sun exposure.`,
        severity: 'high',
        type: 'weather',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: `${weatherData.location.name}, ${weatherData.location.country}`
      });
    } else if (weatherData.current.temperature < 0) {
      alerts.push({
        id: 'temp-low',
        title: 'Freezing Temperature Alert',
        description: `Below freezing temperature of ${weatherData.current.temperature}°C. Dress warmly and be cautious of icy conditions.`,
        severity: 'medium',
        type: 'weather',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: `${weatherData.location.name}, ${weatherData.location.country}`
      });
    }

    // UV Index alerts
    if (weatherData.current.uvIndex >= 8) {
      alerts.push({
        id: 'uv-high',
        title: 'High UV Index Warning',
        description: `Very high UV index of ${weatherData.current.uvIndex}. Use sunscreen and protective clothing.`,
        severity: 'medium',
        type: 'uv',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        location: `${weatherData.location.name}, ${weatherData.location.country}`
      });
    }

    // Wind alerts
    if (weatherData.current.windSpeed > 50) {
      alerts.push({
        id: 'wind-high',
        title: 'Strong Wind Alert',
        description: `High wind speeds of ${weatherData.current.windSpeed} km/h. Be cautious when driving or walking outdoors.`,
        severity: 'medium',
        type: 'wind',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        location: `${weatherData.location.name}, ${weatherData.location.country}`
      });
    }

    // Precipitation alerts from forecast
    weatherData.forecast.forEach((day, index) => {
      if (day.totalPrecip > 25) {
        alerts.push({
          id: `precip-${index}`,
          title: 'Heavy Rain Expected',
          description: `Heavy rainfall of ${day.totalPrecip}mm expected. Plan indoor activities and avoid flood-prone areas.`,
          severity: 'medium',
          type: 'precipitation',
          startTime: new Date(day.date).toISOString(),
          endTime: new Date(new Date(day.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          location: `${weatherData.location.name}, ${weatherData.location.country}`
        });
      }
    });

    return alerts;
  }

  // Public API methods
  async getCurrentWeather(location: string): Promise<WeatherData> {
    const data = await this.fetchWeatherData('/current.json', {
      q: location,
      aqi: 'yes'
    });

    return this.transformWeatherData(data);
  }

  async getWeatherForecast(location: string, days: number = 3): Promise<WeatherData> {
    const data = await this.fetchWeatherData('/forecast.json', {
      q: location,
      days: Math.min(days, 10).toString(),
      aqi: 'yes',
      alerts: 'yes'
    });

    return this.transformWeatherData(data);
  }

  async getWeatherByCoordinates(lat: number, lng: number, days: number = 3): Promise<WeatherData> {
    const data = await this.fetchWeatherData('/forecast.json', {
      q: `${lat},${lng}`,
      days: Math.min(days, 10).toString(),
      aqi: 'yes',
      alerts: 'yes'
    });

    return this.transformWeatherData(data);
  }

  async getWeatherAlerts(location: string): Promise<WeatherAlert[]> {
    try {
      const weatherData = await this.getWeatherForecast(location, 3);
      return this.generateWeatherAlerts(weatherData);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  async searchLocations(query: string): Promise<Array<{
    id: number;
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    url: string;
  }>> {
    try {
      const data = await this.fetchWeatherData('/search.json', {
        q: query
      });

      return data || [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }
}

export const weatherService = new WeatherService(); 