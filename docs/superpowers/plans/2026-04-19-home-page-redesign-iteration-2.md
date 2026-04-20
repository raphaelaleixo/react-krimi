# Home Page Redesign — Iteration 2 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the iteration-1 "light paper" aesthetic (which the user saw and rejected as "liked the structure, not the design") with a full murder-board direction: dark cork-board background with a single pinned case file dossier at center.

**Architecture:** Three new shared components under `src/components/board/` (`BoardSurface`, `CaseFile`, `PinnedNote`) plus one renamed/recolored button (`StampButton`). Pages (`Home`, `Join`, `HowToPlay`) rebuilt on these. Old iteration-1 components (`PaperSurface`, `PaperButton`) deleted after call sites are swapped.

**Tech Stack:** React 19, TypeScript, MUI 9 (still the underlying layer). Existing `src/components/board/` assets (`CoffeeStains`, `Pushpin`) are reused directly.

**User-approved design decisions:**

| # | Decision |
|---|---|
| I1 | Structure from iteration 1 is preserved: hero + CTAs + footer. Only the visual treatment changes. |
| I2 | Background is dark `#0A0A0B` (game-board color) with `CoffeeStains` overlay. No cork texture image. |
| I3 | Central "case file" paper sheet (off-white `#f8f6f0`, faint ruled lines, pushpin at top, slight rotation, drop shadow). |
| I4 | **On the case file:** logo, headline, description, primary "Create new game" button (red-outlined stamp-style). |
| I5 | **Off the case file (below, pinned on the dark board):** two `PinnedNote` cards for `Join game` and `How to play`. |
| I6 | Headline is a single typewriter-uppercase block: `A GAME OF DECEPTION`. |
| I7 | Description replaces both the iteration-1 subtitle and the long-dropped paragraph. One line: `A web-version of Tobey Ho's` followed by `<strong>Deception: Murder in Hong Kong</strong>.` (proper noun stays out of i18n). |
| I8 | Footer stays muted: Ludoratory logo + credits + language toggle, smaller font (~0.75em), light grey on dark. |
| I9 | New components belong under `src/components/board/` alongside `CorkBoard`, `PolaroidCard`, etc. `src/components/paper/` is removed entirely after migration. |
| I10 | `PaperButton` → `StampButton` (red ink, uppercase, 2px border, typewriter, slight rotation). `primary` and `text` variants only. Secondary CTA role taken over by `PinnedNote`. |

**Spec:** This plan is the spec for the iteration. No separate design doc.

**Testing note:** No test runner (see `CLAUDE.md`). Verification is `npm run build` + manual visual walk.

---

## File Structure

### New files

- `src/components/board/BoardSurface.tsx` — full-viewport dark wrapper with `CoffeeStains` overlay.
- `src/components/board/CaseFile.tsx` — rotated paper sheet with pushpin, ruled lines, drop shadow.
- `src/components/board/PinnedNote.tsx` — small pinned paper card, typewriter text, configurable `component` + rotation.
- `src/components/board/StampButton.tsx` — red-outlined "stamp" button for the case file's primary CTA.

### Modified files

- `src/pages/Home.tsx` — full rewrite on the new components.
- `src/pages/Join.tsx` — refresh on new components.
- `src/pages/HowToPlay.tsx` — refresh on new components.
- `src/i18n/translations.ts` — add `A game of deception` key; remove iteration-1's `A game of deception & deduction`.

### Deleted files

- `src/components/paper/PaperSurface.tsx`
- `src/components/paper/PaperButton.tsx`
- `src/components/paper/` directory (removed when empty)

### Not touched

- `src/theme/theme.ts`, `src/components/board/CorkBoard.tsx`, `src/components/board/CoffeeStains.tsx`, `src/components/board/Pushpin.tsx`, `src/components/board/PolaroidCard.tsx`, `src/components/board/ForensicSheet.tsx`, `src/components/board/GuessNote.tsx`, `src/components/board/RedStrings.tsx`, `src/components/Board.tsx`, `src/App.tsx`, `package.json`, any in-game page.

---

## Task 1: Create `BoardSurface` component

Replaces `PaperSurface` structurally — same role (full-viewport wrapper), different palette and overlay.

**Files:**
- Create: `src/components/board/BoardSurface.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/board/BoardSurface.tsx`:

