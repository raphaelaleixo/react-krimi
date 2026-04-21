# Lobby Loading State — Design Spec

**Date:** 2026-04-21
**Status:** Draft, awaiting user review
**Scope:** One new component, `src/components/Lobby.tsx` insertion, three new i18n keys.

## Motivation

Today, the host corkboard shows joined players as `PlayerFile`s in the masonry area and a "3/6 on scene" counter on the `AssigningCaseSheet`. When fewer than the minimum number of players have joined, the right side of the board is just empty cork — nothing animates, nothing signals "we're waiting for more." The host can see the counter, but the screen feels static to everyone watching.

We want a visible, alive signal on the corkboard that says "the game is waiting" while the lobby fills up, and that says "ready to go" the moment enough players have joined.

## Goals

- A small loading note on the host corkboard, right side, in the area where `GuessNote`s will later land during play.
- Headline `Waiting...` / `Aguarde...` with a character drop-in / drop-out animation (the CSS `text-shadow` technique the user supplied).
- Subtitle that reflects lobby readiness:
  - below minimum: `Waiting for {n} more…` / `Aguardando mais {n}…`
  - at or above minimum: `We can start the game now` / `Podemos começar o jogo`
- Visually native to the corkboard (typewriter font, off-white paper, pushpin).
- Unmounts naturally when the game starts — no extra conditional in `Lobby.tsx`.

## Non-goals

- No player-side (phone) loading state — that's out of scope for this iteration. Only the host's corkboard is touched.
- No change to when the Start button enables or how `canStart` is computed — the existing `react-gameroom` contract is untouched.
- No full-room-capacity cue — the note is about reaching the minimum-to-start threshold, not filling all seats. Once `canStart` is true, the subtitle stops counting.
- No new state in `GameContext` or Firebase. All values derive from `roomState` / `useRoomState()` already available to `Lobby.tsx`.
- No test suite additions — the project has no test runner configured. Verification is manual (see Testing).

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Placement: right column, below the player masonry, inside the existing `<Box sx={{ flex: 3 }}>` | Mirrors the exact spot `GuessNote`s render during play (`Board.tsx:197-225`). Board and Lobby share the same frame; the loading block occupies the "guesses will go here" space. |
| 2 | New component `src/components/board/LobbyWaitingNote.tsx`, sibling of `AssigningCaseSheet` / `GuessNote` | Matches the existing component organization under `components/board/`. |
| 3 | Headline is `Waiting...` / `Aguarde...` — both exactly 10 characters | The `text-shadow` keyframes from the user's reference are hard-coded to 10 letter slots (`calc(-9*var(--w))`). Keeping both languages at 10 chars means no per-language animation variant. |
| 4 | Animation: CSS `@keyframes` with `text-shadow` cascades, verbatim from the user's snippet, scoped via a class in the component | The user supplied the technique; it's lightweight (no JS loop, no per-letter DOM), and it does the drop-in / rest / drop-out feel the user asked for. Motion/react was considered (C in brainstorming) and rejected — no functional upside, more code. |
| 5 | Animation color + font: `var(--font-typewriter)` and `var(--text-color)` instead of `monospace` + `#000` | Matches the rest of the corkboard (CasePolaroid signatures, AssigningCaseSheet header). |
| 6 | Paper chrome: off-white `#f8f6f0` fill with a soft shadow and a single `Pushpin`, no ruled-paper background | Same visual language as the upper half of `AssigningCaseSheet` but lighter — this is a small note, not a full case sheet. Reuses the existing `Pushpin` component. |
| 7 | Subtitle swaps text in place when `canStart` flips; no layout shift | Both strings are short and single-line; a hard swap is fine. Keeps the note's vertical footprint stable as players join. |
| 8 | The note renders unconditionally while `Lobby` is mounted | `Lobby` already unmounts when `gameState.started` flips (`Room.tsx:25`). No extra gating needed. |
| 9 | `remaining` prop = `Math.max(0, minPlayers - readyPlayers.length)` — clamped to ≥ 0 | `canStart` being true already suppresses the count, but clamping in the prop keeps the component robust if called in any other state. |
| 10 | Interpolation of `{n}`: simple `t('Waiting for {n} more…').replace('{n}', String(remaining))` | No interpolation helper exists in `useI18n` today. Keeping this inline avoids introducing a helper for a single call site. |

## Component API

