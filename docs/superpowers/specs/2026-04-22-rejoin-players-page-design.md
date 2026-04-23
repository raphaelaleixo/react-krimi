# Rejoin players — merge into `/room/:id/player`

## Goal

Make `/room/:id/player` the single mobile-player entry point for a room:

- When the room is in lobby, show the existing nickname-entry form.
- When the room has started, show a list of joined players; tapping a name deep-links to `/room/:id/player/:playerId` to resume on that slot.

This replaces the current stub at `/room/:id/players` (placeholder "Content coming soon") from the previous `/join` redesign. The separate `/players` route is deleted — one mobile route handles both states.

Modelled after `react-unmatched/src/pages/RejoinPage.tsx`, which shows a `PlayerSlotsGrid` of joined slots as "rejoin" links. Krimi uses its own themed `PlayerFile` cards instead of the library's minimal grid, to match the lobby's visual language.

## Scope

In scope:

1. Extend `src/pages/PlayerJoin.tsx` to branch on `roomState.status`: `'lobby'` renders the current nickname form; `'started'` renders the new rejoin list.
2. Add an explicit "room not found" state on `/room/:id/player` (currently renders a blank form when the room is missing).
3. Delete `src/pages/RejoinPlayers.tsx` and the `/room/:id/players` route.
4. Update `src/pages/Join.tsx` so "Resume as player" always navigates to `/room/:code/player` (the status-based fork is no longer needed).
5. Remove the two i18n keys (`'Rejoin the game'`, `'Content coming soon.'`) that become unused, and add two new keys (`'Room not found'`, `'Check the code and try again.'`).

Out of scope:

- Changes to `GameContext`, `Lobby.tsx`, `PlayerHeader`, or `PlayerFile` internals.
- Changes to `/join`'s resume-as-host flow or its host-device warning.
- Desktop/tablet optimization — this page is for mobile.
- Any game-logic changes.

## Architecture

### Routes — before and after

Before:

```
/room/:id/player          → PlayerJoin      (nickname form only)
/room/:id/players         → RejoinPlayers   (placeholder)
```

After:

```
/room/:id/player          → PlayerJoin      (nickname form OR rejoin list, based on roomState.status)
```

`/room/:id/players` is removed from `src/App.tsx`. `src/pages/RejoinPlayers.tsx` is deleted.

### `src/pages/PlayerJoin.tsx` — expanded behavior

Single route component for `/room/:id/player`. Retains the current mount-time `loadRoom(roomId)` call, which subscribes to `rooms/:id` via Firebase `onValue` — `roomState` stays live, so the view reacts when the host starts the game.

Render branches, evaluated in order:

1. **Loading** — `loading === true` and `roomState === null`: centered `CircularProgress` inside `BoardSurface`. Mirrors the `RouteFallback` pattern in `App.tsx`.
2. **Room not found** — `loading === false` and `roomState === null`: `BoardSurface` + centered `CaseFile` with typewriter heading `t('Room not found')`, subtitle `t('Check the code and try again.')`, and a `TapedNoteButton` "Back" → `/`. New UI; today this state silently shows a blank nickname form.
3. **Lobby** — `roomState.status === 'lobby'`: existing nickname form, unchanged. Header is `PlayerHeader` with `playerId={0}`, `gameState={null}`, `showRoomCode={false}` (as today).
4. **Started** — `roomState.status === 'started'`: rejoin list (see below). Header is `PlayerHeader` with `playerId={0}`, `gameState={null}`, `showRoomCode={true}` — the `RoomInfoModal` opens on tap so players can share the rejoin link.

### Rejoin list — rendered inline inside `PlayerJoin.tsx`

Layout:

- `BoardSurface` wrapper.
- `PlayerHeader` as above.
- `Container maxWidth="sm"` with `display: 'flex', flexDirection: 'column'`, vertical padding.
- Instruction line: `Typography` in typewriter font, centered, `t('Tap your name to rejoin')`.
- Vertical stack (`Box` with `display: 'flex', flexDirection: 'column', gap: 3`) of tappable cards — one per joined slot.

Per-slot card:

- Filter `roomState.players` to slots with `status !== 'empty'`. Preserve original slot index so the slot label matches the lobby's numbering.
- Render each as `PlayerFile` in its lobby mode: pass `name={slot.name ?? ''}`, `slotLabel={t('Player') + ' ' + (originalIndex + 1)}`, `rotation`, `offsetY`. Do not pass `means` / `clues` / `stamp` / `guessCount` / `hasPicked`.
- Wrap each `PlayerFile` in a `DirectionalLink` to `/room/:id/player/:playerId` (the slot id). Link styled with `textDecoration: 'none', color: 'inherit', display: 'block'`.
- Memoize per-slot `rotation` (±3°) and `offsetY` (±10px) keyed on joined slot ids — same pattern as `Lobby.tsx`'s `cardRotations` / `cardOffsets` — so values are stable across re-renders and don't re-roll on Firebase updates.

