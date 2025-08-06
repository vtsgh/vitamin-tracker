/**
 * Health Insights Feature Constants
 * Vitamin education cards and articles data
 */

export interface VitaminEducationCard {
  id: string;
  name: string;
  benefitSummary: string;
  funFact: string;
  naturalSources: string;
  recommendedTiming?: string;
  color: string;
  icon: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: 'vitamin' | 'wellness' | 'nutrition';
  summary: string;
  content: string;
  readTime: number; // in minutes
  relatedVitamins?: string[];
  icon: string;
}

// Vitamin Education Cards Data
export const VITAMIN_EDUCATION_CARDS: VitaminEducationCard[] = [
  {
    id: 'vitamin-d',
    name: 'Vitamin D',
    benefitSummary: 'Supports bone health, immune system, and mood regulation',
    funFact: 'Your skin produces vitamin D when exposed to sunlight - just 10-15 minutes daily can help!',
    naturalSources: 'Sunlight, salmon, egg yolks, fortified milk 🌞',
    recommendedTiming: 'Best absorbed with breakfast and healthy fats',
    color: '#FFD700',
    icon: '☀️'
  },
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    benefitSummary: 'Boosts energy, supports brain function, and helps form red blood cells',
    funFact: 'B12 is only found naturally in animal products - vegans need supplements!',
    naturalSources: 'Fish, meat, eggs, dairy products 🐟',
    recommendedTiming: 'Take in the morning to avoid interfering with sleep',
    color: '#FF6B6B',
    icon: '⚡'
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    benefitSummary: 'Powerful antioxidant that supports immune system and collagen production',
    funFact: 'Humans are one of the few animals that cannot produce their own vitamin C!',
    naturalSources: 'Citrus fruits, berries, bell peppers, broccoli 🍊',
    recommendedTiming: 'Can be taken multiple times per day with or without food',
    color: '#FF8C42',
    icon: '🍊'
  },
  {
    id: 'iron',
    name: 'Iron',
    benefitSummary: 'Essential for oxygen transport, energy production, and preventing fatigue',
    funFact: 'Iron deficiency is the most common nutrient deficiency worldwide, especially in women.',
    naturalSources: 'Red meat, spinach, lentils, dark chocolate 🥩',
    recommendedTiming: 'Best absorbed on empty stomach with vitamin C',
    color: '#8B4513',
    icon: '💪'
  },
  {
    id: 'calcium',
    name: 'Calcium',
    benefitSummary: 'Builds strong bones and teeth, supports muscle function and nerve signaling',
    funFact: '99% of your body\'s calcium is stored in your bones and teeth!',
    naturalSources: 'Dairy products, leafy greens, almonds, sardines 🥛',
    recommendedTiming: 'Take in the evening for better absorption and bone health',
    color: '#87CEEB',
    icon: '🦴'
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    benefitSummary: 'Supports sleep, muscle recovery, mood balance, and heart health',
    funFact: 'Up to 50% of people don\'t get enough magnesium through food alone.',
    naturalSources: 'Spinach, almonds, dark chocolate, avocados 🍫',
    recommendedTiming: 'Often best with food, in the evening for better sleep',
    color: '#9370DB',
    icon: '😴'
  },
  {
    id: 'zinc',
    name: 'Zinc',
    benefitSummary: 'Boosts immune system, supports wound healing, and helps with taste and smell',
    funFact: 'Zinc helps activate over 300 enzymes in your body!',
    naturalSources: 'Oysters, beef, pumpkin seeds, chickpeas 🦪',
    recommendedTiming: 'Take in the evening on empty stomach, 1 hour before bed',
    color: '#20B2AA',
    icon: '🛡️'
  },
  {
    id: 'omega-3',
    name: 'Omega-3',
    benefitSummary: 'Supports heart health, brain function, and reduces inflammation',
    funFact: 'Your brain is nearly 60% fat, much of it omega-3 fatty acids!',
    naturalSources: 'Fatty fish, walnuts, flaxseeds, chia seeds 🐠',
    recommendedTiming: 'Fat-soluble - take with meals for best absorption',
    color: '#4682B4',
    icon: '🧠'
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    benefitSummary: 'Comprehensive nutritional insurance covering multiple essential nutrients',
    funFact: 'A quality multivitamin can fill nutritional gaps even in healthy diets.',
    naturalSources: 'Variety of whole foods, fruits, and vegetables 🥗',
    recommendedTiming: 'Take with breakfast for optimal nutrient absorption',
    color: '#32CD32',
    icon: '🌟'
  }
];

