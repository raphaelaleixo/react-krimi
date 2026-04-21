# Hidden Murderer Pick Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the murderer's identity at game start by having every non-forensic player pick a mean + clue from their hand ("as if you were the murderer") in parallel. The real murderer is drawn at `startTheGame` as today, but their identity — and everyone else's role — is gated behind a "roles revealed" derived flag that flips once the last pick lands. The drawn player's pick becomes the locked `murdererChoice`.

**Architecture:** One new `playerPicks` field on `KrimiGameState` keyed by `playerOrderIndex`. A new `submitPick(playerOrderIndex, pick)` action on `GameContext` replaces `setMurdererChoice`. A small derived helper `isRolesRevealed(gameState)` gates UI in two places (`Player.tsx` routing + `ForensicAnalysis.tsx`). A new `PickPhase` component is rendered for non-forensic players pre-reveal, lifting the chip-picker UI from the soon-to-be-deleted `MurdererChoice`. `Detective.tsx` no longer embeds `MurdererChoice` — when the murderer opens their role drawer post-reveal, it shows the locked pick as read-only chips read directly from `murdererChoice`.

**Tech Stack:** TypeScript, React 19, MUI 9, Firebase Realtime Database (`firebase/database`), react-gameroom.

**Testing note:** No test runner is configured in this project (see `CLAUDE.md`). Verification per task leans on `npx tsc -b --noEmit` (type-check) and `npm run lint`. A final manual walkthrough with `npm run dev` + multiple browser tabs at the end covers end-to-end behaviour.

**Reference spec:** `docs/superpowers/specs/2026-04-21-hidden-murderer-pick-design.md`

---

## File Structure

**Create:**
- `src/components/PickPhase.tsx` — renders the mean + clue chip picker for a non-forensic player during the pick phase; after submit, renders a "waiting for others" state.

**Modify:**
- `src/types.ts` — add `playerPicks?: Record<number, { mean: string; key: string }>` to `KrimiGameState`.
- `src/utils/rules.ts` — add `isRolesRevealed(gameState)` helper.
- `src/contexts/GameContext.tsx` — add `submitPick` action; remove `setMurdererChoice` in the cleanup task.
- `src/pages/Player.tsx` — route non-forensic players to `PickPhase` until `isRolesRevealed(gameState)` is true.
- `src/components/ForensicAnalysis.tsx` — replace the "waiting for the murderer" copy with "waiting for all players to submit their picks"; hide "The murderer is: X" until `isRolesRevealed`.
- `src/components/Detective.tsx` — remove the `MurdererChoice` import and its render; replace with a read-only display of `gameState.murdererChoice` for the murderer.
- `src/pages/MockBoard.tsx` — replace `setMurdererChoice: NOOP` with `submitPick: NOOP` and add a `playerPicks` field matching `murdererChoice` so the mock continues to render a post-reveal state.
- `src/i18n/translations.ts` — add four new strings (pick-phase prompt, submit label, waiting label, locked-pick label) and update/remove the `MurdererChoice` block.

**Delete:**
- `src/components/MurdererChoice.tsx`

---

## Task 1: Add `playerPicks` to game state type

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add the field**

