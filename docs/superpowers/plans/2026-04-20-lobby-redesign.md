# Lobby Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock-MUI lobby with a CorkBoard surface that shares its structural frame with the in-game Board — Case-# polaroid + "Assigning case" sheet on the left, `PolaroidCard` masonry of joined players on the right, with a glued-on nameplate for picking the Forensic Scientist.

**Architecture:** Extract the existing QR polaroid block from `Board.tsx` into a shared `CasePolaroid` component so both screens render it identically. Add an `AssigningCaseSheet` that mirrors `ForensicSheet`'s shape (same width, ruled paper, signature line) and carries the counter + stamp Start button. Extend `PolaroidCard` with optional lobby-mode props (`slotLabel`, `role`, `onToggleRole`) so the same component represents a player in both screens. Rewrite `Lobby.tsx` from scratch to wire them together using the same masonry hook the Board uses.

**Tech Stack:** React 19, TypeScript, MUI 9, `motion/react` (framer-motion), `react-gameroom` (`useRoomState`, `RoomQRCode`, `buildJoinUrl`), existing in-repo components (`CorkBoard`, `PolaroidCard`, `ForensicSheet`, `StampButton`, `Pushpin`, `useMasonryLayout`).

**Spec:** `docs/superpowers/specs/2026-04-20-lobby-redesign-design.md`

**Verification note:** this project has no test runner. Each task's "verify" step is `npm run build` (runs `tsc -b` + Vite build) plus `npm run lint` plus a browser smoke check at the milestone. Type checking via `tsc -b` catches prop/contract breakages between tasks.

---

## Task 1: Extract `CasePolaroid` from `Board.tsx`

Pure refactor. Zero behavior change. The purpose is to have a single polaroid component that both `Board` and `Lobby` will render.

**Files:**
- Create: `src/components/board/CasePolaroid.tsx`
- Modify: `src/components/Board.tsx` (remove inline block + its helper memos + their top-level helpers; add import + usage)

- [ ] **Step 1: Confirm the helpers move with the block**

The inline polaroid block in `Board.tsx` uses two top-level helper functions (`generateDistressedLine`, `generateDistressedCircle`) and two memos (`stampClipPaths`, `crossClipPaths`). Both helpers and both memos are used **only** inside the polaroid block. Verify before moving:

Run:
```bash
grep -n "generateDistressedLine\|generateDistressedCircle\|stampClipPaths\|crossClipPaths" src/components/Board.tsx
```

Expected: every hit is either a definition (lines ~20, ~34, ~160, ~166) or a reference inside the polaroid block (lines ~245, ~271, ~283). No hits in `src/components/board/*` or anywhere else in `src/`:

```bash
grep -rn "generateDistressedLine\|generateDistressedCircle" src/ | grep -v Board.tsx
```

Expected: no results.

- [ ] **Step 2: Create `CasePolaroid.tsx`**

Create `src/components/board/CasePolaroid.tsx` with the full block below. This is the polaroid block from `Board.tsx` lifted verbatim, parameterized on `roomId`, `joinUrl`, `currentRound`, with the helpers and memos moved in.

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RoomQRCode } from 'react-gameroom';
import { useI18n } from '../../hooks/useI18n';

function generateDistressedLine() {
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const topBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    const bottomBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    topPoints.push(`${x.toFixed(1)}% ${topBite.toFixed(1)}%`);
    bottomPoints.unshift(`${x.toFixed(1)}% ${(100 - bottomBite).toFixed(1)}%`);
  }
  return `polygon(${[...topPoints, ...bottomPoints].join(', ')})`;
}

function generateDistressedCircle() {
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const bite = Math.random() < 0.3 ? Math.random() * 8 : 0;
    const r = 50 - bite;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

interface CasePolaroidProps {
  roomId: string;
  joinUrl: string;
  /** 0 for lobby (no rounds crossed). 1–3 in-game (rounds ≤ currentRound are crossed). */
  currentRound: number;
}

export default function CasePolaroid({ roomId, joinUrl, currentRound }: CasePolaroidProps) {
  const { t } = useI18n();

  const stampClipPaths = useMemo(
    () => [generateDistressedCircle(), generateDistressedCircle(), generateDistressedCircle()],
    [],
  );

  const crossClipPaths = useMemo(
    () => [
      [generateDistressedLine(), generateDistressedLine()],
      [generateDistressedLine(), generateDistressedLine()],
      [generateDistressedLine(), generateDistressedLine()],
    ],
    [],
  );

  return (
    <Box
      component="a"
      href={joinUrl}
      target="_blank"
      sx={{
        mb: 3,
        display: 'block',
        textDecoration: 'none',
        transform: 'rotate(2deg)',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'rotate(0deg) scale(1.03)' },
      }}
    >
      <Box
        sx={{
          bgcolor: '#f5f5f0',
          p: 1.5,
          pb: 4,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e0ddd5',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            '& svg': { width: '100%', maxWidth: 150, height: 'auto', display: 'block' },
          }}
        >
          <RoomQRCode roomId={roomId} url={joinUrl} size={150} />
        </Box>
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '2.2rem',
            color: 'var(--text-color)',
            textAlign: 'center',
            mt: 1.5,
            fontWeight: 'bold',
            letterSpacing: '-1px',
          }}
        >
          {t('Case')}#{roomId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mt: -0.5, justifyContent: 'center' }}>
          {[1, 2, 3].map((r) => (
            <Box
              key={r}
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                border: '3px solid',
                borderColor: 'var(--weapon-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${[-8, 3, -5][r - 1]}deg)`,
                clipPath: stampClipPaths[r - 1],
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: 'var(--weapon-color)',
                  lineHeight: 1,
                }}
              >
                {r}
              </Typography>
              {r <= currentRound && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      bgcolor: 'var(--evidence-color)',
                      transform: 'rotate(-25deg)',
                      transformOrigin: 'center',
                      clipPath: crossClipPaths[r - 1][0],
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      bgcolor: 'var(--evidence-color)',
                      transform: 'rotate(25deg)',
                      transformOrigin: 'center',
                      clipPath: crossClipPaths[r - 1][1],
                    }}
                  />
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Replace the inline block in `Board.tsx`**

Open `src/components/Board.tsx`. Make these edits:

1. Delete the two top-level helpers at `~lines 20–47`:
   - `function generateDistressedLine()`
   - `function generateDistressedCircle()`
2. Delete the two memos at `~lines 160–170`:
   - `const stampClipPaths = useMemo(...)`
   - `const crossClipPaths = useMemo(...)`
3. Delete the inline polaroid block at `~lines 180–294` (the entire `{roomState && (<Box component="a" ...>...</Box>)}`).
4. Replace it with the new component usage:

```tsx
{roomState && (
  <CasePolaroid
    roomId={roomState.roomId}
    joinUrl={joinUrl}
    currentRound={gameState.round}
  />
)}
```

5. Add the import near the other board-component imports:

```tsx
import CasePolaroid from './board/CasePolaroid';
```

6. Remove the now-unused imports from `Board.tsx`:
   - `RoomQRCode` (no longer referenced directly).
   - Check if `useMemo` is still used; it is (for `guessData`, `guessCountByPlayer`, `guessNoteRotations`, `cardRotations`, `cardOffsets`), so keep it.

- [ ] **Step 4: Verify Board still builds and renders**

Run:
```bash
npm run build
```

Expected: clean build, no TypeScript errors.

Run:
```bash
npm run lint
```

Expected: clean. (If `RoomQRCode` is flagged as unused, that import needs to be removed — see Step 3.6.)

Smoke check in a browser:
```bash
npm run dev
```

Create a game, start it. The Board's top-left polaroid must look identical to before: Case # headline, QR code, three round circles, correct crossed-out rounds after `Pass turn` progresses rounds. Any visual regression = revert and diagnose before moving on.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/CasePolaroid.tsx src/components/Board.tsx
git commit -m "refactor(board): extract CasePolaroid for reuse in lobby"
```

---

## Task 2: Extend `PolaroidCard` with lobby-mode props

Add `slotLabel`, `role`, `onToggleRole` props. Make `means`/`clues` optional. When `role` is set, render a glued-on role nameplate below the card. Existing `Board.tsx` callers keep working unchanged because they always pass `means`/`clues`.

**Files:**
- Modify: `src/components/board/PolaroidCard.tsx`

- [ ] **Step 1: Update the component**

Replace the entire contents of `src/components/board/PolaroidCard.tsx` with:

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';

function generateTornEdge() {
  const points: string[] = ['0% 0%', '100% 0%'];
  const steps = 30;
  points.push('100% 95%');
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 95 + Math.random() * 3;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export type PolaroidRole = 'detective' | 'investigator';

interface PolaroidCardProps {
  name: string;
  rotation: number;
  offsetY: number;
  // game-only
  means?: string[];
  clues?: string[];
  stamp?: string;
  guessCount?: number;
  // lobby-only
  slotLabel?: string;
  role?: PolaroidRole;
  onToggleRole?: () => void;
}

const WEAPON_COLOR = 'var(--weapon-color)';
const EVIDENCE_COLOR = 'var(--evidence-color)';

export default function PolaroidCard({
  name,
  means,
  clues,
  rotation,
  offsetY,
  stamp,
  guessCount = 0,
  slotLabel,
  role,
  onToggleRole,
}: PolaroidCardProps) {
  const tornEdge = useMemo(() => generateTornEdge(), []);
  const nameplateRotation = useMemo(() => (Math.random() * 3 - 1.5), []);

  const hasGameBody = means !== undefined && clues !== undefined;
  const hasLobbyBody = slotLabel !== undefined;

  return (
    <Box
      sx={{
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        marginTop: `${offsetY}px`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <Pushpin />

      {/* Notebook page (clipped by torn edge) */}
      <Box
        sx={{
          background: `#f8f6f0 repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px) 0 36px`,
          p: 2,
          boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          borderLeft: '2px solid rgba(220, 80, 80, 0.3)',
          clipPath: tornEdge,
          pb: 4,
        }}
      >
        {/* Guess count */}
        {guessCount > 0 && (
          <Typography
            sx={{
              position: 'absolute',
              top: 8,
              right: 10,
              fontFamily: 'var(--font-script)',
              fontSize: '1.6rem',
              textTransform: 'uppercase',
              color: 'var(--evidence-color)',
            }}
          >
            {guessCount}x
          </Typography>
        )}

        {/* Name */}
        <Typography
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.7rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            pr: 3,
            mb: 1.5,
          }}
        >
          {name}
        </Typography>

        {hasGameBody && (
          <>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                color: WEAPON_COLOR,
                lineHeight: 1.6,
              }}
            >
              {means!.join(', ')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                color: EVIDENCE_COLOR,
                lineHeight: 1.6,
              }}
            >
              {clues!.join(', ')}
            </Typography>
          </>
        )}

        {hasLobbyBody && !hasGameBody && (
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-color)',
              lineHeight: 1.6,
            }}
          >
            {slotLabel}
          </Typography>
        )}

        {/* Rubber stamp overlay */}
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

      {/* Glued-on role nameplate (sibling — outside the torn-edge clip) */}
      {role && (
        <ButtonBase
          disableRipple
          onClick={onToggleRole}
          disabled={!onToggleRole}
          sx={{
            display: 'block',
            width: '90%',
            mx: 'auto',
            mt: -1,
            px: 2,
            py: 0.75,
            bgcolor: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transform: `rotate(${nameplateRotation}deg)`,
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            '&:hover': onToggleRole
              ? {
                  transform: `rotate(${nameplateRotation}deg) translateY(-2px)`,
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                }
              : undefined,
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover': { transform: `rotate(${nameplateRotation}deg)` },
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: role === 'detective' ? EVIDENCE_COLOR : WEAPON_COLOR,
              lineHeight: 1.2,
            }}
          >
            {role === 'detective' ? 'Forensic Scientist' : 'Investigator'}
          </Typography>
        </ButtonBase>
      )}
    </Box>
  );
}
```

Notes:
- The name `Typography` now uses the script font (matching the original — verify the original code from Task 1's PolaroidCard section if needed). The in-game rendering is byte-for-byte the same as before.
- The role nameplate is a sibling `<ButtonBase>` outside the `clipPath`-clipped notebook `<Box>`, so the torn edge doesn't cut its bottom.
- The nameplate renders English literals for now (`"Forensic Scientist"`, `"Investigator"`). Task 4 adds i18n keys; Task 5 passes translated strings in via… actually no — the nameplate text is internal to `PolaroidCard`. We'll make it i18n-aware in Task 4 by adding `useI18n` inside the component (simpler than threading props).

- [ ] **Step 2: Verify build**

```bash
npm run build && npm run lint
```

Expected: clean. Board still compiles because it passes `means` and `clues` to every `PolaroidCard` — the game body branch is unchanged.

Smoke check: `npm run dev`, start a game. Every in-game polaroid looks identical to before (no nameplate, same means/clues rendering).

- [ ] **Step 3: Commit**

```bash
git add src/components/board/PolaroidCard.tsx
git commit -m "feat(polaroid): add lobby-mode props (slot label, role nameplate)"
```

---

## Task 3: Create `AssigningCaseSheet`

Ruled-paper sheet modeled on `ForensicSheet`, with live counter and stamp-button CTA.

**Files:**
- Create: `src/components/board/AssigningCaseSheet.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/board/AssigningCaseSheet.tsx`:

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import StampButton from './StampButton';
import { useI18n } from '../../hooks/useI18n';

interface AssigningCaseSheetProps {
  detectiveName: string | undefined;
  count: number;
  maxCount: number;
  canStart: boolean;
  onStart: () => void;
}

export default function AssigningCaseSheet({
  detectiveName,
  count,
  maxCount,
  canStart,
  onStart,
}: AssigningCaseSheetProps) {
  const { t } = useI18n();

  return (
    <Box sx={{ position: 'relative', width: 340 }}>
      <Pushpin color="#4a7c59" />

      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1.4rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-color)',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          {t('Assigning case')}
        </Typography>

        {/* Detective signature — mirrors ForensicSheet */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: 'var(--font-script)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'var(--evidence-color)',
              minHeight: '1.5rem',
              display: 'inline-block',
            }}
          >
            {detectiveName ?? '\u00A0'}
          </Typography>
          <Box
            sx={{
              borderTop: '1px dashed var(--text-color)',
              mt: 0.5,
              mx: 'auto',
              width: '60%',
            }}
          />
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              color: '#5f6c7b',
            }}
          >
            {t('Forensic Scientist')}
          </Typography>
        </Box>

        {/* Counter */}
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '1rem',
            color: 'var(--text-color)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {count} / {maxCount} {t('on scene')}
        </Typography>

        {/* Start button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StampButton variant="primary" disabled={!canStart} onClick={onStart}>
            {t('Start investigation')}
          </StampButton>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build && npm run lint
```

