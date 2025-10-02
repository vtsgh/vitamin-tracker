import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../hooks/usePremium';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsData {
  notifications: {
    enabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  app: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  notifications: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  app: {
    theme: 'auto',
    language: 'en',
  },
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const { isPremium, getPremiumStatusText, resetPremiumForTesting } = usePremium();
  const { colors, theme, toggleTheme, isDark } = useTheme();

  // Create styles with theme colors
  const styles = createStyles(colors);

  // Load settings on focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settingsJson = await AsyncStorage.getItem('appSettings');
      if (settingsJson) {
        const loadedSettings = JSON.parse(settingsJson);
        setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };


  const handleNotificationToggle = (feature: keyof SettingsData['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [feature]: value
      }
    };
    saveSettings(newSettings);
  };


  const handleGoHome = () => {
    router.push('/');
  };

  const debugRevenueCat = async () => {
    try {
      console.log('🔍 ============ REVENUECAT DEBUG START ============');
      
      // Import RevenueCat service
      const { revenueCatService } = await import('../services/RevenueCatService');
      const { getRevenueCatAPIKey } = await import('../constants/revenuecat');
      
      const apiKey = getRevenueCatAPIKey();
      console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
      
      // Get customer info
      const customerInfo = await revenueCatService.getCustomerInfo();
      console.log('👤 Customer Info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all),
      });
      
      // Get offerings
      const offerings = await revenueCatService.getOfferings();
      console.log('📦 Offerings Count:', offerings.length);
      
      if (offerings.length > 0) {
        offerings[0].availablePackages.forEach((pkg, index) => {
          console.log(`📋 Package ${index + 1}:`, {
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            product: pkg.product.identifier,
            price: pkg.product.price
          });
        });
      }
      
      console.log('🔍 ============ REVENUECAT DEBUG END ============');
      
      Alert.alert('Debug Complete', 'Check the console for RevenueCat debug information.');
      
    } catch (error) {
      console.error('🚨 Debug failed:', error);
      Alert.alert('Debug Failed', `Error: ${error}`);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your vitamin plans, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'vitaminPlans',
                'vitaminProgress',
                'appSettings',
                'premiumStatus'
              ]);
              Alert.alert('Success', 'All data has been cleared.', [
                { text: 'OK', onPress: () => router.push('/') }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    isPremiumFeature: boolean = false,
    icon?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingTextContainer}>
          <View style={styles.settingTitleRow}>
            {icon && <Text style={styles.settingIcon}>{icon}</Text>}
            <Text style={styles.settingTitle}>{title}</Text>
            {isPremiumFeature && !isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>✨ PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E5E5', true: '#FF7F50' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
          disabled={isPremiumFeature && !isPremium}
        />
      </View>
    </View>
  );

  const renderSectionHeader = (title: string, icon?: string) => (
    <View style={styles.sectionHeader}>
      {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Customize your Takeamin experience</Text>

        {/* Premium Status */}
        <View style={styles.premiumStatus}>
          <Text style={styles.premiumStatusLabel}>Account Status</Text>
          <Text style={styles.premiumStatusText}>{getPremiumStatusText()}</Text>
        </View>

        {/* Smart Reminders Section - Redirect to dedicated page */}
        {renderSectionHeader('Smart Reminders', '🧠')}
        <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/smart-reminders')}>
          <Text style={styles.settingButtonText}>Configure Smart Reminders</Text>
          <Text style={styles.settingButtonSubtext}>AI-powered timing that learns from your habits</Text>
        </TouchableOpacity>

        {/* Basic Notifications */}
        {renderSectionHeader('Notifications', '🔔')}
        
        {renderSettingItem(
          'Enable Notifications',
          'Receive reminder notifications',
          settings.notifications.enabled,
          (value) => handleNotificationToggle('enabled', value),
          false,
          '🔔'
        )}

        {settings.notifications.enabled && (
          <>
            {renderSettingItem(
              'Sound',
              'Play sound with notifications',
              settings.notifications.soundEnabled,
              (value) => handleNotificationToggle('soundEnabled', value),
              false,
              '🔊'
            )}

            {renderSettingItem(
              'Vibration',
              'Vibrate device for notifications',
              settings.notifications.vibrationEnabled,
              (value) => handleNotificationToggle('vibrationEnabled', value),
              false,
              '📳'
            )}
          </>
        )}

        {/* Display Settings */}
        {renderSectionHeader('Display', '🎨')}

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingTextContainer}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingIcon}>🌓</Text>
                <Text style={styles.settingTitle}>Dark Mode</Text>
              </View>
              <Text style={styles.settingDescription}>
                {isDark ? 'Professional dark theme enabled' : 'Warm light theme enabled'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E5E5', true: '#FF7F50' }}
              thumbColor={isDark ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Developer Section (remove in production) */}
        {__DEV__ && (
          <>
            {renderSectionHeader('Developer', '⚙️')}
            <TouchableOpacity style={styles.actionButton} onPress={resetPremiumForTesting}>
              <Text style={styles.actionButtonText}>Reset Premium Status (Dev)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]} 
              onPress={debugRevenueCat}
            >
              <Text style={styles.actionButtonText}>🔍 Debug RevenueCat (Dev)</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Legal & Safety */}
        {renderSectionHeader('Legal & Safety', '\u2696\ufe0f')}
        <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/medical-disclaimer')}>
          <Text style={styles.medicalDisclaimerText}>Medical Disclaimer</Text>
          <Text style={styles.medicalDisclaimerSubtext}>Review important health information</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        {renderSectionHeader('Data Management', '⚠️')}
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Takeamin • Version 1.0.0{'\n'}Made with ❤️ for your health journey          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Create styles function that accepts theme colors
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 100,
  },
  premiumStatus: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
  },
  premiumStatusLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 5,
  },
  premiumStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  premiumBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  premiumSection: {
    marginBottom: 20,
  },
  premiumPrompt: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  premiumPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  premiumPromptText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  settingButton: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 20,
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingButtonSubtext: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  medicalDisclaimerText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary, // Black color for better visibility
    marginBottom: 4,
  },
    medicalDisclaimerSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}