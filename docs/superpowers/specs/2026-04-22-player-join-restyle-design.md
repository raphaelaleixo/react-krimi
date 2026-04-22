# PlayerJoin restyle — match /join aesthetic

## Goal

Restyle `src/pages/PlayerJoin.tsx` (route `/room/:id/player`) to match the visual treatment of `src/pages/Join.tsx`. The page currently uses plain MUI filled `TextField`s with no title; after this change it presents the room code as a prominent `Case#XXXXX` title (matching the Join page's title style) and styles the nickname input like Join's room-code input.

## Scope

In scope:

1. Rewrite the presentational layer of `PlayerJoin.tsx`:
   - Add an `h1` title rendering `Case#{roomId}` in Join's title style.
   - Add a typewriter subtitle below the title.
   - Restyle the nickname `TextField` to match Join's room-code field (standard variant, typewriter bold label, script font value, blue signature `x` start adornment).
   - Remove the disabled `Game code` `TextField` (redundant with the new title).
2. Add i18n strings:
   - `'Case'` (already exists — reused from `CasePolaroid.tsx`).
   - `'Enter your nickname for the case file.'` (new subtitle copy).
3. No behavioral changes — the nickname submit, error handling, and routing all stay exactly as they are today.

Out of scope:

- Changes to `Player.tsx` (`/room/:id/player/:playerId`).
- Changes to `RejoinPlayers.tsx` (`/room/:id/players`).
- Any change to `joinRoom` logic in `GameContext`.
- Any change to the back-navigation target (stays `/`).

## Architecture

Single-file change in `src/pages/PlayerJoin.tsx`. No new components, no new routes, no data flow changes.

### Final layout

Inside the existing `BoardSurface` → `Container maxWidth="sm"` → `CaseFile` wrapper (same as `Join.tsx`):

1. **Title (`Typography` as `h1`)**
   - Text: `Case#{roomId}` — `{t('Case')}#{roomId}`
   - Style matches `Join.tsx:67-81` exactly:
     - `fontFamily: 'var(--font-typewriter)'`
     - `fontSize: '2rem'`
     - `fontWeight: 700`
     - `letterSpacing: '3px'`
     - `textTransform: 'uppercase'`
     - `color: '#1C1B1B'`
     - `mb: 1`, `textAlign: 'center'`

2. **Subtitle (`Typography`)**
   - Text: `t('Enter your nickname for the case file.')`
   - Style matches `Join.tsx:82-91`:
     - `fontFamily: 'var(--font-typewriter)'`
     - `color: '#1C1B1B'`
     - `textAlign: 'center'`
     - `mb: 3`

3. **Form (`Box component="form"`)**
   - Error `Alert` — unchanged from current implementation.
   - **Nickname `TextField`** — restyled to match `Join.tsx:99-140`:
     - `label={t('Nickname')}`
     - `variant="standard"`
     - Label styling: `fontSize: '1.1rem'`, `fontWeight: 700`
     - Input styling: `fontFamily: 'var(--font-script)'`, `fontSize: '1.75rem'`, `color: '#1C1B1B'`
     - `required`, `autoFocus`
     - `slotProps.input.startAdornment` — blue script `x` signature mark, same sx as `Join.tsx:122-134` (script font, 1.75rem, color `#1E3A8A`, opacity 0.7)
     - `slotProps.inputLabel`: `{ shrink: true }`
     - `slotProps.htmlInput`: `{ autoComplete: 'off' }` — **no `autoCapitalize: 'characters'`** (nicknames preserve case)
     - `sx: { mb: 3 }` (replacing the current `mb: 3` on the nickname field; `mb: 2` on the removed game-code field goes away with it)
   - **StampButton** — unchanged: `variant="primary"`, `type="submit"`, label `t('Enter')`, disabled when nickname is empty.

4. **TapedNoteButton `Back`** — unchanged, routes to `/`.

### Removed

- The disabled `Game code` `TextField` at `PlayerJoin.tsx:52-59`.

## Imports

After the change, `PlayerJoin.tsx` will additionally import:

- `Typography` from `@mui/material/Typography`
- `InputAdornment` from `@mui/material/InputAdornment`

## i18n

Add one new key to `src/i18n/translations.ts`:

- `'Enter your nickname for the case file.'` → `'Coloque seu apelido no arquivo do caso.'`

`'Case'` (`'Caso'`), `'Nickname'` (`'Apelido'`), and `'Enter'` (`'Entrar'`) are already keyed.

## Testing

Manual verification via `npm run dev`:

1. From Home, start a game → open `/room/:id/player` on a second device/tab.
2. Confirm:
   - Title renders `Case#{roomId}` (uppercase, letter-spaced) and matches Join's title size.
   - Subtitle renders the new copy.
   - Nickname input shows the blue `x` signature adornment and uses the script font at 1.75rem as the user types.
   - Submitting a valid nickname still routes to `/room/:id/player/:playerId`.
   - Error Alert still shows when nickname is empty (via server validation) or join fails.
3. Run `npm run lint` and `npm run build`.
4. Toggle language on Home → `/room/:id/player` subtitle text switches to Portuguese.

No automated tests — the project has no test runner configured (per `CLAUDE.md`).
