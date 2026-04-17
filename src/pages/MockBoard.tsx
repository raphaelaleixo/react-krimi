import { useState } from 'react';
import type { RoomState } from 'react-gameroom';
import Board from '../components/Board';
import { GameContext } from '../contexts/GameContext';
import type { KrimiGameState, KrimiPlayerData } from '../types';

/**
 * Mock game state for layout iteration.
 * Simulates a 6-player game in round 2 with some guesses and forensic analysis.
 */
const MOCK_GAME_STATE: KrimiGameState = {
  started: true,
  playerOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  playerNames: {
    1: 'Hercule Poirot',
    2: 'Miss Marple',
    3: 'Sherlock Holmes',
    4: 'Philip Marlowe',
    5: 'Sam Spade',
    6: 'Nancy Drew',
    7: 'Jessica Fletcher',
    8: 'Columbo',
    9: 'Inspector Clouseau',
    10: 'Veronica Mars',
    11: 'Jake Peralta',
    12: 'Benoit Blanc',
  },
  detective: 0, // Hercule Poirot is the forensic scientist
  murderer: 3,  // Philip Marlowe is the secret murderer
  means: [
    // 4 per player (48 total for 12 players)
    'Machete', 'Radiation', 'Punch', 'Dumbbell',         // player 1 (detective, won't show)
    'Pistol', 'Arson', 'Chainsaw', 'Poisonous Gas',      // player 2
    'Surgery', 'Poisoned Wine', 'Sniper Rifle', 'Axe',   // player 3
    'Sulfuric Acid', 'Razor', 'Hammer', 'Trophy',        // player 4 (murderer)
    'Liquid Drug', 'Rope', 'Scissors', 'Needle',         // player 5
    'Electric Baton', 'Brick', 'Pillow', 'Wrench',       // player 6
    'Knife', 'Poison Dart', 'Crowbar', 'Shovel',         // player 7
    'Pipe Bomb', 'Ice Pick', 'Crossbow', 'Bat',          // player 8
    'Syringe', 'Garrote', 'Cleaver', 'Candlestick',     // player 9
    'Lead Pipe', 'Revolver', 'Scalpel', 'Mallet',       // player 10
    'Dynamite', 'Katana', 'Hatchet', 'Drill',           // player 11
    'Flamethrower', 'Taser', 'Spear', 'Vial',           // player 12
  ],
  clues: [
    'Cigarette Butt', 'Express courier', 'Ice', 'Sand',
    'Herbal medicine', 'Toy blocks', 'Broom', 'Computer',
    'Handcuffs', 'Love letter', 'Map', 'Newspaper',
    'Button', 'Lipstick', 'Glasses', 'Wine glass',
    'Feather', 'Envelope', 'Matches', 'Ring',
    'Notebook', 'Photograph', 'Ticket', 'Key',
    'Perfume', 'Hair clip', 'Receipt', 'Coin',
    'Earring', 'Pen', 'Chalk', 'Thread',
    'Tape', 'Glove', 'Mask', 'Flashlight',
    'Battery', 'Wire', 'Sticker', 'Badge',
    'Umbrella', 'Scarf', 'Wallet', 'Watch',
    'Lighter', 'Bandage', 'Bookmark', 'Dice',
  ],
  analysis: [
    { title: 'Cause of death', type: 0, options: ['Suffocation', 'Severe injury', 'Loss of blood', 'Illness/disease', 'Poisoning', 'Accident'] },
    { title: 'Location of crime', type: 1, options: ['Vacation home', 'Park', 'Supermarket', 'School', 'Woods', 'Bank'] },
    { title: 'Time of Death', type: 2, options: ['Dawn', 'Morning', 'Noon', 'Afternoon', 'Evening', 'Midnight'] },
    { title: 'Motive of Crime', type: 2, options: ['Hatred', 'Power', 'Money', 'Love', 'Jealousy', 'Justice'] },
    { title: 'Weather', type: 2, options: ['Sunny', 'Stormy', 'Dry', 'Humid', 'Cold', 'Hot'] },
    { title: "Victim's Build", type: 2, options: ['Large', 'Thin', 'Tall', 'Short', 'Disfigured', 'Fit'] },
    // Round 2 extra clue
    { title: 'Murderer\'s Personality', type: 2, options: ['Arrogant', 'Despicable', 'Furious', 'Greedy', 'Forceful', 'Perverted'] },
    // Round 3 extra clue
    { title: 'Trace at the Scene', type: 2, options: ['Fingerprint', 'Footprint', 'Bruise', 'Blood stain', 'Body fluid', 'Scar'] },
  ],
  forensicAnalysis: [
    'Poisoning',    // Cause of death
    'Park',         // Location
    'Evening',      // Time of death
    'Jealousy',     // Motive
    'Stormy',       // Weather
    'Thin',         // Victim's build
    'Greedy',       // Round 2 clue (glued-on note)
    'Fingerprint',  // Round 3 clue (glued-on note)
  ],
  murdererChoice: { mean: 'Sulfuric Acid', key: 'Glasses' },
  round: 2,
  availableClues: 7,
  finished: false,
  lang: 'en',
  guesses: [
    false,  // player 1 — detective, no guess
    false,  // Miss Marple — no guess yet
    false,  // Sherlock Holmes
    false,  // Philip Marlowe — murderer
    false,  // Sam Spade
    false,  // Nancy Drew
    false,  // Jessica Fletcher
    false,  // Columbo
    false,  // Inspector Clouseau
    false,  // Veronica Mars
    false,  // Jake Peralta
    false,  // Benoit Blanc
  ],
  passedTurns: [false, false, false, false, false, true, false, false, false, true, false, false],
};

