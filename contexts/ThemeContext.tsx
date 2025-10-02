import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Primary/Accent
  primary: string;
  primaryLight: string;

  // Status
  success: string;
  warning: string;
  error: string;

  // Feature Button Colors (home page)
  scheduleButton: string;
  progressButton: string;
  donateButton: string;
  smartRemindersButton: string;
  healthButton: string;
  pollsButton: string;
  settingsButton: string;

  // Calendar
  calendarToday: string;
  calendarCompleted: string;
  calendarBackground: string;
  calendarBorder: string;
  calendarText: string;

  // Borders & Dividers
  border: string;
  borderLight: string;

  // Shadows
  shadowColor: string;

  // Special
  white: string;
  black: string;
}

const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#FAF3E0',      // Soft cream
  surface: '#FFFFFF',          // White cards
  surfaceElevated: '#FFFFFF',  // Modals/elevated surfaces

  // Text
  textPrimary: '#333333',      // Dark text
  textSecondary: '#555555',    // Medium text
  textTertiary: '#888888',     // Light text/disabled

  // Primary/Accent
  primary: '#FF7F50',          // Coral
  primaryLight: '#FF9A76',     // Lighter coral

  // Status
  success: '#98FB98',          // Health green
  warning: '#FFB347',          // Orange
  error: '#F48771',            // Soft red

  // Feature Button Colors (vibrant in light mode)
  scheduleButton: '#8B5CF6',   // Purple
  progressButton: '#98FB98',   // Green
  donateButton: '#FF7F50',     // Coral
  smartRemindersButton: '#67E8F9', // Cyan
  healthButton: '#DDA0DD',     // Plum
  pollsButton: '#FFB347',      // Orange
  settingsButton: '#6B7280',   // Gray

  // Calendar
  calendarToday: '#87CEEB',    // Sky blue
  calendarCompleted: '#FF7F50', // Coral
  calendarBackground: '#FFFFFF',
  calendarBorder: '#D1D5DB',
  calendarText: '#333333',

  // Borders & Dividers
  border: '#D1D5DB',
  borderLight: '#E5E7EB',

  // Shadows
  shadowColor: '#000000',

  // Special
  white: '#FFFFFF',
  black: '#000000',
};

const darkTheme: ThemeColors = {
  // Backgrounds - VSCode inspired dark greys
  background: '#1E1E1E',       // VSCode dark background
  surface: '#252526',          // Cards/surfaces (slightly lighter)
  surfaceElevated: '#2D2D30',  // Modals/elevated (lighter still)

  // Text - light greys for readability
  textPrimary: '#D4D4D4',      // Main text (VSCode default text color)
  textSecondary: '#9CA3AF',    // Secondary text
  textTertiary: '#6B7280',     // Tertiary/disabled text

  // Primary/Accent - softer, more professional
  primary: '#FF8A65',          // Softer coral for dark mode
  primaryLight: '#FFAB91',     // Lighter soft coral

  // Status - toned down but still recognizable
  success: '#4EC9B0',          // Teal green (VSCode success color)
  warning: '#D7BA7D',          // Muted gold
  error: '#F48771',            // Soft red

  // Feature Button Colors (desaturated, more serious/professional)
  scheduleButton: '#7C3AED',   // Deeper purple (less vibrant)
  progressButton: '#10B981',   // Emerald green (more serious than light green)
  donateButton: '#F59E0B',     // Amber/burnt orange (sophisticated coffee color)
  smartRemindersButton: '#06B6D4', // Darker cyan (more professional)
  healthButton: '#A78BFA',     // Light purple (softer than plum)
  pollsButton: '#FB923C',      // Burnt orange (toned down)
  settingsButton: '#6B7280',   // Same grey (neutral)

  // Calendar
  calendarToday: '#569CD6',    // VSCode blue highlight
  calendarCompleted: '#4EC9B0', // Teal (different from coral to add variety)
  calendarBackground: '#2D2D30',
  calendarBorder: '#3E3E42',
  calendarText: '#D4D4D4',

  // Borders & Dividers
  border: '#3E3E42',           // Subtle borders
  borderLight: '#2D2D30',      // Very subtle

  // Shadows
  shadowColor: '#000000',

  // Special
  white: '#FFFFFF',
  black: '#000000',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>('light'); // Default to light mode
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const isDark = theme === 'dark';

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
