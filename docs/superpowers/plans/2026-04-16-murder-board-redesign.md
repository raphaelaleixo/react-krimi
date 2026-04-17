# Murder Board Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Board component to look like a classic detective corkboard with pushpins, polaroid suspect cards, red string connections between guesses, a forensic analysis sheet, and aging effects.

**Architecture:** CSS-only board with SVG string overlay. The current monolithic Board.tsx is split into focused sub-components under `src/components/board/`. A custom hook (`useStringPositions`) handles DOM measurement for SVG red strings. No new dependencies.

**Tech Stack:** React 19, TypeScript, MUI 9 (sx props), SVG, CSS pseudo-elements/gradients. No test runner configured — verify visually via `npm run dev`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/board/CorkBoard.tsx` | Wall + wooden frame + cork surface wrapper |
| `src/components/board/Pushpin.tsx` | Reusable pushpin CSS component |
| `src/components/board/PolaroidCard.tsx` | Suspect card styled as a pinned polaroid |
| `src/components/board/ForensicSheet.tsx` | Big analysis sheet with glued-on round 2/3 notes |
| `src/components/board/GuessNote.tsx` | Pinned guess note near accuser's card |
| `src/components/board/RedStrings.tsx` | SVG overlay rendering red yarn between guess notes and accused cards |
| `src/components/board/CoffeeStains.tsx` | Decorative coffee ring stains on the cork |
| `src/hooks/useStringPositions.ts` | Hook: measures ref positions via ResizeObserver for SVG endpoints |
| `src/components/Board.tsx` | Orchestrator — composes all board sub-components (rewrite) |

---

### Task 1: CorkBoard Shell

Create the wall + frame + cork surface wrapper component, and update Board.tsx to render inside it.

**Files:**
- Create: `src/components/board/CorkBoard.tsx`
- Modify: `src/components/Board.tsx`

- [ ] **Step 1: Create `src/components/board/CorkBoard.tsx`**

```tsx
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

interface CorkBoardProps {
  children: ReactNode;
}

