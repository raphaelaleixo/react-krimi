# Rejoin players page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `/room/:id/players` into `/room/:id/player` — one mobile-player route that renders the existing nickname form when the room is in lobby and a rejoin list of `PlayerFile` cards when the game has started.

**Architecture:** Single-file branch inside `src/pages/PlayerJoin.tsx`. It subscribes via `GameContext.loadRoom`, reads `roomState.status`, and renders one of four views: loading spinner, "room not found" card, nickname form (existing), or rejoin list (new). The separate `/players` route and its stub are deleted. `src/pages/Join.tsx`'s "Resume as player" path is simplified to always navigate to `/room/:code/player`.

**Tech Stack:** React 19, TypeScript, MUI 9, `react-gameroom` (for `useRoomState`), Firebase RTDB via existing `GameContext`, React Router 7.

**Testing note:** No test runner is configured in this repo (see `CLAUDE.md`). Each task's verification is `npm run lint` + `npm run build` passing, plus manual browser checks called out per task. TDD steps are adapted accordingly — no test file is written.

**Spec:** `docs/superpowers/specs/2026-04-22-rejoin-players-page-design.md`

---

## Task 1: Add the two new i18n keys

**Files:**
- Modify: `src/i18n/translations.ts` (add two entries alongside the existing `'Room not found. Check the code and try again.'` line around line 100)

The `PlayerJoin` "Room not found" state renders a heading + subtitle layout, which needs two new split keys. We add them first so Task 2 can reference them without a dangling string.

- [ ] **Step 1: Add the new keys**

Open `src/i18n/translations.ts` and locate the block with `'Room not found. Check the code and try again.'` (around line 100). After that entry and before the `// Rejoin (placeholder /room/:id/players) — added 2026-04-20` section header, insert these two entries:

```ts
  'Room not found': 'Sala não encontrada',
  'Check the code and try again.': 'Verifique o código e tente novamente.',
```

Leave the existing `'Room not found. Check the code and try again.'` entry in place — `src/pages/Join.tsx` still uses it. The two new keys are purely additive.

- [ ] **Step 2: Verify lint + type-check + build**

Run:

```bash
npm run lint && npm run build
```

Expected: both succeed. No source files import these keys yet, but they're valid entries in the translation map, so nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "i18n: add 'Room not found' heading + subtitle keys"
```

---

## Task 2: Expand `PlayerJoin.tsx` to handle all four render branches

**Files:**
- Modify: `src/pages/PlayerJoin.tsx` (rewrite the component body; keep the file name and default export)

This is the core change. The existing file renders only the nickname form. We extend it to render a loading spinner, a "Room not found" state, the nickname form (unchanged behavior), or the rejoin list — selected by `roomState` / `loading` / `roomState.status`.

Key implementation notes:

- Keep the existing `loadRoom(roomId)` effect — that subscribes via Firebase `onValue`, so `roomState` stays live. When the host starts the game, `roomState.status` flips and the view swaps automatically.
- Reuse `useRoomState(roomState).readyPlayers` (same as `Lobby.tsx`) to get the joined-slot list. Preserve the original slot index via `.map((slot, index) => …)` so player numbers match what the lobby shows.
- Duplicate the `randomRotation` / `randomOffset` helpers from `Lobby.tsx` locally — they're 3-line functions, YAGNI says don't extract yet.
- Memoize `cardRotations` and `cardOffsets` keyed on a stable join of the slot ids, same pattern as `Lobby.tsx`, so values don't re-roll on every Firebase update.
- Wrap each `PlayerFile` in a `DirectionalLink` to `/room/:id/player/:playerId`. Link styled with `textDecoration: 'none', color: 'inherit', display: 'block'`.
- The "Started" branch uses `PlayerHeader` with `showRoomCode={true}`. The "Lobby" branch keeps today's `showRoomCode={false}`.

- [ ] **Step 1: Replace the file contents**

Overwrite `src/pages/PlayerJoin.tsx` with this exact code:

```tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import { useDirectionalNavigate } from '../router/useDirectionalNavigate';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useRoomState, type RoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiPlayerData } from '../types';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PlayerFile from '../components/board/PlayerFile';
import PlayerHeader from '../components/board/PlayerHeader';
import TapedNoteButton from '../components/board/TapedNoteButton';
import StampButton from '../components/board/StampButton';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function randomOffset() {
  return Math.floor(Math.random() * 20) - 10;
}

