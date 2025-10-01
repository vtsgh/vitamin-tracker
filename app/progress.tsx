import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAllAvailableBadges, Badge, ProgressData } from '../types/Progress';
import { VitaminPlan } from '../types/VitaminPlan';
import {
  getMotivationalMessage,
  getProgressData,
  getStreakForPlan,
  hasCheckInForDate,
  recordCheckIn,
  calculateStreakWithRecoveries
} from '../utils/progress';
import { SmartNotificationEngine } from '../utils/smart-notifications';
import { useSmartReminders } from '../hooks/useSmartReminders';
// Premium imports removed - using donation model instead
import { SmartSnoozeModal } from '../components/SmartSnoozeModal';

export default function Progress() {
  const [vitaminPlans, setVitaminPlans] = useState<VitaminPlan[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({ checkIns: [], streaks: [], badges: [], streakRecoveries: [] });
  const [selectedPlan, setSelectedPlan] = useState<VitaminPlan | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showSmartSnoozeModal, setShowSmartSnoozeModal] = useState(false);
  const [snoozeInfo, setSnoozeInfo] = useState<{ vitaminName: string; planId: string; originalTime: string; isTodayCompleted: boolean } | null>(null);
  
  const confettiRef = useRef<ConfettiCannon>(null);
  // Premium system removed - all features available to all users
  const { settings: smartSettings, recordNotificationResponse } = useSmartReminders();


  const loadData = useCallback(async () => {
    try {
      // Load vitamin plans
      const plansJson = await AsyncStorage.getItem('vitaminPlans');
      const plans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
      setVitaminPlans(plans);
      
      // Set first plan as selected by default
      if (plans.length > 0 && !selectedPlan) {
        setSelectedPlan(plans[0]);
      }

      // Load progress data
      const progress = await getProgressData();
      setProgressData(progress);
      
      // Streak recovery system removed - streaks no longer break
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  }, [selectedPlan]);


  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToSchedule = () => {
    router.push('/schedule');
  };

  const handleCheckIn = async (date: string) => {
    if (!selectedPlan || isLoading) return;

    // Check if date is before plan creation
    if (selectedPlan.createdDate && date < selectedPlan.createdDate) {
      const planCreatedDate = new Date(selectedPlan.createdDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      Alert.alert(
        '📅 Date Not Available',
        `You can only track vitamins from ${planCreatedDate} onwards, when you created this plan!`,
        [{ text: 'Got it!', style: 'default' }]
      );
      return;
    }

    // Check if this day is already checked in
    const isAlreadyCheckedIn = hasCheckInForDate(progressData.checkIns, selectedPlan.id, date);
    
    if (isAlreadyCheckedIn) {
      // Show a different message for already completed days
      const currentStreak = getStreakForPlan(progressData.streaks, selectedPlan.id).currentStreak;
      const encouragingMessage = getMotivationalMessage(currentStreak);
      Alert.alert(
        '✅ Already completed!',
        `You already took your vitamin on this day! ${encouragingMessage}`,
        [{ text: 'Keep going!', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const { newBadges } = await recordCheckIn(selectedPlan.id, date); // All badges available now
      
      // Record successful check-in for behavioral learning
      if (smartSettings.behaviorLearning) {
        console.log('📊 Recording check-in for behavioral learning');
        await recordNotificationResponse('taken', new Date());
        
        // Also record with SmartNotificationEngine for advanced analytics
        await SmartNotificationEngine.recordNotificationResponse(selectedPlan.id, {
          type: 'taken',
          timestamp: new Date(),
          originalTime: selectedPlan.reminderTime || '09:00',
          actualTime: new Date().toTimeString().slice(0, 5) // HH:MM format
        });
      }
      
      // Reload progress data
      const updatedProgress = await getProgressData();
      setProgressData(updatedProgress);

      // Always show encouragement and trigger effects for new check-ins
      const updatedStreak = getStreakForPlan(updatedProgress.streaks, selectedPlan.id);
      const encouragingMessage = getMotivationalMessage(updatedStreak.currentStreak);
      
      // Trigger confetti for milestones and new badges
      if (newBadges.length > 0 || updatedStreak.currentStreak % 3 === 0) {
        triggerConfetti();
      }
      
      if (newBadges.length > 0) {
        // Show badge earned message
        const badgeNames = newBadges.map(b => `${b.icon} ${b.name}`).join(', ');
        Alert.alert(
          '🎉 Badge Earned!',
          `${encouragingMessage}\n\nYou earned: ${badgeNames}`,
          [{ text: 'Amazing!', style: 'default' }]
        );
      } else {
        // Show encouraging check-in message
        Alert.alert(
          '✅ Great job!',
          encouragingMessage,
          [{ text: 'Keep it up!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error recording check-in:', error);
      Alert.alert('Error', 'Failed to record check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  };

  const renderCalendarInstructions = () => {
    return (
      <View style={styles.calendarInstructions}>
        <Text style={styles.calendarInstructionsText}>
          ✨ Gently tap the days you took your vitamin, then scroll to admire your growing trophy case 🏆
        </Text>
      </View>
    );
  };

  const renderCalendarHeader = () => {
    const monthYear = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setCurrentDate(newDate);
          }}
        >
          <Text style={styles.monthNavText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{monthYear}</Text>
        
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setCurrentDate(newDate);
          }}
        >
          <Text style={styles.monthNavText}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCalendarGrid = () => {
    if (!selectedPlan) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Create today's date in local timezone to avoid timezone issues
    const todayLocal = new Date();
    const todayYear = todayLocal.getFullYear();
    const todayMonth = todayLocal.getMonth();
    const todayDay = todayLocal.getDate();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDateIterator = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure full calendar
    for (let i = 0; i < 42; i++) {
      // Create date string using local date components to avoid timezone issues
      const year = currentDateIterator.getFullYear();
      const month = currentDateIterator.getMonth();
      const day = currentDateIterator.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isCurrentMonth = month === currentDate.getMonth();
      
      // More reliable today check using local date components
      const isToday = year === todayYear && month === todayMonth && day === todayDay;
      
      const hasCheckIn = hasCheckInForDate(progressData.checkIns, selectedPlan.id, dateStr);
      
      // Check if future using local date comparison to avoid timezone issues  
      const isFuture = year > todayYear ||
                      (year === todayYear && month > todayMonth) ||
                      (year === todayYear && month === todayMonth && day > todayDay);
      
      // Check if date is before plan creation (prevent checking past dates)
      const isBeforePlanCreation = selectedPlan.createdDate ? dateStr < selectedPlan.createdDate : false;
      
      days.push({
        date: dateStr,
        day: day,
        isCurrentMonth,
        isToday,
        hasCheckIn,
        isFuture,
        isBeforePlanCreation,
      });
      
      currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    return (
      <View style={styles.calendarGrid}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>
        
        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <CalendarDay
              key={`${day.date}-${index}`}
              day={day}
              onPress={() => handleCheckIn(day.date)}
              disabled={day.isFuture || !day.isCurrentMonth || day.isBeforePlanCreation || isLoading}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderPlanSelector = () => {
    if (vitaminPlans.length <= 1) return null;

    return (
      <View style={styles.planSelector}>
        <Text style={styles.planSelectorLabel}>Track progress for:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planOptions}>
          {vitaminPlans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planOption,
                selectedPlan?.id === plan.id && styles.planOptionSelected
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Text style={[
                styles.planOptionText,
                selectedPlan?.id === plan.id && styles.planOptionTextSelected
              ]}>
                {plan.vitamin}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStreakInfo = () => {
    if (!selectedPlan) return null;

    // Use the same method as handleCheckIn for consistency
    const streak = getStreakForPlan(progressData.streaks, selectedPlan.id);
    const message = getMotivationalMessage(streak.currentStreak);

    const handleSmartSnooze = () => {
      // Smart snooze available to all users now
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const isTodayCompleted = hasCheckInForDate(progressData.checkIns, selectedPlan.id, todayStr);

      setSnoozeInfo({
        vitaminName: selectedPlan.vitamin,
        planId: selectedPlan.id,
        originalTime: selectedPlan.reminderTime || '09:00',
        isTodayCompleted
      });
      setShowSmartSnoozeModal(true);
    };

    return (
      <View style={styles.streakInfo}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        <Text style={styles.motivationalMessage}>{message}</Text>
        
        {/* Smart Snooze Button */}
        <TouchableOpacity 
          style={styles.smartSnoozeButton}
          onPress={handleSmartSnooze}
        >
          <Text style={styles.smartSnoozeIcon}>🧠</Text>
          <Text style={styles.smartSnoozeText}>Smart Snooze</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBadgeShelf = () => {
    const earnedBadges = progressData.badges;
    const availableBadges = getAllAvailableBadges(true); // All badges available now
    const totalBadges = availableBadges.length;
    const completionPercentage = totalBadges > 0 ? (earnedBadges.length / totalBadges) * 100 : 0;

    return (
      <View style={styles.badgeShelf}>
        <View style={styles.badgeShelfHeader}>
          <Text style={styles.badgeShelfTitle}>Trophy Case 🏆</Text>
          <Text style={styles.badgeShelfCount}>
            {earnedBadges.length} of {totalBadges} badges earned
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: `${completionPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(completionPercentage)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.badgeGrid}>
          {/* All badges available to everyone */}
          {availableBadges.map(availableBadge => {
            const earnedBadge = earnedBadges.find(b => b.id === availableBadge.id);
            const isEarned = !!earnedBadge;

            return (
              <BadgeItem
                key={availableBadge.id}
                badge={availableBadge}
                isEarned={isEarned}
                earnedDate={earnedBadge?.earnedDate}
              />
            );
          })}
        </View>
        
      </View>
    );
  };

  if (vitaminPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonIcon}>🏠</Text>
        </TouchableOpacity>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Vitamin Plans Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first vitamin plan to start tracking your progress!
          </Text>
          <TouchableOpacity style={styles.createPlanButton} onPress={handleGoToSchedule}>
            <Text style={styles.createPlanButtonText}>Create Your First Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Progress Tracking</Text>
        <Text style={styles.pageSubtitle}>Your Gentle Streak Garden 🌿</Text>
        
        {renderPlanSelector()}
        {renderStreakInfo()}
        {renderCalendarInstructions()}
        {renderCalendarHeader()}
        {renderCalendarGrid()}
        {renderBadgeShelf()}
      </ScrollView>

      <ConfettiCannon
        ref={confettiRef}
        count={40}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={1500}
        colors={['#FF7F50', '#98FB98', '#87CEEB', '#DDA0DD', '#FFB347']}
      />

      {/* Premium upgrade modal removed - using donation model instead */}
      

      {snoozeInfo && (
        <SmartSnoozeModal
          visible={showSmartSnoozeModal}
          onClose={() => {
            setShowSmartSnoozeModal(false);
            setSnoozeInfo(null);
          }}
          vitaminName={snoozeInfo.vitaminName}
          planId={snoozeInfo.planId}
          originalTime={snoozeInfo.originalTime}
          isTodayCompleted={snoozeInfo.isTodayCompleted}
          onSnoozeApplied={(snoozeMinutes) => {
            console.log(`📱 Snooze applied: ${snoozeMinutes} minutes`);
            // Here you could schedule a new notification for the snoozed time
            // For now, we just close the modal
          }}
          onDataChanged={loadData}
        />
      )}
    </SafeAreaView>
  );
}

// Calendar Day Component with animations
interface CalendarDayProps {
  day: {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    hasCheckIn: boolean;
    isFuture: boolean;
    isBeforePlanCreation: boolean;
  };
  onPress: () => void;
  disabled: boolean;
}

function CalendarDay({ day, onPress, disabled }: CalendarDayProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(day.hasCheckIn ? 1 : 0);

  // Update checkScale when hasCheckIn changes
  React.useEffect(() => {
    checkScale.value = withSpring(day.hasCheckIn ? 1 : 0, {
      damping: 8,
      stiffness: 100
    });
  }, [day.hasCheckIn, checkScale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
    };
  });

  const handlePress = () => {
    if (disabled) return;

    // Bounce animation for all interactive days
    scale.value = withSequence(
      withSpring(0.9, { duration: 100 }),
      withSpring(1, { duration: 200 })
    );

    // Only animate check-in for new check-ins
    if (!day.hasCheckIn) {
      checkScale.value = withSpring(1, { 
        damping: 8, 
        stiffness: 100 
      });
    }

    // Trigger the actual check-in
    runOnJS(onPress)();
  };

  return (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        !day.isCurrentMonth && styles.calendarDayInactive,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Animated.View style={[
        styles.calendarDayInner, 
        animatedStyle,
        day.isToday && !day.hasCheckIn && styles.calendarDayTodayInner,
        day.hasCheckIn && styles.calendarDayCompletedInner,
        day.isBeforePlanCreation && styles.calendarDayBeforePlan,
      ]}>
        <Text style={[
          styles.calendarDayText,
          !day.isCurrentMonth && styles.calendarDayTextInactive,
          day.hasCheckIn && styles.calendarDayTextCompleted,
          day.isBeforePlanCreation && styles.calendarDayTextBeforePlan,
        ]}>
          {day.day}
        </Text>
        {day.hasCheckIn && (
          <Animated.View style={[styles.checkMark, checkAnimatedStyle]}>
            <Text style={styles.checkMarkText}>✓</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}


// Badge Item Component
interface BadgeItemProps {
  badge: Omit<Badge, 'earnedDate'>;
  isEarned: boolean;
  earnedDate?: string;
}

function BadgeItem({ badge, isEarned, earnedDate }: BadgeItemProps) {
  const badgeScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: badgeScale.value }],
    };
  });

  const handlePress = () => {
    // Bounce animation
    badgeScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 200 })
    );

    // Show details for earned badges
    if (isEarned && earnedDate) {
      const formattedDate = new Date(earnedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      Alert.alert(
        `${badge.icon} ${badge.name}`,
        `${badge.description}\n\nEarned on ${formattedDate}`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    } else {
      // Show requirement for unearned badges
      Alert.alert(
        `${badge.icon} ${badge.name}`,
        `${badge.description}\n\nRequirement: ${badge.requirement} ${badge.category === 'streak' ? 'day streak' : 'days'}`,
        [{ text: 'Got it!', style: 'default' }]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.badgeItem,
        !isEarned && styles.badgeItemLocked
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.badgeItemInner, animatedStyle]}>
        <Text style={[
          styles.badgeIcon,
          !isEarned && styles.badgeIconLocked
        ]}>
          {badge.icon}
        </Text>
        <Text style={[
          styles.badgeName,
          !isEarned && styles.badgeNameLocked
        ]} numberOfLines={2}>
          {badge.name}
        </Text>
        {isEarned && (
          <View style={styles.earnedIndicator}>
            <Text style={styles.earnedIndicatorText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
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
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  planSelector: {
    marginBottom: 20,
  },
  planSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  planOptions: {
    flexDirection: 'row',
  },
  planOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  planOptionSelected: {
    backgroundColor: '#FF7F50',
  },
  planOptionText: {
    color: '#555',
    fontWeight: '500',
  },
  planOptionTextSelected: {
    color: '#fff',
  },
  streakInfo: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  streakBadge: {
    alignItems: 'center',
    marginBottom: 15,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  streakLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  smartSnoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  smartSnoozeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  smartSnoozeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7F50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  calendarGrid: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 40,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    width: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayInner: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  calendarDayTodayInner: {
    backgroundColor: '#87CEEB', // Full blue background for today
    borderColor: '#1E40AF',
    borderWidth: 3,
    elevation: 3,
    shadowOpacity: 0.2,
  },
  calendarDayCompletedInner: {
    backgroundColor: '#FF7F50', // Coral background for completed days
    borderColor: '#B91C1C',
    borderWidth: 3,
    elevation: 3,
    shadowOpacity: 0.2,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  calendarDayTextInactive: {
    color: '#ccc',
  },
  calendarDayTextCompleted: {
    color: '#fff',
  },
  calendarDayBeforePlan: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.4,
  },
  calendarDayTextBeforePlan: {
    color: '#bbb',
  },
  checkMark: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#98FB98',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createPlanButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Badge Shelf Styles
  badgeShelf: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeShelfHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeShelfTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 5,
  },
  badgeShelfCount: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 15,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7F50',
    minWidth: 35,
    textAlign: 'right',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  badgeItem: {
    width: '30%', // 3 badges per row with gaps
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  badgeItemLocked: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  badgeItemInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 14,
  },
  badgeNameLocked: {
    color: '#999',
  },
  earnedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#98FB98',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  earnedIndicatorText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Calendar Instructions Styles
  calendarInstructions: {
    backgroundColor: '#E8F4FD',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#87CEEB',
    alignItems: 'center',
  },
  calendarInstructionsText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Custom upgrade gate styles
  customUpgradeGate: {
    backgroundColor: '#F8F9FF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8EAFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginVertical: 10,
  },
  customUpgradeContent: {
    alignItems: 'center',
  },
  customPremiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  customPremiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
  customUpgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 5,
    textAlign: 'center',
  },
  customUpgradeMessage: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  customUpgradeButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  customUpgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});