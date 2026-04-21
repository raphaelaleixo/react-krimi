# Player Name Display Rule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a consistent name-display rule — "Raphael Aleixo Avellar" → "R. Avellar", with ellipsis fallback and a hover tooltip — to the three bounded UI spots where player names render: the notebook `PlayerFile` (lobby + board), the lobby `AssigningCaseSheet` signature, and the board `ForensicSheet` signature.

**Architecture:** A single pure helper `formatDisplayName(name)` in `src/utils/formatDisplayName.ts` handles the abbreviation. Each of the three call sites imports it, renders the abbreviated form, applies `white-space: nowrap / overflow: hidden / text-overflow: ellipsis` to its own `Typography`, and adds a native `title={originalName}` attribute so hover reveals the full name. Each call site keeps its existing chrome — no wrapper component, no new props surface.

**Tech Stack:** TypeScript, React 19, MUI 9 (`Typography` with `sx`).

**Testing note:** No test runner is configured in this project (see `CLAUDE.md`). Verification leans on `npm run lint` + `npx tsc -b --noEmit` (or `npm run build`) after each code change, plus a manual browser walkthrough at the end (`npm run dev`). Steps reflect this — no automated unit tests are written, and no test runner is added.

---

## File Structure

**Create:**
- `src/utils/formatDisplayName.ts` — pure helper; one exported function; no React imports.

**Modify:**
- `src/components/board/PlayerFile.tsx` — apply helper + overflow CSS to the name `Typography` at lines 90–102.
- `src/components/board/AssigningCaseSheet.tsx` — apply helper + overflow CSS to the detective-name `Typography` at lines 81–103 (preserving the `\u00A0` empty-state placeholder).
- `src/components/board/ForensicSheet.tsx` — apply helper + overflow CSS to the signature `Typography` at lines 72–82.

No other files are touched. `ForensicAnalysis.tsx` is explicitly out of scope (see spec).

---

## Task 1: Create the `formatDisplayName` helper

**Files:**
- Create: `src/utils/formatDisplayName.ts`

- [ ] **Step 1: Create the file with the helper**

Create `src/utils/formatDisplayName.ts` with exactly this content:

```ts
// Display-name rule for bounded-width player-name spots
// (see docs/superpowers/specs/2026-04-21-player-name-display-design.md).
// Unconditional: if the trimmed name has more than one whitespace-separated
// token, keep only `first[0] + '. ' + last` and drop any middles.
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

- [ ] **Step 2: Spot-check the logic by reading the file**

Read the file you just wrote. Trace each of these inputs through the function in your head and confirm the output:

| Input | Expected output |
|---|---|
| `""` | `""` |
| `"   "` | `""` |
| `"Ana"` | `"Ana"` |
| `"Mary Jo"` | `"M. Jo"` |
| `"Raphael Aleixo Avellar"` | `"R. Avellar"` |
| `"  Raphael   Avellar  "` | `"R. Avellar"` |
| `"jean-luc picard"` | `"J. picard"` |
| `"Bartholomew Vanderberg-Smithson"` | `"B. Vanderberg-Smithson"` |

If any trace disagrees with the expected output, stop and fix the helper before proceeding.

- [ ] **Step 3: Verify the file type-checks and lints**

Run: `npm run lint`
Expected: No new errors introduced by this file.

Run: `npx tsc -b --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/formatDisplayName.ts
git commit -m "feat(utils): add formatDisplayName helper"
```

---

## Task 2: Apply the rule in `PlayerFile`

**Files:**
- Modify: `src/components/board/PlayerFile.tsx` (import line near top; name `Typography` at lines 90–102)

- [ ] **Step 1: Add the import**

At the top of `src/components/board/PlayerFile.tsx`, after the existing `import Pushpin from './Pushpin';` line, add:

```ts
import { formatDisplayName } from '../../utils/formatDisplayName';
```

(Two `../` because `PlayerFile.tsx` lives at `src/components/board/` and the helper is at `src/utils/`.)

- [ ] **Step 2: Replace the name `Typography` block**

Locate the existing block at `src/components/board/PlayerFile.tsx:90–102`:

```tsx
        <Typography
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75em',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            lineHeight: 1,
            pr: 3,
            mb: 1.5,
          }}
        >
          {name}
        </Typography>
