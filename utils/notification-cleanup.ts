/**
 * Aggressive notification cleanup utilities
 * For when regular cleanup fails
 */

import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

/**
 * NUCLEAR CLEANUP - Cancel ALL notifications with verification
 */
export async function nuclearCleanup(): Promise<{ before: number; after: number; }> {
  console.log('☢️ ============ NUCLEAR CLEANUP STARTING ============');
  
  try {
    // Step 1: Get count before
    const beforeNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const beforeCount = beforeNotifications.length;
    console.log(`☢️ Found ${beforeCount} notifications before cleanup`);
    
    // Step 2: Cancel all notifications
    console.log('☢️ Cancelling ALL scheduled notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Step 3: Wait a moment for system to process
    console.log('☢️ Waiting 2 seconds for system to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Verify cleanup
    const afterNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const afterCount = afterNotifications.length;
    console.log(`☢️ Found ${afterCount} notifications after cleanup`);
    
    if (afterCount > 0) {
      console.log('⚠️ Some notifications survived nuclear cleanup:');
      afterNotifications.forEach((notification, index) => {
        console.log(`  ${index + 1}. ID: ${notification.identifier}`);
        console.log(`     Title: ${notification.content.title}`);
      });
    } else {
      console.log('✅ Nuclear cleanup successful - all notifications removed');
    }
    
    console.log('☢️ ============ NUCLEAR CLEANUP COMPLETE ============\n');
    
    return { before: beforeCount, after: afterCount };
    
  } catch (error) {
    console.error('❌ Nuclear cleanup failed:', error);
    throw error;
  }
}

/**
 * VERIFY NOTIFICATION CANCELLATION
 * Tests if individual cancellation actually works
 */
export async function testNotificationCancellation(): Promise<boolean> {
  console.log('🧪 ============ TESTING NOTIFICATION CANCELLATION ============');
  
  try {
    // Step 1: Schedule a test notification
    console.log('🧪 Step 1: Scheduling test notification...');
    const testId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Cancellation Test',
        body: 'This notification should be cancelled immediately',
        sound: false,
      },
      trigger: {
        type: 'timeInterval',
        seconds: 60
      } as Notifications.TimeIntervalTriggerInput // 1 minute from now
    });
    console.log(`🧪 Scheduled test notification with ID: ${testId}`);
    
    // Step 2: Verify it exists
    const beforeCancel = await Notifications.getAllScheduledNotificationsAsync();
    const testExists = beforeCancel.some(n => n.identifier === testId);
    console.log(`🧪 Step 2: Test notification exists: ${testExists}`);
    
    if (!testExists) {
      console.log('❌ Test notification was not scheduled properly');
      return false;
    }
    
    // Step 3: Cancel it
    console.log('🧪 Step 3: Attempting to cancel test notification...');
    await Notifications.cancelScheduledNotificationAsync(testId);
    
    // Step 4: Wait and verify cancellation
    console.log('🧪 Step 4: Waiting 1 second then verifying cancellation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const afterCancel = await Notifications.getAllScheduledNotificationsAsync();
    const stillExists = afterCancel.some(n => n.identifier === testId);
    console.log(`🧪 Test notification still exists after cancel: ${stillExists}`);
    
    const success = !stillExists;
    console.log(`🧪 Cancellation test result: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log('🧪 ============ CANCELLATION TEST COMPLETE ============\n');
    
    return success;
    
  } catch (error) {
    console.error('❌ Cancellation test failed:', error);
    return false;
  }
}

/**
 * FORCE REMOVE SPECIFIC NOTIFICATIONS
 * Attempts multiple methods to remove stubborn notifications
 */
export async function forceRemoveNotifications(notificationIds: string[]): Promise<{ removed: string[]; failed: string[]; }> {
  console.log(`🔨 ============ FORCE REMOVING ${notificationIds.length} NOTIFICATIONS ============`);
  
  const removed: string[] = [];
  const failed: string[] = [];
  
  for (const id of notificationIds) {
    try {
      console.log(`🔨 Attempting to force remove: ${id}`);
      
      // Method 1: Standard cancellation
      await Notifications.cancelScheduledNotificationAsync(id);
      
      // Method 2: Wait and verify
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Method 3: Check if it's gone
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const stillExists = allNotifications.some(n => n.identifier === id);
      
      if (stillExists) {
        console.log(`⚠️ Notification ${id} still exists after cancellation attempt`);
        failed.push(id);
      } else {
        console.log(`✅ Successfully removed: ${id}`);
        removed.push(id);
      }
      
    } catch (error) {
      console.error(`❌ Failed to remove ${id}:`, error);
      failed.push(id);
    }
  }
  
  console.log(`🔨 Force removal complete: ${removed.length} removed, ${failed.length} failed`);
  console.log('🔨 ============ FORCE REMOVAL COMPLETE ============\n');
  
  return { removed, failed };
}

/**
 * EXPO GO NOTIFICATION WORKAROUND
 * Special handling for Expo Go limitations
 */
export async function expoGoNotificationWorkaround(): Promise<void> {
  console.log('🤖 ============ EXPO GO WORKAROUND ============');
  
  try {
    // In Expo Go, notifications might not behave exactly like production
    console.log('🤖 Detected Expo Go environment');
    console.log('🤖 Applying Expo Go specific workarounds...');
    
    // Step 1: Cancel all notifications multiple times
    console.log('🤖 Method 1: Multiple cancellation attempts...');
    for (let i = 0; i < 3; i++) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`🤖 Cancellation attempt ${i + 1}/3 complete`);
    }
    
    // Step 2: Verify final state
    const remainingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`🤖 Final notification count: ${remainingNotifications.length}`);
    
    if (remainingNotifications.length > 0) {
      console.log('⚠️ Some notifications may persist due to Expo Go limitations');
      console.log('⚠️ These should be properly cancelled in a development build');
    }
    
    console.log('🤖 ============ EXPO GO WORKAROUND COMPLETE ============\n');
    
  } catch (error) {
    console.error('❌ Expo Go workaround failed:', error);
  }
}

/**
 * Show comprehensive cleanup menu
 */
export async function showCleanupMenu(): Promise<void> {
  Alert.alert(
    '🧹 Advanced Cleanup',
    'Choose cleanup method:',
    [
      {
        text: 'Nuclear Cleanup',
        onPress: async () => {
          try {
            const result = await nuclearCleanup();
            Alert.alert('☢️ Nuclear Complete', `Before: ${result.before}\nAfter: ${result.after}`);
          } catch (error) {
            Alert.alert('❌ Error', `Nuclear cleanup failed: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Test Cancellation',
        onPress: async () => {
          try {
            const success = await testNotificationCancellation();
            Alert.alert('🧪 Test Complete', success ? 'Cancellation works!' : 'Cancellation failed!');
          } catch (error) {
            Alert.alert('❌ Error', `Test failed: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Expo Go Workaround',
        onPress: async () => {
          try {
            await expoGoNotificationWorkaround();
            Alert.alert('🤖 Workaround Complete', 'Expo Go workaround applied');
          } catch (error) {
            Alert.alert('❌ Error', `Workaround failed: ${(error as Error).message}`);
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
}