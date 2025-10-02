import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

export default function CustomEndDate() {
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
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default to tomorrow
  const [show, setShow] = useState(Platform.OS === 'ios');

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    console.log(`Selected date: ${currentDate.toDateString()}`);
  };

  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

  const handleContinue = () => {
    router.push({
      pathname: '/summary',
      params: { vitamin, dosageAmount, dosageUnit, dosageDisplay, reminderTime, frequency, endDate: date.toISOString(), customDays }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Your Perfect Ending</Text>
      <View style={styles.content}>
        <View style={styles.datePickerContainer}>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="spinner"
              onChange={onChange}
              minimumDate={minDate}
              style={styles.datePicker}
              textColor="#FF7F50"
            />
          ) : (
            <>
              <Text style={styles.selectedDateText}>
                Selected Date: {date.toDateString()}
              </Text>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                  minimumDate={minDate}
                />
              )}
            </>
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

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 60,
  },
  datePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  selectedDateText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 20,
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
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 40,
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
});}
