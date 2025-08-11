import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if user has accepted the medical disclaimer
 */
export async function hasAcceptedMedicalDisclaimer(): Promise<boolean> {
  try {
    const accepted = await AsyncStorage.getItem('medicalDisclaimerAccepted');
    return accepted === 'true';
  } catch (error) {
    console.error('Error checking medical disclaimer status:', error);
    return false;
  }
}

/**
 * Get the date when user accepted the medical disclaimer
 */
export async function getMedicalDisclaimerAcceptanceDate(): Promise<Date | null> {
  try {
    const dateString = await AsyncStorage.getItem('medicalDisclaimerAcceptedDate');
    return dateString ? new Date(dateString) : null;
  } catch (error) {
    console.error('Error getting medical disclaimer acceptance date:', error);
    return null;
  }
}

/**
 * Clear medical disclaimer acceptance (for testing/reset purposes)
 */
export async function clearMedicalDisclaimerAcceptance(): Promise<void> {
  try {
    await AsyncStorage.removeItem('medicalDisclaimerAccepted');
    await AsyncStorage.removeItem('medicalDisclaimerAcceptedDate');
  } catch (error) {
    console.error('Error clearing medical disclaimer acceptance:', error);
  }
}

/**
 * Force show medical disclaimer (useful for settings)
 */
export async function requireMedicalDisclaimerReview(): Promise<void> {
  try {
    await AsyncStorage.removeItem('medicalDisclaimerAccepted');
  } catch (error) {
    console.error('Error requiring medical disclaimer review:', error);
  }
}