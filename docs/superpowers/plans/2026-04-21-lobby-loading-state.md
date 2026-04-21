# Lobby Loading State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated "Waiting…" note to the host lobby corkboard so it's visible at a glance that the game is waiting for more players, and signal when there are enough to start.

**Architecture:** A new standalone `LobbyWaitingNote` component renders on the right side of the corkboard — below the player masonry — in the same spot that `GuessNote`s occupy during play. The headline uses a CSS `@keyframes` animation (emotion `keyframes` helper, scoped to the component) that drops each letter of `Waiting...` (10 chars) in and out, rest cycle 2 s. The subtitle reads from props and swaps text when the minimum-player threshold is reached. No new context state or Firebase changes — all data derives from `roomState` and `useRoomState()`, both already consumed by `Lobby.tsx`.

**Tech Stack:** React 19, TypeScript, MUI 9 (`Box`, `Typography`, `sx`), `@emotion/react` (`keyframes`), existing `react-gameroom` hooks.

**Testing note:** No test runner is configured in this project (see `CLAUDE.md`). Verification leans on `npm run lint` + `npm run build` after code changes, plus a manual end-to-end walkthrough in `npm run dev`. Steps reflect this.

---

## File Structure

**Create:**
- `src/components/board/LobbyWaitingNote.tsx` — self-contained paper-note component; owns its animation keyframes via `@emotion/react`'s `keyframes`; receives `remaining` + `canStart` props.

**Modify:**
- `src/i18n/translations.ts` — add three new translation keys.
- `src/components/Lobby.tsx` — import `LobbyWaitingNote`, render it under the masonry, derive `remaining` from `roomState.config.minPlayers - readyPlayers.length`.

---

## Task 1: Add i18n strings

**Files:**
- Modify: `src/i18n/translations.ts` (end of the translations object, before the closing `};`)

- [ ] **Step 1: Add the three new keys**

Open `src/i18n/translations.ts`. Immediately before the closing `};` on the last line, insert:

```ts
  // Lobby loading state — added 2026-04-21
  'Waiting...': 'Aguarde...',
  'Waiting for {n} more…': 'Aguardando mais {n}…',
  'We can start the game now': 'Podemos começar o jogo',
```

Keep the trailing comma on whatever key was previously last so the object stays well-formed. The last existing key currently ends with `,` already (line 134), so just paste the block above before the `};`.

- [ ] **Step 2: Verify the file type-checks**

Run: `npm run lint`
Expected: No new errors. (If ESLint reports existing warnings elsewhere, ignore them — only our diff matters.)

Run: `npx tsc -b --noEmit` (or `npm run build` to also type-check)
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat(i18n): add lobby loading-state strings"
```

---

## Task 2: Create `LobbyWaitingNote` component

**Files:**
- Create: `src/components/board/LobbyWaitingNote.tsx`

- [ ] **Step 1: Create the file with imports and prop type**

Create `src/components/board/LobbyWaitingNote.tsx` with this initial scaffold (we'll fill in the body next):

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';

interface LobbyWaitingNoteProps {
  remaining: number;    // minPlayers - readyPlayers.length, clamped to >= 0
  canStart: boolean;
}

export default function LobbyWaitingNote({ remaining, canStart }: LobbyWaitingNoteProps) {
  const { t } = useI18n();
  return null;
}
```

- [ ] **Step 2: Define the `@keyframes` cascade**

Inside the file, above the `export default function` line, add the keyframes. This is a verbatim adaptation of the user-supplied snippet, with 10 letter slots (matching the 10-char `Waiting...` / `Aguarde...` headlines). Insert:

