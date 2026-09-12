export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';

export interface SymptomLog {
  severity: number; // 0-10
  note?: string;
}

export interface DailyHealthLog {
  date: string; // YYYY-MM-DD
  flow?: FlowIntensity;
  symptoms: Record<string, SymptomLog>; // key: symptom name
  mood?: string;
  moodIntensity?: number; // 1-10
  energy?: number; // 1-10
  sleepDuration?: number; // hours
  sleepQuality?: number; // 1-10
  temperature?: number;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'egg_white' | 'watery';
  notes?: string;
  updatedAt: string;
}

export interface PeriodLog {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CycleData {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string | null; // null if current cycle
  cycleLength: number | null; // null if current cycle
  periodLength: number | null; // null if period is ongoing
  isCurrent: boolean;
  dailyLogs: DailyHealthLog[];
}

export interface PeriodSettings {
  typicalCycleLength: number;
  typicalPeriodLength: number;
  shareWithPartner: 'none' | 'status' | 'predicted_window' | 'symptoms' | 'all';
  updatedAt: string;
}

export interface PredictionConfidence {
  score: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  reason: string;
}

export interface PredictionRange {
  targetDate: string;
  minDate: string;
  maxDate: string;
}

export interface BaselineStats {
  averageCycleLength: number;
  medianCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  stdDevCycleLength: number;
  
  averagePeriodLength: number;
  medianPeriodLength: number;
  shortestPeriod: number;
  longestPeriod: number;
  stdDevPeriodLength: number;
  
  regularityScore: number; // 0-100
  totalCycles: number;
}
