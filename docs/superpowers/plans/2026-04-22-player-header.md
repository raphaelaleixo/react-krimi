# Player Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared header (logo, room code button with `RoomInfoModal`, optional seat-number stamp) to every player view.

**Architecture:** New `PlayerHeader.tsx` component mounted inside both `renderReady` and `renderStarted` callbacks of `PlayerScreen` in `Player.tsx`. The seat stamp reuses the distressed-circle pattern from `CasePolaroid.tsx`; that helper is extracted into a small shared module so both consumers can import it.

**Tech Stack:** React 19, TypeScript, MUI 9, `react-gameroom` (`RoomInfoModal`), existing typewriter/script fonts.

**Reference files:**
- Spec: `docs/superpowers/specs/2026-04-22-player-header-design.md`
- Reference implementation pattern (different codebase — DO NOT edit): `/Users/raphaelavellar/Documents/Projects/react-unmatched/src/components/AppHeader.tsx`
- `src/components/board/CasePolaroid.tsx` — source of the distressed circle stamp pattern being extracted.
- `src/pages/Player.tsx` — where the header is mounted.

**Testing notes:** No automated test runner (`CLAUDE.md`). Verification is `npm run lint`, `npm run build`, and manual browser testing via `npm run dev` (Task 5).

---

### Task 1: Extract `generateDistressedCircle` into a shared module

**Files:**
- Create: `src/components/board/distressedStamp.ts`
- Modify: `src/components/board/CasePolaroid.tsx` (remove local function, import from new module)

- [ ] **Step 1: Create the new helper module**

Create `src/components/board/distressedStamp.ts` with this exact content:

```ts
export function generateDistressedCircle(): string {
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
```

This is verbatim the current `generateDistressedCircle` at `CasePolaroid.tsx:22-34`.

- [ ] **Step 2: Update `CasePolaroid.tsx` to import from the new module**

In `src/components/board/CasePolaroid.tsx`:

1. Add this import near the other local-component imports (just below the existing `useI18n` import, which is currently on line 6):

```tsx
import { generateDistressedCircle } from './distressedStamp';
```

2. Delete the entire local `generateDistressedCircle` function definition currently at lines 22-34 (from `function generateDistressedCircle() {` through the closing `}` on line 34). Leave the preceding `generateDistressedLine` function untouched, and leave the blank line between the deleted function and the following `interface CasePolaroidProps`.

Do NOT change any other code in the file — in particular, the `useMemo` call on line 46-49 (which invokes `generateDistressedCircle`) and the `CasePolaroid` JSX (lines 60-196) stay exactly as they are. The imported function has the same signature and behaviour as the deleted local one.

- [ ] **Step 3: Run build + lint**

Run: `npm run build`
Expected: build succeeds, no TS errors, no "unused variable" warnings.

Run: `npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/distressedStamp.ts src/components/board/CasePolaroid.tsx
git commit -m "refactor(board): extract generateDistressedCircle into shared helper"
```

---

### Task 2: Add new i18n keys for `RoomInfoModal` labels

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Append a new commented block at the end of the translations object**

Open `src/i18n/translations.ts`. Scroll to the last commented group (currently `// PlayerJoin restyle — added 2026-04-22`). After its last entry, add a blank line and then this block. It must go BEFORE the closing `};` of the object:

```ts
  // PlayerHeader — added 2026-04-22
  'Room:': 'Sala:',
  'Join': 'Entrar',
  'Join link for': 'Link de acesso para',
  'Rejoin': 'Voltar ao jogo',
  'Rejoin link for': 'Link de retorno para',
```

