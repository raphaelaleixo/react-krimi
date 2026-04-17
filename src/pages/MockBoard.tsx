import Board from '../components/Board';
import { GameContext } from '../contexts/GameContext';
import type { KrimiGameState } from '../types';

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
  ],
  forensicAnalysis: [
    'Poisoning',    // Cause of death
    'Park',         // Location
    'Evening',      // Time of death
    'Jealousy',     // Motive
    'Stormy',       // Weather
    'Thin',         // Victim's build
    'Greedy',       // Round 2 clue (glued-on note)
  ],
  murdererChoice: { mean: 'Sulfuric Acid', key: 'Glasses' },
  round: 2,
  availableClues: 7,
  finished: false,
  lang: 'en',
  // Some guesses: player 2 (Miss Marple) guessed player 4, player 5 (Sam Spade) guessed player 3
  guesses: [
    false,  // player 1 — detective, no guess
    { player: 3, mean: 'Sulfuric Acid', key: 'Button' },  // Miss Marple accuses Philip Marlowe
    false,  // Sherlock Holmes — hasn't guessed yet
    false,  // Philip Marlowe — murderer, no guess
    { player: 2, mean: 'Sniper Rifle', key: 'Map' },      // Sam Spade accuses Sherlock Holmes
    false,  // Nancy Drew
    false,  // Jessica Fletcher
    { player: 5, mean: 'Ice Pick', key: 'Glove' },        // Columbo accuses Sam Spade
    false,  // Inspector Clouseau
    false,  // Veronica Mars
    false,  // Jake Peralta
    false,  // Benoit Blanc
  ],
  passedTurns: [false, false, false, false, false, true, false, false, false, true, false, false],
};

const NOOP = async () => {};

export default function MockBoard() {
  return (
    <GameContext.Provider
      value={{
        gameState: MOCK_GAME_STATE,
        roomState: null,
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
    </GameContext.Provider>
  );
}