`src/components/board/LobbyWaitingNote.tsx`:

```ts
interface LobbyWaitingNoteProps {
  remaining: number;    // minPlayers - readyPlayers.length, clamped to ≥ 0
  canStart: boolean;    // mirrors useRoomState().canStart
}
```

Renders:

1. A `Box` container styled like a small paper note (off-white fill, soft shadow, padding) with a `Pushpin` in the top area.
2. An animated `<span class="lobby-waiting-headline">` whose `::before` content is the translated headline text. Animation runs on a `@keyframes` block defined inside the component file (scoped via a class name prefix like `lobby-waiting-`).
3. A subtitle `<Typography>` with the translated text that reflects `canStart`.

## Integration

In `src/components/Lobby.tsx`, inside the existing right-side `<Box sx={{ flex: 3 }}>` block, add a new sibling under the masonry wrapper:

```tsx
<Box sx={{ flex: 3 }}>
  <Box ref={masonryRef} sx={{ /* existing */ }}>
    {/* existing investigator cards */}
  </Box>

  {/* new */}
  <LobbyWaitingNote
    remaining={Math.max(0, roomState.config.minPlayers - readyPlayers.length)}
    canStart={canStart}
  />
</Box>
```

No changes to `Lobby.tsx`'s state, effects, or the `AssigningCaseSheet` props. `minPlayers` is already available on `roomState.config` (same source as `maxPlayers`, which is already read in `Lobby.tsx:98`).

## i18n

Add to `src/i18n/translations.ts`:

```ts
// Lobby loading state — added 2026-04-21
'Waiting...': 'Aguarde...',
'Waiting for {n} more…': 'Aguardando mais {n}…',
'We can start the game now': 'Podemos começar o jogo',
```

Note the ellipsis choice: the headline uses three ASCII dots (`...`) so both languages hit exactly 10 characters; the subtitle uses the typographic ellipsis (`…`) since it doesn't drive the animation geometry.

## Animation

Lifted from the user's reference snippet, adapted to the project's CSS vars. Approximate shape:

```css
.lobby-waiting-headline {
  --w: 10ch;
  font-family: var(--font-typewriter);
  font-size: 1.6rem;
  letter-spacing: var(--w);
  width: var(--w);
  overflow: hidden;
  white-space: nowrap;
  color: transparent;
  animation: lobby-waiting-drop 2s infinite;
}
.lobby-waiting-headline::before {
  content: attr(data-text);
}
@keyframes lobby-waiting-drop {
  /* identical cascade from user snippet:
     0–36% drop each of 10 letters into place one at a time,
     40–60% rest,
     64–96% drop each letter out downward,
     100% all below baseline */
}
```

The headline element is a `<span data-text={t('Waiting...')}>` so the translated text is rendered via `content: attr(data-text)` — this keeps the CSS agnostic of language.

## Error handling

None. `roomState.config.minPlayers` is guaranteed to exist by the time `Lobby` renders (`Room.tsx` gates on `!roomState`). `readyPlayers` is always an array. `canStart` is always a boolean. The clamp on `remaining` protects against any transient `readyPlayers.length > minPlayers` edge, though that's unlikely — the Start button becomes enabled, and the subtitle switches to "We can start the game now" regardless.

## Testing (manual)

No test runner exists. Verification steps:

1. `npm run dev`, open `/`, create a room as host.
2. On host screen: the corkboard shows the new note below the (empty) masonry with `Waiting...` animating (letters drop in, rest, drop out, repeat) and `Waiting for 5 more…` beneath.
3. Join players from other devices one at a time. The subtitle count ticks down: 4, 3, 2, 1.
4. At `readyPlayers.length === minPlayers`, the subtitle swaps to `We can start the game now`, and the `Start investigation` stamp becomes enabled (pre-existing behavior).
5. Toggle language to Portuguese on the Home screen, reconfigure room. Verify both strings translate and the animation still runs.
6. Click `Start investigation`. Lobby unmounts; the note disappears with it; Board renders.
7. Visual QA: the note's paper / pushpin styling blends with the rest of the corkboard; no layout jump when the subtitle swaps.

## Out-of-scope follow-ups

- Player-side (phone) loading state while waiting for the game to start — the plain "Waiting for the game start" text in `Player.tsx:65` is a natural next target.
- Transition state between "Start investigation" click and the board fully painting (network round-trip to Firebase) — a separate loading case, not addressed here.
