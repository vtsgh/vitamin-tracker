import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CURRENT_FEATURE_POLL,
  CURRENT_USAGE_POLL,
  BMC_REDIRECT_MESSAGE,
  FeaturePoll
} from '../constants/community';
import { useTheme } from '@/contexts/ThemeContext';

export default function PollsAndFeedback() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [featurePoll, setFeaturePoll] = useState<FeaturePoll>(CURRENT_FEATURE_POLL);
  const [usagePoll, setUsagePoll] = useState<FeaturePoll>(CURRENT_USAGE_POLL);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation values
  const titleOpacity = useSharedValue(0);
  const poll1Opacity = useSharedValue(0);
  const poll2Opacity = useSharedValue(0);


  useFocusEffect(
    useCallback(() => {
      if (!hasAnimated) {
        startAnimations();
        setHasAnimated(true);
      } else {
        showElementsImmediately();
      }
    }, [hasAnimated])
  );

  const startAnimations = useCallback(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    setTimeout(() => {
      poll1Opacity.value = withTiming(1, { duration: 500 });
    }, 200);
    setTimeout(() => {
      poll2Opacity.value = withTiming(1, { duration: 500 });
    }, 400);
  }, []);

  const showElementsImmediately = useCallback(() => {
    titleOpacity.value = 1;
    poll1Opacity.value = 1;
    poll2Opacity.value = 1;
  }, []);

  const handlePollVote = async (poll: FeaturePoll) => {
    try {
      console.log(`🗳️ Redirecting to BMC poll: ${poll.question}`);

      const supported = await Linking.canOpenURL(poll.bmcUrl);
      if (supported) {
        await Linking.openURL(poll.bmcUrl);

        // Show thank you message
        setTimeout(() => {
          Alert.alert(
            BMC_REDIRECT_MESSAGE.title,
            BMC_REDIRECT_MESSAGE.message,
            [{ text: 'You\'re welcome! 😊', style: 'default' }]
          );
        }, 1000); // Small delay to let the browser open first
      } else {
        Alert.alert(
          'Visit the poll',
          `Please visit: ${poll.bmcUrl}`
        );
      }
    } catch (error) {
      console.error('Error opening BMC poll:', error);
      Alert.alert(
        'Visit the poll',
        `Please visit: ${poll.bmcUrl}`
      );
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };



  const renderPoll = (poll: FeaturePoll, animatedStyle: any) => {
    return (
      <Animated.View style={[styles.pollCard, animatedStyle]}>
        <TouchableOpacity onPress={() => handlePollVote(poll)}>
          <View style={styles.pollHeader}>
            <Text style={styles.pollQuestion}>{poll.question}</Text>
            {poll.description && (
              <Text style={styles.pollDescription}>{poll.description}</Text>
            )}
          </View>

          <View style={styles.pollOptions}>
            {poll.options.map((option, index) => (
              <View key={index} style={styles.pollOption}>
                <Text style={styles.pollOptionText}>
                  {option}
                </Text>
              </View>
            ))}
          </View>

        </TouchableOpacity>
      </Animated.View>
    );
  };

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withTiming((1 - titleOpacity.value) * -20) }],
  }));

  const animatedPoll1Style = useAnimatedStyle(() => ({
    opacity: poll1Opacity.value,
    transform: [{ translateY: withTiming((1 - poll1Opacity.value) * 30) }],
  }));

  const animatedPoll2Style = useAnimatedStyle(() => ({
    opacity: poll2Opacity.value,
    transform: [{ translateY: withTiming((1 - poll2Opacity.value) * 30) }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, animatedTitleStyle]}>
          <Text style={styles.title}>📊 Polls & Feedback</Text>
          <Text style={styles.subtitle}>
            Help us improve Takeamin with your input!
          </Text>
          <Text style={styles.supporterNote}>
            Only supporters can vote & see results
          </Text>
          <Text style={styles.instructionNote}>
            Tap on one of the polls below to get started
          </Text>
        </Animated.View>

        {renderPoll(featurePoll, animatedPoll1Style)}
        {renderPoll(usagePoll, animatedPoll2Style)}
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
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pollCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pollHeader: {
    marginBottom: 20,
  },
  pollQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pollOptions: {
    gap: 12,
  },
  pollOption: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pollOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  supporterNote: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  instructionNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
}