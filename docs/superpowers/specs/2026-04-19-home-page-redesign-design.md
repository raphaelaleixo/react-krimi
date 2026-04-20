# Home Page Redesign — Design Spec

**Date:** 2026-04-19
**Status:** Draft, awaiting user review
**Scope:** `src/pages/Home.tsx`, `src/pages/Join.tsx` (button swap only), new shared components, new `/how-to-play` placeholder route, dependency bump.

## Motivation

The home page is a conventional MUI two-column landing (logo, typed "deception / deduction" headline, long descriptive paragraph, grey Join + red Create, external links, language toggle, Ludoratory logo). The rest of the app has moved to a tactile murder-investigation aesthetic (cork board, polaroids, pushpins, coffee stains, red string). The entry point now feels disconnected from the experience it introduces.

Redesign drivers:

- **Aesthetic alignment** — the home page should set the tone of the game, not fight it.
- **Information architecture** — today's page carries too much (blurb, paragraph, five links, toggle); the primary job is "start a game" and "join a game," and everything else competes with that.

Reference: a parallel project (`react-unmatched/src/pages/HomePage.tsx`) already solved the same two problems with a stripped-down hero + action hierarchy + credits footer.

## Goals

- Align the home page visually with the rest of the app without committing to a full cork-board set piece ("hints of murder-board," not a diorama).
- Reduce content to logo + short subtitle + one primary action + two secondary actions + credits.
- Make the same visual language trivial to extend to `Join.tsx` and later pages.
- Adopt `HostDeviceWarningModal` from `react-gameroom` to guard the hosting flow on mobile devices.

## Non-goals

- Rewriting the theme or migrating the app off MUI.
- Restyling Board, Detective, ForensicAnalysis, Lobby, or any in-game screen.
- Writing the actual How-to-play content (placeholder only).
- Analytics, routing guards, or auth changes.

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Cut the long game-description paragraph entirely | Competes with the actions; a How-to-play page can host longer copy later. |
| 2 | Primary CTA = "Create new game"; secondary row = "Join game" + "How to play" | Follows the unmatched pattern; clearer hierarchy than today's Join-first layout. |
| 3 | "How to play" becomes an in-app `/how-to-play` route | Replaces the external Medium link; content deferred. |
| 4 | Language toggle stays on Home only, in the footer | No `AppHeader` extraction needed for now. |
| 5 | Adopt `HostDeviceWarningModal` + `isLikelyMobileHost` from `react-gameroom` | Prevents the common "host accidentally on phone" failure mode. |
| 6 | Keep the current subtitle copy: "A web-version of Tobey Ho's Deception: Murder in Hong Kong." | User preference; reads clearly. |
| 7 | Drop the typed "deception / deduction" animation | Busy for a "hints of murder-board" aesthetic; a static "A game of deception & deduction" headline replaces it. |
| 8 | Credits: "Made by Raphael Aleixo / Ludoratory" + "Licensed under CC BY-NC-SA 4.0" | Matches the unmatched footer pattern. |
| 9 | Drop the "About this project" GitHub link | The license line can link to the repo later if needed. |
| 10 | Logo centered above the headline | Krimi's logo is pictorial; centered-above reads better than logo-as-h1. |
| 11 | Styling approach: hybrid — keep MUI's theme/typography, introduce two new shared components for the home-page aesthetic | Avoids touching theme (broad blast radius) but avoids duplicating inline `sx` across Home, Join, and future pages. |
| 12 | First-rollout scope for the new components: `Home.tsx` and `Join.tsx`'s buttons / surface | Home and Join are adjacent in the user flow; a visual split between them would look disjointed. Other pages are explicitly deferred. |
| 13 | Bump `react-gameroom` from `^0.8.0` to `^0.9.1` (current latest) before integrating the new exports | Required for `isLikelyMobileHost` / `HostDeviceWarningModal` to be a known-good contract. Also keeps the dependency current. |

## Page structure

Single centered column inside a full-viewport `PaperSurface`.

```
┌─ PaperSurface (aged-paper background, subtle grain, min-height 100dvh) ─┐
│                                                                         │
│                           [ logo ] (centered)                           │
│                                                                         │
│                    A game of deception & deduction                      │
│                         (h2, typewriter font)                           │
│                                                                         │
│     "A web-version of Tobey Ho's Deception: Murder in Hong Kong."       │
│                          (subtitle)                                     │
│                                                                         │
│                      ┌──────────────────────┐                           │
│                      │    Create new game   │   ← PaperButton primary   │
│                      └──────────────────────┘                           │
│                                                                         │
│         [ Join game ]    [ How to play ]    ← PaperButton secondary     │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│   [Ludoratory]  Made by Raphael Aleixo / Ludoratory.                    │
│                 Licensed under CC BY-NC-SA 4.0.                         │
│                 [ Versão em português ]    ← PaperButton text           │
└─────────────────────────────────────────────────────────────────────────┘
```

