import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const consistencyOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'every-other-day', label: 'Every other day' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom-days', label: 'Pick my own days of the week!' },
];

export default function Consistency() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime } = useLocalSearchParams<{ 
    vitamin: string; 
    dosageAmount: string;
    dosageUnit: string;
    dosageDisplay: string;
    reminderTime: string;
  }>();

  const handleConsistencyPress = (optionId: string, optionLabel: string) => {
    console.log(`Selected: ${optionLabel} (${optionId})`);
    if (optionId === 'daily' || optionId === 'every-other-day' || optionId === 'weekly') {
      router.push({
        pathname: '/end-date',
        params: { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency: optionId }
      });
    } else if (optionId === 'custom-days') {
      router.push({
        pathname: '/custom-days',
        params: { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consistency is Key!</Text>
      <Text style={styles.description}>How often will you be taking your {vitamin}?</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {consistencyOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => handleConsistencyPress(option.id, option.label)}
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
    marginBottom: 30,
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
