# Player Screens Redesign — Deferred Work

**Date:** 2026-04-21
**Status:** Follow-ups to the main player-screens redesign (`2026-04-21-player-screens-redesign-design.md`). Not in scope for the first pass.

The first pass covers the shared corkboard frame, `PickPhase`, and the `Detective` "my hand" view (role card + folder + pass + solve button). The items below were brainstormed but deliberately deferred so the first pass can ship small.

## Deferred item 1 — Solve takeover view

The solve button exists on the `Detective` screen after the first pass, but continues to open the current `SwipeableDrawer`. A future spec should replace it with a two-step takeover view:

- **Sub-view A — pick target player.** Back button top-left (returns to my-hand view, discarding in-progress selection). Pinned prompt note (*"Who is the murderer?"*). Other players (excluding self and detective) shown as small pinned `PlayerFile` tiles. Tapping a tile proceeds to sub-view B.
- **Sub-view B — select cards for the target.** Back arrow to sub-view A. Pinned prompt (*"What did they use? What was the key evidence?"*). Target's `PlayerFolder` in select mode, populated with *their* means + clues. Red marker circle on tap. Stamp-style "Send guess" button pinned below, disabled until both selections are made. On send: returns to my-hand view; guess persists via the existing `makeGuess` action.

Existing `makeGuess` logic is unchanged — only the UI around it.

## Deferred item 2 — `ForensicAnalysis` redesign

The detective's own-device screen stays untouched in the first pass. A future spec should bring it into the corkboard language.

**Fillable sheet.** Mirror the host board's `ForensicSheet` visual language: pinned sheet with category titles and empty highlighter slots that become dropdowns on tap. Conceptually, the detective is filling out the same sheet that appears on the board. A new component (e.g. `ForensicSheetFillable`) should share the visual with `ForensicSheet` without coupling display-mode and fill-mode concerns into a single component.

**Post-reveal state.** Once all picks are submitted, the murderer's `PlayerFolder` is pinned on the cork beside the fillable sheet, with their locked `mean`/`key` marked with the red marker circle (same language used when the murderer originally picked).

## Open questions for later

- Where does the solve takeover animate from / to — is it a route change, a Framer Motion transition, or a conditional swap? Answer when picking up the solve spec.
- Should `PlayerFolder` (defined in the first pass) support a "highlight / locked pick" display mode for the post-reveal `ForensicAnalysis` case, or is a lighter read-only variant enough? Answer when picking up the `ForensicAnalysis` spec.