```tsx
const loadingDrop = keyframes`
  0% { text-shadow:
    calc( 0 * var(--w)) -1.2em currentColor, calc(-1 * var(--w)) -1.2em currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  4% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) -1.2em currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  8% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  12% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  16% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  20% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  24% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  28% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  32% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  36% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  40%, 60% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) 0 currentColor; }
  64% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  68% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  72% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  76% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  80% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  84% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  88% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  92% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  96% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 1.2em currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  100% { text-shadow:
    calc( 0 * var(--w)) 1.2em currentColor, calc(-1 * var(--w)) 1.2em currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
`;
```

- [ ] **Step 3: Implement the render body**

Replace the `return null;` line inside the function with the full JSX below:

```tsx
  const headline = t('Waiting...');
  const subtitle = canStart
    ? t('We can start the game now')
    : t('Waiting for {n} more…').replace('{n}', String(remaining));

  return (
    <Box
      sx={{
        position: 'relative',
        width: 260,
        mx: 'auto',
        mt: 4,
        bgcolor: '#f8f6f0',
        color: 'var(--text-color)',
        px: 3,
        py: 2.5,
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}
    >
      <Pushpin color="#4a7c59" />

      <Box
        component="span"
        aria-label={headline}
        sx={{
          '--w': '1ch',
          display: 'inline-block',
          fontFamily: 'var(--font-typewriter)',
          fontSize: '2rem',
          lineHeight: 1.2,
          fontWeight: 'bold',
          letterSpacing: 'var(--w)',
          width: 'calc(var(--w) * 10)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          color: 'transparent',
          animation: `${loadingDrop} 2s infinite`,
          '&::before': {
            content: 'attr(data-text)',
          },
        }}
        // data attribute is read by ::before content: attr(data-text)
        {...{ 'data-text': headline }}
      />

      <Typography
        aria-live="polite"
        sx={{
          mt: 1,
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.9rem',
          letterSpacing: '1px',
          color: '#5f6c7b',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
```

**Why `--w: 1ch` (not `10ch`):** the keyframes are written in terms of `calc(-N * var(--w))`, meaning each shadow copy is offset by `N` letter-widths. With `letter-spacing: var(--w)` = `1ch`, characters render 1ch apart (natural monospace-ish spacing); the shadow offsets still span the full 10 positions because they multiply by `N`. `width: calc(var(--w) * 10)` gives us a 10ch-wide window that clips the full string. This keeps the visual letter spacing sane while preserving the cascade math.

- [ ] **Step 4: Verify it lints and type-checks**

Run: `npm run lint`
Expected: No errors relating to the new file. If ESLint flags the `{...{ 'data-text': headline }}` spread pattern, rewrite as a normal prop: remove the spread and change the opening `<Box component="span"` attribute list to end with `data-text={headline}` directly (TypeScript allows `data-*` attributes on DOM elements).

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/LobbyWaitingNote.tsx
git commit -m "feat(lobby): add LobbyWaitingNote with drop-in animation"
```

---

## Task 3: Wire `LobbyWaitingNote` into `Lobby.tsx`

**Files:**
- Modify: `src/components/Lobby.tsx:1-13` (add import), `src/components/Lobby.tsx:107-141` (render under the masonry)

- [ ] **Step 1: Add the import**

In `src/components/Lobby.tsx`, add this import next to the other `./board/*` imports (currently lines 8-11):

```tsx
import LobbyWaitingNote from './board/LobbyWaitingNote';
```

After the change, that block should read:

```tsx
import CorkBoard from './board/CorkBoard';
import CasePolaroid from './board/CasePolaroid';
import AssigningCaseSheet from './board/AssigningCaseSheet';
import PlayerFile from './board/PlayerFile';
import LobbyWaitingNote from './board/LobbyWaitingNote';
```

- [ ] **Step 2: Render the note under the masonry**

Locate the right-side column block (starts at `src/components/Lobby.tsx:107`):

```tsx
        <Box sx={{ flex: 3 }}>
          <Box
            ref={masonryRef}
            sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}
          >
            <AnimatePresence>
              {/* existing investigator cards */}
            </AnimatePresence>
          </Box>
        </Box>
```

Add a `LobbyWaitingNote` sibling **inside** `<Box sx={{ flex: 3 }}>`, **after** the masonry `<Box ref={masonryRef}>` block. Final shape:

```tsx
        <Box sx={{ flex: 3 }}>
          <Box
            ref={masonryRef}
            sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}
          >
            <AnimatePresence>
              {/* existing investigator cards — leave this block unchanged */}
            </AnimatePresence>
          </Box>

          <LobbyWaitingNote
            remaining={Math.max(0, roomState.config.minPlayers - readyPlayers.length)}
            canStart={canStart}
          />
        </Box>
