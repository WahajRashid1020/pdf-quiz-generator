export enum DifficultyLevel {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

export interface QuizQuestion {
  question: string;
  options: string[]; // Array of 3-5 strings
  correctAnswerIndex: number; // Index of the correct answer in the options array
  explanation?: string; // Optional explanation for the correct answer
}
