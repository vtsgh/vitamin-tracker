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
      
      // Set up customer info update listener
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('💳 Customer info updated:', {
          isPremium: customerInfo.entitlements.active['premium'] !== undefined,
          entitlements: Object.keys(customerInfo.entitlements.active),
          originalAppUserId: customerInfo.originalAppUserId
        });
      });
      
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
      console.log('🔍 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      
      console.log('📋 Raw offerings response:', JSON.stringify({
        current: offerings.current?.identifier,
        all: Object.keys(offerings.all).length,
        currentPackages: offerings.current?.availablePackages?.length || 0
      }));
      
      if (offerings.current !== null) {
        console.log('📦 Available packages in current offering:');
        offerings.current.availablePackages.forEach((pkg, index) => {
          console.log(`  ${index + 1}. ${pkg.identifier} (${pkg.packageType}) -> ${pkg.product.identifier} (${pkg.product.price})`);
        });
        return [offerings.current];
      }
      
      console.log('⚠️ No current offerings available');
      console.log('⚠️ Available offerings:', Object.keys(offerings.all));
      return [];
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      console.error('❌ Offerings error details:', JSON.stringify(error, null, 2));
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
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      // Handle specific RevenueCat error types
      if (error.code) {
        console.error('RevenueCat Error Code:', error.code);
        console.error('RevenueCat Error Message:', error.message);
        
        switch (error.code) {
          case 'USER_CANCELLED':
            return { customerInfo: await this.getCustomerInfo(), cancelled: true };
          case 'PAYMENT_PENDING':
            console.log('Payment is pending');
            break;
          case 'PRODUCT_NOT_AVAILABLE':
            console.error('Product not available for purchase');
            break;
          case 'PURCHASE_NOT_ALLOWED':
            console.error('Purchase not allowed on this device');
            break;
          default:
            console.error('Unknown RevenueCat error');
        }
      }
      
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