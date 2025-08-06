import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { SmartNotificationEngine } from '../utils/smart-notifications';
import { useSmartReminders } from '../hooks/useSmartReminders';
import { formatDisplayTime } from '../utils/notifications';

interface SmartSnoozeModalProps {
  visible: boolean;
  onClose: () => void;
  vitaminName: string;
  planId: string;
  originalTime: string;
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
  onSnoozeApplied
}) => {
  const [snoozeOptions, setSnoozeOptions] = useState<SnoozeOption[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  
  const { settings, behaviorProfile, recordNotificationResponse } = useSmartReminders();

  useEffect(() => {
    if (visible) {
      generateSmartSnoozeOptions();
    }
  }, [visible]);

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
    Alert.alert(
      '⏭️ Skip This Dose?',
      `Are you sure you want to skip your ${vitaminName} today? This will affect your streak tracking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
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

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.skipButton]}
              onPress={handleSkip}
              disabled={isApplying}
            >
              <Text style={styles.quickActionIcon}>⏭️</Text>
              <Text style={styles.quickActionText}>Skip Today</Text>
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
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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