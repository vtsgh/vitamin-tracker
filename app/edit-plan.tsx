import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VitaminPlan } from '../types/VitaminPlan';
import { VITAMINS } from '../constants/vitamins';
import { scheduleVitaminReminders, cancelNotifications, formatDisplayTime } from '../utils/notifications';

const frequencyOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'every-other-day', label: 'Every other day' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom', label: 'Custom' },
];

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function EditPlan() {
  const { id, vitamin, frequency, endDate, customDays, reminderTime } = useLocalSearchParams<{
    id: string;
    vitamin: string;
    frequency: string;
    endDate: string;
    customDays?: string;
    reminderTime?: string;
  }>();

  // Initialize state with current values
  const [editedVitamin, setEditedVitamin] = useState(vitamin || '');
  const [editedFrequency, setEditedFrequency] = useState(frequency || 'daily');
  const [editedCustomDays, setEditedCustomDays] = useState<string[]>(
    customDays ? JSON.parse(customDays) : []
  );
  const [editedEndDate, setEditedEndDate] = useState(new Date(endDate || Date.now()));
  const [editedReminderTime, setEditedReminderTime] = useState(() => {
    const timeStr = reminderTime || '09:00';
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(2024, 0, 1, hour, minute, 0);
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const toggleCustomDay = (dayId: string) => {
    setEditedCustomDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEditedEndDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEditedReminderTime(selectedTime);
    }
  };

  const validateAndSave = async () => {
    // Validation
    if (!editedVitamin.trim()) {
      Alert.alert('Validation Error', 'Please enter a vitamin name.');
      return;
    }

    if (editedFrequency === 'custom' && editedCustomDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day for custom frequency.');
      return;
    }

    try {
      // Read existing plans from AsyncStorage
      const existingPlansJson = await AsyncStorage.getItem('vitaminPlans');
      const existingPlans: VitaminPlan[] = existingPlansJson ? JSON.parse(existingPlansJson) : [];

      // Find the current plan to get the old notification IDs
      const currentPlan = existingPlans.find(plan => plan.id === id);
      const oldNotificationIds = currentPlan?.notificationIds || [];
      const oldLegacyNotificationId = currentPlan?.notificationId;

      // Cancel all old notifications
      if (oldNotificationIds.length > 0) {
        console.log('🔔 Cancelling old notifications for edited plan:', oldNotificationIds);
        await cancelNotifications(oldNotificationIds);
        console.log('✅ Old notifications cancelled successfully');
      } else if (oldLegacyNotificationId) {
        // Handle legacy single notification ID
        console.log('🔔 Cancelling legacy notification for edited plan:', oldLegacyNotificationId);
        await cancelNotifications([oldLegacyNotificationId]);
        console.log('✅ Legacy notification cancelled successfully');
      }

      // Prepare the updated plan data
      const timeString = `${editedReminderTime.getHours().toString().padStart(2, '0')}:${editedReminderTime.getMinutes().toString().padStart(2, '0')}`;
      
      const updatedPlan: VitaminPlan = {
        id: id,
        vitamin: editedVitamin.trim(),
        frequency: editedFrequency as VitaminPlan['frequency'],
        customDays: editedFrequency === 'custom' ? editedCustomDays : undefined,
        endDate: editedEndDate.toISOString(),
        reminderTime: timeString,
        notificationIds: [], // Will be updated after scheduling
      };

      // Schedule new comprehensive notifications
      console.log('🔔 Scheduling new notifications for edited plan:', editedVitamin);
      console.log('📋 Updated plan details:', { frequency: editedFrequency, time: timeString, endDate: editedEndDate.toISOString() });
      
      const newNotificationIds = await scheduleVitaminReminders(updatedPlan);

      if (newNotificationIds && newNotificationIds.length > 0) {
        console.log(`✅ Successfully scheduled ${newNotificationIds.length} new notifications`);
        updatedPlan.notificationIds = newNotificationIds; // Update with new notification IDs
      } else {
        console.log('⚠️ Failed to schedule new notifications, but continuing with plan update');
      }

      // Find and update the plan in the array
      const updatedPlans = existingPlans.map(plan => {
        if (plan.id === id) {
          return updatedPlan;
        }
        return plan;
      });

      // Save back to AsyncStorage
      await AsyncStorage.setItem('vitaminPlans', JSON.stringify(updatedPlans));

      console.log('💾 Vitamin plan updated successfully');

      // Navigate back to schedule to show the updated plan
      router.push('/schedule');
    } catch (error) {
      console.error('❌ Error saving vitamin plan:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Vitamin Plan</Text>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Vitamin Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Vitamin:</Text>
            <View style={styles.vitaminContainer}>
              {VITAMINS.map((vitamin) => (
                <TouchableOpacity
                  key={vitamin.id}
                  style={[
                    styles.vitaminButton,
                    editedVitamin === vitamin.label && styles.vitaminButtonSelected
                  ]}
                  onPress={() => setEditedVitamin(vitamin.label)}
                >
                  <Text style={[
                    styles.vitaminButtonText,
                    editedVitamin === vitamin.label && styles.vitaminButtonTextSelected
                  ]}>
                    {vitamin.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Frequency:</Text>
            <View style={styles.frequencyContainer}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.frequencyButton,
                    editedFrequency === option.id && styles.frequencyButtonSelected
                  ]}
                  onPress={() => setEditedFrequency(option.id)}
                >
                  <Text style={[
                    styles.frequencyButtonText,
                    editedFrequency === option.id && styles.frequencyButtonTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Days Selection */}
          {editedFrequency === 'custom' && (
            <View style={styles.field}>
              <Text style={styles.label}>Custom Days:</Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      editedCustomDays.includes(day.id) ? styles.selectedDayButton : styles.unselectedDayButton
                    ]}
                    onPress={() => toggleCustomDay(day.id)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      editedCustomDays.includes(day.id) ? styles.selectedDayButtonText : styles.unselectedDayButtonText
                    ]}>
                      {day.label.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Reminder Time */}
          <View style={styles.field}>
            <Text style={styles.label}>Reminder Time:</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatDisplayTime(`${editedReminderTime.getHours().toString().padStart(2, '0')}:${editedReminderTime.getMinutes().toString().padStart(2, '0')}`)}
              </Text>
              <TouchableOpacity 
                style={styles.changeTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.changeTimeButtonText}>Change Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* End Date */}
          <View style={styles.field}>
            <Text style={styles.label}>End Date:</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(editedEndDate)}</Text>
              <TouchableOpacity 
                style={styles.changeDateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.changeDateButtonText}>Change Date</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker */}
          {showTimePicker && (
            <View style={styles.timePickerSection}>
              {Platform.OS === 'ios' ? (
                <>
                  <DateTimePicker
                    value={editedReminderTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    textColor="#FF7F50"
                    style={styles.iosTimePicker}
                  />
                  <TouchableOpacity 
                    style={styles.timePickerDoneButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.timePickerDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.androidPickerContainer}>
                  <DateTimePicker
                    value={editedReminderTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                </View>
              )}
            </View>
          )}

          {/* Date Picker */}
          {showDatePicker && (
            <View style={styles.datePickerSection}>
              {Platform.OS === 'ios' ? (
                <>
                  <DateTimePicker
                    value={editedEndDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor="#000000"
                    style={styles.iosDatePicker}
                  />
                  <TouchableOpacity 
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.androidPickerContainer}>
                  <DateTimePicker
                    value={editedEndDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity style={styles.saveButton} onPress={validateAndSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
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
  field: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 10,
  },
  vitaminContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vitaminButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#FF7F50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 5,
  },
  vitaminButtonSelected: {
    backgroundColor: '#FF7F50',
  },
  vitaminButtonText: {
    fontSize: 12,
    color: '#FF7F50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vitaminButtonTextSelected: {
    color: '#fff',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  frequencyButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#FF7F50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 5,
  },
  frequencyButtonSelected: {
    backgroundColor: '#FF7F50',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#FF7F50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frequencyButtonTextSelected: {
    color: '#fff',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 45,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedDayButton: {
    backgroundColor: '#FF7F50',
  },
  unselectedDayButton: {
    backgroundColor: '#FAF3E0',
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  unselectedDayButtonText: {
    color: '#FF7F50',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  changeTimeButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeTimeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timePickerSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  iosTimePicker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  timePickerDoneButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timePickerDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  changeDateButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeDateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  iosDatePicker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  androidPickerContainer: {
    backgroundColor: '#FAF3E0',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF7F50',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datePickerDoneButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  datePickerDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
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
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
});