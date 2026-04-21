# Lobby Redesign — Design Spec

**Date:** 2026-04-20
**Status:** Draft, awaiting user review
**Scope:** `src/components/Lobby.tsx`, `src/components/Board.tsx` (QR polaroid extraction only), `src/components/board/PolaroidCard.tsx` (props extension), two new board components, i18n keys.

## Motivation

The lobby is currently a conventional MUI two-column layout — `Container` + `Grid` + `Card` + `LinearProgress` + a QR and a copy-URL button. The rest of the app has converged on a noir cork-board aesthetic (CorkBoard, PolaroidCard, ForensicSheet, pushpins, taped paper). The lobby is the one surface between Home and Board that still reads as stock MUI, which breaks the "someone pinned up a case" fiction at the moment the game actually starts.

The redesign driver: the lobby and the in-game Board should wear the **same frame**. A player watching the host screen should see the case board begin assembling from the moment the first player joins, not appear out of nowhere when the game starts.

## Goals

- The lobby uses the same `CorkBoard` wrapper, same outer two-column layout, and the same Case-# polaroid that the in-game `Board` uses.
- Players appear on the pinboard as `PolaroidCard`s the moment they join, with a glued-on role nameplate that lets the host pick the Forensic Scientist by clicking.
- Replace the in-game `ForensicSheet` slot with an `AssigningCaseSheet` that carries a live count and the Start button.
- Keep lobby↔game visual continuity tight enough that later work (shared-layout crossfade) is trivial.

## Non-goals

- No crossfade or shared-element transition between lobby and in-game polaroids. The cards re-mount with a hard swap. Out of scope for this iteration; the component split deliberately makes it additive later.
- No lobby chat, avatars, colors-per-player, or other identity features.
- No changes to `GameContext`, `useRoomState`, or the `react-gameroom` contract.
- No changes to the `RoomInfoModal` + floating Info FAB in `Room.tsx` — that's the host's fallback for showing join info to latecomers and stays as-is.
- No minimum-player hint text on the sheet — the disabled Start button is the signal.

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Full-viewport `CorkBoard` wrapper, not `BoardSurface` | Matches the in-game Board exactly; the dark backdrop is the "frame" both screens share. |
| 2 | Two-column flex layout identical to `Board.tsx`'s outer box (`p: 3`, `gap: 3`, narrow left / flex: 3 right) | Single structural rule across both screens. |
| 3 | Reuse `PolaroidCard` for the joined-player list, not `PinnedNote` | User-requested. PolaroidCard is the in-game representation of a player; reusing it is the whole point of the "same frame" goal. |
| 4 | Card body during lobby = name + `PLAYER N` slot line + glued role nameplate; no means/clues | Means and clues don't exist pre-deal. Slot label preserves the ruled-line rhythm of the in-game body. |
| 5 | Role is a single mutually-exclusive selection across the roster; clicking an `INVESTIGATOR` nameplate promotes that player and implicitly demotes the previous detective | Matches the existing lobby mechanic (`activeDetective: number`), just with a new affordance. |
| 6 | Extract the Case-# QR polaroid block from `Board.tsx` into a shared `CasePolaroid` component, parameterized by `currentRound` (0 in lobby, 1–3 in game) | Prevents copy-paste drift. The block is currently 113 inline JSX lines in `Board.tsx`; it needs a home. |
| 7 | `AssigningCaseSheet` mirrors `ForensicSheet`'s visual vocabulary: 340px width, pushpin, ruled paper, header + signature line + body | Sheet sits in the exact slot ForensicSheet occupies during the game; the visual rhyme is the point. |
| 8 | Start button is a `StampButton variant="primary"` rendered **inside** the sheet (bottom) | User choice. Also consistent with Home's "New game" primary CTA. |
| 9 | The `Forensic Scientist` signature on the sheet is **live** — it updates as the host clicks different polaroids' role nameplates | Gives the host immediate visual confirmation without a separate "selected" state on the polaroid (the nameplate text/color already carries that). |
| 10 | Drop the separate "Copy game url" button and its snackbar | The Case polaroid opens the join URL in a new tab on click (same as in-game); `RoomInfoModal` via the Info FAB remains the host's fallback for sharing. |
| 11 | Polaroid enter/exit animation via `motion.div` + `AnimatePresence`, reusing the spring vocabulary already in `Board.tsx` for `GuessNote` | Players physically "pinning up" as they join is the main bit of lobby life. Do it with the existing motion primitives, no new deps. |
| 12 | Clamp `activeDetective` to `0` via `useEffect` if its index falls out of range after a slot disappears | Cheap; lobby is a transient screen and the host can reselect. |

