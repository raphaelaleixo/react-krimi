# Home Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the home page to match the app's murder-investigation aesthetic, reduce information overload, and adopt `HostDeviceWarningModal` from `react-gameroom`.

**Architecture:** Two new shared components under `src/components/paper/` (`PaperSurface`, `PaperButton`) provide "hints of murder-board" styling without restyling the theme. `Home.tsx` is rewritten around a single centered column with a primary CTA + secondary row + credits footer. `Join.tsx` adopts the same components for flow continuity. A new `/how-to-play` placeholder route replaces today's external Medium link.

**Tech Stack:** React 19, TypeScript, MUI 9 (kept), `react-gameroom` (bumping from `^0.8.0` to `^0.9.1` for `isLikelyMobileHost` / `HostDeviceWarningModal` exports), `react-router-dom` 7.

**Spec:** `docs/superpowers/specs/2026-04-19-home-page-redesign-design.md`

**Testing note:** The project has no test runner (`CLAUDE.md`). "Verify" steps are `npm run build` (which runs `tsc -b`), `npm run lint`, and visual checks in `npm run dev`. Each task includes an explicit visual verification where applicable.

---

## File Structure

### New files

- `src/components/paper/PaperSurface.tsx` — full-viewport paper-textured background wrapper.
- `src/components/paper/PaperButton.tsx` — MUI `Button` wrapper with a `primary` | `secondary` | `text` variant matching the typewriter aesthetic.
- `src/pages/HowToPlay.tsx` — placeholder page for the new route.

### Modified files

- `src/pages/Home.tsx` — full rewrite.
- `src/pages/Join.tsx` — swap `Button` for `PaperButton`, wrap in `PaperSurface`.
- `src/App.tsx` — register `/how-to-play` route.
- `src/i18n/translations.ts` — add new keys, remove unused keys.
- `package.json` / `package-lock.json` — bump `react-gameroom` to `^0.9.1`, remove `react-typed`.

### Not touched

- `src/theme/theme.ts`, `src/components/board/*`, `src/contexts/GameContext.tsx`, any in-game screen, the `JoinGame` library component.

---

## Task 1: Bump `react-gameroom` to 0.9.1

The `isLikelyMobileHost` / `HostDeviceWarningModal` exports only exist in 0.9.x. `react-typed` is also unused after the redesign but we uninstall it in Task 6 when its import is simultaneously removed, so each commit leaves the build green.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the new `react-gameroom` version**

Run:

```bash
npm install react-gameroom@^0.9.1
```

Expected: `react-gameroom` updates from `^0.8.0` to `^0.9.1` in `package.json`, `package-lock.json` updates accordingly.

- [ ] **Step 2: Verify existing call sites still compile**

`Home.tsx`, `Join.tsx`, `Room.tsx`, `Player.tsx`, and `GameContext.tsx` all import from `react-gameroom`. Run the full build to surface any 0.8 → 0.9 breaking changes.

Run:

```bash
npm run lint && npm run build
```

Expected: no errors. If errors appear, they indicate a real 0.8 → 0.9 breaking change (e.g., a renamed export or changed prop signature in `JoinGame`, `PlayerScreen`, `useRoomState`, `createInitialRoom`, `deserializeRoom`, etc.). Fix them at the existing call sites before committing — do not commit a broken build.

- [ ] **Step 3: Commit**

Run:

```bash
git add package.json package-lock.json
git commit -m "chore: bump react-gameroom to 0.9.1"
```

---

## Task 2: Create `PaperSurface` component

A full-viewport background wrapper with a warm off-white base, subtle grain (inline SVG noise), and a faint vignette. Uses `minHeight: 100dvh` to avoid the iOS Safari URL-bar clipping.

**Files:**
- Create: `src/components/paper/PaperSurface.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/paper/PaperSurface.tsx`:

```tsx
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.08'/></svg>\")";

export default function PaperSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        bgcolor: '#f5efe3',
        color: 'text.primary',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: NOISE_DATA_URI,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
        },
        '& > *': { position: 'relative', zIndex: 1 },
      }}
    >
      {children}
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: no errors related to `PaperSurface.tsx`. The pre-existing `ReactTyped` error in `Home.tsx` is still present; ignore it.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/paper/PaperSurface.tsx
git commit -m "feat: add PaperSurface component"
```

---

