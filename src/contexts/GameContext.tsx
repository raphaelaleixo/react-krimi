import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  ref,
  set,
  update,
  onValue,
  get,
  type Unsubscribe,
} from 'firebase/database';
import {
  createInitialRoom,
  joinPlayer,
  startGame as startGameRoom,
  findFirstEmptySlot,
  deserializeRoom,
  type RoomState,
} from 'react-gameroom';
import { database } from '../firebase';
import { distributeCards, chooseRandomMurderer } from '../utils/rules';
import type { KrimiPlayerData, KrimiGameState, GuessData } from '../types';

interface GameContextValue {
  roomState: RoomState<KrimiPlayerData> | null;
  gameState: KrimiGameState | null;
  loading: boolean;
  createRoom: (lang: 'en' | 'pt_br') => Promise<string>;
  loadRoom: (roomId: string) => void;
  joinRoom: (roomId: string, name: string) => Promise<number>;
  setDetective: (playerOrderIndex: number) => Promise<void>;
  startTheGame: (detectiveIndex: number) => Promise<void>;
  setMurdererChoice: (choice: { mean: string; key: string }) => Promise<void>;
  submitPick: (playerOrderIndex: number, pick: { mean: string; key: string }) => Promise<void>;
  setAnalysis: (analysis: string[]) => Promise<void>;
  passTurn: (playerOrderIndex: number) => Promise<void>;
  makeGuess: (playerOrderIndex: number, guess: GuessData) => Promise<void>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState<KrimiPlayerData> | null>(null);
  const [gameState, setGameState] = useState<KrimiGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);
  const currentRoomId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const loadRoom = useCallback((roomId: string) => {
    // Always unsubscribe previous listener
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    currentRoomId.current = roomId;
    setLoading(true);

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      console.log('[Krimi] Firebase data for room', roomId, data);
      if (!data) {
        setLoading(false);
        return;
      }
      if (data.room) {
        try {
          const parsed = deserializeRoom<KrimiPlayerData>(data.room);
          setRoomState(parsed);
        } catch (e) {
          console.warn('[Krimi] deserializeRoom failed, using raw', e);
          setRoomState(data.room as RoomState<KrimiPlayerData>);
        }
      }
      if (data.game) {
        setGameState(data.game as KrimiGameState);
      }
      setLoading(false);
    }, (error) => {
      console.error('[Krimi] Firebase listener error:', error);
      setLoading(false);
    });
    unsubRef.current = unsub;
  }, []);

  const createRoom = useCallback(async (lang: 'en' | 'pt_br') => {
    const room = createInitialRoom<KrimiPlayerData>({
      minPlayers: 5,
      maxPlayers: 12,
      requireFull: false,
    });
    const roomId = room.roomId;
    console.log('[Krimi] Creating room', roomId, room);
    const roomRef = ref(database, `rooms/${roomId}`);
    try {
      await set(roomRef, {
        room: JSON.parse(JSON.stringify(room)),
        game: null,
        lang,
      });
      console.log('[Krimi] Room created successfully');
    } catch (e) {
      console.error('[Krimi] Failed to create room:', e);
      throw e;
    }
    return roomId;
  }, []);

  const joinRoom = useCallback(async (roomId: string, name: string) => {
    const roomRef = ref(database, `rooms/${roomId}/room`);
    const snapshot = await get(roomRef);
    const currentRoom = snapshot.val();
    if (!currentRoom) throw new Error('Game not found');

    let room: RoomState<KrimiPlayerData>;
    try {
      room = deserializeRoom<KrimiPlayerData>(currentRoom);
    } catch {
      room = currentRoom as RoomState<KrimiPlayerData>;
    }

    if (room.status === 'started') {
      throw new Error('Game has already started');
    }

    const emptySlot = findFirstEmptySlot(room.players);
    if (!emptySlot) throw new Error('Room is full');

    const updated = joinPlayer(room, emptySlot.id, name);
    await set(ref(database, `rooms/${roomId}/room`), updated);
    return emptySlot.id;
  }, []);

  const setDetective = useCallback(async (playerOrderIndex: number) => {
    if (!roomState) return;
    await update(ref(database, `rooms/${roomState.roomId}/game`), {
      detective: playerOrderIndex,
    });
  }, [roomState]);

  const startTheGame = useCallback(async (detectiveIndex: number) => {
    if (!roomState) return;
    const roomId = roomState.roomId;

    // Transition room to started
    const started = startGameRoom(roomState);
    await set(ref(database, `rooms/${roomId}/room`), started);

    // Build player order from ready players
    const readyPlayers = roomState.players.filter((p) => p.status === 'ready');
    const playerOrder = readyPlayers.map((p) => p.id);
    const playerNames: Record<number, string> = {};
    readyPlayers.forEach((p) => {
      playerNames[p.id] = p.name || `Player ${p.id}`;
    });

    // Get language from Firebase
    const langSnap = await get(ref(database, `rooms/${roomId}/lang`));
    const lang = (langSnap.val() as 'en' | 'pt_br') || 'en';

    // Distribute cards
    const cards = distributeCards(playerOrder.length, lang);
    const murdererIndex = chooseRandomMurderer(playerOrder, detectiveIndex);

    const newGameState: KrimiGameState = {
      started: true,
      playerOrder,
      playerNames,
      detective: detectiveIndex,
      murderer: murdererIndex,
      means: cards.means,
      clues: cards.clues,
      analysis: cards.analysis,
      round: 1,
      availableClues: 6,
      finished: false,
      lang,
    };

    await set(ref(database, `rooms/${roomId}/game`), newGameState);
  }, [roomState]);

  const setMurdererChoice = useCallback(async (choice: { mean: string; key: string }) => {
    if (!roomState) return;
    await update(ref(database, `rooms/${roomState.roomId}/game`), {
      murdererChoice: choice,
    });
  }, [roomState]);

  const submitPick = useCallback(async (playerOrderIndex: number, pick: { mean: string; key: string }) => {
    if (!roomState) return;
    const roomId = roomState.roomId;

    // Step 1: write this player's pick.
    await set(
      ref(database, `rooms/${roomId}/game/playerPicks/${playerOrderIndex}`),
      pick
    );

    // Step 2: re-read game state. If all non-forensic players have picked
    // and murdererChoice isn't set yet, finalize it from the drawn murderer's
    // pick. Idempotent: concurrent last-submitters write identical data.
    const snap = await get(ref(database, `rooms/${roomId}/game`));
    const latest = snap.val() as KrimiGameState | null;
    if (!latest) return;

    const picks = latest.playerPicks || {};
    const expectedPicks = latest.playerOrder.length - 1;
    const allPicked = Object.keys(picks).length === expectedPicks;
    if (allPicked && !latest.murdererChoice) {
      const murdererPick = picks[latest.murderer];
      if (murdererPick) {
        await update(ref(database, `rooms/${roomId}/game`), {
          murdererChoice: murdererPick,
        });
      }
    }
  }, [roomState]);

  const setAnalysis = useCallback(async (forensicAnalysis: string[]) => {
    if (!roomState) return;
    await update(ref(database, `rooms/${roomState.roomId}/game`), {
      forensicAnalysis,
    });
  }, [roomState]);

  const checkEndGame = useCallback(async (
    currentGame: KrimiGameState,
    roomId: string
  ) => {
    const playerCount = currentGame.playerOrder.length;
    const validGuesses = currentGame.guesses
      ? currentGame.guesses.filter((item): item is GuessData => !!item && typeof item === 'object' && 'key' in item)
      : [];
    const playersPassed = currentGame.passedTurns
      ? currentGame.passedTurns.filter((item) => item === true)
      : [];

    // Check if detectives win
    if (
      currentGame.murdererChoice &&
      validGuesses.some(
        (g) =>
          g.mean === currentGame.murdererChoice!.mean &&
          g.key === currentGame.murdererChoice!.key
      )
    ) {
      await update(ref(database, `rooms/${roomId}/game`), {
        finished: true,
        winner: 'detectives',
      });
      return;
    }

    // Check if murderer wins (all non-murderer players guessed wrong)
    if (validGuesses.length === playerCount - 1) {
      await update(ref(database, `rooms/${roomId}/game`), {
        finished: true,
        winner: 'murderer',
      });
      return;
    }

    // Check if round 3 ends
    if (
      currentGame.round === 3 &&
      validGuesses.length + playersPassed.length === playerCount - 1
    ) {
      await update(ref(database, `rooms/${roomId}/game`), {
        finished: true,
        winner: 'murderer',
      });
      return;
    }

    // Check round advancement
    const allActed = validGuesses.length + playersPassed.length === playerCount - 1;
    if (allActed) {
      await update(ref(database, `rooms/${roomId}/game`), {
        passedTurns: new Array(playerCount).fill(false),
        availableClues: currentGame.availableClues + 1,
        round: currentGame.round + 1,
      });
    }
  }, []);

  const passTurn = useCallback(async (playerOrderIndex: number) => {
    if (!roomState || !gameState) return;
    const roomId = roomState.roomId;
    const playerCount = gameState.playerOrder.length;
    const turnsArray = gameState.passedTurns || new Array(playerCount).fill(false);
    const newTurns = [...turnsArray];
    newTurns[playerOrderIndex] = true;

    await update(ref(database, `rooms/${roomId}/game`), {
      passedTurns: newTurns,
    });

    // Re-read game state for check
    const snap = await get(ref(database, `rooms/${roomId}/game`));
    const latest = snap.val() as KrimiGameState;
    await checkEndGame(latest, roomId);
  }, [roomState, gameState, checkEndGame]);

  const makeGuess = useCallback(async (playerOrderIndex: number, guess: GuessData) => {
    if (!roomState || !gameState) return;
    const roomId = roomState.roomId;
    const playerCount = gameState.playerOrder.length;
    const guessesArray = gameState.guesses || new Array(playerCount).fill(false);
    const newGuesses = [...guessesArray];
    newGuesses[playerOrderIndex] = guess;

    await update(ref(database, `rooms/${roomId}/game`), {
      guesses: newGuesses,
    });

    const snap = await get(ref(database, `rooms/${roomId}/game`));
    const latest = snap.val() as KrimiGameState;
    await checkEndGame(latest, roomId);
  }, [roomState, gameState, checkEndGame]);

  return (
    <GameContext.Provider
      value={{
        roomState,
        gameState,
        loading,
        createRoom,
        loadRoom,
        joinRoom,
        setDetective,
        startTheGame,
        setMurdererChoice,
        submitPick,
        setAnalysis,
        passTurn,
        makeGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
