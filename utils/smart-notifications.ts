import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { VitaminPlan } from '../types/VitaminPlan';
import { 
  VITAMIN_TIMING_RECOMMENDATIONS, 
  DEFAULT_TIMING_SUGGESTIONS, 
  ESCALATION_MESSAGES,
  LEARNING_THRESHOLDS,
  SMART_SNOOZE_OPTIONS 
} from '../constants/smart-reminders';
import { 
  SmartReminderSettings, 
  NotificationBehaviorProfile, 
  SmartTimingProfile 
} from '../hooks/useSmartReminders';

export interface SmartNotificationResult {
  scheduledIds: string[];
  recommendedTime?: string;
  adaptedFromOriginal: boolean;
  reason?: string;
}

export interface NotificationResponse {
  type: 'taken' | 'snoozed' | 'ignored';
  timestamp: Date;
  originalTime: string;
  actualTime?: string;
  snoozeMinutes?: number;
}

/**
 * Smart Notification Engine - Handles intelligent reminder scheduling
 */
export class SmartNotificationEngine {
  
  /**
   * Schedule smart reminders for a vitamin plan
   */
  static async scheduleSmartReminders(
    plan: VitaminPlan,
    settings: SmartReminderSettings,
    behaviorProfile?: NotificationBehaviorProfile,
    timingProfile?: SmartTimingProfile
  ): Promise<SmartNotificationResult> {
    try {
      console.log('🧠 Scheduling smart reminders for:', plan.vitamin);
      
      // Check permissions first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.error('❌ Notification permissions not granted');
        return { scheduledIds: [], adaptedFromOriginal: false };
      }

      const originalTime = plan.reminderTime || '09:00';
      let optimizedTime = originalTime;
      let adaptedFromOriginal = false;
      let reason = 'Using your selected time';

      // Apply smart timing if enabled
      if (settings.enabled) {
        const smartResult = this.calculateOptimalTime(
          plan.vitamin,
          originalTime,
          settings,
          behaviorProfile,
          timingProfile
        );
        
        optimizedTime = smartResult.recommendedTime;
        adaptedFromOriginal = smartResult.adapted;
        reason = smartResult.reason;
      }

      // Schedule notifications based on frequency
      const scheduledIds = await this.scheduleByFrequency(
        plan,
        optimizedTime,
        settings,
        behaviorProfile
      );

      console.log(`✅ Scheduled ${scheduledIds.length} smart notifications`);
      
      return {
        scheduledIds,
        recommendedTime: optimizedTime,
        adaptedFromOriginal,
        reason
      };

    } catch (error) {
      console.error('❌ Error scheduling smart reminders:', error);
      return { scheduledIds: [], adaptedFromOriginal: false };
    }
  }

  /**
   * Calculate optimal reminder time using AI logic
   */
  private static calculateOptimalTime(
    vitaminType: string,
    originalTime: string,
    settings: SmartReminderSettings,
    behaviorProfile?: NotificationBehaviorProfile,
    timingProfile?: SmartTimingProfile
  ): { recommendedTime: string; adapted: boolean; reason: string } {
    
    let recommendedTime = originalTime;
    let adapted = false;
    let reason = 'Using your selected time';

    // 1. Apply vitamin-specific timing recommendations
    if (settings.adaptiveTiming) {
      const vitaminId = this.getVitaminId(vitaminType);
      const vitaminRecommendation = VITAMIN_TIMING_RECOMMENDATIONS[vitaminId];
      
      if (vitaminRecommendation) {
        // Choose the closest optimal time to user's preference
        const userHour = parseInt(originalTime.split(':')[0]);
        const optimalTimes = vitaminRecommendation.optimalTimes;
        
        const closestOptimal = optimalTimes.reduce((closest, time) => {
          const timeHour = parseInt(time.split(':')[0]);
          const currentHour = parseInt(closest.split(':')[0]);
          
          return Math.abs(timeHour - userHour) < Math.abs(currentHour - userHour) 
            ? time : closest;
        }, optimalTimes[0]);

        if (closestOptimal !== originalTime) {
          recommendedTime = closestOptimal;
          adapted = true;
          reason = vitaminRecommendation.reason;
        }
      }
    }

    // 2. Apply behavioral learning if available
    if (settings.behaviorLearning && behaviorProfile) {
      const behaviorResult = this.applyBehavioralLearning(
        recommendedTime,
        behaviorProfile
      );
      
      if (behaviorResult.adapted) {
        recommendedTime = behaviorResult.time;
        adapted = true;
        reason = behaviorResult.reason;
      }
    }

    // 3. Apply timing profile preferences
    if (settings.adaptiveTiming && timingProfile) {
      const profileResult = this.applyTimingProfile(
        recommendedTime,
        timingProfile
      );
      
      if (profileResult.adapted) {
        recommendedTime = profileResult.time;
        adapted = true;
        reason = profileResult.reason;
      }
    }

    // 4. Avoid do-not-disturb periods
    if (behaviorProfile?.doNotDisturbPeriods.length) {
      const adjustedResult = this.avoidDoNotDisturbPeriods(
        recommendedTime,
        behaviorProfile.doNotDisturbPeriods
      );
      
      if (adjustedResult.adapted) {
        recommendedTime = adjustedResult.time;
        adapted = true;
        reason = adjustedResult.reason;
      }
    }

    return { recommendedTime, adapted, reason };
  }

  /**
   * Apply behavioral learning to optimize timing
   */
  private static applyBehavioralLearning(
    currentTime: string,
    behaviorProfile: NotificationBehaviorProfile
  ): { time: string; adapted: boolean; reason: string } {
    
    const { timeOfDay } = behaviorProfile.responsePatterns;
    const totalResponses = Object.values(timeOfDay).reduce((sum, rating) => sum + Math.max(0, rating), 0);
    
    // Need minimum data points before adapting
    if (totalResponses < LEARNING_THRESHOLDS.MIN_DATA_POINTS) {
      return { time: currentTime, adapted: false, reason: 'Not enough data for learning' };
    }

    // Find the hour with highest response rate
    const bestHour = Object.entries(timeOfDay)
      .filter(([_, rating]) => rating > 0)
      .reduce((best, [hour, rating]) => {
        const bestRating = timeOfDay[best] || 0;
        return rating > bestRating ? hour : best;
      }, currentTime.split(':')[0]);

    const currentHour = currentTime.split(':')[0];
    const currentMinutes = currentTime.split(':')[1];
    
    // Only adapt if the best hour is significantly better
    const currentRating = timeOfDay[currentHour] || 0;
    const bestRating = timeOfDay[bestHour] || 0;
    
    if (bestRating > currentRating * 1.5 && bestRating > LEARNING_THRESHOLDS.RESPONSE_RATE_THRESHOLD) {
      return {
        time: `${bestHour.padStart(2, '0')}:${currentMinutes}`,
        adapted: true,
        reason: `Learned that you respond better at ${parseInt(bestHour)}:${currentMinutes}`
      };
    }

    return { time: currentTime, adapted: false, reason: 'Current time is already optimal' };
  }

  /**
   * Apply user's timing profile preferences
   */
  private static applyTimingProfile(
    currentTime: string,
    timingProfile: SmartTimingProfile
  ): { time: string; adapted: boolean; reason: string } {
    
    const currentHour = parseInt(currentTime.split(':')[0]);
    const currentMinutes = currentTime.split(':')[1];
    
    // Check if current time falls within preferred ranges
    const { morning, afternoon, evening } = timingProfile.preferredTimeRanges;
    
    const isInMorning = currentHour >= parseInt(morning.start.split(':')[0]) && 
                      currentHour <= parseInt(morning.end.split(':')[0]);
    const isInAfternoon = currentHour >= parseInt(afternoon.start.split(':')[0]) && 
                         currentHour <= parseInt(afternoon.end.split(':')[0]);
    const isInEvening = currentHour >= parseInt(evening.start.split(':')[0]) && 
                       currentHour <= parseInt(evening.end.split(':')[0]);

    // If already in a preferred range, no adaptation needed
    if (isInMorning || isInAfternoon || isInEvening) {
      return { time: currentTime, adapted: false, reason: 'Already in preferred time range' };
    }

    // Find the closest preferred time range
    const ranges = [
      { name: 'morning', start: morning.start, end: morning.end },
      { name: 'afternoon', start: afternoon.start, end: afternoon.end },
      { name: 'evening', start: evening.start, end: evening.end }
    ];

    const closestRange = ranges.reduce((closest, range) => {
      const rangeStart = parseInt(range.start.split(':')[0]);
      const closestStart = parseInt(closest.start.split(':')[0]);
      
      return Math.abs(rangeStart - currentHour) < Math.abs(closestStart - currentHour) 
        ? range : closest;
    }, ranges[0]);

    // Suggest the start of the closest preferred range
    return {
      time: `${closestRange.start.split(':')[0].padStart(2, '0')}:${currentMinutes}`,
      adapted: true,
      reason: `Moved to your preferred ${closestRange.name} time range`
    };
  }

  /**
   * Avoid scheduling during do-not-disturb periods
   */
  private static avoidDoNotDisturbPeriods(
    currentTime: string,
    doNotDisturbPeriods: NotificationBehaviorProfile['doNotDisturbPeriods']
  ): { time: string; adapted: boolean; reason: string } {
    
    // Check if current time conflicts with any DND period
    const conflictingPeriod = doNotDisturbPeriods.find(period => {
      return currentTime >= period.start && currentTime <= period.end;
    });

    if (!conflictingPeriod) {
      return { time: currentTime, adapted: false, reason: 'No conflicts with quiet hours' };
    }

    // Move to just after the DND period ends
    const endHour = parseInt(conflictingPeriod.end.split(':')[0]);
    const endMinutes = conflictingPeriod.end.split(':')[1];
    const adjustedHour = (endHour + 1) % 24; // Add 1 hour buffer

    return {
      time: `${adjustedHour.toString().padStart(2, '0')}:${endMinutes}`,
      adapted: true,
      reason: `Moved to avoid your quiet hours (${conflictingPeriod.start}-${conflictingPeriod.end})`
    };
  }

  /**
   * Schedule notifications based on frequency with smart timing
   */
  private static async scheduleByFrequency(
    plan: VitaminPlan,
    optimizedTime: string,
    settings: SmartReminderSettings,
    behaviorProfile?: NotificationBehaviorProfile
  ): Promise<string[]> {
    
    const [hour, minute] = optimizedTime.split(':').map(Number);
    const notificationIds: string[] = [];

    // Get smart notification content
    const content = this.createSmartNotificationContent(
      plan,
      settings,
      behaviorProfile
    );

    switch (plan.frequency) {
      case 'daily':
        const dailyId = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: 'calendar',
            hour,
            minute,
            repeats: true,
          },
        });
        notificationIds.push(dailyId);
        break;

      case 'weekly':
        // Schedule for the same day of week
        const weeklyId = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: 'calendar',
            weekday: new Date().getDay() + 1, // 1-7 (Sunday = 1)
            hour,
            minute,
            repeats: true,
          },
        });
        notificationIds.push(weeklyId);
        break;

      case 'every-other-day':
        // Schedule multiple notifications with 48-hour intervals
        for (let i = 0; i < 7; i++) { // Schedule for next week
          const triggerDate = new Date();
          triggerDate.setDate(triggerDate.getDate() + (i * 2));
          triggerDate.setHours(hour, minute, 0, 0);

          const id = await Notifications.scheduleNotificationAsync({
            content,
            trigger: { date: triggerDate },
          });
          notificationIds.push(id);
        }
        break;

      case 'custom':
        if (plan.customDays) {
          // Schedule for specific days of the week
          for (const dayName of plan.customDays) {
            const weekday = this.dayNameToNumber(dayName);
            const customId = await Notifications.scheduleNotificationAsync({
              content,
              trigger: {
                type: 'calendar',
                weekday,
                hour,
                minute,
                repeats: true,
              },
            });
            notificationIds.push(customId);
          }
        }
        break;
    }

    return notificationIds;
  }

  /**
   * Create smart notification content with personalization
   */
  private static createSmartNotificationContent(
    plan: VitaminPlan,
    settings: SmartReminderSettings,
    behaviorProfile?: NotificationBehaviorProfile
  ): Notifications.NotificationContent {
    
    let title = '💊 Time for your vitamins!';
    let body = `Don't forget to take your ${plan.vitamin} today. You've got this! 🌟`;

    // Apply behavioral escalation if enabled
    if (settings.behaviorLearning && behaviorProfile) {
      const { consecutiveMisses } = behaviorProfile.responsePatterns;
      
      if (consecutiveMisses >= LEARNING_THRESHOLDS.CONSECUTIVE_MISS_THRESHOLD) {
        // Use more encouraging messages for users who've been missing doses
        const urgentMessages = ESCALATION_MESSAGES.urgent;
        body = urgentMessages[Math.floor(Math.random() * urgentMessages.length)]
          .replace('{vitamin}', plan.vitamin);
      } else if (consecutiveMisses > 0) {
        const encouragingMessages = ESCALATION_MESSAGES.encouraging;
        body = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
          .replace('{vitamin}', plan.vitamin);
      } else {
        const gentleMessages = ESCALATION_MESSAGES.gentle;
        body = gentleMessages[Math.floor(Math.random() * gentleMessages.length)]
          .replace('{vitamin}', plan.vitamin);
      }
    }

    return {
      title,
      body,
      sound: true,
      data: {
        vitaminName: plan.vitamin,
        planId: plan.id,
        type: 'smart-vitamin-reminder',
        originalTime: plan.reminderTime,
        smartFeatures: {
          adaptiveTiming: settings.adaptiveTiming,
          behaviorLearning: settings.behaviorLearning,
        }
      },
      ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
    };
  }

  /**
   * Record user response to notification for learning
   */
  static async recordNotificationResponse(
    planId: string,
    response: NotificationResponse
  ): Promise<void> {
    try {
      console.log(`📊 Recording ${response.type} response for plan ${planId}`);
      
      // This will be called from the progress tracking system
      // Store the response data for behavioral learning
      const responseData = {
        planId,
        ...response,
        timestamp: response.timestamp.toISOString(),
      };

      // Store in AsyncStorage for learning algorithm
      const storageKey = `notificationResponses_${planId}`;
      const existingResponses = await this.getStoredResponses(planId);
      const updatedResponses = [...existingResponses, responseData];
      
      // Keep only last 50 responses to prevent storage bloat
      const trimmedResponses = updatedResponses.slice(-50);
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(trimmedResponses));
      
      console.log('✅ Response recorded for learning');
    } catch (error) {
      console.error('❌ Error recording notification response:', error);
    }
  }

  /**
   * Get stored notification responses for a plan
   */
  private static async getStoredResponses(planId: string): Promise<any[]> {
    try {
      const storageKey = `notificationResponses_${planId}`;
      const responsesJson = await AsyncStorage.getItem(storageKey);
      return responsesJson ? JSON.parse(responsesJson) : [];
    } catch (error) {
      console.error('Error loading stored responses:', error);
      return [];
    }
  }

  /**
   * Generate smart snooze suggestions based on context
   */
  static generateSmartSnoozeOptions(
    currentTime: Date,
    behaviorProfile?: NotificationBehaviorProfile
  ): Array<{ minutes: number; label: string; emoji: string; reason?: string }> {
    
    const hour = currentTime.getHours();
    const suggestions = [];

    // Add quick options
    suggestions.push(SMART_SNOOZE_OPTIONS.QUICK);
    suggestions.push(SMART_SNOOZE_OPTIONS.SHORT);

    // Context-aware suggestions
    if (hour < 12) {
      // Morning - suggest after breakfast
      suggestions.push({
        ...SMART_SNOOZE_OPTIONS.MEDIUM,
        reason: 'After breakfast'
      });
    } else if (hour < 17) {
      // Afternoon - suggest after lunch
      suggestions.push({
        ...SMART_SNOOZE_OPTIONS.MEDIUM,
        reason: 'After lunch'
      });
    } else {
      // Evening - suggest after dinner
      suggestions.push({
        ...SMART_SNOOZE_OPTIONS.EVENING,
        reason: 'After dinner'
      });
    }

    // Add behavioral learning if available
    if (behaviorProfile) {
      const preferredDelay = behaviorProfile.responsePatterns.preferredDelay;
      if (preferredDelay > 0 && preferredDelay !== 15) {
        suggestions.push({
          minutes: preferredDelay,
          label: `${preferredDelay} minutes`,
          emoji: '🎯',
          reason: 'Your usual preference'
        });
      }
    }

    return suggestions.slice(0, 4); // Limit to 4 options
  }

  /**
   * Utility functions
   */
  private static getVitaminId(vitaminLabel: string): string {
    // Convert vitamin label back to ID for recommendations lookup
    const vitaminMap: Record<string, string> = {
      'Vitamin A': 'vitamin-a',
      'Vitamin B1 (Thiamine)': 'vitamin-b1',
      'Vitamin B2 (Riboflavin)': 'vitamin-b2',
      'Vitamin B3 (Niacin)': 'vitamin-b3',
      'Vitamin B6 (Pyridoxine)': 'vitamin-b6',
      'Vitamin B12 (Cobalamin)': 'vitamin-b12',
      'Vitamin C': 'vitamin-c',
      'Vitamin D': 'vitamin-d',
      'Vitamin E': 'vitamin-e',
      'Vitamin K': 'vitamin-k',
      'Folate (Folic Acid)': 'folate',
      'Biotin': 'biotin',
      'Calcium': 'calcium',
      'Iron': 'iron',
      'Magnesium': 'magnesium',
      'Zinc': 'zinc',
      'Omega-3 Fatty Acids': 'omega-3',
      'Multivitamin': 'multivitamin',
    };
    
    return vitaminMap[vitaminLabel] || 'multivitamin';
  }

  private static dayNameToNumber(dayName: string): number {
    const dayMap: Record<string, number> = {
      'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4,
      'Thursday': 5, 'Friday': 6, 'Saturday': 7
    };
    return dayMap[dayName] || 1;
  }
}

// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';