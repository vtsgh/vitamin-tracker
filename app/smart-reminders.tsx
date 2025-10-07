import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VitaminPlan } from '../types/VitaminPlan';
import { useSmartReminders } from '../hooks/useSmartReminders';
import { SmartNotificationEngine } from '../utils/smart-notifications';
import { usePremium } from '../hooks/usePremium';
import { formatDisplayTime, cancelNotifications } from '../utils/notifications';
import { TIME_INSIGHTS } from '../constants/smart-reminders';
import { PremiumFeatureGate } from '../components/PremiumFeatureGate';
import { PREMIUM_FEATURES, UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';
import { useTheme } from '@/contexts/ThemeContext';

interface TimingRecommendation {
  planId: string;
  currentTime: string;
  recommendedTime: string;
  reason: string;
  confidence: number;
  potentialImprovement: string;
}

export default function SmartReminders() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [vitaminPlans, setVitaminPlans] = useState<VitaminPlan[]>([]);
  const [recommendations, setRecommendations] = useState<TimingRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  
  const { 
    settings, 
    behaviorProfile, 
    getBehaviorInsights, 
    updateSetting,
    saveSettings 
  } = useSmartReminders();
  const { isPremium } = usePremium();

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadSmartRemindersData();
    }, [])
  );

  const loadSmartRemindersData = async () => {
    try {
      setIsLoading(true);
      
      // Load vitamin plans
      const plansJson = await AsyncStorage.getItem('vitaminPlans');
      const plans: VitaminPlan[] = plansJson ? JSON.parse(plansJson) : [];
      setVitaminPlans(plans);
      
      // Generate timing recommendations for each plan
      if (settings.enabled && settings.behaviorLearning) {
        const recs = await generateTimingRecommendations(plans);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading smart reminders data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimingRecommendations = async (plans: VitaminPlan[]): Promise<TimingRecommendation[]> => {
    if (!behaviorProfile) return [];

    const recommendations: TimingRecommendation[] = [];

    for (const plan of plans) {
      // Get stored responses for this plan
      const responses = await getStoredResponses(plan.id);
      if (responses.length < 5) continue; // Need minimum data

      // Analyze response patterns
      const hourlyStats = analyzeHourlyResponses(responses);
      const currentHour = parseInt(plan.reminderTime?.split(':')[0] || '9');
      
      // Find better time slot
      const betterSlot = findBetterTimeSlot(hourlyStats, currentHour);
      
      if (betterSlot && betterSlot.improvement > 0.2) { // 20% improvement threshold
        recommendations.push({
          planId: plan.id,
          currentTime: plan.reminderTime || '09:00',
          recommendedTime: `${betterSlot.hour.toString().padStart(2, '0')}:${plan.reminderTime?.split(':')[1] || '00'}`,
          reason: betterSlot.reason,
          confidence: betterSlot.confidence,
          potentialImprovement: `${Math.round(betterSlot.improvement * 100)}% better response rate`
        });
      }
    }

    return recommendations;
  };

  // [Include the same helper functions from smart-insights.tsx]
  const getStoredResponses = async (planId: string): Promise<any[]> => {
    try {
      const storageKey = `notificationResponses_${planId}`;
      const responsesJson = await AsyncStorage.getItem(storageKey);
      return responsesJson ? JSON.parse(responsesJson) : [];
    } catch (error) {
      return [];
    }
  };

  const analyzeHourlyResponses = (responses: any[]) => {
    const hourlyStats: Record<number, { responseRate: number; avgDelay: number; count: number }> = {};
    
    for (const response of responses) {
      const hour = new Date(response.timestamp).getHours();
      
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { responseRate: 0, avgDelay: 0, count: 0 };
      }
      
      hourlyStats[hour].count++;
      
      if (response.type === 'taken') {
        hourlyStats[hour].responseRate++;
      }
    }
    
    // Calculate percentages
    Object.keys(hourlyStats).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const stats = hourlyStats[hour];
      stats.responseRate = stats.responseRate / stats.count;
    });
    
    return hourlyStats;
  };

  const findBetterTimeSlot = (hourlyStats: Record<number, any>, currentHour: number) => {
    let bestHour = currentHour;
    let bestRate = hourlyStats[currentHour]?.responseRate || 0;
    let bestReason = '';
    
    Object.entries(hourlyStats).forEach(([hourStr, stats]) => {
      const hour = parseInt(hourStr);
      if (stats.count >= 3 && stats.responseRate > bestRate) {
        bestHour = hour;
        bestRate = stats.responseRate;
        bestReason = `Better response rate at ${hour}:00`;
      }
    });
    
    if (bestHour === currentHour) return null;
    
    const improvement = bestRate - (hourlyStats[currentHour]?.responseRate || 0);
    const confidence = Math.min(0.95, bestRate * (hourlyStats[bestHour].count / 10));
    
    return { hour: bestHour, improvement, confidence, reason: bestReason };
  };

  const applyRecommendation = async (recommendation: TimingRecommendation) => {
    try {
      setIsApplying(true);
      
      const plan = vitaminPlans.find(p => p.id === recommendation.planId);
      if (!plan) return;

      Alert.alert(
        '🧠 Apply Smart Timing?',
        `Change ${plan.vitamin} reminder from ${formatDisplayTime(recommendation.currentTime)} to ${formatDisplayTime(recommendation.recommendedTime)}?\n\n${recommendation.reason}\n\nExpected improvement: ${recommendation.potentialImprovement}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Apply Changes',
            style: 'default',
            onPress: async () => {
              await updatePlanTiming(plan, recommendation.recommendedTime, recommendation.reason);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error applying recommendation:', error);
      Alert.alert('Error', 'Failed to apply timing recommendation.');
    } finally {
      setIsApplying(false);
    }
  };

  const updatePlanTiming = async (plan: VitaminPlan, newTime: string, reason: string) => {
    try {
      // Cancel existing notifications
      if (plan.notificationIds && plan.notificationIds.length > 0) {
        await cancelNotifications(plan.notificationIds);
      }

      // Update plan with new timing
      const updatedPlan: VitaminPlan = { ...plan, reminderTime: newTime };

      // Schedule new notifications
      const smartResult = await SmartNotificationEngine.scheduleSmartReminders(
        updatedPlan, settings, behaviorProfile
      );

      if (smartResult.scheduledIds.length > 0) {
        updatedPlan.notificationIds = smartResult.scheduledIds;
        
        // Update stored plans
        const updatedPlans = vitaminPlans.map(p => p.id === plan.id ? updatedPlan : p);
        await AsyncStorage.setItem('vitaminPlans', JSON.stringify(updatedPlans));
        setVitaminPlans(updatedPlans);
        
        // Remove this recommendation
        setRecommendations(prev => prev.filter(r => r.planId !== plan.id));
        
        Alert.alert(
          '✅ Timing Updated!',
          `${plan.vitamin} reminder moved to ${formatDisplayTime(newTime)}. ${reason}`,
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error updating plan timing:', error);
      Alert.alert('Error', 'Failed to update timing. Please try again.');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getBehaviorSummary = () => {
    const insights = getBehaviorInsights();
    if (!insights) return null;

    return {
      bestHour: insights.bestHour,
      bestDay: insights.bestDay, 
      totalResponses: insights.totalResponses,
      consistency: insights.totalResponses > 20 ? 'High' : insights.totalResponses > 10 ? 'Medium' : 'Building'
    };
  };

  const renderSettingToggle = (
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

  const behaviorSummary = getBehaviorSummary();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading smart reminders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Smart Reminders</Text>
        <Text style={styles.pageSubtitle}>AI-powered timing that learns from your habits</Text>
        <Text style={styles.privacyNotice}>
          🔒 All data stays on your device - time-based reminders only, no location tracking needed!
        </Text>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          
          <PremiumFeatureGate
            feature={PREMIUM_FEATURES.CUSTOM_SCHEDULES}
            upgradePrompt={{
              title: "🧠 Unlock Smart Reminders",
              message: "Get AI-powered reminder timing, behavioral learning, and location-based notifications",
              trigger: UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY
            }}
            fallback={
              <View style={styles.premiumPrompt}>
                <Text style={styles.premiumPromptTitle}>✨ Upgrade to Premium</Text>
                <Text style={styles.premiumPromptText}>
                  Unlock intelligent reminders that adapt to your schedule and habits
                </Text>
              </View>
            }
          >
            {renderSettingToggle(
              'Enable Smart Reminders',
              'AI-powered reminders that adapt to your routine',
              settings.enabled,
              (value) => updateSetting('enabled', value),
              true,
              '🎯'
            )}

            {settings.enabled && (
              <>
                {renderSettingToggle(
                  'Adaptive Timing',
                  'Automatically adjust reminder times based on your response patterns',
                  settings.adaptiveTiming,
                  (value) => updateSetting('adaptiveTiming', value),
                  true,
                  '⏰'
                )}

                {renderSettingToggle(
                  'Behavior Learning',
                  'Learn from your habits to optimize reminder timing',
                  settings.behaviorLearning,
                  (value) => updateSetting('behaviorLearning', value),
                  true,
                  '🧠'
                )}
              </>
            )}
          </PremiumFeatureGate>
        </View>

        {/* Behavior Summary */}
        {behaviorSummary && settings.behaviorLearning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Your Patterns</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Best Time</Text>
                  <Text style={styles.summaryValue}>{behaviorSummary.bestHour}:00</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Best Day</Text>
                  <Text style={styles.summaryValue}>{behaviorSummary.bestDay}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Consistency</Text>
                  <Text style={styles.summaryValue}>{behaviorSummary.consistency}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Data Points</Text>
                  <Text style={styles.summaryValue}>{behaviorSummary.totalResponses}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* AI Recommendations */}
        {settings.enabled && settings.behaviorLearning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 AI Recommendations</Text>
            
            {recommendations.length === 0 ? (
              <View style={styles.noRecommendationsCard}>
                <Text style={styles.noRecommendationsTitle}>🌱 Learning Your Patterns</Text>
                <Text style={styles.noRecommendationsText}>
                  Keep using the app! We need more data to generate personalized timing recommendations.
                  {'\n\n'}We'll start showing suggestions after you've used the app for a few more days.
                </Text>
              </View>
            ) : (
              recommendations.map((rec) => {
                const plan = vitaminPlans.find(p => p.id === rec.planId);
                if (!plan) return null;

                return (
                  <View key={rec.planId} style={styles.recommendationCard}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationVitamin}>{plan.vitamin}</Text>
                      <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>
                          {Math.round(rec.confidence * 100)}% sure
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.timingComparison}>
                      <View style={styles.currentTiming}>
                        <Text style={styles.timingLabel}>Current</Text>
                        <Text style={styles.timingTime}>{formatDisplayTime(rec.currentTime)}</Text>
                      </View>
                      <Text style={styles.timingArrow}>→</Text>
                      <View style={styles.recommendedTiming}>
                        <Text style={styles.timingLabel}>Recommended</Text>
                        <Text style={styles.timingTime}>{formatDisplayTime(rec.recommendedTime)}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.recommendationReason}>{rec.reason}</Text>
                    <Text style={styles.recommendationImprovement}>{rec.potentialImprovement}</Text>
                    
                    <TouchableOpacity
                      style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
                      onPress={() => applyRecommendation(rec)}
                      disabled={isApplying}
                    >
                      <Text style={styles.applyButtonText}>
                        {isApplying ? 'Applying...' : 'Apply Recommendation'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 How It Works</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🧠</Text>
              <Text style={styles.tipText}>
                AI learns from your check-in patterns to optimize reminder timing
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>📊</Text>
              <Text style={styles.tipText}>
                More data = better recommendations. Keep tracking consistently!
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>⚡</Text>
              <Text style={styles.tipText}>
                Applied recommendations automatically reschedule your notifications
              </Text>
            </View>
          </View>
        </View>
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  privacyNotice: {
    fontSize: 13,
    color: colors.success,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  // Settings styles
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
    color: colors.textSecondary,
    lineHeight: 20,
  },
  premiumBadge: {
    backgroundColor: colors.healthButton,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  premiumPrompt: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
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
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Summary styles
  summaryCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.smartRemindersButton,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.smartRemindersButton,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  // Recommendation styles
  recommendationCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationVitamin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  confidenceBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: colors.smartRemindersButton,
    fontWeight: '600',
  },
  timingComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 15,
  },
  currentTiming: {
    alignItems: 'center',
  },
  recommendedTiming: {
    alignItems: 'center',
  },
  timingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  timingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  timingArrow: {
    fontSize: 24,
    color: colors.primary,
  },
  recommendationReason: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationImprovement: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 15,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRecommendationsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  noRecommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  noRecommendationsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
}