import React, { useState, useEffect } from 'react';
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, Eye, 
  Thermometer, MapPin, RefreshCw, AlertCircle
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useLocationPermissionRequest } from '../common/PermissionManager';
import { weatherService, WeatherData } from '../../lib/weatherApi';

interface WeatherCardProps {
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, coordinates }) => {
  const { userLocation, getCurrentLocation, requestLocationPermission, locationPermission } = useLocation();
  const { requestLocationForContext } = useLocationPermissionRequest();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const fetchWeather = async (requestLocation = false) => {
    setError(null);
    
    try {
      let data: WeatherData;
      
      // Try to get user's current location if requested
      if (requestLocation) {
        console.log('🌍 User requested location access for weather');
        
        // Use the intelligent permission system
        requestLocationForContext({
          reason: 'accuracy_needed',
          feature: 'Accurate Weather Data',
          importance: 'high',
          benefits: [
            'Real-time weather for your exact location',
            'Precise temperature and conditions',
            'Location-specific weather alerts',
            'Better travel planning with hyperlocal forecasts'
          ]
        });
        
        if (locationPermission === 'denied') {
          console.log('❌ Location permission was denied, using fallback weather');
          // Don't show error, just use fallback with generic location
          data = await weatherService.getWeatherForecast('Current Location', 3);
          setWeatherData(data);
          return;
        }
        
        if (locationPermission === 'prompt' || locationPermission === 'unknown') {
          const permission = await requestLocationPermission();
          if (permission !== 'granted') {
            console.log('❌ Location permission not granted, using fallback weather');
            // Don't show error, just use fallback with generic location
            data = await weatherService.getWeatherForecast('Current Location', 3);
            setWeatherData(data);
            return;
          }
        }
        
        // Try to get current location
        await getCurrentLocation();
        
        // Wait a moment for location to be retrieved
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!userLocation) {
          console.log('⚠️ Could not get GPS location, using fallback weather');
          data = await weatherService.getWeatherForecast('Current Location', 3);
          setWeatherData(data);
          return;
        }
      }
      
      // Get weather data based on priority: coordinates > userLocation > location string > fallback
      if (coordinates) {
        console.log('🌍 Using provided coordinates for weather');
        data = await weatherService.getWeatherByCoordinates(
          coordinates.lat, 
          coordinates.lng, 
          3
        );
      } else if (userLocation && (requestLocation || locationPermission === 'granted')) {
        console.log('📍 Using user GPS location for weather');
        data = await weatherService.getWeatherByCoordinates(
          userLocation.latitude, 
          userLocation.longitude, 
          3
        );
      } else if (location) {
        console.log('🏙️ Using provided location string for weather');
        data = await weatherService.getWeatherForecast(location, 3);
      } else {
        console.log('🌐 Using fallback weather data');
        data = await weatherService.getWeatherForecast('Current Location', 3);
      }
      
      setWeatherData(data);
      console.log('✅ Weather data loaded successfully');
      
    } catch (error) {
      console.error('❌ Weather fetch error:', error);
      setError('Unable to load weather data');
      
      // Try fallback weather as last resort
      try {
        const fallbackData = await weatherService.getWeatherForecast('Current Location', 3);
        setWeatherData(fallbackData);
        setError(null);
        console.log('✅ Fallback weather data loaded');
      } catch (fallbackError) {
        console.error('❌ Fallback weather also failed:', fallbackError);
        setError('Weather service temporarily unavailable');
      }
    }
  };

  // Detect location changes and prompt user
  useEffect(() => {
    if (userLocation && weatherData) {
      // Check if user has moved significantly (>5km) since last weather update
      const lastWeatherLocation = weatherData.location.name.toLowerCase();
      const currentLocationString = `${userLocation.latitude.toFixed(2)},${userLocation.longitude.toFixed(2)}`;
      
      // Simple check - in a real app you'd want more sophisticated location comparison
      if (!lastWeatherLocation.includes('current location') && 
          !lastWeatherLocation.includes(currentLocationString)) {
        
        // Only show prompt if we haven't shown it recently
        const lastLocationPrompt = localStorage.getItem('weatherLocationPrompt');
        const now = Date.now();
        if (!lastLocationPrompt || (now - parseInt(lastLocationPrompt)) > 30 * 60 * 1000) { // 30 minutes
          setShowLocationPrompt(true);
          localStorage.setItem('weatherLocationPrompt', now.toString());
        }
      }
    }
  }, [userLocation, weatherData]);

  // Load weather on component mount
  useEffect(() => {
    fetchWeather();
  }, [location, coordinates]);

  // Helper function to get appropriate weather icon based on condition
  const getWeatherIcon = (condition: string, size: string = "w-8 h-8") => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      return <CloudRain className={`${size} text-blue-500`} />;
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return <Cloud className={`${size} text-gray-500`} />;
    }
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear') || lowerCondition.includes('bright')) {
      return <Sun className={`${size} text-yellow-500`} />;
    }
    
    // Default icon for unknown conditions
    return <Cloud className={`${size} text-gray-400`} />;
  };

  // Handle location update prompt
  const handleLocationUpdate = () => {
    setShowLocationPrompt(false);
    fetchWeather(true);
  };

  const dismissLocationPrompt = () => {
    setShowLocationPrompt(false);
  };

  // Handle refresh weather data
  const handleRefreshWeather = () => {
    fetchWeather(true);
  };

  if (error && !weatherData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
            Weather
          </h3>
          <button 
            onClick={handleRefreshWeather}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={() => fetchWeather()}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
            Weather
          </h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Loading weather...</p>
        </div>
      </div>
    );
  }

  const currentWeather = weatherData.current;
  const forecast = weatherData.forecast.slice(0, 3);

  return (
    <>
      <div className="kit-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
            Weather
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate max-w-20 sm:max-w-32">{weatherData.location.name}</span>
          </div>
        </div>

        {/* Current Weather */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <div className="text-3xl sm:text-4xl">
              {getWeatherIcon(currentWeather.condition.text, "w-12 h-12 sm:w-16 sm:h-16")}
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {Math.round(currentWeather.temperature)}°C
              </div>
              <div className="text-sm text-gray-600">
                {currentWeather.condition.text}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                Feels like {Math.round(currentWeather.feelsLike)}°C
              </div>
            </div>
          </div>
          
          <div className="text-right mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="text-sm text-gray-600 mb-1">
              {Math.round(forecast[0].maxTemp)}° / {Math.round(forecast[0].minTemp)}°
            </div>
            <div className="text-xs text-gray-500">
              High / Low
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-100">
          <div className="kit-glass rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Humidity</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {currentWeather.humidity}%
            </div>
          </div>
          
          <div className="kit-glass rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Wind</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {Math.round(currentWeather.windSpeed)} km/h
            </div>
          </div>
          
          <div className="kit-glass rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">Visibility</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {Math.round(currentWeather.visibility)} km
            </div>
          </div>
          
          <div className="kit-glass rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">Pressure</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {Math.round(currentWeather.pressure)} mb
            </div>
          </div>
        </div>

        {/* 3-Day Forecast */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">3-Day Forecast</h4>
          <div className="space-y-3">
            {forecast.slice(0, 3).map((day, index) => (
              <div key={index} className="kit-glass rounded-lg p-2 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="mr-2 sm:mr-3">
                      {getWeatherIcon(day.condition.text, "w-6 h-6 sm:w-8 sm:h-8")}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {index === 0 ? 'Today' : 
                         index === 1 ? 'Tomorrow' : 
                         new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {day.condition.text}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {Math.round(day.totalPrecip * 100)}% rain
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Change Prompt */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Location Changed?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              It looks like you might be in a different location. Would you like to update your weather information?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLocationUpdate}
                className="flex-1 bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
              >
                Update Weather
              </button>
              <button
                onClick={dismissLocationPrompt}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              >
                Keep Current
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherCard;