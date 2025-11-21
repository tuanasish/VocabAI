export interface Word {
  id: string;
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
}

export interface VocabularySet {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  words: Word[];
  category: string;
  colorClass: string; // Tailwind classes for badge color
}

export interface UserStats {
  dailyGoal: number;
  currentProgress: number;
  wordsLearned: number;
  quizAccuracy: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export type GeneratedWord = {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
};

export type GeneratedSet = {
  title: string;
  description: string;
  category: string;
  level: string;
  icon: string;
  words: GeneratedWord[];
};

export type RoleplayScenario = {
  persona: string;
  scenario: string;
  initialMessage: string;
};
