import React from 'react';
import { Weather } from '../../types';
import { 
  Cloud, CloudRain, CloudSnow, CloudSun, Sun, CloudLightning, Wind
} from 'lucide-react';

interface WeatherCardProps {
  weather: Weather;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun size={36} className="text-accent-500" />;
      case 'partly cloudy':
        return <CloudSun size={36} className="text-accent-500" />;
      case 'cloudy':
        return <Cloud size={36} className="text-gray-500" />;
      case 'rainy':
        return <CloudRain size={36} className="text-primary-500" />;
      case 'snowy':
        return <CloudSnow size={36} className="text-blue-300" />;
      case 'stormy':
        return <CloudLightning size={36} className="text-purple-500" />;
      case 'windy':
        return <Wind size={36} className="text-blue-400" />;
      default:
        return <CloudSun size={36} className="text-accent-500" />;
    }
  };

  return (
    <div className="card p-4 mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{weather.location}</h3>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
            <span className="ml-2 text-primary-100">{weather.condition}</span>
          </div>
          <div className="mt-2 text-sm text-primary-100">
            H: {weather.high}° L: {weather.low}°
          </div>
        </div>
        <div className="flex items-center justify-center rounded-full bg-white/20 p-2">
          {getWeatherIcon(weather.condition)}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;