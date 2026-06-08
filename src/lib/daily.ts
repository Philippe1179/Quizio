import { type Question } from '@/lib/questions';
import { dailyQuestions, DAILY_EPOCH } from '@/data/dailyQuestions';

export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyQuestions(dateStr: string, count = 10): Question[] {
  const epoch = new Date(DAILY_EPOCH + 'T00:00:00Z').getTime();
  const target = new Date(dateStr + 'T00:00:00Z').getTime();
  const dayIndex = Math.floor((target - epoch) / 86400000);
  const totalSlots = Math.floor(dailyQuestions.length / count);
  const slot = ((dayIndex % totalSlots) + totalSlots) % totalSlots;
  return dailyQuestions.slice(slot * count, slot * count + count);
}

export function isValidPastDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr < getTodayUTC();
}
