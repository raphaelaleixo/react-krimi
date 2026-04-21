# Player Screens Corkboard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `PickPhase` and the `Detective` my-hand view into the existing corkboard visual language, adding a reusable `PlayerFolder` component for the player's own dossier and a `RoleCard` component for noir-style role display.

**Architecture:** Two new presentational components (`PlayerFolder`, `RoleCard`) live in `src/components/board/` alongside the existing corkboard family. `PickPhase` and `Detective` each get rewritten around `CorkBoard` + the new components + existing primitives (`Pushpin`, `WaitingNote`, `StampButton`). No changes to `GameContext`, Firebase state, routing, or game rules. `ForensicAnalysis` and the `Detective` solve drawer are explicitly untouched — they are tracked as follow-ups in `docs/superpowers/specs/2026-04-21-player-screens-redesign-deferred.md`.

**Tech Stack:** React 19, TypeScript, MUI 9, `motion/react` (for entrance animations), Emotion (via MUI's `sx`). No test runner is configured in this repo — verification is manual via `npm run dev`, `npm run build`, and the browser.

**Spec:** `docs/superpowers/specs/2026-04-21-player-screens-redesign-design.md`

---

## Prerequisites

Before starting, verify this one item:

- [ ] **`WaitingNote` exists at `src/components/board/WaitingNote.tsx`.** The user may have this as an uncommitted rename of the former `LobbyWaitingNote`. Run `git status` — if the rename is still pending, ask the user to commit it first. Tasks below import from `./board/WaitingNote`.

---

## Task 1: Add new translation keys

**Files:**
- Modify: `src/i18n/translations.ts`

New keys are needed for the `SUBMITTED` stamp label and the `RoleCard` captions. English strings are the keys (per existing convention); Portuguese values are added in the same map.

- [ ] **Step 1: Add the three new translation keys**

Open `src/i18n/translations.ts`. Find the last entry before the closing `}` (currently under the `Lobby loading state` comment). Append the following block immediately after `'We can start the game now': 'Podemos começar o jogo',`:

```ts
  // Player screens redesign — added 2026-04-21
  'SUBMITTED': 'ENVIADO',
  'Private Detective': 'Detetive Particular',
  'The Murderer': 'O Assassino',
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS — TypeScript compiles and Vite builds without errors. (`npm run build` runs `tsc -b` before Vite; a failure here means a typo or trailing-comma issue in the map.)

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat(i18n): add keys for player screens redesign"
```

---

## Task 2: Create the `PlayerFolder` component

**Files:**
- Create: `src/components/board/PlayerFolder.tsx`

A new presentational component — the player's own opened manila folder showing their 4 means + 4 clues. Used in two modes: `select` (tapping draws a red marker circle around the chosen line, calls `onSelectMean` / `onSelectKey`) and `display` (read-only). Accepts an optional stamp overlay (e.g. "SUBMITTED" or "Passed"). Visual language reuses what `PlayerFile` (the board-side torn-paper tile) already establishes: notebook-paper background, torn bottom edge, highlighter-marked lines for means (weapon color) and clues (evidence color), and a rubber-stamp overlay pattern.

Verification for this task is a typecheck only — the component is rendered visually for the first time in Task 3.

- [ ] **Step 1: Create the file with the full component**

Create `src/components/board/PlayerFolder.tsx` with the following contents:

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { formatDisplayName } from '../../utils/formatDisplayName';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 30;
  points.push('100% 97%');
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 97 + Math.random() * 2;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export interface PlayerFolderProps {
  playerName: string;
  means: string[];
  clues: string[];
  mode: 'select' | 'display';
  selectedMean?: string | null;
  selectedKey?: string | null;
  onSelectMean?: (mean: string) => void;
  onSelectKey?: (key: string) => void;
  stamp?: string | null;
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function PlayerFolder({
  playerName,
  means,
  clues,
  mode,
  selectedMean,
  selectedKey,
  onSelectMean,
  onSelectKey,
  stamp,
}: PlayerFolderProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);
  const isSelect = mode === 'select';

  const renderLine = (
    text: string,
    kind: 'mean' | 'clue',
    isSelected: boolean,
  ) => {
    const color = kind === 'mean' ? WEAPON_COLOR : EVIDENCE_COLOR;
    const handleClick = () => {
      if (!isSelect) return;
      if (kind === 'mean') onSelectMean?.(text);
      else onSelectKey?.(text);
    };
    return (
      <Box
        key={`${kind}-${text}`}
        component={isSelect ? 'button' : 'div'}
        onClick={handleClick}
        disabled={!isSelect || undefined}
        sx={{
          position: 'relative',
          display: 'inline-block',
          alignSelf: 'flex-start',
          border: 'none',
          background: 'transparent',
          p: 0,
          m: 0,
          mb: 0.5,
          cursor: isSelect ? 'pointer' : 'default',
          font: 'inherit',
          textAlign: 'left',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1.4,
            px: 0.5,
            background: `linear-gradient(color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 20%, transparent)) no-repeat`,
            backgroundSize: '100% 85%',
            backgroundPosition: '0 60%',
          }}
        >
          {text}
        </Typography>
        {isSelected && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: '-15%',
              left: '-8%',
              width: '116%',
              height: '130%',
              pointerEvents: 'none',
              border: '2.5px solid var(--evidence-color)',
              borderRadius: '55% 45% 52% 48% / 60% 40% 60% 40%',
              transform: 'rotate(-2deg)',
              opacity: 0.85,
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, mx: 'auto' }}>
      <Pushpin />
      <Box
        sx={{
          background: `#f8f6f0 repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px) 0 36px`,
          px: 2.5,
          pt: 2,
          pb: 4,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
          position: 'relative',
          borderLeft: '2px solid rgba(220, 80, 80, 0.3)',
          clipPath: tornEdge,
        }}
      >
        <Typography
          title={playerName}
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            mb: 1.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatDisplayName(playerName)}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {means.map((m) => renderLine(m, 'mean', selectedMean === m))}
          {clues.map((c) => renderLine(c, 'clue', selectedKey === c))}
        </Box>

        {stamp && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              zIndex: 2,
              border: '3px solid rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              px: 1.5,
              py: 0.5,
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'rgba(0, 0, 0, 0.35)',
                letterSpacing: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {stamp}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
```

Notes on the implementation:
- The red marker circle uses an irregular `border-radius` to simulate a hand-drawn oval, plus a slight rotation. It lives as an absolutely-positioned overlay on top of the line. This is the spec's internal `RedMarkerCircle` detail; kept as an inline overlay (no separate component) to match the component's small surface.
- `generateTornEdge` is copied from `PlayerFile`. The folder uses a slightly shallower torn percentage (`97%` vs `95%`) because the folder is larger and the tear would otherwise cover too much of the last clue line.
- Select-mode lines are rendered as `<button>`s (via `component="button"` on `Box`) so they are keyboard-focusable and screen-readable as interactive. Display-mode renders them as plain `<div>`s.
- Stamp visual is identical to `PlayerFile`'s rubber-stamp overlay so a "Passed" stamp in `Detective` matches the host board's "Passed" stamp on the same player.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS. If TypeScript complains about `component="button"` with `disabled`, confirm MUI's `Box` polymorphism is accepted — the repo already uses this pattern on other buttons. If a stricter error comes up, cast with `component={'button' as const}`.

- [ ] **Step 3: Commit**

```bash
git add src/components/board/PlayerFolder.tsx
git commit -m "feat(board): add PlayerFolder component"
```

---

## Task 3: Rewrite `PickPhase` around the corkboard language

**Files:**
- Modify: `src/components/PickPhase.tsx` (full rewrite)

The current `PickPhase` uses MUI `Container` + `Card` + `Chip` + `Button`. The rewrite replaces that shell with `CorkBoard` + a pinned prompt note + `PlayerFolder` in select mode + a `StampButton` submit action. Post-submit, the stamp-button swaps for a `WaitingNote` and the folder gets a `'SUBMITTED'` stamp overlay. Firebase behavior (the `submitPick` call and `existingPick` read) is unchanged.

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/PickPhase.tsx` with:

```tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import CorkBoard from './board/CorkBoard';
import PlayerFolder from './board/PlayerFolder';
import WaitingNote from './board/WaitingNote';
import Pushpin from './board/Pushpin';
import StampButton from './board/StampButton';
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
    existingPick?.mean ?? null,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    existingPick?.key ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const submitted = !!existingPick;

  const playerMeans = gameState.means.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4,
  );
  const playerClues = gameState.clues.slice(
    playerOrderIndex * 4,
    playerOrderIndex * 4 + 4,
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
    <CorkBoard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          px: 2,
          py: 5,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            bgcolor: '#f8f6f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            px: 3,
            py: 2.5,
          }}
        >
          <Pushpin color="#4a7c59" />
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1rem',
              lineHeight: 1.4,
              color: 'var(--text-color)',
              textAlign: 'center',
            }}
          >
            {t('If you were the murderer, which cards would you want found at the scene?')}
          </Typography>
        </Box>

        <PlayerFolder
          playerName={playerName}
          means={playerMeans}
          clues={playerClues}
          mode={submitted ? 'display' : 'select'}
          selectedMean={selectedMean}
          selectedKey={selectedKey}
          onSelectMean={setSelectedMean}
          onSelectKey={setSelectedKey}
          stamp={submitted ? t('SUBMITTED') : null}
        />

        {submitted ? (
          <WaitingNote
            subtitle={t('Waiting for other players to submit their picks...')}
          />
        ) : (
          <StampButton
            onClick={handleSubmit}
            disabled={!selectedMean || !selectedKey || submitting}
          >
            {t('Submit pick')}
          </StampButton>
        )}
      </Box>
    </CorkBoard>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`
Open two browser windows. In the first, create a new game (host view). Copy the room code and open `/join` in the second window to join with a player name. Add at least one more joiner (a third window or another device on the local network). Start the game.

On each player's device:
- The new `PickPhase` should render on the cork background.
- The prompt note should be pinned at the top with a green pushpin.
- The player's folder should show 4 means (blue highlighter) and 4 clues (red highlighter), with the player's name in script font at the top.
- Tapping a mean should draw a red marker circle around it; tapping a different mean should move the circle. Same for clues.
- The `Submit pick` stamp button should be disabled until both a mean and a clue are selected.
- After submitting: the folder should show a diagonal "SUBMITTED" stamp overlay, the selected lines should remain red-circled and no longer interactive, and a `WaitingNote` should appear in place of the submit button.
- On the host board, the same player's `PlayerFile` tile should show the existing "pick checkmark" affordance (unchanged behavior).

If any visual looks off (e.g. the folder is squished on phone widths, or the marker circle is mispositioned), note it and fix in place before committing. Do not claim the task complete without this browser verification.

- [ ] **Step 4: Commit**

```bash
git add src/components/PickPhase.tsx
git commit -m "feat(pick-phase): corkboard redesign with PlayerFolder"
```

---

## Task 4: Create the `RoleCard` component

**Files:**
- Create: `src/components/board/RoleCard.tsx`

A small off-white calling card pinned on the cork. Detective variant shows the player's name and the caption `Private Detective`. Murderer variant shows the same card plus a revealed lower section carrying the locked `mean` + `key` as highlighter-marked lines under a `The Murderer` caption. On first mount, the card drops in with the same spring motion used elsewhere on the board.

Like Task 2, verification is typecheck only — visual verification happens in Task 5 when `Detective` consumes it.

- [ ] **Step 1: Create the file with the full component**

Create `src/components/board/RoleCard.tsx` with the following contents:

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';
import { formatDisplayName } from '../../utils/formatDisplayName';

export interface RoleCardProps {
  playerName: string;
  role: 'detective' | 'murderer';
  lockedPick?: { mean: string; key: string };
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function RoleCard({ playerName, role, lockedPick }: RoleCardProps) {
  const { t } = useI18n();
  const isMurderer = role === 'murderer';

  return (
    <Box
      component={motion.div}
      initial={{ scale: 0.6, rotate: -8, opacity: 0, y: -20 }}
      animate={{ scale: 1, rotate: -2, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      sx={{
        position: 'relative',
        width: 260,
        mx: 'auto',
        bgcolor: '#f5efe0',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
        px: 3,
        py: 2.5,
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <Pushpin color={isMurderer ? EVIDENCE_COLOR : '#3a4b5c'} />

      <Typography
        title={playerName}
        sx={{
          fontFamily: 'var(--font-script)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-color)',
          lineHeight: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatDisplayName(playerName)}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center',
          color: isMurderer ? 'var(--evidence-color)' : 'var(--text-color)',
        }}
      >
        {isMurderer ? t('The Murderer') : t('Private Detective')}
      </Typography>

      {isMurderer && lockedPick && (
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: '1px dashed rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              color: 'var(--text-color)',
              mb: 0.5,
            }}
          >
            {t('Your locked pick')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              px: 0.5,
              background: `linear-gradient(color-mix(in srgb, ${WEAPON_COLOR} 20%, transparent), color-mix(in srgb, ${WEAPON_COLOR} 20%, transparent)) no-repeat`,
              backgroundSize: '100% 85%',
              backgroundPosition: '0 60%',
            }}
          >
            {lockedPick.mean}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              px: 0.5,
              background: `linear-gradient(color-mix(in srgb, ${EVIDENCE_COLOR} 20%, transparent), color-mix(in srgb, ${EVIDENCE_COLOR} 20%, transparent)) no-repeat`,
              backgroundSize: '100% 85%',
              backgroundPosition: '0 60%',
            }}
          >
            {lockedPick.key}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
```

Notes:
- The murderer variant uses a single card with a dashed separator rather than a second pinned element — keeps the cork less cluttered on phone viewports and matches the "same card, revealed reverse" interpretation in the spec.
- Pushpin color differs between variants (red evidence color for murderer, slate for detective) to reinforce the role without extra copy.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/board/RoleCard.tsx
git commit -m "feat(board): add RoleCard component"
```

---

## Task 5: Rewrite `Detective` my-hand view

**Files:**
- Modify: `src/components/Detective.tsx`

Replace the MUI Grid/Card shell with `CorkBoard` + `RoleCard` + `PlayerFolder` (display mode) + a pass button + a `StampButton` for solve. The role-reveal drawer (`roleSheet`) is removed entirely — role is now carried by the pinned `RoleCard`. The solve drawer (`solveSheet`) and all of its contents stay exactly as they are today; this task only changes what the `Solve` button looks like and where the `Role` button used to be.

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/Detective.tsx` with:

```tsx
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Container from '@mui/material/Container';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import CorkBoard from './board/CorkBoard';
import RoleCard from './board/RoleCard';
import PlayerFolder from './board/PlayerFolder';
import StampButton from './board/StampButton';
import type { KrimiGameState } from '../types';

interface DetectiveProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function Detective({ gameState, playerId, playerOrderIndex }: DetectiveProps) {
  const { passTurn, makeGuess } = useGame();
  const { t } = useI18n();
  const [solveSheet, setSolveSheet] = useState(false);
  const [guess, setGuess] = useState<{ player: number | null; mean: string | null; key: string | null }>({
    player: null,
    mean: null,
    key: null,
  });

  const isMurderer = playerOrderIndex === gameState.murderer;

  const disableActions = useMemo(() => {
    return (
      (gameState.passedTurns && gameState.passedTurns[playerOrderIndex]) ||
      (gameState.guesses && !!gameState.guesses[playerOrderIndex])
    );
  }, [gameState.passedTurns, gameState.guesses, playerOrderIndex]);

  const hasPassed = !!(gameState.passedTurns && gameState.passedTurns[playerOrderIndex]);

  // Other players (excluding detective and self) for guessing
  const otherPlayers = useMemo(() => {
    return gameState.playerOrder
      .map((pid, idx) => ({ id: pid, index: idx, name: gameState.playerNames[pid] }))
      .filter((p) => p.index !== gameState.detective && p.index !== playerOrderIndex);
  }, [gameState, playerOrderIndex]);

  const selectedPlayer = useMemo(() => {
    if (guess.player === null) return null;
    return otherPlayers.find((p) => p.index === guess.player) || null;
  }, [guess.player, otherPlayers]);

  const playerMeans = gameState.means.slice(playerOrderIndex * 4, playerOrderIndex * 4 + 4);
  const playerClues = gameState.clues.slice(playerOrderIndex * 4, playerOrderIndex * 4 + 4);

  const handlePassTurn = async () => {
    await passTurn(playerOrderIndex);
  };

  const handleSendGuess = async () => {
    if (guess.player === null || !guess.mean || !guess.key) return;
    await makeGuess(playerOrderIndex, {
      player: guess.player,
      mean: guess.mean,
      key: guess.key,
    });
    setSolveSheet(false);
  };

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  return (
    <CorkBoard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          px: 2,
          py: 4,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        <RoleCard
          playerName={playerName}
          role={isMurderer ? 'murderer' : 'detective'}
          lockedPick={isMurderer && gameState.murdererChoice ? gameState.murdererChoice : undefined}
        />

        <PlayerFolder
          playerName={playerName}
          means={playerMeans}
          clues={playerClues}
          mode="display"
          stamp={hasPassed ? t('Passed') : null}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <StampButton
            variant="text"
            onClick={handlePassTurn}
            disabled={!!disableActions}
          >
            {t('Pass turn')}
          </StampButton>
          <StampButton
            onClick={() => setSolveSheet(true)}
            disabled={!!disableActions}
          >
            {t('Solve')}
          </StampButton>
        </Box>
      </Box>

      {/* Solve crime drawer — unchanged from previous implementation */}
      <SwipeableDrawer
        anchor="bottom"
        open={solveSheet}
        onClose={() => setSolveSheet(false)}
        onOpen={() => setSolveSheet(true)}
      >
        <Box sx={{ height: 500, textAlign: 'center', overflowY: 'auto' }}>
          <Container>
            <Button
              variant="contained"
              sx={{ mt: 6 }}
              onClick={() => setSolveSheet(false)}
            >
              {t('close')}
            </Button>
            <Typography variant="h5" sx={{ mt: 4 }}>
              {t('Solve the crime')}
            </Typography>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography>{t('Who is the murderer?')}</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>{t('Who is the murderer?')}</InputLabel>
                  <Select
                    value={guess.player ?? ''}
                    onChange={(e) =>
                      setGuess({ ...guess, player: e.target.value as number, mean: null, key: null })
                    }
                    label={t('Who is the murderer?')}
                  >
                    {otherPlayers.map((p) => (
                      <MenuItem key={p.id} value={p.index}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedPlayer && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                        {t('Select the means of murder:')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {gameState.means
                          .slice(selectedPlayer.index * 4, selectedPlayer.index * 4 + 4)
                          .map((mean) => (
                            <Chip
                              key={mean}
                              label={mean}
                              size="small"
                              icon={guess.mean === mean ? <CheckIcon /> : undefined}
                              onClick={() => setGuess({ ...guess, mean })}
                              sx={{
                                bgcolor: guess.mean === mean ? '#90caf9' : '#bbdefb',
                                opacity: 1,
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                        {t('Select the key evidence:')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {gameState.clues
                          .slice(selectedPlayer.index * 4, selectedPlayer.index * 4 + 4)
                          .map((clue) => (
                            <Chip
                              key={clue}
                              label={clue}
                              size="small"
                              icon={guess.key === clue ? <CheckIcon /> : undefined}
                              onClick={() => setGuess({ ...guess, key: clue })}
                              sx={{
                                bgcolor: guess.key === clue ? '#ef9a9a' : '#ffcdd2',
                                opacity: 1,
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                      </Box>
                    </Grid>
                  </Grid>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    onClick={handleSendGuess}
                    variant="contained"
                    disabled={!guess.player || !guess.mean || !guess.key}
                  >
                    {t('Send guess')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </SwipeableDrawer>
    </CorkBoard>
  );
}
```

What changed vs the current file:
- Removed `roleSheet` state and the `Role`-button drawer entirely.
- Removed the imports that are no longer needed (`CardActions`, `Divider`, the unused `Chip` imports from the top card — note that `Chip` is still used inside the solve drawer, so it remains imported).
- Replaced the outer `Grid` + `Card` shell with `CorkBoard` + pinned elements.
- Added `RoleCard` at the top, `PlayerFolder` (display mode) below, and two stamp-style buttons for pass/solve.
- `hasPassed` derivation drives the `Passed` stamp on the folder (matches the host board's behavior).
- The solve drawer block is pasted in unchanged so anyone reading this task in isolation can confirm nothing inside the drawer was altered.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Visual smoke test (detective / investigator path)**

Run: `npm run dev`. Start a fresh game with 4+ players (see Task 3's verification for setup).

On a non-forensic, non-murderer player's device after all picks are submitted:
- The screen should render on the cork background.
- A `RoleCard` should drop in at the top with the player's name and `Private Detective` caption (slate pushpin).
- The player's folder should appear below in display mode (no interaction, no red circles).
- Two stamp buttons: `Pass turn` (text variant) and `Solve` (primary variant).
- Tap `Pass turn`: the button becomes disabled, the folder gains the `Passed` stamp overlay. The host board's corresponding `PlayerFile` tile should also show its existing `Passed` stamp (unchanged host behavior).
- Tap `Solve` (from a fresh game, before passing): the existing solve drawer should open from the bottom with identical content to today — target dropdown, two chip rows, send guess button. Sending a guess should still work end-to-end.

- [ ] **Step 4: Visual smoke test (murderer path)**

In the same run, on the device belonging to the drawn murderer (check the host board or `ForensicAnalysis` screen to identify them after reveal):
- The `RoleCard` should use the red pushpin and show the `The Murderer` caption in the evidence color.
- Below the caption, a dashed divider should separate the card from a `Your locked pick` section showing the mean (blue highlighter) and the key (red highlighter) exactly as the murderer submitted them in `PickPhase`.
- The rest of the screen (folder, pass, solve) should behave exactly as the detective path.

- [ ] **Step 5: Commit**

```bash
git add src/components/Detective.tsx
git commit -m "feat(detective): corkboard redesign with RoleCard and PlayerFolder"
```

---

## Final verification

- [ ] **Full regression pass**

Run: `npm run build && npm run lint`
Expected: both PASS.

Start `npm run dev` and play through one full game end-to-end (host + 4 players):
- Lobby renders unchanged.
- `PickPhase` works on cork (Task 3 flow).
- Forensic scientist's `ForensicAnalysis` screen is visually unchanged — it still uses the old MUI shell (explicit non-goal of this pass).
- All non-forensic players' `Detective` screens render on cork with role card, folder, pass, solve.
- Host board renders unchanged.
- A full guess cycle (detective solves, win or wrong-guess) completes without regressions.

- [ ] **Sanity-check deferred work is still deferred**

Confirm no changes were made to:
- `src/components/ForensicAnalysis.tsx`
- The inner contents of the solve drawer inside `Detective.tsx` (the drawer markup from `<SwipeableDrawer anchor="bottom" open={solveSheet}...` through its closing tag should be byte-identical to the pre-refactor version).

If either has changed beyond what this plan prescribes, revert the unintended change.

- [ ] **Announce completion**

Report to the user: the two in-scope screens (`PickPhase`, `Detective` my-hand view) are now on the corkboard language; `ForensicAnalysis` and the solve takeover flow remain as-is, with follow-up work tracked in the deferred spec.