## Page structure

Full-viewport `CorkBoard`, same outer layout as `Board.tsx`.

```
┌─ CorkBoard ───────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐   │
│  │ CasePolaroid │   │                                          │   │
│  │   (QR +      │   │          PolaroidCard masonry            │   │
│  │   Case #   + │   │        (one card per joined player)      │   │
│  │   rounds)    │   │                                          │   │
│  └──────────────┘   │                                          │   │
│  ┌──────────────┐   │                                          │   │
│  │ Assigning    │   │                                          │   │
│  │ Case sheet   │   │                                          │   │
│  │ + Start btn  │   │                                          │   │
│  └──────────────┘   └──────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Same `Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}` as `Board.tsx:178`.

## Components

### `CasePolaroid` (new — `src/components/board/CasePolaroid.tsx`)

Extraction of the QR polaroid block currently inlined in `Board.tsx:181–294`. No visual change.

```tsx
type CasePolaroidProps = {
  roomId: string;
  joinUrl: string;
  currentRound: number; // 0 in lobby, 1–3 in game
};
```

- Renders the tilted polaroid frame, the `RoomQRCode`, the `Case #XXXX` headline, and the three round circles.
- Round circles are crossed out iff `r <= currentRound`; with `currentRound={0}` (lobby) none are crossed out.
- `onClick` target (opening `joinUrl` in a new tab) is preserved as today.
- The `stampClipPaths` and `crossClipPaths` memos move into this component (they're only used here).

### `AssigningCaseSheet` (new — `src/components/board/AssigningCaseSheet.tsx`)

Modeled closely on `ForensicSheet`.

```tsx
type AssigningCaseSheetProps = {
  detectiveName: string | undefined;
  count: number;
  maxCount: number;
  canStart: boolean;
  onStart: () => void;
};
```

- 340px width, `#f8f6f0` paper, pushpin, ruled-line backgroundImage — same as `ForensicSheet`.
- Header `ASSIGNING CASE` (typewriter uppercase, 2px letter-spacing) — same treatment as ForensicSheet's `Forensic Analysis` header. New i18n key `Assigning case`.
- Signature block: `detectiveName` in the script font, red (`var(--evidence-color)`), dashed underline, `Forensic Scientist` label beneath. Identical markup to `ForensicSheet:70–102`; `forensicScientistLabel` key already exists.
- Body line: `<count> / <maxCount> <t('on scene')>` in typewriter, centered. New i18n key `on scene`.
- `StampButton variant="primary"` at the bottom of the sheet, centered (auto-width), label `t('Start investigation')`. New i18n key `Start investigation`. `disabled={!canStart}`. `onClick={onStart}`.

### `PolaroidCard` (modified — `src/components/board/PolaroidCard.tsx`)

Props become:

```tsx
type PolaroidCardProps = {
  name: string;
  rotation: number;
  offsetY: number;
  // game-only
  means?: string[];
  clues?: string[];
  stamp?: string;
  guessCount?: number;
  // lobby-only
  slotLabel?: string;                         // e.g. "Player 2"
  role?: 'detective' | 'investigator';
  onToggleRole?: () => void;
};
```

Body rendering rules:

1. `name` always renders at top (unchanged).
2. If `means` and `clues` are both provided, render them as today.
3. Else if `slotLabel` is provided, render a single ruled line: `slotLabel` in typewriter uppercase, same line-height as the game-mode body so the card height is visually comparable.
4. If `role` is provided, render the glued role nameplate (see below). If `onToggleRole` is also provided, the nameplate is a `ButtonBase`.

The two modes (game body / lobby body) never mix: a card either carries `means`+`clues` or `slotLabel`+`role`. Consumers control which.

### The glued role nameplate

A paper strip glued across the lower portion of the polaroid. Rendered as a **sibling** `<Box>` outside the polaroid's clipped notebook region (so the torn-edge `clipPath` doesn't chew its bottom), positioned just below the card with a small negative top margin (`mt: -1`) so it visually overlaps the torn edge.

