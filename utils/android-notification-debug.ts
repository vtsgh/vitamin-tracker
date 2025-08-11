/**
 * Comprehensive Android Notification Debugging & Logging
 * Specifically designed to diagnose Android notification delivery issues
 */

import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification listener subscription
let notificationListener: Notifications.Subscription | null = null;
let responseListener: Notifications.Subscription | null = null;

/**
 * Enhanced notification logging system
 */
export class AndroidNotificationLogger {
  private static logs: string[] = [];
  private static maxLogs = 100;

  static log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Store in AsyncStorage for persistence
    AsyncStorage.setItem('androidNotificationLogs', JSON.stringify(this.logs)).catch(console.error);
  }

  static async getLogs(): Promise<string[]> {
    try {
      const storedLogs = await AsyncStorage.getItem('androidNotificationLogs');
      return storedLogs ? JSON.parse(storedLogs) : this.logs;
    } catch (error) {
      return this.logs;
    }
  }

  static clearLogs() {
    this.logs = [];
    AsyncStorage.removeItem('androidNotificationLogs').catch(console.error);
  }

  static getLogsAsString(): string {
    return this.logs.join('\n');
  }
}

/**
 * Start comprehensive notification monitoring
 */
export function startNotificationMonitoring() {
  if (Platform.OS !== 'android') {
    AndroidNotificationLogger.log('⚠️ Monitoring only available on Android');
    return;
  }

  AndroidNotificationLogger.log('🎯 Starting comprehensive notification monitoring...');

  // Listen for received notifications
  notificationListener = Notifications.addNotificationReceivedListener(notification => {
    AndroidNotificationLogger.log(`📨 NOTIFICATION RECEIVED!`);
    AndroidNotificationLogger.log(`   Title: ${notification.request.content.title}`);
    AndroidNotificationLogger.log(`   Body: ${notification.request.content.body}`);
    AndroidNotificationLogger.log(`   ID: ${notification.request.identifier}`);
    AndroidNotificationLogger.log(`   Data: ${JSON.stringify(notification.request.content.data)}`);
    AndroidNotificationLogger.log(`   Received at: ${new Date().toLocaleTimeString()}`);
  });

  // Listen for notification responses (taps)
  responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    AndroidNotificationLogger.log(`👆 NOTIFICATION TAPPED!`);
    AndroidNotificationLogger.log(`   Action: ${response.actionIdentifier}`);
    AndroidNotificationLogger.log(`   Title: ${response.notification.request.content.title}`);
    AndroidNotificationLogger.log(`   Response at: ${new Date().toLocaleTimeString()}`);
  });

  AndroidNotificationLogger.log('✅ Notification monitoring started');
}

/**
 * Stop notification monitoring
 */
export function stopNotificationMonitoring() {
  if (notificationListener) {
    notificationListener.remove();
    notificationListener = null;
  }
  
  if (responseListener) {
    responseListener.remove();
    responseListener = null;
  }
  
  AndroidNotificationLogger.log('🛑 Notification monitoring stopped');
}

/**
 * Create a debug vitamin plan with 2-minute delay
 */
