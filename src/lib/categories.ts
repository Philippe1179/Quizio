export type Category = {
  id: string;
  label: string;
  description: string;
};

export type GameMode = {
  id: string;
  label: string;
  description: string;
  path: string;
};

export const categories: Category[] = [
  { id: 'countries', label: 'Countries & Geography', description: 'Capitals, flags, and world geography' },
  { id: 'history', label: 'History', description: 'Events, figures, and dates throughout time' },
  { id: 'science', label: 'Science', description: 'Biology, chemistry, physics, and more' },
  { id: 'sports', label: 'Sports', description: 'Teams, players, and sports trivia' },
  { id: 'pop-culture', label: 'Pop Culture', description: 'Movies, music, TV, and entertainment' },
];

export const gameModes: GameMode[] = [
  { id: 'quiz', label: 'Multiple Choice', description: 'Answer questions with 4 options', path: '/quiz' },
  { id: 'flashcard', label: 'Flashcard', description: 'Flip cards to learn and review', path: '/flashcard' },
  { id: 'type', label: 'Type the Answer', description: 'Type your answer from memory', path: '/type' },
  { id: 'timed', label: 'Timed Challenge', description: 'Race the clock for bonus points', path: '/timed' },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