Open `src/types.ts`. Add a new optional field to `KrimiGameState`, placed immediately after `murdererChoice?`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: No errors. (Adding an optional field can't break anything.)

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat(types): add playerPicks to KrimiGameState"
```

---

## Task 2: Add `isRolesRevealed` helper to rules.ts

**Files:**
- Modify: `src/utils/rules.ts`

- [ ] **Step 1: Add the helper**

Open `src/utils/rules.ts`. Add this at the bottom of the file (below `checkGuess`):

```ts
import type { KrimiGameState } from '../types';

export function isRolesRevealed(gameState: KrimiGameState): boolean {
  if (!gameState.playerPicks) return false;
  const pickCount = Object.keys(gameState.playerPicks).length;
  const expectedPicks = gameState.playerOrder.length - 1; // forensic doesn't pick
  return pickCount >= expectedPicks;
}
```

Note: the `import type { KrimiGameState }` line goes with the other imports at the top of the file, not at the bottom. Move it there.

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: No errors.

Run: `npm run lint`
Expected: No new errors introduced.

- [ ] **Step 3: Commit**

```bash
git add src/utils/rules.ts
git commit -m "feat(rules): add isRolesRevealed helper"
```

---

## Task 3: Add `submitPick` action to GameContext

**Files:**
- Modify: `src/contexts/GameContext.tsx`

In this task we **add** `submitPick` alongside the existing `setMurdererChoice`. Removing `setMurdererChoice` happens in Task 9 after all its callers are migrated, so the codebase continues to type-check between tasks.

- [ ] **Step 1: Add `submitPick` to the context value interface**

Find the `GameContextValue` interface (around line 30). Add `submitPick` immediately after `setMurdererChoice`:

```ts
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
```

- [ ] **Step 2: Implement `submitPick`**

Find the existing `setMurdererChoice` implementation (around line 194). Add the `submitPick` implementation immediately after it:

```ts
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
    const allPicked = Object.keys(picks).length >= expectedPicks;
    if (allPicked && !latest.murdererChoice) {
      const murdererPick = picks[latest.murderer];
      if (murdererPick) {
        await update(ref(database, `rooms/${roomId}/game`), {
          murdererChoice: murdererPick,
        });
      }
    }
  }, [roomState]);
```

- [ ] **Step 3: Add `submitPick` to the provider value**

Find the `<GameContext.Provider value={{ ... }}>` block near the bottom of the file (around line 304). Add `submitPick` to the value object, immediately after `setMurdererChoice`:

```tsx
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
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit`
Expected: `MockBoard.tsx` errors with something like *"Property 'submitPick' is missing in type..."* — that's fine; Task 9 fixes it. **The rest of the codebase must type-check cleanly.**

If any file other than `MockBoard.tsx` complains, stop and investigate.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/GameContext.tsx
git commit -m "feat(context): add submitPick action for hidden-murderer flow"
```

---

## Task 4: Add new i18n strings

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add new strings and update the forensic waiting string**

Open `src/i18n/translations.ts`.

Replace the existing block:

```ts
  // MurdererChoice
  'Select your means of murder:': 'Selecione sua causa de morte:',
  'Select your key evidence:': 'Selecione sua evidência principal:',
  'Send choice': 'Enviar escolha',

  // ForensicAnalysis
  'Waiting for the murderer to choose...': 'Esperando o assassino escolher...',
```

With:

```ts
  // PickPhase
  'If you were the murderer, which cards would you want found at the scene?':
    'Se você fosse o assassino, quais cartas você gostaria que fossem encontradas na cena do crime?',
  'Select your means of murder:': 'Selecione sua causa de morte:',
  'Select your key evidence:': 'Selecione sua evidência principal:',
  'Submit pick': 'Enviar escolha',
  'Waiting for other players to submit their picks...':
    'Esperando os outros jogadores enviarem suas escolhas...',
  'Your locked pick': 'Sua escolha (travada)',

  // ForensicAnalysis
  'Waiting for all players to submit their picks...':
    'Esperando todos os jogadores enviarem suas escolhas...',
```

Note: `'Select your means of murder:'` and `'Select your key evidence:'` are kept (reused by `PickPhase`). `'Send choice'` is removed and replaced with `'Submit pick'` — `MurdererChoice` (which used `'Send choice'`) is deleted in Task 9.

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: Same state as after Task 3 — only `MockBoard.tsx` fails.

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat(i18n): translations for pick phase"
```

---

## Task 5: Create the `PickPhase` component

**Files:**
- Create: `src/components/PickPhase.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/PickPhase.tsx` with this exact content:

```tsx
import { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiGameState } from '../types';

interface PickPhaseProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function PickPhase({ gameState, playerId, playerOrderIndex }: PickPhaseProps) {
  const { submitPick } = useGame();
  const { t } = useI18n();

  const existingPick = gameState.playerPicks?.[playerOrderIndex];