export async function createDebugVitaminPlan(): Promise<{
  planId: string;
  scheduledTime: string;
  notificationIds: string[];
} | null> {
  try {
    AndroidNotificationLogger.log('🧪 ============ DEBUG VITAMIN PLAN CREATION ============');
    
    const now = new Date();
    const testTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
    const timeString = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
    
    AndroidNotificationLogger.log(`Current time: ${now.toLocaleTimeString()}`);
    AndroidNotificationLogger.log(`Scheduled time: ${testTime.toLocaleTimeString()} (${timeString})`);
    
    const planId = `debug-test-${Date.now()}`;
    const channelId = `debug-channel-${Date.now()}`;
    
    // Create unique notification channel
    await Notifications.setNotificationChannelAsync(channelId, {
      name: 'Debug Test Channel',
      description: 'Channel for debugging notification delivery',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: true,
      enableVibrate: true,
      showBadge: true,
    });
    AndroidNotificationLogger.log(`Created debug channel: ${channelId}`);
    
    // Schedule multiple notification approaches
    const notificationIds: string[] = [];
    
    // Approach 1: Immediate test notification (2 seconds)
    const immediateId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🧪 DEBUG TEST - Immediate`,
        body: `This should appear in 2 seconds! Time: ${now.toLocaleTimeString()}`,
        data: { 
          type: 'debug-immediate',
          planId,
          scheduledAt: now.toISOString(),
          expectedAt: new Date(now.getTime() + 2000).toISOString()
        },
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: {
        type: 'timeInterval',
        seconds: 2,
      } as Notifications.TimeIntervalTriggerInput,
    });
    notificationIds.push(immediateId);
    AndroidNotificationLogger.log(`Scheduled immediate test: ${immediateId}`);
    
    // Approach 2: 2-minute scheduled notification
    const delayedId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 DEBUG VITAMIN REMINDER`,
        body: `Time to take your debug vitamin! Scheduled for ${testTime.toLocaleTimeString()}`,
        data: { 
          type: 'debug-vitamin',
          planId,
          vitamin: 'Debug Test Vitamin',
          scheduledAt: now.toISOString(),
          expectedAt: testTime.toISOString()
        },
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: {
        type: 'timeInterval',
        seconds: 120, // 2 minutes
      } as Notifications.TimeIntervalTriggerInput,
    });
    notificationIds.push(delayedId);
    AndroidNotificationLogger.log(`Scheduled 2-minute test: ${delayedId}`);
    
    // Approach 3: Calendar-based notification for exact time
    try {
      const calendarId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📅 DEBUG CALENDAR TEST`,
          body: `Calendar-based notification for ${testTime.toLocaleTimeString()}`,
          data: { 
            type: 'debug-calendar',
            planId,
            scheduledAt: now.toISOString(),
            expectedAt: testTime.toISOString()
          },
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: {
          type: 'calendar',
          hour: testTime.getHours(),
          minute: testTime.getMinutes(),
        } as Notifications.CalendarTriggerInput,
      });
      notificationIds.push(calendarId);
      AndroidNotificationLogger.log(`Scheduled calendar test: ${calendarId}`);
    } catch (error) {
      AndroidNotificationLogger.log(`Calendar scheduling failed: ${error}`);
    }
    
    AndroidNotificationLogger.log(`Total notifications scheduled: ${notificationIds.length}`);
    AndroidNotificationLogger.log(`⏰ WATCH FOR NOTIFICATIONS:`);
    AndroidNotificationLogger.log(`   - Immediate: in 2 seconds`);
    AndroidNotificationLogger.log(`   - Vitamin: at ${testTime.toLocaleTimeString()}`);
    AndroidNotificationLogger.log('🧪 ============ DEBUG PLAN CREATION COMPLETE ============');
    
    return {
      planId,
      scheduledTime: timeString,
      notificationIds
    };
    
  } catch (error) {
    AndroidNotificationLogger.log(`Failed to create debug plan: ${error}`);
    return null;
  }
}

/**
 * Comprehensive Android notification system test
 */
export async function runComprehensiveAndroidTest(): Promise<void> {
  AndroidNotificationLogger.log('🔥 ============ COMPREHENSIVE ANDROID TEST ============');
  
  try {
    // Step 1: Check device information
    AndroidNotificationLogger.log(`Device OS: ${Platform.OS}`);
    AndroidNotificationLogger.log(`Platform Version: ${Platform.Version}`);
    
    // Step 2: Check permissions
    const permissions = await Notifications.getPermissionsAsync();
    AndroidNotificationLogger.log(`Permissions: ${JSON.stringify(permissions)}`);
    
    if (permissions.status !== 'granted') {
      AndroidNotificationLogger.log('Requesting permissions...');
      const requestResult = await Notifications.requestPermissionsAsync();
      AndroidNotificationLogger.log(`Permission request result: ${JSON.stringify(requestResult)}`);
    }
    
    // Step 3: Test immediate notification
    const immediateChannelId = `immediate-test-${Date.now()}`;
    await Notifications.setNotificationChannelAsync(immediateChannelId, {
      name: 'Immediate Test',
      importance: Notifications.AndroidImportance.MAX,
      sound: true,
      vibrationPattern: [0, 250, 250, 250],
    });
    
    const immediateId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 IMMEDIATE TEST',
        body: `This should appear in 3 seconds! ${new Date().toLocaleTimeString()}`,
        ...(Platform.OS === 'android' && { channelId: immediateChannelId }),
      },
      trigger: {
        type: 'timeInterval',
        seconds: 3,
      } as Notifications.TimeIntervalTriggerInput,
    });
    
    AndroidNotificationLogger.log(`Immediate test scheduled: ${immediateId}`);
    
    // Step 4: Check scheduled notifications (known to be unreliable)
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      AndroidNotificationLogger.log(`System reports ${allScheduled.length} scheduled notifications`);
      AndroidNotificationLogger.log('⚠️ Note: getAllScheduledNotificationsAsync has known bugs on Android');
    } catch (error) {
      AndroidNotificationLogger.log(`getAllScheduledNotificationsAsync failed: ${error}`);
    }
    
    AndroidNotificationLogger.log('🔥 ============ COMPREHENSIVE TEST COMPLETE ============');
    AndroidNotificationLogger.log('📱 WATCH YOUR NOTIFICATION PANEL FOR TEST NOTIFICATIONS');
    
  } catch (error) {
    AndroidNotificationLogger.log(`Comprehensive test failed: ${error}`);
  }
}

/**
 * Show debug logs in an alert
 */
export async function showDebugLogs(): Promise<void> {
  const logs = await AndroidNotificationLogger.getLogs();
  const recentLogs = logs.slice(-20); // Show last 20 logs
  
  Alert.alert(
    'Notification Debug Logs',
    recentLogs.length > 0 ? recentLogs.join('\n') : 'No logs available',
    [
      { text: 'Clear Logs', onPress: AndroidNotificationLogger.clearLogs },
      { text: 'Close', style: 'cancel' }
    ]
  );
}

/**
 * Check Android-specific notification settings and provide troubleshooting
 */
export async function checkAndroidNotificationHealth(): Promise<string[]> {
  const issues: string[] = [];
  
  try {
    AndroidNotificationLogger.log('🔍 Checking Android notification health...');
    
    // Check permissions
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      issues.push('Notification permissions not granted');
    }
    
    // Check if we can schedule notifications
    try {
      const testId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Health Check',
          body: 'Testing notification scheduling capability',
        },
        trigger: {
          type: 'timeInterval',
          seconds: 86400, // 24 hours (won't actually fire)
        } as Notifications.TimeIntervalTriggerInput,
      });
      
      // Cancel the test notification immediately
      await Notifications.cancelScheduledNotificationAsync(testId);
      AndroidNotificationLogger.log('✅ Notification scheduling works');
    } catch (error) {
      issues.push(`Cannot schedule notifications: ${error}`);
    }
    
    AndroidNotificationLogger.log(`Health check complete. Found ${issues.length} issues.`);
    
  } catch (error) {
    issues.push(`Health check failed: ${error}`);
  }
  
  return issues;
}