// Health Articles for Deep Dives
export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'iron-women',
    title: 'Why Iron Matters More for Women',
    category: 'vitamin',
    summary: 'Women need nearly twice as much iron as men due to menstruation and pregnancy needs.',
    content: 'Iron deficiency affects 1 in 4 women globally, making it the most common nutritional deficiency. Women lose iron monthly through menstruation, and pregnancy doubles iron needs to support both mother and baby.\n\nSigns of iron deficiency include fatigue, pale skin, brittle nails, and unusual cravings for ice or starch. The good news? Iron-rich foods like lean red meat, spinach, and lentils can help, especially when paired with vitamin C for better absorption.\n\nTiming matters too - take iron supplements on an empty stomach when possible, and avoid coffee or tea within an hour of taking iron as they can block absorption.',
    readTime: 2,
    relatedVitamins: ['iron', 'vitamin-c'],
    icon: '👩'
  },
  {
    id: 'vitamin-d-mood',
    title: 'The Sunshine Vitamin and Your Mood',
    category: 'wellness',
    summary: 'Vitamin D deficiency is linked to depression, especially in darker months.',
    content: 'Often called the "sunshine vitamin," vitamin D does more than just support bone health - it plays a crucial role in mood regulation and mental well-being.\n\nResearch shows that people with low vitamin D levels are more likely to experience depression, particularly during winter months when sunlight exposure is limited. This connection exists because vitamin D receptors are found throughout the brain, including areas that regulate mood.\n\nIf you live in a northern climate, work indoors, or have darker skin (which requires more sun exposure to produce vitamin D), you might be at higher risk for deficiency. A simple blood test can check your levels, and supplementation combined with safe sun exposure can help maintain optimal mood and energy.',
    readTime: 2,
    relatedVitamins: ['vitamin-d'],
    icon: '🌞'
  },
  {
    id: 'timing-absorption',
    title: 'Vitamin Timing: When and Why It Matters',
    category: 'nutrition',
    summary: 'The time you take your vitamins can significantly impact how well your body absorbs them.',
    content: 'Not all vitamins are created equal when it comes to timing. Fat-soluble vitamins (A, D, E, K) need to be taken with meals containing healthy fats for optimal absorption, while water-soluble vitamins (B-complex, C) can be taken any time.\n\nSome vitamins can interfere with sleep if taken too late - B-complex vitamins are energizing and best taken in the morning, while magnesium promotes relaxation and is ideal for evening use.\n\nMineral absorption can be tricky too. Iron and calcium compete for absorption, so they shouldn\'t be taken together. Coffee and tea can block iron absorption, while vitamin C enhances it.\n\nThe key is understanding your vitamins\' unique needs and creating a schedule that maximizes their benefits while fitting your lifestyle.',
    readTime: 3,
    relatedVitamins: ['vitamin-d', 'iron', 'calcium', 'magnesium', 'vitamin-c'],
    icon: '⏰'
  }
];

// Categories for organizing content
export const INSIGHT_CATEGORIES = {
  VITAMINS: {
    id: 'vitamins',
    name: 'Vitamins & Minerals',
    description: 'Learn about essential nutrients',
    icon: '💊',
    color: '#FF7F50'
  },
  WELLNESS: {
    id: 'wellness',
    name: 'Wellness Tips',
    description: 'Health and lifestyle guidance',
    icon: '🌿',
    color: '#98FB98'
  },
  NUTRITION: {
    id: 'nutrition',
    name: 'Nutrition Science',
    description: 'Evidence-based nutrition info',
    icon: '🔬',
    color: '#87CEEB'
  }
} as const;

// Dynamic content rotation functions
export const getCardOfTheDay = (): string => {
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const cardIndex = dayOfYear % VITAMIN_EDUCATION_CARDS.length;
  return VITAMIN_EDUCATION_CARDS[cardIndex].id;
};

export const getArticleOfTheWeek = (): string => {
  const weekOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const articleIndex = weekOfYear % HEALTH_ARTICLES.length;
  return HEALTH_ARTICLES[articleIndex].id;
};

// Get seasonal recommendations based on current month
export const getSeasonalRecommendations = () => {
  const month = new Date().getMonth(); // 0-11
  
  // Winter months (Dec, Jan, Feb) - focus on immune support and mood
  if (month === 11 || month === 0 || month === 1) {
    return {
      priority: ['vitamin-d', 'vitamin-c', 'zinc'],
      theme: 'winter',
      message: '❄️ Winter Focus: Boost immunity and fight seasonal blues'
    };
  }
  
  // Spring months (Mar, Apr, May) - renewal and energy
  if (month >= 2 && month <= 4) {
    return {
      priority: ['vitamin-b12', 'iron', 'multivitamin'],
      theme: 'spring',
      message: '🌱 Spring Renewal: Energize your body for new beginnings'
    };
  }
  
  // Summer months (Jun, Jul, Aug) - active lifestyle support
  if (month >= 5 && month <= 7) {
    return {
      priority: ['magnesium', 'omega-3', 'vitamin-c'],
      theme: 'summer',
      message: '☀️ Summer Vitality: Support your active lifestyle'
    };
  }
  
  // Fall months (Sep, Oct, Nov) - preparation and immunity
  return {
    priority: ['vitamin-d', 'zinc', 'multivitamin'],
    theme: 'fall',
    message: '🍂 Fall Preparation: Strengthen your defenses'
  };
};

// Featured content using dynamic rotation
export const FEATURED_CONTENT = {
  get CARD_OF_THE_DAY() {
    return getCardOfTheDay();
  },
  get ARTICLE_OF_THE_WEEK() {
    return getArticleOfTheWeek();
  },
  get SEASONAL_RECOMMENDATIONS() {
    return getSeasonalRecommendations();
  }
} as const;