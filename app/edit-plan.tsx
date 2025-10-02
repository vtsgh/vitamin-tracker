import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VitaminPlan } from '../types/VitaminPlan';
import { VITAMINS } from '../constants/vitamins';
import { scheduleVitaminReminders, cancelNotifications, formatDisplayTime } from '../utils/notifications';
import { getDosageOptions, formatDosageDisplay } from '../constants/dosages';
import VitaminCapsule from '../components/VitaminCapsule';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id, vitamin, dosageAmount, dosageUnit, dosageDisplay, frequency, endDate, customDays, reminderTime } = useLocalSearchParams<{
    id: string;
    vitamin: string;
    dosageAmount?: string;
    dosageUnit?: string;
    dosageDisplay?: string;
    frequency: string;
    endDate: string;
    customDays?: string;
    reminderTime?: string;
  }>();

  // Initialize state with current values (vitamin is read-only)
  const editedVitamin = vitamin || '';
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

  
  // Dosage editing state
  const [showDosageEditor, setShowDosageEditor] = useState(false);
  const [editedDosageAmount, setEditedDosageAmount] = useState(dosageAmount || '');
  const [editedDosageUnit, setEditedDosageUnit] = useState(dosageUnit || '');
  const [editedDosageDisplay, setEditedDosageDisplay] = useState(dosageDisplay || '');
  const [customDosageAmount, setCustomDosageAmount] = useState('');
  const [customDosageUnit, setCustomDosageUnit] = useState('');

  const handleBack = () => {
    router.back();
  };

  // Get vitamin ID for dosage options
  const vitaminObj = VITAMINS.find(v => v.label === editedVitamin);
  const vitaminId = vitaminObj?.id || '';
  const dosageOptions = getDosageOptions(vitaminId);

  console.log('Edit Plan - Vitamin:', editedVitamin);
  console.log('Edit Plan - Vitamin ID:', vitaminId);
  console.log('Edit Plan - Dosage Options:', dosageOptions.length);

  const getCommonUnits = (vitaminId: string): string[] => {
    if (['vitamin-a', 'vitamin-d', 'vitamin-e'].includes(vitaminId)) {
      return ['IU', 'mcg'];
    }
    if (['vitamin-b12', 'vitamin-k', 'folate', 'biotin'].includes(vitaminId)) {
      return ['mcg'];
    }
    if (['calcium', 'magnesium', 'vitamin-c', 'iron', 'zinc'].includes(vitaminId)) {
      return ['mg'];
    }
    if (vitaminId === 'omega-3') {
      return ['mg', 'g'];
    }
    if (vitaminId === 'multivitamin') {
      return ['tablet', 'capsule', 'gummy'];
    }
    return ['mg', 'mcg'];
  };

  const handleDosageSelection = (amount: number, unit: string, displayText: string) => {
    setEditedDosageAmount(amount.toString());
    setEditedDosageUnit(unit);
    setEditedDosageDisplay(displayText);
    setShowDosageEditor(false);
  };

  const handleCustomDosage = () => {
    if (!customDosageAmount.trim()) {
      Alert.alert('Missing Amount', 'Please enter a dosage amount.');
      return;
    }

    const amount = parseFloat(customDosageAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (!customDosageUnit.trim()) {
      Alert.alert('Missing Unit', 'Please select a unit for your dosage.');
      return;
    }

    const displayText = formatDosageDisplay(amount, customDosageUnit);
    handleDosageSelection(amount, customDosageUnit, displayText);
    setCustomDosageAmount('');
    setCustomDosageUnit('');
  };

  const handleRemoveDosage = () => {
    setEditedDosageAmount('');
    setEditedDosageUnit('');
    setEditedDosageDisplay('');
    setShowDosageEditor(false);
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
        dosage: editedDosageAmount && editedDosageUnit && editedDosageDisplay ? {
          amount: parseFloat(editedDosageAmount),
          unit: editedDosageUnit,
          displayText: editedDosageDisplay
        } : undefined,
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
      
      {/* Read-only Vitamin Header */}
      <View style={styles.vitaminHeader}>
        <View style={styles.vitaminHeaderContent}>
          <VitaminCapsule size={24} style={styles.headerVitaminIcon} />
          <Text style={styles.vitaminHeaderTitle}>{editedVitamin}</Text>
        </View>
        <Text style={styles.vitaminHeaderSubtitle}>
          Update your schedule, dosage, or reminder time as needed.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Dosage Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Dosage:</Text>
            {editedDosageDisplay ? (
              <View style={styles.currentDosageContainer}>
                <View style={styles.currentDosageDisplay}>
                  <VitaminCapsule size={16} style={styles.vitaminIcon} />
                  <Text style={styles.currentDosageText}>{editedDosageDisplay}</Text>
                </View>
                <View style={styles.dosageActions}>
                  <TouchableOpacity 
                    style={styles.changeDosageButton}
                    onPress={() => setShowDosageEditor(true)}
                  >
                    <Text style={styles.changeDosageButtonText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeDosageButton}
                    onPress={handleRemoveDosage}
                  >
                    <Text style={styles.removeDosageButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addDosageButton}
                onPress={() => setShowDosageEditor(true)}
              >
                <Text style={styles.addDosageButtonText}>+ Add Dosage</Text>
              </TouchableOpacity>
            )}
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
                activeOpacity={0.7}
              >
                <Text style={styles.changeTimeButtonText}>Change Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker - positioned right after reminder time */}
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

          {/* End Date */}
          <View style={styles.field}>
            <Text style={styles.label}>End Date:</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(editedEndDate)}</Text>
              <TouchableOpacity 
                style={styles.changeDateButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.changeDateButtonText}>Change Date</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Picker - positioned right after end date */}
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

      {/* Dosage Editor Modal */}
      {showDosageEditor && (
        <View style={styles.dosageEditorOverlay}>
          <KeyboardAvoidingView
            style={styles.dosageEditorModal}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.dosageEditorHeader}>
              <Text style={styles.dosageEditorTitle}>Select Dosage</Text>
              <TouchableOpacity
                style={styles.dosageEditorClose}
                onPress={() => setShowDosageEditor(false)}
              >
                <Text style={styles.dosageEditorCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.dosageEditorScroll}
              contentContainerStyle={styles.dosageEditorContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Debug info */}
              <Text style={{ color: colors.textPrimary, padding: 10 }}>
                Available options: {dosageOptions.length}
              </Text>

              {/* Predefined dosage options */}
              {dosageOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dosageOption}
                  onPress={() => handleDosageSelection(
                    option.amount,
                    option.unit,
                    option.alternativeDisplay || formatDosageDisplay(option.amount, option.unit)
                  )}
                >
                  <View style={styles.dosageOptionContent}>
                    <VitaminCapsule size={16} style={styles.vitaminIcon} />
                    <Text style={styles.dosageOptionText}>
                      {option.alternativeDisplay || formatDosageDisplay(option.amount, option.unit)}
                    </Text>
                    <Text style={styles.dosageOptionLabel}>{option.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Custom dosage input */}
              <View style={styles.customDosageSection}>
                <Text style={styles.customDosageTitle}>Custom Dosage</Text>
                <View style={styles.customDosageInputRow}>
                  <TextInput
                    style={styles.customDosageAmountInput}
                    placeholder="Amount"
                    value={customDosageAmount}
                    onChangeText={setCustomDosageAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.customDosageUnitSelector}>
                    <Text style={styles.unitSelectorLabel}>Unit:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {getCommonUnits(vitaminId).map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitButton,
                            customDosageUnit === unit && styles.unitButtonSelected
                          ]}
                          onPress={() => setCustomDosageUnit(unit)}
                        >
                          <Text style={[
                            styles.unitButtonText,
                            customDosageUnit === unit && styles.unitButtonTextSelected
                          ]}>
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.confirmCustomButton}
                  onPress={handleCustomDosage}
                >
                  <Text style={styles.confirmCustomButtonText}>Use This Dosage</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 15,
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
  field: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  frequencyButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 5,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frequencyButtonTextSelected: {
    color: colors.white,
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
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  unselectedDayButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedDayButtonText: {
    color: colors.white,
  },
  unselectedDayButtonText: {
    color: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  changeTimeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeTimeButtonText: {
    color: colors.white,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timePickerDoneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  changeDateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeDateButtonText: {
    color: colors.white,
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
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datePickerDoneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  datePickerDoneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
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
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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

  // Vitamin header styles
  vitaminHeader: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  vitaminHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerVitaminIcon: {
    marginRight: 12,
  },
  vitaminHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  vitaminHeaderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Dosage editing styles
  currentDosageContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentDosageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vitaminIcon: {
    marginRight: 8,
  },
  currentDosageText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dosageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  changeDosageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  changeDosageButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeDosageButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  removeDosageButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addDosageButton: {
    backgroundColor: '#E8F4FD',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#87CEEB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addDosageButtonText: {
    color: '#87CEEB',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Dosage editor modal styles
  dosageEditorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dosageEditorModal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    margin: 20,
    height: '70%',
    width: '90%',
    elevation: 10,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'column',
  },
  dosageEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dosageEditorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dosageEditorClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dosageEditorCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  dosageEditorScroll: {
    flex: 1,
  },
  dosageEditorContent: {
    padding: 20,
  },
  dosageOption: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dosageOptionContent: {
    padding: 15,
    alignItems: 'center',
  },
  dosageOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 5,
    marginBottom: 3,
  },
  dosageOptionLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  customDosageSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  customDosageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  customDosageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  customDosageAmountInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  customDosageUnitSelector: {
    flex: 1,
  },
  unitSelectorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  unitButton: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  unitButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unitButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  confirmCustomButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmCustomButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});}
