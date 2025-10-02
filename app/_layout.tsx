import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { requestNotificationPermissions } from '@/utils/notifications';
import { hasAcceptedMedicalDisclaimer } from '@/utils/medical-disclaimer';
import { router } from 'expo-router';

// Inner component that can access theme context
function AppContent() {
  const { isDark } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Check medical disclaimer and setup notifications when the app starts
  useEffect(() => {
    async function setupApp() {
      try {
        // Check if user has accepted medical disclaimer
        const hasAccepted = await hasAcceptedMedicalDisclaimer();
        if (!hasAccepted) {
          // Navigate to disclaimer screen
          setTimeout(() => {
            router.push('/medical-disclaimer');
          }, 100);
        }
        setDisclaimerChecked(true);

        // Request notification permissions
        const granted = await requestNotificationPermissions();
        if (granted) {
          console.log('✅ Notification permissions granted');
        } else {
          console.log('❌ Notification permissions denied');
        }
      } catch (error) {
        console.error('Error setting up app:', error);
        setDisclaimerChecked(true);
      }
    }

    if (loaded) {
      setupApp();
    }
  }, [loaded]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
        <Stack.Screen name="notification-debug" options={{ headerShown: false }} />
        <Stack.Screen name="choose-vitamin" options={{ headerShown: false }} />
        <Stack.Screen name="select-dosage" options={{ headerShown: false }} />
        <Stack.Screen name="timing" options={{ headerShown: false }} />
        <Stack.Screen name="custom-days" options={{ headerShown: false }} />
        <Stack.Screen name="end-date" options={{ headerShown: false }} />
        <Stack.Screen name="custom-end-date" options={{ headerShown: false }} />
        <Stack.Screen name="summary" options={{ headerShown: false }} />
        <Stack.Screen name="edit-plan" options={{ headerShown: false }} />
        <Stack.Screen name="progress" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="health" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="consistency" options={{ headerShown: false }} />
        <Stack.Screen name="smart-reminders" options={{ headerShown: false }} />
        <Stack.Screen name="medical-disclaimer" options={{ headerShown: false }} />
        <Stack.Screen name="theme-picker" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
