import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VitaminCapsule from '../components/VitaminCapsule';
import { VITAMIN_EDUCATION_CARDS, HEALTH_ARTICLES, INSIGHT_CATEGORIES, FEATURED_CONTENT, getWeeklyArticles, VitaminEducationCard, HealthArticle } from '../constants/health-insights';
import { useTheme } from '@/contexts/ThemeContext';

export default function HealthInsights() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedCard, setSelectedCard] = useState<VitaminEducationCard | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  // Get seasonal recommendations and weekly articles
  const seasonalRecs = FEATURED_CONTENT.SEASONAL_RECOMMENDATIONS;
  const weeklyArticles = getWeeklyArticles();

  const handleGoHome = () => {
    router.push('/(tabs)/');
  };

  const handleCardPress = (card: VitaminEducationCard) => {
    setSelectedCard(card);
  };

  const handleArticlePress = (article: HealthArticle) => {
    setSelectedArticle(article);
  };

  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const renderVitaminCard = (card: VitaminEducationCard, index: number) => {
    const isFeatured = card.id === FEATURED_CONTENT.CARD_OF_THE_DAY;
    
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.vitaminCard,
          { backgroundColor: card.color },
          isFeatured && styles.featuredCard
        ]}
        onPress={() => handleCardPress(card)}
      >
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{card.icon}</Text>
          <Text style={styles.cardName}>{card.name}</Text>
        </View>
        
        <Text style={styles.cardBenefit}>{card.benefitSummary}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.tapHint}>Tap to learn more</Text>
          <Text style={styles.cardArrow}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderArticleCard = (article: HealthArticle) => {
    const isExpanded = expandedArticles.has(article.id);
    const isFeatured = article.id === FEATURED_CONTENT.ARTICLE_OF_THE_WEEK;
    
    return (
      <View
        key={article.id}
        style={[styles.articleCard, isFeatured && styles.featuredArticleCard]}
      >
        {isFeatured && (
          <View style={styles.featuredArticleBadge}>
            <Text style={styles.featuredBadgeText}>🔥 Article of the Week</Text>
          </View>
        )}
        
        <TouchableOpacity
          onPress={() => toggleArticleExpansion(article.id)}
          style={styles.articleHeader}
        >
          <View style={styles.articleTitleRow}>
            <Text style={styles.articleIcon}>{article.icon}</Text>
            <View style={styles.articleTitleContainer}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <View style={styles.articleMeta}>
                <Text style={styles.articleReadTime}>{article.readTime} min read</Text>
                <Text style={styles.articleCategory}>
                  {INSIGHT_CATEGORIES[article.category.toUpperCase() as keyof typeof INSIGHT_CATEGORIES]?.name || article.category}
                </Text>
              </View>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.articleSummary}>{article.summary}</Text>
        
        {isExpanded && (
          <View style={styles.articleContent}>
            <Text style={styles.articleText}>{article.content}</Text>

            {article.sources && article.sources.length > 0 && (
              <View style={styles.sourcesSection}>
                <Text style={styles.sourcesTitle}>Sources:</Text>
                {article.sources.map((source, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sourceItem}
                    onPress={() => Linking.openURL(source.url)}
                  >
                    <Text style={styles.sourceOrg}>{source.organization}</Text>
                    <Text style={styles.sourceTitle}>{source.title}</Text>
                    <Text style={styles.sourceLink}>Read full article →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {article.relatedVitamins && article.relatedVitamins.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>Related Vitamins:</Text>
                <View style={styles.relatedTags}>
                  {article.relatedVitamins.map((vitId) => {
                    const vitamin = VITAMIN_EDUCATION_CARDS.find(v => v.id === vitId);
                    return vitamin ? (
                      <View key={vitId} style={styles.relatedTag}>
                        <Text style={styles.relatedTagText}>{vitamin.icon} {vitamin.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!selectedCard) return null;

    return (
      <Modal
        visible={!!selectedCard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCard(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedCard(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalCardHeader, { backgroundColor: selectedCard.color }]}>
              <Text style={styles.modalCardIcon}>{selectedCard.icon}</Text>
              <Text style={styles.modalCardName}>{selectedCard.name}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💪 Benefits</Text>
              <Text style={styles.modalSectionText}>{selectedCard.benefitSummary}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🤔 Fun Fact</Text>
              <Text style={styles.modalSectionText}>{selectedCard.funFact}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🥗 Natural Sources</Text>
              <Text style={styles.modalSectionText}>{selectedCard.naturalSources}</Text>
            </View>

            {selectedCard.recommendedTiming && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⏰ Best Timing</Text>
                <Text style={styles.modalSectionText}>{selectedCard.recommendedTiming}</Text>
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonIcon}>🏠</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Health Insights</Text>
        <Text style={styles.pageSubtitle}>Learn about vitamins, wellness, and nutrition</Text>

        <View style={styles.topDisclaimer}>
          <Text style={styles.topDisclaimerText}>
            All content on this page is for educational purposes only and not medical advice • Always consult healthcare professionals
          </Text>
        </View>

        {/* Seasonal Recommendations */}
        <View style={styles.seasonalSection}>
          <Text style={styles.seasonalMessage}>{seasonalRecs.message}</Text>
          <View style={styles.seasonalVitamins}>
            {seasonalRecs.priority.slice(0, 3).map((vitaminId) => {
              const vitamin = VITAMIN_EDUCATION_CARDS.find(v => v.id === vitaminId);
              return vitamin ? (
                <TouchableOpacity
                  key={vitaminId}
                  style={[styles.seasonalVitaminChip, { backgroundColor: vitamin.color }]}
                  onPress={() => handleCardPress(vitamin)}
                >
                  <Text style={styles.seasonalVitaminIcon}>{vitamin.icon}</Text>
                  <Text style={styles.seasonalVitaminName}>{vitamin.name}</Text>
                </TouchableOpacity>
              ) : null;
            })}
          </View>
        </View>

        {/* Vitamin Education Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Vitamin Education</Text>
            <VitaminCapsule size={24} style={styles.sectionTitleIcon} />
          </View>
          <Text style={styles.sectionSubtitle}>
            Tap any card to learn more about essential nutrients
          </Text>
          
          <View style={styles.cardsGrid}>
            {VITAMIN_EDUCATION_CARDS.map((card, index) => renderVitaminCard(card, index))}
          </View>
          
          {/* Scroll Indicator */}
          <View style={styles.scrollIndicator}>
            <Text style={styles.scrollIndicatorText}>More content below</Text>
            <Text style={styles.scrollIndicatorArrow}>⬇️</Text>
          </View>
        </View>

        {/* Health Articles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Deep Dive Articles</Text>
          <Text style={styles.sectionSubtitle}>
            Tap the arrow to expand and read the full article
          </Text>

          <View style={styles.articlesContainer}>
            {weeklyArticles.map(renderArticleCard)}
          </View>
        </View>

      </ScrollView>

      {renderDetailModal()}
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  homeButtonIcon: {
    fontSize: 18,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Seasonal Recommendations Styles
  seasonalSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: colors.smartRemindersButton,
  },
  seasonalMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.smartRemindersButton,
    textAlign: 'center',
    marginBottom: 15,
  },
  seasonalVitamins: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  seasonalVitaminChip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 80,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  seasonalVitaminIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  seasonalVitaminName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  section: {
    marginBottom: 35,
  },
  sectionTitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionTitleIcon: {
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Vitamin Cards Styles
  cardsGrid: {
    gap: 15,
  },
  
  // Scroll Indicator Styles
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
    paddingVertical: 15,
  },
  scrollIndicatorText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  scrollIndicatorArrow: {
    fontSize: 18,
    color: colors.primary,
    opacity: 0.8,
  },
  vitaminCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: colors.healthButton,
    elevation: 5,
  },
  featuredBadge: {
    position: 'absolute',
    top: -8,
    right: 15,
    backgroundColor: colors.healthButton,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  cardBenefit: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.95,
    lineHeight: 22,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  cardArrow: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },

  // Articles Styles
  articlesContainer: {
    gap: 15,
  },
  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 18,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuredArticleCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  featuredArticleBadge: {
    position: 'absolute',
    top: -8,
    left: 15,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  articleHeader: {
    marginBottom: 10,
  },
  articleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  articleTitleContainer: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  articleReadTime: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  articleCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expandIcon: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  articleSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  articleContent: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
    marginTop: 10,
  },
  articleText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 15,
  },
  sourcesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourcesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sourceItem: {
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  sourceOrg: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  sourceTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sourceLink: {
    fontSize: 11,
    color: colors.smartRemindersButton,
    fontWeight: '500',
  },
  relatedSection: {
    marginTop: 15,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  relatedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedTag: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  relatedTagText: {
    fontSize: 12,
    color: colors.smartRemindersButton,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalCardHeader: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  modalCardIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  modalCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalSectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  topDisclaimer: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.smartRemindersButton,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 25,
    marginHorizontal: 5,
  },
  topDisclaimerText: {
    fontSize: 12,
    color: colors.smartRemindersButton,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});
}