Tappability affordance: none beyond the normal link tap. No hover transforms (mobile-first; no hover state on touch). Cards are large enough to tap comfortably from `PlayerFile`'s existing padding.

No "Back" button — the logo in `PlayerHeader` already links home.

**Empty-state note:** a started game always has ≥ `minPlayers` joined slots (enforced at start), so no zero-player fallback UI is required.

### `src/pages/Join.tsx` — simplification

In `handleResumeAsPlayer`:

- Keep calling `getRoomStatus(trimmed)` — the returned value `null` still drives the "Room not found" error.
- Drop the branch on `status === 'started'` vs `'lobby'`. On any non-null status, navigate to `/room/:trimmed/player`.

The call to `getRoomStatus` is retained purely for room validation, so users get a clear error at the `/join` page instead of landing on the new "Room not found" state inside `PlayerJoin`.

### `src/App.tsx` — routing cleanup

- Remove the `RejoinPlayers` lazy import.
- Remove the `{ path: '/room/:id/players', element: <RejoinPlayers /> }` route entry.

## Data flow

Mount of `/room/:id/player`:

```
PlayerJoin mounts
  → useEffect: loadRoom(roomId)
    → GameContext subscribes via onValue(rooms/:id)
  → loading=true, roomState=null      → render spinner
  → first snapshot
    → no data                          → loading=false, roomState=null → render "Room not found"
    → data.room                        → roomState populated
      → roomState.status === 'lobby'   → render nickname form
      → roomState.status === 'started' → render rejoin list
```

Live updates (e.g., host starts the game while a user is on the nickname form):

```
Firebase writes rooms/:id/room { status: 'started', … }
  → onValue fires in GameContext
  → roomState updates
  → PlayerJoin re-renders rejoin list
  → any typed nickname is discarded (the form unmounts)
```

Tapping a card in the rejoin list:

```
DirectionalLink → /room/:id/player/:playerId
  → router mounts Player page (existing behavior)
```

## Error handling

- **Room missing on first snapshot** → explicit "Room not found" UI (see Render branches).
- **`loadRoom` subscription error** → logged to console via existing `GameContext` error path; `loading` flips false, `roomState` stays null → "Room not found" UI is shown. Acceptable — same terminal UX as a missing room, and the console log is the diagnostic trail.
- **`joinRoom` rejects in the lobby branch** (e.g., race where game starts between render and submit) → existing error-alert in the form already surfaces the thrown message (`'Game has already started'`). The roomState subscription will then flip the UI to the rejoin list on the next tick.
- **User lands on `/room/:id/player` for a finished game** (`gameState.finished === true`): still shows the rejoin list; tapping a card routes to the existing `Player` page, which handles the finished-game UI. No special handling on this page.

## i18n

Add to `src/i18n/translations.ts`:

```
'Room not found': 'Sala não encontrada',
'Check the code and try again.': 'Verifique o código e tente novamente.',
```

Remove (both only referenced from `RejoinPlayers.tsx`, which is being deleted — verified via grep):

```
'Rejoin the game'
'Content coming soon.'
```

Reused as-is on this page: `'Tap your name to rejoin'`, `'Player'`, `'Back'`, `'Enter your nickname for the case file.'`, `'Nickname'`, `'Enter'`, `'Case'` (header), plus every string already on the lobby branch of `PlayerJoin`.

Note: the existing `'Room not found. Check the code and try again.'` key stays in place — it's still used by `Join.tsx`. The new `PlayerJoin` "Room not found" state uses the two split keys to render a heading + subtitle layout.

## Testing

No test runner is configured (see `CLAUDE.md`). Manual verification:

- `/room/:id/player` with an unknown `:id` → "Room not found" card with working "Back" link.
- `/room/:id/player` with a lobby room → nickname form renders and still joins correctly (navigates to `/room/:id/player/:playerId`).
- `/room/:id/player` with a started room → rejoin list renders; shows one card per joined slot, in slot order; player numbers match what was shown in the lobby; tapping a card lands on `/room/:id/player/:playerId` and the `Player` page loads in the correct role.
- Start the game from the host while a mobile user is on the nickname form → that user's view swaps to the rejoin list without a page reload.
- `/join` → enter a valid lobby code → "Resume as player" → lands on nickname form at `/room/:code/player` (not `/players`).
- `/join` → enter a valid started code → "Resume as player" → lands on rejoin list at `/room/:code/player`.
- `/room/:id/players` → returns the router's default no-match behavior (no longer routed). Direct navigation there is expected to 404 — acceptable per brainstorming decision.
- Portuguese toggle — `Room not found` and `Check the code and try again.` render as `Sala não encontrada` / `Verifique o código e tente novamente.`.
- Visual check on a phone-sized viewport: cards stack vertically, don't overflow horizontally, are comfortably tappable.
