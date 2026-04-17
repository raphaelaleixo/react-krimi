# Murder Board Redesign — Board Component

## Overview

Redesign the `Board.tsx` component to look like a classic detective corkboard — cork background, pushpins, polaroid suspect cards, red string connecting guesses, handwritten annotations, and aging effects. Desktop-focused (host's big screen view). Built with CSS + SVG overlay on existing MUI components, no new dependencies.

## Page Structure

Three nested layers:

1. **Wall** — full viewport, dark slate/charcoal background. The "precinct wall" behind the board.
2. **Frame** — centered rectangle (~95vw x ~90vh), wooden border (CSS border-image or brown gradient with subtle wood grain), drop shadow against the wall.
3. **Cork surface** — inner area with cork texture background (CSS pattern or small tiling image). All board content lives inside this layer. No scrolling — everything fits within the visible board.

The current `<Container>` + MUI `<Grid>` layout is replaced with positioned layout inside the cork surface.

## Suspect Cards — Polaroid Style

Each suspect is a polaroid-style card pinned to the board:

- **White border** all around, thicker at the bottom for the player name area.
- **Player name** in handwriting font ("Shadows Into Light") at the bottom of the polaroid.
- **Interior** has two rows of chips — blue means, red clues — on a slightly yellowed paper background (`#faf5e8`).
- **Pushpin** at top center — CSS circle with radial gradient for 3D effect. Red-colored for suspects. Replaces the current sticky-tape `::before` pseudo-element.
- **Random rotation** — kept from current implementation (`randomRotation()`).
- **Vertical stagger** — randomized `top` offset of ~10-20px per card for organic feel, layered on top of rotation.
- **"Passed this turn"** text stays on the card in handwriting font.

Cards are positioned using CSS Grid or absolute positioning within the cork surface, arranged as a row across the main board area.

Guess text is **removed from suspect cards** — it becomes a separate pinned note (see Red Strings section).

## Forensic Analysis — The Big Sheet

Pinned to the right side of the board, one large sheet of paper:

- **Printed report style** — white/off-white paper, optional faint ruled-line pattern.
- **Header** — "FORENSIC ANALYSIS" in typewriter font (kingthings).
- **Detective's name** below the header in handwriting font, like a signature.
- **Pushpin** at the top of the sheet.
- **Round 1 analysis items** listed on the sheet — category title in typewriter font, selected value in handwriting font + blue color (`#3da9fc`).
- **Round 2 and 3 additions** appear as smaller notes "glued" on top of the main sheet:
  - Slightly overlapping the bottom portion of the sheet.
  - At a slight random angle.
  - Own subtle drop shadow for layering depth.
  - Small tape strip across their top edge (reusing existing tape aesthetic, slightly more yellowed).
  - Same typewriter-title + handwriting-value format.

The layering creates a visual timeline of the investigation building up.

## Red Strings & Guess Notes

When a player makes a guess, two elements appear:

### Guess Note
- Small piece of aged/yellowed paper pinned near the accuser's card.
- Text in handwriting font: "Player A said Player B did it, the M.O. was Sulfuric Acid and the key evidence was Map".
- If the guess was wrong: entire text gets `text-decoration: line-through` in red, like the detective struck it out.
- Own pushpin.

### Red String
- SVG `<path>` from the guess note to the accused player's card.
- Styled as red yarn: `stroke: #cc3333`, `stroke-width: 2-3px`.
- Slight curve (quadratic bezier) so it looks like draped string, not a rigid line.
- Subtle `filter: drop-shadow` for depth.
- Endpoint: from the guess note's nearest edge to the accused card's pushpin.

### Implementation
- Each card and guess note gets a `ref`.
- `useLayoutEffect` + `ResizeObserver` calculates SVG path endpoints on layout changes.
- SVG overlay is absolutely positioned over the cork surface, `pointer-events: none`.
- Multiple guesses produce multiple strings that fan out naturally since guess notes are positioned near their respective accuser cards.

## Coffee Stains & Wear

Subtle aging effects, all pure CSS:

- **Coffee ring stain** — one or two CSS radial gradients positioned absolutely on the cork surface. Semi-transparent brown ring (`rgba(101, 67, 33, 0.15)`), slightly blurred. Placed in corners or between cards.
- **Yellowed card paper** — polaroid interiors and guess notes use `#faf5e8` instead of pure white. Forensic analysis sheet stays whiter to contrast.
- **Worn card edges** — subtle `box-shadow` with slight inset for edge wear. Optional faint `filter: sepia(0.05)`.
- **Tape aging** — tape strips on glued-on analysis notes are more yellowed than current transparent ones.
- Positions are fixed (seeded from room ID or hardcoded) so they don't jump on re-render.
- Kept restrained — lived-in, not destroyed.

## Typography Map

| Element | Font | Notes |
|---|---|---|
| Game title, round counter | Typewriter (kingthings) | Pinned at top of board |
| "Suspects of the crime" heading | Typewriter | Pinned/stamped on board |
| "FORENSIC ANALYSIS" header | Typewriter | On the big sheet |
| "Forensic Scientist" label | Typewriter, small | Under detective name |
| Player names on polaroids | Shadows Into Light | Written on polaroid border |
| Detective's name on report | Shadows Into Light | Signed on the sheet |
| Analysis values | Shadows Into Light, blue, large | Detective's handwriting |
| Guess notes | Shadows Into Light | Scrawled on pinned notes |
| "Passed this turn" | Shadows Into Light | On suspect card |
| Means/clue chips | IBM Plex Mono | Printed labels, unchanged |

No new fonts required. Three-font system: typewriter (official/printed), handwriting (detective's notes), monospace (data).

## Technical Approach

**CSS-only board with SVG string overlay** (Approach A):

- Corkboard layout using CSS positioned layout within the cork surface.
- Red strings as an SVG layer on top with `<path>` elements.
- Pushpins, coffee stains, polaroid borders all done with CSS pseudo-elements, gradients, and box-shadows.
- Cork texture + wooden frame as nested background divs.
- String positioning via refs + `useLayoutEffect` + `ResizeObserver`.
- No new dependencies beyond what's already in the project.

## Scope

- Desktop-focused — designed for the host's big screen. No mobile optimization.
- End-game state (stamps, winner reveal) is deferred to a follow-up design.

## Out of Scope

- Player view (`/room/:id/player/:playerId`) — unchanged.
- Lobby component — unchanged.
- Other pages — unchanged.
- Mobile/responsive layout — intentionally not addressed.