```tsx
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import CoffeeStains from './CoffeeStains';

export default function BoardSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        bgcolor: '#0A0A0B',
        color: '#f5efe3',
        overflow: 'hidden',
      }}
    >
      <CoffeeStains />
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean (no TypeScript errors). Existing pre-existing lint issues are unchanged.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/board/BoardSurface.tsx
git commit -m "feat: add BoardSurface component"
```

---

## Task 2: Create `CaseFile` component

The central pinned paper sheet. Reuses the `Pushpin` component and the ruled-line / paper aesthetic from `ForensicSheet`.

**Files:**
- Create: `src/components/board/CaseFile.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/board/CaseFile.tsx`:

```tsx
import Box from '@mui/material/Box';
import type { ReactNode, CSSProperties } from 'react';
import Pushpin from './Pushpin';

interface CaseFileProps {
  children: ReactNode;
  rotation?: number;
  maxWidth?: number;
  sx?: CSSProperties;
}

export default function CaseFile({
  children,
  rotation = -1.5,
  maxWidth = 480,
}: CaseFileProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth,
        mx: 'auto',
        my: 4,
        transform: `rotate(${rotation}deg)`,
        '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
      }}
    >
      <Pushpin color="#9E1B1B" />
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          color: '#1C1B1B',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/board/CaseFile.tsx
git commit -m "feat: add CaseFile component"
```

---

## Task 3: Create `PinnedNote` component

A small pinned paper card used for secondary actions on the dark board. Polymorphic `component` prop so it can render as a `RouterLink` or button.

**Files:**
- Create: `src/components/board/PinnedNote.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/board/PinnedNote.tsx`:

```tsx
import Box from '@mui/material/Box';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef } from 'react';
import Pushpin from './Pushpin';

export type PinnedNoteProps = ButtonBaseProps & {
  rotation?: number;
  pinColor?: string;
  to?: string;
  href?: string;
};

const PinnedNote = forwardRef<HTMLButtonElement, PinnedNoteProps>(
  function PinnedNote(
    { rotation = 0, pinColor = '#3A7085', children, sx, ...rest },
    ref,
  ) {
    return (
      <ButtonBase
        ref={ref}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 150,
          minHeight: 60,
          px: 2,
          py: 1.5,
          bgcolor: '#f8f6f0',
          color: '#1C1B1B',
          fontFamily: '"kingthings_trypewriter_2Rg", serif',
          fontSize: '0.95rem',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: `rotate(${rotation}deg) translateY(-2px)`,
            boxShadow: '0 6px 14px rgba(0,0,0,0.55)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': { transform: `rotate(${rotation}deg)` },
          },
          ...sx,
        }}
        {...rest}
      >
        <Pushpin color={pinColor} />
        {children}
      </ButtonBase>
    );
  },
);

export default PinnedNote;
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/board/PinnedNote.tsx
git commit -m "feat: add PinnedNote component"
```

---

## Task 4: Create `StampButton` component

The primary CTA that lives inside the case file. Red ink, uppercase typewriter, 2px boxed border, slight rotation. Takes the role `PaperButton[variant=primary]` had in iteration 1 — but styled to read as a rubber stamp on paper.

**Files:**
- Create: `src/components/board/StampButton.tsx`

- [ ] **Step 1: Create the component**

Write this exact file at `src/components/board/StampButton.tsx`:

```tsx
import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

export type StampButtonVariant = 'primary' | 'text';

export type StampButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: StampButtonVariant;
  to?: string;
  href?: string;
};

const STAMP_RED = '#9E1B1B';

const StampButton = forwardRef<HTMLButtonElement, StampButtonProps>(
  function StampButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant = variant === 'primary' ? 'outlined' : 'text';

    const variantSx =
      variant === 'primary'
        ? {
            color: STAMP_RED,
            borderColor: STAMP_RED,
            borderWidth: 2,
            borderRadius: 0,
            bgcolor: 'transparent',
            transform: 'rotate(-1.5deg)',
            '&:hover': {
              borderColor: STAMP_RED,
              borderWidth: 2,
              bgcolor: 'rgba(158, 27, 27, 0.06)',
              transform: 'rotate(-1.5deg) translateY(-1px)',
            },
            '&.Mui-disabled': { color: STAMP_RED, opacity: 0.4, borderColor: STAMP_RED },
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
              '&:hover': { transform: 'none' },
            },
          }
        : {
            color: STAMP_RED,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          };

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disableElevation
        sx={{
          fontFamily: '"kingthings_trypewriter_2Rg", "IBM Plex Mono", monospace',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          px: variant === 'text' ? 1 : 4,
          py: variant === 'text' ? 0.5 : 1.5,
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

export default StampButton;
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/board/StampButton.tsx
git commit -m "feat: add StampButton component"
```

