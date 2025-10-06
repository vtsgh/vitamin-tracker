/**
 * Comprehensive Notification Debugging & Testing Suite
 * Use this to diagnose and fix notification issues
 */

import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VitaminPlan } from '../types/VitaminPlan';

export interface NotificationAuditResult {
  totalScheduled: number;
  validPlans: VitaminPlan[];
  orphanedNotifications: Notifications.NotificationRequest[];
  missingNotifications: VitaminPlan[];
  duplicateNotifications: { planId: string; notificationIds: string[] }[];
  summary: string;
}

/**
 * COMPREHENSIVE NOTIFICATION AUDIT
 * Checks for orphaned notifications, missing notifications, and inconsistencies
 */
export async function auditNotifications(): Promise<NotificationAuditResult> {
  console.log('🔍 ============ NOTIFICATION AUDIT STARTING ============');
  
  try {
    // Step 1: Get all scheduled notifications from system
    const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📱 System has ${allScheduledNotifications.length} scheduled notifications`);
    
    // Step 2: Get all vitamin plans from storage
    const plansJson = await AsyncStorage.getItem('vitaminPlans');
    const validPlans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
    console.log(`💊 Storage has ${validPlans.length} vitamin plans`);
    
    // Step 3: Create sets for comparison
    const systemNotificationIds = new Set(allScheduledNotifications.map(n => n.identifier));
    const planNotificationIds = new Set<string>();
    const planToNotificationMap = new Map<string, string[]>();
    
    // Collect all notification IDs from plans
    validPlans.forEach(plan => {
      const ids: string[] = [];
      
      // Handle new array format
      if (plan.notificationIds && plan.notificationIds.length > 0) {
        ids.push(...plan.notificationIds);
      }
      
      // Handle legacy single ID format
      if (plan.notificationId) {
        ids.push(plan.notificationId);
      }
      
      ids.forEach(id => planNotificationIds.add(id));
      
      if (ids.length > 0) {
        planToNotificationMap.set(plan.id, ids);
      }
    });
    
    console.log(`🔗 Plans reference ${planNotificationIds.size} notification IDs`);
    
    // Step 4: Find orphaned notifications (in system but not in any plan)
    const orphanedNotifications = allScheduledNotifications.filter(notification => 
      !planNotificationIds.has(notification.identifier)
    );
    
    // Step 5: Find missing notifications (in plans but not in system)
    const missingNotificationIds = Array.from(planNotificationIds).filter(id => 
      !systemNotificationIds.has(id)
    );
    
    const missingNotifications = validPlans.filter(plan => {
      const planNotifications = planToNotificationMap.get(plan.id) || [];
      return planNotifications.some(id => !systemNotificationIds.has(id));
    });
    
    // Step 6: Find duplicate notifications (same plan has multiple notifications)
    const duplicateNotifications = Array.from(planToNotificationMap.entries())
      .filter(([, notificationIds]) => notificationIds.length > 1)
      .map(([planId, notificationIds]) => ({ planId, notificationIds }));
    
    // Step 7: Log detailed results
    console.log('\n🔍 ============ AUDIT RESULTS ============');
    console.log(`📊 Total scheduled notifications: ${allScheduledNotifications.length}`);
    console.log(`📊 Valid vitamin plans: ${validPlans.length}`);
    console.log(`🚨 Orphaned notifications: ${orphanedNotifications.length}`);
    console.log(`❌ Missing notifications: ${missingNotificationIds.length}`);
    console.log(`🔄 Duplicate notifications: ${duplicateNotifications.length}`);
    
    if (orphanedNotifications.length > 0) {
      console.log('\n🚨 ORPHANED NOTIFICATIONS (these should be cancelled):');
      orphanedNotifications.forEach((notification, index) => {
        console.log(`  ${index + 1}. ID: ${notification.identifier}`);
        console.log(`     Title: ${notification.content.title}`);
        console.log(`     Trigger: ${JSON.stringify(notification.trigger)}`);
        console.log(`     Data: ${JSON.stringify(notification.content.data)}`);
      });
    }
    
    if (missingNotificationIds.length > 0) {
      console.log('\n❌ MISSING NOTIFICATIONS (referenced in plans but not scheduled):');
      missingNotificationIds.forEach((id, index) => {
        const plan = validPlans.find(p => 
          (p.notificationIds && p.notificationIds.includes(id)) ||
          p.notificationId === id
        );
        console.log(`  ${index + 1}. ID: ${id} (Plan: ${plan?.vitamin || 'Unknown'})`);
      });
    }
    
    if (duplicateNotifications.length > 0) {
      console.log('\n🔄 DUPLICATE NOTIFICATIONS:');
      duplicateNotifications.forEach(({ planId, notificationIds }, index) => {
        const plan = validPlans.find(p => p.id === planId);
        console.log(`  ${index + 1}. Plan: ${plan?.vitamin || 'Unknown'} (ID: ${planId})`);
        console.log(`     Notification IDs: ${notificationIds.join(', ')}`);
      });
    }
    
    // Generate summary
    const issues = [];
    if (orphanedNotifications.length > 0) issues.push(`${orphanedNotifications.length} orphaned`);
    if (missingNotificationIds.length > 0) issues.push(`${missingNotificationIds.length} missing`);
    if (duplicateNotifications.length > 0) issues.push(`${duplicateNotifications.length} duplicated`);
    
    const summary = issues.length > 0 
      ? `Issues found: ${issues.join(', ')}`
      : 'All notifications are properly synchronized!';
    
    console.log(`\n📋 SUMMARY: ${summary}`);
    console.log('🔍 ============ NOTIFICATION AUDIT COMPLETE ============\n');
    
    return {
      totalScheduled: allScheduledNotifications.length,
      validPlans,
      orphanedNotifications,
      missingNotifications,
      duplicateNotifications,
      summary
    };
    
  } catch (error) {
    console.error('❌ Notification audit failed:', error);
    throw error;
  }
}

/**
 * CLEAN UP ORPHANED NOTIFICATIONS
 * Removes notifications that don't belong to any current plans
 */
export async function cleanupOrphanedNotifications(): Promise<number> {
  console.log('🧹 ============ CLEANING ORPHANED NOTIFICATIONS ============');
  
  try {
    const audit = await auditNotifications();
    
    if (audit.orphanedNotifications.length === 0) {
      console.log('✨ No orphaned notifications found - system is clean!');
      return 0;
    }
    
    console.log(`🧹 Cleaning up ${audit.orphanedNotifications.length} orphaned notifications...`);
    
    for (const notification of audit.orphanedNotifications) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`✅ Cancelled orphaned notification: ${notification.identifier} (${notification.content.title})`);
      } catch (error) {
        console.error(`❌ Failed to cancel notification ${notification.identifier}:`, error);
      }
    }
    
    console.log('ℹ️ Note: In Expo Go, notification cancellation may not work reliably.');
    console.log('ℹ️ If notifications persist, delete and reinstall Expo Go app.');
    
    console.log(`🧹 Cleanup complete! Removed ${audit.orphanedNotifications.length} orphaned notifications`);
    console.log('🧹 ============ CLEANUP COMPLETE ============\n');
    
    return audit.orphanedNotifications.length;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * FULL NOTIFICATION SYSTEM RESET
 * Cancels ALL notifications and rebuilds from current plans
 */
export async function resetNotificationSystem(): Promise<void> {
  console.log('🔄 ============ RESETTING NOTIFICATION SYSTEM ============');
  
  try {
    // Step 1: Cancel all existing notifications
    console.log('🚫 Cancelling all existing notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Step 2: Get current plans
    const plansJson = await AsyncStorage.getItem('vitaminPlans');
    const validPlans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
    
    if (validPlans.length === 0) {
      console.log('💊 No vitamin plans found - reset complete');
      return;
    }
    
    console.log(`🔄 Rebuilding notifications for ${validPlans.length} plans...`);
    
    // Step 3: Import scheduling function
    const { scheduleVitaminReminders } = require('./notifications');
    
    // Step 4: Reschedule notifications for each plan
    const updatedPlans: VitaminPlan[] = [];
    
    for (const plan of validPlans) {
      try {
        console.log(`📅 Rescheduling notifications for ${plan.vitamin}...`);
        const newNotificationIds = await scheduleVitaminReminders(plan);
        
        const updatedPlan: VitaminPlan = {
          ...plan,
          notificationIds: newNotificationIds,
          // Clear legacy single ID
          notificationId: undefined
        };
        
        updatedPlans.push(updatedPlan);
        console.log(`✅ Scheduled ${newNotificationIds.length} notifications for ${plan.vitamin}`);
        
      } catch (error) {
        console.error(`❌ Failed to schedule notifications for ${plan.vitamin}:`, error);
        updatedPlans.push(plan); // Keep original plan if scheduling fails
      }
    }
    
    // Step 5: Save updated plans
    await AsyncStorage.setItem('vitaminPlans', JSON.stringify(updatedPlans));
    
    console.log('🔄 ============ NOTIFICATION SYSTEM RESET COMPLETE ============\n');
    
  } catch (error) {
    console.error('❌ Notification system reset failed:', error);
    throw error;
  }
}

/**
 * INTERACTIVE NOTIFICATION TESTING
 * Shows alert with test options
 */
export async function showNotificationTestMenu(): Promise<void> {
  // Import here to avoid circular dependency
  const { debugStorageNotificationMismatch, showStorageDebugAlert } = require('./storage-debug');
  const { showCleanupMenu } = require('./notification-cleanup');
  
  Alert.alert(
    '🧪 Notification Testing',
    'Choose a test to run:',
    [
      {
        text: 'Quick Test (3s)',
        onPress: async () => {
          try {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: '🧪 Quick Test',
                body: 'This is a 3-second test notification!',
                sound: true,
                ...(Platform.OS === 'android' && { channelId: 'vitamin-reminders' }),
              },
              trigger: {
                type: 'timeInterval',
                seconds: 3
              } as Notifications.TimeIntervalTriggerInput
            });
            Alert.alert('✅ Success', `Test notification scheduled! ID: ${id}`);
          } catch (error) {
            Alert.alert('❌ Error', `Failed to schedule test: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Audit System',
        onPress: async () => {
          try {
            const audit = await auditNotifications();
            Alert.alert('📊 Audit Complete', audit.summary);
          } catch (error) {
            Alert.alert('❌ Error', `Audit failed: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Debug Storage',
        onPress: async () => {
          try {
            await debugStorageNotificationMismatch();
            await showStorageDebugAlert();
          } catch (error) {
            Alert.alert('❌ Error', `Storage debug failed: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Clean Orphaned',
        onPress: async () => {
          try {
            const cleaned = await cleanupOrphanedNotifications();
            Alert.alert('🧹 Cleanup Complete', `Removed ${cleaned} orphaned notifications`);
          } catch (error) {
            Alert.alert('❌ Error', `Cleanup failed: ${(error as Error).message}`);
          }
        }
      },
      {
        text: 'Advanced Cleanup',
        onPress: () => showCleanupMenu()
      },
      {
        text: 'Reset System',
        onPress: () => {
          Alert.alert(
            '⚠️ Confirm Reset',
            'This will cancel ALL notifications and rebuild them. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await resetNotificationSystem();
                    Alert.alert('🔄 Reset Complete', 'Notification system has been rebuilt');
                  } catch (error) {
                    Alert.alert('❌ Error', `Reset failed: ${(error as Error).message}`);
                  }
                }
              }
            ]
          );
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
}

/**
 * GET NOTIFICATION SYSTEM STATUS
 * Returns a summary of the current notification state
 */
export async function getNotificationStatus(): Promise<{
  hasPermissions: boolean;
  totalScheduled: number;
  totalPlans: number;
  hasIssues: boolean;
  summary: string;
}> {
  try {
    // Check permissions
    const permissions = await Notifications.getPermissionsAsync();
    const hasPermissions = permissions.status === 'granted';
    
    // Get counts
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const plansJson = await AsyncStorage.getItem('vitaminPlans');
    const plans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
    
    // Quick audit
    const audit = await auditNotifications();
    const hasIssues = audit.orphanedNotifications.length > 0 || 
                     audit.missingNotifications.length > 0;
    
    const summary = hasPermissions 
      ? (hasIssues ? 'System has issues - run audit' : 'System healthy')
      : 'Permissions not granted';
    
    return {
      hasPermissions,
      totalScheduled: allScheduled.length,
      totalPlans: plans.length,
      hasIssues,
      summary
    };
    
  } catch (error) {
    console.error('❌ Failed to get notification status:', error);
    return {
      hasPermissions: false,
      totalScheduled: 0,
      totalPlans: 0,
      hasIssues: true,
      summary: 'System error'
    };
  }
}