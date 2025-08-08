/**
 * RevenueCat Service
 * Manages subscription and purchase logic for Takeamin Premium
 */

import Purchases, { 
  CustomerInfo, 
  PurchasesOffering, 
  PurchasesPackage,
  LOG_LEVEL 
} from 'react-native-purchases';

export class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  /**
   * Initialize RevenueCat SDK
   * Call this once in your app initialization
   */
  async initialize(apiKey: string, userId?: string): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('💳 RevenueCat already initialized');
        return;
      }

      // Configure RevenueCat
      Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Change to INFO or ERROR in production
      
      await Purchases.configure({ apiKey });
      
      // Set user ID if provided (useful for analytics)
      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get current customer info (subscription status, etc.)
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async isPremium(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      // Check if user has active entitlement for "premium" (you'll need to configure this in RevenueCat dashboard)
      const isPremiumActive = customerInfo.entitlements.active['premium'] !== undefined;
      
      console.log('🏆 Premium status:', isPremiumActive);
      return isPremiumActive;
    } catch (error) {
      console.error('❌ Failed to check premium status:', error);
      // Default to non-premium on error
      return false;
    }
  }

  /**
   * Get available offerings (subscription packages)
   */
  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        console.log('📦 Available offerings:', offerings.current.availablePackages.length);
        return [offerings.current];
      }
      
      console.log('⚠️ No current offerings available');
      return [];
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
    customerInfo: CustomerInfo;
    cancelled: boolean;
  }> {
    try {
      console.log('💳 Attempting to purchase:', packageToPurchase.identifier);
      
      const { customerInfo, productIdentifier, userCancelled } = await Purchases.purchasePackage(packageToPurchase);
      
      if (userCancelled) {
        console.log('🚫 Purchase cancelled by user');
        return { customerInfo, cancelled: true };
      }

      console.log('✅ Purchase successful:', productIdentifier);
      return { customerInfo, cancelled: false };
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      console.log('🔄 Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored successfully');
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Set user attributes for analytics (optional)
   */
  async setUserAttributes(attributes: Record<string, string | null>): Promise<void> {
    try {
      await Purchases.setAttributes(attributes);
      console.log('📊 User attributes set:', Object.keys(attributes));
    } catch (error) {
      console.error('❌ Failed to set user attributes:', error);
    }
  }

  /**
   * Get user ID
   */
  async getUserId(): Promise<string> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo.originalAppUserId;
    } catch (error) {
      console.error('❌ Failed to get user ID:', error);
      throw error;
    }
  }

  /**
   * Log out current user (useful when switching accounts)
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('👋 User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Failed to logout:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const revenueCatService = RevenueCatService.getInstance();