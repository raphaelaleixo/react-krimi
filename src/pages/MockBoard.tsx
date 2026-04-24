import { useState } from 'react';
import Board from '../components/Board';
import { GameContext } from '../contexts/GameContext';
import {
  MOCK_GAME_STATE,
  MOCK_ALL_GUESSES,
  buildMockGameContextValue,
} from '../mocks/krimiFixture';
import type { KrimiGameState } from '../types';

export default function MockBoard() {
  const [guessStep, setGuessStep] = useState(0);

  const guesses: KrimiGameState['guesses'] = [...(MOCK_GAME_STATE.guesses ?? [])];
  for (let i = 0; i < guessStep && i < MOCK_ALL_GUESSES.length; i++) {
    const { index, guess } = MOCK_ALL_GUESSES[i];
    guesses[index] = guess;
  }

  const gameState: KrimiGameState = { ...MOCK_GAME_STATE, guesses };

  const nextGuessName = guessStep < MOCK_ALL_GUESSES.length
    ? MOCK_GAME_STATE.playerNames[MOCK_GAME_STATE.playerOrder[MOCK_ALL_GUESSES[guessStep].index]]
    : null;

  return (
    <GameContext.Provider value={buildMockGameContextValue(gameState)}>
      <Board />
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setGuessStep((s) => Math.min(s + 1, MOCK_ALL_GUESSES.length))}
          disabled={guessStep >= MOCK_ALL_GUESSES.length}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: guessStep >= MOCK_ALL_GUESSES.length ? 'default' : 'pointer',
            background: '#094067',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            opacity: guessStep >= MOCK_ALL_GUESSES.length ? 0.4 : 1,
          }}
        >
          + Guess {nextGuessName ? `(${nextGuessName})` : ''} [{guessStep}/{MOCK_ALL_GUESSES.length}]
        </button>
        <button
          onClick={() => setGuessStep(0)}
          disabled={guessStep === 0}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            cursor: guessStep === 0 ? 'default' : 'pointer',
            background: '#c62828',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            opacity: guessStep === 0 ? 0.4 : 1,
          }}
        >
          Reset
        </button>
      </div>
    </GameContext.Provider>
  );
}
