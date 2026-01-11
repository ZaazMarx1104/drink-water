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
    // For demo purposes, return mock weather if no API key
    if (!OPENWEATHER_API_KEY) {
      // Simulate weather based on time of day
      const hour = new Date().getHours();
      const isHot = hour >= 10 && hour <= 16;
      
      setWeather({
        temperature: isHot ? 28 + Math.random() * 8 : 18 + Math.random() * 6,
        humidity: 50 + Math.random() * 30,
        altitude: 100,
        uvIndex: isHot ? 6 + Math.random() * 4 : 2 + Math.random() * 3,
        city: 'Your City',
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
        temperature: Math.round(data.main.temp),
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