## Task 3: Create `PaperButton` component

Wraps MUI's `Button` with three visual variants. Keeps all MUI props, accessibility, ripple, and form integration. Maps our `variant` prop to MUI's internally.

**Files:**
- Create: `src/components/paper/PaperButton.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/paper/PaperButton.tsx`:

```tsx
import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

export type PaperButtonVariant = 'primary' | 'secondary' | 'text';

export type PaperButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: PaperButtonVariant;
};

const INK = '#094067';
const INK_SOFT = 'rgba(9, 64, 103, 0.15)';

const PaperButton = forwardRef<HTMLButtonElement, PaperButtonProps>(
  function PaperButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant =
      variant === 'primary'
        ? 'contained'
        : variant === 'secondary'
        ? 'outlined'
        : 'text';

    const variantSx =
      variant === 'primary'
        ? {
            bgcolor: INK,
            color: '#f5efe3',
            borderRadius: 0,
            boxShadow: `2px 3px 0 ${INK_SOFT}`,
            transform: 'rotate(-0.5deg)',
            '&:hover': {
              bgcolor: INK,
              boxShadow: `3px 4px 0 ${INK_SOFT}`,
              transform: 'rotate(-0.5deg) translateY(-1px)',
            },
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
              '&:hover': { transform: 'none' },
            },
          }
        : variant === 'secondary'
        ? {
            color: INK,
            borderColor: INK,
            borderWidth: 2,
            borderRadius: 0,
            bgcolor: 'transparent',
            boxShadow: `1px 2px 0 ${INK_SOFT}`,
            '&:hover': { borderColor: INK, borderWidth: 2, bgcolor: 'rgba(9, 64, 103, 0.04)' },
          }
        : {
            color: INK,
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          };

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disableElevation
        sx={{
          fontFamily: '"kingthings_trypewriter_2Rg", "IBM Plex Mono", monospace',
          fontWeight: 400,
          letterSpacing: 0,
          px: variant === 'text' ? 1 : 3,
          py: variant === 'text' ? 0.5 : 1.25,
          ...variantSx,
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export default PaperButton;
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: no errors related to `PaperButton.tsx`. The pre-existing `ReactTyped` error in `Home.tsx` is still present; ignore it.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/paper/PaperButton.tsx
git commit -m "feat: add PaperButton component"
```

---

## Task 4: Create `HowToPlay` placeholder page and register its route

Placeholder only — actual content is deferred. The route must exist so Home's "How to play" button lands somewhere useful.

**Files:**
- Create: `src/pages/HowToPlay.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the placeholder page**

Write this exact file at `src/pages/HowToPlay.tsx`:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PaperSurface from '../components/paper/PaperSurface';
import PaperButton from '../components/paper/PaperButton';
import { useI18n } from '../hooks/useI18n';

export default function HowToPlay() {
  const { t } = useI18n();

  return (
    <PaperSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, py: 6 }}>
        <Typography variant="h2" component="h1">{t('How to play')}</Typography>
        <Typography variant="body1">{t('Content coming soon.')}</Typography>
        <Box>
          <PaperButton variant="secondary" component={RouterLink} to="/">
            {t('Back')}
          </PaperButton>
        </Box>
      </Container>
    </PaperSurface>
  );
}
```

- [ ] **Step 2: Register the route in `App.tsx`**

Apply this edit to `src/App.tsx`:

Find:

```tsx
import MockBoard from './pages/MockBoard';
```

Replace with:

```tsx
import MockBoard from './pages/MockBoard';
import HowToPlay from './pages/HowToPlay';
```

Find:

```tsx
              <Route path="/mock" element={<MockBoard />} />
```

Replace with:

```tsx
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/mock" element={<MockBoard />} />
```