export default function CorkBoard({ children }: CorkBoardProps) {
  return (
    // Wall — dark precinct wall behind the board
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#2a2d32',
        overflow: 'hidden',
      }}
    >
      {/* Frame — wooden border */}
      <Box
        sx={{
          width: '95vw',
          height: '90vh',
          borderRadius: '4px',
          border: '12px solid',
          borderImage: 'linear-gradient(135deg, #8B6914 0%, #A0782C 25%, #6B4F12 50%, #9C7A38 75%, #7A5C1E 100%) 1',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(0,0,0,0.2)',
        }}
      >
        {/* Cork surface */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            // Cork texture via CSS — repeating warm brown pattern
            backgroundColor: '#c19a6b',
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(160, 120, 60, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(180, 140, 80, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(140, 100, 50, 0.25) 0%, transparent 45%),
              url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")
            `,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Update Board.tsx to use CorkBoard**

Replace the outer `<Container>` and `<Grid container>` with `<CorkBoard>`. Keep all existing content inside for now — we'll refactor the inner content in later tasks.

In `src/components/Board.tsx`, replace lines 51-53:
```tsx
// Old:
<Container sx={{ height: '100%', py: 4 }}>
  <Grid container sx={{ height: '100%', alignItems: 'flex-start' }}>

// New:
<CorkBoard>
  <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
```

And replace lines 289-291:
```tsx
// Old:
      </Grid>
    </Container>

// New:
    </Box>
  </CorkBoard>
```

Add import at top:
```tsx
import CorkBoard from './board/CorkBoard';
```

The inner `<Grid size={{ md: 9 }}>` becomes `<Box sx={{ flex: 3 }}>` and `<Grid size={{ md: 3 }}>` becomes `<Box sx={{ flex: 1 }}>`.

- [ ] **Step 3: Verify visually**

Run: `npm run dev`
Expected: The board renders inside a dark wall with a wooden-framed cork rectangle. Content is still the old cards but they're sitting on the cork surface. The body background image from GlobalStyles will be hidden behind the wall div.

- [ ] **Step 4: Type check**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/CorkBoard.tsx src/components/Board.tsx
git commit -m "feat: add CorkBoard shell with wall, frame, and cork surface"
```

---

### Task 2: Pushpin and PolaroidCard Components

Create the reusable pushpin and polaroid-styled suspect card.

**Files:**
- Create: `src/components/board/Pushpin.tsx`
- Create: `src/components/board/PolaroidCard.tsx`
- Modify: `src/components/Board.tsx`

- [ ] **Step 1: Create `src/components/board/Pushpin.tsx`**

```tsx
import Box from '@mui/material/Box';

interface PushpinProps {
  color?: string;
}

export default function Pushpin({ color = '#cc3333' }: PushpinProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color} 0%, ${color}cc 60%, ${color}88 100%)`,
        boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3)`,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '25%',
          left: '30%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
        },
      }}
    />
  );
}
```

- [ ] **Step 2: Create `src/components/board/PolaroidCard.tsx`**

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Pushpin from './Pushpin';

interface PolaroidCardProps {
  name: string;
  means: string[];
  clues: string[];
  rotation: number;
  offsetY: number;
  passedTurn?: boolean;
  passedTurnLabel: string;
}

export default function PolaroidCard({
  name,
  means,
  clues,
  rotation,
  offsetY,
  passedTurn,
  passedTurnLabel,
}: PolaroidCardProps) {
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

      {/* Polaroid frame */}
      <Box
        sx={{
          bgcolor: '#fff',
          p: '10px',
          pb: '40px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
      >
        {/* Polaroid interior — yellowed paper */}
        <Box
          sx={{
            bgcolor: '#faf5e8',
            p: 1.5,
            filter: 'sepia(0.05)',
          }}
        >
          {passedTurn && (
            <Typography
              sx={{
                fontFamily: '"Shadows Into Light", cursive',
                fontSize: 16,
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {passedTurnLabel}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {means.map((mean) => (
              <Chip
                key={mean}
                label={mean}
                size="small"
                sx={{ bgcolor: '#bbdefb', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {clues.map((clue) => (
              <Chip
                key={clue}
                label={clue}
                size="small"
                sx={{ bgcolor: '#ffcdd2', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>

        {/* Player name — handwritten on polaroid border */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Update Board.tsx to use PolaroidCard**

Replace the suspect card rendering section. Remove the old `<Grid>` + `<Card>` + sticky-tape markup for each suspect and replace with `<PolaroidCard>`.

In `Board.tsx`, add a memoized vertical stagger alongside the existing `cardRotations`:
```tsx
const cardOffsets = useMemo(() => {
  if (!gameState) return {};
  const offsets: Record<number, number> = {};
  gameState.playerOrder.forEach((pid) => {
    offsets[pid] = Math.floor(Math.random() * 20) - 10;
  });
  return offsets;
}, [gameState?.playerOrder]);
```

Replace the suspects `.map()` block (the `<Grid key={player.id}>` through its closing `</Grid>`) with:
```tsx
{suspects.map((player) => {
  const rotation = cardRotations[player.id]?.card || 0;
  const offsetY = cardOffsets[player.id] || 0;
  const playerMeans = gameState.means.slice(player.index * 4, player.index * 4 + 4);
  const playerClues = gameState.clues.slice(player.index * 4, player.index * 4 + 4);

  return (
    <Box key={player.id} sx={{ width: 220 }}>
      <PolaroidCard
        name={player.name}
        means={playerMeans}
        clues={playerClues}
        rotation={rotation}
        offsetY={offsetY}
        passedTurn={gameState.passedTurns?.[player.index]}
        passedTurnLabel={t('Passed this turn')}
      />
    </Box>
  );
})}
```

Remove the guess text rendering from inside the card — it currently lives as a `<Typography>` block checking `gameState.guesses[player.index]`. Delete that entire block. Guess rendering moves to Task 4.

Also remove the `gameState.finished` stamp overlay block (`{/* Stamp overlay */}` through its closing `</Box>`) — end-game state is deferred.

Remove the finished banner at the bottom (`{gameState.finished && ...}`).

Add import:
```tsx
import PolaroidCard from './board/PolaroidCard';
```

Remove unused imports: `Card`, `CardContent`, `Chip`, `Divider`, `Grid`.

The suspects area becomes a flex row:
```tsx
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
  {/* title */}
  <Box sx={{ width: '100%' }}>
    <Typography variant="h2">...</Typography>
    <Typography variant="h4">...</Typography>
  </Box>
  {/* polaroid cards */}
  {suspects.map(...)}
</Box>
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Suspect cards appear as white-bordered polaroids with pushpins, yellowed interior, player names in handwriting below. Randomly rotated and staggered. No guess text on cards. All sitting on the cork surface.

- [ ] **Step 5: Type check**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/board/Pushpin.tsx src/components/board/PolaroidCard.tsx src/components/Board.tsx
git commit -m "feat: add Pushpin and PolaroidCard components for suspect cards"
```

---

### Task 3: ForensicSheet Component

Create the big forensic analysis sheet with round 2/3 notes glued on top.

**Files:**
- Create: `src/components/board/ForensicSheet.tsx`
- Modify: `src/components/Board.tsx`

- [ ] **Step 1: Create `src/components/board/ForensicSheet.tsx`**

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import type { AnalysisItem } from '../../data/analysis';

function randomRotation() {
  return Math.floor(3 - Math.random() * 6);
}

interface ForensicSheetProps {
  detectiveName: string;
  analysis: AnalysisItem[];
  forensicAnalysis?: string[];
  round: number;
  forensicScientistLabel: string;
}

// Round 1 gets 6 clues, round 2+ gets 1 extra each
const ROUND_1_COUNT = 6;

export default function ForensicSheet({
  detectiveName,
  analysis,
  forensicAnalysis,
  round,
  forensicScientistLabel,
}: ForensicSheetProps) {
  const gluedNoteRotations = useMemo(() => {
    if (!forensicAnalysis) return [];
    return forensicAnalysis.slice(ROUND_1_COUNT).map(() => randomRotation());
  }, [forensicAnalysis]);

  if (!forensicAnalysis || forensicAnalysis.length === 0) return null;

  const round1Items = forensicAnalysis.slice(0, ROUND_1_COUNT);
  const laterItems = forensicAnalysis.slice(ROUND_1_COUNT);

  return (
    <Box sx={{ position: 'relative', width: 280 }}>
      <Pushpin color="#4a7c59" />

      {/* Main sheet */}
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          // Faint ruled lines
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontFamily: '"kingthings_trypewriter_2Rg", serif',
            fontSize: '1rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#094067',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          Forensic Analysis
        </Typography>

        {/* Detective signature */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Shadows Into Light", cursive',
              fontSize: '1.3rem',
              color: '#3da9fc',
            }}
          >
            {detectiveName}
          </Typography>
          <Box
            sx={{
              borderTop: '1px dashed #094067',
              mt: 0.5,
              mx: 'auto',
              width: '60%',
            }}
          />
          <Typography
            sx={{
              fontFamily: '"kingthings_trypewriter_2Rg", serif',
              fontSize: '0.6rem',
              letterSpacing: '1px',
              color: '#5f6c7b',
            }}
          >
            {forensicScientistLabel}
          </Typography>
        </Box>

        {/* Round 1 analysis items */}
        {round1Items.map((item, index) => (
          <Box key={index} sx={{ mb: 1.5 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"kingthings_trypewriter_2Rg", serif',
                fontSize: '0.8rem',
                color: '#094067',
              }}
            >
              {index + 1}. {analysis[index]?.title}:{' '}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Shadows Into Light", cursive',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: '#3da9fc',
              }}
            >
              {item}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Glued-on notes for round 2/3 */}
      {laterItems.map((item, i) => {
        const index = ROUND_1_COUNT + i;
        const rotation = gluedNoteRotations[i] || 0;
        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              mt: -2,
              mx: 1,
              transform: `rotate(${rotation}deg)`,
              zIndex: 1 + i,
            }}
          >
            {/* Tape strip */}
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4em',
                height: '1.2em',
                background: 'rgba(255, 245, 180, 0.5)',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.15)',
                zIndex: 2,
              }}
            />

            <Box
              sx={{
                bgcolor: '#faf5e8',
                p: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '0.8rem',
                  color: '#094067',
                }}
              >
                {index + 1}. {analysis[index]?.title}:{' '}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: '"Shadows Into Light", cursive',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  color: '#3da9fc',
                }}
              >
                {item}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
```

- [ ] **Step 2: Update Board.tsx to use ForensicSheet**

Replace the entire analysis sidebar section (the old `<Grid size={{ md: 3 }}>` block, now a `<Box sx={{ flex: 1 }}>`) with:

```tsx
<ForensicSheet
  detectiveName={detectiveName}
  analysis={gameState.analysis}
  forensicAnalysis={gameState.forensicAnalysis}
  round={gameState.round}
  forensicScientistLabel={t('Forensic Scientist')}
/>
```

Add import:
```tsx
import ForensicSheet from './board/ForensicSheet';
```

Remove `analysisRotations` useMemo since it's no longer used.

- [ ] **Step 3: Verify visually**

Run: `npm run dev`
Expected: The analysis sidebar is now a single white sheet with ruled lines, "FORENSIC ANALYSIS" header in typewriter, detective name in handwriting, and analysis items listed. If there are round 2/3 items, they appear as glued notes overlapping the bottom of the sheet with tape strips.

- [ ] **Step 4: Type check**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/ForensicSheet.tsx src/components/Board.tsx
git commit -m "feat: add ForensicSheet component with glued-on round notes"
```

---

### Task 4: GuessNote, RedStrings, and useStringPositions

Create the guess notes, SVG red string overlay, and the DOM measurement hook.

**Files:**
- Create: `src/hooks/useStringPositions.ts`
- Create: `src/components/board/GuessNote.tsx`
- Create: `src/components/board/RedStrings.tsx`
- Modify: `src/components/Board.tsx`

- [ ] **Step 1: Create `src/hooks/useStringPositions.ts`**

```ts
import { useLayoutEffect, useCallback, useState, type RefObject } from 'react';

export interface StringEndpoint {
  x: number;
  y: number;
}

export interface StringConnection {
  from: StringEndpoint;
  to: StringEndpoint;
}

export function useStringPositions(
  containerRef: RefObject<HTMLElement | null>,
  refs: Map<string, HTMLElement | null>,
  connections: Array<{ fromKey: string; toKey: string }>,
): StringConnection[] {
  const [positions, setPositions] = useState<StringConnection[]>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const results: StringConnection[] = [];

    for (const { fromKey, toKey } of connections) {
      const fromEl = refs.get(fromKey);
      const toEl = refs.get(toKey);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // From: right or left edge of guess note (whichever is closer to target)
      const fromCenterX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const toCenterX = toRect.left + toRect.width / 2 - containerRect.left;

      const fromX = fromCenterX < toCenterX
        ? fromRect.right - containerRect.left
        : fromRect.left - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;

      // To: pushpin position (top center of target card)
      const toX = toCenterX;
      const toY = toRect.top - containerRect.top + 8; // pushpin offset

      results.push({ from: { x: fromX, y: fromY }, to: { x: toX, y: toY } });
    }

    setPositions(results);
  }, [containerRef, refs, connections]);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  return positions;
}
```

- [ ] **Step 2: Create `src/components/board/GuessNote.tsx`**

```tsx
import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';

interface GuessNoteProps {
  accuserName: string;
  accusedName: string;
  mean: string;
  evidenceKey: string;
  isWrong: boolean;
  rotation: number;
  moLabel: string;
  keyEvidenceLabel: string;
  saidThatLabel: string;
  didItLabel: string;
}

const GuessNote = forwardRef<HTMLDivElement, GuessNoteProps>(function GuessNote(
  {
    accuserName,
    accusedName,
    mean,
    evidenceKey,
    isWrong,
    rotation,
    moLabel,
    keyEvidenceLabel,
    saidThatLabel,
    didItLabel,
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: 180,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Pushpin color="#d4a437" />

      <Box
        sx={{
          bgcolor: '#faf5e8',
          p: 1.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          filter: 'sepia(0.05)',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#5f6c7b',
            textDecoration: isWrong ? 'line-through' : 'none',
            textDecorationColor: '#cc3333',
            textDecorationThickness: '2px',
          }}
        >
          {accuserName} {saidThatLabel} {accusedName} {didItLabel}, {moLabel}{' '}
          {mean} {keyEvidenceLabel} {evidenceKey}
        </Typography>
      </Box>
    </Box>
  );
});

export default GuessNote;
```

- [ ] **Step 3: Create `src/components/board/RedStrings.tsx`**

```tsx
import type { StringConnection } from '../../hooks/useStringPositions';

interface RedStringsProps {
  connections: StringConnection[];
  width: number;
  height: number;
}

export default function RedStrings({ connections, width, height }: RedStringsProps) {
  if (connections.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {connections.map((conn, i) => {
        // Quadratic bezier with control point offset for a natural drape
        const midX = (conn.from.x + conn.to.x) / 2;
        const midY = (conn.from.y + conn.to.y) / 2;
        // Drape downward slightly
        const controlY = midY + 30;
        const d = `M ${conn.from.x} ${conn.from.y} Q ${midX} ${controlY} ${conn.to.x} ${conn.to.y}`;

        return (
          <path
            key={i}
            d={d}
            stroke="#cc3333"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
          />
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Integrate into Board.tsx**

Add refs and state management for string positions. This is the most involved wiring step.

Add these imports:
```tsx
import { useMemo, useRef, useCallback } from 'react';
import GuessNote from './board/GuessNote';
import RedStrings from './board/RedStrings';
import { useStringPositions } from '../hooks/useStringPositions';
```

Inside the `Board` component, add ref tracking:
```tsx
const corkRef = useRef<HTMLDivElement>(null);
const elementRefs = useRef<Map<string, HTMLElement | null>>(new Map());
const [corkSize, setCorkSize] = useState({ width: 0, height: 0 });

const setElementRef = useCallback((key: string, el: HTMLElement | null) => {
  elementRefs.current.set(key, el);
}, []);

// Measure cork surface for SVG dimensions
useEffect(() => {
  if (!corkRef.current) return;
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    setCorkSize({ width, height });
  });
  observer.observe(corkRef.current);
  return () => observer.disconnect();
}, []);
```

Build guess data and connections:
```tsx
const guessData = useMemo(() => {
  if (!gameState?.guesses) return [];
  return gameState.guesses
    .map((guess, playerIndex) => {
      if (!guess || typeof guess !== 'object') return null;
      const accuserName = gameState.playerNames[gameState.playerOrder[playerIndex]];
      const accusedPid = gameState.playerOrder[guess.player];
      const accusedName = gameState.playerNames[accusedPid];
      const isWrong = gameState.finished && !(
        gameState.murdererChoice &&
        guess.mean === gameState.murdererChoice.mean &&
        guess.key === gameState.murdererChoice.key
      );
      return {
        playerIndex,
        accuserName,
        accusedName,
        accusedPid,
        mean: guess.mean,
        evidenceKey: guess.key,
        isWrong,
      };
    })
    .filter(Boolean) as Array<{
      playerIndex: number;
      accuserName: string;
      accusedName: string;
      accusedPid: number;
      mean: string;
      evidenceKey: string;
      isWrong: boolean;
    }>;
}, [gameState]);

const stringConnections = useMemo(() => {
  return guessData.map((g) => ({
    fromKey: `guess-${g.playerIndex}`,
    toKey: `card-${g.accusedPid}`,
  }));
}, [guessData]);

const guessNoteRotations = useMemo(() => {
  return guessData.map(() => Math.floor(3 - Math.random() * 6));
}, [guessData.length]);

const stringPositions = useStringPositions(corkRef, elementRefs.current, stringConnections);
```

Pass `ref={corkRef}` to the cork surface `<Box>` inside CorkBoard. Since CorkBoard wraps children, the cork ref needs to be on the cork `<Box>`. Update `CorkBoard` to accept and forward a `corkRef` prop:

In `CorkBoard.tsx`, add to props:
```tsx
interface CorkBoardProps {
  children: ReactNode;
  corkRef?: React.Ref<HTMLDivElement>;
}
```

And apply it to the cork surface Box: `ref={corkRef}`.

In `Board.tsx`, pass it: `<CorkBoard corkRef={corkRef}>`.

Add card refs to each PolaroidCard wrapper:
```tsx
<Box
  key={player.id}
  ref={(el: HTMLDivElement | null) => setElementRef(`card-${player.id}`, el)}
  sx={{ width: 220 }}
>
```

Render guess notes below the suspects row:
```tsx
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
  {guessData.map((guess, i) => (
    <GuessNote
      key={guess.playerIndex}
      ref={(el: HTMLDivElement | null) => setElementRef(`guess-${guess.playerIndex}`, el)}
      accuserName={guess.accuserName}
      accusedName={guess.accusedName}
      mean={guess.mean}
      evidenceKey={guess.evidenceKey}
      isWrong={guess.isWrong}
      rotation={guessNoteRotations[i]}
      moLabel={t('the M.O. was')}
      keyEvidenceLabel={t('and the key evidence was')}
      saidThatLabel={t('said that')}
      didItLabel={t('did it')}
    />
  ))}
</Box>
```

Render the SVG overlay as a direct child of the cork surface (inside CorkBoard, as a sibling of other content):
```tsx
<RedStrings
  connections={stringPositions}
  width={corkSize.width}
  height={corkSize.height}
/>
```

- [ ] **Step 5: Verify visually**

Run: `npm run dev`
Expected: When a guess exists in the game state, a yellowed pinned note appears with the guess text in handwriting. A red curved string connects it to the accused player's polaroid pushpin. If the game is finished and the guess was wrong, the text is struck through in red.

- [ ] **Step 6: Type check**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useStringPositions.ts src/components/board/GuessNote.tsx src/components/board/RedStrings.tsx src/components/board/CorkBoard.tsx src/components/Board.tsx
git commit -m "feat: add guess notes with red string connections between suspects"
```

---

### Task 5: Coffee Stains and Aging Effects

Add decorative coffee ring stains and final aging polish.

**Files:**
- Create: `src/components/board/CoffeeStains.tsx`
- Modify: `src/components/board/CorkBoard.tsx`

- [ ] **Step 1: Create `src/components/board/CoffeeStains.tsx`**

```tsx
import Box from '@mui/material/Box';

interface Stain {
  top: string;
  left: string;
  size: number;
  opacity: number;
}

const STAINS: Stain[] = [
  { top: '15%', left: '72%', size: 90, opacity: 0.12 },
  { top: '78%', left: '8%', size: 70, opacity: 0.08 },
];

export default function CoffeeStains() {
  return (
    <>
      {STAINS.map((stain, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: stain.top,
            left: stain.left,
            width: stain.size,
            height: stain.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 45%, rgba(101, 67, 33, ${stain.opacity}) 50%, rgba(101, 67, 33, ${stain.opacity * 0.7}) 55%, transparent 60%)`,
            filter: 'blur(1px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Add CoffeeStains to CorkBoard**

In `CorkBoard.tsx`, import and render `CoffeeStains` as a child of the cork surface, before `{children}`:

```tsx
import CoffeeStains from './CoffeeStains';
```

Inside the cork surface Box:
```tsx
<CoffeeStains />
{children}
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev`
Expected: Two subtle brown coffee ring stains visible on the cork surface — one in the upper-right area, one in the lower-left. They should be faint enough to not interfere with content but visible enough to add atmosphere.

- [ ] **Step 4: Type check**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/CoffeeStains.tsx src/components/board/CorkBoard.tsx
git commit -m "feat: add coffee stains and aging effects to murder board"
```

---

### Task 6: Board Header and Final Layout Polish

Pin the game title and round counter to the board, remove any leftover old layout code, and do final cleanup.

**Files:**
- Modify: `src/components/Board.tsx`

- [ ] **Step 1: Style the board header**

The game title and round counter should look like a pinned case label. Update the title section in Board.tsx:

```tsx
<Box
  sx={{
    position: 'relative',
    display: 'inline-block',
    mb: 1,
  }}
>
  <Pushpin color="#094067" />
  <Box
    sx={{
      bgcolor: '#f8f6f0',
      px: 2,
      py: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    }}
  >
    <Typography
      sx={{
        fontFamily: '"kingthings_trypewriter_2Rg", serif',
        fontSize: '1.5rem',
        color: '#094067',
        letterSpacing: '-1px',
      }}
    >
      {t('Game')} — {t('Round')} {gameState.round} {t('of')} 3
    </Typography>
    <Typography
      sx={{
        fontFamily: '"kingthings_trypewriter_2Rg", serif',
        fontSize: '0.9rem',
        color: '#5f6c7b',
        letterSpacing: '-1px',
      }}
    >
      {t('Suspects of the crime:')}
    </Typography>
  </Box>
</Box>
```

- [ ] **Step 2: Clean up Board.tsx**

Remove any remaining unused imports and dead code from the old layout. Ensure the final component has clean imports:

```tsx
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import { useStringPositions } from '../hooks/useStringPositions';
import CorkBoard from './board/CorkBoard';
import PolaroidCard from './board/PolaroidCard';
import ForensicSheet from './board/ForensicSheet';
import GuessNote from './board/GuessNote';
import RedStrings from './board/RedStrings';
import Pushpin from './board/Pushpin';
```

- [ ] **Step 3: Verify the full board visually**

Run: `npm run dev`
Expected: Complete murder board — dark wall, wooden-framed cork surface, polaroid suspect cards with pushpins, forensic analysis sheet with glued-on notes, guess notes with red strings connecting to accused players, coffee stains, all with the correct typography. The board fills the viewport without scrolling.

- [ ] **Step 4: Type check and lint**

Run: `npm run build && npm run lint`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Board.tsx
git commit -m "feat: finalize murder board layout with pinned header and cleanup"
```