```

`roomState` is already non-null here because of the early `if (!roomState) return null;` guard on line 82, and `minPlayers` is on `roomState.config` (same shape as `maxPlayers`, already used on line 98).

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint`
Expected: No errors.

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev` and open the dev URL.

Walk through:

1. On Home, click **New game** (English). You land on the host room screen.
2. Confirm the corkboard shows the new note below the empty masonry: headline `Waiting...` animates (letters drop in, rest, drop out, repeat), subtitle reads `Waiting for 5 more…` (or whatever the default `minPlayers` is — see `GameContext.tsx:99`).
3. Open the join URL from the QR polaroid on a second device (or second browser window in private mode). Join as a player. On the host screen, the subtitle count should decrement by 1 (`Waiting for 4 more…`).
4. Add players until `readyPlayers.length === minPlayers`. The subtitle switches to `We can start the game now`; the `Start investigation` stamp becomes enabled. The headline keeps animating.
5. Back on Home, toggle to Portuguese and create a fresh room. Verify `Aguarde...` animates and `Aguardando mais N…` / `Podemos começar o jogo` render correctly.
6. Click `Start investigation`. The Lobby unmounts; the note disappears with it; the Board renders.

If anything misrenders (e.g., letter-spacing looks wrong, the note is clipped, the subtitle text shifts), stop and diagnose before committing — don't push visual regressions.

- [ ] **Step 5: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "feat(lobby): render waiting note under investigator masonry"
```

---

## Self-Review

**Spec coverage (2026-04-21-lobby-loading-state-design.md):**

| Spec section | Task |
|---|---|
| Goals — loading note in right column | Task 3 step 2 |
| Goals — `Waiting...` / `Aguarde...` drop animation | Task 2 steps 2-3 |
| Goals — subtitle with `remaining` or `canStart` copy | Task 2 step 3 |
| Goals — typewriter font + off-white paper + pushpin | Task 2 step 3 |
| Goals — unmounts naturally with Lobby | Inherent (no extra gating added) |
| Decisions #1, #8 — placement inside `<Box sx={{ flex: 3 }}>` under masonry | Task 3 step 2 |
| Decisions #2 — new file at `src/components/board/LobbyWaitingNote.tsx` | Task 2 step 1 |
| Decisions #3 — 10-char headlines in both languages | Task 1 (strings) + Task 2 step 2 (cascade width) |
| Decisions #4 — verbatim CSS keyframes via emotion `keyframes` | Task 2 step 2 |
| Decisions #5 — typewriter font, `var(--text-color)` | Task 2 step 3 (`currentColor` picks up the paper's `color: 'var(--text-color)'`) |
| Decisions #6 — off-white `#f8f6f0`, shadow, single pushpin | Task 2 step 3 |
| Decisions #7 — subtitle swaps in place | Task 2 step 3 |
| Decisions #9 — `Math.max(0, minPlayers - readyPlayers.length)` | Task 3 step 2 |
| Decisions #10 — inline `.replace('{n}', ...)` | Task 2 step 3 |
| Component API — `LobbyWaitingNoteProps` | Task 2 step 1 |
| Integration example | Task 3 step 2 |
| i18n — three new keys | Task 1 step 1 |
| Animation CSS | Task 2 step 2 |
| Testing (manual) | Task 3 step 4 |

No gaps.

**Placeholder scan:** No TBDs, TODOs, "similar to…" references, or undefined function names. Every code step is complete.

**Type consistency:** `LobbyWaitingNoteProps` fields (`remaining: number`, `canStart: boolean`) match both the component implementation (Task 2 step 3) and the caller (Task 3 step 2). `t()` signature matches existing usage. `roomState.config.minPlayers` matches the `maxPlayers` read pattern already in `Lobby.tsx:98`.