- [ ] **Step 3: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: no errors for `HowToPlay.tsx` or `App.tsx`. The `ReactTyped` error in `Home.tsx` is still present; ignore.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/pages/HowToPlay.tsx src/App.tsx
git commit -m "feat: add How to play placeholder page and route"
```

---

## Task 5: Update translations

Add new keys used in the rewrite, remove keys that no new code references.

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Edit the translations file**

Apply this edit to `src/i18n/translations.ts`. Find:

```ts
  // Home
  'A game of': 'Um jogo de',
  'deduction': 'investigações',
  'deception': 'intrigas',
  'In the game, players take on the roles of investigators attempting to solve a murder case – but there\'s a twist. The killer is one of the investigators! Find out who among you can cut through deception to find the truth and who is capable of getting away with murder!':
    'Neste jogo, os jogadores terão o papel de investigadores tentando resolver um caso de assassinato - mas existe um porém. O assassino é um dos investigadores! Descubra quem de vocês pode se livrar das intrigas e achar a verdade e quem é capaz de se safar desta acusação!',
  'About this project': 'Sobre este projeto',
  'How to play': 'Como jogar',
  'Join game': 'Entrar em um jogo',
  'Create new game': 'Criar novo jogo',
  'Versão em português': 'English version',
  'A web-version of Tobey Ho\'s': 'Uma versão web do jogo de Tobey Ho',
```

Replace with:

```ts
  // Home
  'A game of deception & deduction': 'Um jogo de intrigas e investigação',
  'A web-version of Tobey Ho\'s': 'Uma versão web do jogo de Tobey Ho',
  'Create new game': 'Criar novo jogo',
  'Join game': 'Entrar em um jogo',
  'How to play': 'Como jogar',
  'Versão em português': 'English version',
  'Made by': 'Feito por',
  'Licensed under': 'Licenciado sob',
  'Heads up': 'Atenção',
  'You\'re about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.':
    'Você vai apresentar o jogo no que parece ser um celular. A tela do apresentador funciona melhor em uma tela maior — um laptop ou tablet.',
  'Host anyway': 'Apresentar mesmo assim',
  'Cancel': 'Cancelar',
  'Content coming soon.': 'Em breve.',
```

- [ ] **Step 2: Verify no other file references the removed keys**

Run:

```bash
grep -rE "'deception'|'deduction'|'A game of'|'About this project'|attempting to solve a murder case" src
```

Expected: only matches inside `src/pages/Home.tsx` (which we haven't rewritten yet — that's Task 6). If matches appear in any other file, stop and report. The spec's assumption is that these keys are Home-only.

- [ ] **Step 3: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: no new errors. The `ReactTyped` error in `Home.tsx` is still present; ignore.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/i18n/translations.ts
git commit -m "feat: update home page translations for redesign"
```

---

## Task 6: Rewrite `Home.tsx`

Full rewrite per the spec: single centered column, `PaperSurface`, `PaperButton`, host-device warning modal, static headline (no typed animation), credits footer with language toggle.

**Files:**
- Modify: `src/pages/Home.tsx` (full rewrite)

- [ ] **Step 1: Uninstall `react-typed`**

The typed animation is being removed in this task. Uninstall here so the dependency removal ships in the same commit as the code change that stops using it.

Run:

```bash
npm uninstall react-typed
```

Expected: `react-typed` is removed from `package.json` `dependencies` and from `package-lock.json`. The build is temporarily broken (until the next step replaces the file) — that's fine; we commit both changes together in this task.

- [ ] **Step 2: Replace the file contents**

Overwrite `src/pages/Home.tsx` with this exact content:

