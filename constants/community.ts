/**
 * Polls & Feedback Feature Constants
 * Feature suggestion polls and usage feedback - now powered by Buy Me a Coffee
 */

// BMC Poll URLs - supporters vote on these posts
export const BMC_POLL_URLS = {
  'feature-next': 'https://buymeacoffee.com/takeamin/what-feature-added-next',
  'feature-usage': 'https://buymeacoffee.com/takeamin/which-feature-use'
} as const;

export interface FeaturePoll {
  id: string;
  question: string;
  description?: string;
  options: string[];
  bmcUrl: string; // URL to BMC poll post
  isActive: boolean;
  createdAt: Date;
}

// Feature polls - now redirect to BMC for supporter voting
export const CURRENT_FEATURE_POLL: FeaturePoll = {
  id: 'poll-2024-1',
  question: 'What should we build next?',
  options: [
    'Travel mode for reminders',
    'Vitamin interaction checker',
    'Weekly health challenges',
    'Integration with fitness apps'
  ],
  bmcUrl: BMC_POLL_URLS['feature-next'],
  isActive: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
};

// Current usage poll
export const CURRENT_USAGE_POLL: FeaturePoll = {
  id: 'usage-poll-2024-1',
  question: 'Which feature do you use most?',
  options: [
    'Progress Tracking',
    'Smart Reminders',
    'Vitamin Schedule',
    'Health Insights'
  ],
  bmcUrl: BMC_POLL_URLS['feature-usage'],
  isActive: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
};

// Redirect messaging for BMC polls
export const BMC_REDIRECT_MESSAGE = {
  title: '☕ Thank you!',
  message: 'Thank you for taking the time to help improve Takeamin with your input and suggestions - much appreciated!'
};