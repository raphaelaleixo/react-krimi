# Player Name Display Rule — Design Spec

**Date:** 2026-04-21
**Status:** Draft, awaiting user review
**Scope:** One new utility, three component edits.

## Motivation

Player-supplied names render at three spots on the corkboard UI where the container has a bounded (or visually fragile) width:

1. `PlayerFile.tsx` — the torn-notebook "file" shown in the lobby masonry and during play on the board. Column width is the fixed `CARD_COLUMN_WIDTH`.
2. `AssigningCaseSheet.tsx` — the lobby left-side case sheet, where the currently-focused detective's name sits between the ‹ › cycle buttons.
3. `ForensicSheet.tsx` — the board left-side sheet, where the detective's name appears as a signature under the "Forensic Analysis" header.

Today, a long name either wraps into multiple lines or pushes the sheet/column layout around. We want a predictable, deterministic rule that keeps names on a single line and looks intentional when a name is long.

## The rule

Given a raw `name` string (trim whitespace on both ends first):

- **Zero tokens** (empty string): render empty. Nothing to show.
- **One token**: render as-is.
- **Two or more tokens**: render as `first[0].toUpperCase() + '. ' + last`, dropping any middle tokens.
  - `"Raphael Aleixo Avellar"` → `"R. Avellar"`
  - `"Mary Jo"` → `"M. Jo"`
  - `"Jean-Luc Picard"` → `"J. Picard"` (the hyphen is part of the first token; we still take just the first character)

Applied **unconditionally whenever there is a space**, not only when the full name would overflow. Predictable and cheap — no measurement, no `ResizeObserver`.

If, after abbreviation, the result still does not fit its container, fall back to CSS `text-overflow: ellipsis` with a `title={originalName}` so hover reveals the full text.

## Goals

- One shared helper, three consumers, one behaviour.
- Zero layout shift: the affected containers never wrap or grow because of a long name.
- Full original name remains recoverable on hover (`title` attribute).
- No changes to how names are stored in Firebase or how the user types them on Home/Join.

## Non-goals