```tsx
import { useCallback, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import PaperSurface from '../components/paper/PaperSurface';
import PaperButton from '../components/paper/PaperButton';
import logo from '../assets/logo.svg';
import ludoratory from '../assets/ludoratory.svg';

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
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
            py: 6,
          }}
        >
          <Box component="img" src={logo} sx={{ width: 136, mx: 'auto' }} alt="Krimi" />
          <Typography variant="h2" component="h1">
            {t('A game of deception & deduction')}
          </Typography>
          <Typography variant="subtitle1">
            {t("A web-version of Tobey Ho's")}{' '}
            <strong>Deception: Murder in Hong Kong</strong>.
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

        <Box
          component="footer"
          sx={{
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderTop: '1px dashed',
            borderColor: 'text.disabled',
            flexWrap: 'wrap',
          }}
        >
          <Box component="img" src={ludoratory} sx={{ width: 48 }} alt="Ludoratory" />
          <Box sx={{ flex: 1, fontSize: '0.85em', minWidth: 200 }}>
            <Typography variant="body2">
              {t('Made by')}{' '}
              <Link href="https://aleixo.me" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary' }}>
                Raphael Aleixo / Ludoratory
              </Link>
              .
            </Typography>
            <Typography variant="body2">
              {t('Licensed under')}{' '}
              <Link
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                CC BY-NC-SA 4.0
              </Link>
              .
            </Typography>
          </Box>
          <PaperButton variant="text" onClick={toggleLocale}>
            {t('Versão em português')}
          </PaperButton>
        </Box>
      </Container>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => {
          setHostWarningOpen(false);
          void createAndGo();
        }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: t('Heads up'),
          body: t(
            "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          ),
          confirmLabel: t('Host anyway'),
          cancelLabel: t('Cancel'),
        }}
      />
    </PaperSurface>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: all errors gone. The `ReactTyped` import is no longer in the file, and `react-typed` is no longer a dependency.

- [ ] **Step 4: Visual verification**

Start the dev server:

```bash
npm run dev
```

Open the URL Vite prints. Visually verify:

1. Home renders on the paper-textured background; no plain grey theme default.
2. Logo is centered above the headline.
3. Headline reads "A game of deception & deduction" in the typewriter font; no typed animation.
4. Subtitle shows "A web-version of Tobey Ho's **Deception: Murder in Hong Kong**."
5. A primary "Create new game" button is centered below, filled in dark ink, slightly rotated.
6. Below it, "Join game" and "How to play" sit side-by-side as outlined buttons.
7. Footer shows the Ludoratory logo, "Made by" + "Licensed under" lines, and a text-style language toggle on the right.
8. Click the language toggle: all text flips to Portuguese; the toggle label becomes "English version".
9. Click "Create new game" on desktop: room is created, URL navigates to `/room/<id>` (Lobby view).
10. Emulate a phone in devtools (Device Toolbar, iPhone UA), reload, click "Create new game": the `HostDeviceWarningModal` appears. Clicking Cancel dismisses it. Clicking confirm creates the room and navigates.
11. On narrow viewport, the secondary row wraps cleanly; buttons remain readable.

Stop the dev server when done.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/pages/Home.tsx package.json package-lock.json
git commit -m "feat: redesign home page with paper aesthetic and host device guard"
```

---

## Task 7: Update `Join.tsx` to use `PaperSurface` and `PaperButton`

Wrap both the prefilled-room and unprefilled branches in `PaperSurface`. Replace the four MUI `Button` call sites with `PaperButton`. Leave `TextField`, `Alert`, and the `JoinGame` library component alone.

**Files:**
- Modify: `src/pages/Join.tsx`

- [ ] **Step 1: Apply the edits**

In `src/pages/Join.tsx`:

Find:

```tsx
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { JoinGame } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
```

Replace with:

```tsx
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { JoinGame } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import PaperSurface from '../components/paper/PaperSurface';
import PaperButton from '../components/paper/PaperButton';
```