---

## Task 5: Update translations

Add the new `A game of deception` key; remove the iteration-1 combined headline.

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Edit the translations file**

In `src/i18n/translations.ts`, find:

```ts
  // Home
  'A game of deception & deduction': 'Um jogo de intrigas e investigação',
```

Replace with:

```ts
  // Home
  'A game of deception': 'Um jogo de intrigas',
```

Leave every other key in the file unchanged (`'A web-version of Tobey Ho\'s'`, `'Create new game'`, all other Home keys, and all Lobby/Player/Detective/Board/MurdererChoice/ForensicAnalysis/Join sections).

- [ ] **Step 2: Verify no remaining references to the removed key**

Run:

```bash
grep -RE "A game of deception & deduction" src
```

Expected: no output. If any file still references the removed key, stop and report.

- [ ] **Step 3: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean (note: `Home.tsx` still imports the old key — we swap it in Task 6 right after).

Actually — since Home.tsx will still call `t('A game of deception & deduction')` until Task 6, the build will not fail, but runtime will show the English fallback key. That's fine for the intermediate state.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/i18n/translations.ts
git commit -m "feat: update translation key for iteration 2 headline"
```

---

## Task 6: Rewrite `Home.tsx` with board + case file

**Files:**
- Modify: `src/pages/Home.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

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
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';
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
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
          <CaseFile>
            <Box sx={{ textAlign: 'center' }}>
              <Box component="img" src={logo} sx={{ width: 96, mx: 'auto', mb: 2, display: 'block' }} alt="Krimi" />
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: { xs: '1.6rem', sm: '2rem' },
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#1C1B1B',
                  mb: 1,
                }}
              >
                {t('A game of deception')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '1rem',
                  color: '#1C1B1B',
                  mb: 3,
                }}
              >
                {t("A web-version of Tobey Ho's")}{' '}
                <strong>Deception: Murder in Hong Kong</strong>.
              </Typography>
              <StampButton variant="primary" onClick={startCreate}>
                {t('Create new game')}
              </StampButton>
            </Box>
          </CaseFile>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
            <PinnedNote rotation={-3} pinColor="#3A7085" component={RouterLink} to="/join">
              {t('Join game')}
            </PinnedNote>
            <PinnedNote rotation={2.5} pinColor="#9E1B1B" component={RouterLink} to="/how-to-play">
              {t('How to play')}
            </PinnedNote>
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'rgba(245, 239, 227, 0.55)',
            fontSize: '0.75em',
            flexWrap: 'wrap',
          }}
        >
          <Box component="img" src={ludoratory} sx={{ width: 32, opacity: 0.6 }} alt="Ludoratory" />
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
              {t('Made by')}{' '}
              <Link href="https://aleixo.me" target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecorationColor: 'inherit' }}>
                Raphael Aleixo / Ludoratory
              </Link>
              .
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
              {t('Licensed under')}{' '}
              <Link
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'inherit', textDecorationColor: 'inherit' }}
              >
                CC BY-NC-SA 4.0
              </Link>
              .
            </Typography>
          </Box>
          <StampButton variant="text" onClick={toggleLocale} sx={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
            {t('Versão em português')}
          </StampButton>
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
    </BoardSurface>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/pages/Home.tsx
git commit -m "feat: rebuild home page on board + case file aesthetic"
```

---

## Task 7: Update `Join.tsx`

Wrap Join in `BoardSurface`. Put the nickname form inside a `CaseFile` (both branches). Enter button becomes `StampButton` primary. Back button becomes a `PinnedNote`.

**Files:**
- Modify: `src/pages/Join.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/pages/Join.tsx` with this exact content:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { JoinGame } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';

export default function Join() {
  const navigate = useNavigate();
  const { id: routeRoomId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { joinRoom } = useGame();
  const { t } = useI18n();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [prefilledRoom, setPrefilledRoom] = useState('');

  useEffect(() => {
    const room = routeRoomId || searchParams.get('room');
    if (room) setPrefilledRoom(room);
  }, [routeRoomId, searchParams]);

  const handleJoin = useCallback(async (roomCode: string) => {
    if (!nickname.trim()) {
      setError(t('Enter your nickname:'));
      return;
    }
    setError('');

    try {
      const playerId = await joinRoom(roomCode.trim(), nickname.trim());
      navigate(`/room/${roomCode.trim()}/player/${playerId}`);
    } catch (err: any) {
      setError(err.message || 'Error joining game');
    }
  }, [joinRoom, nickname, navigate, t]);

  if (prefilledRoom) {
    return (
      <BoardSurface>
        <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
          <CaseFile>
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
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                  {t('Enter')}
                </StampButton>
              </Box>
            </Box>
          </CaseFile>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PinnedNote rotation={-2} pinColor="#3A7085" component={RouterLink} to="/">
              {t('Back')}
            </PinnedNote>
          </Box>
        </Container>
      </BoardSurface>
    );
  }

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
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
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} pinColor="#3A7085" component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/pages/Join.tsx
git commit -m "feat: rebuild Join page on board + case file aesthetic"
```

---

## Task 8: Update `HowToPlay.tsx`

**Files:**
- Modify: `src/pages/HowToPlay.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/pages/HowToPlay.tsx` with this exact content:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import { useI18n } from '../hooks/useI18n';

export default function HowToPlay() {
  const { t } = useI18n();

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"kingthings_trypewriter_2Rg", serif',
              fontSize: '2rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 2,
              textAlign: 'center',
            }}
          >
            {t('How to play')}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"kingthings_trypewriter_2Rg", serif',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Content coming soon.')}
          </Typography>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} pinColor="#3A7085" component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/pages/HowToPlay.tsx
