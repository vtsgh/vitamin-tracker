/**
 * Storage debugging utilities to investigate data mismatches
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VitaminPlan } from '../types/VitaminPlan';
import * as Notifications from 'expo-notifications';

export interface StorageDebugResult {
  totalPlans: number;
  plans: VitaminPlan[];
  planNotificationIds: string[];
  scheduledNotificationIds: string[];
  mismatches: {
    planId: string;
    vitaminName: string;
    planNotificationIds: string[];
    foundInSystem: string[];
    missingFromSystem: string[];
  }[];
}

/**
 * Debug storage and notification ID mismatches
 */
export async function debugStorageNotificationMismatch(): Promise<StorageDebugResult> {
  console.log('🔍 ============ STORAGE DEBUG STARTING ============');
  
  try {
    // Get all plans from storage
    const plansJson = await AsyncStorage.getItem('vitaminPlans');
    const plans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
    
    console.log(`📦 Found ${plans.length} plans in storage:`);
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.vitamin} (ID: ${plan.id})`);
      console.log(`     Notification IDs: ${JSON.stringify(plan.notificationIds || [])}`);
      console.log(`     Legacy ID: ${plan.notificationId || 'none'}`);
      console.log(`     Created: ${plan.createdDate || 'unknown'}`);
    });
    
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = scheduledNotifications.map(n => n.identifier);
    
    console.log(`📱 Found ${scheduledNotifications.length} scheduled notifications in system`);
    
    // Collect all notification IDs from plans
    const planNotificationIds: string[] = [];
    const mismatches: StorageDebugResult['mismatches'] = [];
    
    plans.forEach(plan => {
      const planIds: string[] = [];
      
      // New array format
      if (plan.notificationIds && plan.notificationIds.length > 0) {
        planIds.push(...plan.notificationIds);
      }
      
      // Legacy single ID
      if (plan.notificationId) {
        planIds.push(plan.notificationId);
      }
      
      planNotificationIds.push(...planIds);
      
      // Check which IDs exist in system
      const foundInSystem = planIds.filter(id => scheduledIds.includes(id));
      const missingFromSystem = planIds.filter(id => !scheduledIds.includes(id));
      
      if (planIds.length > 0) {
        mismatches.push({
          planId: plan.id,
          vitaminName: plan.vitamin,
          planNotificationIds: planIds,
          foundInSystem,
          missingFromSystem
        });
      }
    });
    
    // Log detailed mismatch analysis
    console.log('\n🔍 PLAN-TO-SYSTEM NOTIFICATION MAPPING:');
    mismatches.forEach((mismatch, index) => {
      console.log(`\n  ${index + 1}. ${mismatch.vitaminName} (Plan ID: ${mismatch.planId})`);
      console.log(`     Plan references: ${mismatch.planNotificationIds.length} notification IDs`);
      console.log(`     Found in system: ${mismatch.foundInSystem.length} (${mismatch.foundInSystem.join(', ') || 'none'})`);
      console.log(`     Missing from system: ${mismatch.missingFromSystem.length} (${mismatch.missingFromSystem.join(', ') || 'none'})`);
      
      if (mismatch.missingFromSystem.length > 0) {
        console.log(`     ⚠️ This plan has dead notification references!`);
      }
    });
    
    // Check for orphaned notifications (in system but not in any plan)
    const orphanedIds = scheduledIds.filter(id => !planNotificationIds.includes(id));
    console.log(`\n🚨 Orphaned notifications: ${orphanedIds.length}`);
    
    if (orphanedIds.length > 0) {
      console.log('🚨 Orphaned notification details:');
      scheduledNotifications
        .filter(n => orphanedIds.includes(n.identifier))
        .forEach((notification, index) => {
          const data = notification.content.data as any;
          console.log(`  ${index + 1}. ID: ${notification.identifier}`);
          console.log(`     Title: ${notification.content.title}`);
          console.log(`     Plan ID from data: ${data?.planId || 'unknown'}`);
          console.log(`     Vitamin from data: ${data?.vitaminName || 'unknown'}`);
        });
    }
    
    console.log('🔍 ============ STORAGE DEBUG COMPLETE ============\n');
    
    return {
      totalPlans: plans.length,
      plans,
      planNotificationIds,
      scheduledNotificationIds: scheduledIds,
      mismatches
    };
    
  } catch (error) {
    console.error('❌ Storage debug failed:', error);
    throw error;
  }
}

/**
 * Clean up plans with dead notification references
 */
export async function cleanDeadNotificationReferences(): Promise<number> {
  console.log('🧹 ============ CLEANING DEAD NOTIFICATION REFERENCES ============');
  
  try {
    const debug = await debugStorageNotificationMismatch();
    const scheduledIds = new Set(debug.scheduledNotificationIds);
    
    let updatedPlans = 0;
    const cleanedPlans: VitaminPlan[] = [];
    
    for (const plan of debug.plans) {
      let needsUpdate = false;
      const cleanedPlan = { ...plan };
      
      // Clean notificationIds array
      if (plan.notificationIds && plan.notificationIds.length > 0) {
        const validIds = plan.notificationIds.filter(id => scheduledIds.has(id));
        if (validIds.length !== plan.notificationIds.length) {
          console.log(`🧹 Cleaning ${plan.vitamin}: ${plan.notificationIds.length} → ${validIds.length} notification IDs`);
          cleanedPlan.notificationIds = validIds;
          needsUpdate = true;
        }
      }
      
      // Clean legacy notificationId
      if (plan.notificationId && !scheduledIds.has(plan.notificationId)) {
        console.log(`🧹 Removing dead legacy notification ID from ${plan.vitamin}`);
        cleanedPlan.notificationId = undefined;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        updatedPlans++;
      }
      
      cleanedPlans.push(cleanedPlan);
    }
    
    if (updatedPlans > 0) {
      await AsyncStorage.setItem('vitaminPlans', JSON.stringify(cleanedPlans));
      console.log(`✅ Updated ${updatedPlans} plans with cleaned notification references`);
    } else {
      console.log('✨ No dead notification references found in plans');
    }
    
    console.log('🧹 ============ CLEANUP COMPLETE ============\n');
    return updatedPlans;
    
  } catch (error) {
    console.error('❌ Dead reference cleanup failed:', error);
    throw error;
  }
}

/**
 * Show current storage state in an alert
 */
export async function showStorageDebugAlert(): Promise<void> {
  try {
    const debug = await debugStorageNotificationMismatch();
    
    const orphanedCount = debug.scheduledNotificationIds.length - debug.planNotificationIds.length;
    const deadReferences = debug.mismatches.reduce((sum, m) => sum + m.missingFromSystem.length, 0);
    
    const message = `Plans in storage: ${debug.totalPlans}
Notification IDs in plans: ${debug.planNotificationIds.length}
Scheduled notifications: ${debug.scheduledNotificationIds.length}
Orphaned notifications: ${orphanedCount}
Dead references in plans: ${deadReferences}

${orphanedCount > 0 ? '⚠️ System has orphaned notifications!' : '✅ No orphaned notifications'}
${deadReferences > 0 ? '⚠️ Plans have dead references!' : '✅ All plan references are valid'}`;
    
    const { Alert } = require('react-native');
    Alert.alert('📊 Storage Debug Results', message);
    
  } catch (error) {
    const { Alert } = require('react-native');
    Alert.alert('❌ Debug Error', `Failed to debug storage: ${(error as Error).message}`);
  }
}