/**
 * RevenueCat Configuration
 * Store your RevenueCat API keys and product IDs here
 */

// RevenueCat API Keys (get these from your RevenueCat dashboard)
export const REVENUECAT_CONFIG = {
  // RevenueCat PUBLIC API Keys - NEVER use secret keys (sk_) in mobile apps!
  API_KEY_IOS: 'appl_YOUR_IOS_PUBLIC_KEY_HERE', // Get from RevenueCat Dashboard → Settings → API Keys
  API_KEY_ANDROID: 'goog_YOUR_ANDROID_PUBLIC_KEY_HERE', // Get from RevenueCat Dashboard → Settings → API Keys
  
  // Development key for testing (also should be public key)
  API_KEY_DEV: 'appl_YOUR_DEV_PUBLIC_KEY_HERE', // Your development public API key
  
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
  // Import Platform here to avoid circular dependencies
  const { Platform } = require('react-native');
  
  // In development, use the dev key for testing
  if (__DEV__) {
    return REVENUECAT_CONFIG.API_KEY_DEV;
  }
  
  // In production, detect platform and use appropriate key
  if (Platform.OS === 'android') {
    return REVENUECAT_CONFIG.API_KEY_ANDROID;
  } else {
    return REVENUECAT_CONFIG.API_KEY_IOS;
  }
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