import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  UserProfile, 
  WeatherData, 
  HydrationResult, 
  calculateHydration, 
  defaultProfile 
} from '@/lib/hydration';
import { Medication } from '@/components/MedicationsList';

interface HydrationLog {
  id: string;
  amount: number;
  timestamp: Date;
}

interface HydrationContextType {
  profile: UserProfile & { medicationsList?: Medication[] };
  setProfile: (profile: UserProfile & { medicationsList?: Medication[] }) => void;
  weather: WeatherData | null;
  setWeather: (weather: WeatherData | null) => void;
  hydrationResult: HydrationResult;
  todayLogs: HydrationLog[];
  totalConsumed: number;
  addWater: (amount: number) => { needsHourlyWarning: boolean; needsDailyWarning: boolean };
  removeLog: (id: string) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  weeklyData: { day: string; amount: number; target: number }[];
  lastHourIntake: number;
  checkWaterWarnings: (amount: number) => { hourly: boolean; daily: boolean };
  previousDayData: { consumed: number; target: number } | null;
  submitFeedback: (rating: number) => void;
  showMorningSurvey: boolean;
  setShowMorningSurvey: (show: boolean) => void;
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'drinkwater_profile',
  LOGS: 'drinkwater_logs',
  ONBOARDING: 'drinkwater_onboarding',
  WEEKLY: 'drinkwater_weekly',
  LAST_SURVEY_DATE: 'drinkwater_last_survey',
  PREVIOUS_DAY: 'drinkwater_previous_day',
};

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile & { medicationsList?: Medication[] }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [todayLogs, setTodayLogs] = useState<HydrationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
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

  const [previousDayData, setPreviousDayData] = useState<{ consumed: number; target: number } | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREVIOUS_DAY);
    return saved ? JSON.parse(saved) : null;
  });

  const [showMorningSurvey, setShowMorningSurvey] = useState(false);

  const totalConsumed = todayLogs.reduce((sum, log) => sum + log.amount, 0);

  const hydrationResult = calculateHydration(profile, weather, totalConsumed);

  // Calculate last hour intake
  const lastHourIntake = todayLogs
    .filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      return logTime > oneHourAgo;
    })
    .reduce((sum, log) => sum + log.amount, 0);

  // Check if morning survey should be shown
  useEffect(() => {
    const lastSurveyDate = localStorage.getItem(STORAGE_KEYS.LAST_SURVEY_DATE);
    const today = new Date().toDateString();
    
    if (onboardingComplete && previousDayData && lastSurveyDate !== today) {
      // Show survey in the morning (between 5am and 11am)
      const hour = new Date().getHours();
      if (hour >= 5 && hour <= 11) {
        setShowMorningSurvey(true);
      }
    }
  }, [onboardingComplete, previousDayData]);

  // Save previous day data at midnight
  useEffect(() => {
    const checkNewDay = () => {
      const lastDateStr = localStorage.getItem('drinkwater_last_date');
      const today = new Date().toDateString();
      
      if (lastDateStr && lastDateStr !== today) {
        // New day - save yesterday's data
        setPreviousDayData({
          consumed: totalConsumed,
          target: hydrationResult.dailyTarget,
        });
        localStorage.setItem(STORAGE_KEYS.PREVIOUS_DAY, JSON.stringify({
          consumed: totalConsumed,
          target: hydrationResult.dailyTarget,
        }));
      }
      
      localStorage.setItem('drinkwater_last_date', today);
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [totalConsumed, hydrationResult.dailyTarget]);

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

  const setProfile = (newProfile: UserProfile & { medicationsList?: Medication[] }) => {
    setProfileState(newProfile);
  };

  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
  };

  const checkWaterWarnings = useCallback((amount: number): { hourly: boolean; daily: boolean } => {
    const newLastHourIntake = lastHourIntake + amount;
    const newTotalConsumed = totalConsumed + amount;
    const dailyThreshold = hydrationResult.dailyTarget * 1.5;

    return {
      hourly: newLastHourIntake > 1000,
      daily: newTotalConsumed > dailyThreshold,
    };
  }, [lastHourIntake, totalConsumed, hydrationResult.dailyTarget]);

  const addWater = useCallback((amount: number) => {
    const warnings = checkWaterWarnings(amount);
    
    const newLog: HydrationLog = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date(),
    };
    setTodayLogs(prev => [...prev, newLog]);

    return {
      needsHourlyWarning: warnings.hourly,
      needsDailyWarning: warnings.daily,
    };
  }, [checkWaterWarnings]);

  const removeLog = (id: string) => {
    setTodayLogs(prev => prev.filter(log => log.id !== id));
  };

  const submitFeedback = (rating: number) => {
    // Save the feedback (in a real app, this would sync to the backend)
    console.log('Feedback submitted:', { rating, ...previousDayData });
    localStorage.setItem(STORAGE_KEYS.LAST_SURVEY_DATE, new Date().toDateString());
    setShowMorningSurvey(false);
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
        lastHourIntake,
        checkWaterWarnings,
        previousDayData,
        submitFeedback,
        showMorningSurvey,
        setShowMorningSurvey,
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
