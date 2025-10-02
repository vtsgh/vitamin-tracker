import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckIn, Streak, Badge, ProgressData, StreakRecovery, getAllAvailableBadges } from '../types/Progress';

const PROGRESS_STORAGE_KEY = 'vitaminProgress';

/**
 * Get all progress data from storage
 */
export async function getProgressData(): Promise<ProgressData> {
  try {
    const dataJson = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!dataJson) {
      return { checkIns: [], streaks: [], badges: [], streakRecoveries: [] };
    }
    const data = JSON.parse(dataJson);
    // Ensure streakRecoveries exists for backward compatibility
    if (!data.streakRecoveries) {
      data.streakRecoveries = [];
    }
    return data;
  } catch (error) {
    console.error('Error loading progress data:', error);
    return { checkIns: [], streaks: [], badges: [], streakRecoveries: [] };
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
export async function recordCheckIn(vitaminPlanId: string, date?: string, isPremium: boolean = true): Promise<{ newBadges: Badge[] }> {
  // Create local date string to avoid timezone issues
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const checkInDate = date || todayStr; // YYYY-MM-DD
  const timestamp = Date.now();

  console.log(`🎯 Recording check-in for plan ${vitaminPlanId} on date ${checkInDate}`);
  console.log(`📅 Today is: ${todayStr}, check-in date is: ${checkInDate}`);

  const progressData = await getProgressData();
  
  console.log(`📊 Current check-ins:`, progressData.checkIns.filter(c => c.vitaminPlanId === vitaminPlanId).map(c => c.date));
  console.log(`📊 Current streaks:`, progressData.streaks.filter(s => s.vitaminPlanId === vitaminPlanId));
  
  // Check if already checked in for this date and plan
  const existingCheckIn = progressData.checkIns.find(
    checkin => checkin.date === checkInDate && checkin.vitaminPlanId === vitaminPlanId
  );
  
  if (existingCheckIn) {
    console.log('❌ Already checked in for this date');
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
  
  // Check for new badges with premium status
  const newBadges = await checkForNewBadges(progressData, vitaminPlanId, streak, isPremium);

  // Save updated data
  await saveProgressData(progressData);

  return { newBadges };
}

/**
 * Update streak for a vitamin plan using enhanced calculation with recovery support
 */
async function updateStreak(progressData: ProgressData, vitaminPlanId: string, checkInDate: string): Promise<Streak> {
  console.log(`🔄 Updating streak for plan ${vitaminPlanId} on date ${checkInDate}`);
  
  let streak = progressData.streaks.find(s => s.vitaminPlanId === vitaminPlanId);
  
  if (!streak) {
    console.log(`🆕 Creating new streak object for plan ${vitaminPlanId}`);
    streak = {
      vitaminPlanId,
      currentStreak: 0,
      longestStreak: 0,
    };
    progressData.streaks.push(streak);
  }

  console.log(`📊 Previous streak: ${streak.currentStreak}, longest: ${streak.longestStreak}`);

  // Use enhanced streak calculation that accounts for recoveries
  const currentStreak = calculateStreakWithRecoveries(
    progressData.checkIns,
    progressData.streakRecoveries || [],
    vitaminPlanId,
    checkInDate
  );

  console.log(`🧮 Calculated new streak: ${currentStreak}`);

  // Update streak object
  streak.currentStreak = currentStreak;

  // Update longest streak if current is higher
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
    console.log(`🎉 New longest streak record: ${streak.longestStreak}!`);
  }

  streak.lastCheckInDate = checkInDate;
  console.log(`✅ Streak updated successfully: current=${streak.currentStreak}, longest=${streak.longestStreak}`);
  return streak;
}

/**
 * Check for new badges earned
 */
async function checkForNewBadges(progressData: ProgressData, vitaminPlanId: string, streak: Streak, isPremium: boolean = true): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  const earnedBadgeIds = progressData.badges.map(b => b.id);
  const availableBadges = getAllAvailableBadges(true); // Always include premium badges now

  for (const availableBadge of availableBadges) {
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
  if (streak === 0) return "Ready to start your health journey?";
  if (streak === 1) return "Great start! One day is a win";
  if (streak === 2) return "Two days strong! You're building momentum";
  if (streak === 3) return "3-day streak! That's habit-forming magic 🪄";
  if (streak === 7) return "One week! Your consistency is paying off";
  if (streak === 14) return "Two weeks of dedication! You're amazing";
  if (streak === 30) return "30 days! You're a vitamin champion";
  if (streak >= 50) return "Incredible dedication! You're an inspiration ✨";

  return `${streak} days strong! Keep it up`;
}

/**
 * Check if streak would break without recovery - DISABLED
 * Streaks no longer "break" in the new system
 */
export function wouldStreakBreak(checkIns: CheckIn[], streakRecoveries: StreakRecovery[], vitaminPlanId: string): { wouldBreak: boolean; missedDate: string | null } {
  // Streaks never break in the new system - they just pause
  return { wouldBreak: false, missedDate: null };
}

/**
 * Get streak recoveries used this month for a plan
 */
export function getStreakRecoveriesThisMonth(recoveries: StreakRecovery[], vitaminPlanId: string): number {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  return recoveries.filter(recovery => 
    recovery.vitaminPlanId === vitaminPlanId && 
    recovery.recoveryMonth === currentMonth
  ).length;
}

/**
 * Use a streak recovery to save a broken streak - DEPRECATED
 * This function is kept for compatibility but does nothing in the new system
 */
export async function applyStreakRecovery(vitaminPlanId: string, missedDate: string): Promise<{ success: boolean; newRecovery?: StreakRecovery }> {
  console.log('🔄 Streak recovery attempted but streaks no longer break in the new system');
  return { success: false };
}

/**
 * Manually restart a streak for a vitamin plan
 * This clears all previous check-ins and starts fresh
 */
export async function restartStreak(vitaminPlanId: string): Promise<{ success: boolean }> {
  try {
    console.log(`🔄 Manually restarting streak for plan ${vitaminPlanId}`);
    const progressData = await getProgressData();

    // Remove all check-ins for this plan
    progressData.checkIns = progressData.checkIns.filter(
      checkin => checkin.vitaminPlanId !== vitaminPlanId
    );

    // Reset streak data
    const streakIndex = progressData.streaks.findIndex(s => s.vitaminPlanId === vitaminPlanId);
    if (streakIndex !== -1) {
      progressData.streaks[streakIndex] = {
        vitaminPlanId,
        currentStreak: 0,
        longestStreak: progressData.streaks[streakIndex].longestStreak, // Keep longest streak record
        lastCheckInDate: undefined
      };
    }

    // Remove any streak recoveries for this plan (cleanup)
    progressData.streakRecoveries = progressData.streakRecoveries.filter(
      recovery => recovery.vitaminPlanId !== vitaminPlanId
    );

    // Save updated data
    await saveProgressData(progressData);

    console.log(`✅ Streak successfully restarted for plan ${vitaminPlanId}`);
    return { success: true };
  } catch (error) {
    console.error('Error restarting streak:', error);
    return { success: false };
  }
}

/**
 * Enhanced streak calculation that only counts consecutive check-ins
 * Streaks never "break" - they just pause until next check-in
 */
export function calculateStreakWithRecoveries(checkIns: CheckIn[], recoveries: StreakRecovery[], vitaminPlanId: string, currentDate?: string): number {
  // Get all check-ins for this plan, sorted by date (newest first)
  const planCheckIns = checkIns
    .filter(checkin => checkin.vitaminPlanId === vitaminPlanId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`🔍 Starting streak calculation for plan ${vitaminPlanId}`);
  console.log(`📋 Available check-ins:`, planCheckIns.map(c => c.date));

  if (planCheckIns.length === 0) {
    console.log(`❌ No check-ins found, streak = 0`);
    return 0;
  }

  // Start from the most recent check-in date
  let streak = 0;
  let currentCheckDate = planCheckIns[0].date; // Most recent check-in

  console.log(`🔍 Starting from most recent check-in: ${currentCheckDate}`);

  // Go backwards day by day from the most recent check-in
  while (true) {
    // Check if there's a check-in for this date
    const hasCheckIn = checkIns.some(
      checkin => checkin.date === currentCheckDate && checkin.vitaminPlanId === vitaminPlanId
    );

    console.log(`🔍 Checking ${currentCheckDate}: hasCheckIn=${hasCheckIn}`);

    // Only count days with actual check-ins (no recovery system)
    if (hasCheckIn) {
      streak++;
      console.log(`✅ Streak incremented to ${streak} for date ${currentCheckDate}`);

      // Move to previous day (avoid timezone issues)
      const dateParts = currentCheckDate.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2]);

      const prevDate = new Date(year, month, day);
      prevDate.setDate(prevDate.getDate() - 1);
      currentCheckDate = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
    } else {
      // No check-in found, but streak doesn't "break" - it just stops counting
      console.log(`⏸️ No check-in for ${currentCheckDate}, streak pauses at ${streak}`);
      break;
    }

    // Safety: don't go back more than 365 days
    if (streak > 365) {
      console.log(`⚠️ Safety break: streak > 365 days`);
      break;
    }
  }

  console.log(`🏆 Final calculated streak: ${streak}`);
  return streak;
}

/**
 * Add or update a note for a specific check-in
 */
export async function addNoteToCheckIn(
  vitaminPlanId: string,
  date: string,
  note: string
): Promise<boolean> {
  try {
    const progressData = await getProgressData();

    // Find the check-in for this date and plan
    const checkIn = progressData.checkIns.find(
      c => c.date === date && c.vitaminPlanId === vitaminPlanId
    );

    if (!checkIn) {
      console.error(`❌ No check-in found for plan ${vitaminPlanId} on ${date}`);
      return false;
    }

    // Update the note
    checkIn.note = note.trim() || undefined; // Remove note if empty

    // Save updated data
    await saveProgressData(progressData);
    console.log(`📝 Note ${note.trim() ? 'added' : 'removed'} for plan ${vitaminPlanId} on ${date}`);

    return true;
  } catch (error) {
    console.error('Error adding note to check-in:', error);
    return false;
  }
}

/**
 * Get check-in with note for a specific date and plan
 */
export function getCheckInWithNote(
  checkIns: CheckIn[],
  vitaminPlanId: string,
  date: string
): CheckIn | undefined {
  return checkIns.find(
    c => c.date === date && c.vitaminPlanId === vitaminPlanId
  );
}