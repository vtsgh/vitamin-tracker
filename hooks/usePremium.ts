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
import { revenueCatService } from '../services/RevenueCatService';
import { getRevenueCatAPIKey } from '../constants/revenuecat';

const PREMIUM_STORAGE_KEY = 'premiumStatus';

export const usePremium = () => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    trialUsed: false
  });
  const [upgradeContext, setUpgradeContext] = useState<UpgradeContext | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load premium status from RevenueCat and storage
  useEffect(() => {
    initializeAndLoadPremiumStatus();
  }, []);

  const initializeAndLoadPremiumStatus = async () => {
    try {
      // Initialize RevenueCat
      const apiKey = getRevenueCatAPIKey();
      
      // Check if we have a valid API key (not placeholder)
      const hasValidKey = apiKey !== 'appl_YOUR_DEV_API_KEY_HERE' && 
                         apiKey !== 'appl_YOUR_IOS_API_KEY_HERE' && 
                         apiKey !== 'goog_YOUR_ANDROID_PUBLIC_KEY_HERE' &&
                         !apiKey.includes('YOUR_') && 
                         !apiKey.startsWith('sk_');
      
      if (hasValidKey) {
        console.log('🔑 Initializing RevenueCat with valid key:', apiKey.substring(0, 20) + '...');
        await revenueCatService.initialize(apiKey);
        
        // Check premium status from RevenueCat
        const isPremiumFromRC = await revenueCatService.isPremium();
        
        if (isPremiumFromRC) {
          const customerInfo = await revenueCatService.getCustomerInfo();
          const newStatus: PremiumStatus = {
            isPremium: true,
            subscriptionType: 'monthly', // You can determine this from product identifier
            subscriptionDate: new Date().toISOString(),
            expirationDate: customerInfo.expirationDate ? new Date(customerInfo.expirationDate).toISOString() : undefined,
            trialUsed: true // Assume trial is used if they have a subscription
          };
          setPremiumStatus(newStatus);
          await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(newStatus));
          return;
        }
      } else {
        console.log('⚠️ RevenueCat not configured - using local premium status only');
        console.log('   API key:', apiKey);
        console.log('   Set up App Store Connect and get real public API keys to enable RevenueCat');
      }
      
      // Fallback to local storage if RevenueCat isn't configured or user isn't premium
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored) {
        const status: PremiumStatus = JSON.parse(stored);
        setPremiumStatus(status);
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
      // Fallback to local storage on error
      try {
        const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (stored) {
          const status: PremiumStatus = JSON.parse(stored);
          setPremiumStatus(status);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback premium status:', fallbackError);
      }
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

  // Upgrade to premium using RevenueCat
  const upgradeToPremium = useCallback(async (subscriptionType: 'monthly' | 'lifetime' = 'monthly') => {
    try {
      const offerings = await revenueCatService.getOfferings();
      
      if (offerings.length === 0) {
        console.log('⚠️ No offerings available, falling back to mock upgrade');
        // Fallback to mock upgrade for development
        const newStatus: PremiumStatus = {
          isPremium: true,
          subscriptionType,
          subscriptionDate: new Date().toISOString(),
          expirationDate: subscriptionType === 'monthly' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : subscriptionType === 'lifetime' 
              ? undefined // Lifetime never expires
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          trialUsed: premiumStatus.trialUsed
        };
        
        await savePremiumStatus(newStatus);
        closeUpgradeModal();
        return;
      }

      // Find the appropriate package
      const currentOffering = offerings[0];
      
      console.log('🛒 Available packages:', currentOffering.availablePackages.map(pkg => ({
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        product: pkg.product.identifier
      })));
      
      const packageToPurchase = subscriptionType === 'lifetime' 
        ? currentOffering.availablePackages.find(pkg => 
            pkg.identifier === '$rc_lifetime' || 
            pkg.identifier.includes('lifetime') ||
            pkg.packageType === 'LIFETIME' ||
            pkg.product.identifier === 'takeamin_lifetime' ||
            pkg.product.identifier === 'lifetime_premium'
          )
        : currentOffering.availablePackages.find(pkg => 
            pkg.identifier === '$rc_monthly' || 
            pkg.identifier.includes('monthly') ||
            pkg.packageType === 'MONTHLY' ||
            pkg.product.identifier === 'takeamin_monthly_premium'
          );

      if (!packageToPurchase) {
        const availablePackages = currentOffering.availablePackages.map(pkg => pkg.identifier).join(', ');
        console.error(`❌ No ${subscriptionType} package found. Available packages: ${availablePackages}`);
        throw new Error(`No ${subscriptionType} package available. Available: ${availablePackages}`);
      }

      console.log(`✅ Found ${subscriptionType} package:`, packageToPurchase.identifier);

      // Attempt purchase
      const { customerInfo, cancelled } = await revenueCatService.purchasePackage(packageToPurchase);
      
      if (cancelled) {
        console.log('🚫 Purchase cancelled by user');
        return;
      }

      // Update premium status based on purchase
      const newStatus: PremiumStatus = {
        isPremium: true,
        subscriptionType,
        subscriptionDate: new Date().toISOString(),
        expirationDate: customerInfo.expirationDate ? new Date(customerInfo.expirationDate).toISOString() : undefined,
        trialUsed: true
      };
      
      await savePremiumStatus(newStatus);
      closeUpgradeModal();
      
      console.log('✅ Premium upgrade successful!');
    } catch (error) {
      console.error('❌ Premium upgrade failed:', error);
      // You might want to show an error message to the user
      throw error;
    }
  }, [premiumStatus.trialUsed, closeUpgradeModal]);

  // Start free trial through RevenueCat (prevents reinstall abuse)
  const startFreeTrial = useCallback(async () => {
    try {
      console.log('🎯 Starting RevenueCat free trial...');
      
      // Check if user has already used trial via RevenueCat
      const customerInfo = await revenueCatService.getCustomerInfo();
      
      // Check if user has any entitlements (including expired trials)
      if (Object.keys(customerInfo.allEntitlements).length > 0) {
        console.log('⚠️ User has already used trial via RevenueCat');
        return false; // Trial already used
      }
      
      // For now, disable free trial to prevent abuse
      // Instead, redirect to purchase flow
      console.log('⚠️ Free trial disabled - redirecting to purchase');
      return false;
      
      /* TODO: Implement proper RevenueCat free trial
      const offerings = await revenueCatService.getOfferings();
      if (offerings.length > 0) {
        const trialPackage = offerings[0].availablePackages.find(pkg => 
          pkg.identifier === '$rc_monthly' && pkg.product.introPrice
        );
        
        if (trialPackage) {
          const { customerInfo, cancelled } = await revenueCatService.purchasePackage(trialPackage);
          if (!cancelled) {
            // Trial started successfully
            const newStatus: PremiumStatus = {
              isPremium: true,
              subscriptionType: 'monthly',
              subscriptionDate: new Date().toISOString(),
              expirationDate: customerInfo.expirationDate ? new Date(customerInfo.expirationDate).toISOString() : undefined,
              trialUsed: true
            };
            await savePremiumStatus(newStatus);
            closeUpgradeModal();
            return true;
          }
        }
      }
      */
      
    } catch (error) {
      console.error('❌ Free trial failed:', error);
      return false;
    }
  }, [closeUpgradeModal]);

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

  // Restore purchases from RevenueCat
  const restorePurchases = useCallback(async () => {
    try {
      console.log('🔄 Restoring purchases...');
      const customerInfo = await revenueCatService.restorePurchases();
      
      const isPremiumFromRC = await revenueCatService.isPremium();
      
      if (isPremiumFromRC) {
        const newStatus: PremiumStatus = {
          isPremium: true,
          subscriptionType: 'monthly', // You can determine this from product identifier
          subscriptionDate: new Date().toISOString(),
          expirationDate: customerInfo.expirationDate ? new Date(customerInfo.expirationDate).toISOString() : undefined,
          trialUsed: true
        };
        
        await savePremiumStatus(newStatus);
        console.log('✅ Purchases restored successfully');
        return true;
      } else {
        console.log('ℹ️ No active subscriptions found');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      return false;
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
    restorePurchases,
    
    // Utilities
    getPremiumStatusText,
    isSubscriptionExpired,
    
    // Development
    togglePremiumForTesting,
    resetPremiumForTesting
  };
};