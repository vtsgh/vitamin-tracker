import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SmartReminderSettings {
  enabled: boolean;
  adaptiveTiming: boolean;
  behaviorLearning: boolean;
  locationReminders: boolean;
  multiChannel: boolean;
}

export interface NotificationBehaviorProfile {
  userId: string;
  responsePatterns: {
    timeOfDay: Record<string, number>; // hour -> response rate
    dayOfWeek: Record<string, number>; // day -> response rate
    consecutiveMisses: number;
    preferredDelay: number; // minutes user typically delays
  };
  doNotDisturbPeriods: Array<{
    start: string;
    end: string;
    recurring: 'daily' | 'weekdays' | 'weekends';
  }>;
  lastUpdated: string;
}

export interface SmartTimingProfile {
  userId: string;
  preferredTimeRanges: {
    morning: { start: string; end: string; };
    afternoon: { start: string; end: string; };
    evening: { start: string; end: string; };
  };
  sleepSchedule: { bedtime: string; wakeup: string; };
  mealTimes: { breakfast?: string; lunch?: string; dinner?: string; };
  workSchedule?: { start: string; end: string; };
  lastUpdated: string;
}

const SMART_REMINDERS_STORAGE_KEY = 'smartReminderSettings';
const BEHAVIOR_PROFILE_STORAGE_KEY = 'notificationBehaviorProfile';
const TIMING_PROFILE_STORAGE_KEY = 'smartTimingProfile';

const DEFAULT_SMART_REMINDER_SETTINGS: SmartReminderSettings = {
  enabled: false,
  adaptiveTiming: false,
  behaviorLearning: false,
  locationReminders: false,
  multiChannel: false,
};

