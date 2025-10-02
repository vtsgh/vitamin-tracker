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
  sources?: Array<{
    title: string;
    url: string;
    organization: string;
  }>;
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
// DISCLAIMER: All content is for educational purposes only and not medical advice.
// Always consult healthcare professionals before making supplement decisions.
// All articles include source citations from credible medical and research organizations.
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
  },

  // Foundational Knowledge Articles
  {
    id: 'vitamin-myths',
    title: 'Vitamin Myths Debunked',
    category: 'wellness',
    summary: 'Separating fact from fiction in the world of supplements and nutrition.',
    content: 'The supplement world is full of misconceptions that can waste your money or even harm your health. Let\'s bust some of the biggest myths:\n\nMyth 1: "More is always better" - Fat-soluble vitamins (A, D, E, K) can accumulate to toxic levels. Stick to recommended doses unless advised otherwise by a healthcare provider.\n\nMyth 2: "Natural vitamins are always superior" - Your body can\'t tell the difference between synthetic and natural vitamin C. What matters is bioavailability and quality, not source.\n\nMyth 3: "Expensive means effective" - Many affordable generic vitamins contain the same active ingredients as premium brands. Check the label, not the price tag.\n\nMyth 4: "You can\'t overdose on vitamins" - Water-soluble vitamins like B6 can cause nerve damage at extremely high doses. Even "safe" vitamins have limits.\n\nThe truth? A balanced approach with quality supplements at appropriate doses will serve you better than any marketing claim.',
    readTime: 2,
    relatedVitamins: ['vitamin-d', 'vitamin-c', 'vitamin-b12'],
    icon: '🚫'
  },
  {
    id: 'deficiency-signs',
    title: 'Signs You Might Be Deficient',
    category: 'wellness',
    summary: 'Learn to recognize the subtle warning signs your body gives when lacking essential nutrients.',
    content: 'Your body has clever ways of signaling nutrient deficiencies long before serious problems develop. Here are key signs to watch for:\n\n**Fatigue and weakness** could indicate iron, B12, or vitamin D deficiency. If you\'re getting enough sleep but still feel tired, consider getting blood work done.\n\n**Brittle or ridged nails** often point to iron, biotin, or zinc deficiency. Healthy nails should be smooth and strong.\n\n**Frequent colds or slow healing** might suggest low vitamin C, zinc, or vitamin D. Your immune system needs these nutrients to function optimally.\n\n**Muscle cramps or twitches** can indicate magnesium, potassium, or calcium deficiency, especially if they occur regularly.\n\n**Mood changes** like depression or anxiety may be linked to B vitamins, vitamin D, or omega-3 deficiencies.\n\nRemember: These signs can have many causes. Blood tests are the gold standard for diagnosing deficiencies, so consult with a healthcare provider if you notice persistent symptoms.',
    readTime: 2,
    relatedVitamins: ['iron', 'vitamin-b12', 'vitamin-d', 'zinc', 'magnesium'],
    icon: '🔍'
  },
  {
    id: 'supplements-vs-food',
    title: 'Supplements vs. Food: What\'s Better?',
    category: 'nutrition',
    summary: 'Understanding when to choose whole foods over pills and vice versa.',
    content: 'The age-old question: should you get nutrients from food or supplements? The answer isn\'t black and white.\n\n**Food wins for:** Complex nutrients that work together (like the vitamin C in oranges comes with fiber and bioflavonoids), better absorption in most cases, and additional benefits like fiber and antioxidants you can\'t get from pills.\n\n**Supplements win for:** Hard-to-get nutrients (like B12 for vegans), specific deficiencies, convenience for busy lifestyles, and precise dosing when you need therapeutic amounts.\n\n**The hybrid approach works best:** Use food as your foundation - colorful fruits and vegetables, whole grains, lean proteins, and healthy fats. Then supplement strategically for gaps in your diet or specific needs.\n\n**Examples of smart supplementation:** Vitamin D if you live in a northern climate, B12 if you\'re vegetarian, iron if you\'re a woman with heavy periods, or omega-3s if you don\'t eat fish regularly.\n\nThe goal isn\'t perfection - it\'s finding a sustainable approach that fits your lifestyle while covering your nutritional bases.',
    readTime: 3,
    relatedVitamins: ['vitamin-c', 'vitamin-b12', 'vitamin-d', 'iron', 'omega-3'],
    icon: '⚖️'
  },

  // Practical Guidance Articles
  {
    id: 'vitamins-interactions',
    title: 'Vitamins That Don\'t Mix',
    category: 'nutrition',
    summary: 'Understanding vitamin and mineral interactions to avoid competition and maximize absorption.',
    content: 'Not all vitamins play nicely together. Some compete for absorption, while others can enhance or block each other\'s effectiveness.\\n\\n**Avoid taking together:** Iron and calcium are the biggest culprits - they compete for the same absorption pathways. Take iron in the morning and calcium in the evening for best results.\\n\\n**Zinc and copper** also compete, which is why many zinc supplements include a small amount of copper to maintain balance.\\n\\n**Coffee and tea** contain tannins that can block iron absorption by up to 60%. Wait at least one hour after taking iron before having your morning coffee.\\n\\n**Take together for better absorption:** Vitamin D helps your body absorb calcium, making this a perfect pairing. Fat-soluble vitamins (A, D, E, K) should be taken with healthy fats for optimal absorption.\\n\\n**Vitamin C enhances iron absorption** significantly - that\'s why many iron supplements include it, or you can take them with orange juice.\\n\\n**Pro tip:** If you take multiple supplements, consider splitting them between morning and evening doses to minimize interactions.',
    readTime: 2,
    relatedVitamins: ['iron', 'calcium', 'zinc', 'vitamin-d', 'vitamin-c'],
    icon: '⚠️'
  },
  {
    id: 'supplement-storage',
    title: 'Storage & Expiration: Making Vitamins Last',
    category: 'nutrition',
    summary: 'Proper storage techniques to maintain vitamin potency and recognize when supplements have gone bad.',
    content: 'Improper storage can destroy vitamin potency long before the expiration date. Here\'s how to keep your supplements effective:\\n\\n**Heat and light are vitamin killers.** Store supplements in a cool, dry place away from direct sunlight. The bathroom medicine cabinet is actually one of the worst places due to heat and humidity from showers.\\n\\n**Moisture accelerates breakdown,** especially for vitamin C and B vitamins. Keep bottles tightly sealed and consider using desiccant packets if you live in a humid climate.\\n\\n**Refrigeration helps some vitamins last longer,** particularly probiotics, fish oil, and liquid vitamins. But keep them in the main compartment, not the door where temperature fluctuates.\\n\\n**Signs your vitamins have gone bad:** Unusual smell (especially fishy odor from fish oil), color changes, pills sticking together, or cracked/crumbling tablets. When in doubt, throw them out.\\n\\n**Expiration dates matter more for some vitamins.** Fat-soluble vitamins (A, D, E, K) can actually become harmful past expiration, while water-soluble vitamins just become less effective.\\n\\n**Buy appropriate quantities** - large bottles might seem economical, but if vitamins expire before you finish them, you\'re wasting money.',
    readTime: 3,
    relatedVitamins: ['vitamin-c', 'vitamin-d', 'omega-3'],
    icon: '📦'
  },
  {
    id: 'reading-labels',
    title: 'Reading Supplement Labels Like a Pro',
    category: 'nutrition',
    summary: 'Decode supplement labels to choose quality products and avoid marketing tricks.',
    content: 'Supplement labels can be confusing, but knowing what to look for helps you choose quality products and avoid wasting money on marketing hype.\\n\\n**Start with the Supplement Facts panel,** not the front marketing claims. This tells you exactly what is inside and in what amounts.\\n\\n**Look for the active form of nutrients.** For example, methylcobalamin is better absorbed than cyanocobalamin for B12. Chelated minerals like magnesium glycinate are generally better absorbed than basic forms like magnesium oxide.\\n\\n**Check serving sizes carefully.** Some companies use tiny serving sizes to make their products look more affordable, but you will need multiple pills to get the stated benefits.\\n\\n**Third-party testing seals** like USP, NSF, or ConsumerLab indicate the product has been independently verified for purity and potency.\\n\\n**Avoid proprietary blends** where exact amounts are not listed. You have no way to know if you are getting effective doses of each ingredient.\\n\\n**Watch for marketing red flags:** Claims like pharmaceutical grade (meaningless), all natural (not necessarily better), or clinically proven (often based on weak studies).\\n\\n**The ingredient list matters too** - avoid unnecessary fillers, artificial colors, or potential allergens that do not add value.',
    readTime: 3,
    relatedVitamins: ['vitamin-b12', 'magnesium'],
    icon: '🔍'
  },
  {
    id: 'budget-vitamins',
    title: 'Budget-Friendly Vitamin Strategies',
    category: 'wellness',
    summary: 'Smart ways to maintain good nutrition without breaking the bank.',
    content: 'Good nutrition does not have to be expensive. Here are proven strategies to get essential nutrients while staying within budget:\\n\\n**Prioritize the basics first.** Instead of exotic superfood supplements, focus on covering true deficiencies. A basic vitamin D, B12, and magnesium combo covers the most common gaps for most people.\\n\\n**Generic brands often contain identical ingredients** to name brands at a fraction of the cost. Check the active ingredients and amounts - they are often made in the same facilities.\\n\\n**Buy in bulk when appropriate.** Larger bottles usually offer better per-dose pricing, but only if you will use them before expiration.\\n\\n**Food sources beat supplements when possible.** A can of sardines provides more omega-3s than most fish oil capsules, and costs less. Sunlight exposure for vitamin D is free.\\n\\n**Look for combination supplements** that make sense. A quality multivitamin can be more economical than buying individual vitamins, especially for basic coverage.\\n\\n**Time your purchases around sales** and use apps that track price history. Many retailers have predictable sale cycles.\\n\\n**Consider splitting higher-dose supplements** if your needs are lower. One 5000 IU vitamin D pill every other day might be perfect for maintenance.\\n\\n**Do not fall for marketing premium pricing** - pharmaceutical grade or fancy packaging does not make vitamins more effective.',
    readTime: 3,
    relatedVitamins: ['vitamin-d', 'vitamin-b12', 'magnesium', 'omega-3', 'multivitamin'],
    icon: '💰'
  },

  // Life Stage & Lifestyle Articles
  {
    id: 'vitamins-athletes',
    title: 'Vitamins for Active Lifestyles',
    category: 'wellness',
    summary: 'How exercise affects nutrient needs and which supplements can support athletic performance.',
    content: 'Regular exercise places unique demands on your body, potentially increasing your need for certain nutrients while helping with others.\\n\\n**Increased needs:** Athletes often need more B vitamins for energy metabolism, vitamin C for recovery and immune support, and vitamin D for bone health and muscle function. Iron needs may increase due to losses through sweat and increased red blood cell production.\\n\\n**Magnesium becomes crucial** for muscle function and recovery. Many athletes are deficient without knowing it, leading to cramps, fatigue, and poor recovery.\\n\\n**Timing matters for performance:** B vitamins taken in the morning can support energy throughout training. Post-workout is ideal for vitamin C and magnesium to support recovery.\\n\\n**Do not overdo it:** More is not always better. Mega-doses of antioxidants might actually blunt training adaptations. Focus on meeting increased needs, not exceeding them.\\n\\n**Food first approach:** Most nutrients can come from a well-planned diet with extra calories. Think nutrient-dense foods like leafy greens, lean meats, and colorful fruits.\\n\\n**Consider testing:** If you train intensely, periodic blood tests can identify specific deficiencies that might be limiting your performance or recovery.',
    readTime: 2,
    relatedVitamins: ['vitamin-b12', 'vitamin-c', 'vitamin-d', 'iron', 'magnesium'],
    icon: '🏃'
  },
  {
    id: 'vitamins-pregnancy',
    title: 'Prenatal Nutrition Beyond Folate',
    category: 'wellness',
    summary: 'Essential nutrients for pregnancy and breastfeeding that go beyond basic prenatal vitamins.',
    content: 'While folate gets most of the attention in prenatal nutrition, several other nutrients are crucial for both mom and baby health.\\n\\n**Iron needs nearly double** during pregnancy to support increased blood volume and baby development. Many women start pregnancy with low iron stores, making supplementation essential.\\n\\n**Vitamin D deficiency in pregnancy** is linked to complications like preeclampsia and low birth weight. Most prenatal vitamins contain inadequate amounts - you may need additional supplementation.\\n\\n**Omega-3s support brain development** in the baby and may reduce postpartum depression risk. Look for prenatal DHA supplements if you do not eat fish regularly.\\n\\n**Choline is often overlooked** but crucial for brain development. Most prenatal vitamins do not contain enough - eggs and meat are good food sources.\\n\\n**Magnesium helps with common pregnancy issues** like leg cramps, constipation, and sleep problems. It is generally safe and beneficial.\\n\\n**Continue key nutrients while breastfeeding:** Your nutritional needs remain elevated, particularly for vitamin D, omega-3s, and B vitamins.\\n\\n**Always consult your healthcare provider** before adding supplements during pregnancy. Individual needs vary, and some nutrients can be harmful in excess.',
    readTime: 3,
    relatedVitamins: ['iron', 'vitamin-d', 'omega-3'],
    icon: '🤱'
  },
  {
    id: 'vitamins-aging',
    title: 'Nutritional Needs as We Age',
    category: 'wellness',
    summary: 'How vitamin requirements change with age and strategies for healthy aging.',
    content: 'As we age, our bodies become less efficient at absorbing and using certain nutrients, while our needs for others may increase.\\n\\n**B12 absorption declines** significantly after age 50 due to decreased stomach acid production. This is why many seniors develop B12 deficiency despite adequate dietary intake.\\n\\n**Vitamin D becomes more important** as skin becomes less efficient at producing it from sunlight, and bones become more fragile. Many seniors need higher doses than younger adults.\\n\\n**Calcium absorption decreases,** especially in post-menopausal women due to estrogen changes. But do not just take calcium - magnesium, vitamin D, and vitamin K2 are needed for proper bone health.\\n\\n**Antioxidants gain importance** as cellular damage accumulates over time. Vitamins C and E, along with nutrients like lutein for eye health, become more crucial.\\n\\n**Medication interactions increase** with age as prescription drug use rises. Some medications deplete specific nutrients or interfere with absorption.\\n\\n**Appetite and digestion changes** can make it harder to get nutrients from food alone. Well-chosen supplements can help bridge gaps.\\n\\n**Quality over quantity:** Focus on bioavailable forms and avoid mega-doses. Senior-specific formulations often provide appropriate amounts in easily absorbed forms.',
    readTime: 3,
    relatedVitamins: ['vitamin-b12', 'vitamin-d', 'calcium', 'vitamin-c'],
    icon: '👴'
  },

  // Seasonal & Special Topics Articles
  {
    id: 'winter-immunity',
    title: 'Winter Immune Support Strategy',
    category: 'wellness',
    summary: 'Evidence-based approaches to staying healthy during cold and flu season.',
    content: 'Winter brings unique challenges to our immune system, but the right nutritional strategy can help keep you healthier during the colder months.\\n\\n**Vitamin D deficiency peaks in winter** when sunlight exposure drops. Low vitamin D is strongly linked to increased respiratory infections. Most people need 1000-2000 IU daily during winter months.\\n\\n**Zinc becomes more important** as it is crucial for immune cell function. At the first sign of illness, zinc lozenges can reduce duration and severity of colds when taken within 24 hours.\\n\\n**Vitamin C will not prevent colds** in most people, but it can reduce severity and duration. For athletes and people under extreme stress, it may help prevent illness.\\n\\n**Do not forget the basics:** Sleep, stress management, and hand hygiene matter more than any supplement. Vitamins support a healthy lifestyle - they do not replace it.\\n\\n**Elderberry and echinacea** have some research support for reducing cold duration, but evidence is mixed. They are generally safe if you want to try them.\\n\\n**Timing matters:** Start immune support before you get sick, not after. Consistent daily intake of key nutrients works better than massive doses when you are already ill.\\n\\n**Food sources count:** Colorful fruits and vegetables, lean proteins, and fermented foods provide immune-supporting nutrients plus beneficial compounds you cannot get from pills.',
    readTime: 3,
    relatedVitamins: ['vitamin-d', 'zinc', 'vitamin-c'],
    icon: '❄️'
  },
  {
    id: 'supplement-schedule',
    title: 'Creating Your Personal Vitamin Schedule',
    category: 'nutrition',
    summary: 'How to design an optimal daily supplement routine that fits your lifestyle and maximizes benefits.',
    content: 'A well-planned supplement schedule can dramatically improve absorption and effectiveness while making your routine sustainable.\\n\\n**Start with your natural rhythms.** Take energizing vitamins like B-complex in the morning, and relaxing ones like magnesium in the evening. This works with your body natural cycles.\\n\\n**Spread out competing nutrients:** Take iron and calcium at different times (at least 2 hours apart) since they compete for absorption. Similarly, separate zinc from calcium and iron.\\n\\n**Pair smart combinations:** Fat-soluble vitamins (A, D, E, K) with meals containing healthy fats. Vitamin C with iron to boost absorption. Magnesium with calcium for better utilization.\\n\\n**Consider your meals:** Some vitamins are better absorbed with food (most fat-soluble vitamins), while others work better on an empty stomach (iron, zinc). Plan accordingly.\\n\\n**Build sustainable habits:** Link supplements to existing routines like brushing teeth or having coffee. Use pill organizers to make it easier and track compliance.\\n\\n**Weekly prep saves time:** Set up a weekly pill organizer on Sundays. This makes it easy to see if you have taken everything and prevents decision fatigue.\\n\\n**Adjust for your lifestyle:** Shift workers, frequent travelers, and people with irregular schedules need flexible strategies. Focus on consistency over perfect timing.\\n\\n**Track and adjust:** Notice how you feel and consider periodic blood tests to ensure your routine is working.',
    readTime: 3,
    relatedVitamins: ['vitamin-d', 'iron', 'calcium', 'magnesium', 'vitamin-c'],
    icon: '📅'
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

// Get 3 rotating articles for the current week, including the article of the week
export const getWeeklyArticles = (): HealthArticle[] => {
  const weekOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const featuredArticleId = getArticleOfTheWeek();

  // Find the featured article
  const featuredArticle = HEALTH_ARTICLES.find(article => article.id === featuredArticleId);
  if (!featuredArticle) return HEALTH_ARTICLES.slice(0, 3);

  // Get 2 additional articles using a different rotation pattern
  // This ensures variety while keeping the featured article
  const otherArticles = HEALTH_ARTICLES.filter(article => article.id !== featuredArticleId);
  const startIndex = (weekOfYear * 2) % otherArticles.length;

  const additionalArticles = [
    otherArticles[startIndex % otherArticles.length],
    otherArticles[(startIndex + 1) % otherArticles.length]
  ];

  // Return featured article first, then the 2 additional ones
  return [featuredArticle, ...additionalArticles];
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