/**
 * Premium features and configuration
 */

export const PREMIUM_FEATURES = {
  // Progress Tracking
  UNLIMITED_BADGES: 'unlimited_badges',
  STREAK_RECOVERY: 'streak_recovery', 
  ENHANCED_MESSAGES: 'enhanced_messages',
  PROGRESS_EXPORT: 'progress_export',
  
  // Smart Reminders  
  CUSTOM_SCHEDULES: 'custom_schedules',
  SMART_TIMING: 'smart_timing',
  LOCATION_REMINDERS: 'location_reminders',
  
  // Health Insights
  VITAMIN_ANALYSIS: 'vitamin_analysis',
  HEALTH_REPORTS: 'health_reports',
  NUTRIENT_TRACKING: 'nutrient_tracking',
  
  // Community & Sharing
  SOCIAL_SHARING: 'social_sharing',
  COMMUNITY_ACCESS: 'community_access',
  PROGRESS_SHARING: 'progress_sharing',
  
  // General
  UNLIMITED_PLANS: 'unlimited_plans',
  CUSTOM_THEMES: 'custom_themes',
  PRIORITY_SUPPORT: 'priority_support'
} as const;

export const FEATURE_CATEGORIES = {
  PROGRESS: 'Progress Tracking',
  REMINDERS: 'Smart Reminders', 
  INSIGHTS: 'Health Insights',
  COMMUNITY: 'Community & Sharing',
  GENERAL: 'General'
} as const;

export const FEATURE_CATEGORY_MAP: Record<string, keyof typeof FEATURE_CATEGORIES> = {
  [PREMIUM_FEATURES.UNLIMITED_BADGES]: 'PROGRESS',
  [PREMIUM_FEATURES.STREAK_RECOVERY]: 'PROGRESS',
  [PREMIUM_FEATURES.ENHANCED_MESSAGES]: 'PROGRESS',
  [PREMIUM_FEATURES.PROGRESS_EXPORT]: 'PROGRESS',
  
  [PREMIUM_FEATURES.CUSTOM_SCHEDULES]: 'REMINDERS',
  [PREMIUM_FEATURES.SMART_TIMING]: 'REMINDERS',
  [PREMIUM_FEATURES.LOCATION_REMINDERS]: 'REMINDERS',
  
  [PREMIUM_FEATURES.VITAMIN_ANALYSIS]: 'INSIGHTS',
  [PREMIUM_FEATURES.HEALTH_REPORTS]: 'INSIGHTS',
  [PREMIUM_FEATURES.NUTRIENT_TRACKING]: 'INSIGHTS',
  
  [PREMIUM_FEATURES.SOCIAL_SHARING]: 'COMMUNITY',
  [PREMIUM_FEATURES.COMMUNITY_ACCESS]: 'COMMUNITY',
  [PREMIUM_FEATURES.PROGRESS_SHARING]: 'COMMUNITY',
  
  [PREMIUM_FEATURES.UNLIMITED_PLANS]: 'GENERAL',
  [PREMIUM_FEATURES.CUSTOM_THEMES]: 'GENERAL',
  [PREMIUM_FEATURES.PRIORITY_SUPPORT]: 'GENERAL'
};

export const FREE_LIMITS = {
  MAX_PLANS: 4,
  MAX_BADGES: 7, // Current AVAILABLE_BADGES length
  MAX_STREAK_RECOVERIES_PER_MONTH: 0,
  MAX_EXPORT_MONTHS: 1
} as const;

export const PREMIUM_LIMITS = {
  MAX_PLANS: -1, // unlimited
  MAX_BADGES: -1, // unlimited
  MAX_STREAK_RECOVERIES_PER_MONTH: 3, // 3 per month
  MAX_EXPORT_MONTHS: -1 // unlimited
} as const;

// Premium badge definitions (additional badges beyond free ones)
export const PREMIUM_BADGES = [
  {
    id: 'streak-60',
    name: 'Two Month Master',
    description: 'Incredible 60-day streak!',
    icon: '🌟',
    category: 'streak' as const,
    requirement: 60,
  },
  {
    id: 'streak-90',
    name: 'Quarterly Champion',
    description: 'Amazing 90-day streak!',
    icon: '💫',
    category: 'streak' as const,
    requirement: 90,
  },
  {
    id: 'streak-180',
    name: 'Half Year Hero',
    description: 'Outstanding 180-day streak!',
    icon: '🏆',
    category: 'streak' as const,
    requirement: 180,
  },
  {
    id: 'streak-365',
    name: 'Year Long Legend',
    description: 'Legendary 365-day streak!',
    icon: '👑',
    category: 'streak' as const,
    requirement: 365,
  },
  {
    id: 'perfect-month',
    name: 'Perfect Month',
    description: 'Took vitamins every day this month',
    icon: '🗓️',
    category: 'consistency' as const,
    requirement: 30,
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Never missed a weekend dose for a month',
    icon: '⚡',
    category: 'consistency' as const,
    requirement: 8,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Took vitamins before 8 AM for 10 days straight',
    icon: '🐦',
    category: 'consistency' as const,
    requirement: 10,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Consistent evening routine for 2 weeks',
    icon: '🦉',
    category: 'consistency' as const,
    requirement: 14,
  },
  {
    id: 'comeback-king',
    name: 'Comeback Champion',
    description: 'Recovered from a broken streak and built it back up',
    icon: '🔄',
    category: 'milestone' as const,
    requirement: 1,
  },
  {
    id: 'multi-vitamin',
    name: 'Multi-Vitamin Master',
    description: 'Successfully managed 4+ vitamin plans',
    icon: '🎯',
    category: 'milestone' as const,
    requirement: 4,
  }
] as const;

export const UPGRADE_TRIGGER_CONTEXTS = {
  PLAN_LIMIT_REACHED: 'plan_limit_reached',
  BADGE_LIMIT_REACHED: 'badge_limit_reached',
  STREAK_ABOUT_TO_BREAK: 'streak_about_to_break',
  STREAK_RECOVERY_LIMIT_REACHED: 'streak_recovery_limit_reached',
  MILESTONE_ACHIEVED: 'milestone_achieved',
  FEATURE_DISCOVERY: 'feature_discovery',
  HOMEPAGE_CTA: 'homepage_cta'
} as const;

export const PREMIUM_PRICING = {
  MONTHLY: {
    price: '$4.99',
    period: '/month',
    savings: null
  },
  YEARLY: {
    price: '$29.99', 
    period: '/year',
    savings: 'Save 50%'
  }
} as const;