/**
 * RevenueCat Configuration
 * Store your RevenueCat API keys and product IDs here
 */

// RevenueCat API Keys (get these from your RevenueCat dashboard)
export const REVENUECAT_CONFIG = {
  // You'll need to replace these with your actual API keys from RevenueCat dashboard
  API_KEY_IOS: 'appl_YOUR_IOS_API_KEY_HERE', // Replace with your iOS API key
  API_KEY_ANDROID: 'goog_YOUR_ANDROID_API_KEY_HERE', // Replace with your Android API key
  
  // Entitlement identifier (configure this in RevenueCat dashboard)
  PREMIUM_ENTITLEMENT_ID: 'premium',
  
  // Product identifiers (these should match your App Store Connect/Google Play Console product IDs)
  PRODUCTS: {
    MONTHLY_PREMIUM: 'takeamin_premium_monthly', // $4.99/month
    YEARLY_PREMIUM: 'takeamin_premium_yearly',   // $29.99/year
  },
  
  // Package identifiers (optional, used for A/B testing)
  PACKAGES: {
    MONTHLY: '$rc_monthly',
    ANNUAL: '$rc_annual',
  }
} as const;

// Get the correct API key based on platform
export const getRevenueCatAPIKey = (): string => {
  // Note: In a real app, you'd detect platform properly
  // For now, we'll use a placeholder that you'll need to replace
  return __DEV__ 
    ? 'appl_YOUR_DEV_API_KEY_HERE' // Development key
    : REVENUECAT_CONFIG.API_KEY_IOS; // Production key
};

// Premium feature configuration
export const PREMIUM_FEATURES_CONFIG = {
  // Map your premium features to entitlement checks
  UNLIMITED_PLANS: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
  STREAK_RECOVERY: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
  UNLIMITED_BADGES: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
  ADVANCED_INSIGHTS: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
  COMMUNITY_FEATURES: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
  SMART_REMINDERS: REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT_ID,
} as const;