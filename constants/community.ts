/**
 * Polls & Feedback Feature Constants
 * Feature suggestion polls and usage feedback
 */

// Removed EncouragementPost interface - no longer needed

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

// Sample future feature poll

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

// Current usage poll
export const CURRENT_USAGE_POLL: FeaturePoll = {
  id: 'usage-poll-2024-1',
  question: '📈 Which feature do you use most?',
  description: 'Help us understand how you use Takeamin!',
  options: [
    'Progress Tracking',
    'Smart Reminders'
  ],
  votes: {
    'Progress Tracking': 45,
    'Smart Reminders': 38
  },
  userVote: undefined,
  isActive: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // expires in 7 days
};

// Poll statistics
export const getPollStats = () => ({
  totalVotes: 127,
  activePolls: 2,
  userParticipation: '68%'
});

// Helper function to format poll results percentage
export const formatPollPercentage = (votes: number, totalVotes: number): string => {
  if (totalVotes === 0) return '0%';
  return `${Math.round((votes / totalVotes) * 100)}%`;
};