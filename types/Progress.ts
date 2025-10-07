export interface CheckIn {
  date: string; // ISO date string (YYYY-MM-DD)
  vitaminPlanId: string;
  timestamp: number; // When the check-in was recorded
  note?: string; // Optional user note about this check-in (local only)
}

export interface Streak {
  vitaminPlanId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string; // ISO date string
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'streak' | 'consistency' | 'milestone';
  requirement: number; // days/count needed to earn
  earnedDate?: string; // ISO date when earned
}

export interface StreakRecovery {
  id: string;
  vitaminPlanId: string;
  missedDate: string; // The date that was missed (YYYY-MM-DD)
  recoveryDate: string; // When the recovery was used (ISO string)
  recoveryMonth: string; // YYYY-MM for monthly limit tracking
}

export interface ProgressData {
  checkIns: CheckIn[];
  streaks: Streak[];
  badges: Badge[];
  streakRecoveries: StreakRecovery[];
}

// Free badges available to all users
export const FREE_BADGES: Omit<Badge, 'earnedDate'>[] = [
  {
    id: 'first-checkin',
    name: 'First Steps',
    description: 'Completed your first vitamin check-in',
    icon: '🌱',
    category: 'milestone',
    requirement: 1,
  },
  {
    id: 'streak-3',
    name: 'Three Day Streak',
    description: '3-day streak - habits are forming!',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
  },
  {
    id: 'streak-7',
    name: 'Week Streak',
    description: '7-day streak completed!',
    icon: '⚡',
    category: 'streak',
    requirement: 7,
  },
  {
    id: 'streak-14',
    name: 'Two Week Streak',
    description: '14-day streak completed!',
    icon: '💪',
    category: 'streak',
    requirement: 14,
  },
  {
    id: 'streak-30',
    name: 'Month Streak',
    description: '30-day streak completed!',
    icon: '🏆',
    category: 'streak',
    requirement: 30,
  },
  {
    id: 'consistent-week',
    name: 'Perfect Week',
    description: 'Took vitamins every day this week',
    icon: '✨',
    category: 'consistency',
    requirement: 7,
  },
  {
    id: 'monday-champion',
    name: 'Monday Momentum',
    description: 'Took vitamins 5 Mondays in a row',
    icon: '💪',
    category: 'consistency',
    requirement: 5,
  },
];

// All badges (free + premium) - computed at runtime
export const getAllAvailableBadges = (includePremium: boolean = false): Omit<Badge, 'earnedDate'>[] => {
  if (!includePremium) {
    return FREE_BADGES;
  }
  
  // Import premium badges to avoid circular dependency
  const { PREMIUM_BADGES } = require('../constants/premium');
  return [...FREE_BADGES, ...PREMIUM_BADGES];
};

// Backward compatibility
export const AVAILABLE_BADGES = FREE_BADGES;