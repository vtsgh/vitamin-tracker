import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { VitaminPlan } from '../types/VitaminPlan';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * COMPREHENSIVE NOTIFICATION TEST - Logs everything to console
 */
export async function runNotificationTest(): Promise<void> {
  console.log('🧪 ============ NOTIFICATION TEST STARTING ============');
  
  try {
    // Step 1: Check permissions
    console.log('🧪 Step 1: Checking permissions...');
    const permissions = await Notifications.getPermissionsAsync();
    console.log('🧪 Permission result:', JSON.stringify(permissions, null, 2));
    
    if (permissions.status !== 'granted') {
      console.log('🧪 Requesting permissions...');
      const requestResult = await Notifications.requestPermissionsAsync();
      console.log('🧪 Permission request result:', JSON.stringify(requestResult, null, 2));
    }

    // Step 2: Platform info
    console.log('🧪 Step 2: Platform information...');
    console.log('🧪 Platform OS:', Platform.OS);
    console.log('🧪 Platform Version:', Platform.Version);

    // Step 3: Get current scheduled notifications
    console.log('🧪 Step 3: Checking existing scheduled notifications...');
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('🧪 Existing notifications count:', existingNotifications.length);

    // Step 4: Test immediate notification (3 seconds)
    console.log('🧪 Step 4: Scheduling immediate test notification (3 seconds)...');
    const immediateId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Immediate Test',
        body: 'This should appear in 3 seconds!',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
      },
      trigger: {
        seconds: 3,
      },
    });
    console.log('🧪 Immediate notification scheduled with ID:', immediateId);

    // Step 5: Test delayed notification (10 seconds)
    console.log('🧪 Step 5: Scheduling delayed test notification (10 seconds)...');
    const delayedId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Delayed Test',
        body: 'This should appear in 10 seconds!',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
      },
      trigger: {
        seconds: 10,
      },
    });
    console.log('🧪 Delayed notification scheduled with ID:', delayedId);

    // Step 6: Verify all notifications were scheduled
    console.log('🧪 Step 6: Verifying scheduled notifications...');
    const afterScheduling = await Notifications.getAllScheduledNotificationsAsync();
    console.log('🧪 Total notifications after scheduling:', afterScheduling.length);
    console.log('🧪 All scheduled notifications:');
    afterScheduling.forEach((notification, index) => {
      console.log(`🧪   ${index + 1}. ID: ${notification.identifier}`);
      console.log(`🧪      Title: ${notification.content.title}`);
      console.log(`🧪      Trigger: ${JSON.stringify(notification.trigger)}`);
    });

    console.log('🧪 ============ NOTIFICATION TEST COMPLETE ============');
    console.log('🧪 WATCH FOR NOTIFICATIONS IN THE NEXT 10 SECONDS');
    
  } catch (error) {
    console.error('🧪 ============ NOTIFICATION TEST FAILED ============');
    console.error('🧪 Error:', error);
    console.error('🧪 Error message:', error.message);
    console.error('🧪 Error stack:', error.stack);
  }
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log('📱 Current notification permission status:', existingStatus);

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📱 New notification permission status:', status);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('vitamin-reminders', {
        name: 'Vitamin Reminders',
        description: 'Daily reminders to take your vitamins',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF7F50',
      });
      console.log('📱 Android notification channel created');
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Parse time string to hour and minute numbers
 */
function parseTime(timeString: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  };
}

/**
 * EMERGENCY: Simple Android notification test
 * Bypasses all complex logic to test basic functionality
 */
export async function emergencyAndroidNotificationTest(): Promise<string | null> {
  if (Platform.OS !== 'android') {
    console.log('⚠️ This is Android-only test');
    return null;
  }

  try {
    console.log('🚨 ============ EMERGENCY ANDROID TEST ============');
    
    // Step 1: Basic permission check
    const permissions = await Notifications.getPermissionsAsync();
    console.log('🚨 Permissions:', JSON.stringify(permissions));
    
    // Step 2: Force create notification channel
    await Notifications.setNotificationChannelAsync('emergency-test', {
      name: 'Emergency Test',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: true,
    });
    console.log('🚨 Emergency channel created');

    // Step 3: Immediate notification (no scheduling)
    const id = await Notifications.presentNotificationAsync({
      title: '🚨 EMERGENCY TEST',
      body: 'This should appear IMMEDIATELY!',
      data: { emergency: true },
      android: {
        channelId: 'emergency-test',
        priority: 'max',
        sticky: false,
        autoCancel: true,
      },
    });
    
    console.log('🚨 Emergency notification presented:', id);
    console.log('🚨 ============ EMERGENCY TEST COMPLETE ============');
    return id;
    
  } catch (error) {
    console.error('🚨 Emergency test failed:', error);
    return null;
  }
}

