import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartNotificationEngine } from '../utils/smart-notifications';
import { useSmartReminders } from '../hooks/useSmartReminders';
import { formatDisplayTime } from '../utils/notifications';
import { usePremium } from '../hooks/usePremium';
import { FREE_LIMITS, PREMIUM_LIMITS } from '../constants/premium';

interface SmartSnoozeModalProps {
  visible: boolean;
  onClose: () => void;
  vitaminName: string;
  planId: string;
  originalTime: string;
  isTodayCompleted: boolean;
  onSnoozeApplied: (snoozeMinutes: number) => void;
}

interface SnoozeOption {
  minutes: number;
  label: string;
  emoji: string;
  reason?: string;
}

export const SmartSnoozeModal: React.FC<SmartSnoozeModalProps> = ({
  visible,
  onClose,
  vitaminName,
  planId,
  originalTime,
  isTodayCompleted,
  onSnoozeApplied
}) => {
  const [snoozeOptions, setSnoozeOptions] = useState<SnoozeOption[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [snoozesUsedToday, setSnoozesUsedToday] = useState(0);
  
  const { settings, behaviorProfile, recordNotificationResponse } = useSmartReminders();
  const { isPremium, getLimit } = usePremium();

  useEffect(() => {
    if (visible) {
      loadSnoozesUsedToday();
      generateSmartSnoozeOptions();
    }
  }, [visible]);

  const loadSnoozesUsedToday = async () => {
    try {
      const today = new Date().toDateString();
      const key = `smartSnoozes_${today}`;
      const stored = await AsyncStorage.getItem(key);
      const used = stored ? parseInt(stored, 10) : 0;
      setSnoozesUsedToday(used);
    } catch (error) {
      console.error('Error loading snooze usage:', error);
      setSnoozesUsedToday(0);
    }
  };

  const incrementSnoozeUsage = async () => {
    try {
      const today = new Date().toDateString();
      const key = `smartSnoozes_${today}`;
      const newCount = snoozesUsedToday + 1;
      await AsyncStorage.setItem(key, newCount.toString());
      setSnoozesUsedToday(newCount);
    } catch (error) {
      console.error('Error updating snooze usage:', error);
    }
  };

  const generateSmartSnoozeOptions = () => {
    const currentTime = new Date();
    const options = SmartNotificationEngine.generateSmartSnoozeOptions(
      currentTime,
      behaviorProfile
    );
    setSnoozeOptions(options);
  };

  const handleSnoozeSelect = async (option: SnoozeOption) => {
    try {
      setIsApplying(true);
      
      // Check snooze limits
      const maxSnoozes = getLimit('MAX_SMART_SNOOZES_PER_DAY');
      if (maxSnoozes !== -1 && snoozesUsedToday >= maxSnoozes) {
        console.log(`⚠️ Snooze limit reached: ${snoozesUsedToday}/${maxSnoozes}`);
        Alert.alert(
          '🚫 Snooze Limit Reached',
          `You've used all ${maxSnoozes} snoozes for today. Try again tomorrow or upgrade to Premium for more!`,
          [{ text: 'Got it', style: 'default' }]
        );
        return;
      }
      
      // Calculate the new reminder time
      const newTime = new Date();
      newTime.setMinutes(newTime.getMinutes() + option.minutes);
      const newTimeString = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Show confirmation
      const confirmationMessage = option.reason 
        ? `Snooze ${vitaminName} for ${option.label}? ${option.reason}\n\nNew reminder: ${formatDisplayTime(newTimeString)}`
        : `Snooze ${vitaminName} for ${option.label}?\n\nNew reminder: ${formatDisplayTime(newTimeString)}`;

      Alert.alert(
        `${option.emoji} Smart Snooze`,
        confirmationMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Snooze',
            style: 'default',
            onPress: async () => {
              await applySnooze(option);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling snooze:', error);
      Alert.alert('Error', 'Failed to set snooze. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const applySnooze = async (option: SnoozeOption) => {
    try {
      // Increment snooze usage counter
      await incrementSnoozeUsage();
      
      // Record the snooze behavior for learning
      if (settings.behaviorLearning) {
        console.log('📊 Recording snooze for behavioral learning');
        await recordNotificationResponse('snoozed', new Date());
        
        // Record with SmartNotificationEngine for advanced analytics
        await SmartNotificationEngine.recordNotificationResponse(planId, {
          type: 'snoozed',
          timestamp: new Date(),
          originalTime: originalTime,
          snoozeMinutes: option.minutes
        });
      }

      // Call the parent callback
      onSnoozeApplied(option.minutes);
      
      // Close modal
      onClose();
      
      // Show success message
      Alert.alert(
        '⏰ Snooze Set!',
        `${vitaminName} reminder snoozed for ${option.label}. We'll remind you again soon!`,
        [{ text: 'Got it!', style: 'default' }]
      );
      
      console.log(`✅ Applied smart snooze: ${option.label} (${option.minutes} minutes)`);
    } catch (error) {
      console.error('Error applying snooze:', error);
      Alert.alert('Error', 'Failed to apply snooze. Please try again.');
    }
  };


  const handleSkip = async () => {
    // Check if today is already completed
    if (isTodayCompleted) {
      console.log('⚠️ Skip attempted on already completed day');
      Alert.alert(
        '✅ Already Taken!',
        `You've already taken your ${vitaminName} today! No need to skip.`,
        [{ text: 'Got it!', style: 'default', onPress: onClose }]
      );
      return;
    }

    Alert.alert(
      '⏭️ Skip This Dose?',
      `Are you sure you want to skip your ${vitaminName} today? This will affect your streak tracking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            console.log(`📝 User skipped ${vitaminName} for today`);
            
            // Record skip for learning
            if (settings.behaviorLearning) {
              console.log('📊 Recording skip for behavioral learning');
              await recordNotificationResponse('ignored', new Date());
              
              await SmartNotificationEngine.recordNotificationResponse(planId, {
                type: 'ignored',
                timestamp: new Date(),
                originalTime: originalTime
              });
            }
            
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.vitaminIcon}>⏰</Text>
            <Text style={styles.title}>{vitaminName} Reminder</Text>
            <Text style={styles.subtitle}>What would you like to do?</Text>
          </View>

          {/* Status and Limits */}
          <View style={styles.statusSection}>
            {isTodayCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✅ Already taken today!</Text>
              </View>
            )}
            
            {(() => {
              const maxSnoozes = getLimit('MAX_SMART_SNOOZES_PER_DAY');
              const remaining = maxSnoozes === -1 ? '∞' : Math.max(0, maxSnoozes - snoozesUsedToday);
              return (
                <View style={styles.snoozeCounter}>
                  <Text style={styles.snoozeCounterText}>
                    📱 Smart Snoozes: {remaining === '∞' ? 'Unlimited' : `${remaining} remaining`}
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickActionButton, 
                styles.skipButton,
                isTodayCompleted && styles.quickActionDisabled
              ]}
              onPress={handleSkip}
              disabled={isApplying || isTodayCompleted}
            >
              <Text style={styles.quickActionIcon}>⏭️</Text>
              <Text style={[
                styles.quickActionText,
                isTodayCompleted && styles.quickActionTextDisabled
              ]}>
                {isTodayCompleted ? 'Already Taken' : 'Skip Today'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Smart Snooze Options */}
          <View style={styles.snoozeSection}>
            <Text style={styles.sectionTitle}>🧠 Smart Snooze Options</Text>
            <Text style={styles.sectionSubtitle}>AI-suggested timing based on your habits</Text>
            
            <View style={styles.snoozeOptions}>
              {snoozeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.snoozeOption}
                  onPress={() => handleSnoozeSelect(option)}
                  disabled={isApplying}
                >
                  <View style={styles.snoozeOptionContent}>
                    <Text style={styles.snoozeEmoji}>{option.emoji}</Text>
                    <View style={styles.snoozeText}>
                      <Text style={styles.snoozeLabel}>{option.label}</Text>
                      {option.reason && (
                        <Text style={styles.snoozeReason}>{option.reason}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Learning Note */}
          {settings.behaviorLearning && (
            <View style={styles.learningNote}>
              <Text style={styles.learningNoteText}>
                🧠 Your choices help improve future recommendations
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  vitaminIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  completedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  snoozeCounter: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  snoozeCounterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  skipButton: {
    backgroundColor: '#6B7280',
  },
  quickActionDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionTextDisabled: {
    color: '#9CA3AF',
  },
  snoozeSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  snoozeOptions: {
    gap: 12,
  },
  snoozeOption: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  snoozeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snoozeEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  snoozeText: {
    flex: 1,
  },
  snoozeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  snoozeReason: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  learningNote: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  learningNoteText: {
    fontSize: 12,
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: '500',
  },
});