const DEFAULT_BEHAVIOR_PROFILE: NotificationBehaviorProfile = {
  userId: 'default',
  responsePatterns: {
    timeOfDay: {},
    dayOfWeek: {},
    consecutiveMisses: 0,
    preferredDelay: 15, // default 15 minutes
  },
  doNotDisturbPeriods: [],
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_TIMING_PROFILE: SmartTimingProfile = {
  userId: 'default',
  preferredTimeRanges: {
    morning: { start: '06:00', end: '10:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening: { start: '18:00', end: '22:00' },
  },
  sleepSchedule: { bedtime: '22:00', wakeup: '07:00' },
  mealTimes: {},
  lastUpdated: new Date().toISOString(),
};

export const useSmartReminders = () => {
  const [settings, setSettings] = useState<SmartReminderSettings>(DEFAULT_SMART_REMINDER_SETTINGS);
  const [behaviorProfile, setBehaviorProfile] = useState<NotificationBehaviorProfile>(DEFAULT_BEHAVIOR_PROFILE);
  const [timingProfile, setTimingProfile] = useState<SmartTimingProfile>(DEFAULT_TIMING_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load all smart reminder data
  const loadSmartReminderData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load settings
      const settingsJson = await AsyncStorage.getItem(SMART_REMINDERS_STORAGE_KEY);
      if (settingsJson) {
        const loadedSettings = JSON.parse(settingsJson);
        setSettings({ ...DEFAULT_SMART_REMINDER_SETTINGS, ...loadedSettings });
      }

      // Load behavior profile
      const behaviorJson = await AsyncStorage.getItem(BEHAVIOR_PROFILE_STORAGE_KEY);
      if (behaviorJson) {
        const loadedBehavior = JSON.parse(behaviorJson);
        setBehaviorProfile({ ...DEFAULT_BEHAVIOR_PROFILE, ...loadedBehavior });
      }

      // Load timing profile
      const timingJson = await AsyncStorage.getItem(TIMING_PROFILE_STORAGE_KEY);
      if (timingJson) {
        const loadedTiming = JSON.parse(timingJson);
        setTimingProfile({ ...DEFAULT_TIMING_PROFILE, ...loadedTiming });
      }
    } catch (error) {
      console.error('Error loading smart reminder data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(async (newSettings: SmartReminderSettings) => {
    try {
      await AsyncStorage.setItem(SMART_REMINDERS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      console.log('✅ Smart reminder settings saved:', newSettings);
    } catch (error) {
      console.error('❌ Error saving smart reminder settings:', error);
      throw error;
    }
  }, []);

  // Save behavior profile
  const saveBehaviorProfile = useCallback(async (newProfile: NotificationBehaviorProfile) => {
    try {
      const updatedProfile = {
        ...newProfile,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(BEHAVIOR_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setBehaviorProfile(updatedProfile);
      console.log('✅ Behavior profile saved');
    } catch (error) {
      console.error('❌ Error saving behavior profile:', error);
      throw error;
    }
  }, []);

  // Save timing profile
  const saveTimingProfile = useCallback(async (newProfile: SmartTimingProfile) => {
    try {
      const updatedProfile = {
        ...newProfile,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(TIMING_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setTimingProfile(updatedProfile);
      console.log('✅ Timing profile saved');
    } catch (error) {
      console.error('❌ Error saving timing profile:', error);
      throw error;
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(async (key: keyof SmartReminderSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    
    // If disabling main feature, disable all sub-features
    if (key === 'enabled' && !value) {
      newSettings.adaptiveTiming = false;
      newSettings.behaviorLearning = false;
      newSettings.locationReminders = false;
      newSettings.multiChannel = false;
    }
    
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Record notification response for learning
  const recordNotificationResponse = useCallback(async (
    response: 'taken' | 'snoozed' | 'ignored',
    timestamp: Date = new Date()
  ) => {
    if (!settings.behaviorLearning) return;

    try {
      const hour = timestamp.getHours().toString();
      const dayOfWeek = timestamp.getDay().toString();
      
      const updatedProfile = {
        ...behaviorProfile,
        responsePatterns: {
          ...behaviorProfile.responsePatterns,
          timeOfDay: {
            ...behaviorProfile.responsePatterns.timeOfDay,
            [hour]: (behaviorProfile.responsePatterns.timeOfDay[hour] || 0) + (response === 'taken' ? 1 : -0.5),
          },
          dayOfWeek: {
            ...behaviorProfile.responsePatterns.dayOfWeek,
            [dayOfWeek]: (behaviorProfile.responsePatterns.dayOfWeek[dayOfWeek] || 0) + (response === 'taken' ? 1 : -0.5),
          },
          consecutiveMisses: response === 'taken' ? 0 : behaviorProfile.responsePatterns.consecutiveMisses + 1,
        },
      };

      await saveBehaviorProfile(updatedProfile);
      console.log(`📊 Recorded ${response} response for learning`);
    } catch (error) {
      console.error('Error recording notification response:', error);
    }
  }, [settings.behaviorLearning, behaviorProfile, saveBehaviorProfile]);

  // Get optimal reminder time based on learning
  const getOptimalReminderTime = useCallback((vitaminType: string, defaultTime: string): string => {
    if (!settings.adaptiveTiming || !settings.behaviorLearning) {
      return defaultTime;
    }

    // Find the hour with the highest response rate
    const timeOfDayRatings = behaviorProfile.responsePatterns.timeOfDay;
    const bestHour = Object.entries(timeOfDayRatings)
      .reduce((best, [hour, rating]) => {
        return rating > (timeOfDayRatings[best] || 0) ? hour : best;
      }, defaultTime.split(':')[0]);

    // Return optimized time (keeping minutes from default)
    const minutes = defaultTime.split(':')[1] || '00';
    return `${bestHour.padStart(2, '0')}:${minutes}`;
  }, [settings.adaptiveTiming, settings.behaviorLearning, behaviorProfile]);

  // Check if user is in do-not-disturb period
  const isInDoNotDisturbPeriod = useCallback((checkTime: Date = new Date()): boolean => {
    if (!settings.enabled) return false;

    const currentTime = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = checkTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    return behaviorProfile.doNotDisturbPeriods.some(period => {
      // Check if the recurring pattern matches
      let dayMatches = false;
      switch (period.recurring) {
        case 'daily':
          dayMatches = true;
          break;
        case 'weekdays':
          dayMatches = currentDay >= 1 && currentDay <= 5;
          break;
        case 'weekends':
          dayMatches = currentDay === 0 || currentDay === 6;
          break;
      }

      if (!dayMatches) return false;

      // Check if current time is within the period
      return currentTime >= period.start && currentTime <= period.end;
    });
  }, [settings.enabled, behaviorProfile.doNotDisturbPeriods]);

  // Get insights about user behavior for display
  const getBehaviorInsights = useCallback(() => {
    if (!settings.behaviorLearning) return null;

    const { timeOfDay, dayOfWeek } = behaviorProfile.responsePatterns;
    
    // Find best performing time and day
    const bestHour = Object.entries(timeOfDay)
      .reduce((best, [hour, rating]) => 
        rating > (timeOfDay[best] || -Infinity) ? hour : best, '9');
    
    const bestDay = Object.entries(dayOfWeek)
      .reduce((best, [day, rating]) => 
        rating > (dayOfWeek[best] || -Infinity) ? parseInt(day) : best, 1);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      bestHour: parseInt(bestHour),
      bestDay: dayNames[bestDay] || 'Monday',
      totalResponses: Object.values(timeOfDay).reduce((sum, rating) => sum + Math.max(0, rating), 0),
      consecutiveMisses: behaviorProfile.responsePatterns.consecutiveMisses,
    };
  }, [settings.behaviorLearning, behaviorProfile]);

  // Load data on hook initialization
  useEffect(() => {
    loadSmartReminderData();
  }, [loadSmartReminderData]);

  return {
    // Settings
    settings,
    updateSetting,
    saveSettings,
    
    // Profiles
    behaviorProfile,
    timingProfile,
    saveBehaviorProfile,
    saveTimingProfile,
    
    // Smart features
    recordNotificationResponse,
    getOptimalReminderTime,
    isInDoNotDisturbPeriod,
    getBehaviorInsights,
    
    // Utils
    isLoading,
    loadSmartReminderData,
  };
};