export default function PlayerJoin() {
  const navigate = useDirectionalNavigate();
  const { id: roomId = '' } = useParams<{ id: string }>();
  const { roomState, loading, joinRoom, loadRoom } = useGame();

  useEffect(() => {
    if (roomId) loadRoom(roomId);
  }, [roomId, loadRoom]);

  // Loading spinner while the first Firebase snapshot resolves.
  if (loading && !roomState) {
    return (
      <BoardSurface>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100dvh',
          }}
        >
          <CircularProgress />
        </Box>
      </BoardSurface>
    );
  }

  // Room does not exist.
  if (!loading && !roomState) {
    return <RoomNotFoundView />;
  }

  // roomState is guaranteed non-null past this point.
  if (roomState!.status === 'started') {
    return <RejoinView roomId={roomId} roomState={roomState!} />;
  }

  // Lobby: existing nickname form.
  return (
    <LobbyView
      roomId={roomId}
      roomState={roomState!}
      joinRoom={joinRoom}
      onJoined={(playerId) => navigate(`/room/${roomId}/player/${playerId}`)}
    />
  );
}

function RoomNotFoundView() {
  const { t } = useI18n();
  return (
    <BoardSurface>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          py: 6,
        }}
      >
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Room not found')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Check the code and try again.')}
          </Typography>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TapedNoteButton rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </TapedNoteButton>
        </Box>
      </Container>
    </BoardSurface>
  );
}

interface RejoinViewProps {
  roomId: string;
  roomState: RoomState<KrimiPlayerData>;
}