- **`ForensicAnalysis.tsx`** is out of scope. The detective's own name heading (line 61) and the murderer-name strong tags inside flowing sentences (lines 68, 79) stay as they are today. If we want to revisit them later, that's a separate spec.
- No auto-shrink font sizing, no per-slot width tuning, no tooltip library. Native `title=` is enough.
- No new i18n strings. The rule is purely a display transformation on a name the user already typed in their own language.
- No test suite additions — the project has no test runner configured. Verification is manual (see Testing).

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | New util `src/utils/formatDisplayName.ts` exporting `formatDisplayName(name: string): string` | Three call sites justify a shared helper. Keeps the rule in one place. Colocation inside `PlayerFile.tsx` was considered (user-approved earlier) but dropped when scope grew to `AssigningCaseSheet` and `ForensicSheet`. |
| 2 | Helper handles only the abbreviation; CSS overflow is per-call-site | Each call site has different chrome (notebook page vs signature line vs cycle-button row) and different layout constraints. One helper + three small style tweaks keeps the visual language of each site intact. |
| 3 | Unconditional abbreviation when a space is present | Simpler than measuring fit. Matches the user's stated rule. `"R. Avellar"` is a perfectly pleasant presentation even when the full name would have fit. |
| 4 | Drop middle tokens; keep only `first[0] + '. ' + last` | User's worked example: `"Raphael Aleixo Avellar"` → `"R. Avellar"`. |
| 5 | `title={originalName}` on the rendered element | Browser-native tooltip; no new dependency. Survives copy-paste into most accessibility tools. |
| 6 | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` applied at each call site, not on a wrapper | Keeps CSS close to the visual element it affects; avoids a generic "name" wrapper component when one is not needed. |
| 7 | Trim outer whitespace before splitting | `" Raphael  Avellar "` → `"R. Avellar"`, not `". Avellar"`. Also collapses runs of internal whitespace when we split on `/\s+/`. |

## The helper

`src/utils/formatDisplayName.ts`:

```ts
export function formatDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1) return tokens[0];
  const first = tokens[0];
  const last = tokens[tokens.length - 1];
  return `${first[0].toUpperCase()}. ${last}`;
}
```

No memoization (the operation is O(n) on a short string and runs at render time only). No options object — the rule is fixed.

## Call-site changes

### 1. `src/components/board/PlayerFile.tsx`

The name `Typography` at lines 90–102 already has `pr: 3` and a bounded column via `CARD_COLUMN_WIDTH` from the parent. Change:

```tsx
<Typography
  title={name}
  sx={{
    fontFamily: 'var(--font-script)',
    fontSize: '1.75em',
    fontWeight: 'bold',
    color: 'var(--text-color)',
    lineHeight: 1,
    pr: 3,
    mb: 1.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {formatDisplayName(name)}
</Typography>
```

No prop changes to `PlayerFileProps`. The `name` prop still receives the raw full name from callers (`Lobby.tsx:132`, `Board.tsx:184`); the component handles both the transform and the tooltip.

### 2. `src/components/board/AssigningCaseSheet.tsx`

The detective-name block at lines 81–103 is wrapped in `<Box sx={{ minWidth: 140 }}>`. Changes:

- Import `formatDisplayName`.
- Render `formatDisplayName(detectiveName ?? '')` instead of `detectiveName`, preserving the `\u00A0` placeholder when the name is empty (so the dashed underline keeps its vertical footprint).
- Add `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`, and `maxWidth: '100%'` on the `Typography`.
- Add `title={detectiveName ?? ''}` on the `Typography`.

Rough shape:

```tsx
<Typography
  component="span"
  title={detectiveName ?? ''}
  sx={{
    fontFamily: 'var(--font-script)',
    fontSize: '1.75em',
    fontWeight: 'bold',
    color: 'var(--evidence-color)',
    minHeight: '1.75em',
    display: 'inline-block',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {detectiveName ? formatDisplayName(detectiveName) : '\u00A0'}
</Typography>
```

`maxWidth: '100%'` keeps the ellipsis constrained to the parent `minWidth: 140` box rather than bleeding past the ‹ › cycle buttons.

### 3. `src/components/board/ForensicSheet.tsx`

The detective-signature `Typography` at lines 72–82 sits inside a centered `Box` with no explicit max width, so we rely on the parent sheet width. Changes:

- Import `formatDisplayName`.
- Render `formatDisplayName(detectiveName)` instead of `detectiveName`.
- Add `title={detectiveName}` on the `Typography`.
- Add `display: 'inline-block'`, `maxWidth: '100%'`, `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`.

Rough shape:

```tsx
<Typography
  component="span"
  title={detectiveName}
  sx={{
    fontFamily: 'var(--font-script)',
    fontSize: '1.75em',
    fontWeight: 'bold',
    color: 'var(--weapon-color)',
    display: 'inline-block',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {formatDisplayName(detectiveName)}
</Typography>
```

`detectiveName` is typed as `string` (non-optional) in `ForensicSheetProps`, so no null guard is needed.

## Error handling

- Empty / all-whitespace name → empty string; the consuming element collapses or relies on its existing placeholder (`AssigningCaseSheet` uses `\u00A0` explicitly).
- Single-character name (e.g., `"R"`) → returned unchanged. Harmless edge of the one-token branch.
- Multiple internal spaces → collapsed by the `/\s+/` split. A name like `"Raphael    Avellar"` becomes `"R. Avellar"`.

No throws, no `console.error`. The helper is pure and total.

## Testing (manual)

No test runner exists. Verification steps on `npm run dev`:

1. **Lobby, short name.** Join as `"Ana"`. Corkboard file renders `"Ana"`. AssigningCaseSheet signature renders `"Ana"`. No visible change from today.
2. **Lobby, two-token name.** Join as `"Mary Jo"`. File and sheet both render `"M. Jo"`. Hovering either shows `"Mary Jo"`.
3. **Lobby, three-token name.** Join as `"Raphael Aleixo Avellar"`. File and sheet both render `"R. Avellar"`. Hover reveals the full name. Sheet layout does not push the ‹ › buttons outward; file column width is unchanged.
4. **Lobby, long abbreviated form.** Join as `"Bartholomew Vanderberg-Smithson"`. Result `"B. Vanderberg-Smithson"` may still exceed the `CARD_COLUMN_WIDTH` — confirm the ellipsis fallback engages (`"B. Vanderberg-Smi…"`) and the tooltip holds the original string.
5. **Lobby, single long token.** Join as `"Bartholomewwwwwwwwwwwwwww"`. No abbreviation happens (no space). Ellipsis engages; tooltip shows the full string.
6. **Board, during play.** Start the game with a long-named detective. `ForensicSheet` signature shows abbreviated form, underline remains centered, no wrap. Investigator `PlayerFile`s on the board also show abbreviated names.
7. **Cycle detectives in lobby.** With 2+ players of varying name lengths, click ‹ ›. Name swaps in place, sheet width stays constant.
8. **Whitespace edges.** If accessible via the join flow, a name typed as `"  Raphael  Avellar  "` still renders as `"R. Avellar"`.

## Out-of-scope follow-ups

- Apply the rule to `ForensicAnalysis.tsx` (detective's own name heading + the inline murderer references) — separate decision about ellipsis inside flowing prose.
- Apply the rule to `Detective.tsx:181` (player dropdown `MenuItem`) — dropdown already handles overflow reasonably; revisit only if it shows up in a real bug.
- Enforce or warn on names at input time (Home / Join screens). Today we accept any string; a future pass could cap length or strip weird whitespace up front.
