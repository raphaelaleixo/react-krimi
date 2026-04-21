# Player Screens Redesign — Design Spec

**Date:** 2026-04-21
**Status:** Draft, awaiting user review
**Scope:** Visual redesign of `PickPhase` and the `Detective` "my hand" view. Introduces shared corkboard framing and two new components (`PlayerFolder`, `RoleCard`). No behavior or routing changes.

Deferred work (solve takeover view, `ForensicAnalysis` redesign) is tracked in `2026-04-21-player-screens-redesign-deferred.md`.

## Motivation

The host board already speaks a distinct visual language — corkboard backdrop, torn manila paper, pushpins, typewriter font, highlighter-marked lines for means/clues, stamps for state. The player-facing screens (`PickPhase`, `Detective`, `ForensicAnalysis`) still use plain MUI cards and chips. The gap is jarring: the game the host projects and the device the player holds don't look like they belong to the same world.

This pass brings `PickPhase` and the `Detective` my-hand view into the corkboard language so a player's device feels like a part of the same murder board. `ForensicAnalysis` and the `Detective` solve flow are left for follow-up specs so the first pass can ship small.

## Non-goals

- No changes to `ForensicAnalysis`.
- No changes to the `Detective` solve-crime flow — the existing `SwipeableDrawer` stays exactly as it is when the player taps Solve. Only the button's visual treatment changes.
- No changes to `GameContext`, actions, Firebase state shape, or routing.
- No restructuring of the translation system. New visual elements that carry copy (e.g. "SUBMITTED" stamp label, `RoleCard` detective/murderer captions) get new translation keys added to `src/i18n/translations.ts` in both English and Portuguese. Existing keys are reused wherever the copy is unchanged.

## Shared visual frame

All in-scope player screens render inside the existing `CorkBoard` wrapper used by `Board` and `Lobby`, scaled for phone viewports.

- **Typography:** typewriter font (`kingthings_trypewriter_2`) for headings; body typography unchanged.
- **Pinned elements:** absolutely-positioned children on the cork, composed with `Pushpin`, `CoffeeStains`, and torn-edge paper treatments — the same composition pattern already used on the host board.
- **Content language:** means and clues render as highlighter-marked lines (already in use on the board). Player-made selections are indicated by a new **red marker circle** drawn around the selected line — visually distinct from the highlighter fill, reusing the red-marker vocabulary already present in `RedStrings`.
- **Theme tokens:** no new CSS variables. Existing tokens (`--evidence-color`, `--font-script`, etc.) are reused throughout.

## New components

### `PlayerFolder`

A piece of stationery representing the player's own dossier — their name at the top, their 4 means and 4 clues inside. Used on the player's own device; not interchangeable with `PlayerFile` (the torn-paper tile used for players on the host board).

**Visual:** manila case folder with a tab/label at the top carrying the player's name. The body is "open" to reveal contents — 4 means listed as highlighter-marked lines, 4 clues as highlighter-marked lines, grouped visually.

**Modes:**

- **`select`** — each line is interactive. Tapping a mean draws a red marker circle around it; tapping a different mean moves the circle. Same for clues. Exactly one of each may be selected at a time. Used by `PickPhase`.
- **`display`** — lines are read-only. No interaction, no selection affordance. Used by `Detective` my-hand view.

**Overlays:**

- A "SUBMITTED" (or translated equivalent) stamp can be overlaid on the folder. Used by `PickPhase` post-submit to confirm the pick is locked.
- A "Passed" stamp can be overlaid. Used by `Detective` after the player passes their turn. Reuses the existing passed-stamp visual treatment from `PlayerFile`.

**Props (shape, not final):**

```ts
interface PlayerFolderProps {
  playerName: string;
  means: string[];
  clues: string[];
  mode: 'select' | 'display';
  selectedMean?: string | null;
  selectedKey?: string | null;
  onSelectMean?: (mean: string) => void;
  onSelectKey?: (key: string) => void;
  stamp?: 'submitted' | 'passed' | null;
}
```

### `RoleCard`

A small noir-style calling card pinned on the cork — the player's identity in the case. Used on the `Detective` my-hand view.

**Variants:**

- **Detective** — caption *"[Name], Private Detective"* (or translated equivalent), single card. Informational only.
- **Murderer** — same card shape, but also exposes the locked `mean` + `key` as highlighter-marked lines. Presentation can be a second card pinned beside, or a dog-eared fold on the same card revealing the reverse — whichever reads cleaner in implementation. Only the murderer's own device sees this variant.

**Entrance:** on first render, the card drops in with the same spring motion used by existing board elements to draw the player's attention. After the entrance, it remains statically pinned.

