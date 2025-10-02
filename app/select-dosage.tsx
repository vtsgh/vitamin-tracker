import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useCallback } from 'react';
import { getDosageOptions, formatDosageDisplay } from '../constants/dosages';
import { VITAMINS } from '../constants/vitamins';
import VitaminCapsule from '../components/VitaminCapsule';
import { useTheme } from '@/contexts/ThemeContext';

export default function SelectDosage() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { vitamin } = useLocalSearchParams<{ vitamin: string }>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const lastTapTime = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const customInputRef = useRef<TextInput>(null);

  // Find vitamin ID for dosage options
  const vitaminObj = VITAMINS.find(v => v.label === vitamin);
  const vitaminId = vitaminObj?.id || '';
  const dosageOptions = getDosageOptions(vitaminId);

  // Reset navigation state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const handleDosagePress = (amount: number, unit: string, displayText?: string) => {
    const now = Date.now();
    if (now - lastTapTime.current < 1000 || isNavigating) {
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;
    setIsNavigating(true);
    
    const dosageDisplay = displayText || formatDosageDisplay(amount, unit);
    console.log('✅ Selected dosage:', dosageDisplay);
    
    router.push({
      pathname: '/timing',
      params: { 
        vitamin,
        dosageAmount: amount.toString(),
        dosageUnit: unit,
        dosageDisplay: dosageDisplay
      }
    });
  };

  const handleCustomDosage = () => {
    if (!customAmount.trim()) {
      Alert.alert('Missing Amount', 'Please enter a dosage amount.');
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (!customUnit.trim()) {
      Alert.alert('Missing Unit', 'Please select a unit for your dosage.');
      return;
    }

    const displayText = formatDosageDisplay(amount, customUnit);
    handleDosagePress(amount, customUnit, displayText);
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 500 || isNavigating) {
      return;
    }
    lastTapTime.current = now;
    setIsNavigating(true);
    router.back();
  };

  const getCommonUnits = (vitaminId: string): string[] => {
    // Return common units based on vitamin type
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
      return ['tablet', 'tablets', 'capsule', 'capsules', 'gummy', 'gummies'];
    }
    return ['mg', 'mcg']; // default
  };

  const handleCustomInputToggle = () => {
    setShowCustomInput(!showCustomInput);
    if (!showCustomInput) {
      // Set default unit based on vitamin type when opening custom input
      const commonUnits = getCommonUnits(vitaminId);
      if (commonUnits.length > 0 && !customUnit) {
        setCustomUnit(commonUnits[0]); // Set first common unit as default
      }
      // When opening custom input, scroll to bottom after a brief delay
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCustomInputFocus = () => {
    // Scroll to bottom when input is focused to ensure it's visible
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!vitamin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No vitamin selected</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Text style={styles.title}>Select Dosage</Text>
      <Text style={styles.subtitle}>How much {vitamin}?</Text>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Predefined dosage options */}
        {dosageOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dosageButton, isNavigating && styles.disabledButton]}
            onPress={() => handleDosagePress(
              option.amount, 
              option.unit, 
              option.alternativeDisplay || formatDosageDisplay(option.amount, option.unit)
            )}
            disabled={isNavigating}
            activeOpacity={isNavigating ? 1 : 0.8}
          >
            <View style={styles.dosageContent}>
              <View style={styles.dosageAmountContainer}>
                <VitaminCapsule size={18} style={styles.vitaminIcon} />
                <Text style={styles.dosageAmount}>
                  {option.alternativeDisplay || formatDosageDisplay(option.amount, option.unit)}
                </Text>
              </View>
              <Text style={styles.dosageLabel}>{option.label}</Text>
              {option.subtitle && (
                <Text style={styles.dosageSubtitle}>{option.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Custom dosage option */}
        <TouchableOpacity
          style={[styles.customButton, showCustomInput && styles.customButtonActive]}
          onPress={handleCustomInputToggle}
          disabled={isNavigating}
          activeOpacity={0.8}
        >
          <View style={styles.dosageContent}>
            <View style={styles.dosageAmountContainer}>
              <Text style={styles.customIcon}>⚙️</Text>
              <Text style={styles.dosageAmount}>Custom Amount</Text>
            </View>
            <Text style={styles.dosageLabel}>Enter your dosage</Text>
          </View>
        </TouchableOpacity>

        {/* Custom input section */}
        {showCustomInput && (
          <View style={styles.customInputSection}>
            <View style={styles.inputRow}>
              <TextInput
                ref={customInputRef}
                style={styles.amountInput}
                placeholder="Amount"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                placeholderTextColor="#999"
                onFocus={handleCustomInputFocus}
                autoFocus={false}
              />
              
              <View style={styles.unitSelector}>
                <Text style={styles.unitSelectorLabel}>Select Unit:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScrollView}>
                  {getCommonUnits(vitaminId).map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        customUnit === unit && styles.unitButtonSelected
                      ]}
                      onPress={() => setCustomUnit(unit)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        customUnit === unit && styles.unitButtonTextSelected
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.confirmCustomButton, isNavigating && styles.disabledButton]}
              onPress={handleCustomDosage}
              disabled={isNavigating}
            >
              <Text style={styles.confirmCustomButtonText}>Use This Dosage</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.backButton, isNavigating && styles.disabledButton]} 
        onPress={handleBack}
        disabled={isNavigating}
        activeOpacity={isNavigating ? 1 : 0.8}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 120, // Extra padding for keyboard
  },
  dosageButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 15,
    width: '90%',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    marginBottom: 15,
    width: '90%',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: colors.smartRemindersButton,
  },
  customButtonActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  dosageContent: {
    padding: 20,
    alignItems: 'center',
  },
  dosageAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  vitaminIcon: {
    marginRight: 8,
  },
  customIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dosageAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dosageLabel: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 3,
  },
  dosageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  customInputSection: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  amountInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  unitSelector: {
    flex: 1,
  },
  unitSelectorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  unitScrollView: {
    flexGrow: 0,
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
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  backButton: {
    backgroundColor: colors.smartRemindersButton,
    paddingHorizontal: 30,
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
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
}