Do NOT reorder or edit any existing entry. The existing `'Close'` (line 27) and `'Case'` (line 64) keys will be reused in later tasks; they already exist and are not touched here.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "i18n: add PlayerHeader / RoomInfoModal strings"
```

---

### Task 3: Create the `PlayerHeader` component

**Files:**
- Create: `src/components/board/PlayerHeader.tsx`

- [ ] **Step 1: Create the component file with the full implementation**

Create `src/components/board/PlayerHeader.tsx` with this exact content:

```tsx
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RoomInfoModal, type RoomState } from 'react-gameroom';
import { DirectionalLink as RouterLink } from '../../router/DirectionalLink';
import { useI18n } from '../../hooks/useI18n';
import { generateDistressedCircle } from './distressedStamp';
import logo from '../../assets/logo.svg';
import type { KrimiGameState } from '../../types';

interface PlayerHeaderProps {
  roomState: RoomState;
  playerId: number;
  gameState: KrimiGameState | null;
}

export default function PlayerHeader({ roomState, playerId, gameState }: PlayerHeaderProps) {
  const { t } = useI18n();
  const [showInfo, setShowInfo] = useState(false);

  const stampClipPath = useMemo(() => generateDistressedCircle(), []);

  const seat =
    gameState && gameState.playerOrder.includes(playerId)
      ? gameState.playerOrder.indexOf(playerId) + 1
      : null;

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        minHeight: 56,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Box
        component={RouterLink}
        to="/"
        aria-label="Home"
        sx={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <Box
          component="img"
          src={logo}
          alt="Krimi"
          sx={{ height: 36, display: 'block' }}
        />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Button
        variant="text"
        onClick={() => setShowInfo(true)}
        aria-label={`${t('Room:')} ${roomState.roomId}`}
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#1C1B1B',
          whiteSpace: 'nowrap',
          minWidth: 0,
          px: 1.5,
          py: 0.5,
        }}
      >
        {t('Case')}#{roomState.roomId}
      </Button>

      {seat !== null && (
        <Box
          aria-label={`${t('Player')} ${seat}`}
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'var(--weapon-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-5deg)',
            clipPath: stampClipPath,
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--weapon-color)',
              lineHeight: 1,
            }}
          >
            {seat}
          </Box>
        </Box>
      )}

      <RoomInfoModal
        roomState={roomState}
        open={showInfo}
        onClose={() => setShowInfo(false)}
        labels={{
          close: t('Close'),
          roomHeading: t('Room:'),
          joinLink: t('Join'),
          joinLinkAria: t('Join link for'),
          rejoinLink: t('Rejoin'),
          rejoinLinkAria: t('Rejoin link for'),
        }}
      />
    </Box>
  );
}
```

Notes on this implementation:
- `RoomState` is imported as a type from `react-gameroom` (it's already re-exported there; see existing import in `src/components/board/CasePolaroid.tsx` and the `RoomInfoModal` types at `node_modules/react-gameroom/dist/index.d.ts:320`).
- `KrimiGameState` is imported from `../../types` (matches the relative depth from `src/components/board/`). For reference, `src/components/ForensicAnalysis.tsx:11` uses `from '../types'` because it's one level shallower.
- `DirectionalLink` is imported from `../../router/DirectionalLink` (same path pattern used from `board/` subfolder elsewhere).
- `logo` is imported from `../../assets/logo.svg` (matches Home's `import logo from '../assets/logo.svg'` adjusted for depth).
- The distressed stamp clip-path is memoised once per mount so it doesn't re-roll on re-renders.
- The seat stamp is rendered inline (not conditional on `gameState === null` separately from the `playerOrder.includes` check) — both conditions collapse into `seat !== null`.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds, no TS errors. If there's an error about `RoomState` not being exported as a type, verify the import line reads `import { RoomInfoModal, type RoomState } from 'react-gameroom';` — this form uses the named type export.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no new errors or warnings. The file imports `useState`, `useMemo`, `Box`, `Button`, `RoomInfoModal`, `RoomState`, `RouterLink`, `useI18n`, `generateDistressedCircle`, `logo`, `KrimiGameState` — every one is used inside the component.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/PlayerHeader.tsx
git commit -m "feat(board): add PlayerHeader with room code and seat stamp"
```

