import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VitaminCapsule from '../components/VitaminCapsule';
import { useTheme } from '@/contexts/ThemeContext';

export default function About() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleVisitWebsite = async () => {
    try {
      const websiteURL = 'https://takeamin.app';
      const supported = await Linking.canOpenURL(websiteURL);

      if (supported) {
        await Linking.openURL(websiteURL);
        console.log('Opening Takeamin website');
      } else {
        Alert.alert(
          'Unable to open website',
          'Please visit: takeamin.app'
        );
      }
    } catch (error) {
      console.error('Error opening website link:', error);
      Alert.alert(
        'Unable to open website',
        'Please visit: takeamin.app'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>About Takeamin</Text>

          <View style={styles.capsuleContainer}>
            <VitaminCapsule size={80} />
          </View>

          <Text style={styles.tagline}>
            Takeamin to take your vitamin!
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Track your vitamins with smart reminders and build healthy habits. Takeamin helps you stay consistent with your wellness routine through simple, effective tracking.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📅</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Simple Scheduling</Text>
              <Text style={styles.featureText}>Set up vitamin plans in seconds</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔔</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Reminders</Text>
              <Text style={styles.featureText}>Time-based notifications that adapt to your habits</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureText}>See your streaks and consistency over time</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎁</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Free Forever</Text>
              <Text style={styles.featureText}>All features available to everyone, always</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureText}>All data stays on your device - no tracking, no servers</Text>
            </View>
          </View>
        </View>

        {/* Privacy Promise Section */}
        <View style={styles.section}>
          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Privacy You Can Trust</Text>
            <View style={styles.privacyPoints}>
              <View style={styles.privacyPoint}>
                <Text style={styles.privacyBullet}>•</Text>
                <Text style={styles.privacyText}>Your data never leaves your device</Text>
              </View>
              <View style={styles.privacyPoint}>
                <Text style={styles.privacyBullet}>•</Text>
                <Text style={styles.privacyText}>No account required</Text>
              </View>
              <View style={styles.privacyPoint}>
                <Text style={styles.privacyBullet}>•</Text>
                <Text style={styles.privacyText}>No tracking or analytics</Text>
              </View>
              <View style={styles.privacyPoint}>
                <Text style={styles.privacyBullet}>•</Text>
                <Text style={styles.privacyText}>Time-based reminders only (no location tracking)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <View style={styles.developerCard}>
            <Text style={styles.developerTitle}>Built by an Independent Developer</Text>
            <Text style={styles.developerText}>
              Takeamin is crafted by a solo developer who believes in privacy-first health tracking. All features are free for everyone because your health data shouldn't be behind a paywall.
            </Text>
          </View>
        </View>

        {/* Website Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={handleVisitWebsite}
          >
            <Text style={styles.websiteButtonText}>Visit Our Website</Text>
            <Text style={styles.websiteButtonArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.websiteSubtext}>Learn more at takeamin.app</Text>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    homeButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1,
    },
    homeButtonIcon: {
      fontSize: 18,
      color: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },
    headerSection: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 30,
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
    },
    capsuleContainer: {
      marginBottom: 20,
    },
    tagline: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    section: {
      marginBottom: 25,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 15,
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 15,
      marginBottom: 12,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: 15,
      marginTop: 2,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    featureText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    privacyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.primary,
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    privacyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 15,
      textAlign: 'center',
    },
    privacyPoints: {
      gap: 10,
    },
    privacyPoint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    privacyBullet: {
      fontSize: 16,
      color: colors.primary,
      marginRight: 10,
      marginTop: 2,
    },
    privacyText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    developerCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    developerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    developerText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
      textAlign: 'center',
    },
    websiteButton: {
      backgroundColor: colors.primary,
      borderRadius: 15,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    websiteButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.white,
      marginRight: 8,
    },
    websiteButtonArrow: {
      fontSize: 18,
      color: colors.white,
      fontWeight: 'bold',
    },
    websiteSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
    },
    bottomSpacing: {
      height: 20,
    },
  });
}