```

Replace it with:

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

Three differences:
- New `title={name}` prop (original full name stays recoverable via hover).
- Three new `sx` keys: `whiteSpace`, `overflow`, `textOverflow`.
- Rendered content changes from `{name}` to `{formatDisplayName(name)}`.

No other changes. Do not touch `PlayerFileProps` or the callers (`Lobby.tsx:132`, `Board.tsx:184`) — they still pass the raw full name; the component owns the transform.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: No new errors.

Run: `npx tsc -b --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/PlayerFile.tsx
git commit -m "feat(board): abbreviate and truncate names in PlayerFile"
```

---

## Task 3: Apply the rule in `AssigningCaseSheet`

**Files:**
- Modify: `src/components/board/AssigningCaseSheet.tsx` (import line; detective-name `Typography` at lines 81–103)

- [ ] **Step 1: Add the import**

At the top of `src/components/board/AssigningCaseSheet.tsx`, after the existing imports (next to the other local imports), add:

```ts
import { formatDisplayName } from '../../utils/formatDisplayName';
```

Match the file's existing import style — if the nearby imports use single quotes, use single quotes.

- [ ] **Step 2: Replace the detective-name block**

Locate the existing block at `src/components/board/AssigningCaseSheet.tsx:81–94`:

```tsx
            <Box sx={{ minWidth: 140 }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.75em',
                  fontWeight: 'bold',
                  color: 'var(--evidence-color)',
                  minHeight: '1.75em',
                  display: 'inline-block',
                }}
              >
                {detectiveName ?? '\u00A0'}
              </Typography>
```

Replace it with:

```tsx
            <Box sx={{ minWidth: 140, maxWidth: '100%', overflow: 'hidden' }}>
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

Differences:
- `Box` now also has `maxWidth: '100%'` and `overflow: 'hidden'` so the ellipsis is contained within the sheet and never pushes the ‹ › cycle buttons outward.
- `Typography` gets `title={detectiveName ?? ''}`.
- `Typography` `sx` gains `maxWidth: '100%'`, `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`.
- Rendered content changes from `{detectiveName ?? '\u00A0'}` to `{detectiveName ? formatDisplayName(detectiveName) : '\u00A0'}`. The `\u00A0` placeholder still renders when the name is empty/undefined so the dashed underline keeps its vertical footprint.

Leave the trailing dashed-underline `Box` (lines 95–102) untouched — it already spans `width: '100%'` of the container.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: No new errors.

Run: `npx tsc -b --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/AssigningCaseSheet.tsx
git commit -m "feat(lobby): abbreviate and truncate detective name on case sheet"
```

---

## Task 4: Apply the rule in `ForensicSheet`

**Files:**
- Modify: `src/components/board/ForensicSheet.tsx` (import line; signature `Typography` at lines 72–82)

- [ ] **Step 1: Add the import**

At the top of `src/components/board/ForensicSheet.tsx`, after the existing imports, add:

```ts
import { formatDisplayName } from '../../utils/formatDisplayName';
```

- [ ] **Step 2: Replace the signature `Typography`**

Locate the existing block at `src/components/board/ForensicSheet.tsx:72–82`:

```tsx
          <Typography
            component="span"
            sx={{
              fontFamily: 'var(--font-script)',
              fontSize: '1.75em',
              fontWeight: 'bold',
              color: 'var(--weapon-color)',
            }}
          >
            {detectiveName}
          </Typography>
```

Replace it with:

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

Differences:
- `title={detectiveName}` added (no nullish guard — `detectiveName` is typed `string` in `ForensicSheetProps`).
- `sx` gains `display: 'inline-block'`, `maxWidth: '100%'`, `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`.
- Rendered content changes from `{detectiveName}` to `{formatDisplayName(detectiveName)}`.

Leave the centered parent `Box`, dashed underline, and `forensicScientistLabel` below untouched.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: No new errors.

Run: `npx tsc -b --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/ForensicSheet.tsx
git commit -m "feat(board): abbreviate and truncate detective name on forensic sheet"
```

---

## Task 5: Manual end-to-end verification

**Files:** None modified.

