import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import VitaminCapsule from '../../components/VitaminCapsule';
// Premium imports removed - using donation model instead
// Debug utilities removed for cleaner build

interface FeatureButton {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string | null; // null for special buttons like donate/debug
  enabled: boolean;
}

const FEATURES: FeatureButton[] = [
  {
    id: 'schedule',
    title: 'My Vitamin Schedule',
    subtitle: 'View and manage your plans',
    icon: '📅',
    color: '#FF7F50', // Primary coral
    route: '/schedule',
    enabled: true
  },
  {
    id: 'progress',
    title: 'Progress Tracking',
    subtitle: 'See your consistency',
    icon: '📊',
    color: '#98FB98', // Health green
    route: '/progress',
    enabled: true
  },
  {
    id: 'donate',
    title: 'Support Takeamin',
    subtitle: 'Help keep the app free',
    icon: '💝',
    color: '#FF69B4', // Hot pink for donation
    route: null, // Special handling
    enabled: true
  },
  {
    id: 'smart-reminders',
    title: 'Smart Reminders',
    subtitle: 'AI-powered timing & settings',
    icon: '🔔',
    color: '#67E8F9', // Light cyan
    route: '/smart-reminders',
    enabled: true
  },
  {
    id: 'health',
    title: 'Health Insights',
    subtitle: 'Learn about vitamins',
    icon: '💡',
    color: '#DDA0DD', // Light purple
    route: '/health',
    enabled: true
  },
  {
    id: 'polls',
    title: 'Polls & Feedback',
    subtitle: 'Share your thoughts',
    icon: '📊',
    color: '#FFB347', // Secondary orange
    route: '/community',
    enabled: true
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Customize your experience',
    icon: '⚙️',
    color: '#6B7280', // Gray
    route: '/settings',
    enabled: true
  }
];

// Development-only debug feature
const DEV_FEATURES: FeatureButton[] = __DEV__ ? [{
  id: 'notification-debug',
  title: '🧪 Debug Notifications',
  subtitle: 'Test & audit notifications',
  icon: '🔧',
  color: '#8B5CF6', // Purple for debug
  route: null, // Special handling
  enabled: true
}] : [];

