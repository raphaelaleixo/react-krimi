# How to Play page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/how-to-play` page with a tight, story-first rules walkthrough (Premise → Roles → Setup → Round flow → Winning) that weaves in the host-board / player-phone split.

**Architecture:** Single-file change to `src/pages/HowToPlay.tsx` plus new keys in `src/i18n/translations.ts`. Reuses existing `BoardSurface`, `CaseFile`, `PinnedNote`, MUI `Container`/`Box`/`Typography`. An inline `Section` helper renders a typewriter subheading + body block; defined in the same file because it has one consumer.

**Tech Stack:** React 19, TypeScript, MUI 9, react-router-dom, existing `useI18n` hook.

**Note on testing:** This project has no test runner (per `CLAUDE.md`). Verification per task uses `npm run lint`, `npm run build`, and a manual browser check on the dev server.

**Spec:** `docs/superpowers/specs/2026-04-20-how-to-play-design.md`

---

## File Structure

- **Modify:** `src/pages/HowToPlay.tsx` — replace the placeholder body with the heading + 5 sections; keep `BoardSurface`/`Container`/`CaseFile`/`PinnedNote` outer structure; add inline `Section` helper.
- **Modify:** `src/i18n/translations.ts` — add new English-key → Portuguese pairs for the section titles and body paragraphs.

No new files.

---

## Task 1: Add Portuguese translations for the new copy

**Files:**
- Modify: `src/i18n/translations.ts`

**Why first:** Strings are the source of truth for both languages. Adding them up front means Task 2 can `t(...)` against keys that already exist, so the dev-server check at the end of Task 2 immediately shows the page in either language without untranslated keys.

- [ ] **Step 1: Append a new translation block at the bottom of the `translations` object**

Open `src/i18n/translations.ts`. Inside the `translations` object literal, just before the closing `};` on the final line, insert this block (keep the trailing comma on the previous entry so the file remains valid):

```ts
  // How to play — added 2026-04-20
  'Premise': 'Premissa',
  'Roles': 'Papéis',
  'Setup': 'Preparação',
  'Round flow': 'Andamento',
  'Winning': 'Vitória',

  'Late at night, a murder has happened. A team of Investigators must piece together how it was done, guided only by the cryptic forensic readings of a Forensic Scientist who cannot speak plainly. Among the Investigators, a Murderer hides in plain sight.':
    'Tarde da noite, um assassinato aconteceu. Uma equipe de Investigadores precisa juntar as peças para descobrir como foi feito, guiada apenas pelas leituras forenses enigmáticas de um Cientista Forense que não pode falar abertamente. Entre os Investigadores, um Assassino se esconde à vista de todos.',

  'The {bold}Forensic Scientist{/bold} knows who the Murderer is and which means and key clue point to them. They communicate only by placing forensic analysis tiles on the host board.':
    'O {bold}Cientista Forense{/bold} sabe quem é o Assassino e quais a causa e a evidência principal que apontam para ele. Ele se comunica apenas colocando peças de análise forense no quadro principal.',

  'The {bold}Murderer{/bold} secretly picks their weapon (means) and a key piece of evidence from their hand on their phone.':
    'O {bold}Assassino{/bold} escolhe secretamente sua arma (causa) e uma evidência principal da sua mão, no próprio celular.',

  'The {bold}Investigators{/bold} study the board and debate aloud — one of them is secretly the Murderer.':
    'Os {bold}Investigadores{/bold} estudam o quadro e debatem em voz alta — um deles é secretamente o Assassino.',

  'One device hosts the shared board on a larger screen (laptop or tablet) — it\'s a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each player\'s hand appears privately on their own device.':
    'Um dispositivo apresenta o quadro compartilhado em uma tela maior (laptop ou tablet) — ele é apenas um display, ninguém joga por ele. Todos os jogadores, incluindo o Cientista Forense, entram pelo próprio celular usando o código da sala. Papéis e cartas são distribuídos automaticamente; a mão de cada jogador aparece em privado no próprio dispositivo.',

  'From their phone, the Forensic Scientist reveals a forensic category and places a tile indicating a reading (e.g. "Cause of death: suffocation"); the choice appears on the host board for everyone to see. Investigators discuss and study the means and clues in play. Over successive rounds, more categories are revealed. Investigators may lock in a guess — selecting one player\'s means and key — from their phone at any time.':
    'Pelo celular, o Cientista Forense revela uma categoria forense e coloca uma peça indicando uma leitura (ex.: "Causa da morte: asfixia"); a escolha aparece no quadro principal para todos verem. Os Investigadores discutem e estudam as causas e evidências em jogo. A cada rodada, mais categorias são reveladas. Os Investigadores podem travar um palpite — escolhendo a causa e a evidência principal de um jogador — pelo celular a qualquer momento.',

  'Investigators win if someone correctly names the Murderer\'s means {bold}and{/bold} key. The Murderer wins if the group runs out of rounds without a correct guess, or if all incorrect guesses are used up.':
    'Os Investigadores vencem se alguém disser corretamente a causa {bold}e{/bold} a evidência principal do Assassino. O Assassino vence se as rodadas acabarem sem um palpite correto, ou se todos os palpites errados forem gastos.',
```

**Why the `{bold}...{/bold}` markers:** The same English string is both the i18n key and the source text rendered to a non-Portuguese reader. To bold a span without splitting the sentence into multiple keys (which would be hard to translate), we wrap the bold portions in `{bold}...{/bold}` markers and split on them at render time in Task 2. Translators can move the markers around the equivalent Portuguese phrase.