- Width: ~90% of the card, centered. Small random rotation (±1.5°) per mount for hand-placed feel, memoised so it doesn't jitter on re-render.
- Paper: `#fff`, subtle drop shadow (`0 2px 6px rgba(0,0,0,0.25)`), no torn edge.
- Label: typewriter, uppercase, ~1rem.
  - `role='investigator'` → `INVESTIGATOR`, ink `var(--weapon-color)` (`#3A7085`, blue).
  - `role='detective'` → `FORENSIC SCIENTIST`, ink `var(--evidence-color)` (`#9E1B1B`, red).
- If `onToggleRole` is set, the strip is `ButtonBase disableRipple`. Hover: `translateY(-2px)` + deepened shadow (same vocabulary as `PinnedNote`). Click: calls `onToggleRole`.
- Respects `prefers-reduced-motion`: transitions disabled.
- Clicking the current `FORENSIC SCIENTIST` is a no-op — there's always exactly one detective, and the only way to change it is by clicking another player's `INVESTIGATOR`.

## `Lobby.tsx` after the rewrite

```tsx
export default function Lobby() {
  const { roomState, startTheGame } = useGame();
  const { t } = useI18n();
  const { canStart, readyPlayers } = useRoomState(roomState!);

  const [activeDetective, setActiveDetective] = useState(0);

  // Clamp if the selected detective's slot disappears.
  useEffect(() => {
    if (activeDetective >= readyPlayers.length) setActiveDetective(0);
  }, [readyPlayers.length, activeDetective]);

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ''),
    [roomState?.roomId],
  );

  // Memoised rotations/offsets per slot id — matches Board.tsx.
  const cardRotations = useMemo(/* per-slot random rotation */, [readyPlayers.map(s => s.id).join(',')]);
  const cardOffsets   = useMemo(/* per-slot random y offset */, [readyPlayers.map(s => s.id).join(',')]);

  const masonryRef = useRef<HTMLDivElement>(null);
  const masonry = useMasonryLayout(masonryRef, readyPlayers.length, 220, 24);

  if (!roomState) return null;

  const detectiveName = readyPlayers[activeDetective]?.name;

  return (
    <CorkBoard>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box>
          <CasePolaroid roomId={roomState.roomId} joinUrl={joinUrl} currentRound={0} />
          <AssigningCaseSheet
            detectiveName={detectiveName}
            count={readyPlayers.length}
            maxCount={12}
            canStart={canStart}
            onStart={() => startTheGame(activeDetective)}
          />
        </Box>

        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Box ref={masonryRef} sx={{ position: 'relative', width: '100%', height: masonry.containerHeight }}>
              <AnimatePresence>
                {readyPlayers.map((slot, i) => {
                  const style = masonry.styles[i];
                  return (
                    <motion.div
                      key={slot.id}
                      layout
                      initial={{ opacity: 0, scale: 0.7, y: -40, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: cardRotations[slot.id] ?? 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      ref={(el: HTMLDivElement | null) => masonry.setItemRef(i, el)}
                      style={{ width: 220, position: 'absolute', ...(style || {}) }}
                    >
                      <PolaroidCard
                        name={slot.name}
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

(Final masonry wiring may need small adjustments — the in-game Board uses `position: absolute` styles from the hook; the same pattern applies here.)

## Data flow

```
useRoomState(roomState)   → { readyPlayers, canStart }
useState(activeDetective) → number, default 0, clamped via useEffect

readyPlayers.map((slot, i) =>
  PolaroidCard {
    name:       slot.name
    slotLabel:  `Player ${i + 1}`
    role:       i === activeDetective ? 'detective' : 'investigator'
    onToggle:   () => setActiveDetective(i)
  }
)

