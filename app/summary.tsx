import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VitaminPlan } from '../types/VitaminPlan';
import { scheduleVitaminReminders, formatDisplayTime } from '../utils/notifications';
import { MAX_VITAMIN_PLANS } from '../constants/limits';

export default function Summary() {
  const { vitamin, reminderTime, frequency, endDate, customDays } = useLocalSearchParams<{ 
    vitamin: string; 
    reminderTime: string;
    frequency: string; 
    endDate: string; 
    customDays?: string 
  }>();

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
        frequency: planFrequency,
        endDate: planEndDate,
        customDays: planCustomDays,
        reminderTime: planReminderTime,
        notificationIds: [], // Will be updated after scheduling
        createdDate: createdDate, // Today's date in YYYY-MM-DD format
      };

      // Schedule comprehensive notification reminders
      console.log('🔔 Scheduling comprehensive notifications for:', vitaminName);
      console.log('📋 Plan details:', { frequency: planFrequency, time: planReminderTime, endDate: planEndDate });
      
      const notificationIds = await scheduleVitaminReminders(vitaminPlan);

      if (notificationIds && notificationIds.length > 0) {
        console.log(`✅ Successfully scheduled ${notificationIds.length} notifications`);
        vitaminPlan.notificationIds = notificationIds; // Update the plan with notification IDs
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
          Your vitamin plan is ready! We&apos;ll send you friendly reminders at your chosen time. You&apos;ve got this! 😊
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    color: '#fff',
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
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
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
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryVitamin: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryDetail: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  finishButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});