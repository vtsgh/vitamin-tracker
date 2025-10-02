/**
 * Health Insights Feature Constants
 * Vitamin education cards and articles data - ALL WITH CREDIBLE SOURCES
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
  sources: Array<{
    title: string;
    url: string;
    organization: string;
  }>;
}

// Vitamin Education Cards Data (keeping existing cards)
export const VITAMIN_EDUCATION_CARDS: VitaminEducationCard[] = [
  {
    id: 'vitamin-d',
    name: 'Vitamin D',
    benefitSummary: 'Supports bone health, immune system, and mood regulation',
    funFact: 'Your skin produces vitamin D when exposed to sunlight - just 10-15 minutes daily can help!',
    naturalSources: 'Sunlight, salmon, egg yolks, fortified milk',
    recommendedTiming: 'Best absorbed with breakfast and healthy fats',
    color: '#FFD700',
    icon: '☀️'
  },
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    benefitSummary: 'Boosts energy, supports brain function, and helps form red blood cells',
    funFact: 'B12 is only found naturally in animal products - vegans need supplements!',
    naturalSources: 'Fish, meat, eggs, dairy products',
    recommendedTiming: 'Take in the morning to avoid interfering with sleep',
    color: '#FF6B6B',
    icon: '⚡'
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    benefitSummary: 'Powerful antioxidant that supports immune health and collagen production',
    funFact: 'Humans are one of the few mammals that cannot make their own vitamin C!',
    naturalSources: 'Citrus fruits, berries, bell peppers, broccoli',
    recommendedTiming: 'Can be taken anytime, but may be energizing for some',
    color: '#FFA500',
    icon: '🍊'
  },
  {
    id: 'iron',
    name: 'Iron',
    benefitSummary: 'Essential for oxygen transport in blood and energy production',
    funFact: 'Your body recycles about 90% of its iron from old red blood cells!',
    naturalSources: 'Red meat, spinach, lentils, fortified cereals',
    recommendedTiming: 'Best absorbed on an empty stomach, avoid with calcium',
    color: '#8B4513',
    icon: '💪'
  },
  {
    id: 'calcium',
    name: 'Calcium',
    benefitSummary: 'Builds strong bones and teeth, supports muscle and nerve function',
    funFact: '99% of your body calcium is stored in bones and teeth!',
    naturalSources: 'Dairy products, leafy greens, fortified foods',
    recommendedTiming: 'Best taken in divided doses with food',
    color: '#E8E8E8',
    icon: '🦴'
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    benefitSummary: 'Supports muscle relaxation, sleep quality, and stress management',
    funFact: 'Magnesium is involved in over 300 enzyme reactions in your body!',
    naturalSources: 'Nuts, seeds, whole grains, leafy vegetables',
    recommendedTiming: 'Evening is ideal for relaxation and sleep benefits',
    color: '#90EE90',
    icon: '✨'
  },
  {
    id: 'omega-3',
    name: 'Omega-3',
    benefitSummary: 'Supports heart health, brain function, and reduces inflammation',
    funFact: 'Your brain is about 60% fat, and omega-3s are a key component!',
    naturalSources: 'Fatty fish, walnuts, flaxseeds, chia seeds',
    recommendedTiming: 'Take with meals for better absorption',
    color: '#4682B4',
    icon: '🐟'
  },
  {
    id: 'zinc',
    name: 'Zinc',
    benefitSummary: 'Supports immune function, wound healing, and protein synthesis',
    funFact: 'Zinc is essential for your sense of taste and smell!',
    naturalSources: 'Oysters, beef, pumpkin seeds, chickpeas',
    recommendedTiming: 'Best with food to avoid stomach upset',
    color: '#C0C0C0',
    icon: '🛡️'
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    benefitSummary: 'Comprehensive nutrient coverage for overall health maintenance',
    funFact: 'Multivitamins can help fill nutritional gaps in modern diets!',
    naturalSources: 'Variety of whole foods, fruits, and vegetables',
    recommendedTiming: 'Take with breakfast for optimal nutrient absorption',
    color: '#32CD32',
    icon: '🌟'
  }
];

// Health Articles for Deep Dives - ALL PROPERLY SOURCED
// DISCLAIMER: All content is for educational purposes only and not medical advice.
// Always consult healthcare professionals before making supplement decisions.
export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'vitamin-d-overview',
    title: 'Understanding Vitamin D: The Sunshine Vitamin',
    category: 'vitamin',
    summary: 'Learn about vitamin D\'s role in bone health, immune function, and how sunlight helps your body produce it.',
    content: 'Vitamin D is unique among vitamins because your body can produce it when your skin is exposed to sunlight. It plays essential roles in calcium absorption, bone health, and immune system function.\n\nResearch shows that vitamin D deficiency is common, especially in people who live in northern latitudes, spend most of their time indoors, or have darker skin tones. While your body can make vitamin D from sunlight, factors like sunscreen use, season, and time of day affect production.\n\nFood sources of vitamin D include fatty fish (like salmon and mackerel), egg yolks, and fortified foods such as milk and cereals. Many people may benefit from vitamin D supplementation, particularly during winter months.\n\nBlood tests can measure your vitamin D levels to help determine if supplementation might be appropriate for you.',
    readTime: 3,
    relatedVitamins: ['vitamin-d', 'calcium'],
    icon: '☀️',
    sources: [
      {
        title: 'Vitamin D Fact Sheet for Health Professionals',
        url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Vitamin D',
        url: 'https://www.mayoclinic.org/drugs-supplements-vitamin-d/art-20363792',
        organization: 'Mayo Clinic'
      }
    ]
  },
  {
    id: 'vitamin-b12-basics',
    title: 'Vitamin B12: Energy and Brain Health',
    category: 'vitamin',
    summary: 'Discover why B12 is essential for energy, nerve function, and who is at risk for deficiency.',
    content: 'Vitamin B12 (cobalamin) is a water-soluble vitamin that plays crucial roles in red blood cell formation, DNA synthesis, and neurological function. It\'s naturally found only in animal products, making vegetarians and vegans particularly vulnerable to deficiency.\n\nAs people age, their ability to absorb B12 from food decreases due to reduced stomach acid production. This is why B12 deficiency is more common in older adults, even if they consume adequate amounts through diet.\n\nSymptoms of B12 deficiency can include fatigue, weakness, memory problems, and tingling in hands and feet. Because B12 is stored in the liver, deficiency symptoms may not appear for several years.\n\nB12 supplements are available in several forms, with methylcobalamin and cyanocobalamin being the most common. Both are effective, though some people prefer methylcobalamin as it\'s the active form used by the body.',
    readTime: 3,
    relatedVitamins: ['vitamin-b12'],
    icon: '⚡',
    sources: [
      {
        title: 'Vitamin B12 Fact Sheet for Health Professionals',
        url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Vitamin B-12',
        url: 'https://www.mayoclinic.org/drugs-supplements-vitamin-b12/art-20363663',
        organization: 'Mayo Clinic'
      }
    ]
  },
  {
    id: 'iron-absorption',
    title: 'Iron Absorption: What Helps and What Hinders',
    category: 'nutrition',
    summary: 'Learn how to maximize iron absorption and avoid common mistakes that reduce effectiveness.',
    content: 'Iron is an essential mineral that your body needs to make hemoglobin, a protein in red blood cells that carries oxygen throughout your body. However, iron absorption can be tricky and is affected by various dietary factors.\n\nThere are two types of iron in food: heme iron (from animal sources) and non-heme iron (from plant sources). Heme iron is absorbed more efficiently, at a rate of 15-35%, while non-heme iron absorption is only 2-20%.\n\nVitamin C significantly enhances non-heme iron absorption. Taking iron supplements with orange juice or eating vitamin C-rich foods with iron-rich meals can increase absorption by up to 300%.\n\nConversely, calcium, tannins in tea and coffee, and phytates in whole grains can inhibit iron absorption. It\'s best to avoid these within 1-2 hours of taking iron supplements.\n\nTaking iron on an empty stomach maximizes absorption but may cause stomach upset in some people. If this occurs, taking it with a small amount of food is acceptable.',
    readTime: 3,
    relatedVitamins: ['iron', 'vitamin-c', 'calcium'],
    icon: '💪',
    sources: [
      {
        title: 'Iron Fact Sheet for Health Professionals',
        url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Iron and iron deficiency',
        url: 'https://www.health.harvard.edu/staying-healthy/iron-and-iron-deficiency',
        organization: 'Harvard Health Publishing'
      }
    ]
  },
  {
    id: 'omega-3-benefits',
    title: 'Omega-3 Fatty Acids: Brain and Heart Health',
    category: 'wellness',
    summary: 'Understand the different types of omega-3s and their benefits for cardiovascular and cognitive health.',
    content: 'Omega-3 fatty acids are essential fats that your body cannot produce on its own, meaning they must come from your diet. The three main types are ALA (alpha-linolenic acid), EPA (eicosapentaenoic acid), and DHA (docosahexaenoic acid).\n\nALA is found primarily in plant sources like flaxseeds, chia seeds, and walnuts. EPA and DHA are found in fatty fish like salmon, mackerel, and sardines. While your body can convert some ALA to EPA and DHA, the conversion rate is low (less than 15%).\n\nResearch has shown that omega-3s, particularly EPA and DHA, support heart health by helping to reduce triglycerides, lower blood pressure slightly, and reduce inflammation. They also play crucial roles in brain function and development.\n\nFor people who don\'t regularly eat fatty fish, fish oil supplements or algae-based omega-3 supplements (for vegetarians and vegans) can help meet recommended intakes. Look for supplements that have been tested for purity and are free from contaminants like mercury.',
    readTime: 3,
    relatedVitamins: ['omega-3'],
    icon: '🐟',
    sources: [
      {
        title: 'Omega-3 Fatty Acids Fact Sheet for Health Professionals',
        url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Omega-3 in fish: How eating fish helps your heart',
        url: 'https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/omega-3/art-20045614',
        organization: 'Mayo Clinic'
      }
    ]
  },
  {
    id: 'magnesium-sleep',
    title: 'Magnesium for Better Sleep and Relaxation',
    category: 'wellness',
    summary: 'Explore how magnesium supports sleep quality, muscle relaxation, and stress management.',
    content: 'Magnesium is involved in over 300 biochemical reactions in your body, including those that regulate sleep and relaxation. It helps activate the parasympathetic nervous system, which is responsible for helping you feel calm and relaxed.\n\nResearch suggests that magnesium plays a role in supporting deep, restorative sleep by maintaining healthy levels of GABA, a neurotransmitter that promotes sleep. Some studies have found that magnesium supplementation may help people fall asleep faster and experience better sleep quality.\n\nMagnesium also helps relax muscles and may reduce nighttime muscle cramps and restless leg syndrome. This mineral works by regulating neurotransmitters and blocking the action of more stimulating molecules.\n\nDifferent forms of magnesium have different absorption rates and effects. Magnesium glycinate is often recommended for sleep support due to its calming properties and high bioavailability. Magnesium citrate is well-absorbed but may have a laxative effect at higher doses.\n\nGood food sources include nuts, seeds, whole grains, and leafy green vegetables. However, many people don\'t get enough magnesium from diet alone.',
    readTime: 3,
    relatedVitamins: ['magnesium', 'calcium'],
    icon: '✨',
    sources: [
      {
        title: 'Magnesium Fact Sheet for Health Professionals',
        url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Magnesium',
        url: 'https://www.hsph.harvard.edu/nutritionsource/magnesium/',
        organization: 'Harvard T.H. Chan School of Public Health'
      }
    ]
  },
  {
    id: 'supplement-quality',
    title: 'How to Choose Quality Supplements',
    category: 'nutrition',
    summary: 'Learn what to look for when selecting supplements, including third-party testing and quality certifications.',
    content: 'Not all supplements are created equal. The supplement industry is less regulated than pharmaceuticals, so it\'s important to know what to look for when choosing products.\n\nThird-party testing organizations like USP (United States Pharmacopeia), NSF International, and ConsumerLab independently verify that supplements contain what they claim and are free from harmful contaminants. Look for their seals on product labels.\n\nThe Supplement Facts panel tells you exactly what\'s in each serving. Check for the form of nutrients (some forms are better absorbed than others), serving sizes, and daily value percentages. Be wary of proprietary blends that don\'t disclose individual ingredient amounts.\n\nAvoid supplements making exaggerated claims. Terms like "cure," "treat," or "diagnose" are red flags, as dietary supplements cannot legally make these claims. Similarly, be skeptical of terms like "pharmaceutical grade" or "clinically proven" without supporting evidence.\n\nExpiration dates matter - supplements lose potency over time. Store them properly in a cool, dry place away from direct sunlight. The bathroom medicine cabinet is actually a poor choice due to heat and humidity.\n\nWhen in doubt, consult with a healthcare provider or registered dietitian who can help you choose appropriate supplements based on your individual needs.',
    readTime: 3,
    relatedVitamins: ['multivitamin'],
    icon: '🔍',
    sources: [
      {
        title: 'Dietary Supplements: What You Need to Know',
        url: 'https://ods.od.nih.gov/HealthInformation/DS_WhatYouNeedToKnow.aspx',
        organization: 'National Institutes of Health (NIH)'
      },
      {
        title: 'Dietary supplements: Do they help or hurt?',
        url: 'https://www.health.harvard.edu/staying-healthy/dietary-supplements-do-they-help-or-hurt',
        organization: 'Harvard Health Publishing'
      },
      {
        title: 'Tips for Dietary Supplement Users',
        url: 'https://www.fda.gov/food/buy-store-serve-safe-food/tips-dietary-supplement-users',
        organization: 'U.S. Food & Drug Administration'
      }
    ]
  }
];

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

// Get 3 rotating articles for the current week, including the article of the week
export function getWeeklyArticles(): HealthArticle[] {
  const weekOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const featuredArticleId = getArticleOfTheWeek();

  // Find the featured article
  const featuredArticle = HEALTH_ARTICLES.find(article => article.id === featuredArticleId);
  if (!featuredArticle) return HEALTH_ARTICLES.slice(0, 3);

  // Get 2 additional articles using a different rotation pattern
  const otherArticles = HEALTH_ARTICLES.filter(article => article.id !== featuredArticleId);
  const startIndex = (weekOfYear * 2) % otherArticles.length;

  const additionalArticles = [
    otherArticles[startIndex % otherArticles.length],
    otherArticles[(startIndex + 1) % otherArticles.length]
  ];

  // Return featured article first, then the 2 additional ones
  return [featuredArticle, ...additionalArticles];
}

// Categories for organizing content
export const INSIGHT_CATEGORIES = {
  VITAMIN: {
    id: 'vitamin',
    name: 'Vitamin Information',
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
    description: 'Understanding how nutrients work',
    icon: '🔬',
    color: '#87CEEB'
  },
} as const;

// Seasonal vitamin recommendations based on month
export function getSeasonalRecommendations() {
  const month = new Date().getMonth(); // 0-11

  // Winter (Dec, Jan, Feb): months 11, 0, 1
  if (month === 11 || month === 0 || month === 1) {
    return {
      season: 'winter',
      message: 'Winter months mean less sunlight - consider vitamin D supplementation!',
      priority: ['vitamin-d', 'vitamin-c', 'zinc']
    };
  }

  // Spring (Mar, Apr, May): months 2, 3, 4
  if (month >= 2 && month <= 4) {
    return {
      season: 'spring',
      message: 'Spring is a great time to renew your health routine!',
      priority: ['vitamin-d', 'vitamin-b12', 'omega-3']
    };
  }

  // Summer (Jun, Jul, Aug): months 5, 6, 7
  if (month >= 5 && month <= 7) {
    return {
      season: 'summer',
      message: 'Get your vitamin D from safe sun exposure, but do not skip other essentials!',
      priority: ['vitamin-c', 'iron', 'magnesium']
    };
  }

  // Fall (Sep, Oct, Nov): months 8, 9, 10
  return {
    season: 'fall',
    message: 'Prepare for winter by building up your vitamin D stores!',
    priority: ['vitamin-d', 'vitamin-c', 'omega-3']
  };
}

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
