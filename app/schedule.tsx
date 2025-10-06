import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { VitaminPlan } from '../types/VitaminPlan';
import { cancelNotifications, formatDisplayTime } from '../utils/notifications';
import VitaminCapsule from '../components/VitaminCapsule';
// import { MAX_VITAMIN_PLANS } from '../constants/limits'; // Now using premium limits
import { usePremium } from '../hooks/usePremium';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';
// Premium imports removed - all features now free
import { useTheme } from '@/contexts/ThemeContext';

export default function Schedule() {
  const { colors } = useTheme();
  const [vitaminPlans, setVitaminPlans] = useState<VitaminPlan[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const lastTapTime = useRef(0);
  const buttonScale = useSharedValue(1);
  const addButtonScale = useSharedValue(1);

  const { getLimit, isLimitReached, triggerUpgrade, showUpgradeModal, closeUpgradeModal, upgradeContext } = usePremium();

  // Create styles with theme colors
  const styles = createStyles(colors);
  
  // Intro animation values
  const titleOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const emojiRotation = useSharedValue(0);

  // Define animation functions before useFocusEffect to avoid hoisting errors
  const startIntroAnimations = useCallback(() => {
    // Reset all animations
    titleOpacity.value = 0;
    sloganOpacity.value = 0;
    contentOpacity.value = 0;
    emojiScale.value = 0;
    emojiRotation.value = 0;

    // Sequence: Title -> Emoji bounce -> Slogan -> Content
    // 1. Title fades in
    titleOpacity.value = withTiming(1, { duration: 800 });

    // 2. Emoji bounces in with rotation (delay 400ms)
    setTimeout(() => {
      emojiScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      emojiRotation.value = withSpring(360, { damping: 10, stiffness: 80 });
    }, 400);

    // 3. Slogan fades in (delay 800ms)
    setTimeout(() => {
      sloganOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    // 4. Content fades in (delay 1200ms)
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 700 });
    }, 1200);
  }, [titleOpacity, sloganOpacity, contentOpacity, emojiScale, emojiRotation]);

  const showElementsImmediately = useCallback(() => {
    // Show all elements immediately without animation when returning from edit
    titleOpacity.value = 1;
    sloganOpacity.value = 1;
    contentOpacity.value = 1;
    emojiScale.value = 1;
    emojiRotation.value = 0; // Reset rotation
  }, [titleOpacity, sloganOpacity, contentOpacity, emojiScale, emojiRotation]);

  useFocusEffect(
    useCallback(() => {
      const fetchPlans = async () => {
        try {
          const plansJson = await AsyncStorage.getItem('vitaminPlans');
          const plans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
          setVitaminPlans(plans);
        } catch (error) {
          console.error('Error loading vitamin plans:', error);
        }
      };
      fetchPlans();
      // Reset navigation state when screen comes into focus
      setIsNavigating(false);

      // Only trigger intro animations on first load or after creating a new plan
      if (!hasAnimated) {
        startIntroAnimations();
        setHasAnimated(true);
      } else {
        // Show elements immediately without animation when returning from edit
        showElementsImmediately();
      }
    }, [hasAnimated, startIntroAnimations, showElementsImmediately])
  );

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedAddButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: addButtonScale.value }],
    };
  });

  // Intro animation styles
  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: withTiming((1 - titleOpacity.value) * -20) }],
    };
  });

  const animatedSloganStyle = useAnimatedStyle(() => {
    return {
      opacity: sloganOpacity.value,
      transform: [{ translateY: withTiming((1 - sloganOpacity.value) * -15) }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: withTiming((1 - contentOpacity.value) * 20) }],
    };
  });

  const animatedEmojiStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: emojiScale.value },
        { rotate: `${emojiRotation.value}deg` },
      ],
    };
  });

  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  };

  const handleGetStarted = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 1000 || isNavigating) { // 1 second debounce
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;
    console.log('✅ Getting started');
    setIsNavigating(true);
    
    // Button animation with proper confetti timing
    buttonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { duration: 150 });
      // Reset hasAnimated AFTER animation to avoid conflicts
      setHasAnimated(false);
      triggerConfetti();
      
      // Wait for confetti to finish properly - keep original timing
      setTimeout(() => {
        router.push('/choose-vitamin');
      }, 1200); // Original timing to let confetti complete
    }, 100);
  };

  const handleAddAnother = () => {
    // No plan limits - all users can create unlimited plans now

    const now = Date.now();
    if (now - lastTapTime.current < 1000 || isNavigating) { // 1 second debounce
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;
    console.log('✅ Adding another plan');
    setIsNavigating(true);
    
    // Button animation with proper confetti timing
    addButtonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      addButtonScale.value = withSpring(1, { duration: 150 });
      // Reset hasAnimated AFTER animation to avoid conflicts
      setHasAnimated(false);
      triggerConfetti();
      
      // Wait for confetti to finish properly - keep original timing
      setTimeout(() => {
        router.push('/choose-vitamin');
      }, 1200); // Original timing to let confetti complete
    }, 100);
  };

  const handleDeletePlan = (plan: VitaminPlan) => {
    Alert.alert(
      'Delete Vitamin Plan',
      `Are you sure you want to delete your ${plan.vitamin} plan?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel all notifications for this plan
              if (plan.notificationIds && plan.notificationIds.length > 0) {
                console.log('🔔 Cancelling notifications for:', plan.vitamin, 'IDs:', plan.notificationIds);
                const result = await cancelNotifications(plan.notificationIds);
                console.log(`✅ Notifications cancellation result: ${result.cancelled} cancelled, ${result.failed} failed`);
              } else if (plan.notificationId) {
                // Handle legacy single notification ID (backward compatibility)
                console.log('🔔 Cancelling legacy notification for:', plan.vitamin, 'ID:', plan.notificationId);
                const result = await cancelNotifications([plan.notificationId]);
                console.log(`✅ Legacy notification cancellation result: ${result.cancelled} cancelled, ${result.failed} failed`);
              } else {
                console.log('ℹ️ No notification IDs found for this plan');
              }

              // Read fresh data from AsyncStorage to ensure we have the latest
              const existingPlansJson = await AsyncStorage.getItem('vitaminPlans');
              const existingPlans: VitaminPlan[] = existingPlansJson ? JSON.parse(existingPlansJson) : [];
              
              // Filter out the plan with matching ID
              const updatedPlans = existingPlans.filter(p => p.id !== plan.id);
              
              console.log('🗑️ Deleting plan with ID:', plan.id);
              console.log('Plans before delete:', existingPlans.map(p => ({ id: p.id, vitamin: p.vitamin })));
              console.log('Plans after delete:', updatedPlans.map(p => ({ id: p.id, vitamin: p.vitamin })));
              
              // Save back to AsyncStorage
              await AsyncStorage.setItem('vitaminPlans', JSON.stringify(updatedPlans));
              
              // Update local state
              setVitaminPlans(updatedPlans);
            } catch (error) {
              console.error('❌ Error deleting vitamin plan:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditPlan = (plan: VitaminPlan) => {
    router.push({
      pathname: '/edit-plan',
      params: {
        id: plan.id,
        vitamin: plan.vitamin,
        dosageAmount: plan.dosage?.amount?.toString() || undefined,
        dosageUnit: plan.dosage?.unit || undefined,
        dosageDisplay: plan.dosage?.displayText || undefined,
        frequency: plan.frequency,
        endDate: plan.endDate,
        customDays: plan.customDays ? JSON.stringify(plan.customDays) : undefined,
        reminderTime: plan.reminderTime || '09:00',
        notificationIds: plan.notificationIds ? JSON.stringify(plan.notificationIds) : undefined,
      }
    });
  };

  const formatFrequency = (frequency: string, customDays?: string[]) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'every-other-day':
        return 'Every other day';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return customDays && customDays.length > 0 
          ? `Custom (${customDays.length} days/week)`
          : 'Custom';
      default:
        return frequency;
    }
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGoHome = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 500 || isNavigating) { // 500ms debounce for home
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;
    setIsNavigating(true);
    console.log('✅ Navigating to home');
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Home Button - Top Left Corner */}
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={handleGoHome}
        accessible={true}
        accessibilityLabel="Go to home screen"
        accessibilityRole="button"
      >
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <Animated.Text style={[styles.appName, animatedTitleStyle]}>Takeamin</Animated.Text>
      <Animated.View style={[styles.sloganRow, animatedSloganStyle]}>
        <Animated.Text style={styles.slogan}>To take your Vitamin!</Animated.Text>
        <Animated.View style={[styles.capsuleContainer, animatedEmojiStyle]}>
          <VitaminCapsule size={40} />
        </Animated.View>
      </Animated.View>
      
      <Animated.View style={animatedContentStyle}>
        {vitaminPlans.length === 0 ? (
          <>
            <Text style={styles.emptyState}>You haven&apos;t added any vitamin plans yet!</Text>
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity 
                style={[styles.button, isNavigating && styles.disabledButton]} 
                onPress={handleGetStarted}
                disabled={isNavigating}
              >
                <Text style={styles.buttonText}>
                  {isNavigating ? 'Loading...' : 'Get Started!'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <>
            <ScrollView style={styles.plansContainer} contentContainerStyle={styles.plansContent}>
              <View style={styles.plansGrid}>
                {vitaminPlans.map((plan) => (
                  <View key={plan.id} style={[styles.planCard, vitaminPlans.length === 1 && styles.singlePlanCard]}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planVitamin}>{plan.vitamin}</Text>
                      {plan.dosage && (
                        <View style={styles.planDosageContainer}>
                          <VitaminCapsule size={12} style={styles.vitaminIcon} />
                          <Text style={styles.planDosage}>{plan.dosage.displayText}</Text>
                        </View>
                      )}
                      <Text style={styles.planFrequency}>{formatFrequency(plan.frequency, plan.customDays)}</Text>
                      {plan.reminderTime && (
                        <Text style={styles.planReminderTime}>Reminder at {formatDisplayTime(plan.reminderTime)}</Text>
                      )}
                      <Text style={styles.planEndDate}>Until {formatDate(plan.endDate)}</Text>
                    </View>
                    <View style={styles.planActions}>
                      <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => handleEditPlan(plan)}
                      >
                        <Text style={styles.actionButtonIcon}>✏️</Text>
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => handleDeletePlan(plan)}
                      >
                        <Text style={styles.actionButtonIcon}>🗑️</Text>
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.fixedButtonContainer}>
              <Animated.View style={animatedAddButtonStyle}>
                <TouchableOpacity 
                  style={[
                    styles.addButton, 
                    isNavigating && styles.disabledButton
                  ]} 
                  onPress={handleAddAnother}
                  disabled={isNavigating}
                >
                  <Text style={styles.buttonText}>
                    {isNavigating 
                      ? 'Loading...' 
                      : isLimitReached('MAX_PLANS', vitaminPlans.length)
                        ? `✨ Upgrade for Unlimited Plans (${vitaminPlans.length}/${getLimit('MAX_PLANS')})`
                        : 'Add Another Plan'
                    }
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        )}
      </Animated.View>
      <ConfettiCannon
        ref={confettiRef}
        count={60}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={450}
        fallSpeed={2200}
        colors={['#FF7F50', '#FFB347', '#98FB98', '#87CEEB', '#DDA0DD']}
      />

      <PremiumUpgradeModal
        visible={showUpgradeModal}
        onClose={closeUpgradeModal}
        context={upgradeContext || undefined}
      />
    </SafeAreaView>
  );
}

// Create styles function that accepts theme colors
function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 20,
    },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary, // coral-like color
    marginTop: 60, // Reduced since we made header more compact
    marginBottom: 10,
  },
  sloganRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Total spacing for both slogan and capsule
    position: 'relative',
  },
  slogan: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  capsuleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: 15, // Position right next to "Vitamin!" with minimal space
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
    emptyState: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  plansContainer: {
    flex: 1, // Take remaining space
    marginTop: 20,
    marginBottom: 80, // Space for fixed button at bottom
  },
  plansContent: {
    paddingVertical: 10,
    paddingBottom: 20, // Normal bottom padding
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    width: '47%',
    minHeight: 180, // Increased to contain buttons properly
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  singlePlanCard: {
    width: 160,
    alignSelf: 'center',
  },
  planInfo: {
    marginBottom: 15,
  },
  planVitamin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  planDosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vitaminIcon: {
    marginRight: 4,
  },
    planDosage: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    planFrequency: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 3,
    },
  planReminderTime: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 3,
  },
    planEndDate: {
      fontSize: 11,
      color: colors.textTertiary,
    },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 120, // Fixed position from bottom
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Remove background to prevent flashing
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: 'center',
  },
  disabledButton: {
    opacity: 0.6,
    // Keep original background color to prevent flashing, just reduce opacity
  },
  homeButton: {
    position: 'absolute',
    top: 50, // Position in the top area before the title
    left: 20, // Align with container padding
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary, // Coral theme color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1, // Ensure it's above other elements
  },
    homeButtonIcon: {
      fontSize: 18,
      color: colors.white,
    },
  });
}