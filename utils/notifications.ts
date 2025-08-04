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
    
    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        type: 'calendar',
        hour,
        minute,
        repeats: true,
      },
    });
    notificationIds.push(id);

    console.log(`✅ Successfully scheduled ${notificationIds.length} notifications for ${plan.vitamin}`);
    return notificationIds;

  } catch (error) {
    console.error('❌ Error scheduling vitamin reminders:', error);
    return [];
  }
}

/**
 * Cancel multiple scheduled notifications
 */
export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      console.log('ℹ️ No notification IDs to cancel');
      return;
    }

    console.log(`🔔 Cancelling ${notificationIds.length} notifications`);
    
    for (const id of notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
        console.log(`✅ Cancelled notification: ${id}`);
      } catch (error) {
        console.error(`❌ Error cancelling notification ${id}:`, error);
      }
    }
    
    console.log(`✅ Finished cancelling ${notificationIds.length} notifications`);
  } catch (error) {
    console.error('❌ Error in cancelNotifications:', error);
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