This task is pure QA. No commit at the end. If any step fails, go back to the relevant task above and fix it before marking this task complete.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the printed local URL in your browser.

- [ ] **Step 2: Short name (no space) — baseline**

On Home, create a room. On Join (use a second tab or another device), join the room with the name `Ana`.

Expected:
- On the host corkboard, the `PlayerFile` shows `Ana`.
- On the lobby's `AssigningCaseSheet` (left side), the active-detective signature shows `Ana` between the ‹ › cycle buttons.
- Hovering either name shows `Ana` as the tooltip (matches the rendered text).

- [ ] **Step 3: Two-token name**

Join another player as `Mary Jo`.

Expected:
- That player's `PlayerFile` shows `M. Jo`.
- If/when the `AssigningCaseSheet` cycles to that player, the signature shows `M. Jo`.
- Hovering either shows the full `Mary Jo` tooltip.

- [ ] **Step 4: Three-token name — the canonical case**

Join another player as `Raphael Aleixo Avellar`.

Expected:
- `PlayerFile` shows `R. Avellar` on a single line.
- When cycled to on the case sheet, the signature shows `R. Avellar`.
- Hovering either shows the full `Raphael Aleixo Avellar` tooltip.
- The sheet's ‹ › cycle buttons do not shift outward compared to a short-name cycle — the name area stays within its `minWidth: 140` / `maxWidth: 100%` bounds.

- [ ] **Step 5: Long-after-abbreviation name**

Join as `Bartholomew Vanderberg-Smithson`.

Expected:
- Abbreviated form `B. Vanderberg-Smithson` may still exceed `CARD_COLUMN_WIDTH` on the `PlayerFile`. Confirm the text clips with an ellipsis (e.g., `B. Vanderberg-Smi…`) and does **not** wrap or push the column width.
- On the `AssigningCaseSheet`, same behavior: clipping with ellipsis, no sheet expansion.
- Hover tooltip reveals the full original `Bartholomew Vanderberg-Smithson`.

- [ ] **Step 6: Single long token (no space)**

Join as `Bartholomewwwwwwwwwwwwwww`.

Expected:
- No abbreviation (no whitespace). The helper returns the name unchanged.
- `PlayerFile` + sheet both show the text clipped with an ellipsis.
- Hover tooltip reveals the full string.

- [ ] **Step 7: Whitespace edges**

If your join form allows leading/trailing whitespace, join as `  Raphael  Avellar  ` (two spaces in the middle, leading/trailing spaces).

Expected:
- Rendered as `R. Avellar` (trim + whitespace collapse).
- Tooltip may preserve the raw string with the extra spaces — that's fine; what matters is the rendered form.

If the join form strips whitespace at entry, this step is a no-op; skip it and note in the PR description.

- [ ] **Step 8: Cycle detectives in the lobby**

With 2+ players of varying name lengths in the lobby, click the ‹ › buttons on the `AssigningCaseSheet`. Alternate between a short name and a long one.

Expected:
- Name swaps in place.
- The dashed underline width stays constant; the ‹ › buttons do not jump laterally.
- No layout reflow elsewhere on the corkboard.

- [ ] **Step 9: Start the game — verify board-side**

Click `Start investigation`. The Board replaces the Lobby.

Expected:
- The `ForensicSheet` signature on the board shows the abbreviated form (e.g., `R. Avellar` for the selected detective).
- Hover tooltip on that signature shows the original full name.
- Investigator `PlayerFile`s across the board all show abbreviated names, with ellipsis clipping where applicable.
- Nothing wraps; no sheet widens unexpectedly.

- [ ] **Step 10: Final check**

Stop the dev server (`Ctrl+C`). Run:

```bash
npm run lint
npm run build
```

Expected: both succeed with no new errors.

Also run `git status` — working tree should be clean (all four earlier tasks committed; no stray changes).

If everything above passed, the plan is complete.

---

## Out of scope (follow-ups, not part of this plan)

- Apply the rule to `src/components/ForensicAnalysis.tsx` (detective's own h2 name + murderer inline in sentences).
- Apply the rule to `src/components/Detective.tsx:181` (player dropdown `MenuItem`).
- Name validation / length cap at input time (Home / Join screens).