Find (the prefilled branch's return):

```tsx
  if (prefilledRoom) {
    return (
      <Container sx={{ height: '100vh' }}>
        <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleJoin(prefilledRoom); }}>
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                label={t('Game code')}
                value={prefilledRoom}
                fullWidth
                variant="filled"
                sx={{ mb: 2 }}
                disabled
              />
              <TextField
                label={t('Nickname')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                fullWidth
                variant="filled"
                sx={{ mb: 3 }}
                required
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  sx={{ bgcolor: 'grey.100', color: 'text.primary', '&:hover': { bgcolor: 'grey.200' } }}
                  size="large"
                >
                  {t('Back')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  size="large"
                  disabled={!nickname.trim()}
                >
                  {t('Enter')}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }
```

Replace with:

```tsx
  if (prefilledRoom) {
    return (
      <PaperSurface>
        <Container sx={{ minHeight: '100dvh' }}>
          <Grid container sx={{ minHeight: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleJoin(prefilledRoom); }}>
                {error && (
                  <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  label={t('Game code')}
                  value={prefilledRoom}
                  fullWidth
                  variant="filled"
                  sx={{ mb: 2 }}
                  disabled
                />
                <TextField
                  label={t('Nickname')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  fullWidth
                  variant="filled"
                  sx={{ mb: 3 }}
                  required
                  autoFocus
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <PaperButton variant="secondary" component={RouterLink} to="/" size="large">
                    {t('Back')}
                  </PaperButton>
                  <PaperButton
                    variant="primary"
                    type="submit"
                    size="large"
                    disabled={!nickname.trim()}
                  >
                    {t('Enter')}
                  </PaperButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </PaperSurface>
    );
  }
```

Find (the non-prefilled branch's return):

```tsx
  return (
    <Container sx={{ height: '100vh' }}>
      <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label={t('Nickname')}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            fullWidth
            variant="filled"
            sx={{ mb: 3 }}
            required
          />
          <JoinGame
            onJoin={handleJoin}
            className="krimi-join-game"
            labels={{
              label: t('Game code'),
              placeholder: t('Game code'),
              submit: t('Enter'),
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              sx={{ bgcolor: 'grey.100', color: 'text.primary', '&:hover': { bgcolor: 'grey.200' } }}
              size="large"
            >
              {t('Back')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
```

Replace with:

```tsx
  return (
    <PaperSurface>
      <Container sx={{ minHeight: '100dvh' }}>
        <Grid container sx={{ minHeight: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Nickname')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              variant="filled"
              sx={{ mb: 3 }}
              required
            />
            <JoinGame
              onJoin={handleJoin}
              className="krimi-join-game"
              labels={{
                label: t('Game code'),
                placeholder: t('Game code'),
                submit: t('Enter'),
              }}
            />
            <Box sx={{ mt: 2 }}>
              <PaperButton variant="secondary" component={RouterLink} to="/" size="large">
                {t('Back')}
              </PaperButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PaperSurface>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: no errors.

- [ ] **Step 3: Visual verification**

Start the dev server:

```bash
npm run dev
```

Test both branches:

1. From Home, click "Join game" → lands on `/join`. Page uses the paper background; nickname field renders; `JoinGame` (library component) renders below. Back button is a secondary PaperButton.
2. In a second tab, go directly to `/join?room=ABCDEF` (use any six-char code). This triggers the prefilled branch. Page uses the paper background; disabled room code field + nickname + Back (secondary) + Enter (primary) PaperButtons render.
3. End-to-end join: create a room in one tab, copy the code, join from another tab — the join flow still works and the joining navigates to `/room/<id>/player/<playerId>`.

Stop the dev server when done.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/pages/Join.tsx
git commit -m "refactor: adopt PaperSurface and PaperButton in Join page"
```

---

## Task 8: Final verification pass

Full regression check before declaring the work complete.

**Files:** None.

- [ ] **Step 1: Clean build and lint**

Run:

```bash
npm run lint && npm run build
```

Expected: both succeed with no errors and no warnings added by this work. Pre-existing warnings from untouched files are fine.

- [ ] **Step 2: Full manual walkthrough**

Run:

```bash
npm run dev
```

Walk through:

1. **Home → Create game (desktop)** — paper background renders; primary button creates room and navigates to `/room/<id>` without showing the modal.
2. **Home → Create game (mobile emulation)** — `HostDeviceWarningModal` opens. Cancel dismisses. Confirm creates the room.
3. **Home → Join game** — lands on `/join` with paper background and PaperButton Back.
4. **Home → How to play** — lands on `/how-to-play` placeholder with Back button; Back returns Home.
5. **Language toggle** — flipping the toggle in the Home footer translates the headline, subtitle, primary button, secondary row, footer credits, and modal labels when re-opened.
6. **Prefilled join** — visiting `/join?room=ABCDEF` shows the prefilled branch with paper background.
7. **Reduced motion** — in devtools, enable "Emulate CSS prefers-reduced-motion: reduce" and reload Home. The primary button has no rotation or hover translate.
8. **Narrow viewport** — shrink the window to ~360px width. Home's secondary row wraps; no overflow or horizontal scroll.

Stop the dev server when done.

- [ ] **Step 3: Verify git log**

Run:

```bash
git log --oneline -8
```

Expected: seven new commits in this order (most recent first):

```
refactor: adopt PaperSurface and PaperButton in Join page
feat: redesign home page with paper aesthetic and host device guard
feat: update home page translations for redesign
feat: add How to play placeholder page and route
feat: add PaperButton component
feat: add PaperSurface component
chore: bump react-gameroom to 0.9.1
```

No outstanding uncommitted changes other than any plan/spec updates you intentionally left.

- [ ] **Step 4: Report completion**

Post a summary noting:
- Which spec section was implemented
- Verification results (lint + build clean, all manual checks passed, any deviations from the spec and why)
- Any follow-ups surfaced during implementation (e.g., a visual quirk that should be tracked separately)