  const [selectedMean, setSelectedMean] = useState<string | null>(
    existingPick?.mean ?? null
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    existingPick?.key ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  const submitted = !!existingPick;

  const playerMeans = gameState.means.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );
  const playerClues = gameState.clues.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4
  );

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  const handleSubmit = async () => {
    if (!selectedMean || !selectedKey) return;
    setSubmitting(true);
    try {
      await submitPick(playerOrderIndex, { mean: selectedMean, key: selectedKey });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ mx: 'auto' }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            {playerName}
          </Typography>
          <Card>
            <CardContent>
              {submitted ? (
                <Typography variant="body1">
                  {t('Waiting for other players to submit their picks...')}
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {t('If you were the murderer, which cards would you want found at the scene?')}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('Select your means of murder:')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {playerMeans.map((mean) => (
                      <Chip
                        key={mean}
                        label={mean}
                        size="small"
                        icon={selectedMean === mean ? <CheckIcon /> : undefined}
                        onClick={() => setSelectedMean(mean)}
                        sx={{
                          bgcolor: selectedMean === mean ? '#90caf9' : '#bbdefb',
                          opacity: 1,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('Select your key evidence:')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {playerClues.map((clue) => (
                      <Chip
                        key={clue}
                        label={clue}
                        size="small"
                        icon={selectedKey === clue ? <CheckIcon /> : undefined}
                        onClick={() => setSelectedKey(clue)}
                        sx={{
                          bgcolor: selectedKey === clue ? '#ef9a9a' : '#ffcdd2',
                          opacity: 1,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Box>

                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!selectedMean || !selectedKey || submitting}
                  >
                    {t('Submit pick')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: Same state as after Task 3 (only `MockBoard.tsx` fails). `PickPhase.tsx` itself must compile cleanly.

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PickPhase.tsx
git commit -m "feat(components): add PickPhase component for hidden-murderer flow"
```

---

## Task 6: Route non-forensic players to `PickPhase` pre-reveal

**Files:**
- Modify: `src/pages/Player.tsx`

- [ ] **Step 1: Update imports**

In `src/pages/Player.tsx`, add these imports alongside the existing component imports:

```tsx
import PickPhase from '../components/PickPhase';
import { isRolesRevealed } from '../utils/rules';
```

- [ ] **Step 2: Update `renderStarted`**

Replace the existing `renderStarted` render function (around lines 71–79) with:

```tsx
      renderStarted={() => {
        if (!gameState) return null;
        const playerOrderIndex = gameState.playerOrder.indexOf(playerId);
        if (playerOrderIndex === -1) return notFound;
        if (playerOrderIndex === gameState.detective) {
          return <ForensicAnalysis gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
        }
        if (!isRolesRevealed(gameState)) {
          return <PickPhase gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
        }
        return <Detective gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
      }}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: Same state as after Task 3 (only `MockBoard.tsx` fails).

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Player.tsx
git commit -m "feat(player): route non-forensic to PickPhase pre-reveal"
```

---

## Task 7: Hide murderer identity in `ForensicAnalysis` pre-reveal

**Files:**
- Modify: `src/components/ForensicAnalysis.tsx`

The forensic's screen currently shows "The murderer is: **X**" immediately on mount, and "Waiting for the murderer to choose..." while the old `MurdererChoice` hasn't submitted. Under the new flow, both should be gated on `isRolesRevealed(gameState)`.

- [ ] **Step 1: Add the helper import**

Near the top of `src/components/ForensicAnalysis.tsx`, add:

```tsx
import { isRolesRevealed } from '../utils/rules';
```

- [ ] **Step 2: Replace the murderer-identity card**

Find the block inside `<Grid size={{ xs: 12, md: 6 }}>` that conditionally renders the card with the murderer's name. It currently has two branches: one for `!gameState.murdererChoice` (waiting) and one for the post-choice display. Replace the entire block (currently lines 64–103 approximately) with:

```tsx
          {!isRolesRevealed(gameState) ? (
            <Card>
              <CardContent>
                <Typography variant="body1">
                  {t('Waiting for all players to submit their picks...')}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('The murderer is')}: <strong>{murderer.name}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('Means of murder:')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={gameState.murdererChoice?.mean ?? ''}
                    size="small"
                    sx={{ bgcolor: '#bbdefb' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('Key evidence:')}
                </Typography>
                <Box>
                  <Chip
                    label={gameState.murdererChoice?.key ?? ''}
                    size="small"
                    sx={{ bgcolor: '#ffcdd2' }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
```

Rationale: when `isRolesRevealed` is true, `murdererChoice` is guaranteed by `submitPick` to have been written in the same flow — but the optional chaining keeps us safe during the one-tick gap between the last pick landing and the `murdererChoice` update committing.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: Same state as after Task 3 (only `MockBoard.tsx` fails).

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ForensicAnalysis.tsx
git commit -m "feat(forensic): hide murderer identity until all picks submitted"
```

---

## Task 8: Simplify `Detective.tsx` — show locked pick instead of MurdererChoice picker

**Files:**
- Modify: `src/components/Detective.tsx`

Because `Player.tsx` now routes to `PickPhase` pre-reveal, `Detective.tsx` is only rendered post-reveal. The role drawer no longer needs to launch a picker — the pick is already locked. For the murderer, the drawer should display the locked pick as read-only chips.

- [ ] **Step 1: Remove the `MurdererChoice` import**

Remove the line:

```tsx
import MurdererChoice from './MurdererChoice';
```

from the top of `src/components/Detective.tsx`.

- [ ] **Step 2: Replace the `<MurdererChoice ... />` render in the role drawer**

Find the role-reveal drawer section (around lines 118–146). Replace the `{isMurderer && ( <MurdererChoice ... /> )}` block with a read-only display of the locked pick:

```tsx
            {isMurderer && gameState.murdererChoice && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('Your locked pick')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    label={gameState.murdererChoice.mean}
                    size="small"
                    sx={{ bgcolor: '#bbdefb' }}
                  />
                  <Chip
                    label={gameState.murdererChoice.key}
                    size="small"
                    sx={{ bgcolor: '#ffcdd2' }}
                  />
                </Box>
              </Box>
            )}
```

`Box`, `Typography`, and `Chip` are already imported in this file; no new imports are needed.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: Same state as after Task 3 (only `MockBoard.tsx` fails).

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Detective.tsx
git commit -m "feat(detective): show locked pick read-only instead of MurdererChoice picker"
```

---

## Task 9: Cleanup — delete `MurdererChoice`, remove `setMurdererChoice`, fix `MockBoard`

**Files:**
- Delete: `src/components/MurdererChoice.tsx`
- Modify: `src/contexts/GameContext.tsx`
- Modify: `src/pages/MockBoard.tsx`

This is the task that makes the codebase type-check cleanly again.

- [ ] **Step 1: Delete `MurdererChoice.tsx`**

```bash
rm src/components/MurdererChoice.tsx
```

- [ ] **Step 2: Remove `setMurdererChoice` from `GameContext.tsx`**

In `src/contexts/GameContext.tsx`:

a. Remove this line from the `GameContextValue` interface:

```ts
  setMurdererChoice: (choice: { mean: string; key: string }) => Promise<void>;
```

b. Remove the `setMurdererChoice` useCallback block (originally around lines 194–199):

```ts
  const setMurdererChoice = useCallback(async (choice: { mean: string; key: string }) => {
    if (!roomState) return;
    await update(ref(database, `rooms/${roomState.roomId}/game`), {
      murdererChoice: choice,
    });
  }, [roomState]);
```

c. Remove `setMurdererChoice,` from the provider value object near the bottom of the file.

- [ ] **Step 3: Update `MockBoard.tsx`**

In `src/pages/MockBoard.tsx`:

a. In the `MOCK_GAME_STATE` constant, add a `playerPicks` field after `murdererChoice`. Insert this line:

```ts
  playerPicks: {
    // Post-reveal mock state: populated so isRolesRevealed() returns true.
    // Only the murderer's pick is meaningful; others are decoys.
    1: { mean: 'Pistol', key: 'Herbal medicine' },
    2: { mean: 'Surgery', key: 'Handcuffs' },
    3: { mean: 'Sulfuric Acid', key: 'Glasses' }, // matches murdererChoice
    4: { mean: 'Rope', key: 'Feather' },
    5: { mean: 'Brick', key: 'Notebook' },
    6: { mean: 'Knife', key: 'Perfume' },
    7: { mean: 'Ice Pick', key: 'Tape' },
    8: { mean: 'Syringe', key: 'Glove' },
    9: { mean: 'Revolver', key: 'Battery' },
    10: { mean: 'Dynamite', key: 'Umbrella' },
    11: { mean: 'Taser', key: 'Lighter' },
  },
```

This is immediately after `murdererChoice: { mean: 'Sulfuric Acid', key: 'Glasses' },` and before `round: 2,`.

Note: `playerPicks` is keyed by `playerOrderIndex`, not player id. `playerOrder = [1, 2, 3, ..., 12]`, so index 0 is player 1 (Hercule Poirot, the forensic — excluded). Indexes 1–11 correspond to players 2–12 (11 non-forensic players). Index 3 is the murderer's pick, which must equal `murdererChoice`.

b. In the `GameContext.Provider value={{ ... }}` object (around lines 152–166), replace `setMurdererChoice: NOOP,` with `submitPick: NOOP,`:

```tsx
      value={{
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
      }}
```

Note: `NOOP` is typed `async () => {}` — TypeScript will widen it to match `submitPick`'s signature `(playerOrderIndex: number, pick: {...}) => Promise<void>` via structural matching. If the compiler complains about arity, change `NOOP` to `NOOP as never` only for `submitPick`, or write a dedicated noop with the right arity: `submitPick: async () => {}`. Leave `NOOP` alone for the others.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: **Clean. No errors anywhere.**

Run: `npm run lint`
Expected: No errors.

Run: `npm run build`
Expected: Build succeeds.

If any errors remain, investigate before proceeding — something upstream was missed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove setMurdererChoice and MurdererChoice in favor of submitPick"
```

---

## Task 10: Manual verification in the browser

**Files:** None modified. Manual testing only.

This task has no code. Run the dev server and walk through the full flow with multiple browser tabs.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the URL it prints (typically `http://localhost:5173`).

- [ ] **Step 2: Set up a 5-player game**

In one tab ("host"): create a new game, note the room code.

In four separate tabs (use incognito windows or different profiles for isolation): navigate to Join, enter the room code, enter distinct names. This gives 5 players total (including host — confirm the lobby shows 5 ready players).

Pick one player as the detective/forensic via the host's lobby UI, then start the game.

- [ ] **Step 3: Verify pre-reveal state**

Check every non-forensic player's tab:
- Expected: each sees the `PickPhase` screen (title with their name, prompt "If you were the murderer, which cards would you want found at the scene?", two rows of 4 chips, a disabled "Submit pick" button).
- Not expected: no player sees "You are the murderer" or "You are an investigator" or any role reveal drawer.

Check the forensic's tab:
- Expected: sees "Waiting for all players to submit their picks..." card.
- Not expected: no "The murderer is: X" line.

- [ ] **Step 4: Submit picks one at a time**

In each non-forensic tab, select a mean chip, select a clue chip, click "Submit pick".

After each non-final submission:
- That player's screen switches to "Waiting for other players to submit their picks..."
- Other players' screens do **not** change.
- Forensic's screen does **not** change.

On the last submission, all three things should flip within a second or two:
- Every non-forensic player's screen transitions to their `Detective` component (card with their name + chips + Role/Pass/Solve buttons).
- Forensic's screen transitions to the "The murderer is: **X**" card with the locked mean and clue chips.
- Board view (host tab) shows the normal in-progress game state.

- [ ] **Step 5: Verify role reveal**

In the player tab whose name appears as the murderer on the forensic's screen:
- Click the "Role" button to open the drawer.
- Expected: "You are the murderer" + "Your locked pick" section with the two chips matching what the forensic shows.

In any other non-forensic player tab:
- Click "Role".
- Expected: "You are a detective". No locked pick section.

- [ ] **Step 6: Verify the rest of the game is unaffected**

As the forensic, pick analysis categories and submit. As investigators, try passing turns and solving. Confirm that guesses work and the end-game banner appears as before. Nothing downstream should have regressed.

- [ ] **Step 7: Reload test**

In one non-forensic tab that has already submitted, hit reload. Expected: the "Waiting for other players..." state is restored (pick is persisted in Firebase as `playerPicks[orderIndex]`).

In one non-forensic tab that has NOT yet submitted, select a mean (but not a clue), then hit reload. Expected: selection is lost (local state), user re-selects — this is the accepted trade-off documented in the spec.

- [ ] **Step 8: If anything fails, stop and report**

If any step produces unexpected behavior, do not continue. Report the failure with screenshots or console errors. If everything passes, the implementation is complete.
