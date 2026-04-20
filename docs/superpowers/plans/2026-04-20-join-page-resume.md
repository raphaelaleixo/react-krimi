# /join page resume redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `/join` into a "resume" page modelled after `react-unmatched/src/pages/JoinGamePage.tsx` — letting a user enter a room code and choose to resume as host or as player — while extracting the current new-player nickname form to `/room/:id/player` and adding a placeholder slot-picker at `/room/:id/players`.

**Architecture:** Three page-level components (`Join.tsx` rewritten, `PlayerJoin.tsx` new, `RejoinPlayers.tsx` new placeholder), one Firebase helper (`getRoomStatus`), two route-table edits, and a batch of i18n strings. Visual vocabulary (`BoardSurface`, `CaseFile`, `PinnedNote`, `StampButton`) is reused from the existing redesigned pages — no new visual components.

**Tech Stack:** React 19, TypeScript, MUI 9, Firebase RTDB, react-router-dom, react-gameroom. No test runner — verification is `npm run build` + `npm run lint` + manual browser testing.

---

## File structure

- **Create** `src/utils/roomStatus.ts` — one-shot Firebase helper `getRoomStatus(roomId)` returning `'lobby' | 'started' | null`.
- **Create** `src/pages/PlayerJoin.tsx` — new-player nickname form for `/room/:id/player` (extracted from current `Join.tsx`).
- **Create** `src/pages/RejoinPlayers.tsx` — placeholder slot picker for `/room/:id/players`.
- **Modify** `src/pages/Join.tsx` — rewrite as the resume page.
- **Modify** `src/App.tsx` — swap element at `/room/:id/player`, add new `/room/:id/players` route.
- **Modify** `src/i18n/translations.ts` — add new Portuguese translations.

Spec reference: `docs/superpowers/specs/2026-04-20-join-page-resume-design.md`.

---

## Task 1: Add i18n strings

**Files:**
- Modify: `src/i18n/translations.ts` — append keys at the end of the object.

- [ ] **Step 1: Add new entries to the `translations` object**

Edit `src/i18n/translations.ts`. After the existing `// Join` block (the entry `'Game not found': 'Jogo não encontrado',` is currently last in that block), append before the closing `};`:

```ts
  // Join (resume page) — added 2026-04-20
  'Resume': 'Retomar',
  'Enter the room code your friends shared to jump back in.':
    'Digite o código da sala que seus amigos compartilharam para voltar ao jogo.',
  'Room code': 'Código da sala',
  'Resume as host': 'Retomar como anfitrião',
  'Resume as player': 'Retomar como jogador',
  'Resuming…': 'Retomando…',
  'Room not found. Check the code and try again.':
    'Sala não encontrada. Verifique o código e tente novamente.',

  // Rejoin (placeholder /room/:id/players) — added 2026-04-20
  'Rejoin the game': 'Voltar ao jogo',
  'Tap your name to rejoin': 'Toque no seu nome para voltar',
```

- [ ] **Step 2: Type-check and lint**

Run: `npm run build`
Expected: PASS — tsc emits no errors, Vite bundles successfully.

Run: `npm run lint`
Expected: PASS — no new ESLint errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "i18n: add resume page strings"
```

---

## Task 2: Add `getRoomStatus` helper

**Files:**
- Create: `src/utils/roomStatus.ts`

- [ ] **Step 1: Create the helper file**

Create `src/utils/roomStatus.ts` with exactly this content:

```ts
import { ref, get } from 'firebase/database';
import { deserializeRoom, type RoomStatus } from 'react-gameroom';
import { database } from '../firebase';

/**
 * One-shot read of a room's status. Returns `null` when the room does not exist,
 * otherwise `'lobby'` or `'started'`. Used by the /join resume page to route the
 * user to the right destination after they enter a room code.
 */
