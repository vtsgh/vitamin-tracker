import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDisplayTime } from '../utils/notifications';

export default function Timing() {
  const { vitamin, dosageAmount, dosageUnit, dosageDisplay } = useLocalSearchParams<{ 
    vitamin: string;
    dosageAmount: string;
    dosageUnit: string;
    dosageDisplay: string;
  }>();
  
  // Default to 9:00 AM
  const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 9, 0, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleContinue = () => {
    const timeString = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
    console.log(`Selected reminder time: ${timeString}`);
    
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
      <View style={styles.content}>
        <Text style={styles.header}>What time works best for you?</Text>
        <Text style={styles.description}>Choose when you&apos;d like to be reminded to take your {vitamin}.</Text>
        
        <View style={styles.timePickerContainer}>
          <Text style={styles.selectedTimeLabel}>Reminder Time</Text>
          <Text style={styles.selectedTimeText}>
            {formatDisplayTime(`${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`)}
          </Text>
          
          <TouchableOpacity 
            style={styles.changeTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.changeTimeButtonText}>Change Time</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for back button
  },
  header: {
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
    marginBottom: 50,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
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
    color: '#FF7F50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTimeText: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  changeTimeButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  changeTimeButtonText: {
    color: '#fff',
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
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
  },
  continueButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
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
  continueButtonText: {
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