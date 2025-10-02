import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const endDateOptions = [
  { id: '1-month', label: '1 Month' },
  { id: '3-months', label: '3 Months' },
  { id: '6-months', label: '6 Months' },
  { id: '1-year', label: '1 Year' },
  { id: 'custom-date', label: 'Pick a date that works for me' },
];

export default function EndDate() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency, customDays } = useLocalSearchParams<{ 
    vitamin: string; 
    dosageAmount: string;
    dosageUnit: string;
    dosageDisplay: string;
    reminderTime: string;
    frequency: string; 
    customDays?: string 
  }>();

  const calculateEndDate = (optionId: string): string => {
    const now = new Date();
    switch (optionId) {
      case '1-month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case '3-months':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      case '6-months':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();
      case '1-year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const handleEndDatePress = (optionId: string, optionLabel: string) => {
    console.log(`Selected: ${optionLabel} (${optionId})`);
    if (optionId === 'custom-date') {
      router.push({
        pathname: '/custom-end-date',
        params: { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency, customDays }
      });
    } else {
      // Navigate directly to summary with calculated end date
      const endDate = calculateEndDate(optionId);
      router.push({
        pathname: '/summary',
        params: { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency, endDate, customDays }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting Goals for Success!</Text>
      <Text style={styles.description}>Choose your end date for taking your {vitamin}.</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {endDateOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => handleEndDatePress(option.id, option.label)}
          >
            <Text style={styles.optionButtonText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 20,
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
  optionButtonText: {
    color: colors.white,
    fontSize: 20,
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
