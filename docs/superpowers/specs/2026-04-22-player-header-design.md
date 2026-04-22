# Player header

## Goal

Introduce a shared header on every player view (`/room/:id/player/:playerId`) so the player always sees the Krimi logo, the room code (with a way to open the `RoomInfoModal`), and — once the game has started — their seat number as a distressed circle stamp.

This is modelled after `react-unmatched/src/components/AppHeader.tsx`, adapted to Krimi's case-file aesthetic. The language toggle is intentionally omitted (language is set by the host and mirrored from Firebase on every player device).

## Scope

In scope:

1. New component `src/components/board/PlayerHeader.tsx` that renders the three-slot bar (logo / room code button / seat stamp).
2. First-time use of `RoomInfoModal` from `react-gameroom` in Krimi — opened from the room code button.
3. Extract `generateDistressedCircle` from `src/components/board/CasePolaroid.tsx` into a small helper module `src/components/board/distressedStamp.ts` so both `CasePolaroid` and `PlayerHeader` can share it. No behavioral change to `CasePolaroid`.
4. Wire the header into `src/pages/Player.tsx` — rendered above both `renderReady` and `renderStarted` content. Not rendered on `renderEmpty` or the loading spinner.
5. Add i18n strings for the `RoomInfoModal` labels (currently Krimi does not use the modal, so its labels are English by default).

Out of scope:

- The content of the waiting-for-game-start view itself (`renderReady` body). That is a separate follow-up spec.
- Any changes to `Detective.tsx`, `PickPhase.tsx`, or `ForensicAnalysis.tsx` beyond what is needed to accommodate the sticky header (see "Mounting" below — the child components do not need to change).
- Any change to the host's `Lobby` / `Board`.

## Architecture

### Component tree

```
Player.tsx
  └── PlayerScreen (from react-gameroom)
        ├── renderReady → <>
        │                   <PlayerHeader ... />
        │                   <existing waiting content>
        │                 </>
        └── renderStarted → <>
                              <PlayerHeader ... />
                              <Detective | PickPhase | ForensicAnalysis />
                            </>
```

`PlayerHeader` takes the data it needs as props:

```ts
interface PlayerHeaderProps {
  roomState: RoomState;         // for RoomInfoModal
  playerId: number;             // identify this device's player
  gameState: KrimiGameState | null; // null before game starts
}
```

### Layout

A horizontal flex row, three slots left → right:

