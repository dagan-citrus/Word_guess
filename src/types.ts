export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  players: Player[];
  score: number;
  currentPlayerIdx: number;
}

export interface WordItem {
  word: string;
  category: string;
}

export interface TurnResult {
  word: string;
  guessed: boolean;
}

export type Screen =
  | 'setup'
  | 'categories'
  | 'turnStart'
  | 'playing'
  | 'turnEnd'
  | 'scoreboard';
