# How to Play page — design

## Goal

Replace the placeholder `HowToPlay` page (`src/pages/HowToPlay.tsx`) with a tight, self-contained rules walkthrough for a total newcomer. Target reading time ~2 minutes. App-specific guidance (host board vs. player phones) is woven into the rules rather than separated into a "Using this app" section.

## Audience and scope

- **Reader:** someone who has never played Deception and lands on `/how-to-play` from the Home page.
- **Out of scope:** examples, optional roles (Accomplice, Witness), edge cases, tiebreakers, app/account help.
- **Roles covered:** Forensic Scientist, Murderer, Investigators (the three roles the app currently supports).

## Architecture

- Single-page change. No new routes; route `/how-to-play` already wired in `src/App.tsx`.
- Page structure unchanged at the outer level: `BoardSurface > Container(maxWidth="sm") > CaseFile > [content]` followed by a `PinnedNote` "Back" linking to `/`.
- Inside the `CaseFile`, the heading is followed by five subsections in story-first order: Premise → Roles → Setup → Round flow → Winning.
- Each subsection is rendered by an inline `Section({ title, children })` helper defined in the same file. No new shared component.
- All visible copy goes through `t(...)` from `useI18n`. New keys are added to `src/i18n/translations.ts` with Portuguese translations.

## Components and styling

- Reuse: `BoardSurface`, `CaseFile`, `PinnedNote`, MUI `Container`/`Box`/`Typography`. No new dependencies.
- Page title: typewriter font, uppercase, letter-spacing — matches the existing placeholder treatment.
- Section titles: typewriter font, uppercase, smaller than the page title; clear visual hierarchy without dividers.
- Body text: typewriter font, color `#1C1B1B`, comfortable line-height for paragraph reading.
- Vertical rhythm: spacing between sections via MUI `sx` props; no horizontal rules.
- Container width: `sm` (consistent with the placeholder and other pages).

## Content (English source copy)

The wording below is the source of truth for English. The Portuguese translations live alongside in `src/i18n/translations.ts`.

**Page title:** `How to play` (already keyed)

### Premise
Late at night, a murder has happened. A team of Investigators must piece together how it was done, guided only by the cryptic forensic readings of a Forensic Scientist who cannot speak plainly. Among the Investigators, a Murderer hides in plain sight.

### Roles
The **Forensic Scientist** knows who the Murderer is and which means and key clue point to them. They communicate only by placing forensic analysis tiles on the host board.

The **Murderer** secretly picks their weapon (means) and a key piece of evidence from their hand on their phone.

The **Investigators** study the board and debate aloud — one of them is secretly the Murderer.

### Setup
One device hosts the shared board on a larger screen (laptop or tablet) — it's a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each player's hand appears privately on their own device.

### Round flow
From their phone, the Forensic Scientist reveals a forensic category and places a tile indicating a reading (e.g. "Cause of death: suffocation"); the choice appears on the host board for everyone to see. Investigators discuss and study the means and clues in play. Over successive rounds, more categories are revealed. Investigators may lock in a guess — selecting one player's means and key — from their phone at any time.

### Winning
Investigators win if someone correctly names the Murderer's means **and** key. The Murderer wins if the group runs out of rounds without a correct guess, or if all incorrect guesses are used up.

## i18n

- Existing convention: English strings are the keys; Portuguese translations are stored in `src/i18n/translations.ts`.
- New keys to add:
  - `Premise`
  - `Roles`
  - `Setup`
  - `Round flow`
  - `Winning`
  - One key per paragraph or distinct sentence group above. Granularity: keep each section's body as 1–3 keys (one per paragraph in Roles, one each for Premise/Setup/Round flow/Winning).
- Markup-bearing copy (e.g. **Forensic Scientist**, **and**) is rendered with React fragments so the bold spans aren't embedded in translated strings — translators receive the plain phrases.

## Navigation

- The existing `PinnedNote` "Back" → `/` is the only exit. No language toggle on this page; no "New game" CTA.

## Out of scope

- Visual diagrams, illustrations, or card mockups.
- Any "Using this app" appendix (covered inline in Setup and Round flow).
- Optional roles or rule variants.
- Persisted "have you read the rules" state.

## Acceptance criteria

- Visiting `/how-to-play` shows the page title plus the five sections, in the order Premise → Roles → Setup → Round flow → Winning, with the body copy above.
- Switching language on the Home page (and then navigating in) renders the page in the selected language with no untranslated keys.
- "Back" pinned note returns to `/`.
- Layout works on mobile and desktop within `Container maxWidth="sm"`.
- `npm run lint` and `npm run build` pass.
