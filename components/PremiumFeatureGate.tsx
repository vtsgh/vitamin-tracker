import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePremium } from '../hooks/usePremium';
import { PremiumFeatureGateProps } from '../types/Premium';
import { UPGRADE_TRIGGER_CONTEXTS } from '../constants/premium';

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  feature,
  children,
  fallback,
  upgradePrompt,
  showPremiumBadge = true,
  disabled = false
}) => {
  const { hasFeature, triggerUpgrade } = usePremium();

  // If user has the feature or gate is disabled, show children
  if (hasFeature(feature) || disabled) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium gate UI
  const handleUpgradePress = () => {
    triggerUpgrade(
      feature,
      upgradePrompt?.trigger || UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY,
      {
        customMessage: upgradePrompt?.message
      }
    );
  };

  return (
    <TouchableOpacity 
      style={styles.premiumGate} 
      onPress={handleUpgradePress}
      activeOpacity={0.7}
    >
      <View style={styles.premiumContent}>
        {showPremiumBadge && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
          </View>
        )}
        
        <Text style={styles.premiumTitle}>
          {upgradePrompt?.title || 'Premium Feature'}
        </Text>
        
        <Text style={styles.premiumMessage}>
          {upgradePrompt?.message || 'Upgrade to Premium to unlock this feature'}
        </Text>
        
        <View style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Tap to Upgrade</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Utility component for inline premium badges
export const PremiumBadge: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const styles = size === 'small' ? smallBadgeStyles : 
                 size === 'large' ? largeBadgeStyles : mediumBadgeStyles;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>✨ PRO</Text>
    </View>
  );
};

// Component for premium feature preview (shows locked feature)
export const PremiumFeaturePreview: React.FC<{
  feature: string;
  title: string;
  description: string;
  onUpgrade?: () => void;
}> = ({ feature, title, description, onUpgrade }) => {
  const { triggerUpgrade } = usePremium();

  const handlePress = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      triggerUpgrade(feature as any, UPGRADE_TRIGGER_CONTEXTS.FEATURE_DISCOVERY);
    }
  };

  return (
    <TouchableOpacity style={styles.previewCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.previewContent}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>{title}</Text>
          <PremiumBadge size="small" />
        </View>
        <Text style={styles.previewDescription}>{description}</Text>
        <View style={styles.previewOverlay}>
          <Text style={styles.previewOverlayText}>🔒</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  premiumGate: {
    backgroundColor: '#F8F9FF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8EAFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginVertical: 10,
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginBottom: 5,
    textAlign: 'center',
  },
  premiumMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  previewContent: {
    opacity: 0.6,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOverlayText: {
    fontSize: 24,
  },
});

// Badge size variations
const smallBadgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
});

const mediumBadgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
});

const largeBadgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B5A00',
  },
});