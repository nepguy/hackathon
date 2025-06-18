import React, { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '../../lib/weatherApi';
import { 
  Cloud, CloudRain, Sun, Snowflake, Wind, 
  Droplets, Eye, Thermometer, AlertTriangle
} from 'lucide-react';

interface WeatherCardProps {
  location?: string;
  coordinates?: { lat: number; lng: number };
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, coordinates }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!location && !coordinates) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let data: WeatherData;
      
      if (coordinates) {
        data = await weatherService.getWeatherByCoordinates(
          coordinates.lat, 
          coordinates.lng, 
          3
        );
      } else if (location) {
        data = await weatherService.getWeatherForecast(location, 3);
      } else {
        throw new Error('No location provided');
      }
      
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Unable to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location, coordinates?.lat, coordinates?.lng]);

  const getWeatherIcon = (condition: string, size: number = 24) => {
    const iconClass = `w-${size/4} h-${size/4}`;
    
    if (condition.toLowerCase().includes('rain')) {
      return <CloudRain className={iconClass} />;
    } else if (condition.toLowerCase().includes('snow')) {
      return <Snowflake className={iconClass} />;
    } else if (condition.toLowerCase().includes('cloud')) {
      return <Cloud className={iconClass} />;
    } else if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) {
      return <Sun className={iconClass} />;
    }
    return <Cloud className={iconClass} />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-600';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-500';
    if (temp >= 0) return 'text-blue-500';
    return 'text-blue-700';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-200 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="card p-6 bg-red-50 border-red-200">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Weather Unavailable</h3>
            <p className="text-red-600 text-sm">{error || 'Unable to load weather data'}</p>
          </div>
        </div>
        <button 
          onClick={fetchWeather}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getWeatherIcon(weatherData.current.condition.text, 32)}
          <div>
            <h3 className="font-semibold text-slate-900">Weather</h3>
            <p className="text-sm text-slate-600">
              {weatherData.location.name}, {weatherData.location.country}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchWeather}
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
          title="Refresh weather"
        >
          <Wind className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Current Weather */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-2">
          <span className={`text-3xl font-bold ${getTemperatureColor(weatherData.current.temperature)}`}>
            {weatherData.current.temperature}°C
          </span>
          <div className="text-sm text-slate-600">
            <div>Feels like {weatherData.current.feelsLike}°C</div>
            <div>{weatherData.current.condition.text}</div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-1 text-slate-600">
            <Droplets className="w-3 h-3" />
            <span>{weatherData.current.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-600">
            <Wind className="w-3 h-3" />
            <span>{weatherData.current.windSpeed} km/h</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-600">
            <Eye className="w-3 h-3" />
            <span>{weatherData.current.visibility} km</span>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-800">3-Day Forecast</h4>
        <div className="grid grid-cols-3 gap-2">
          {weatherData.forecast.slice(0, 3).map((day, index) => (
            <div key={day.date} className="bg-white/60 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-600 mb-1">
                {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="flex justify-center mb-1">
                {getWeatherIcon(day.condition.text, 16)}
              </div>
              <div className="text-xs">
                <div className={`font-medium ${getTemperatureColor(day.maxTemp)}`}>
                  {day.maxTemp}°
                </div>
                <div className="text-slate-500">
                  {day.minTemp}°
                </div>
              </div>
              {day.totalPrecip > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  {day.totalPrecip}mm
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.current.temperature > 35 && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div className="text-sm">
              <div className="font-medium text-red-800">Heat Warning</div>
              <div className="text-red-600">High temperature - stay hydrated</div>
            </div>
          </div>
        </div>
      )}

      {weatherData.current.uvIndex >= 8 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-yellow-600" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">High UV Index</div>
              <div className="text-yellow-600">UV {weatherData.current.uvIndex} - use protection</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;