/**
 * Simple test notification (for backward compatibility)
 */
export async function scheduleTestNotification(): Promise<string | null> {
  try {
    console.log('🧪 Scheduling simple test notification in 5 seconds...');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Simple Test',
        body: 'This is a simple test notification!',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
      },
      trigger: {
        seconds: 5,
      },
    });
    console.log('✅ Simple test notification scheduled with ID:', id);
    return id;
  } catch (error) {
    console.error('❌ Error scheduling simple test notification:', error);
    return null;
  }
}

/**
 * Schedule vitamin reminders (simplified for testing)
 */
/**
 * Android-specific notification scheduling
 * Separated from iOS to avoid breaking working iOS functionality
 */
async function scheduleAndroidNotifications(
  plan: VitaminPlan, 
  hour: number, 
  minute: number, 
  notificationContent: any
): Promise<string[]> {
  console.log('🤖 ============ ANDROID NOTIFICATION SCHEDULING ============');
  
  try {
    // Step 1: Ensure channel exists and is properly configured
    console.log('🤖 Step 1: Setting up Android notification channel...');
    await Notifications.setNotificationChannelAsync('vitamin-reminders', {
      name: 'Vitamin Reminders',
      description: 'Daily reminders to take your vitamins',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F50',
      sound: true,
      enableVibrate: true,
      showBadge: true,
    });
    console.log('✅ Android notification channel configured');

    // Step 2: Try different Android notification approaches
    const androidIds: string[] = [];
    
    // Approach 1: Simple test notification first (immediate)
    console.log('🤖 Step 2: Testing immediate notification...');
    try {
      const testId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Android Test',
          body: 'Testing Android notifications - you should see this now!',
          sound: true,
          channelId: 'vitamin-reminders',
          data: { test: true },
        },
        trigger: {
          seconds: 2,
        },
      });
      console.log(`🧪 Test notification scheduled: ${testId}`);
      androidIds.push(testId);
    } catch (error) {
      console.error('❌ Immediate test notification failed:', error);
    }

    // Approach 2: Schedule a few timeInterval notifications
    console.log('🤖 Step 3: Scheduling timeInterval notifications...');
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hour, minute, 0, 0);
    
    // If target time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    for (let i = 0; i < 7; i++) { // Schedule for next 7 days
      try {
        const notifyTime = new Date(targetTime);
        notifyTime.setDate(notifyTime.getDate() + i);
        const secondsUntil = Math.floor((notifyTime.getTime() - now.getTime()) / 1000);
        
        if (secondsUntil > 0) {
          const dayId = await Notifications.scheduleNotificationAsync({
            content: {
              ...notificationContent,
              channelId: 'vitamin-reminders',
            },
            trigger: {
              seconds: secondsUntil,
            },
          });
          
          console.log(`📅 Scheduled day ${i + 1} notification: ${dayId} (in ${secondsUntil}s)`);
          androidIds.push(dayId);
        }
      } catch (error) {
        console.error(`❌ Failed to schedule day ${i + 1}:`, error);
      }
    }

    // Step 3: Verify notifications were scheduled (work around expo-notifications bug)
    console.log('🤖 Step 4: Verifying scheduled notifications...');
    
    // Note: getAllScheduledNotificationsAsync() has a known bug in expo-notifications > 0.28.12
    // It returns empty array even when notifications are properly scheduled
    // See: https://github.com/expo/expo/issues/30868
    
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`🔍 Total notifications in system: ${allScheduled.length} (may be inaccurate due to expo-notifications bug)`);
      
      if (allScheduled.length > 0) {
        const ourNotifications = allScheduled.filter(n => androidIds.includes(n.identifier));
        console.log(`🔍 Our notifications found: ${ourNotifications.length}/${androidIds.length}`);
        
        ourNotifications.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.identifier} - ${notification.content.title}`);
        });
      }
    } catch (error) {
      console.error('⚠️ getAllScheduledNotificationsAsync failed:', error);
    }
    
    // Alternative verification: If we got notification IDs back, assume they were scheduled
    if (androidIds.length > 0) {
      console.log('✅ Android notifications scheduled successfully!');
      console.log(`📱 Scheduled ${androidIds.length} notifications with IDs:`);
      androidIds.forEach((id, index) => {
        console.log(`  ${index + 1}. ${id}`);
      });
      console.log('⚠️  Note: Due to expo-notifications bug, verification may be inaccurate');
      console.log('📱 Test on physical device to see if notifications actually appear');
    } else {
      console.error('❌ No notification IDs returned - scheduling failed');
    }

    console.log('🤖 ============ ANDROID SCHEDULING COMPLETE ============');
    return androidIds;

  } catch (error) {
    console.error('❌ Android notification scheduling failed:', error);
    return [];
  }
}

export async function scheduleVitaminReminders(plan: VitaminPlan): Promise<string[]> {
  try {
    console.log('🔔 Scheduling notifications for:', plan.vitamin);
    
    // Check permissions first
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.error('❌ Notification permissions not granted. Current status:', status);
      return [];
    }

    const { hour, minute } = parseTime(plan.reminderTime);
    const notificationIds: string[] = [];

    // Create notification content
    const notificationContent = {
      title: '💊 Time for your vitamins!',
      body: `Don't forget to take your ${plan.vitamin} today. You've got this! 🌟`,
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
      data: {
        vitaminName: plan.vitamin,
        planId: plan.id,
        type: 'vitamin-reminder',
      },
    };

    // For now, just schedule a simple repeating daily notification
    console.log(`📅 Scheduling daily repeating notification at ${hour}:${minute.toString().padStart(2, '0')}`);
    
    let trigger;
    
    if (Platform.OS === 'ios') {
      // iOS: Use calendar trigger for exact time  
      trigger = {
        type: 'calendar',
        hour,
        minute,
        repeats: true,
      };
    } else {
      // Android: Use separate notification handler
      return await scheduleAndroidNotifications(plan, hour, minute, notificationContent);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });
    notificationIds.push(id);

    // Verify the notification was actually scheduled
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const justScheduled = allScheduled.find(n => n.identifier === id);
    
    console.log(`✅ Successfully scheduled notification with ID: ${id}`);
    console.log(`🔍 Verification: Notification exists in system: ${!!justScheduled}`);
    if (justScheduled) {
      console.log(`🔍 Trigger details: ${JSON.stringify(justScheduled.trigger)}`);
    }
    console.log(`🔍 Total system notifications: ${allScheduled.length}`);
    return notificationIds;

  } catch (error) {
    console.error('❌ Error scheduling vitamin reminders:', error);
    return [];
  }
}

/**
 * Cancel multiple scheduled notifications
 */
export async function cancelNotifications(notificationIds: string[]): Promise<{ cancelled: number; failed: number; }> {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      console.log('ℹ️ No notification IDs to cancel');
      return { cancelled: 0, failed: 0 };
    }

    console.log(`🔔 Attempting to cancel ${notificationIds.length} notifications`);
    
    // First, get all currently scheduled notifications to verify which ones exist
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(allScheduled.map(n => n.identifier));
    
    let cancelled = 0;
    let failed = 0;
    
    for (const id of notificationIds) {
      try {
        if (scheduledIds.has(id)) {
          await Notifications.cancelScheduledNotificationAsync(id);
          console.log(`✅ Cancelled notification: ${id}`);
          cancelled++;
        } else {
          console.log(`⚠️ Notification ${id} was already cancelled or doesn't exist`);
          // Still count as successful since the goal is achieved
          cancelled++;
        }
      } catch (error) {
        console.error(`❌ Error cancelling notification ${id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ Cancellation complete: ${cancelled} cancelled, ${failed} failed`);
    return { cancelled, failed };
  } catch (error) {
    console.error('❌ Error in cancelNotifications:', error);
    return { cancelled: 0, failed: notificationIds.length };
  }
}

/**
 * Cancel a single scheduled notification (for backward compatibility)
 */
export async function cancelNotification(notificationId: string): Promise<boolean> {
  try {
    await cancelNotifications([notificationId]);
    return true;
  } catch (error) {
    console.error('❌ Error cancelling single notification:', error);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Successfully cancelled all scheduled notifications');
    return true;
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
    return false;
  }
}

/**
 * Get all currently scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Format time for display (e.g., "09:30" -> "9:30 AM")
 */
export function formatDisplayTime(timeString: string): string {
  try {
    const { hour, minute } = parseTime(timeString);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    return timeString;
  }
}