function RejoinView({ roomId, roomState }: RejoinViewProps) {
  const { t } = useI18n();
  const { readyPlayers } = useRoomState(roomState);

  const slotIdsKey = readyPlayers.map((s) => s.id).join(',');
  const cardRotations = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => {
      map[s.id] = randomRotation();
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const cardOffsets = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => {
      map[s.id] = randomOffset();
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  return (
    <BoardSurface>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <PlayerHeader
          roomState={roomState}
          playerId={0}
          gameState={null}
          showRoomCode
        />
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            py: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Tap your name to rejoin')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {readyPlayers.map((slot, index) => (
              <Box
                key={slot.id}
                component={RouterLink}
                to={`/room/${roomId}/player/${slot.id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <PlayerFile
                  name={slot.name ?? ''}
                  slotLabel={`${t('Player')} ${index + 1}`}
                  rotation={cardRotations[slot.id] ?? 0}
                  offsetY={cardOffsets[slot.id] ?? 0}
                />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </BoardSurface>
  );
}

interface LobbyViewProps {
  roomId: string;
  roomState: RoomState<KrimiPlayerData>;
  joinRoom: (roomId: string, name: string) => Promise<number>;
  onJoined: (playerId: number) => void;
}

function LobbyView({ roomId, roomState, joinRoom, onJoined }: LobbyViewProps) {
  const { t } = useI18n();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nickname.trim()) {
        setError(t('Enter your nickname:'));
        return;
      }
      setError('');
      try {
        const playerId = await joinRoom(roomId, nickname.trim());
        onJoined(playerId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error joining game';
        setError(message);
      }
    },
    [joinRoom, nickname, onJoined, roomId, t],
  );

  return (
    <BoardSurface>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <PlayerHeader
          roomState={roomState}
          playerId={0}
          gameState={null}
          showRoomCode={false}
        />
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            py: 6,
          }}
        >
          <CaseFile>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-typewriter)',
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#1C1B1B',
                mb: 1,
                textAlign: 'center',
              }}
            >
              {t('Case')}#{roomId}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-typewriter)',
                color: '#1C1B1B',
                textAlign: 'center',
                mb: 3,
              }}
            >
              {t('Enter your nickname for the case file.')}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                label={t('Nickname')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                fullWidth
                variant="standard"
                sx={{
                  mb: 3,
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  },
                  '& .MuiInput-input': {
                    fontFamily: 'var(--font-script)',
                    fontSize: '1.75rem',
                    color: '#1C1B1B',
                  },
                }}
                required
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            fontFamily: 'var(--font-script)',
                            fontSize: '1.75rem',
                            color: '#1E3A8A',
                            opacity: 0.7,
                            lineHeight: 1,
                          }}
                        >
                          x
                        </Box>
                      </InputAdornment>
                    ),
                  },
                  inputLabel: { shrink: true },
                  htmlInput: { autoComplete: 'off' },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                  {t('Enter')}
                </StampButton>
              </Box>
            </Box>
          </CaseFile>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TapedNoteButton rotation={-2} component={RouterLink} to="/">
              {t('Back')}
            </TapedNoteButton>
          </Box>
        </Container>
      </Box>
    </BoardSurface>
  );
}
```

Notes on the changes versus the previous file:

- Added imports: `useMemo`, `CircularProgress`, `useRoomState`/`RoomState` from `react-gameroom`, `KrimiPlayerData` type, `PlayerFile` component. Removed `useState` from the top-level component (moved into `LobbyView`).
- Lobby branch (`LobbyView`) is functionally identical to today's `PlayerJoin` body, just lifted into a subcomponent that receives `joinRoom` and `onJoined` by props. Behavior (nickname validation, error alert, navigate on success, Back button, `showRoomCode={false}`) is preserved verbatim.
- Root-level effect still calls `loadRoom(roomId)` once per `roomId`.
- The `RejoinView` uses a simple vertical stack (`flexDirection: 'column', gap: 3`) — no grid, mobile-first.

- [ ] **Step 2: Verify lint + type-check + build**

Run:

```bash
npm run lint && npm run build
```

Expected: both succeed. The new imports (`useRoomState`, `RoomState`, `KrimiPlayerData`, `PlayerFile`, `CircularProgress`, `useMemo`) are all already used elsewhere in the codebase, so TypeScript will resolve them. If either command fails, re-read the error — usually a missed import or typo.

- [ ] **Step 3: Manual verification in browser**

Start the dev server:

```bash
npm run dev
```

Then in one browser tab, host a game: `/` → "New game" → lands on `/room/:id`. Share the room code via `/room/:id` "Case#XXXX" → rejoin link.

On another device (or a separate browser profile simulating mobile), test each branch at `/room/:id/player`:

1. **Unknown `:id`** (e.g., `/room/FAKE1/player`): after a brief load, shows "Room not found" card with a working "Back" link to `/`.
2. **Lobby state** (`:id` is the current host's room): shows the existing nickname form. Submit a name → lands on `/room/:id/player/:playerId`. Verify no regression.
3. **Started state** — go back to the host tab, join a few players from other tabs/profiles, then start the game from the lobby. On the started room, navigate a fresh browser/profile to `/room/:id/player`. It should show the rejoin list: one `PlayerFile` card per joined player, in the order they appear in the lobby, with player numbers matching. Tap a card → lands on `/room/:id/player/:playerId` and the Player page loads in that player's role.
4. **Live transition** — as a sanity check, start a mobile session at `/room/:id/player` while the room is in lobby, begin typing a nickname (but don't submit), then start the game from the host tab. The mobile view should swap to the rejoin list without a page reload.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PlayerJoin.tsx
git commit -m "feat(player-join): render rejoin list when room has started"
```

---

## Task 3: Simplify `Join.tsx` — always navigate to `/player`

**Files:**
- Modify: `src/pages/Join.tsx:56-61` (the `handleResumeAsPlayer` callback)

The `/players` route is about to be removed, so `Join.tsx`'s "Resume as player" handler needs to stop routing there. We keep the `getRoomStatus` call — it still validates the room exists and surfaces the "Room not found" error in the `/join` UI.

- [ ] **Step 1: Edit the handler**

Find this block in `src/pages/Join.tsx` (around lines 56–61):

```ts
  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(status === 'started' ? `/room/${trimmed}/players` : `/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);
```

Replace it with:

```ts
  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(`/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);
```

The only change is the `navigate(...)` argument — a single destination regardless of `status`. The `status` value is now unused after the null check, but we keep `resolveStatus` because its side effects (`setError`, `setSubmitting`) are still needed.

- [ ] **Step 2: Verify lint + type-check + build**

Run:

```bash
npm run lint && npm run build
```

Expected: both succeed. ESLint may flag `status` as unused — if it does, rename the binding to `_status` or drop the assignment and call `resolveStatus('player')` without destructuring. Safest substitution if lint complains:

```ts
    const result = await resolveStatus('player');
    if (result === null) return;
    navigate(`/room/${trimmed}/player`);
```

- [ ] **Step 3: Manual verification**

From `/join`:

1. Enter an unknown code → "Resume as player" → "Room not found" alert appears (existing behavior, unchanged).
2. Enter a valid lobby code → "Resume as player" → lands on the nickname form at `/room/:code/player`.
3. Enter a valid started code → "Resume as player" → lands on the rejoin list at `/room/:code/player`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Join.tsx
git commit -m "feat(join): route Resume as player to /player regardless of status"
```

---

## Task 4: Remove `/players` route, delete stub, remove unused i18n keys

**Files:**
- Modify: `src/App.tsx` (remove lazy import + route entry for `RejoinPlayers`)
- Delete: `src/pages/RejoinPlayers.tsx`
- Modify: `src/i18n/translations.ts` (remove two now-unused keys)

Cleanup after the merge. Grep already confirmed `'Rejoin the game'` and `'Content coming soon.'` are only referenced from `src/pages/RejoinPlayers.tsx`, so removing the file and the keys together is safe.

- [ ] **Step 1: Remove the `RejoinPlayers` route from `App.tsx`**

In `src/App.tsx`, delete this lazy import line (around line 18):

```ts
const RejoinPlayers = lazy(() => import('./pages/RejoinPlayers'));
```

And delete this route entry from the `routes` array (around line 26):

```ts
  { path: '/room/:id/players', element: <RejoinPlayers /> },
```

Leave every other route intact.

- [ ] **Step 2: Delete the stub page**

```bash
rm src/pages/RejoinPlayers.tsx
```

- [ ] **Step 3: Remove the two now-unused i18n keys**

Open `src/i18n/translations.ts`. Delete the `'Content coming soon.'` entry (around line 18, in the `// Home` section):

```ts
  'Content coming soon.': 'Em breve.',
```

And delete the `'Rejoin the game'` entry plus its section comment (around lines 103–105):

```ts
  // Rejoin (placeholder /room/:id/players) — added 2026-04-20
  'Rejoin the game': 'Voltar ao jogo',
  'Tap your name to rejoin': 'Toque no seu nome para voltar',
```

Important: keep `'Tap your name to rejoin'` — it's used by the new rejoin list in Task 2. Only remove the section header comment and the `'Rejoin the game'` entry. After the edit, the keep-and-drop result looks like:

```ts
  'Tap your name to rejoin': 'Toque no seu nome para voltar',
```

(Move this single line up to sit with another related section if that's cleaner, or leave it where it is without the header comment — both are acceptable.)

- [ ] **Step 4: Verify lint + type-check + build**

Run:

```bash
npm run lint && npm run build
```

Expected: both succeed. If TypeScript complains about an unresolved `RejoinPlayers` symbol, double-check Step 1 removed both the import and the route entry. If the build succeeds, the `/players` route is fully severed.

- [ ] **Step 5: Manual verification**

Start the dev server (`npm run dev`) and check:

1. Navigating directly to `/room/:id/players` renders React Router's default no-match behavior (usually a blank error state) — it is no longer routed to any component.
2. Every other flow still works: home → new game → lobby; home → resume game (`/join`) → enter code → "Resume as player" → `/room/:id/player` with the correct lobby-form or rejoin-list view per Task 2 + Task 3.
3. Toggle Portuguese (`pt_br`) on `/` and verify no `Em breve.` / `Voltar ao jogo` / `Content coming soon.` / `Rejoin the game` strings are referenced anywhere — the app should have no visible "missing translation" fallbacks.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/pages/RejoinPlayers.tsx src/i18n/translations.ts
git commit -m "refactor: drop /room/:id/players route and its stub page"
```

---

## Post-plan sanity checks

After all four tasks land:

- [ ] Run `npm run lint && npm run build` one more time from a clean state.
- [ ] `git log --oneline` shows four commits (or five if Task 1's i18n add landed separately).
- [ ] `git grep 'Rejoin the game'` and `git grep 'Content coming soon'` return no matches.
- [ ] `git grep -n '/room/.*/players'` returns no matches in `src/`.
- [ ] `src/pages/RejoinPlayers.tsx` no longer exists (`ls src/pages/`).

Full manual smoke test (golden path):

1. `/` → "New game" → `/room/:id` lobby loads.
2. On mobile (or another profile) → `/room/:id/player` → nickname form → submit → Player page.
3. Host starts the game from the lobby.
4. On a fresh mobile session → `/room/:id/player` → rejoin list → tap a name → Player page resumes in that slot.
5. Toggle PT/EN on `/` and confirm the new strings (`Sala não encontrada`, `Verifique o código e tente novamente.`) render on the "Room not found" state (via `/room/FAKE1/player`).
