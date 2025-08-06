/**
 * Smart Reminders Feature Constants
 */

// Vitamin-specific timing recommendations
export const VITAMIN_TIMING_RECOMMENDATIONS: Record<string, {
  optimalTimes: string[];
  reason: string;
  withFood: boolean;
  avoidTimes?: string[];
}> = {
  'vitamin-d': {
    optimalTimes: ['07:00', '08:00', '09:00'],
    reason: 'Best absorbed in the morning with breakfast',
    withFood: true,
  },
  'vitamin-b12': {
    optimalTimes: ['07:00', '08:00', '09:00'],
    reason: 'Energizing - take in the morning to avoid sleep disruption',
    withFood: false,
    avoidTimes: ['19:00', '20:00', '21:00', '22:00'],
  },
  'vitamin-c': {
    optimalTimes: ['07:00', '12:00', '17:00'],
    reason: 'Water-soluble - can take multiple times per day',
    withFood: false,
  },
  'iron': {
    optimalTimes: ['07:00', '08:00'],
    reason: 'Best absorbed on empty stomach, pair with Vitamin C',
    withFood: false,
  },
  'calcium': {
    optimalTimes: ['19:00', '20:00', '21:00'],
    reason: 'Take in evening for better absorption and bone health',
    withFood: true,
  },
  'magnesium': {
    optimalTimes: ['20:00', '21:00', '22:00'],
    reason: 'Promotes relaxation and better sleep quality',
    withFood: false,
  },
  'zinc': {
    optimalTimes: ['19:00', '20:00'],
    reason: 'Take in evening on empty stomach (1 hour before bed)',
    withFood: false,
  },
  'omega-3': {
    optimalTimes: ['07:00', '12:00', '18:00'],
    reason: 'Fat-soluble - take with meals for best absorption',
    withFood: true,
  },
  'multivitamin': {
    optimalTimes: ['08:00', '09:00'],
    reason: 'Take with breakfast for optimal nutrient absorption',
    withFood: true,
  },
};

// Default timing suggestions when we don't have specific vitamin info
export const DEFAULT_TIMING_SUGGESTIONS = {
  morning: ['07:00', '08:00', '09:00'],
  afternoon: ['12:00', '13:00', '14:00'],
  evening: ['18:00', '19:00', '20:00'],
};

// Notification escalation messages
export const ESCALATION_MESSAGES = {
  gentle: [
    "Gentle reminder: Time for your {vitamin}! 🌱",
    "Your daily {vitamin} is ready! ✨",
    "{vitamin} time! Your health journey continues 🌿",
  ],
  encouraging: [
    "Don't break your streak! Time for {vitamin} 💪",
    "You're doing great! Don't forget your {vitamin} 🌟",
    "Keep your healthy habit going with {vitamin} 🎯",
  ],
  urgent: [
    "Last call for {vitamin}! You've got this 🚨",
    "Final reminder: {vitamin} is waiting for you ⏰",
    "Don't let today slip by without your {vitamin} 📢",
  ],
};

// Behavioral learning thresholds
export const LEARNING_THRESHOLDS = {
  MIN_DATA_POINTS: 7, // Minimum responses before adapting
  RESPONSE_RATE_THRESHOLD: 0.7, // 70% response rate to consider time optimal
  CONSECUTIVE_MISS_THRESHOLD: 3, // Start escalating after 3 consecutive misses
  ADAPTATION_CONFIDENCE_THRESHOLD: 0.8, // Confidence needed to suggest time changes
};

// Smart reminder feature flags for gradual rollout
export const SMART_REMINDER_FEATURES = {
  ADAPTIVE_TIMING: 'adaptive_timing',
  BEHAVIOR_LEARNING: 'behavior_learning',
  LOCATION_REMINDERS: 'location_reminders',
  MULTI_CHANNEL: 'multi_channel_reminders',
  CALENDAR_INTEGRATION: 'calendar_integration',
  SMART_SNOOZING: 'smart_snoozing',
} as const;

// Notification channels and their priorities
export const NOTIFICATION_CHANNELS = {
  PUSH: {
    id: 'push',
    name: 'Push Notifications',
    description: 'Standard notification alerts',
    priority: 1,
    availableToFree: true,
  },
  WIDGET: {
    id: 'widget',
    name: 'Home Screen Widget',
    description: 'Reminder displayed on home screen widget',
    priority: 2,
    availableToFree: false,
  },
  LOCATION: {
    id: 'location',
    name: 'Location-Based',
    description: 'Reminders when arriving at specific locations',
    priority: 3,
    availableToFree: false,
  },
  CALENDAR: {
    id: 'calendar',
    name: 'Calendar Events',
    description: 'Add reminders to your calendar app',
    priority: 4,
    availableToFree: false,
  },
  SMART_WATCH: {
    id: 'smart_watch',
    name: 'Smart Watch',
    description: 'Notifications on connected wearable devices',
    priority: 5,
    availableToFree: false,
  },
} as const;

// Time-based insights for user feedback
export const TIME_INSIGHTS = {
  EARLY_BIRD: {
    range: { start: 5, end: 8 },
    message: "You're an early bird! 🐦 Your best reminder times are in the morning.",
    suggestion: "Consider taking energizing vitamins like B12 early to maximize benefits.",
  },
  MORNING_PERSON: {
    range: { start: 8, end: 11 },
    message: "You respond best to morning reminders! ☀️",
    suggestion: "Perfect timing for most vitamins - your body is ready to absorb nutrients.",
  },
  AFTERNOON_FOCUSED: {
    range: { start: 11, end: 16 },
    message: "You're most consistent with afternoon reminders! 🌞",
    suggestion: "Great for vitamins that don't need to be taken on empty stomach.",
  },
  EVENING_ROUTINE: {
    range: { start: 16, end: 22 },
    message: "Evening reminders work best for you! 🌙",
    suggestion: "Perfect for relaxing vitamins like Magnesium or Calcium.",
  },
  NIGHT_OWL: {
    range: { start: 22, end: 5 },
    message: "You're a night owl! 🦉 But earlier reminders might be healthier.",
    suggestion: "Consider gradually shifting your vitamin routine earlier in the day.",
  },
};

// Location-based reminder types (for future implementation)
export const LOCATION_TYPES = {
  HOME: {
    id: 'home',
    name: 'Home',
    description: 'When you arrive home',
    icon: '🏠',
    defaultRadius: 100, // meters
  },
  WORK: {
    id: 'work',
    name: 'Work',
    description: 'When you arrive at work',
    icon: '💼',
    defaultRadius: 100,
  },
  GYM: {
    id: 'gym',
    name: 'Gym',
    description: 'When you arrive at the gym',
    icon: '💪',
    defaultRadius: 50,
  },
  PHARMACY: {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'When you visit a pharmacy',
    icon: '💊',
    defaultRadius: 50,
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Location',
    description: 'A location you specify',
    icon: '📍',
    defaultRadius: 100,
  },
} as const;

// Smart snooze suggestions based on context
export const SMART_SNOOZE_OPTIONS = {
  QUICK: { minutes: 5, label: "5 minutes", emoji: "⚡" },
  SHORT: { minutes: 15, label: "15 minutes", emoji: "🎯" },
  MEDIUM: { minutes: 30, label: "30 minutes", emoji: "🕐" },
  LONG: { minutes: 60, label: "1 hour", emoji: "⏳" },
  MEAL_TIME: { minutes: 120, label: "After next meal", emoji: "🍽️" },
  EVENING: { minutes: 480, label: "This evening", emoji: "🌅" },
  TOMORROW: { minutes: 1440, label: "Tomorrow", emoji: "📅" },
} as const;