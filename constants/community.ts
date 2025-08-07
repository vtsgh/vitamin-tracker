/**
 * Community Feature Constants
 * Encouragement Wall and Feature Suggestion Polls
 */

export interface EncouragementPost {
  id: string;
  message: string;
  timestamp: Date;
  hearts: number;
  hasUserLiked: boolean;
}

export interface FeaturePoll {
  id: string;
  question: string;
  description?: string;
  options: string[];
  votes: Record<string, number>; // option -> vote count
  userVote?: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface UserSuggestion {
  id: string;
  suggestion: string;
  timestamp: Date;
  implemented?: boolean;
  implementedDate?: Date;
}

// Sample encouragement posts (these would come from a database in production)
export const SAMPLE_ENCOURAGEMENT_POSTS: EncouragementPost[] = [
  {
    id: '1',
    message: "💊 Day 3 of consistency. It's the little things!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    hearts: 12,
    hasUserLiked: false
  },
  {
    id: '2', 
    message: "Almost forgot today but Takeamin had my back 💫",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    hearts: 8,
    hasUserLiked: true,
    isPremiumUser: true
  },
  {
    id: '3',
    message: "Celebrating a week of remembering my B12 🧡",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    hearts: 15,
    hasUserLiked: false
  },
  {
    id: '4',
    message: "Smart reminders helped me find my perfect vitamin timing! 🎯",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    hearts: 21,
    hasUserLiked: false,
    isPremiumUser: true
  },
  {
    id: '5',
    message: "Three weeks strong with my magnesium routine 😴✨",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    hearts: 9,
    hasUserLiked: false
  },
  {
    id: '6',
    message: "The vitamin education section taught me so much! Knowledge is power 🎓",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
    hearts: 18,
    hasUserLiked: false
  },
  {
    id: '7',
    message: "My energy levels are through the roof since starting my routine 🚀",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    hearts: 25,
    hasUserLiked: true,
    isPremiumUser: true
  },
  {
    id: '8',
    message: "Thank you to everyone sharing encouragement here 💚",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    hearts: 31,
    hasUserLiked: false
  }
];

// Sample feature poll (would be managed from admin panel in production)
export const CURRENT_FEATURE_POLL: FeaturePoll = {
  id: 'poll-2024-1',
  question: '🧠 What should we build next?',
  description: 'Help us prioritize new features for Takeamin!',
  options: [
    'Travel mode for reminders',
    'Vitamin interaction checker', 
    'Weekly health challenges',
    'Integration with fitness apps'
  ],
  votes: {
    'Travel mode for reminders': 23,
    'Vitamin interaction checker': 31,
    'Weekly health challenges': 18,
    'Integration with fitness apps': 12
  },
  userVote: undefined,
  isActive: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // expires in 5 days
};

// Community statistics
export const getCommunityStats = () => ({
  encouragementsThisWeek: 2174,
  totalHearts: 8942,
  activeUsers: 1247,
  weeklyGrowth: '+12%'
});

// Predefined positive message templates for easy posting
export const MESSAGE_TEMPLATES = [
  "💊 Day [X] of consistency. It's the little things!",
  "Almost forgot today but Takeamin had my back 💫",
  "Celebrating a week of remembering my [vitamin] 🧡",
  "My energy levels are amazing since starting my routine 🚀",
  "Smart reminders found my perfect timing! 🎯",
  "Three weeks strong with my vitamin routine ✨",
  "The encouragement here keeps me motivated 💚",
  "Small steps, big changes! 🌱"
];

// Achievement badges for community participation
export const COMMUNITY_BADGES = {
  FIRST_POST: {
    id: 'first_post',
    name: 'First Share',
    description: 'Posted your first encouragement',
    icon: '🎉',
    color: '#FFD700'
  },
  HEART_GIVER: {
    id: 'heart_giver', 
    name: 'Heart Giver',
    description: 'Reacted to 10 posts',
    icon: '💝',
    color: '#FF69B4'
  },
  FEATURE_TESTER: {
    id: 'feature_tester',
    name: 'Feature Tester',
    description: 'Voted in a feature poll',
    icon: '🧪',
    color: '#6366F1'
  },
  COMMUNITY_CHAMPION: {
    id: 'community_champion',
    name: 'Community Champion', 
    description: 'Received 50 hearts total',
    icon: '🏆',
    color: '#32CD32'
  }
} as const;

// Guidelines for community posts
export const COMMUNITY_GUIDELINES = [
  "💚 Share positive vitamin journey moments",
  "🤝 Keep posts encouraging and supportive", 
  "🚫 No personal details or medical advice",
  "✨ Celebrate small wins and consistency",
  "🌟 Help others feel motivated and supported"
];

// Post character limits
export const POST_LIMITS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 120,
  SUGGESTION_MAX_LENGTH: 200
} as const;

// Posting limits for free vs premium users
export const POSTING_LIMITS = {
  FREE_POSTS_PER_MONTH: 1,
  PREMIUM_POSTS_PER_MONTH: -1 // unlimited
} as const;

// Helper function to check if user can post
export const canUserPost = (userPostsThisMonth: number, isPremium: boolean): boolean => {
  if (isPremium) return true;
  return userPostsThisMonth < POSTING_LIMITS.FREE_POSTS_PER_MONTH;
};

// Helper function to get days until next post for free users
export const getDaysUntilNextPost = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};