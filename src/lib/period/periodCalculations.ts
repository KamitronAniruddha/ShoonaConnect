import { differenceInDays, addDays, parseISO, isAfter, isBefore, format, isValid } from 'date-fns';
import { PeriodLog, DailyHealthLog, CycleData, BaselineStats, PredictionConfidence, PredictionRange, CyclePhase } from '../../types/period';

// Mathematical Helpers
export const mean = (arr: number[]) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
export const median = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
export const standardDeviation = (arr: number[]) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

export function buildCycles(logs: PeriodLog[], dailyLogs: DailyHealthLog[]): CycleData[] {
  const sortedLogs = [...logs].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const cycles: CycleData[] = [];

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const isCurrent = i === sortedLogs.length - 1;
    const nextLog = isCurrent ? null : sortedLogs[i + 1];
    
    let endDate = null;
    let cycleLength = null;

    if (nextLog) {
      endDate = format(addDays(parseISO(nextLog.startDate), -1), 'yyyy-MM-dd');
      cycleLength = differenceInDays(parseISO(nextLog.startDate), parseISO(log.startDate));
    }

    let periodLength = null;
    if (log.endDate) {
       periodLength = differenceInDays(parseISO(log.endDate), parseISO(log.startDate)) + 1;
    } else if (nextLog) {
       // fallback if no end date but next cycle started
       periodLength = 5; 
    }

    // Assign daily logs to this cycle
    const cycleStart = parseISO(log.startDate);
    const cycleEnd = nextLog ? parseISO(nextLog.startDate) : addDays(new Date(), 365); // Far future if current

    const logsForCycle = dailyLogs.filter(d => {
      const dDate = parseISO(d.date);
      return (isAfter(dDate, cycleStart) || d.date === log.startDate) && isBefore(dDate, cycleEnd);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    cycles.push({
      id: `cycle_${log.id}`,
      cycleNumber: i + 1,
      startDate: log.startDate,
      endDate,
      cycleLength,
      periodLength,
      isCurrent,
      dailyLogs: logsForCycle
    });
  }

  // Reverse so most recent is first
  return cycles.reverse();
}

export function calculateBaselineStats(cycles: CycleData[], settingsCycleLength: number, settingsPeriodLength: number): BaselineStats {
  const completedCycles = cycles.filter(c => c.cycleLength !== null) as Array<CycleData & {cycleLength: number}>;
  const cycleLengths = completedCycles.map(c => c.cycleLength);
  
  const cyclesWithPeriodEnd = cycles.filter(c => c.periodLength !== null) as Array<CycleData & {periodLength: number}>;
  const periodLengths = cyclesWithPeriodEnd.map(c => c.periodLength);

  const avgCycle = cycleLengths.length > 0 ? mean(cycleLengths) : settingsCycleLength;
  const avgPeriod = periodLengths.length > 0 ? mean(periodLengths) : settingsPeriodLength;
  
  const stdCycle = standardDeviation(cycleLengths);
  
  // Regularity score (0-100)
  // Highly regular: stdDev < 2 days -> score ~100
  // Irregular: stdDev > 7 days -> score ~40
  let regularityScore = 0;
  if (cycleLengths.length >= 2) {
     regularityScore = Math.max(0, Math.min(100, 100 - (stdCycle * 5)));
  }

  return {
    averageCycleLength: Math.round(avgCycle),
    medianCycleLength: Math.round(cycleLengths.length > 0 ? median(cycleLengths) : settingsCycleLength),
    shortestCycle: cycleLengths.length > 0 ? Math.min(...cycleLengths) : settingsCycleLength,
    longestCycle: cycleLengths.length > 0 ? Math.max(...cycleLengths) : settingsCycleLength,
    stdDevCycleLength: Number(stdCycle.toFixed(1)),
    
    averagePeriodLength: Math.round(avgPeriod),
    medianPeriodLength: Math.round(periodLengths.length > 0 ? median(periodLengths) : settingsPeriodLength),
    shortestPeriod: periodLengths.length > 0 ? Math.min(...periodLengths) : settingsPeriodLength,
    longestPeriod: periodLengths.length > 0 ? Math.max(...periodLengths) : settingsPeriodLength,
    stdDevPeriodLength: Number(standardDeviation(periodLengths).toFixed(1)),
    
    regularityScore: Math.round(regularityScore),
    totalCycles: cycles.length
  };
}

export function calculatePrediction(cycles: CycleData[], stats: BaselineStats): { range: PredictionRange | null, confidence: PredictionConfidence } {
  if (cycles.length === 0) {
    return {
      range: null,
      confidence: { score: 'Insufficient Data', reason: 'No cycles logged yet. Start tracking to get predictions.' }
    };
  }

  const currentCycle = cycles.find(c => c.isCurrent);
  if (!currentCycle) {
    return {
      range: null,
      confidence: { score: 'Insufficient Data', reason: 'No active cycle found.' }
    };
  }

  // Weight recent cycles more heavily (Exponential Moving Average)
  let predictedLength = stats.averageCycleLength;
  const completedCycles = cycles.filter(c => c.cycleLength !== null);
  
  if (completedCycles.length >= 3) {
    // Simple weighted avg of last 3: 50%, 30%, 20%
    const recent = completedCycles.slice(0, 3);
    predictedLength = (recent[0].cycleLength! * 0.5) + (recent[1].cycleLength! * 0.3) + (recent[2].cycleLength! * 0.2);
  }

  const targetDate = addDays(parseISO(currentCycle.startDate), Math.round(predictedLength));
  
  // Variance margin
  let margin = Math.max(2, Math.round(stats.stdDevCycleLength));
  if (completedCycles.length < 2) margin = 4; // default uncertainty

  const minDate = addDays(targetDate, -margin);
  const maxDate = addDays(targetDate, margin);

  let confidenceScore: PredictionConfidence['score'] = 'Low';
  let reason = 'Keep logging to improve accuracy.';

  if (completedCycles.length >= 6) {
    if (stats.stdDevCycleLength <= 2) {
      confidenceScore = 'High';
      reason = 'Your cycles are very regular.';
    } else if (stats.stdDevCycleLength <= 5) {
      confidenceScore = 'Moderate';
      reason = 'Based on consistent recent patterns.';
    } else {
      confidenceScore = 'Low';
      reason = 'Your cycles have high variability.';
    }
  } else if (completedCycles.length >= 3) {
    confidenceScore = 'Moderate';
    reason = 'Learning your pattern. More logs will increase confidence.';
  } else if (completedCycles.length > 0) {
    confidenceScore = 'Low';
    reason = 'Based on limited history.';
  }

  return {
    range: {
      targetDate: format(targetDate, 'yyyy-MM-dd'),
      minDate: format(minDate, 'yyyy-MM-dd'),
      maxDate: format(maxDate, 'yyyy-MM-dd')
    },
    confidence: { score: confidenceScore, reason }
  };
}

export function getCurrentPhase(currentCycle: CycleData, stats: BaselineStats): { phase: CyclePhase, daysLeft: number, description: string } {
  const daysSinceStart = differenceInDays(new Date(), parseISO(currentCycle.startDate)) + 1; // day 1 is first day of bleeding
  
  const avgCycle = stats.averageCycleLength;
  const avgPeriod = stats.averagePeriodLength;
  const ovulationDay = Math.max(14, avgCycle - 14); // usually 14 days before next period

  if (daysSinceStart <= avgPeriod) {
    return {
      phase: 'Menstrual',
      daysLeft: avgPeriod - daysSinceStart + 1,
      description: 'The lining of the uterus sheds. Hormones are at their lowest point.'
    };
  } else if (daysSinceStart < ovulationDay - 2) {
    return {
      phase: 'Follicular',
      daysLeft: (ovulationDay - 2) - daysSinceStart,
      description: 'Estrogen rises as the body prepares to release an egg. Energy often increases.'
    };
  } else if (daysSinceStart >= ovulationDay - 2 && daysSinceStart <= ovulationDay + 2) {
    return {
      phase: 'Ovulation',
      daysLeft: (ovulationDay + 2) - daysSinceStart + 1,
      description: 'An egg is released. Peak estrogen and testosterone. Energy and mood often peak.'
    };
  } else if (daysSinceStart <= avgCycle) {
    return {
      phase: 'Luteal',
      daysLeft: avgCycle - daysSinceStart + 1,
      description: 'Progesterone rises to prepare for potential pregnancy. PMS symptoms may occur.'
    };
  } else {
    return {
      phase: 'Luteal', // Late
      daysLeft: 0,
      description: 'Cycle is longer than your average. This is common and can be caused by stress or other factors.'
    };
  }
}