1. **Logo (left)** — `<Box component="img" src={logo} />` from `src/assets/logo.svg` (same asset used on Home), `height: 36px`, wrapped in a `DirectionalLink` to `/`. `aria-label="Home"`.
2. **Case# button (right of centre)** — MUI `Button` with `variant="text"`. Renders `{t('Case')}#{roomState.roomId}` in `var(--font-typewriter)`, uppercase, 700 weight, 2px letter-spacing, color `#1C1B1B`, font-size `1rem`. Clicking it sets local `useState` `showInfo=true`, which opens `RoomInfoModal`. On the modal's `onClose`, set `showInfo=false`.
3. **Seat stamp (far right)** — conditionally rendered. Renders only when `gameState != null` AND `gameState.playerOrder.includes(playerId)`. The seat number is `gameState.playerOrder.indexOf(playerId) + 1`. Visual: reuses the distressed circle pattern from `CasePolaroid.tsx:108-135`:
   - Size: `width: 40px, height: 40px` (smaller than the polaroid's 48px — this is a header badge, not a round-tracker).
   - Border: `3px solid var(--weapon-color)`, `borderRadius: 50%`.
   - `clipPath: generateDistressedCircle()` (memoised once via `useMemo(() => generateDistressedCircle(), [])` — stable per mount).
   - Fixed rotation `-5deg` (small, subtle, not random — a single stamp, not a row of three).
   - Inside: typewriter bold digit, `fontSize: 1.2rem`, color `var(--weapon-color)`, `lineHeight: 1`.

### Container styles

```tsx
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
    // No background — the underlying CorkBoard / page shows through.
  }}
>
  {/* logo */}
  <Box sx={{ flex: 1 }} />  {/* spacer */}
  {/* case button */}
  {/* seat stamp (conditional) */}
</Box>
```

The header has **no background colour**. The cork/board texture beneath shows through. The drop shadow on the bottom edge marks the boundary during scroll.

`zIndex: 10` keeps it above cork textures, pushpins, and scrollable card content without fighting with MUI modals/drawers (which default to `zIndex: 1300+`).

### Shared helper: `distressedStamp.ts`

```ts
// src/components/board/distressedStamp.ts
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

This is the exact function currently at `CasePolaroid.tsx:22-34`. `CasePolaroid.tsx` will import from the new module and drop its local copy. No other behaviour changes there.

### i18n

Krimi does not currently render `RoomInfoModal`. Its default labels are in English. We pass localisable labels via the component's `labels` prop. New i18n keys (added under a new dated comment block `// PlayerHeader — added 2026-04-22`):

| English key | Portuguese |
|---|---|
| `'Room:'` | `'Sala:'` |
| `'Join'` | `'Entrar'` |
| `'Join link for'` | `'Link de acesso para'` |
| `'Rejoin'` | `'Resumir'` |
| `'Rejoin link for'` | `'Link de retorno para'` |

Reused existing keys: `'Close'` (line 27) and `'Case'` (line 64).

`PlayerHeader` passes these via:

```tsx
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
```

### Mounting in `Player.tsx`

The component is rendered from both `renderReady` and `renderStarted` by wrapping the existing JSX in a fragment:

```tsx
renderReady={() => (
  <>
    <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
    {/* existing waiting-state Container + Grid + Typography, unchanged */}
  </>
)}

renderStarted={() => {
  if (!gameState) return null;
  const playerOrderIndex = gameState.playerOrder.indexOf(playerId);
  if (playerOrderIndex === -1) return notFound;
  const child =
    playerOrderIndex === gameState.detective
      ? <ForensicAnalysis ... />
      : !isRolesRevealed(gameState)
        ? <PickPhase ... />
        : <Detective ... />;
  return (
    <>
      <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
      {child}
    </>
  );
}}
```

`renderEmpty` (player-not-found) and the loading state (`!roomState || loading`) do NOT get the header.

Because `PlayerHeader` is `position: sticky; top: 0;`, it floats over the top of the existing `CorkBoard` / `Container` children without disturbing their internal layouts. No changes are needed inside `Detective.tsx`, `PickPhase.tsx`, or `ForensicAnalysis.tsx`.

### Accessibility

- Logo wrapper: `aria-label="Home"`.
- Case# button: `aria-label={t('Room:') + ' ' + roomState.roomId}` plus default button role.
- Seat stamp: `aria-label={t('Player') + ' ' + String(seat)}` on the outer Box.
- `RoomInfoModal` handles its own modal focus trap.

## Testing

No automated test runner. Verification plan:

1. `npm run lint` and `npm run build` must pass.
2. `npm run dev` — happy-path manual:
   - Join a room from a player device. Confirm the header is visible, sticky (scroll within the waiting state if the view is taller than the viewport), and seat stamp is **not** shown.
   - Host starts the game. Seat stamp appears with the correct 1-indexed number. Test with players seated at different positions (e.g., the detective in seat 2 sees `2`).
   - Click the `Case#…` button in the header. `RoomInfoModal` opens, showing the room code, QR, and player-rejoin links. Close it. The header's state resets.
   - Click the logo. Navigate to `/`.
3. Toggle language mid-game. Confirm the button still reads `Caso#…` and the modal labels render in pt_br.
4. On small screens (≤375px wide), the header must not overflow horizontally. If the logo + button + stamp are too wide, the logo holds its 36px height but text wraps are prevented via `whiteSpace: 'nowrap'` on the button.
