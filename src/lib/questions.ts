import countriesData from '@/data/questions/countries.json';
import historyData from '@/data/questions/history.json';
import scienceData from '@/data/questions/science.json';
import sportsData from '@/data/questions/sports.json';
import popCultureData from '@/data/questions/pop-culture.json';

export type Question = {
  id: string;
  question: string;
  answer: string;
  options: string[];
  acceptedAnswers?: string[];
};

const questionMap: Record<string, Question[]> = {
  countries: countriesData as Question[],
  history: historyData as Question[],
  science: scienceData as Question[],
  sports: sportsData as Question[],
  'pop-culture': popCultureData as Question[],
};

export function getQuestions(category: string): Question[] {
  return questionMap[category] ?? [];
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function isCorrectAnswer(userAnswer: string, question: Question): boolean {
  const normalize = (s: string) => s.trim().toLowerCase();
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])];
  return accepted.some((a) => normalize(a) === normalize(userAnswer));
}
