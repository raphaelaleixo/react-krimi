# Hidden Murderer Pick — Design Spec

**Date:** 2026-04-21
**Status:** Draft, awaiting user review
**Scope:** Game-logic change; touches `GameContext`, one new component, edits to `Detective`, `ForensicAnalysis`, `Player` routing, and `types`.

## Motivation

Today the murderer is the only non-forensic player who sees a card-picking screen at game start. In a large room, the lull on every other player's device is a tell — they're sitting idle while one person is visibly "doing something." The asymmetry leaks the murderer's identity before the detective work even begins.

We want every non-forensic player to perform the same action at game start: pick a mean and a clue from their own hand, as if *they* were the murderer. The actual murderer is still drawn randomly, but their identity is hidden from everyone (including themselves) until all picks land. At reveal time, the drawn player's submitted pick becomes the canonical `murdererChoice` — they are locked into what they picked blindly.

## The new flow

1. **Host starts game.** Roles are assigned as today: the murderer is drawn via `chooseRandomMurderer`, cards are distributed, `KrimiGameState` is written to Firebase. The murderer index is stored from the start — **it is simply not revealed in any UI yet.**
2. **Pick phase.** Every non-forensic player sees a new `PickPhase` screen asking them to choose one mean + one clue from their own 4+4 hand. The copy frames it as *"if you were the murderer, which cards would you want found at the scene?"* No role has been revealed. The forensic scientist sees a "waiting for all players to submit their picks" screen in place of today's "waiting for the murderer to choose."
3. **Submit.** When a player hits submit, their pick is written to `playerPicks[playerOrderIndex]` in Firebase. The pick is **locked** — the UI for that player switches to a "waiting for others" state with no re-pick affordance.
4. **Reveal trigger.** When the last non-forensic pick lands, the reveal is derived client-side (no explicit `rolesRevealed` flag is written). Every client computes: *have all non-forensic players picked?* If yes, role-reveal UI is shown.
5. **`murdererChoice` finalization.** On every pick submission, after writing `playerPicks[i]`, the submitting client checks whether all picks are now in and `murdererChoice` is still unset. If so, it writes `murdererChoice = playerPicks[murderer]` in the same Firebase update batch. Idempotent — if two clients race, both write identical data.
6. **Role reveal.**
   - The drawn player sees "You are the murderer. Your locked pick: [mean] + [clue]."
   - Every other non-forensic player sees "You are an investigator."
   - The forensic sees the murderer's name and their locked pick.
7. **Rest of game.** Forensic picks analysis categories, then guessing rounds and win conditions proceed exactly as today. `checkEndGame` continues to read `murdererChoice` with no changes.

## State shape changes

Additions to `KrimiGameState`:

```ts
playerPicks?: Record<number, { mean: string; key: string }>;
```

- Keyed by `playerOrderIndex` (not player id), matching the convention already used for `passedTurns` and `guesses`.
- Only non-forensic players appear as keys.
- Populated during the pick phase; **retained** after reveal (useful for debugging and potential post-game reveal of decoys — no reason to wipe it).

Unchanged:

- `murderer: number` — still set at game start. UI gates on "are all picks in?" before exposing it.
- `murdererChoice?: { mean; key }` — still the single source of truth for downstream logic (`checkEndGame`, forensic display). Now written once, from `playerPicks[murderer]`, when the last pick lands.

No new persisted flag. `rolesRevealed` is a **derived** value:

```ts
const rolesRevealed =
  gameState.playerPicks &&
  Object.keys(gameState.playerPicks).length === gameState.playerOrder.length - 1;
```

(Subtract 1 for the forensic. Derivation depends on `detective` being excluded from the pick phase — enforced in UI routing, not in the derivation itself.)

## Component changes

### New: `src/components/PickPhase.tsx`

Renders the pick UI for a non-forensic player. Lifts the mean + clue chip selectors directly from today's `MurdererChoice.tsx`. Differences:

- Copy: no mention of "you are the murderer" or "your murder." The prompt is neutral — "pick your cards as if you were the murderer."
- Submit calls a new `submitPick(playerOrderIndex, pick)` action on `GameContext` (see below), not `setMurdererChoice`.
- After submit, component shows a "waiting for other players" state; selectors are disabled and there is no re-pick button.

### Deleted: `src/components/MurdererChoice.tsx`

Its role (murderer-only card picker after role reveal) no longer exists. All picking happens pre-reveal, in `PickPhase`.

### `src/components/Detective.tsx`

