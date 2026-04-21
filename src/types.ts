import type { AnalysisItem } from './data/analysis';

export interface KrimiPlayerData {
  role?: 'detective' | 'murderer' | 'investigator';
}

export interface GuessData {
  player: number;
  mean: string;
  key: string;
}

export interface KrimiGameState {
  started: boolean;
  playerOrder: number[];
  playerNames: Record<number, string>;
  detective: number;
  murderer: number;
  means: string[];
  clues: string[];
  analysis: AnalysisItem[];
  forensicAnalysis?: string[];
  murdererChoice?: { mean: string; key: string };
  playerPicks?: Record<number, { mean: string; key: string }>;
  passedTurns?: boolean[];
  guesses?: (GuessData | false)[];
  round: number;
  availableClues: number;
  finished: boolean;
  winner?: 'detectives' | 'murderer';
  lang: 'en' | 'pt_br';
}
