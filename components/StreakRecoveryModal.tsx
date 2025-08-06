import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { usePremium } from '../hooks/usePremium';
import { 
  applyStreakRecovery, 
  getStreakRecoveriesThisMonth,
  getProgressData
} from '../utils/progress';
import { PREMIUM_FEATURES, UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';

interface StreakRecoveryModalProps {
  visible: boolean;
  onClose: () => void;
  vitaminPlanId: string;
  missedDate: string;
  currentStreak: number;
  onRecoveryUsed?: () => void;
}

export function StreakRecoveryModal({
  visible,
  onClose,
  vitaminPlanId,
  missedDate,
  currentStreak,
  onRecoveryUsed
}: StreakRecoveryModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    isPremium, 
    getLimit, 
    triggerUpgrade,
    isLimitReached 
  } = usePremium();

  const handleUseRecovery = async () => {
    // Safety check: don't allow recovery for streaks <= 1 day
    if (currentStreak <= 1) {
      Alert.alert(
        'No Recovery Needed',
        'You can easily start a fresh streak! No need to use a Streak Shield for such a short streak.',
        [{ text: 'Got it!', style: 'default', onPress: onClose }]
      );
      return;
    }

    if (!isPremium) {
      // Close this modal first, then trigger upgrade
      onClose();
      triggerUpgrade(
        PREMIUM_FEATURES.STREAK_RECOVERY,
        UPGRADE_TRIGGER_CONTEXTS.STREAK_ABOUT_TO_BREAK,
        { 
          currentStreak, 
          missedDate,
          feature: 'Streak Shield'
        }
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check current usage
      const progressData = await getProgressData();
      const currentUsage = getStreakRecoveriesThisMonth(progressData.streakRecoveries, vitaminPlanId);
      const monthlyLimit = getLimit('MAX_STREAK_RECOVERIES_PER_MONTH');
      
      if (isLimitReached('MAX_STREAK_RECOVERIES_PER_MONTH', currentUsage)) {
        Alert.alert(
          'Recovery Limit Reached',
          `You've used all ${monthlyLimit} Streak Shields this month. Your limit resets at the beginning of next month.`,
          [{ text: 'OK', style: 'default' }]
        );
        setIsProcessing(false);
        return;
      }

      // Use the recovery
      const result = await applyStreakRecovery(vitaminPlanId, missedDate);
      
      if (result.success) {
        const remainingRecoveries = monthlyLimit - currentUsage - 1;
        Alert.alert(
          'Streak Saved! 🛡️',
          `Your ${currentStreak}-day streak has been protected.\n\nStreak Shields remaining this month: ${remainingRecoveries}`,
          [{ 
            text: 'Amazing!', 
            style: 'default',
            onPress: () => {
              onRecoveryUsed?.();
              onClose();
            }
          }]
        );
      } else {
        Alert.alert(
          'Recovery Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error using streak recovery:', error);
      Alert.alert(
        'Error',
        'Failed to use Streak Shield. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLetItBreak = () => {
    Alert.alert(
      'Let Streak Break?',
      `Are you sure you want to let your ${currentStreak}-day streak end? You can always start a new one!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Let It Break', 
          style: 'destructive',
          onPress: () => {
            // Show encouraging message when letting streak break
            Alert.alert(
              'Fresh Start! 🌱',
              `Your ${currentStreak}-day streak was amazing! Every journey has ups and downs, and you're building resilience. Ready to start a new streak whenever you are!`,
              [{ 
                text: 'Start Fresh!', 
                style: 'default',
                onPress: onClose
              }]
            );
          }
        }
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Streak About to Break</Text>
          </View>

          <Text style={styles.message}>
            Your <Text style={styles.highlight}>{currentStreak}-day streak</Text> is about to break because you missed {formatDate(missedDate)}.
          </Text>

          {isPremium ? (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumText}>
                Use a <Text style={styles.highlight}>Streak Shield</Text> to protect your progress?
              </Text>
            </View>
          ) : (
            <View style={styles.upgradeSection}>
              <Text style={styles.upgradeText}>
                Protect your streak with <Text style={styles.highlight}>Streak Shield</Text> - available with Premium!
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleLetItBreak}
              disabled={isProcessing}
            >
              <Text style={styles.secondaryButtonText}>Let It Break</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleUseRecovery}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isPremium ? 'Use Streak Shield' : 'Upgrade to Premium'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  highlight: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  premiumSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  premiumText: {
    fontSize: 15,
    color: '#0369A1',
    textAlign: 'center',
    fontWeight: '500',
  },
  upgradeSection: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  upgradeText: {
    fontSize: 15,
    color: '#C2410C',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});