export async function getRoomStatus(roomId: string): Promise<RoomStatus | null> {
  const snapshot = await get(ref(database, `rooms/${roomId}/room`));
  const data = snapshot.val();
  if (!data) return null;
  try {
    return deserializeRoom(data).status;
  } catch {
    return data.status === 'started' ? 'started' : 'lobby';
  }
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/utils/roomStatus.ts
git commit -m "feat: add getRoomStatus Firebase helper"
```

---

## Task 3: Extract new-player form into `PlayerJoin.tsx`

This duplicates the current `/room/:id/player` behavior into a dedicated component. `Join.tsx` stays unchanged this task — we're adding the new component alongside. Routes are wired up in Task 6.

**Files:**
- Create: `src/pages/PlayerJoin.tsx`

- [ ] **Step 1: Create the file**

Create `src/pages/PlayerJoin.tsx` with exactly this content:

```tsx
import { useState, useCallback } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';

export default function PlayerJoin() {
  const navigate = useNavigate();
  const { id: roomId = '' } = useParams<{ id: string }>();
  const { joinRoom } = useGame();
  const { t } = useI18n();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError(t('Enter your nickname:'));
      return;
    }
    setError('');

    try {
      const playerId = await joinRoom(roomId, nickname.trim());
      navigate(`/room/${roomId}/player/${playerId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error joining game';
      setError(message);
    }
  }, [joinRoom, nickname, navigate, roomId, t]);

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Game code')}
              value={roomId}
              fullWidth
              variant="filled"
              sx={{ mb: 2 }}
              disabled
            />
            <TextField
              label={t('Nickname')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              variant="filled"
              sx={{ mb: 3 }}
              required
              autoFocus
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                {t('Enter')}
              </StampButton>
            </Box>
          </Box>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
```

Notes for the engineer: this is a near-verbatim lift of the "prefilled room" branch of the current `src/pages/Join.tsx` (lines 46–91), with two small changes:
1. `prefilledRoom` state is gone — `roomId` comes straight from `useParams`.
2. The `err: any` catch is typed as `err: unknown` + narrowing for stricter type-safety.

- [ ] **Step 2: Type-check and lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS — no unused-variable or any-type warnings.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayerJoin.tsx
git commit -m "feat: extract new-player form into PlayerJoin"
```

---

## Task 4: Add `RejoinPlayers.tsx` placeholder

**Files:**
- Create: `src/pages/RejoinPlayers.tsx`

- [ ] **Step 1: Create the file**

Create `src/pages/RejoinPlayers.tsx` with exactly this content:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import { useI18n } from '../hooks/useI18n';

export default function RejoinPlayers() {
  const { t } = useI18n();

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Rejoin the game')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 2,
            }}
          >
            {t('Tap your name to rejoin')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {t('Content coming soon.')}
          </Typography>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
```

Notes for the engineer: structure mirrors `src/pages/HowToPlay.tsx`. Two headings stacked (title + instruction) and the "Content coming soon." line preserved as the body. The instruction subtitle is intentional — it pre-seeds the copy for when the slot grid ships in a follow-up.

- [ ] **Step 2: Type-check and lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/RejoinPlayers.tsx
git commit -m "feat: add RejoinPlayers placeholder page"
```

---

## Task 5: Rewrite `Join.tsx` as the resume page

**Files:**
- Modify: `src/pages/Join.tsx` (full rewrite).

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/pages/Join.tsx` with:

```tsx
import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useI18n } from '../hooks/useI18n';
import { getRoomStatus } from '../utils/roomStatus';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';

type SubmittingRole = 'host' | 'player' | null;

export default function Join() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<SubmittingRole>(null);
  const [pendingHostCode, setPendingHostCode] = useState<string | null>(null);

  const trimmed = code.trim();
  const disabled = submitting !== null || trimmed.length === 0;

  const resolveStatus = useCallback(async (role: SubmittingRole) => {
    setError('');
    setSubmitting(role);
    const status = await getRoomStatus(trimmed);
    setSubmitting(null);
    if (status === null) {
      setError(t('Room not found. Check the code and try again.'));
      return null;
    }
    return status;
  }, [trimmed, t]);

  const handleResumeAsHost = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    const status = await resolveStatus('host');
    if (status === null) return;
    if (isLikelyMobileHost()) {
      setPendingHostCode(trimmed);
      return;
    }
    navigate(`/room/${trimmed}`);
  }, [trimmed, resolveStatus, navigate]);

  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(status === 'started' ? `/room/${trimmed}/players` : `/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Resume')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('Enter the room code your friends shared to jump back in.')}
          </Typography>

          <Box component="form" onSubmit={handleResumeAsHost}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Room code')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              variant="filled"
              sx={{ mb: 3 }}
              required
              autoFocus
              inputProps={{ autoCapitalize: 'characters', autoComplete: 'off' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <StampButton variant="primary" type="submit" disabled={disabled}>
                {submitting === 'host' ? t('Resuming…') : t('Resume as host')}
              </StampButton>
              <StampButton variant="text" type="button" onClick={handleResumeAsPlayer} disabled={disabled}>
                {submitting === 'player' ? t('Resuming…') : t('Resume as player')}
              </StampButton>
            </Box>
          </Box>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>

      <HostDeviceWarningModal
        open={pendingHostCode !== null}
        onConfirm={() => {
          const roomCode = pendingHostCode;
          setPendingHostCode(null);
          if (roomCode) navigate(`/room/${roomCode}`);
        }}
        onCancel={() => setPendingHostCode(null)}
        labels={{
          title: t('Heads up'),
          body: t("You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet."),
          confirmLabel: t('Host anyway'),
          cancelLabel: t('Cancel'),
        }}
      />
    </BoardSurface>
  );
}
```

Key behaviors to verify by reading the code:
- `disabled` is computed from both `submitting` and trimmed `code.length`, so empty code disables both buttons and an in-flight request disables both.
- `resolveStatus` always clears `submitting` before returning, even when `status === null` (error path).
- `handleResumeAsPlayer` is `type="button"` — it must not submit the form.
- `HostDeviceWarningModal` labels match the identical keys already used in `Home.tsx`.

- [ ] **Step 2: Type-check and lint**

Run: `npm run build`
Expected: PASS. Note: `useGame`, `useParams`, `useSearchParams`, `useEffect` are no longer imported in this file — tsc should not complain because they're no longer referenced.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Join.tsx
git commit -m "feat: rewrite /join as resume page"
```

---

## Task 6: Wire up the new routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports**

Edit `src/App.tsx`. Add these two imports after the existing `import HowToPlay from './pages/HowToPlay';` line:

```tsx
import PlayerJoin from './pages/PlayerJoin';
import RejoinPlayers from './pages/RejoinPlayers';
```

- [ ] **Step 2: Update the routes**

In the same file, replace:

```tsx
              <Route path="/room/:id/player" element={<Join />} />
              <Route path="/room/:id/player/:playerId" element={<Player />} />
```

with:

```tsx
              <Route path="/room/:id/player" element={<PlayerJoin />} />
              <Route path="/room/:id/player/:playerId" element={<Player />} />
              <Route path="/room/:id/players" element={<RejoinPlayers />} />
```

Do not touch the `/join` route — it continues to point at the rewritten `Join.tsx`.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire PlayerJoin and RejoinPlayers routes"
```

---

## Task 7: Manual verification

No test runner exists. Verify each path end-to-end in the browser.

**Files:**
- None (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL (typically `http://localhost:5173`). Open it.

- [ ] **Step 2: Verify `/join` empty state**

Navigate to `/join`. Expect:
- Title `RESUME` (uppercase per the styling).
- Subtitle `Enter the room code your friends shared to jump back in.`
- Empty "Room code" text field, autofocused.
- Both stamp buttons disabled.
- `Back` pinned-note below the case file, links to `/`.

- [ ] **Step 3: Verify room-not-found error**

In `/join`, type a bogus code like `zzzzzz` and click `RESUME AS HOST`. Expect:
- Brief "Resuming…" on the active button (may flash).
- `Alert severity="error"` inside the case file reading `Room not found. Check the code and try again.`.
- Both buttons re-enable.

Repeat with `RESUME AS PLAYER` — same error.

- [ ] **Step 4: Verify "resume as host" with a real lobby room**

In a second browser tab, go to `/` and click `New game`. Copy the room code from the URL (e.g. `abc123`).

Back in the first tab at `/join`, type that code and click `RESUME AS HOST`. Expect:
- On a desktop browser: navigates to `/room/<code>` (host view).
- On a mobile user-agent (or via DevTools device emulation that triggers `isLikelyMobileHost`): `HostDeviceWarningModal` opens with the existing "Heads up" copy. Confirm → navigates to `/room/<code>`. Cancel → dismisses modal, stays on `/join`, no navigation.

- [ ] **Step 5: Verify "resume as player" for a lobby room**

With the same in-lobby room code from Step 4, in the first tab at `/join`, enter the code and click `RESUME AS PLAYER`. Expect:
- Navigates to `/room/<code>/player`.
- The `PlayerJoin` page renders: disabled Game Code field prefilled with `<code>`, Nickname field, ENTER button, Back pinned-note.
- Fill a nickname, submit → navigates to `/room/<code>/player/<playerId>` (the `Player` page).

- [ ] **Step 6: Verify "resume as player" for a started game**

Still using the room from Steps 4–5: on the host tab (`/room/<code>`), join enough players (from additional tabs or devices) and start the game. `room.status` flips to `started` in Firebase.

Back on the first tab, go to `/join`, enter the code, click `RESUME AS PLAYER`. Expect:
- Navigates to `/room/<code>/players`.
- The `RejoinPlayers` placeholder renders: `REJOIN THE GAME` title, `Tap your name to rejoin` subtitle, `Content coming soon.` body, Back pinned-note.

- [ ] **Step 7: Verify the Portuguese toggle**

From `/`, click the language toggle (the `English version` / `Versão em português` stamp button in the footer) to switch to Portuguese, then navigate back to `/join`. Expect:
- Title `RETOMAR`.
- Subtitle `Digite o código da sala que seus amigos compartilharam para voltar ao jogo.`
- Room-code label `Código da sala`.
- Primary button `RETOMAR COMO ANFITRIÃO`.
- Secondary button `RETOMAR COMO JOGADOR`.
- Trigger the error state — message reads `Sala não encontrada. Verifique o código e tente novamente.`
- While submitting, button text reads `RETOMANDO…`.

Also verify `/room/<code>/players` in Portuguese: `VOLTAR AO JOGO` title, `Toque no seu nome para voltar` subtitle.

- [ ] **Step 8: Regression check — existing Home / HowToPlay flows**

- From `/`, click `New game` → host view still loads at `/room/<new-code>`.
- From `/`, click `Join game` → lands at `/join` (the new resume page, not the old nickname form).
- From `/`, click `How to play` → `/how-to-play` unchanged.
- `HostDeviceWarningModal` on Home still works with its existing copy ("apresentador") — unchanged.

- [ ] **Step 9: Stop the dev server**

`Ctrl+C` the `npm run dev` process.

- [ ] **Step 10: Final type-check and lint (safety net)**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

No commit for this task — verification only.

---

## Done

All changes are on `main` (or the feature branch, depending on how execution was set up). Follow-up work — fleshing out `RejoinPlayers.tsx` with a real slot grid using `react-gameroom`'s `PlayerSlotsGrid` + `buildPlayerUrl` — is deferred to a separate spec/plan.
