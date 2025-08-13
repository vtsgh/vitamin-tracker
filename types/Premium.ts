import { PREMIUM_FEATURES, FEATURE_CATEGORIES, UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];
export type FeatureCategory = typeof FEATURE_CATEGORIES[keyof typeof FEATURE_CATEGORIES];
export type UpgradeTriggerContext = typeof UPGRADE_TRIGGER_CONTEXTS[keyof typeof UPGRADE_TRIGGER_CONTEXTS];

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionDate?: string;
  expirationDate?: string; // undefined for lifetime purchases
  trialUsed?: boolean;
}

export interface UpgradeContext {
  feature: PremiumFeature;
  category: FeatureCategory;
  trigger: UpgradeTriggerContext;
  metadata?: {
    currentStreak?: number;
    plansCount?: number;
    badgesEarned?: number;
    customMessage?: string;
  };
}

export interface PremiumFeatureGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  upgradePrompt?: {
    title?: string;
    message?: string;
    trigger?: UpgradeTriggerContext;
  };
  showPremiumBadge?: boolean;
  disabled?: boolean;
}

export interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  context?: UpgradeContext;
  onUpgrade?: () => void;
}

export interface PremiumBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface CategoryBenefits {
  category: FeatureCategory;
  title: string;
  subtitle: string;
  benefits: PremiumBenefit[];
}