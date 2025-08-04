import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const consistencyOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'every-other-day', label: 'Every other day' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom-days', label: 'Pick my own days of the week!' },
];

export default function Consistency() {
  const { vitamin, reminderTime } = useLocalSearchParams<{ vitamin: string; reminderTime: string }>();

  const handleConsistencyPress = (optionId: string, optionLabel: string) => {
    console.log(`Selected: ${optionLabel} (${optionId})`);
    if (optionId === 'daily' || optionId === 'every-other-day' || optionId === 'weekly') {
      router.push({
        pathname: '/end-date',
        params: { vitamin, reminderTime, frequency: optionId }
      });
    } else if (optionId === 'custom-days') {
      router.push({
        pathname: '/custom-days',
        params: { vitamin, reminderTime }
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
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: '#555',
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
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 20,
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