import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MedicalDisclaimerProps {
  onAccept?: () => void;
  showBackButton?: boolean;
}

export default function MedicalDisclaimer({ onAccept, showBackButton = true }: MedicalDisclaimerProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleAccept = async () => {
    try {
      // Mark disclaimer as accepted
      await AsyncStorage.setItem('medicalDisclaimerAccepted', 'true');
      await AsyncStorage.setItem('medicalDisclaimerAcceptedDate', new Date().toISOString());
      
      if (onAccept) {
        onAccept();
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error saving disclaimer acceptance:', error);
      Alert.alert('Error', 'Failed to save disclaimer acceptance. Please try again.');
    }
  };

  const handleScrollEnd = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    setHasScrolledToBottom(isScrolledToBottom);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        <Text style={styles.title}>⚕️ Medical Disclaimer</Text>
        <Text style={styles.subtitle}>Important Health Information</Text>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>🚨 Important Notice</Text>
          <Text style={styles.disclaimerText}>
            This app is for <Text style={styles.bold}>informational and reminder purposes only</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Not Medical Advice</Text>
          <Text style={styles.bulletPoint}>• Not intended to diagnose, treat, cure, or prevent any disease</Text>
          <Text style={styles.bulletPoint}>• Not a substitute for professional medical advice</Text>
          <Text style={styles.bulletPoint}>• Always consult your healthcare provider before starting any vitamin regimen</Text>
          <Text style={styles.bulletPoint}>• Individual nutritional needs vary significantly</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Vitamin Safety</Text>
          <Text style={styles.bulletPoint}>• Do not start or change dosage without medical supervision</Text>
          <Text style={styles.bulletPoint}>• Some vitamins can be harmful in large amounts</Text>
          <Text style={styles.bulletPoint}>• Vitamins may interact with medications</Text>
          <Text style={styles.bulletPoint}>• Stop use and consult a doctor if adverse reactions occur</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Limitations</Text>
          <Text style={styles.bulletPoint}>• This app does not track actual vitamin intake</Text>
          <Text style={styles.bulletPoint}>• Reminders are not medical prescriptions</Text>
          <Text style={styles.bulletPoint}>• App functionality depends on device notifications</Text>
          <Text style={styles.bulletPoint}>• We are not responsible for missed reminders</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 Professional Guidance</Text>
          <Text style={styles.bodyText}>
            Consult with qualified healthcare professionals including:
          </Text>
          <Text style={styles.bulletPoint}>• Your primary care physician</Text>
          <Text style={styles.bulletPoint}>• Registered dietitians</Text>
          <Text style={styles.bulletPoint}>• Licensed pharmacists</Text>
          <Text style={styles.bulletPoint}>• Specialists relevant to your health conditions</Text>
        </View>

        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🆘 Medical Emergency</Text>
          <Text style={styles.emergencyText}>
            If you experience a medical emergency, immediately contact emergency services (911) or go to your nearest emergency room. 
            Do not rely on this app for urgent medical situations.
          </Text>
        </View>

        <View style={styles.agreementSection}>
          <Text style={styles.agreementTitle}>📋 User Agreement</Text>
          <Text style={styles.agreementText}>
            By using Takeamin, you acknowledge that you have read, understood, and agree to this medical disclaimer. 
            You understand that this app is a tool for organization and reminders only, and that all health-related 
            decisions should be made in consultation with qualified healthcare professionals.
          </Text>
        </View>

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            !hasScrolledToBottom && styles.acceptButtonDisabled
          ]}
          onPress={handleAccept}
          disabled={!hasScrolledToBottom}
        >
          <Text style={[
            styles.acceptButtonText,
            !hasScrolledToBottom && styles.acceptButtonTextDisabled
          ]}>
            {hasScrolledToBottom ? '✅ I Understand and Accept' : '📜 Please scroll to read all'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  disclaimerCard: {
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    marginBottom: 25,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 5,
  },
  bodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  emergencySection: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F87171',
    marginBottom: 25,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
  },
  emergencyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  agreementSection: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#93C5FD',
    marginBottom: 25,
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 10,
  },
  agreementText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  lastUpdated: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF3E0',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButtonTextDisabled: {
    color: '#9CA3AF',
  },
  bold: {
    fontWeight: 'bold',
    color: '#FF7F50',
  },
});