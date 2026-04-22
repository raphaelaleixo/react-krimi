import means from '../data/means';
import clues from '../data/clues';
import analysis from '../data/analysis';
import type { AnalysisItem } from '../data/analysis';
import type { KrimiGameState } from '../types';

export function createRandomId(): string {
  return Math.random().toString(36).substring(2, 7);
}

export function getRandom<T>(arr: T[], n: number): T[] {
  const result = new Array<T>(n);
  let len = arr.length;
  const taken = new Array<number>(len);

  if (n > len) throw new RangeError('getRandom: more elements taken than available');

  let remaining = n;
  while (remaining--) {
    const x = Math.floor(Math.random() * len);
    result[remaining] = arr[x in taken ? taken[x] : x] as T;
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

export function chooseRandomMurderer(
  playerOrder: number[],
  detectiveIndex: number
): number {
  const available = playerOrder.filter((_, i) => i !== detectiveIndex);
  const chosen = available[Math.floor(Math.random() * available.length)];
  return playerOrder.indexOf(chosen);
}

export function distributeCards(
  playerCount: number,
  lang: 'en' | 'pt_br'
): { means: string[]; clues: string[]; analysis: AnalysisItem[] } {
  const langData = {
    means: means[lang === 'pt_br' ? 'pt_br' : 'en'],
    clues: clues[lang === 'pt_br' ? 'pt_br' : 'en'],
    analysis: analysis[lang === 'pt_br' ? 'pt_br' : 'en'],
  };

  const gameMeans = getRandom(langData.means, playerCount * 4);
  const gameClues = getRandom(langData.clues, playerCount * 4);

  const analysisCause = langData.analysis.filter((item) => item.type === 0);
  const analysisLocation = getRandom(
    langData.analysis.filter((item) => item.type === 1),
    1
  );
  const analysisOther = getRandom(
    langData.analysis.filter((item) => item.type === 2),
    6
  );

  return {
    means: gameMeans,
    clues: gameClues,
    analysis: [...analysisCause, ...analysisLocation, ...analysisOther],
  };
}

export function checkGuess(
  guess: { mean: string; key: string },
  murdererChoice: { mean: string; key: string }
): boolean {
  return guess.mean === murdererChoice.mean && guess.key === murdererChoice.key;
}

export function isRolesRevealed(gameState: KrimiGameState): boolean {
  if (!gameState.playerPicks) return false;
  const pickCount = Object.keys(gameState.playerPicks).length;
  const expectedPicks = gameState.playerOrder.length - 1; // forensic doesn't pick
  return pickCount === expectedPicks;
}

export function isForensicReady(gameState: KrimiGameState): boolean {
  return (
    gameState.availableClues > 0 &&
    (gameState.forensicAnalysis?.length ?? 0) >= gameState.availableClues &&
    (gameState.forensicAnalysis ?? [])
      .slice(0, gameState.availableClues)
      .every(Boolean)
  );
}