git commit -m "feat: rebuild How to play on board + case file aesthetic"
```

---

## Task 9: Delete obsolete `paper` components

After Tasks 6-8 no file imports from `src/components/paper/`. Safe to delete.

**Files:**
- Delete: `src/components/paper/PaperSurface.tsx`
- Delete: `src/components/paper/PaperButton.tsx`
- Delete: `src/components/paper/` directory

- [ ] **Step 1: Verify no remaining imports**

Run:

```bash
grep -RE "components/paper" src
```

Expected: no output. If any file still imports from `paper/`, stop and fix that file first.

- [ ] **Step 2: Delete the files and directory**

Run:

```bash
git rm src/components/paper/PaperSurface.tsx src/components/paper/PaperButton.tsx
rmdir src/components/paper 2>/dev/null || true
```

Expected: both files removed from git index and working tree. The directory is removed if it's now empty.

- [ ] **Step 3: Typecheck and lint**

Run:

```bash
npm run build
```

Expected: clean.

- [ ] **Step 4: Commit**

Run:

```bash
git add -A src/components/paper 2>/dev/null; git commit -m "chore: remove obsolete paper components"
```

(The `git add -A` picks up the directory removal if present.)

---

## Task 10: Final verification

**Files:** None.

- [ ] **Step 1: Clean build**

Run:

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 2: Visual walkthrough**

Run:

```bash
npm run dev
```

Verify:

1. **Home** — dark background with coffee stains; central case file with logo, uppercase typewriter headline (`A GAME OF DECEPTION`), description, red-outlined primary stamp button. Below, two pinned notes (`Join game`, `How to play`) on the dark surface with different rotations and different-color pushpins. Muted footer.
2. **Create flow (desktop)** — clicking Create creates the room and navigates. No modal.
3. **Create flow (mobile UA)** — modal appears; Cancel and Confirm both work.
4. **Join flow** — click "Join game" pinned note → `/join` renders BoardSurface + CaseFile + a StampButton Enter + pinned Back. End-to-end nickname + code join still works.
5. **How to play** — renders placeholder case file with Back pinned note.
6. **Language toggle** — small text StampButton in the footer flips all text.
7. **Reduced motion** — devtools emulation; CaseFile rotation and PinnedNote hover transforms are disabled.
8. **Narrow viewport (~360px)** — CaseFile's padding collapses to `xs: 3`; pinned notes wrap; footer wraps readably.

Stop dev server when done.

- [ ] **Step 3: Verify git log**

Run:

```bash
git log --oneline -12
```

Expected, in order (most recent first):

```
chore: remove obsolete paper components
feat: rebuild How to play on board + case file aesthetic
feat: rebuild Join page on board + case file aesthetic
feat: rebuild home page on board + case file aesthetic
feat: update translation key for iteration 2 headline
feat: add StampButton component
feat: add PinnedNote component
feat: add CaseFile component
feat: add BoardSurface component
refactor: adopt PaperSurface and PaperButton in Join page
feat: redesign home page with paper aesthetic and host device guard
feat: update home page translations for redesign
```

- [ ] **Step 4: Report completion**

Post a summary of results and any deviations from the spec or follow-ups surfaced.
