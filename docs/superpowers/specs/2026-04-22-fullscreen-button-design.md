# Fullscreen button on the case board

## Goal

Let the host (who is watching the game on a big screen) toggle the browser
into fullscreen from inside the game itself, without leaving the app or
reaching for a keyboard shortcut. The toggle should feel like part of the
murder-board world — a taped paper icon-button in the bottom-right corner —
mirroring the Krimi wordmark in the top-right.

## Scope

**In:** Lobby (`/room/:id` pre-start) and Board (`/room/:id` in-game). A
single mount point in `CaseBoardLayout` covers both, because both screens
render through that layout.

**Out:**
- Player device view (`/room/:id/player/:playerId`). Players use their phones
  and don't need app-level fullscreen.
- Keyboard shortcuts (browser F11 already exists).
- Persisting fullscreen preference across reloads.
- Vendor-prefixed fallbacks for browsers without the standard Fullscreen API.

## Approach

### Fullscreen state: `useFullscreen()` from react-gameroom

`react-gameroom@0.10.0` exports `useFullscreen()`, which returns
`{ isFullscreen, isSupported, toggle }`. It subscribes to `fullscreenchange`
so the `isFullscreen` flag stays in sync when the user exits via **Esc** or
browser chrome, and `isSupported` is `false` during SSR and on iOS Safari.

The app uses this hook directly — no custom Fullscreen API wrapper.

### Presentation: `TapedNoteButton`, not `<FullscreenToggle>`

`react-gameroom` also exports `<FullscreenToggle>`, but it renders a plain
`<button>` styled via `className`. That doesn't match our taped-note visual
language (which has a specific DOM shape: paper + tape child elements inside
a `ButtonBase`). We reuse the existing `TapedNoteButton` with
`variant="icon-button"` instead.

### New component: `src/components/board/FullscreenButton.tsx`

```
- Calls useFullscreen().
- Returns null when !isSupported (matches library default behavior).
- Renders a TapedNoteButton variant="icon-button" with rotation={-2}.
- Icon child:
    - Fullscreen (MUI icon) when !isFullscreen
    - FullscreenExit (MUI icon) when isFullscreen
- onClick={toggle}.
- aria-label is i18n-driven:
    - "Enter fullscreen" when !isFullscreen
    - "Exit fullscreen" when isFullscreen
```

### Placement in `CaseBoardLayout`

Mounted as an absolutely-positioned sibling of the existing Krimi wordmark,
inside the `CorkBoard`:

- `position: absolute`
- `bottom: 24`
- `right: 24`
- `zIndex: 2`

Because this is inside the layout component that both `Lobby.tsx` and
`Board.tsx` render through, the button appears on both screens from a
single mount point. The layout's responsibility for "chrome" (logo,
toggle) stays in one place.

### i18n

Two new keys in `src/i18n/translations.ts`:

- `Enter fullscreen`
- `Exit fullscreen`

English serves as the key (matches the existing convention).

### Dependency bump

`package.json` moves from `react-gameroom ^0.9.1` to `^0.10.0` to pick up
`useFullscreen`. `package-lock.json` updates accordingly. Already installed
locally.

## Architecture notes

The button is stateless from the app's perspective — it has no props and
doesn't read from Firebase or `GameContext`. All state lives in the hook,
which pulls from the browser. This keeps the component isolated and trivial
to reason about: one unit, one purpose.

## Testing

No test runner is configured in this repo, so verification is manual:

1. Run `npm run dev`, open a room on desktop Chrome/Firefox.
2. Verify the button shows bottom-right on the Lobby and remains after the
   game starts (Board).
3. Click it → enters fullscreen, icon swaps to `FullscreenExit`.
4. Click again → exits, icon swaps back.
5. Enter fullscreen, press **Esc** → icon swaps back without a click
   (proves `fullscreenchange` subscription works).
6. Open on iOS Safari (or simulate `document.fullscreenEnabled === false`)
   → button is absent.

## Risks / open questions

- **Masonry positioning.** The masonry grid inside `CaseBoardLayout` is
  `flex: 3` with a measured height. The fullscreen button is absolutely
  positioned relative to the `CorkBoard`, so it shouldn't interfere with
  masonry layout calculations. If the button ever overlaps the bottom of
  a player file at small viewports, we can revisit (out of scope for this
  spec).
