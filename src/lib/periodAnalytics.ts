import { differenceInDays, addDays, parseISO, isAfter, isBefore, format } from 'date-fns';
import { PeriodLog, PeriodCycleAnalytics } from '../types';

export function calculatePeriodAnalytics(logs: PeriodLog[]): PeriodCycleAnalytics {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  let averageCycleLength = 28;
  let averagePeriodLength = 5;

  if (sortedLogs.length >= 2) {
    let totalCycleDays = 0;
    let cycleCount = 0;
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = parseISO(sortedLogs[i].startDate);
      const previous = parseISO(sortedLogs[i + 1].startDate);
      totalCycleDays += differenceInDays(current, previous);
      cycleCount++;
    }
    if (cycleCount > 0) averageCycleLength = Math.round(totalCycleDays / cycleCount);
  }

  if (sortedLogs.length > 0) {
    let totalPeriodDays = 0;
    let periodCount = 0;
    sortedLogs.forEach(log => {
      if (log.endDate) {
        totalPeriodDays += differenceInDays(parseISO(log.endDate), parseISO(log.startDate)) + 1;
        periodCount++;
      }
    });
    if (periodCount > 0) averagePeriodLength = Math.round(totalPeriodDays / periodCount);
  }

  let nextPeriodStartPredicted = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  let currentPhase: PeriodCycleAnalytics['currentPhase'] = 'Unknown';
  let phaseDaysLeft = 0;

  if (sortedLogs.length > 0) {
    const lastPeriod = sortedLogs[0];
    const lastStartDate = parseISO(lastPeriod.startDate);
    const today = new Date();
    
    nextPeriodStartPredicted = format(addDays(lastStartDate, averageCycleLength), 'yyyy-MM-dd');
    
    const daysSinceStart = differenceInDays(today, lastStartDate) + 1; // day 1 is the first day of bleeding

    const ovulationDay = averageCycleLength - 14; 
    
    if (daysSinceStart <= averagePeriodLength) {
      currentPhase = 'Menstrual';
      phaseDaysLeft = averagePeriodLength - daysSinceStart + 1;
    } else if (daysSinceStart < ovulationDay - 1) {
      currentPhase = 'Follicular';
      phaseDaysLeft = (ovulationDay - 1) - daysSinceStart;
    } else if (daysSinceStart >= ovulationDay - 1 && daysSinceStart <= ovulationDay + 1) {
      currentPhase = 'Ovulation';
      phaseDaysLeft = (ovulationDay + 1) - daysSinceStart + 1;
    } else if (daysSinceStart <= averageCycleLength) {
      currentPhase = 'Luteal';
      phaseDaysLeft = averageCycleLength - daysSinceStart + 1;
    } else {
      // Late
      currentPhase = 'Luteal'; // Technically late
      phaseDaysLeft = 0;
    }
  }

  return {
    averageCycleLength,
    averagePeriodLength,
    nextPeriodStartPredicted,
    currentPhase,
    phaseDaysLeft
  };
}
