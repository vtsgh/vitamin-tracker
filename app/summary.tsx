import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VitaminPlan } from '../types/VitaminPlan';
import { scheduleVitaminReminders, formatDisplayTime } from '../utils/notifications';
import { SmartNotificationEngine } from '../utils/smart-notifications';
import { MAX_VITAMIN_PLANS } from '../constants/limits';
import VitaminCapsule from '../components/VitaminCapsule';
import { useSmartReminders } from '../hooks/useSmartReminders';
import { usePremium } from '../hooks/usePremium';
import { useTheme } from '@/contexts/ThemeContext';

export default function Summary() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency, endDate, customDays } = useLocalSearchParams<{ 
    vitamin: string; 
    dosageAmount: string;
    dosageUnit: string;
    dosageDisplay: string;
    reminderTime: string;
    frequency: string; 
    endDate: string; 
    customDays?: string 
  }>();

  const { settings, behaviorProfile, timingProfile } = useSmartReminders();
  const { isPremium } = usePremium();

  const handleBack = () => {
    router.back();
  };

  const handleFinish = async () => {
    try {
      // Parse the data from route params
      const planFrequency = (frequency as VitaminPlan['frequency']) || 'daily';
      const planCustomDays = customDays ? JSON.parse(customDays) : undefined;
      const planEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const planReminderTime = reminderTime || '09:00';
      const vitaminName = vitamin || 'Unknown Vitamin';

      // Create the complete vitamin plan first
      const now = new Date();
      const createdDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const vitaminPlan: VitaminPlan = {
        id: Date.now().toString(),
        vitamin: vitaminName,
        dosage: dosageAmount && dosageUnit && dosageDisplay ? {
          amount: parseFloat(dosageAmount),
          unit: dosageUnit,
          displayText: dosageDisplay
        } : undefined,
        frequency: planFrequency,
        endDate: planEndDate,
        customDays: planCustomDays,
        reminderTime: planReminderTime,
        notificationIds: [], // Will be updated after scheduling
        createdDate: createdDate, // Today's date in YYYY-MM-DD format
      };

      // Schedule comprehensive notification reminders with smart features
      console.log('🔔 Scheduling notifications for:', vitaminName);
      console.log('📋 Plan details:', { frequency: planFrequency, time: planReminderTime, endDate: planEndDate });
      console.log('🧠 Smart features enabled:', settings.enabled);
      
      let notificationIds: string[] = [];
      let smartResult = null;

      // Use smart notification system if enabled, otherwise fall back to basic
      if (isPremium && settings.enabled) {
        console.log('🧠 Using smart notification system');
        smartResult = await SmartNotificationEngine.scheduleSmartReminders(
          vitaminPlan,
          settings,
          behaviorProfile,
          timingProfile
        );
        notificationIds = smartResult.scheduledIds;
        
        // Log smart features used
        if (smartResult.adaptedFromOriginal) {
          console.log(`✨ Smart timing applied: ${smartResult.reason}`);
          console.log(`🕐 Optimized from ${planReminderTime} to ${smartResult.recommendedTime}`);
        }
      } else {
        console.log('📱 Using basic notification system');
        notificationIds = await scheduleVitaminReminders(vitaminPlan);
      }

      if (notificationIds && notificationIds.length > 0) {
        console.log(`✅ Successfully scheduled ${notificationIds.length} notifications`);
        vitaminPlan.notificationIds = notificationIds;
        
        // If smart timing was used, update the reminder time in the plan
        if (smartResult?.recommendedTime && smartResult.adaptedFromOriginal) {
          vitaminPlan.reminderTime = smartResult.recommendedTime;
        }
      } else {
        console.log('⚠️ Failed to schedule notifications, but continuing with plan creation');
      }

      // Get existing plans
      const existingPlansJson = await AsyncStorage.getItem('vitaminPlans');
      const existingPlans: VitaminPlan[] = existingPlansJson ? JSON.parse(existingPlansJson) : [];

      // Check if user has reached the plan limit
      if (existingPlans.length >= MAX_VITAMIN_PLANS) {
        console.log(`❌ Plan limit reached: ${existingPlans.length}/${MAX_VITAMIN_PLANS}`);
        Alert.alert(
          'Plan Limit Reached',
          `You can only have up to ${MAX_VITAMIN_PLANS} vitamin plans. Please delete an existing plan to create a new one.`,
          [
            {
              text: 'Go to My Plans',
              onPress: () => router.push('/schedule')
            },
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => router.back()
            }
          ]
        );
        return;
      }

      // Add new plan
      const updatedPlans = [...existingPlans, vitaminPlan];

      // Save to storage
      await AsyncStorage.setItem('vitaminPlans', JSON.stringify(updatedPlans));

      console.log('💾 Vitamin plan saved:', vitaminPlan);

      // Navigate to schedule screen to show the new plan
      router.push('/schedule');
    } catch (error) {
      console.error('❌ Error saving vitamin plan:', error);
    }
  };

  const formatFrequency = (freq: string, customDays?: string[]) => {
    switch (freq) {
      case 'daily':
        return 'Daily';
      case 'every-other-day':
        return 'Every other day';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return customDays && customDays.length > 0 
          ? `Custom (${customDays.length} days/week)`
          : 'Custom';
      default:
        return freq;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfect! 🌟</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Plan Summary</Text>
          <Text style={styles.summaryVitamin}>{vitamin}</Text>
          {dosageDisplay && (
            <View style={styles.summaryDosageContainer}>
              <VitaminCapsule size={16} style={styles.vitaminIcon} />
              <Text style={styles.summaryDosage}>{dosageDisplay}</Text>
            </View>
          )}
          <Text style={styles.summaryDetail}>
            {formatFrequency(frequency, customDays ? JSON.parse(customDays) : undefined)}
          </Text>
          <Text style={styles.summaryDetail}>
            Reminder at {formatDisplayTime(reminderTime || '09:00')}
          </Text>
          <Text style={styles.summaryDetail}>
            Until {new Date(endDate || '').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <Text style={styles.message}>
          Your vitamin plan is ready! We&apos;ll send you friendly reminders at your chosen time. You&apos;ve got this!
        </Text>
        
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Save My Plan</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  backButton: {
    backgroundColor: colors.border,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryVitamin: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryDosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  vitaminIcon: {
    marginRight: 6,
  },
  summaryDosage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryDetail: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  finishButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});}