export default function Home() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const lastTapTime = useRef(0);
  
  // Premium system removed - using donation model instead
  
  // Animation values
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const capsuleScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const capsuleRotation = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      // Reset navigation state when screen comes into focus
      setIsNavigating(false);
      
      // Only trigger intro animations on first load
      if (!hasAnimated) {
        startIntroAnimations();
        setHasAnimated(true);
      } else {
        // Show elements immediately without animation when returning
        showElementsImmediately();
      }
    }, [hasAnimated, startIntroAnimations, showElementsImmediately])
  );

  const startIntroAnimations = useCallback(() => {
    // Reset all animations
    titleOpacity.value = 0;
    subtitleOpacity.value = 0;
    capsuleScale.value = 0;
    buttonsOpacity.value = 0;
    capsuleRotation.value = 0;

    // Sequence: Title -> Capsule -> Subtitle -> Buttons
    // 1. Title fades in
    titleOpacity.value = withTiming(1, { duration: 800 });

    // 2. Capsule bounces in with rotation (delay 400ms)
    setTimeout(() => {
      capsuleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      capsuleRotation.value = withSpring(360, { damping: 10, stiffness: 80 });
    }, 400);

    // 3. Subtitle fades in (delay 800ms)
    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    // 4. Buttons fade in (delay 1200ms)
    setTimeout(() => {
      buttonsOpacity.value = withTiming(1, { duration: 700 });
    }, 1200);
  }, [titleOpacity, capsuleScale, capsuleRotation, subtitleOpacity, buttonsOpacity]);

  const showElementsImmediately = useCallback(() => {
    // Show all elements immediately without animation when returning
    titleOpacity.value = 1;
    subtitleOpacity.value = 1;
    capsuleScale.value = 1;
    buttonsOpacity.value = 1;
    capsuleRotation.value = 0; // Reset rotation
  }, [titleOpacity, subtitleOpacity, capsuleScale, buttonsOpacity, capsuleRotation]);

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: withTiming((1 - titleOpacity.value) * -20) }],
    };
  });

  const animatedSubtitleStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: withTiming((1 - subtitleOpacity.value) * -15) }],
    };
  });

  const animatedCapsuleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: capsuleScale.value },
        { rotate: `${capsuleRotation.value}deg` },
      ],
    };
  });

  const animatedButtonsStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonsOpacity.value,
      transform: [{ translateY: withTiming((1 - buttonsOpacity.value) * 20) }],
    };
  });

  const handleDonationPress = () => {
    Alert.alert(
      "💝 Support Takeamin",
      "Help us keep Takeamin free for everyone! Your support helps us maintain the app and add new features.",
      [
        { text: "Maybe Later", style: "cancel" },
        {
          text: "Buy me a coffee! ☕",
          onPress: async () => {
            try {
              const donationURL = 'https://buymeacoffee.com/Takeamin';
              const supported = await Linking.canOpenURL(donationURL);

              if (supported) {
                await Linking.openURL(donationURL);
                console.log('💝 Opening donation page - thank you for supporting Takeamin!');
              } else {
                Alert.alert(
                  'Unable to open donation page',
                  'Please visit: buymeacoffee.com/Takeamin'
                );
              }
            } catch (error) {
              console.error('Error opening donation link:', error);
              Alert.alert(
                'Unable to open donation page',
                'Please visit: buymeacoffee.com/Takeamin'
              );
            }
          }
        }
      ]
    );
  };

  const handleFeaturePress = (feature: FeatureButton) => {
    const now = Date.now();
    if (now - lastTapTime.current < 500 || isNavigating) { // 500ms debounce
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;

    // Handle donation specially
    if (feature.id === 'donate') {
      handleDonationPress();
      return;
    }

    // Handle debug notifications (dev only)
    if (feature.id === 'notification-debug') {
      router.push('/notification-debug');
      return;
    }

    if (!feature.enabled) {
      // Show coming soon message for disabled features
      console.log(`🚧 ${feature.title} is coming soon!`);
      return;
    }

    // Only navigate if there's a route
    if (feature.route) {
      console.log(`✅ Navigating to ${feature.title}`);
      setIsNavigating(true);
      router.push(feature.route as any);
    }
  };

  const renderFeatureButton = (feature: FeatureButton, index: number) => {
    const isDisabled = !feature.enabled;
    
    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.featureButton,
          { backgroundColor: feature.color },
          isDisabled && styles.disabledButton
        ]}
        onPress={() => handleFeaturePress(feature)}
        disabled={isNavigating}
      >
        <View style={styles.featureButtonContent}>
          <Text style={styles.featureIcon}>{feature.icon}</Text>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureTitle, isDisabled && styles.disabledText]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureSubtitle, isDisabled && styles.disabledText]}>
              {isDisabled ? 'Coming Soon!' : feature.subtitle}
            </Text>
          </View>
          {!isDisabled && (
            <Text style={styles.featureArrow}>→</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.Text style={[styles.appTitle, animatedTitleStyle]}>
            Welcome to Takeamin
          </Animated.Text>
          
          <Animated.View style={[styles.capsuleContainer, animatedCapsuleStyle]}>
            <VitaminCapsule size={80} />
          </Animated.View>
          
          <Animated.Text style={[styles.appSubtitle, animatedSubtitleStyle]}>
            Your personal vitamin companion for better health! 🌟
          </Animated.Text>
        </View>

        {/* Feature Buttons Grid */}
        <Animated.View style={[styles.featuresSection, animatedButtonsStyle]}>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => renderFeatureButton(feature, index))}
            {/* Development debug features */}
            {DEV_FEATURES.map((feature, index) => renderFeatureButton(feature, FEATURES.length + index))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Premium upgrade modal removed - using donation model instead */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0', // soft cream color
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50', // coral color
    textAlign: 'center',
    marginBottom: 20,
  },
  capsuleContainer: {
    marginBottom: 20,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    flex: 1,
  },
  featuresGrid: {
    gap: 15,
  },
  featureButton: {
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  featureArrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});