---

### Task 4: Mount `PlayerHeader` in `Player.tsx`

**Files:**
- Modify: `src/pages/Player.tsx`

- [ ] **Step 1: Add the import**

Open `src/pages/Player.tsx`. In the imports block at the top (currently lines 1-14), add one new import after the existing component imports. The imports currently ending with:

```tsx
import Detective from '../components/Detective';
import ForensicAnalysis from '../components/ForensicAnalysis';
import PickPhase from '../components/PickPhase';
import { isRolesRevealed } from '../utils/rules';
```

Add one line between the last component import and the `isRolesRevealed` import so the block becomes:

```tsx
import Detective from '../components/Detective';
import ForensicAnalysis from '../components/ForensicAnalysis';
import PickPhase from '../components/PickPhase';
import PlayerHeader from '../components/board/PlayerHeader';
import { isRolesRevealed } from '../utils/rules';
```

- [ ] **Step 2: Wrap the `renderReady` return in a fragment that includes the header**

The current `renderReady` callback (lines 53-72 of the file) returns a `<Container>...</Container>`. Replace just the inside of `renderReady={() => ( ... )}` so that the Container is wrapped in a fragment alongside `<PlayerHeader />`. The resulting `renderReady` prop should read:

```tsx
      renderReady={() => (
        <>
          <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
          <Container sx={{ height: '100vh' }}>
            <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {t('You are in room')}{' '}
                  <Box
                    component="code"
                    sx={{ color: 'error.main', textTransform: 'uppercase' }}
                  >
                    {roomState.roomId}
                  </Box>
                </Typography>
                <Typography variant="subtitle1">
                  {t('Waiting for the game start')}
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
```

The only differences from the current code are the surrounding `<>` and `</>` and the new `<PlayerHeader />` as the first child. Everything inside the `<Container>` stays byte-identical.

- [ ] **Step 3: Refactor the `renderStarted` callback to wrap its child in a fragment with the header**

The current `renderStarted` (lines 73-84) returns one of three components directly or `notFound`. Replace the entire `renderStarted` prop with this version — it short-circuits the `notFound` case before rendering the header (because `notFound` is shown without the header), and wraps the final child in a fragment:

```tsx
      renderStarted={() => {
        if (!gameState) return null;
        const playerOrderIndex = gameState.playerOrder.indexOf(playerId);
        if (playerOrderIndex === -1) return notFound;
        let child;
        if (playerOrderIndex === gameState.detective) {
          child = <ForensicAnalysis gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
        } else if (!isRolesRevealed(gameState)) {
          child = <PickPhase gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
        } else {
          child = <Detective gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
        }
        return (
          <>
            <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
            {child}
          </>
        );
      }}
```

The three `return <…>` branches that previously returned directly are now unified into a single `return (<> … </>)` after the branch chooses which component to render. Props passed to `ForensicAnalysis`, `PickPhase`, and `Detective` are unchanged.

