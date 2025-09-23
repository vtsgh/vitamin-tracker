import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CURRENT_FEATURE_POLL,
  CURRENT_USAGE_POLL,
  getPollStats,
  formatPollPercentage,
  FeaturePoll
} from '../constants/community';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PollsAndFeedback() {
  const [featurePoll, setFeaturePoll] = useState<FeaturePoll>(CURRENT_FEATURE_POLL);
  const [usagePoll, setUsagePoll] = useState<FeaturePoll>(CURRENT_USAGE_POLL);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation values
  const titleOpacity = useSharedValue(0);
  const poll1Opacity = useSharedValue(0);
  const poll2Opacity = useSharedValue(0);

  const stats = getPollStats();

  useFocusEffect(
    useCallback(() => {
      loadUserVotes();

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

  const loadUserVotes = async () => {
    try {
      const featureVote = await AsyncStorage.getItem(`poll_vote_${featurePoll.id}`);
      const usageVote = await AsyncStorage.getItem(`poll_vote_${usagePoll.id}`);

      if (featureVote) {
        setFeaturePoll(prev => ({ ...prev, userVote: featureVote }));
      }
      if (usageVote) {
        setUsagePoll(prev => ({ ...prev, userVote: usageVote }));
      }
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const handleGoHome = () => {
    router.push('/(tabs)/');
  };

  const handleDonationPress = () => {
    Alert.alert(
      "💝 Support Takeamin",
      "Love using our polls and feedback features? Help us keep improving Takeamin for everyone!",
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Buy Us a Coffee ☕",
          onPress: async () => {
            try {
              const donationURL = 'https://buymeacoffee.com/Takeamin';
              const supported = await Linking.canOpenURL(donationURL);

              if (supported) {
                await Linking.openURL(donationURL);
                console.log('☕ Opening Buy Me a Coffee - thanks for your support!');
              } else {
                Alert.alert(
                  'Visit our donation page',
                  'Please go to: buymeacoffee.com/Takeamin'
                );
              }
            } catch (error) {
              console.error('Error opening donation link:', error);
              Alert.alert(
                'Visit our donation page',
                'Please go to: buymeacoffee.com/Takeamin'
              );
            }
          }
        }
      ]
    );
  };

  const handleVote = async (poll: FeaturePoll, option: string, setPoll: React.Dispatch<React.SetStateAction<FeaturePoll>>) => {
    try {
      // Save vote locally
      await AsyncStorage.setItem(`poll_vote_${poll.id}`, option);

      // Update poll state
      setPoll(prev => ({
        ...prev,
        userVote: option,
        votes: {
          ...prev.votes,
          [option]: (prev.votes[option] || 0) + 1
        }
      }));

      console.log(`✅ Voted for "${option}" in ${poll.question}`);
    } catch (error) {
      console.error('Error saving vote:', error);
    }
  };

  const renderPoll = (poll: FeaturePoll, setPoll: React.Dispatch<React.SetStateAction<FeaturePoll>>, animatedStyle: any) => {
    const totalVotes = Object.values(poll.votes).reduce((sum, votes) => sum + votes, 0);
    const hasVoted = !!poll.userVote;

    return (
      <Animated.View style={[styles.pollCard, animatedStyle]}>
        <View style={styles.pollHeader}>
          <Text style={styles.pollQuestion}>{poll.question}</Text>
          {poll.description && (
            <Text style={styles.pollDescription}>{poll.description}</Text>
          )}
        </View>

        <View style={styles.pollOptions}>
          {poll.options.map((option, index) => {
            const votes = poll.votes[option] || 0;
            const percentage = formatPollPercentage(votes, totalVotes);
            const isSelected = poll.userVote === option;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pollOption,
                  hasVoted && styles.pollOptionVoted,
                  isSelected && styles.pollOptionSelected
                ]}
                onPress={() => !hasVoted && handleVote(poll, option, setPoll)}
                disabled={hasVoted}
              >
                <View style={styles.pollOptionContent}>
                  <Text style={[
                    styles.pollOptionText,
                    isSelected && styles.pollOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {hasVoted && (
                    <Text style={[
                      styles.pollOptionPercentage,
                      isSelected && styles.pollOptionPercentageSelected
                    ]}>
                      {percentage}
                    </Text>
                  )}
                </View>
                {hasVoted && (
                  <View style={[
                    styles.pollOptionBar,
                    { width: `${Math.round((votes / totalVotes) * 100)}%` },
                    isSelected && styles.pollOptionBarSelected
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {hasVoted && (
          <View style={styles.pollFooter}>
            <Text style={styles.pollVoteCount}>
              {totalVotes} total votes
            </Text>
          </View>
        )}
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
        </Animated.View>

        {renderPoll(featurePoll, setFeaturePoll, animatedPoll1Style)}
        {renderPoll(usagePoll, setUsagePoll, animatedPoll2Style)}

        <TouchableOpacity style={styles.donationCTA} onPress={handleDonationPress}>
          <Text style={styles.donationText}>
            💝 Love using Takeamin? Tap to support us and keep it free!
          </Text>
          <Text style={styles.donationSubtext}>
            ☕ Buy us a coffee • Help fund development
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF7F50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  pollCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
    color: '#333',
    marginBottom: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pollOptions: {
    gap: 12,
  },
  pollOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  pollOptionVoted: {
    backgroundColor: '#F8F9FA',
  },
  pollOptionSelected: {
    borderColor: '#FF7F50',
    backgroundColor: '#FFF4F0',
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  pollOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pollOptionTextSelected: {
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  pollOptionPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  pollOptionPercentageSelected: {
    color: '#FF7F50',
  },
  pollOptionBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E9ECEF',
    zIndex: 1,
  },
  pollOptionBarSelected: {
    backgroundColor: '#FFE5D6',
  },
  pollFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'center',
  },
  pollVoteCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  donationCTA: {
    backgroundColor: '#FF69B4',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  donationText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 8,
  },
  donationSubtext: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '400',
  },
});