import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  WeatherData, 
  HydrationResult, 
  calculateHydration, 
  defaultProfile 
} from '@/lib/hydration';

interface HydrationLog {
  id: string;
  amount: number;
  timestamp: Date;
}

interface HydrationContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  weather: WeatherData | null;
  setWeather: (weather: WeatherData | null) => void;
  hydrationResult: HydrationResult;
  todayLogs: HydrationLog[];
  totalConsumed: number;
  addWater: (amount: number) => void;
  removeLog: (id: string) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  weeklyData: { day: string; amount: number; target: number }[];
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'drinkwater_profile',
  LOGS: 'drinkwater_logs',
  ONBOARDING: 'drinkwater_onboarding',
  WEEKLY: 'drinkwater_weekly',
};

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [todayLogs, setTodayLogs] = useState<HydrationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      // Only return logs from today
      return parsed.filter((log: HydrationLog) => 
        new Date(log.timestamp).toDateString() === today
      );
    }
    return [];
  });

  const [onboardingComplete, setOnboardingCompleteState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
  });

  const [weeklyData, setWeeklyData] = useState<{ day: string; amount: number; target: number }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (saved) return JSON.parse(saved);
    
    // Generate last 7 days with random data for demo
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        day: days[date.getDay()],
        amount: i === 6 ? 0 : Math.floor(Math.random() * 1500) + 1000,
        target: 2000,
      };
    });
  });

  const totalConsumed = todayLogs.reduce((sum, log) => sum + log.amount, 0);

  const hydrationResult = calculateHydration(profile, weather, totalConsumed);

  // Update weekly data for today
  useEffect(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const todayDay = days[today.getDay()];
    
    setWeeklyData(prev => {
      const updated = [...prev];
      const todayIndex = updated.findIndex(d => d.day === todayDay);
      if (todayIndex !== -1) {
        updated[todayIndex] = {
          ...updated[todayIndex],
          amount: totalConsumed,
          target: hydrationResult.dailyTarget,
        };
      }
      return updated;
    });
  }, [totalConsumed, hydrationResult.dailyTarget]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(todayLogs));
  }, [todayLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, String(onboardingComplete));
  }, [onboardingComplete]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(weeklyData));
  }, [weeklyData]);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
  };

  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
  };

  const addWater = (amount: number) => {
    const newLog: HydrationLog = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date(),
    };
    setTodayLogs(prev => [...prev, newLog]);
  };

  const removeLog = (id: string) => {
    setTodayLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <HydrationContext.Provider
      value={{
        profile,
        setProfile,
        weather,
        setWeather,
        hydrationResult,
        todayLogs,
        totalConsumed,
        addWater,
        removeLog,
        onboardingComplete,
        setOnboardingComplete,
        weeklyData,
      }}
    >
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  const context = useContext(HydrationContext);
  if (context === undefined) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
}