Expected: clean. (The component isn't rendered yet — Task 5 wires it in — but it must type-check.)

- [ ] **Step 3: Commit**

```bash
git add src/components/board/AssigningCaseSheet.tsx
git commit -m "feat(lobby): add AssigningCaseSheet component"
```

---

## Task 4: Add i18n keys and make `PolaroidCard` i18n-aware

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/components/board/PolaroidCard.tsx` (swap literal role strings for translated ones)

- [ ] **Step 1: Add translation keys**

Open `src/i18n/translations.ts`. Find the trailing `// How to play` block (around line 99) and, before the closing `};`, add a new section:

```ts
  // Lobby redesign — added 2026-04-20
  'Assigning case': 'Atribuindo o caso',
  'on scene': 'na cena',
  'Start investigation': 'Começar investigação',
  'Investigator': 'Investigador',
  'Player': 'Jogador',
```

(`'Forensic Scientist'` already has a translation earlier in the file — reuse it, do not duplicate.)

- [ ] **Step 2: Translate `PolaroidCard`'s nameplate literals**

In `src/components/board/PolaroidCard.tsx`, add a `useI18n` import at the top:

```tsx
import { useI18n } from '../../hooks/useI18n';
```

Inside the component body, before the `return`, add:

```tsx
const { t } = useI18n();
```

In the nameplate block, replace the hardcoded strings. Change:

```tsx
{role === 'detective' ? 'Forensic Scientist' : 'Investigator'}
```

to:

```tsx
{role === 'detective' ? t('Forensic Scientist') : t('Investigator')}
```

- [ ] **Step 3: Verify build**

```bash
npm run build && npm run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.ts src/components/board/PolaroidCard.tsx
git commit -m "i18n: add lobby redesign keys"
```

---

## Task 5: Rewrite `Lobby.tsx`

Full rewrite. CorkBoard wrapper, two-column layout matching Board, CasePolaroid + AssigningCaseSheet on the left, masonry of PolaroidCards on the right, motion enter/exit animations.

**Files:**
- Modify: `src/components/Lobby.tsx` (full rewrite)

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/Lobby.tsx` with:

```tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'motion/react';
import { buildJoinUrl, useRoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import { useMasonryLayout } from '../hooks/useMasonryLayout';
import CorkBoard from './board/CorkBoard';
import CasePolaroid from './board/CasePolaroid';
import AssigningCaseSheet from './board/AssigningCaseSheet';
import PolaroidCard from './board/PolaroidCard';

const MAX_PLAYERS = 12;
const CARD_COLUMN_WIDTH = 220;
const CARD_GAP = 24;

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function randomOffset() {
  return Math.floor(Math.random() * 20) - 10;
}

export default function Lobby() {
  const { roomState, startTheGame } = useGame();
  const { t } = useI18n();
  const { canStart, readyPlayers } = useRoomState(roomState!);

  const [activeDetective, setActiveDetective] = useState(0);

  // Clamp the detective index if its slot disappears.
  useEffect(() => {
    if (activeDetective >= readyPlayers.length && readyPlayers.length > 0) {
      setActiveDetective(0);
    }
  }, [readyPlayers.length, activeDetective]);

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ''),
    [roomState?.roomId],
  );

  // Memoise per-slot rotation/offset so they don't re-roll on every render.
  // Keyed on slot ids so they're stable across joins/leaves.
  const slotIdsKey = readyPlayers.map((s) => s.id).join(',');
  const cardRotations = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => { map[s.id] = randomRotation(); });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const cardOffsets = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => { map[s.id] = randomOffset(); });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const masonryRef = useRef<HTMLDivElement>(null);
  const masonry = useMasonryLayout(masonryRef, readyPlayers.length, CARD_COLUMN_WIDTH, CARD_GAP);

  if (!roomState) return null;

  const detectiveName = readyPlayers[activeDetective]?.name;

  return (
    <CorkBoard>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box>
          <CasePolaroid
            roomId={roomState.roomId}
            joinUrl={joinUrl}
            currentRound={0}
          />
          <AssigningCaseSheet
            detectiveName={detectiveName}
            count={readyPlayers.length}
            maxCount={MAX_PLAYERS}
            canStart={canStart}
            onStart={() => startTheGame(activeDetective)}
          />
        </Box>

        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Box
              ref={masonryRef}
              sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}
            >
              <AnimatePresence>
                {readyPlayers.map((slot, i) => {
                  const style = masonry.styles[i];
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.7, y: -40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      ref={(el: HTMLDivElement | null) => masonry.setItemRef(i, el)}
                      style={{
                        width: CARD_COLUMN_WIDTH,
                        position: 'absolute',
                        left: style?.left ?? 0,
                        top: style?.top ?? 0,
                      }}
                    >
                      <PolaroidCard
                        name={slot.name ?? ''}
                        slotLabel={`${t('Player')} ${i + 1}`}
                        role={i === activeDetective ? 'detective' : 'investigator'}
                        onToggleRole={() => setActiveDetective(i)}
                        rotation={cardRotations[slot.id] ?? 0}
                        offsetY={cardOffsets[slot.id] ?? 0}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </Box>
    </CorkBoard>
  );
}
```

Implementation notes baked into this code:

- **No `layout` prop on `motion.div`.** The spec flagged that `layout` can fight masonry's absolute positioning. Enter/exit animations only; position is driven entirely by the masonry hook via `style.left` / `style.top`.
- **Masonry ref.** The `motion.div`'s `ref` forwards to `masonry.setItemRef(i, el)`, exactly like `Board.tsx` does for its polaroid grid.
- **Clamp effect.** If the active detective's slot disappears, `setActiveDetective(0)` fires from a `useEffect`. Empty roster keeps the index at `0` but renders nothing.
- **`MAX_PLAYERS = 12`.** Display-only constant for the counter. The real cap is whatever `react-gameroom` enforces.

- [ ] **Step 2: Verify build**

```bash
npm run build && npm run lint
```

Expected: clean.

- [ ] **Step 3: Smoke test in the browser**

Run `npm run dev`. Drive the full flow:

1. Go to `/`, click **New game**. Navigate to `/room/<id>`.
2. Confirm the lobby renders on the dark cork surface with:
   - Case-# polaroid top-left (QR + three un-crossed rounds).
   - `AssigningCaseSheet` below it with `ASSIGNING CASE` header, empty dashed signature line, `0 / 12 on scene`, disabled `Start investigation` button.
   - Empty right column.
3. On a second device (or second browser tab on the join URL), join the room with a nickname. A polaroid pins up with a spring animation. Its slot label reads `PLAYER 1`; its nameplate reads `INVESTIGATOR` in blue.
4. First-joined player auto-becomes detective (index 0). Their nameplate flips to red `FORENSIC SCIENTIST`, and the sheet's signature line now shows their name in red script.
5. Join a second player. Counter updates to `2 / 12`. Click the second player's `INVESTIGATOR` nameplate → it flips to `FORENSIC SCIENTIST`, the prior detective flips back to `INVESTIGATOR`, sheet signature updates.
6. Once `canStart` is true (minimum players per `useRoomState`), the Start button becomes enabled. Click it. The page transitions to the in-game Board. The Case-# polaroid stays visually continuous across the swap (same component, same roomId, rounds now show uncrossed initially).
7. Back-button out, leave a player on the join side, confirm their polaroid animates out and the counter drops.
8. Language toggle on Home: flip to Portuguese, re-enter the lobby, confirm `ATRIBUINDO O CASO`, `na cena`, `COMEÇAR INVESTIGAÇÃO`, `CIENTISTA FORENSE`, `INVESTIGADOR`, `JOGADOR N` all render.

Any step fails → stop, diagnose, do not commit until it works.

- [ ] **Step 4: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "feat(lobby): redesign on CorkBoard with PolaroidCard roster"
```

---

## Task 6: Final verification

**Files:** none — verification only.

- [ ] **Step 1: Full build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean.

- [ ] **Step 2: End-to-end smoke test across lobby → game**

In `npm run dev`:

1. Create a game as host.
2. Join with ≥ minimum-players devices.
3. Pick a non-default detective.
4. Click `Start investigation`. Confirm:
   - Transition to Board is clean (no TypeScript runtime errors in console).
   - The Board's `CasePolaroid` shows the same roomId; round indicators now behave as before (round 1 crossed out after the first round passes, etc.).
   - The detective you picked in the lobby is the one running ForensicAnalysis on their phone.
5. Play one full round → pass turns → round indicator crosses out on the Case polaroid.

- [ ] **Step 3: Verify removed lobby affordances are gone**

Confirm the following no longer exist in the lobby:
- No MUI `LinearProgress` bar.
- No "Copy game url" button.
- No "URL copied" snackbar.
- No `LocalPoliceIcon` badges next to player names (the role nameplate replaces that affordance).

- [ ] **Step 4: Confirm Room FAB still works**

In any lobby or in-game state, the Info FAB (bottom-right, from `src/pages/Room.tsx`) opens `RoomInfoModal` with the QR and player links. Unchanged from before this redesign.

- [ ] **Step 5: No additional commit**

All commits were made at the end of each task. This task is verification only.

---

## Spec coverage check

| Spec decision | Task |
|---|---|
| CorkBoard wrapper + Board's two-column layout | Task 5 |
| Case polaroid reused from Board (extraction) | Task 1 |
| `PolaroidCard` carries players; means/clues optional | Task 2 |
| Slot label `PLAYER N` in card body | Task 2 (render) + Task 5 (wiring) |
| Glued role nameplate (blue/red, clickable) | Task 2 |
| Mutually-exclusive detective selection via nameplate click | Task 5 |
| `AssigningCaseSheet` modeled on ForensicSheet | Task 3 |
| Live detective signature on the sheet | Task 3 (prop) + Task 5 (wiring) |
| Counter `X / 12 on scene` | Task 3 |
| `StampButton` "Start investigation" inside the sheet, disabled until `canStart` | Task 3 |
| Drop MUI Container/Grid/Card, LinearProgress, Snackbar, Copy button, LocalPoliceIcon | Task 5 (rewrite) + Task 6 (verification) |
| `Board.tsx` swaps inline polaroid for `CasePolaroid` | Task 1 |
| i18n keys: Assigning case, on scene, Start investigation, Investigator, Player | Task 4 |
| Clamp `activeDetective` when its slot disappears | Task 5 |
| Motion enter/exit spring vocabulary on join/leave | Task 5 |
| No changes to `GameContext`, `useRoomState`, `RoomInfoModal`, Info FAB | all tasks (nothing touches those paths) |
| Out of scope: shared-layout crossfade | confirmed by absence of `layout` prop in Task 5 |
