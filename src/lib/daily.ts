import { getAllQuestions, type Question } from '@/lib/questions';

function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyQuestions(dateStr: string, count = 15): Question[] {
  const seed = parseInt(dateStr.replace(/-/g, ''), 10);
  const rng = mulberry32(seed);
  return seededShuffle(getAllQuestions(), rng).slice(0, count);
}

export function isValidPastDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr < getTodayUTC();
}
