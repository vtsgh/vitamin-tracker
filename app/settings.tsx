import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../hooks/usePremium';
import { PremiumFeatureGate } from '../components/PremiumFeatureGate';
import { PREMIUM_FEATURES, UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';

interface SettingsData {
  smartReminders: {
    enabled: boolean;
    adaptiveTiming: boolean;
    behaviorLearning: boolean;
    locationReminders: boolean;
    multiChannel: boolean;
  };
  notifications: {
    enabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
  app: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  smartReminders: {
    enabled: false,
    adaptiveTiming: false,
    behaviorLearning: false,
    locationReminders: false,
    multiChannel: false,
  },
  notifications: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
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

  const handleSmartReminderToggle = (value: boolean) => {
    const newSettings = {
      ...settings,
      smartReminders: {
        ...settings.smartReminders,
        enabled: value,
        // If disabling, turn off all sub-features
        ...(value ? {} : {
          adaptiveTiming: false,
          behaviorLearning: false,
          locationReminders: false,
          multiChannel: false,
        })
      }
    };
    saveSettings(newSettings);
  };

  const handleSmartFeatureToggle = (feature: keyof SettingsData['smartReminders'], value: boolean) => {
    const newSettings = {
      ...settings,
      smartReminders: {
        ...settings.smartReminders,
        [feature]: value
      }
    };
    saveSettings(newSettings);
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

  const handlePrivacyToggle = (feature: keyof SettingsData['privacy'], value: boolean) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [feature]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleGoHome = () => {
    router.push('/(tabs)/');
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
                { text: 'OK', onPress: () => router.push('/(tabs)/') }
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

        {/* Smart Reminders Section */}
        <PremiumFeatureGate
          feature={PREMIUM_FEATURES.CUSTOM_SCHEDULES}
          upgradePrompt={{
            title: "🧠 Unlock Smart Reminders",
            message: "Get AI-powered reminder timing, behavioral learning, and location-based notifications",
            trigger: UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY
          }}
          fallback={
            <View style={styles.premiumSection}>
              {renderSectionHeader('Smart Reminders', '🧠')}
              <View style={styles.premiumPrompt}>
                <Text style={styles.premiumPromptTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumPromptText}>
                  Unlock intelligent reminders that adapt to your schedule and habits
                </Text>
              </View>
            </View>
          }
        >
          {renderSectionHeader('Smart Reminders', '🧠')}
          
          {renderSettingItem(
            'Enable Smart Reminders',
            'AI-powered reminders that adapt to your routine',
            settings.smartReminders.enabled,
            handleSmartReminderToggle,
            true,
            '🎯'
          )}

          {settings.smartReminders.enabled && (
            <>
              {renderSettingItem(
                'Adaptive Timing',
                'Automatically adjust reminder times based on your response patterns',
                settings.smartReminders.adaptiveTiming,
                (value) => handleSmartFeatureToggle('adaptiveTiming', value),
                true,
                '⏰'
              )}

              {renderSettingItem(
                'Behavior Learning',
                'Learn from your habits to optimize reminder timing',
                settings.smartReminders.behaviorLearning,
                (value) => handleSmartFeatureToggle('behaviorLearning', value),
                true,
                '🧠'
              )}

              {renderSettingItem(
                'Location Reminders',
                'Get reminded when you arrive at home or work',
                settings.smartReminders.locationReminders,
                (value) => handleSmartFeatureToggle('locationReminders', value),
                true,
                '📍'
              )}

              {renderSettingItem(
                'Multi-Channel Notifications',
                'Use multiple reminder methods (push, widget, etc.)',
                settings.smartReminders.multiChannel,
                (value) => handleSmartFeatureToggle('multiChannel', value),
                true,
                '📱'
              )}
            </>
          )}
        </PremiumFeatureGate>

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

        {/* Privacy Section */}
        {renderSectionHeader('Privacy', '🔒')}
        
        {renderSettingItem(
          'Data Collection',
          'Help improve the app by sharing anonymous usage data',
          settings.privacy.dataCollection,
          (value) => handlePrivacyToggle('dataCollection', value),
          false,
          '📊'
        )}

        {renderSettingItem(
          'Analytics',
          'Share app usage analytics to help us improve features',
          settings.privacy.analytics,
          (value) => handlePrivacyToggle('analytics', value),
          false,
          '📈'
        )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF7F50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  homeButtonIcon: {
    fontSize: 18,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  premiumStatus: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
  },
  premiumStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  premiumStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7F50',
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
    color: '#333',
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
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
    color: '#333',
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
  premiumSection: {
    marginBottom: 20,
  },
  premiumPrompt: {
    backgroundColor: '#F8F9FF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8EAFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  premiumPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 8,
  },
  premiumPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#87CEEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
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
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 20,
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  settingButtonSubtext: {
    fontSize: 14,
    color: "#666",
  },
  medicalDisclaimerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000", // Black color for better visibility
    marginBottom: 4,
  },
  medicalDisclaimerSubtext: {
    fontSize: 14,
    color: "#000", // Black color for consistency
  },
});