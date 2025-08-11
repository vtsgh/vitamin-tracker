import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, interpolate } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../hooks/usePremium';
import { PremiumFeatureGate } from '../components/PremiumFeatureGate';
import { PREMIUM_FEATURES, UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';
import { 
  SAMPLE_ENCOURAGEMENT_POSTS, 
  CURRENT_FEATURE_POLL, 
  getCommunityStats, 
  MESSAGE_TEMPLATES,
  COMMUNITY_GUIDELINES,
  POST_LIMITS,
  POSTING_LIMITS,
  canUserPost,
  getDaysUntilNextPost,
  EncouragementPost,
  FeaturePoll 
} from '../constants/community';

export default function Community() {
  const [posts, setPosts] = useState<EncouragementPost[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [poll, setPoll] = useState<FeaturePoll>(CURRENT_FEATURE_POLL);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [userPostsThisMonth, setUserPostsThisMonth] = useState(0); // In production, get from AsyncStorage
  
  const { isPremium, triggerUpgrade } = usePremium();
  // Update stats to be more realistic for preview
  const communityStats = {
    encouragementsThisWeek: 0,
    totalHearts: 0,
    activeUsers: 847, // Keep some realistic preview numbers
    weeklyGrowth: '+12%'
  };
  
  // Check if user can post this month
  const canPost = canUserPost(userPostsThisMonth, isPremium);
  const daysUntilNextPost = getDaysUntilNextPost();

  const handleGoHome = () => {
    router.push('/(tabs)/');
  };

  const handleHeartPost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hearts: post.hasUserLiked ? post.hearts - 1 : post.hearts + 1,
            hasUserLiked: !post.hasUserLiked
          };
        }
        return post;
      })
    );
  };

  const handlePostMessage = () => {
    if (newMessage.trim().length < POST_LIMITS.MIN_LENGTH) {
      Alert.alert('Message too short', `Please write at least ${POST_LIMITS.MIN_LENGTH} characters.`);
      return;
    }
    
    if (newMessage.trim().length > POST_LIMITS.MAX_LENGTH) {
      Alert.alert('Message too long', `Please keep your message under ${POST_LIMITS.MAX_LENGTH} characters.`);
      return;
    }

    const newPost: EncouragementPost = {
      id: Date.now().toString(),
      message: newMessage.trim(),
      timestamp: new Date(),
      hearts: 0,
      hasUserLiked: false,
      isPremiumUser: isPremium
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    setUserPostsThisMonth(prev => prev + 1); // In production, save to AsyncStorage
    setNewMessage('');
    setShowPostModal(false);
    setIsInputFocused(false);
    Keyboard.dismiss();
    
    Alert.alert('✨ Posted!', 'Your encouragement has been shared with the community!');
  };

  const handleShareButtonPress = () => {
    Alert.alert(
      '🚀 Coming Soon!',
      'The Encouragement Wall is launching in a future update! We\'re building a safe, positive space for vitamin journey sharing.\n\nFor now, Premium users can vote in feature polls to help shape what we build next!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleVotePoll = (option: string) => {
    setPoll(prevPoll => ({
      ...prevPoll,
      userVote: option,
      votes: {
        ...prevPoll.votes,
        [option]: (prevPoll.votes[option] || 0) + 1
      }
    }));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  // Sparkle animation component for premium crown
  const PremiumCrownWithSparkles = () => {
    const sparkle1 = useSharedValue(0);
    const sparkle2 = useSharedValue(0);
    const sparkle3 = useSharedValue(0);
    
    React.useEffect(() => {
      // Continuous sparkle animations with different delays and durations
      const startSparkleAnimation = () => {
        sparkle1.value = withRepeat(
          withTiming(1, { duration: 1200 }),
          -1,
          true
        );
        
        setTimeout(() => {
          sparkle2.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
          );
        }, 400);
        
        setTimeout(() => {
          sparkle3.value = withRepeat(
            withTiming(1, { duration: 1400 }),
            -1,
            true
          );
        }, 800);
      };
      
      startSparkleAnimation();
    }, []);

    const sparkleStyle1 = useAnimatedStyle(() => ({
      opacity: interpolate(sparkle1.value, [0, 0.5, 1], [0, 1, 0]),
      transform: [
        { scale: interpolate(sparkle1.value, [0, 0.5, 1], [0.5, 1.2, 0.5]) }
      ],
    }));

    const sparkleStyle2 = useAnimatedStyle(() => ({
      opacity: interpolate(sparkle2.value, [0, 0.5, 1], [0, 1, 0]),
      transform: [
        { scale: interpolate(sparkle2.value, [0, 0.5, 1], [0.3, 1, 0.3]) }
      ],
    }));

    const sparkleStyle3 = useAnimatedStyle(() => ({
      opacity: interpolate(sparkle3.value, [0, 0.5, 1], [0, 1, 0]),
      transform: [
        { scale: interpolate(sparkle3.value, [0, 0.5, 1], [0.4, 1.1, 0.4]) }
      ],
    }));

    return (
      <View style={styles.crownContainer}>
        <Text style={styles.premiumBadgeText}>👑</Text>
        
        {/* Sparkle particles */}
        <Animated.Text style={[styles.sparkle, styles.sparkle1, sparkleStyle1]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkle2, sparkleStyle2]}>
          ⭐
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkle3, sparkleStyle3]}>
          💫
        </Animated.Text>
      </View>
    );
  };

  // Animated pulse glow border component for premium posts
  const AnimatedPulseBorder = ({ children }: { children: React.ReactNode }) => {
    const pulseAnimation = useSharedValue(0);
    const colorAnimation = useSharedValue(0);

    React.useEffect(() => {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
      
      colorAnimation.value = withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        false
      );
    }, []);

    const animatedBorderStyle = useAnimatedStyle(() => {
      const opacity = interpolate(pulseAnimation.value, [0, 1], [0.4, 0.9]);
      const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.02]);
      
      // Color cycle through app's warm theme: Gold -> Coral -> Light Orange -> Gold
      const colorProgress = colorAnimation.value;
      let borderColor = '#FFD700'; // Default gold
      let shadowColor = '#FFD700';
      
      if (colorProgress <= 0.33) {
        // Gold to Coral
        const progress = colorProgress / 0.33;
        borderColor = `hsl(${interpolate(progress, [0, 1], [51, 16])}, 100%, ${interpolate(progress, [0, 1], [84, 66])}%)`;
        shadowColor = borderColor;
      } else if (colorProgress <= 0.66) {
        // Coral to Light Orange  
        const progress = (colorProgress - 0.33) / 0.33;
        borderColor = `hsl(${interpolate(progress, [0, 1], [16, 28])}, 100%, ${interpolate(progress, [0, 1], [66, 71])}%)`;
        shadowColor = borderColor;
      } else {
        // Light Orange back to Gold
        const progress = (colorProgress - 0.66) / 0.34;
        borderColor = `hsl(${interpolate(progress, [0, 1], [28, 51])}, 100%, ${interpolate(progress, [0, 1], [71, 84])}%)`;
        shadowColor = borderColor;
      }
      
      return {
        opacity,
        transform: [{ scale }],
        borderColor,
        shadowColor,
      };
    });

    return (
      <View style={styles.pulseBorderContainer}>
        <Animated.View style={[styles.pulseBorder, animatedBorderStyle]} />
        <View style={styles.pulseBorderContent}>
          {children}
        </View>
      </View>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const renderEncouragementPost = (post: EncouragementPost) => {
    const postContent = (
      <View style={[styles.postCard, post.isPremiumUser && styles.premiumPostCard]}>
        <View style={styles.postHeader}>
          <Text style={styles.postMessage}>{post.message}</Text>
          {post.isPremiumUser && (
            <View style={styles.premiumBadge}>
              <PremiumCrownWithSparkles />
            </View>
          )}
        </View>
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => handleHeartPost(post.id)}
          >
            <Text style={[styles.heartIcon, post.hasUserLiked && styles.heartIconLiked]}>
              {post.hasUserLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.heartCount}>{post.hearts}</Text>
          </TouchableOpacity>
          
          {post.isPremiumUser && (
            <Text style={styles.premiumLabel}>Premium Member</Text>
          )}
          
          <Text style={styles.postTime}>{formatTimeAgo(post.timestamp)}</Text>
        </View>
      </View>
    );

    return (
      <View key={post.id}>
        {post.isPremiumUser ? (
          <AnimatedPulseBorder>
            {postContent}
          </AnimatedPulseBorder>
        ) : (
          postContent
        )}
      </View>
    );
  };

  const renderFeaturePoll = () => (
    <PremiumFeatureGate
      feature={PREMIUM_FEATURES.CUSTOM_SCHEDULES}
      upgradePrompt={{
        title: "🗳️ Join the Conversation",
        message: "Vote in feature polls and help shape Takeamin's future",
        trigger: UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY
      }}
      fallback={
        <View style={styles.premiumPrompt}>
          <Text style={styles.premiumPromptTitle}>✨ Premium Feature Polls</Text>
          <Text style={styles.premiumPromptText}>
            Help us build features you want! Premium users vote on upcoming features and share suggestions.
          </Text>
        </View>
      }
    >
      <View style={styles.pollCard}>
        <Text style={styles.pollQuestion}>{poll.question}</Text>
        {poll.description && (
          <Text style={styles.pollDescription}>{poll.description}</Text>
        )}
        
        <View style={styles.pollOptions}>
          {poll.options.map((option) => {
            const votes = poll.votes[option] || 0;
            const totalVotes = Object.values(poll.votes).reduce((sum, v) => sum + v, 0);
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isSelected = poll.userVote === option;
            
            return (
              <TouchableOpacity
                key={option}
                style={[styles.pollOption, isSelected && styles.pollOptionSelected]}
                onPress={() => handleVotePoll(option)}
                disabled={!!poll.userVote}
              >
                <Text style={[styles.pollOptionText, isSelected && styles.pollOptionTextSelected]}>
                  {option}
                </Text>
                {poll.userVote && (
                  <View style={styles.pollResults}>
                    <View 
                      style={[styles.pollResultBar, { width: `${percentage}%` }]} 
                    />
                    <Text style={styles.pollPercentage}>{percentage}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {poll.userVote && (
          <Text style={styles.pollThanks}>
            🎉 Thanks for voting! Results will help prioritize our roadmap.
          </Text>
        )}
      </View>
    </PremiumFeatureGate>
  );

  const renderPostModal = () => (
    <Modal
      visible={showPostModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPostModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setShowPostModal(false);
                  setIsInputFocused(false);
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>✨ Share Encouragement</Text>
          <Text style={styles.modalSubtitle}>
            Inspire others on their vitamin journey!
          </Text>

          {/* Guidelines */}
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Community Guidelines:</Text>
            {COMMUNITY_GUIDELINES.map((guideline, index) => (
              <Text key={index} style={styles.guidelineItem}>
                {guideline}
              </Text>
            ))}
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Share your vitamin journey moment..."
              multiline
              maxLength={POST_LIMITS.MAX_LENGTH}
              textAlignVertical="top"
              blurOnSubmit={false}
            />
            <View style={styles.inputFooter}>
              {isInputFocused && (
                <TouchableOpacity style={styles.doneButton} onPress={dismissKeyboard}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.characterCount}>
                {newMessage.length}/{POST_LIMITS.MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* Template Suggestions */}
          <View style={styles.templatesSection}>
            <Text style={styles.templatesTitle}>💡 Need inspiration?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.templateChips}>
                {MESSAGE_TEMPLATES.slice(0, 4).map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateChip}
                    onPress={() => {
                      setNewMessage(template);
                      dismissKeyboard();
                    }}
                  >
                    <Text style={styles.templateChipText}>
                      {template.length > 30 ? template.substring(0, 30) + '...' : template}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[
              styles.postButton,
              newMessage.trim().length < POST_LIMITS.MIN_LENGTH && styles.postButtonDisabled
            ]}
            onPress={handlePostMessage}
            disabled={newMessage.trim().length < POST_LIMITS.MIN_LENGTH}
          >
            <Text style={styles.postButtonText}>
              Share Encouragement ✨
            </Text>
          </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Community</Text>
        <Text style={styles.pageSubtitle}>Share encouragement and connect with fellow vitamin enthusiasts 💚</Text>

        {/* Community Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Community Preview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{communityStats.activeUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Takeamin Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Soon!</Text>
              <Text style={styles.statLabel}>Community Posts</Text>
            </View>
          </View>
          <Text style={styles.statsNote}>
            💚 Building our community of vitamin enthusiasts
          </Text>
        </View>

        {/* Encouragement Wall */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💬 Encouragement Wall</Text>
            <TouchableOpacity 
              style={[
                styles.postFloatingButton,
                !canPost && styles.postFloatingButtonDisabled
              ]}
              onPress={handleShareButtonPress}
            >
              <Text style={styles.postFloatingButtonText}>✨ Share</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionSubtitle}>
            Anonymous posts from the Takeamin community
          </Text>

          <View style={styles.postsContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyWallState}>
                <Text style={styles.emptyWallIcon}>💬</Text>
                <Text style={styles.emptyWallTitle}>Encouragement Wall Coming Soon!</Text>
                <Text style={styles.emptyWallText}>
                  We're building a beautiful space for sharing vitamin journey moments and positive encouragement.
                  {'\n\n'}
                  Coming in a future update:
                  {'\n'}• Anonymous encouragement sharing
                  {'\n'}• Heart reactions and community support  
                  {'\n'}• Safe, moderated positive space
                  {'\n'}• Weekly community highlights
                </Text>
                <View style={styles.emptyWallCta}>
                  <Text style={styles.emptyWallCtaText}>
                    🗳️ Premium users can vote in feature polls below to help us prioritize!
                  </Text>
                </View>
              </View>
            ) : (
              posts.map(renderEncouragementPost)
            )}
          </View>
        </View>

        {/* Feature Polls (Premium) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗳️ Feature Polls</Text>
          <Text style={styles.sectionSubtitle}>
            Help shape Takeamin's future (Premium feature)
          </Text>
          
          {renderFeaturePoll()}
        </View>

        {/* Coming Soon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Coming Soon</Text>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonIcon}>🎯</Text>
            <Text style={styles.comingSoonTitle}>More Community Features</Text>
            <Text style={styles.comingSoonText}>
              • Achievement badges for active members{'\n'}
              • Weekly community challenges{'\n'}
              • Feature suggestion box{'\n'}
              • Success story highlights
            </Text>
          </View>
        </View>
      </ScrollView>

      {renderPostModal()}
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  
  // Stats Styles
  statsCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#87CEEB',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#1E40AF',
  },
  statsNote: {
    fontSize: 12,
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Section Styles
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Post Styles
  postFloatingButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  postFloatingButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  postFloatingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postsContainer: {
    gap: 12,
  },
  emptyWallState: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
  },
  emptyWallIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyWallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyWallText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 20,
  },
  emptyWallCta: {
    backgroundColor: '#E8F4FD',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#87CEEB',
    alignItems: 'center',
  },
  emptyWallCtaText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  premiumBadge: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Crown and sparkle animation styles
  crownContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  premiumBadgeText: {
    fontSize: 16,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 12,
    zIndex: 0,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sparkle1: {
    top: -8,
    right: -8,
  },
  sparkle2: {
    bottom: -8,
    left: -8,
  },
  sparkle3: {
    top: 8,
    right: -12,
  },
  // Animated pulse border styles
  pulseBorderContainer: {
    position: 'relative',
    padding: 2,
    borderRadius: 17,
  },
  pulseBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 10,
  },
  pulseBorderContent: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  premiumPostCard: {
    backgroundColor: '#FFF8F6',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  premiumLabel: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }], // Adjusted for longer text
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A2BE2',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  heartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  heartIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  heartIconLiked: {
    // No additional style needed since emoji changes
  },
  heartCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },

  // Poll Styles
  pollCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  pollDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  pollOptions: {
    gap: 12,
  },
  pollOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pollOptionSelected: {
    backgroundColor: '#E8F4FD',
    borderColor: '#FF7F50',
  },
  pollOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  pollOptionTextSelected: {
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  pollResults: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollResultBar: {
    height: 4,
    backgroundColor: '#FF7F50',
    borderRadius: 2,
    flex: 1,
    marginRight: 10,
  },
  pollPercentage: {
    fontSize: 12,
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  pollThanks: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },

  // Premium Prompt Styles  
  premiumPrompt: {
    backgroundColor: '#F8F9FF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8EAFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  premiumPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 8,
  },
  premiumPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Coming Soon Styles
  comingSoonCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 15,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'left',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  modalWrapper: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },

  // Guidelines Styles
  guidelinesCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
    marginBottom: 2,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },

  // Template Styles
  templatesSection: {
    marginBottom: 25,
  },
  templatesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  templateChips: {
    flexDirection: 'row',
    gap: 10,
  },
  templateChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  templateChipText: {
    fontSize: 12,
    color: '#666',
  },

  // Post Button Styles
  postButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  postButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});