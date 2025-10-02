import { StyleSheet, Text, View, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDisplayTime } from '../utils/notifications';
import { VITAMIN_TIMING_RECOMMENDATIONS } from '../constants/smart-reminders';
import { useSmartReminders } from '../hooks/useSmartReminders';
import { usePremium } from '../hooks/usePremium';

export default function Timing() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { vitamin, dosageAmount, dosageUnit, dosageDisplay } = useLocalSearchParams<{ 
    vitamin: string;
    dosageAmount: string;
    dosageUnit: string;
    dosageDisplay: string;
  }>();
  
  // Default to 9:00 AM
  const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 9, 0, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  
  const { settings, isLoading } = useSmartReminders();
  const { isPremium } = usePremium();

  // Get vitamin-specific recommendations
  const getVitaminId = (vitaminLabel: string): string => {
    const vitaminMap: Record<string, string> = {
      'Vitamin A': 'vitamin-a',
      'Vitamin B1 (Thiamine)': 'vitamin-b1',
      'Vitamin B2 (Riboflavin)': 'vitamin-b2',
      'Vitamin B3 (Niacin)': 'vitamin-b3',
      'Vitamin B6 (Pyridoxine)': 'vitamin-b6',
      'Vitamin B12 (Cobalamin)': 'vitamin-b12',
      'Vitamin C': 'vitamin-c',
      'Vitamin D': 'vitamin-d',
      'Vitamin E': 'vitamin-e',
      'Vitamin K': 'vitamin-k',
      'Folate (Folic Acid)': 'folate',
      'Biotin': 'biotin',
      'Calcium': 'calcium',
      'Iron': 'iron',
      'Magnesium': 'magnesium',
      'Zinc': 'zinc',
      'Omega-3 Fatty Acids': 'omega-3',
      'Multivitamin': 'multivitamin',
    };
    return vitaminMap[vitaminLabel] || 'multivitamin';
  };

  const vitaminId = getVitaminId(vitamin || '');
  const recommendations = VITAMIN_TIMING_RECOMMENDATIONS[vitaminId];
  const showSmartRecommendations = false; // Disabled to avoid medical advice implications

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
      setSelectedRecommendation(null); // Clear recommendation selection
    }
  };

  const handleRecommendationSelect = (recommendedTime: string) => {
    const [hours, minutes] = recommendedTime.split(':').map(Number);
    const newTime = new Date(2024, 0, 1, hours, minutes, 0);
    setReminderTime(newTime);
    setSelectedRecommendation(recommendedTime);
  };

  const handleContinue = () => {
    const timeString = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
    console.log(`Selected reminder time: ${timeString}`);
    navigateToNext(timeString);
  };

  const navigateToNext = (timeString: string) => {
    router.push({
      pathname: '/consistency',
      params: { 
        vitamin,
        dosageAmount,
        dosageUnit,
        dosageDisplay,
        reminderTime: timeString
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>What time works best for you?</Text>
        <Text style={styles.description}>Choose when you&apos;d like to be reminded to take your {vitamin}.</Text>
        
        {/* Smart Recommendations Section */}
        {showSmartRecommendations && (
          <View style={styles.smartRecommendationsContainer}>
            <View style={styles.smartHeader}>
              <Text style={styles.smartIcon}>🧠</Text>
              <Text style={styles.smartTitle}>Smart Timing Suggestions</Text>
            </View>
            <Text style={styles.smartSubtitle}>{recommendations.reason}</Text>
            <Text style={styles.smartNote}>
              {recommendations.withFood ? '💡 Best taken with food' : '💡 Can be taken on empty stomach'}
            </Text>
            
            <View style={styles.recommendationsGrid}>
              {recommendations.optimalTimes.map((time, index) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.recommendationButton,
                    selectedRecommendation === time && styles.recommendationButtonSelected
                  ]}
                  onPress={() => handleRecommendationSelect(time)}
                >
                  <Text style={[
                    styles.recommendationTime,
                    selectedRecommendation === time && styles.recommendationTimeSelected
                  ]}>
                    {formatDisplayTime(time)}
                  </Text>
                  <Text style={[
                    styles.recommendationLabel,
                    selectedRecommendation === time && styles.recommendationLabelSelected
                  ]}>
                    {index === 0 ? 'Optimal' : index === 1 ? 'Good' : 'Alternative'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Manual Time Selection */}
        <View style={styles.timePickerContainer}>
          <Text style={styles.selectedTimeLabel}>
            {showSmartRecommendations ? 'Or Choose Custom Time' : 'Reminder Time'}
          </Text>
          <Text style={styles.selectedTimeText}>
            {formatDisplayTime(`${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`)}
          </Text>
          
          <TouchableOpacity 
            style={styles.changeTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.changeTimeButtonText}>
              {showSmartRecommendations ? 'Set Custom Time' : 'Change Time'}
            </Text>
          </TouchableOpacity>
          
          {showTimePicker && (
            <View style={styles.timePickerSection}>
              <DateTimePicker
                testID="timePicker"
                value={reminderTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor="#FF7F50"
              />
              
              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={styles.timePickerDoneButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerDoneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
      
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Space for back button
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  smartRecommendationsContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: colors.smartRemindersButton,
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  smartIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  smartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  smartSubtitle: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  smartNote: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  recommendationButton: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 4,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.05 }],
  },
  recommendationTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recommendationTimeSelected: {
    color: colors.white,
  },
  recommendationLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  recommendationLabelSelected: {
    color: colors.white,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  timePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  selectedTimeLabel: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTimeText: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  changeTimeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  changeTimeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerSection: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  timePicker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  timePickerDoneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
    width: '80%',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButtonText: {
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
});}
