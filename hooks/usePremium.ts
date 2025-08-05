import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  PREMIUM_FEATURES, 
  FEATURE_CATEGORY_MAP, 
  FREE_LIMITS, 
  PREMIUM_LIMITS,
  UPGRADE_TRIGGER_CONTEXTS 
} from '../constants/premium';
import { 
  PremiumStatus, 
  UpgradeContext, 
  PremiumFeature, 
  UpgradeTriggerContext 
} from '../types/Premium';

const PREMIUM_STORAGE_KEY = 'premiumStatus';

export const usePremium = () => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    trialUsed: false
  });
  const [upgradeContext, setUpgradeContext] = useState<UpgradeContext | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load premium status from storage
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored) {
        const status: PremiumStatus = JSON.parse(stored);
        setPremiumStatus(status);
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
  };

  const savePremiumStatus = async (status: PremiumStatus) => {
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(status));
      setPremiumStatus(status);
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  };

  // Check if user has access to a specific feature
  const hasFeature = useCallback((feature: PremiumFeature): boolean => {
    return premiumStatus.isPremium;
  }, [premiumStatus.isPremium]);

  // Get the limit for a specific resource
  const getLimit = useCallback((limitType: keyof typeof FREE_LIMITS): number => {
    return premiumStatus.isPremium ? PREMIUM_LIMITS[limitType] : FREE_LIMITS[limitType];
  }, [premiumStatus.isPremium]);

  // Check if a limit has been reached
  const isLimitReached = useCallback((limitType: keyof typeof FREE_LIMITS, currentCount: number): boolean => {
    const limit = getLimit(limitType);
    return limit !== -1 && currentCount >= limit;
  }, [getLimit]);

  // Trigger upgrade flow with context
  const triggerUpgrade = useCallback((
    feature: PremiumFeature,
    trigger: UpgradeTriggerContext = UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY,
    metadata?: UpgradeContext['metadata']
  ) => {
    const category = FEATURE_CATEGORY_MAP[feature];
    const context: UpgradeContext = {
      feature,
      category: category ? category : 'GENERAL',
      trigger,
      metadata
    };
    
    setUpgradeContext(context);
    setShowUpgradeModal(true);
  }, []);

  // Close upgrade modal
  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);
    setUpgradeContext(null);
  }, []);

  // Simulate premium upgrade (for testing - replace with actual payment logic)
  const upgradeToPremium = useCallback(async (subscriptionType: 'monthly' | 'yearly' = 'monthly') => {
    const newStatus: PremiumStatus = {
      isPremium: true,
      subscriptionType,
      subscriptionDate: new Date().toISOString(),
      expirationDate: subscriptionType === 'monthly' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      trialUsed: premiumStatus.trialUsed
    };
    
    await savePremiumStatus(newStatus);
    closeUpgradeModal();
  }, [premiumStatus.trialUsed, closeUpgradeModal]);

  // Start free trial (if not used)
  const startFreeTrial = useCallback(async () => {
    if (premiumStatus.trialUsed) return false;
    
    const trialStatus: PremiumStatus = {
      isPremium: true,
      subscriptionType: 'monthly',
      subscriptionDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      trialUsed: true
    };
    
    await savePremiumStatus(trialStatus);
    closeUpgradeModal();
    return true;
  }, [premiumStatus.trialUsed, closeUpgradeModal]);

  // Check if subscription is expired
  const isSubscriptionExpired = useCallback((): boolean => {
    if (!premiumStatus.isPremium || !premiumStatus.expirationDate) return false;
    return new Date() > new Date(premiumStatus.expirationDate);
  }, [premiumStatus]);

  // Get premium status for display
  const getPremiumStatusText = useCallback((): string => {
    if (!premiumStatus.isPremium) return 'Free';
    if (isSubscriptionExpired()) return 'Expired';
    if (premiumStatus.subscriptionType === 'yearly') return 'Premium (Yearly)';
    return 'Premium (Monthly)';
  }, [premiumStatus, isSubscriptionExpired]);

  // Development helper to toggle premium (remove in production)
  const togglePremiumForTesting = useCallback(async () => {
    const newStatus: PremiumStatus = {
      ...premiumStatus,
      isPremium: !premiumStatus.isPremium
    };
    await savePremiumStatus(newStatus);
  }, [premiumStatus]);

  // Development helper to reset premium status
  const resetPremiumForTesting = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
      console.log('🔄 Premium status cleared from AsyncStorage');
      const newStatus: PremiumStatus = {
        isPremium: false,
        trialUsed: false
      };
      setPremiumStatus(newStatus);
      console.log('🔄 Premium status reset to:', newStatus);
    } catch (error) {
      console.error('Error resetting premium status:', error);
    }
  }, []);

  return {
    // Premium status
    isPremium: premiumStatus.isPremium && !isSubscriptionExpired(),
    premiumStatus,
    
    // Feature access
    hasFeature,
    getLimit,
    isLimitReached,
    
    // Upgrade flow
    triggerUpgrade,
    showUpgradeModal,
    upgradeContext,
    closeUpgradeModal,
    
    // Premium actions
    upgradeToPremium,
    startFreeTrial,
    
    // Utilities
    getPremiumStatusText,
    isSubscriptionExpired,
    
    // Development
    togglePremiumForTesting,
    resetPremiumForTesting
  };
};