**Props (shape, not final):**

```ts
interface RoleCardProps {
  playerName: string;
  role: 'detective' | 'murderer';
  lockedPick?: { mean: string; key: string }; // required when role === 'murderer'
}
```

### `RedMarkerCircle` (or equivalent)

A visual wrapper that draws a hand-drawn-looking red circle around its children when active. Used by `PlayerFolder` in select mode for each selectable line. Small, internal implementation detail — may be a CSS-only treatment rather than a separately exported component. The key requirement is that it reads as "drawn on with a red marker," not as a UI border.

## Screen: `PickPhase`

**Layout on cork, top → bottom:**

1. Pinned prompt note — copy equivalent to today's *"If you were the murderer, which cards would you want found at the scene?"* (existing translation key reused). Visual: taped/pinned note, same language as other pinned notes on the board.
2. `PlayerFolder` in `select` mode, populated with the player's own `means` and `clues`. Tapping draws the red marker circle on the tapped line.
3. Stamp-style submit button pinned below the folder. Disabled until both a mean and a clue are selected.

**Post-submit state:**

- The red marker circles remain on the locked selections; the folder is no longer interactive.
- A "SUBMITTED" stamp overlays the folder.
- The submit button is replaced by a pinned `WaitingNote` carrying *"Waiting for other players to submit their picks..."* (existing translation key).

The existing `submitPick` action is called unchanged. No new state is tracked client-side beyond what `PickPhase` already keeps today.

## Screen: `Detective` (my-hand view)

**Layout on cork:**

1. `RoleCard` pinned at the top. Detective or murderer variant picked from `isMurderer` (already derived in `Detective.tsx`). Murderer variant is populated from `gameState.murdererChoice`.
2. `PlayerFolder` in `display` mode, populated with the player's own `means` and `clues`. No selection affordance.
3. Pinned pass-turn button. When pressed, the `Passed` stamp lands on the folder and the button becomes disabled. Reuses existing `passTurn` action.
4. Stamp-style **Solve** button pinned prominently (e.g. red/evidence color). Tapping it opens the existing `SwipeableDrawer` exactly as today — the drawer itself is out of scope for this pass.

**Disabled state** (after the player has passed or has submitted a guess): pass and solve buttons dim; folder and role card are unchanged. Disabled derivation is unchanged from today (`passedTurns[playerOrderIndex]` or `guesses[playerOrderIndex]`).

**Role reveal drawer:** removed from this screen. Its job is now carried entirely by the pinned `RoleCard`. The `roleSheet` state and the `SwipeableDrawer` wrapping it go away; `solveSheet` and its drawer stay for now (this pass's only change to solve is the button's visual treatment).

## Component reuse summary

| Used | Purpose |
| --- | --- |
| `CorkBoard` | Shared backdrop. |
| `Pushpin`, `CoffeeStains`, torn-paper styling | Pinned-element composition on cork. |
| `WaitingNote` | `PickPhase` post-submit waiting state. |
| `StampButton` (or equivalent) | Submit (in `PickPhase`) and Solve (in `Detective`). |
| Existing passed-stamp treatment (currently in `PlayerFile`) | Reused inside `PlayerFolder` for the passed state. |
| Existing pinned-note pattern | Prompt note in `PickPhase`. |
| `submitPick`, `passTurn`, `makeGuess` (via the existing drawer) | All actions unchanged. |

## Files expected to change

- `src/components/PickPhase.tsx` — rewritten around `CorkBoard` + `PlayerFolder` + pinned prompt + stamp submit + `WaitingNote`.
- `src/components/Detective.tsx` — role drawer removed; `CorkBoard` + `RoleCard` + `PlayerFolder` + pass button + stamp Solve button added; solve drawer left in place.
- `src/components/board/PlayerFolder.tsx` — new component.
- `src/components/board/RoleCard.tsx` — new component.
- Small additions to existing styling helpers if needed for the red marker circle.

No changes to `src/contexts/GameContext.tsx`, `src/types.ts`, `src/App.tsx`, or any data/rules module.

## Testing

No test runner is configured in this repo (`CLAUDE.md`). Verification is manual:

- Launch a local game with 4+ players.
- Confirm `PickPhase` renders on the cork for each non-forensic player; select + submit works; post-submit state shows the stamp and `WaitingNote`.
- Confirm `Detective` my-hand view renders role card correctly for both variants; pass and solve buttons behave identically to today; existing solve drawer still opens and functions.
- Confirm `ForensicAnalysis` is untouched.
- Confirm host `Board` and `Lobby` visuals are untouched.

## Rollout

Single PR. No feature flag. No data migration.
