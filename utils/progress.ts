import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckIn, Streak, Badge, ProgressData, AVAILABLE_BADGES } from '../types/Progress';

const PROGRESS_STORAGE_KEY = 'vitaminProgress';

/**
 * Get all progress data from storage
 */
export async function getProgressData(): Promise<ProgressData> {
  try {
    const dataJson = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!dataJson) {
      return { checkIns: [], streaks: [], badges: [] };
    }
    return JSON.parse(dataJson);
  } catch (error) {
    console.error('Error loading progress data:', error);
    return { checkIns: [], streaks: [], badges: [] };
  }
}

/**
 * Save progress data to storage
 */
export async function saveProgressData(data: ProgressData): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
}

/**
 * Record a check-in for a vitamin plan
 */
export async function recordCheckIn(vitaminPlanId: string, date?: string): Promise<{ newBadges: Badge[] }> {
  const checkInDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = Date.now();

  const progressData = await getProgressData();
  
  // Check if already checked in for this date and plan
  const existingCheckIn = progressData.checkIns.find(
    checkin => checkin.date === checkInDate && checkin.vitaminPlanId === vitaminPlanId
  );
  
  if (existingCheckIn) {
    console.log('Already checked in for this date');
    return { newBadges: [] };
  }

  // Add new check-in
  const newCheckIn: CheckIn = {
    date: checkInDate,
    vitaminPlanId,
    timestamp,
  };
  progressData.checkIns.push(newCheckIn);

  // Update streak
  const streak = await updateStreak(progressData, vitaminPlanId, checkInDate);
  
  // Check for new badges
  const newBadges = await checkForNewBadges(progressData, vitaminPlanId, streak);

  // Save updated data
  await saveProgressData(progressData);

  return { newBadges };
}

/**
 * Update streak for a vitamin plan
 */
async function updateStreak(progressData: ProgressData, vitaminPlanId: string, checkInDate: string): Promise<Streak> {
  let streak = progressData.streaks.find(s => s.vitaminPlanId === vitaminPlanId);
  
  if (!streak) {
    streak = {
      vitaminPlanId,
      currentStreak: 0,
      longestStreak: 0,
    };
    progressData.streaks.push(streak);
  }

  const yesterday = new Date(checkInDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if this continues a streak
  const hasYesterdayCheckIn = progressData.checkIns.some(
    checkin => checkin.date === yesterdayStr && checkin.vitaminPlanId === vitaminPlanId
  );

  if (hasYesterdayCheckIn || streak.currentStreak === 0) {
    // Continue or start streak
    streak.currentStreak += 1;
  } else {
    // Streak broken, start new one
    streak.currentStreak = 1;
  }

  // Update longest streak
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.lastCheckInDate = checkInDate;
  return streak;
}

/**
 * Check for new badges earned
 */
async function checkForNewBadges(progressData: ProgressData, vitaminPlanId: string, streak: Streak): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  const earnedBadgeIds = progressData.badges.map(b => b.id);

  for (const availableBadge of AVAILABLE_BADGES) {
    // Skip if already earned
    if (earnedBadgeIds.includes(availableBadge.id)) continue;

    let earned = false;

    switch (availableBadge.category) {
      case 'milestone':
        if (availableBadge.id === 'first-checkin' && progressData.checkIns.length === 1) {
          earned = true;
        }
        break;
      
      case 'streak':
        if (streak.currentStreak >= availableBadge.requirement) {
          earned = true;
        }
        break;
      
      case 'consistency':
        // Add logic for consistency badges (like Monday streak)
        if (availableBadge.id === 'monday-champion') {
          earned = checkMondayStreak(progressData, vitaminPlanId);
        }
        break;
    }

    if (earned) {
      const newBadge: Badge = {
        ...availableBadge,
        earnedDate: new Date().toISOString(),
      };
      progressData.badges.push(newBadge);
      newBadges.push(newBadge);
    }
  }

  return newBadges;
}

/**
 * Check if user has Monday streak
 */
function checkMondayStreak(progressData: ProgressData, vitaminPlanId: string): boolean {
  const mondayCheckIns = progressData.checkIns
    .filter(checkin => checkin.vitaminPlanId === vitaminPlanId)
    .filter(checkin => {
      const date = new Date(checkin.date);
      return date.getDay() === 1; // Monday
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (mondayCheckIns.length < 5) return false;

  // Check if the last 5 Mondays are consecutive
  for (let i = 0; i < 4; i++) {
    const current = new Date(mondayCheckIns[i].date);
    const next = new Date(mondayCheckIns[i + 1].date);
    const daysDiff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff !== 7) return false; // Not consecutive Mondays
  }

  return true;
}

/**
 * Get check-ins for a specific month
 */
export function getCheckInsForMonth(checkIns: CheckIn[], year: number, month: number): CheckIn[] {
  return checkIns.filter(checkin => {
    const date = new Date(checkin.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Check if a specific date has a check-in
 */
export function hasCheckInForDate(checkIns: CheckIn[], vitaminPlanId: string, date: string): boolean {
  return checkIns.some(checkin => 
    checkin.date === date && checkin.vitaminPlanId === vitaminPlanId
  );
}

/**
 * Get streak for a vitamin plan
 */
export function getStreakForPlan(streaks: Streak[], vitaminPlanId: string): Streak {
  return streaks.find(s => s.vitaminPlanId === vitaminPlanId) || {
    vitaminPlanId,
    currentStreak: 0,
    longestStreak: 0,
  };
}

/**
 * Get motivational message based on streak
 */
export function getMotivationalMessage(streak: number): string {
  if (streak === 0) return "Ready to start your health journey? 🌱";
  if (streak === 1) return "Great start! One day is a win 🌼";
  if (streak === 2) return "Two days strong! You're building momentum 🌿";
  if (streak === 3) return "3-day streak! That's habit-forming magic 🪄";
  if (streak === 7) return "One week! Your health garden is growing strong 🌸";
  if (streak === 14) return "Two weeks of dedication! You're amazing 🌺";
  if (streak === 30) return "30 days! You're a vitamin champion 🌳";
  if (streak >= 50) return "Incredible dedication! You're an inspiration ✨";
  
  return `${streak} days strong! Keep nurturing your health 🌿`;
}