`Detective` is only rendered post-reveal (see `Player.tsx` routing below), so pre-reveal concerns don't apply here.

- Remove the `MurdererChoice` import and the `<MurdererChoice ... />` render inside the role reveal drawer.
- For the murderer, the drawer now shows "You are the murderer" plus their locked pick as read-only chips (mean + clue) — read directly from `gameState.murdererChoice`, since at this point the player *is* the murderer and the value is finalized.

### `src/components/ForensicAnalysis.tsx`

- The `!gameState.murdererChoice` branch's copy changes from "Waiting for the murderer to choose..." to "Waiting for all players to submit their picks."
- The "The murderer is: **X**" line is hidden entirely until `rolesRevealed` — today it leaks on render. After reveal, behavior is identical.

### `src/pages/Player.tsx`

`renderStarted` becomes:

- If `playerOrderIndex === gameState.detective` → render `ForensicAnalysis` (unchanged path; forensic sees its own pre-reveal waiting state internally).
- Else if `!rolesRevealed` → render `PickPhase`.
- Else → render `Detective`.

### `src/contexts/GameContext.tsx`

- Remove `setMurdererChoice` from the context value.
- Add `submitPick(playerOrderIndex, pick)`. Implementation:
  1. Write `playerPicks/${playerOrderIndex}` at path `rooms/${roomId}/game/playerPicks/${playerOrderIndex}`.
  2. `get()` the latest `game` snapshot.
  3. If `Object.keys(playerPicks).length === playerOrder.length - 1` and `murdererChoice` is not set, `update` with `murdererChoice: playerPicks[murderer]`.
- `MockBoard.tsx` seed data: add a filled `playerPicks` map matching the mocked `murdererChoice` so the mock continues to represent a post-reveal state.

### `src/types.ts`

Add `playerPicks?: Record<number, { mean: string; key: string }>` to `KrimiGameState`.

## Reveal trigger and race handling

Two non-forensic players could submit near-simultaneously. The race matters only for writing `murdererChoice`:

- Client A submits pick → writes `playerPicks[a]` → reads state → sees all picks in → writes `murdererChoice`.
- Client B submits pick at the same time → writes `playerPicks[b]` → reads state → sees all picks in → writes `murdererChoice`.

Both writes target the same path with the same value (`playerPicks[murderer]` is the same on both reads, because the murderer's pick was already persisted). The second write is a no-op overwrite of identical data. No harm.

`rolesRevealed` being derived client-side means no race around the flag at all — every client sees the reveal the instant it observes the last pick landing in its `onValue` subscription.

## Edge cases

- **Mid-pick refresh.** A submitted pick is in Firebase and survives reload. An in-progress selection (mean chosen but not yet clue) is local React state — lost on reload, user re-selects. Same trade-off as today's `MurdererChoice`.
- **Player offline at game start.** The pick phase stalls waiting for their submission. This is the same failure mode as today when any player disconnects; out of scope for this change.
- **Partial pick.** The submit button is disabled until both a mean and a clue are chosen — copied directly from today's `MurdererChoice` pattern.
- **Detective changes before `startTheGame`.** Handled upstream — the detective index is captured at `startTheGame` time, and `chooseRandomMurderer` already excludes that index.
- **Mock board.** `MockBoard.tsx` seeds a static game state; we add a matching `playerPicks` entry so the mock renders a post-reveal view without running the pick phase logic.

## Non-goals

- Revealing non-murderer picks to the forensic or to other players after the reveal. Decoy picks stay in `playerPicks` for potential later use (e.g., a post-game wrap-up screen), but no UI surfaces them in this change.
- Any mechanism for the murderer to change their pick after reveal. That was considered and rejected — locked picks are part of the point.
- Progress indicators during the pick phase (e.g., "3 of 5 players picked"). Deferred; if added later, we should avoid naming specific players to preserve the hiding property.
- Changing the forensic's own flow once the murderer is revealed. From the reveal onward, the forensic's experience is identical to today.

## Success criteria

- A fresh game with 5+ players shows every non-forensic player the `PickPhase` screen simultaneously at game start.
- No UI anywhere displays the murderer's identity before all picks are submitted — including the forensic's screen.
- Once the last pick lands, every client transitions to the post-reveal view within one Firebase round trip, with the drawn player seeing the murderer role and the correct locked pick.
- `checkEndGame`, guessing, passing, and win conditions behave identically to today — this change is invisible to everything downstream of `murdererChoice`.
