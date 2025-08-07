export interface DosageOption {
  amount: number;
  unit: string;
  label: string;
  subtitle?: string;
  alternativeDisplay?: string; // For showing both units (e.g., "400 IU (10 mcg)")
}

export const VITAMIN_DOSAGES: Record<string, DosageOption[]> = {
  'vitamin-a': [
    { amount: 2300, unit: 'IU', label: 'Low', alternativeDisplay: '2,300 IU (700 mcg)' },
    { amount: 5000, unit: 'IU', label: 'Standard', alternativeDisplay: '5,000 IU (1,500 mcg)' },
    { amount: 10000, unit: 'IU', label: 'High', alternativeDisplay: '10,000 IU (3,000 mcg)' },
  ],
  'vitamin-b1': [
    { amount: 1, unit: 'mg', label: 'Low' },
    { amount: 50, unit: 'mg', label: 'Standard' },
    { amount: 100, unit: 'mg', label: 'High' },
  ],
  'vitamin-b2': [
    { amount: 1.3, unit: 'mg', label: 'Low' },
    { amount: 25, unit: 'mg', label: 'Standard' },
    { amount: 100, unit: 'mg', label: 'High' },
  ],
  'vitamin-b3': [
    { amount: 16, unit: 'mg', label: 'Low' },
    { amount: 50, unit: 'mg', label: 'Standard' },
    { amount: 500, unit: 'mg', label: 'High' },
  ],
  'vitamin-b6': [
    { amount: 1.3, unit: 'mg', label: 'Low' },
    { amount: 25, unit: 'mg', label: 'Standard' },
    { amount: 100, unit: 'mg', label: 'High' },
  ],
  'vitamin-b12': [
    { amount: 2.4, unit: 'mcg', label: 'Low' },
    { amount: 250, unit: 'mcg', label: 'Standard' },
    { amount: 1000, unit: 'mcg', label: 'High' },
  ],
  'vitamin-c': [
    { amount: 90, unit: 'mg', label: 'Low' },
    { amount: 500, unit: 'mg', label: 'Standard' },
    { amount: 1000, unit: 'mg', label: 'High' },
  ],
  'vitamin-d': [
    { amount: 1000, unit: 'IU', label: 'Standard', alternativeDisplay: '1,000 IU (25 mcg)' },
    { amount: 2000, unit: 'IU', label: 'High', alternativeDisplay: '2,000 IU (50 mcg)' },
    { amount: 3000, unit: 'IU', label: 'Therapeutic', alternativeDisplay: '3,000 IU (75 mcg)' },
    { amount: 5000, unit: 'IU', label: 'High Dose', alternativeDisplay: '5,000 IU (125 mcg)' },
  ],
  'vitamin-e': [
    { amount: 15, unit: 'IU', label: 'Low', alternativeDisplay: '15 IU (10 mg)' },
    { amount: 200, unit: 'IU', label: 'Standard', alternativeDisplay: '200 IU (134 mg)' },
    { amount: 400, unit: 'IU', label: 'High', alternativeDisplay: '400 IU (268 mg)' },
  ],
  'vitamin-k': [
    { amount: 90, unit: 'mcg', label: 'Low' },
    { amount: 120, unit: 'mcg', label: 'Standard' },
    { amount: 500, unit: 'mcg', label: 'High' },
  ],
  'folate': [
    { amount: 400, unit: 'mcg', label: 'Low' },
    { amount: 800, unit: 'mcg', label: 'Standard' },
    { amount: 1000, unit: 'mcg', label: 'High' },
  ],
  'biotin': [
    { amount: 30, unit: 'mcg', label: 'Low' },
    { amount: 300, unit: 'mcg', label: 'Standard' },
    { amount: 5000, unit: 'mcg', label: 'High' },
  ],
  'calcium': [
    { amount: 500, unit: 'mg', label: 'Low' },
    { amount: 1000, unit: 'mg', label: 'Standard' },
    { amount: 1200, unit: 'mg', label: 'High' },
  ],
  'iron': [
    { amount: 8, unit: 'mg', label: 'Low' },
    { amount: 18, unit: 'mg', label: 'Standard' },
    { amount: 65, unit: 'mg', label: 'High' },
  ],
  'magnesium': [
    { amount: 200, unit: 'mg', label: 'Low' },
    { amount: 400, unit: 'mg', label: 'Standard' },
    { amount: 800, unit: 'mg', label: 'High' },
  ],
  'zinc': [
    { amount: 8, unit: 'mg', label: 'Low' },
    { amount: 15, unit: 'mg', label: 'Standard' },
    { amount: 50, unit: 'mg', label: 'High' },
  ],
  'omega-3': [
    { amount: 500, unit: 'mg', label: 'Low' },
    { amount: 1000, unit: 'mg', label: 'Standard' },
    { amount: 2000, unit: 'mg', label: 'High' },
  ],
  'multivitamin': [
    { amount: 1, unit: 'tablet', label: '1 Tablet' },
    { amount: 2, unit: 'tablets', label: '2 Tablets' },
    { amount: 1, unit: 'gummy', label: '1 Gummy' },
    { amount: 2, unit: 'gummies', label: '2 Gummies' },
  ],
};

export function getDosageOptions(vitaminId: string): DosageOption[] {
  return VITAMIN_DOSAGES[vitaminId] || [];
}

export function formatDosageDisplay(amount: number, unit: string, alternativeDisplay?: string): string {
  if (alternativeDisplay) {
    return alternativeDisplay;
  }
  
  // Format numbers nicely
  const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toString();
  const displayAmount = parseFloat(formattedAmount) >= 1000 
    ? `${(parseFloat(formattedAmount) / 1000).toLocaleString()}k` 
    : parseFloat(formattedAmount).toLocaleString();
    
  return `${displayAmount} ${unit}`;
}