`renderEmpty` and the loading spinner at the top of the file are NOT touched.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: build succeeds, no TS errors. The main thing to watch for: make sure nothing else in the file references an implicit return shape that the fragment might break (e.g., if `PlayerScreen` required a single element). Spec confirms `react-gameroom` accepts any ReactNode here.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: no new errors or warnings. If lint flags an unused var in a branch, re-check Step 3 — `child` should be read exactly once inside the returned fragment.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Player.tsx
git commit -m "feat(player): mount PlayerHeader on ready + started views"
```

---

### Task 5: Manual browser verification

**Files:** none (manual QA)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite starts without compile errors.

- [ ] **Step 2: Verify the waiting state**

1. From Home, click `New game` (English). Note the room code on the host page.
2. Open a second browser window / device and go to `/room/<code>/player`, enter a nickname, submit.
3. On the resulting waiting page, verify the header:
   - Krimi logo on the far left (36px tall).
   - `CASE#<CODE>` button in typewriter uppercase on the right.
   - NO seat stamp (game hasn't started yet — the red circle must not appear).
   - A subtle drop shadow along the header's bottom edge.
   - The header stays at the top as you scroll (if the waiting content is tall enough to scroll; on desktop it likely isn't — resize the window small to test).

- [ ] **Step 3: Verify the room code button opens `RoomInfoModal`**

1. Click the `CASE#<CODE>` button.
2. Verify the `RoomInfoModal` opens with the room QR, the player-name rejoin links (if any), and a close button with an aria-label of "Fechar" (pt_br) or "Close" (en) depending on language.
3. Click close. The modal dismisses. Click the button again — it still works.

- [ ] **Step 4: Verify the logo link**

1. Click the Krimi logo in the header.
2. Verify the page navigates to `/`.

- [ ] **Step 5: Verify the seat stamp appears once the game starts**

1. Go back to the host page and start the game (add enough players to reach `minPlayers` if needed — open 3+ player tabs).
2. On each player's window, verify the seat stamp appears at the far right of the header:
   - A red (weapon-color) distressed circle, rotated ~-5deg.
   - The number inside matches the player's 1-indexed seat (the first player in `gameState.playerOrder` shows `1`, the detective shows whichever seat they sit in).
3. Check the number matches across devices — e.g., the player whose name is at index 2 in the host's playerOrder sees `3` on their header.

- [ ] **Step 6: Verify the header appears on every in-game view**

1. Still in-game, verify the header is visible on:
   - The `PickPhase` view (before the detective submits).
   - The `ForensicAnalysis` view (on the detective's device).
   - The `Detective` view (after the detective submits, on the investigator / murderer devices).

- [ ] **Step 7: Verify Portuguese translation**

1. Go back to Home, switch to Portuguese, create a new game.
2. Join as a player, verify the button reads `CASO#<CODE>`.
3. Open the room modal and verify the heading reads `Sala: <CODE>` and the close label is `Fechar`.
4. Once the game starts (and if there are `Join`/`Rejoin` links in the modal), they should render as `Entrar` / `Voltar ao jogo`.

- [ ] **Step 8: Verify the "player not found" case still renders without the header**

1. In a fresh browser tab, manually navigate to `/room/<valid-room-code>/player/999` (a playerId that does not exist in the room).
2. Confirm the existing "Player not found in this game." Container renders as before, with NO header above it.

- [ ] **Step 9: Stop the dev server and confirm the tree is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

---

## Self-review notes

- **Spec coverage:**
  - Logo (left, link to `/`): ✓ Task 3 Step 1 (`<RouterLink to="/">` wrapping `<img src={logo} />`).
  - Case# button opening `RoomInfoModal`: ✓ Task 3 Step 1 (`Button` with `onClick` + state; `RoomInfoModal` with `open`/`onClose`/`labels`).
  - Seat stamp reuse of distressed circle pattern: ✓ Task 1 extracts; Task 3 uses.
  - Seat hidden when pre-game: ✓ Task 3 Step 1 (`seat !== null && …`).
  - Mounting on `renderReady` and `renderStarted` only: ✓ Task 4 Step 2 and Step 3 (and `notFound` is returned before the fragment).
  - i18n for modal labels: ✓ Task 2 (keys added) + Task 3 (used in `labels`).
  - Reused `'Close'` and `'Case'`: ✓ Task 3 passes them via `t('Close')` and uses `t('Case')` in the button.
  - No changes to `Detective`/`PickPhase`/`ForensicAnalysis`: ✓ None of them appear in any `Files` block in this plan.
- **Placeholder scan:** Every code block is complete. No TBDs, no "similar to Task N" references, no unstated requirements.
- **Type consistency:** `seat: number | null` is derived the same way everywhere it's used (once). `PlayerHeaderProps` signature in Task 3 exactly matches the call site in Task 4 (`roomState`, `playerId`, `gameState`).
