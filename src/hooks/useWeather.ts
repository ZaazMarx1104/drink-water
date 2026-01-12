import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/lib/hydration';

const OPENWEATHER_API_KEY = ''; // User will need to add their own API key

interface GeoLocation {
  latitude: number;
  longitude: number;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    // For demo purposes without API key, return more accurate mock weather based on location
    if (!OPENWEATHER_API_KEY) {
      // Get current time for realistic temperature simulation
      const now = new Date();
      const hour = now.getHours();
      const month = now.getMonth(); // 0-11
      
      // Simulate seasonal variation (Northern Hemisphere assumed)
      const isSummer = month >= 4 && month <= 8;
      const baseTemp = isSummer ? 22 : 12;
      
      // Simulate daily temperature cycle (cooler at night, warmer midday)
      let dailyVariation = 0;
      if (hour >= 6 && hour < 12) {
        // Morning warming
        dailyVariation = ((hour - 6) / 6) * 8;
      } else if (hour >= 12 && hour < 18) {
        // Afternoon peak
        dailyVariation = 8 - ((hour - 12) / 6) * 4;
      } else if (hour >= 18 && hour < 22) {
        // Evening cooling
        dailyVariation = 4 - ((hour - 18) / 4) * 4;
      } else {
        // Night (coldest)
        dailyVariation = -2;
      }
      
      const temperature = baseTemp + dailyVariation;
      
      setWeather({
        temperature: Math.round(temperature * 10) / 10, // One decimal place
        humidity: 50 + Math.random() * 20, // 50-70% humidity
        altitude: 100,
        uvIndex: hour >= 10 && hour <= 16 ? 5 + Math.random() * 3 : 1 + Math.random() * 2,
        city: 'Your Location',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();

      setWeather({
        temperature: Math.round(data.main.temp * 10) / 10, // One decimal place
        humidity: data.main.humidity,
        altitude: 0, // OpenWeather doesn't provide altitude
        uvIndex: 5, // Would need UV index API
        city: data.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      
      // Fallback to demo data
      setWeather({
        temperature: 25,
        humidity: 60,
        altitude: 100,
        uvIndex: 5,
        city: 'Unknown',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchWeather(latitude, longitude);
          resolve(true);
        },
        (error) => {
          setError(error.message);
          // Still provide demo weather
          fetchWeather(0, 0);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, [fetchWeather]);

  const refreshWeather = useCallback(() => {
    if (location) {
      fetchWeather(location.latitude, location.longitude);
    } else {
      requestLocation();
    }
  }, [location, fetchWeather, requestLocation]);

  return {
    weather,
    loading,
    error,
    location,
    requestLocation,
    refreshWeather,
  };
}
