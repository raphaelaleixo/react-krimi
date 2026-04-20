# /join page redesign — resume flow

## Goal

Rework `/join` from a "join as new player" form into a "resume" page modelled after `react-unmatched/src/pages/JoinGamePage.tsx`. The page will let someone who already has (or wants) a room code pick whether to resume as host or as player, and send them to the right downstream route based on room status.

The current new-player nickname flow is preserved — it continues to live at `/room/:id/player`, which already reuses `Join.tsx` today. As part of this work, that branch is extracted into its own component so `/join` can be focused.

## Scope

In scope:

1. Rewrite `/join` (`src/pages/Join.tsx`) as the resume page.
2. Extract the current new-player nickname form into a new `PlayerJoin.tsx` component and wire `/room/:id/player` to it.
3. Add a new route `/room/:id/players` with a placeholder component (`RejoinPlayers.tsx`) — visual frame only, to be fleshed out in a follow-up as a slot-picker matching `react-unmatched`'s `RejoinPage.tsx`.
4. Add a Firebase helper `getRoomStatus(roomId)` for the resume page's room lookup.
5. Add new i18n strings.

Out of scope:

- Building the actual slot-picker grid at `/room/:id/players` (placeholder only).
- Changing any game logic, lobby behavior, or `GameContext` actions.
- Updating existing `HostDeviceWarningModal` copy ("apresentador") — kept as-is.

## Architecture

### Routes

Current:

```
/                        → Home
/join                    → Join              (new player form, or resume if ?room= / :id)
/room/:id                → Room              (host view)
/room/:id/player         → Join              (new player form, prefilled code)
/room/:id/player/:playerId → Player
/how-to-play             → HowToPlay
```

After:

```
/                        → Home
/join                    → Join              (resume: code + host/player buttons)
/room/:id                → Room              (host view — unchanged)
/room/:id/player         → PlayerJoin        (new player form, prefilled code — extracted)
/room/:id/player/:playerId → Player          (unchanged)
/room/:id/players        → RejoinPlayers     (placeholder)
/how-to-play             → HowToPlay         (unchanged)
```

### Components

**`src/pages/Join.tsx` (rewritten)** — resume page.

- State: `code`, `error`, `submitting: 'host' | 'player' | null`, `pendingHostCode: string | null`.
- On "Resume as host" submit: call `getRoomStatus(code)`; if `null`, show room-not-found error; if mobile host, open `HostDeviceWarningModal` via `pendingHostCode`; else `navigate(/room/:code)`.
- On "Resume as player": call `getRoomStatus(code)`; if `null`, show error; if `started`, `navigate(/room/:code/players)`; if `lobby`, `navigate(/room/:code/player)`.
- While `submitting !== null`, both buttons disabled and the active button shows `t("Resuming…")`.
- Empty/whitespace `code` disables both buttons.
- Error clears on each new submit.
- Visual frame: `BoardSurface` + `CaseFile`, with `PinnedNote` "Back" linking to `/`.
- `HostDeviceWarningModal` wired via `pendingHostCode` (mirrors the pattern in `Home.tsx`).

**`src/pages/PlayerJoin.tsx` (new — extracted)** — new player nickname form, prefilled code.

- Takes the prefilled-code branch of today's `Join.tsx` verbatim (prefilled-code `TextField`, `Nickname` `TextField`, `StampButton` "Enter", `PinnedNote` "Back").
- Reads `roomId` from `useParams<{ id: string }>()`.
- Keeps calling `useGame().joinRoom(roomCode, nickname)` and navigating to `/room/:id/player/:playerId` on success.
- Error handling and i18n unchanged — continues using existing `'Game code'`, `'Nickname'`, `'Enter'`, `'Back'` keys.
- No `?room=` query-param support needed here since this component is only reached via `/room/:id/player`. (The `searchParams.get('room')` fallback currently in `Join.tsx` was unused in practice; no callers were found, so it's dropped.)

**`src/pages/RejoinPlayers.tsx` (new — placeholder)** — slot picker placeholder.

- Renders `BoardSurface` + `CaseFile` with the title `t("Rejoin the game")` and subtitle `t("Tap your name to rejoin")`, plus the existing `t("Content coming soon.")` body and a `PinnedNote` "Back" → `/`.
- Reads `roomId` via `useParams<{ id: string }>()` but does not yet render a slot grid. Follow-up will add the grid using `react-gameroom`'s `PlayerSlotsGrid` + `buildPlayerUrl` (mirroring `RejoinPage.tsx`).

### Helper

**`src/utils/roomStatus.ts` (new)**:

```ts
import { ref, get } from 'firebase/database';
import { deserializeRoom, type RoomStatus } from 'react-gameroom';
import { database } from '../firebase';

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

One-shot read, Firebase-aware. Lives outside `GameContext` because the resume flow doesn't need a subscription and shouldn't be coupled to the game-state context.

### Routing changes

`src/App.tsx`:

- `Route path="/room/:id/player"` — change `element` from `<Join />` to `<PlayerJoin />`.
- Add `Route path="/room/:id/players" element={<RejoinPlayers />}`.

`/join` route keeps pointing at `<Join />` (now the rewritten resume page).

## Data flow

Resume-as-host:

```
user types code
  → submit
  → getRoomStatus(code)
    → null  → error "Room not found…"
    → any   → isLikelyMobileHost()
                → true  → open HostDeviceWarningModal
                          → confirm → navigate /room/:code
                → false → navigate /room/:code
```

Resume-as-player:

```
user types code
  → click "Resume as player"
  → getRoomStatus(code)
    → null     → error "Room not found…"
    → started  → navigate /room/:code/players
    → lobby    → navigate /room/:code/player
```

## i18n

New keys added to `src/i18n/translations.ts` (English key → Portuguese value):

```
'Resume': 'Retomar',
'Enter the room code your friends shared to jump back in.':
  'Digite o código da sala que seus amigos compartilharam para voltar ao jogo.',
'Room code': 'Código da sala',
'Resume as host': 'Retomar como anfitrião',
'Resume as player': 'Retomar como jogador',
'Resuming…': 'Retomando…',
'Room not found. Check the code and try again.':
  'Sala não encontrada. Verifique o código e tente novamente.',
'Rejoin the game': 'Voltar ao jogo',
'Tap your name to rejoin': 'Toque no seu nome para voltar',
```

Existing keys reused as-is: `'Back'`, `'Heads up'`, `'Host anyway'`, `'Cancel'`, `"You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet."`, `'Content coming soon.'`. The existing `PlayerJoin.tsx` continues to use `'Game code'`, `'Nickname'`, `'Enter'`, `'Enter your nickname:'`.

## Error handling

- Room not found (`getRoomStatus` returns `null`): set `error` state, render `<Alert severity="error">` inside the `CaseFile`, reset `submitting` to `null`.
- Firebase read throws: let the error surface through React's error boundary — no special handling (matches current `joinRoom` behavior).
- Empty/whitespace code: buttons disabled; no network call.

## Testing

No test runner is configured in this project (see `CLAUDE.md`). Verification is manual:

- `/join` renders the resume page; empty code disables both buttons.
- Valid room code + "Resume as host" navigates to `/room/:code` (or opens the mobile-host warning).
- Valid room code in `lobby` + "Resume as player" navigates to `/room/:code/player`.
- Valid room code in `started` + "Resume as player" navigates to `/room/:code/players`.
- Invalid code shows the "Room not found" alert.
- `/room/:id/player` still shows the nickname form and joins players correctly.
- `/room/:id/players` renders the placeholder.
- Portuguese toggle replaces all new strings correctly.