- `Container maxWidth="sm"` caps the column at ~600px.
- Main region is `flex: 1` and vertically centers; footer sits flush to the bottom with a dashed rule separator.
- On narrow viewports the secondary row wraps; buttons stack full-width.

## New components

Both live under `src/components/paper/`, grouped as "light-touch murder-board UI primitives" (parallel to `src/components/board/` which holds the full set pieces).

### `PaperSurface`

```tsx
type PaperSurfaceProps = { children: React.ReactNode };
```

- Full-viewport background using `minHeight: 100dvh` (not `100vh`) to avoid the iOS Safari URL-bar clip.
- Base color: warm off-white around `#f5efe3` (slightly warmer than the theme's `background.default`).
- Subtle noise/grain via a CSS `::before` pseudo-element with an inline SVG data URI — no image asset to ship.
- Faint vignette at the edges.
- No props beyond `children` in this iteration.

### `PaperButton`

```tsx
type PaperButtonProps = MuiButtonProps & {
  variant?: 'primary' | 'secondary' | 'text';
};
```

- Wraps MUI's `Button`, keeping accessibility, ripple, disabled states, and form integration.
- Delegates MUI's own `variant` internally: `primary → contained`, `secondary → outlined`, `text → text`.
- Label uses `kingthings_trypewriter_2Rg` (the existing typewriter font).
- `primary`: filled, ink color = theme `primary.main` (`#094067`), faint drop shadow, barely-perceptible rotation (~0.5°) to feel stamped.
- `secondary`: outlined, 1–2px border in the same ink, no rotation, lighter shadow.
- `text`: unboxed, underline on hover (for the language toggle).
- Respects `prefers-reduced-motion` — no transitions when set.
- Accepts all MUI `Button` props (`onClick`, `component`, `to`, `href`, `size`, etc.).

## `Home.tsx` after the rewrite

```tsx
export default function Home() {
  const navigate = useNavigate();
  const { createRoom } = useGame();
  const { t, lang, setLang } = useI18n();
  const [hostWarningOpen, setHostWarningOpen] = useState(false);

  const createAndGo = useCallback(async () => {
    const roomId = await createRoom(lang);
    navigate(`/room/${roomId}`);
  }, [createRoom, lang, navigate]);

  const startCreate = useCallback(() => {
    if (isLikelyMobileHost()) {
      setHostWarningOpen(true);
      return;
    }
    void createAndGo();
  }, [createAndGo]);

  const toggleLocale = useCallback(
    () => setLang(lang === 'pt_br' ? 'en' : 'pt_br'),
    [lang, setLang],
  );

  return (
    <PaperSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: 3 }}>
          <Box component="img" src={logo} sx={{ width: 136, mx: 'auto' }} />
          <Typography variant="h2" component="h1">{t('A game of deception & deduction')}</Typography>
          <Typography variant="subtitle1">
            {t("A web-version of Tobey Ho's")} <strong>Deception: Murder in Hong Kong</strong>.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <PaperButton variant="primary" size="large" onClick={startCreate}>
              {t('Create new game')}
            </PaperButton>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <PaperButton variant="secondary" component={RouterLink} to="/join">
                {t('Join game')}
              </PaperButton>
              <PaperButton variant="secondary" component={RouterLink} to="/how-to-play">
                {t('How to play')}
              </PaperButton>
            </Box>
          </Box>
        </Box>

        <Box component="footer" sx={{ py: 4, display: 'flex', alignItems: 'center', gap: 2, borderTop: '1px dashed', borderColor: 'text.disabled' }}>
          <Box component="img" src={ludoratory} sx={{ width: 48 }} />
          <Box sx={{ flex: 1, fontSize: '0.85em' }}>
            <Typography variant="body2">
              {t('Made by')}{' '}
              <Link href="https://aleixo.me" target="_blank" rel="noopener noreferrer">Raphael Aleixo / Ludoratory</Link>.
            </Typography>
            <Typography variant="body2">
              {t('Licensed under')}{' '}
              <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</Link>.
            </Typography>
          </Box>
          <PaperButton variant="text" onClick={toggleLocale}>
            {t('Versão em português')}
          </PaperButton>
        </Box>
      </Container>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => { setHostWarningOpen(false); void createAndGo(); }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: t('Heads up'),
          body: t("You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet."),
          confirmLabel: t('Host anyway'),
          cancelLabel: t('Cancel'),
        }}
      />
    </PaperSurface>
  );
}
```

### Data flow (Create button)

```
user clicks "Create new game"
  → isLikelyMobileHost()?
      ├─ no  → createRoom(lang) → navigate(/room/:id)
      └─ yes → setHostWarningOpen(true)
                 ├─ onConfirm → createRoom(lang) → navigate(/room/:id)
                 └─ onCancel  → setHostWarningOpen(false)
```

No new Firebase calls, no new `GameContext` surface. `createRoom` is called exactly as today.

## File impact

### New files

- `src/components/paper/PaperSurface.tsx`
- `src/components/paper/PaperButton.tsx`
- `src/pages/HowToPlay.tsx` — placeholder: `<PaperSurface>`, `<h1>How to play</h1>`, back-to-home `<PaperButton variant="secondary" component={RouterLink} to="/">…`.

### Modified files

- `src/pages/Home.tsx` — full rewrite per the block above.
- `src/pages/Join.tsx` — swap MUI `Button` call sites for `PaperButton` (primary on Enter, secondary on Back) and wrap the page in `PaperSurface` for visual continuity. `TextField`, `Alert`, and the `JoinGame` library component are untouched.
- `src/App.tsx` — register `/how-to-play` → `HowToPlay`.
- `src/i18n/translations.ts` — add keys (`A game of deception & deduction`, `Made by`, `Licensed under`, `Heads up`, the host-warning body copy, `Host anyway`, `Cancel`), remove unused keys (`deception`, `deduction`, `A game of`, the long description, `About this project`).
- `package.json` / `package-lock.json` — bump `react-gameroom` from `^0.8.0` to `^0.9.1`.

### Files explicitly not touched

- `src/theme/theme.ts`
- `src/components/board/*`
- `src/contexts/GameContext.tsx`
- `JoinGame` from `react-gameroom`
- Any in-game screen (Board, Detective, Lobby, ForensicAnalysis, Player, Room)

### Assets

- No new assets. `logo.svg` and `ludoratory.svg` stay. The grain texture is inline SVG inside the CSS.

## Dependency bump sequencing

1. Run `npm install react-gameroom@latest` (pulls `0.9.1`).
2. Skim the 0.8 → 0.9 changelog/diff for breaking changes affecting `JoinGame`, `useRoomState`, `PlayerScreen`, and the host-device exports (`isLikelyMobileHost`, `HostDeviceWarningModal`).
3. Verify existing call sites in `Home.tsx`, `Join.tsx`, `Room.tsx`, `Player.tsx`, and `GameContext.tsx` still compile and behave the same; fix any signature changes.
4. Only then add the new `isLikelyMobileHost` / `HostDeviceWarningModal` usage on Home.

## Verification (manual; project has no test runner)

1. `npm run dev` — Home renders with paper background, typewriter headline, primary button visibly primary, secondary row wraps on narrow viewports.
2. **Create flow, desktop** — click Create → room created in Firebase → navigates to `/room/:id`. No modal.
3. **Create flow, mobile** — emulate mobile UA in devtools → click Create → `HostDeviceWarningModal` shows. Confirm proceeds; Cancel dismisses.
4. **Join flow** — Join navigates to `/join`; Join page wears `PaperSurface` + `PaperButton`s; nickname + game code flow works end-to-end.
5. **How to play** — navigates to `/how-to-play`, renders placeholder, back link returns Home.
6. **Language toggle** — clicking in the footer flips `lang`; headline, subtitle, buttons, and footer text re-render translated.
7. **`tsc -b` and `npm run lint`** — clean before commit.
8. **`prefers-reduced-motion`** — PaperButton transitions disabled when set.

## Risks and unknowns (resolved during implementation)

- **`isLikelyMobileHost` export in 0.9.x** — verified by the bump step; if missing, either stay on 0.9.x and inline a simple UA check, or note the regression and re-evaluate.
- **Grain SVG banding** — at full viewport, repeating noise may show seams. Visual check during verification; swap to a tiled pattern if needed.
- **Typewriter font weight on buttons** — theme sets `fontWeight: 'bolder'` on MUI buttons; may render heavy against the typewriter face. PaperButton resets weight if it looks off.
- **Link color in the footer** — MUI's default blue fights the paper palette. `PaperSurface` either scopes a `.MuiLink-root` override or each `<Link>` passes `sx={{ color: 'text.secondary' }}`. Decided during implementation.

## Out of scope (for this spec)

- How-to-play content.
- Restyling any in-game screen.
- Theme-level button variants (`PaperButton` stays a component, not a theme variant).
- Analytics, routing guards, auth.