AssigningCaseSheet {
  detectiveName: readyPlayers[activeDetective]?.name
  count:         readyPlayers.length
  maxCount:      12
  canStart:      canStart
  onStart:       () => startTheGame(activeDetective)
}
```

No new Firebase calls, no new `GameContext` surface. `startTheGame(activeDetective)` is already the existing hand-off.

## File impact

### New files

- `src/components/board/CasePolaroid.tsx` — extracted from `Board.tsx:181–294`.
- `src/components/board/AssigningCaseSheet.tsx` — modeled on `ForensicSheet`.

### Modified files

- `src/components/Lobby.tsx` — full rewrite per the block above. Drops `Container`, `Grid`, `Card`/`CardContent`, `LinearProgress`, `Snackbar`, `IconButton`, `LocalPoliceIcon`, `RoomQRCode` (moves into `CasePolaroid`), `PlayerSlotView`, `buildPlayerUrl`, the "Copy game url" button and its `handleCopy` handler, the `snackbar` state. Keeps `useRoomState`, `buildJoinUrl`, `useGame`, `useI18n`.
- `src/components/board/PolaroidCard.tsx` — `means`/`clues` optional; add `slotLabel`, `role`, `onToggleRole`; render the glued role nameplate when `role` is set.
- `src/components/Board.tsx` — swap the inlined QR polaroid (lines 181–294, plus the `stampClipPaths` and `crossClipPaths` memos that only this block uses) for `<CasePolaroid roomId={roomState.roomId} joinUrl={joinUrl} currentRound={gameState.round} />`. No behavior change.
- `src/i18n/translations.ts` — add keys: `Assigning case`, `on scene`, `Start investigation`, `Investigator`, `Player`. Reuse the existing `Forensic Scientist` key.

### Files explicitly not touched

- `src/components/board/CorkBoard.tsx`, `Pushpin.tsx`, `CoffeeStains.tsx`, `ForensicSheet.tsx`, `GuessNote.tsx`, `PinnedNote.tsx`, `CaseFile.tsx`, `StampButton.tsx`.
- `src/contexts/GameContext.tsx`, `src/pages/Room.tsx` (including the `RoomInfoModal` + FAB), `react-gameroom` usage.
- `src/theme/theme.ts`, `src/theme/GlobalStyles.tsx`.

## Verification (manual — no test runner)

1. `npm run dev`, create a room as host → Lobby renders on `CorkBoard`, `CasePolaroid` top-left shows `Case #ABCD` + three un-crossed rounds, `AssigningCaseSheet` below it shows `ASSIGNING CASE` header, empty signature line, `0 / 12 on scene`, disabled Start button.
2. Right column is empty; no crash (masonry `containerHeight` = 0).
3. On a second device, join the room → a polaroid pins up with a spring animation. Slot label reads `PLAYER 1`; role nameplate reads `INVESTIGATOR` in blue.
4. The first-joined player becomes the initial detective (index 0). Their nameplate flips to `FORENSIC SCIENTIST` red; the sheet's signature line shows their name in red script.
5. Join a second player → `2 / 12 on scene`. Click their `INVESTIGATOR` strip → it flips to `FORENSIC SCIENTIST`; the prior detective's strip flips back to `INVESTIGATOR`; the sheet signature updates.
6. `Start investigation` is disabled until `canStart` is true (per `useRoomState`). Once enabled, clicking it calls `startTheGame(activeDetective)` and the `Room` page swaps to `Board`. The `CasePolaroid` stays visually identical across the transition.
7. A player leaves mid-lobby → their card animates out; counter updates. If they were the detective, `activeDetective` snaps back to `0` and the sheet signature updates to the new slot-0 player.
8. `Board` still renders correctly after the `CasePolaroid` extraction — `Case #`, `RoomQRCode`, round indicators, crossed-out rounds for `r <= gameState.round`.
9. `npm run lint` and `npm run build` clean.

## Risks and unknowns (resolved during implementation)

- **`motion.div` + masonry `position: absolute`.** The Board's masonry hook sets absolute positioning via inline styles; `framer-motion`'s `layout` prop plus `position: absolute` can conflict with the hook's measurements. If layout animation fights the masonry, drop `layout` from `motion.div` (keep enter/exit only) and rely on the masonry hook for position.
- **Role nameplate placement on the torn edge.** The polaroid uses a `clipPath` for the torn bottom edge. The nameplate needs to sit *on top* of the clip, not be clipped. Either render it as a sibling `<Box>` outside the clipped region (preferred) or lift it via absolute positioning. Decide during implementation based on which reads better.
- **Counter pluralisation in PT-BR.** `X / 12 on scene` reads fine in English; Portuguese translation needs a concordant noun. Translator decides.
- **First-join race.** There's a tick between `readyPlayers` being empty and having one entry; the sheet's signature line must tolerate `detectiveName === undefined` gracefully (empty underline, no crash).

## Out of scope (for this spec)

- Shared-layout crossfade between the lobby polaroid and the in-game polaroid. (Noted as a natural follow-up; the component split deliberately makes it additive.)
- Lobby chat, avatars, colors-per-player.
- Minimum-player hint copy on the sheet.
- Any change to `RoomInfoModal` + Info FAB.
- Any change to `GameContext` / `useRoomState` / `react-gameroom` surface.
