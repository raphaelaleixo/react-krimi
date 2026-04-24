import type { RoomState } from 'react-gameroom';
import type { GameContextValue } from '../contexts/GameContext';
import type { KrimiGameState, KrimiPlayerData } from '../types';

export const MOCK_GAME_STATE: KrimiGameState = {
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
  detective: 0,
  murderer: 3,
  means: [
    'Machete', 'Radiation', 'Punch', 'Dumbbell',
    'Pistol', 'Arson', 'Chainsaw', 'Poisonous Gas',
    'Surgery', 'Poisoned Wine', 'Sniper Rifle', 'Axe',
    'Sulfuric Acid', 'Razor', 'Hammer', 'Trophy',
    'Liquid Drug', 'Rope', 'Scissors', 'Needle',
    'Electric Baton', 'Brick', 'Pillow', 'Wrench',
    'Knife', 'Poison Dart', 'Crowbar', 'Shovel',
    'Pipe Bomb', 'Ice Pick', 'Crossbow', 'Bat',
    'Syringe', 'Garrote', 'Cleaver', 'Candlestick',
    'Lead Pipe', 'Revolver', 'Scalpel', 'Mallet',
    'Dynamite', 'Katana', 'Hatchet', 'Drill',
    'Flamethrower', 'Taser', 'Spear', 'Vial',
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
    { title: "Murderer's Personality", type: 2, options: ['Arrogant', 'Despicable', 'Furious', 'Greedy', 'Forceful', 'Perverted'] },
    { title: 'Trace at the Scene', type: 2, options: ['Fingerprint', 'Footprint', 'Bruise', 'Blood stain', 'Body fluid', 'Scar'] },
  ],
  forensicAnalysis: [
    'Poisoning',
    'Park',
    'Evening',
    'Jealousy',
    'Stormy',
    'Thin',
    'Greedy',
    'Fingerprint',
  ],
  murdererChoice: { mean: 'Sulfuric Acid', key: 'Glasses' },
  playerPicks: {
    1: { mean: 'Pistol', key: 'Herbal medicine' },
    2: { mean: 'Surgery', key: 'Handcuffs' },
    3: { mean: 'Sulfuric Acid', key: 'Glasses' },
    4: { mean: 'Rope', key: 'Feather' },
    5: { mean: 'Brick', key: 'Notebook' },
    6: { mean: 'Knife', key: 'Perfume' },
    7: { mean: 'Ice Pick', key: 'Tape' },
    8: { mean: 'Syringe', key: 'Glove' },
    9: { mean: 'Revolver', key: 'Battery' },
    10: { mean: 'Dynamite', key: 'Umbrella' },
    11: { mean: 'Taser', key: 'Lighter' },
  },
  round: 2,
  availableClues: 7,
  finished: false,
  lang: 'en',
  guesses: [false, false, false, false, false, false, false, false, false, false, false, false],
  passedTurns: [false, false, false, false, false, true, false, false, false, true, false, false],
};

export const MOCK_ROOM_STATE: RoomState<KrimiPlayerData> = {
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

export const MOCK_ALL_GUESSES: Array<{ index: number; guess: { player: number; mean: string; key: string } }> = [
  { index: 1,  guess: { player: 3, mean: 'Sulfuric Acid', key: 'Button' } },
  { index: 2,  guess: { player: 3, mean: 'Razor', key: 'Lipstick' } },
  { index: 4,  guess: { player: 2, mean: 'Sniper Rifle', key: 'Map' } },
  { index: 5,  guess: { player: 7, mean: 'Knife', key: 'Perfume' } },
  { index: 6,  guess: { player: 3, mean: 'Hammer', key: 'Glasses' } },
  { index: 7,  guess: { player: 5, mean: 'Ice Pick', key: 'Glove' } },
  { index: 8,  guess: { player: 11, mean: 'Syringe', key: 'Tape' } },
  { index: 9,  guess: { player: 3, mean: 'Sulfuric Acid', key: 'Wine glass' } },
  { index: 10, guess: { player: 8, mean: 'Dynamite', key: 'Umbrella' } },
  { index: 11, guess: { player: 3, mean: 'Sulfuric Acid', key: 'Glasses' } },
];

const NOOP = async () => {};

export function buildMockGameContextValue(
  gameState: KrimiGameState = MOCK_GAME_STATE,
): GameContextValue {
  return {
    gameState,
    roomState: MOCK_ROOM_STATE,
    loading: false,
    createRoom: async () => '',
    loadRoom: () => {},
    joinRoom: async () => 0,
    setDetective: NOOP,
    startTheGame: NOOP,
    submitPick: NOOP,
    setAnalysis: NOOP,
    passTurn: NOOP,
    makeGuess: NOOP,
  };
}
