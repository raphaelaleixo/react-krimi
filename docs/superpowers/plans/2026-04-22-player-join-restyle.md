# PlayerJoin Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `PlayerJoin.tsx` to match the `/join` page aesthetic — prominent `Case#{roomId}` title, typewriter subtitle, and nickname input matching Join's styled room-code field.

**Architecture:** Single-file presentational change to `src/pages/PlayerJoin.tsx`, plus one new i18n key. No behavioral, routing, or data changes. Styling values copied from `src/pages/Join.tsx` to ensure exact parity.

**Tech Stack:** React 19, TypeScript, MUI 9, custom typewriter/script fonts (`var(--font-typewriter)`, `var(--font-script)`).

**Reference files:**
- Spec: `docs/superpowers/specs/2026-04-22-player-join-restyle-design.md`
- Visual reference (title + input styling): `src/pages/Join.tsx:67-140`
- Current file being rewritten: `src/pages/PlayerJoin.tsx`
- i18n file: `src/i18n/translations.ts`

**Testing notes:** The project has no automated test runner (`CLAUDE.md` confirms this). Verification is via `npm run lint`, `npm run build`, and manual browser testing with `npm run dev`.

---

### Task 1: Add the new i18n key

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add the new translation entry**

Add a new commented block at the end of the existing translations (just before the closing `};`). Open `src/i18n/translations.ts`, scroll to the end of the `translations` object, and add:

```ts
  // PlayerJoin restyle — added 2026-04-22
  'Enter your nickname for the case file.': 'Coloque seu apelido no arquivo do caso.',
```

Place this block after the last existing commented group (whatever it is at the bottom of the object). Do NOT reorder or edit any existing entries.

- [ ] **Step 2: Verify lint still passes**

Run: `npm run lint`
Expected: no new errors or warnings from this change.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "i18n: add PlayerJoin case-file subtitle string"
```

---

### Task 2: Rewrite `PlayerJoin.tsx` with the new styling

**Files:**
- Modify: `src/pages/PlayerJoin.tsx` (full presentational rewrite)

- [ ] **Step 1: Update imports**

Open `src/pages/PlayerJoin.tsx`. The current imports at lines 5-8 are:

```tsx
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
```

Add two new MUI imports so the block becomes:

```tsx
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
```

Do not touch the other imports (they stay as-is).

- [ ] **Step 2: Replace the JSX returned by the component**

Replace the entire `return (...)` block (currently lines 42-85 — from `return (` to the closing `);`) with the following:

```tsx
  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Case')}#{roomId}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('Enter your nickname for the case file.')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
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
              variant="standard"
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 700,
                },
                '& .MuiInput-input': {
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.75rem',
                  color: '#1C1B1B',
                },
              }}
              required
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          fontFamily: 'var(--font-script)',
                          fontSize: '1.75rem',
                          color: '#1E3A8A',
                          opacity: 0.7,
                          lineHeight: 1,
                        }}
                      >
                        x
                      </Box>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
                htmlInput: { autoComplete: 'off' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                {t('Enter')}
              </StampButton>
            </Box>
          </Box>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TapedNoteButton rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </TapedNoteButton>
        </Box>
      </Container>
    </BoardSurface>
  );
```

Key things this change does:
- Adds the `Case#{roomId}` title (uses existing `t('Case')` key — translates to "Caso" in pt_br).
- Adds the new subtitle using the key added in Task 1.
- Removes the disabled `Game code` TextField entirely.
- Changes the nickname TextField from `variant="filled"` to `variant="standard"` with styled label, script-font value, and blue signature `x` start adornment.
- Keeps `handleSubmit`, `nickname`/`setNickname`, `error`/`setError`, and the StampButton/TapedNoteButton behavior identical to the current file.

- [ ] **Step 3: Run typecheck + build**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors. If there's an error about an unused `roomId` — note that `roomId` is already used inside `handleSubmit` (line 34 in the original file) and will now also be rendered in the title, so both references remain valid.

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 5: Commit**

```bash
git add src/pages/PlayerJoin.tsx
git commit -m "style(player-join): match /join aesthetic with Case# title and signed nickname field"
```

---

### Task 3: Manual browser verification

**Files:** none (manual QA)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite starts on its usual port; no compile errors in the terminal.

- [ ] **Step 2: Drive the happy path in the browser**

1. Open the dev-server URL in a browser window. From Home, click **New game** (English) to create a room. Note the room code on the resulting Room page.
2. Open a second browser window (or private window) and navigate to `/room/<that-code>/player`.
3. Verify on the PlayerJoin page:
   - Title renders as `CASE#<CODE>` — uppercase, typewriter, bold, large (2rem). It should visually match the size and weight of the `RESUME` title on `/join`.
   - A centered typewriter subtitle below the title reads "Enter your nickname for the case file."
   - The nickname input has **no** disabled "Game code" field above it (that field is gone).
   - A blue script `x` appears as a start adornment inside the nickname input.
   - As you type, characters render in the script font at 1.75rem.
   - The `Enter` StampButton is disabled while the field is empty and enables once a nickname is entered.
   - Below the CaseFile, the taped `Back` button is still present.
4. Submit a nickname. Verify it routes to `/room/<code>/player/<playerId>` and the player appears in the host's Lobby.

- [ ] **Step 3: Verify the error state**

1. In a fresh browser tab, navigate to `/room/FAKE123/player` (a non-existent room).
2. Enter any nickname and submit.
3. Verify an error Alert appears above the nickname input (same red MUI Alert as before). The styling of the rest of the page should be unchanged.

- [ ] **Step 4: Verify Portuguese translation**

1. Return to Home, toggle the language to Portuguese (the `Versão em português` link), and create a new game in pt_br.
2. From a second window, open `/room/<new-code>/player`.
3. Verify:
   - Title reads `CASO#<CODE>` (pt_br `t('Case')` returns `Caso`).
   - Subtitle reads "Coloque seu apelido no arquivo do caso."
   - Nickname label reads `Apelido`, button reads `Entrar`, back reads `Voltar`.

- [ ] **Step 5: Stop the dev server and confirm the tree is clean**

```bash
git status
```

Expected: "nothing to commit, working tree clean" — both Task 1 and Task 2 commits are already in. No follow-up commit needed for this task.

---

## Self-review notes

- **Spec coverage check:** Title ✓ (Task 2 Step 2), subtitle ✓ (Task 2 Step 2), nickname TextField restyle ✓ (Task 2 Step 2), disabled Game code field removal ✓ (Task 2 Step 2), new i18n key ✓ (Task 1), no behavioral changes ✓ (`handleSubmit`, state, routing, error handling all preserved in Task 2 Step 2).
- **No new components or routes** — matches spec "Out of scope".
- **Language toggle verification** is covered in Task 3 Step 4.