- [ ] **Step 2: Verify the file still parses**

Run: `npm run build`
Expected: build succeeds (the new keys are plain strings; only the type checker needs to see the file is well-formed).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "i18n: add How to Play translations"
```

---

## Task 2: Rewrite the HowToPlay page

**Files:**
- Modify: `src/pages/HowToPlay.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/pages/HowToPlay.tsx` with:

```tsx
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import { useI18n } from '../hooks/useI18n';

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        component="h2"
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '1.1rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#1C1B1B',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          fontFamily: 'var(--font-typewriter)',
          color: '#1C1B1B',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          '& p': { m: 0, mb: 1.5 },
          '& p:last-of-type': { mb: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function renderWithBold(text: string) {
  const parts = text.split(/(\{bold\}.*?\{\/bold\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{bold\}(.*?)\{\/bold\}$/);
    if (match) return <strong key={i}>{match[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export default function HowToPlay() {
  const { t } = useI18n();

  return (
    <BoardSurface>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          py: 6,
        }}
      >
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
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

          <Section title={t('Premise')}>
            <p>
              {t(
                'Late at night, a murder has happened. A team of Investigators must piece together how it was done, guided only by the cryptic forensic readings of a Forensic Scientist who cannot speak plainly. Among the Investigators, a Murderer hides in plain sight.',
              )}
            </p>
          </Section>

          <Section title={t('Roles')}>
            <p>
              {renderWithBold(
                t(
                  'The {bold}Forensic Scientist{/bold} knows who the Murderer is and which means and key clue point to them. They communicate only by placing forensic analysis tiles on the host board.',
                ),
              )}
            </p>
            <p>
              {renderWithBold(
                t(
                  'The {bold}Murderer{/bold} secretly picks their weapon (means) and a key piece of evidence from their hand on their phone.',
                ),
              )}
            </p>
            <p>
              {renderWithBold(
                t(
                  'The {bold}Investigators{/bold} study the board and debate aloud — one of them is secretly the Murderer.',
                ),
              )}
            </p>
          </Section>

          <Section title={t('Setup')}>
            <p>
              {t(
                "One device hosts the shared board on a larger screen (laptop or tablet) — it's a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each player's hand appears privately on their own device.",
              )}
            </p>
          </Section>

          <Section title={t('Round flow')}>
            <p>
              {t(
                'From their phone, the Forensic Scientist reveals a forensic category and places a tile indicating a reading (e.g. "Cause of death: suffocation"); the choice appears on the host board for everyone to see. Investigators discuss and study the means and clues in play. Over successive rounds, more categories are revealed. Investigators may lock in a guess — selecting one player\'s means and key — from their phone at any time.',
              )}
            </p>
          </Section>

          <Section title={t('Winning')}>
            <p>
              {renderWithBold(
                t(
                  "Investigators win if someone correctly names the Murderer's means {bold}and{/bold} key. The Murderer wins if the group runs out of rounds without a correct guess, or if all incorrect guesses are used up.",
                ),
              )}
            </p>
          </Section>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
```

**Notes for the engineer:**
- `Section` is intentionally inline — it has exactly one consumer; extracting to a separate file would be premature.
- `renderWithBold` parses `{bold}...{/bold}` markers from translated strings and produces a `<strong>` element. The marker survives translation as plain text, so translators can reposition the bold span around its Portuguese equivalent.
- Long English strings passed to `t(...)` must match the keys added in Task 1 byte-for-byte (including curly quotes inside contractions). When in doubt, copy-paste from the translations file.
- The `<p>` tags inside `<Section>` are styled via the `& p` selector to control vertical rhythm without needing MUI `<Typography>` per paragraph.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: no errors. (Warnings unrelated to `HowToPlay.tsx` are OK; new lint errors in this file are not.)

- [ ] **Step 3: Run the type-checker / build**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Manual visual check on dev server**

Run: `npm run dev`
In a browser, navigate to `http://localhost:5173/how-to-play`.

Verify:
- Page title `HOW TO PLAY` appears in typewriter font, uppercase, centered.
- Five sections appear in order: `PREMISE`, `ROLES`, `SETUP`, `ROUND FLOW`, `WINNING`.
- Section titles are in the same typewriter font but smaller than the page title.
- In the Roles section, the words `Forensic Scientist`, `Murderer`, and `Investigators` are bold and **no `{bold}` markers are visible anywhere on the page**.
- In the Winning section, the word `and` is bold and no markers are visible.
- The `Back` pinned note appears below the case file and links to `/`.
- Layout is comfortable on mobile width (e.g. Chrome devtools 375px) and desktop.

Switch language: go to `/`, click the `Versão em português` toggle in the footer, navigate back to `/how-to-play`. Verify:
- All section titles and body copy render in Portuguese.
- Bold spans still render correctly with no visible markers.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HowToPlay.tsx
git commit -m "feat: write How to Play page content"
```

---

## Self-review checklist (already run by the planner)

- Spec sections covered: Architecture (Task 2), Components/Section helper (Task 2), Styling (Task 2), Content for all 5 sections (Tasks 1+2), i18n with bold markers (Tasks 1+2), Navigation/Back (Task 2 — preserved from existing file), Acceptance criteria (Task 2 Step 4).
- No placeholders, TODOs, or "TBD" text.
- All translation keys used in Task 2's `t(...)` calls exist in Task 1's translation block (verified by visual diff between the two task bodies).
- `Section` and `renderWithBold` are defined in the same file before they're used.
