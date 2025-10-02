import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemePicker() {
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null);

  const handleThemeSelect = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
  };

  const handleContinue = () => {
    if (selectedTheme) {
      setTheme(selectedTheme);
      // Navigate to home
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Theme</Text>
        <Text style={styles.subtitle}>
          You can always change this later in Settings
        </Text>

        <View style={styles.themesContainer}>
          {/* Light Theme Option */}
          <ThemeOption
            title="Light Mode"
            description="Warm and welcoming"
            icon="☀️"
            isSelected={selectedTheme === 'light'}
            onPress={() => handleThemeSelect('light')}
            preview={{
              background: '#FAF3E0',
              primary: '#FF7F50',
              surface: '#FFFFFF',
              text: '#333333',
            }}
          />

          {/* Dark Theme Option */}
          <ThemeOption
            title="Dark Mode"
            description="Sleek and professional"
            icon="🌙"
            isSelected={selectedTheme === 'dark'}
            onPress={() => handleThemeSelect('dark')}
            preview={{
              background: '#1E1E1E',
              primary: '#FF8A65',
              surface: '#252526',
              text: '#D4D4D4',
            }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedTheme && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedTheme}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface ThemeOptionProps {
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  preview: {
    background: string;
    primary: string;
    surface: string;
    text: string;
  };
}

function ThemeOption({ title, description, icon, isSelected, onPress, preview }: ThemeOptionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.themeOptionContent, animatedStyle]}>
        <View style={styles.themeHeader}>
          <Text style={styles.themeIcon}>{icon}</Text>
          <View style={styles.themeTextContainer}>
            <Text style={styles.themeTitle}>{title}</Text>
            <Text style={styles.themeDescription}>{description}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
        </View>

        {/* Theme Preview */}
        <View style={[styles.themePreview, { backgroundColor: preview.background }]}>
          <View style={[styles.previewCard, { backgroundColor: preview.surface }]}>
            <View style={[styles.previewAccent, { backgroundColor: preview.primary }]} />
            <View style={styles.previewTextLines}>
              <View style={[styles.previewTextLine, { backgroundColor: preview.text, opacity: 0.9 }]} />
              <View style={[styles.previewTextLine, { backgroundColor: preview.text, opacity: 0.6, width: '60%' }]} />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0', // Default to light background for theme picker
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  themesContainer: {
    gap: 20,
    marginBottom: 40,
  },
  themeOption: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themeOptionSelected: {
    borderColor: '#FF7F50',
    backgroundColor: '#FFF5F0',
  },
  themeOptionContent: {
    gap: 15,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeIcon: {
    fontSize: 32,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF7F50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themePreview: {
    height: 100,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: '90%',
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  previewTextLines: {
    gap: 6,
  },
  previewTextLine: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
