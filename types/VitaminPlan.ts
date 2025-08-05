export interface VitaminPlan {
  id: string; // unique ID (e.g. UUID)
  vitamin: string;
  frequency: 'daily' | 'every-other-day' | 'weekly' | 'custom';
  customDays?: string[]; // if frequency is custom
  endDate: string; // ISO date
  reminderTime: string; // time in HH:MM format (e.g., "09:00")
  notificationIds: string[]; // array of expo-notifications IDs for cancelling reminders
  createdDate?: string; // ISO date when plan was created (optional for backward compatibility)
  
  // Legacy fields for backward compatibility
  notificationId?: string; // old single notification ID
}