const ALL_GUESSES: Array<{ index: number; guess: { player: number; mean: string; key: string } }> = [
  { index: 1,  guess: { player: 3, mean: 'Sulfuric Acid', key: 'Button' } },       // Miss Marple
  { index: 2,  guess: { player: 3, mean: 'Razor', key: 'Lipstick' } },             // Sherlock Holmes
  { index: 4,  guess: { player: 2, mean: 'Sniper Rifle', key: 'Map' } },           // Sam Spade
  { index: 5,  guess: { player: 7, mean: 'Knife', key: 'Perfume' } },              // Nancy Drew
  { index: 6,  guess: { player: 3, mean: 'Hammer', key: 'Glasses' } },             // Jessica Fletcher
  { index: 7,  guess: { player: 5, mean: 'Ice Pick', key: 'Glove' } },             // Columbo
  { index: 8,  guess: { player: 11, mean: 'Syringe', key: 'Tape' } },              // Inspector Clouseau
  { index: 9,  guess: { player: 3, mean: 'Sulfuric Acid', key: 'Wine glass' } },   // Veronica Mars
  { index: 10, guess: { player: 8, mean: 'Dynamite', key: 'Umbrella' } },          // Jake Peralta
  { index: 11, guess: { player: 3, mean: 'Sulfuric Acid', key: 'Glasses' } },      // Benoit Blanc — correct!
];

const MOCK_ROOM_STATE: RoomState<KrimiPlayerData> = {
  roomId: 'X7K2M',
  status: 'started',
  config: { minPlayers: 6, maxPlayers: 12, requireFull: false },
  players: MOCK_GAME_STATE.playerOrder.map((id) => ({
    id,
    status: 'ready' as const,
    name: MOCK_GAME_STATE.playerNames[id],
    data: {
      role: id === MOCK_GAME_STATE.playerOrder[MOCK_GAME_STATE.detective]
        ? 'detective' as const
        : id === MOCK_GAME_STATE.murderer
          ? 'murderer' as const
          : 'investigator' as const,
    },
  })),
};

const NOOP = async () => {};

export default function MockBoard() {
  const [guessStep, setGuessStep] = useState(0);

  const guesses = [...MOCK_GAME_STATE.guesses] as KrimiGameState['guesses'];
  for (let i = 0; i < guessStep && i < ALL_GUESSES.length; i++) {
    const { index, guess } = ALL_GUESSES[i];
    guesses[index] = guess;
  }

  const gameState: KrimiGameState = { ...MOCK_GAME_STATE, guesses };

  const nextGuessName = guessStep < ALL_GUESSES.length
    ? MOCK_GAME_STATE.playerNames[MOCK_GAME_STATE.playerOrder[ALL_GUESSES[guessStep].index]]
    : null;

  return (
    <GameContext.Provider
      value={{
        gameState,
        roomState: MOCK_ROOM_STATE,
        loading: false,
        createRoom: async () => '',
        loadRoom: () => {},
        joinRoom: async () => 0,
        setDetective: NOOP,
        startTheGame: NOOP,
        setMurdererChoice: NOOP,
        setAnalysis: NOOP,
        passTurn: NOOP,
        makeGuess: NOOP,
      }}
    >
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
          onClick={() => setGuessStep((s) => Math.min(s + 1, ALL_GUESSES.length))}
          disabled={guessStep >= ALL_GUESSES.length}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: guessStep >= ALL_GUESSES.length ? 'default' : 'pointer',
            background: '#094067',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            opacity: guessStep >= ALL_GUESSES.length ? 0.4 : 1,
          }}
        >
          + Guess {nextGuessName ? `(${nextGuessName})` : ''} [{guessStep}/{ALL_GUESSES.length}]
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
