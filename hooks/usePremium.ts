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
// RevenueCat imports removed - all features now free

const PREMIUM_STORAGE_KEY = 'premiumStatus';

export const usePremium = () => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    trialUsed: false
  });
  const [upgradeContext, setUpgradeContext] = useState<UpgradeContext | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Initialize with all features unlocked (no RevenueCat needed)
  useEffect(() => {
    initializeAsPremium();
  }, []);

  const initializeAsPremium = async () => {
    console.log('🎉 All features unlocked - premium system disabled');
    const freeForAllStatus: PremiumStatus = {
      isPremium: true,
      subscriptionType: 'lifetime',
      subscriptionDate: new Date().toISOString(),
      trialUsed: false
    };

    setPremiumStatus(freeForAllStatus);

    // Save status locally for consistency
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(freeForAllStatus));
    } catch (error) {
      console.error('Error saving free-for-all status:', error);
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
    return true; // All features available to everyone
  }, []);

  // Get the limit for a specific resource (always unlimited now)
  const getLimit = useCallback((limitType: keyof typeof FREE_LIMITS): number => {
    return -1; // Always unlimited
  }, []);

  // Check if a limit has been reached (never reached now)
  const isLimitReached = useCallback((limitType: keyof typeof FREE_LIMITS, currentCount: number): boolean => {
    return false; // Never limited
  }, []);

  // Trigger upgrade flow with context (no-op since all features are free)
  const triggerUpgrade = useCallback((
    feature: PremiumFeature,
    trigger: UpgradeTriggerContext = UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY,
    metadata?: UpgradeContext['metadata']
  ) => {
    console.log('💝 All features are now free! No upgrade needed.');
    // Do nothing - all features are available
  }, []);

  // Close upgrade modal
  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);
    setUpgradeContext(null);
  }, []);

  // Upgrade functions removed - all features are now free

  // Simplified helper functions (all features are free now)
  const isSubscriptionExpired = useCallback((): boolean => {
    return false; // Never expired since everything is free
  }, []);

  const getPremiumStatusText = useCallback((): string => {
    return 'Free for Everyone!';
  }, []);

  // Development helper to reset (simplified)
  const resetPremiumForTesting = useCallback(async () => {
    console.log('🎉 All features are already free - no reset needed!');
  }, []);

  return {
    // Premium status (always true now)
    isPremium: true,
    premiumStatus,

    // Feature access (always available)
    hasFeature,
    getLimit,
    isLimitReached,

    // Upgrade flow (no-op but kept for compatibility)
    triggerUpgrade,
    showUpgradeModal: false, // Never show modal
    upgradeContext: null,
    closeUpgradeModal,

    // Utilities
    getPremiumStatusText,
    isSubscriptionExpired,

    // Development
    resetPremiumForTesting
  };
};