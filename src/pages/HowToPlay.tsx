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
          fontFamily: 'var(--font-script)',
          fontSize: '1.75rem',
          color: '#1E3A8A',
          lineHeight: 1.1,
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
    return <span key={i}>{part.replace(/\{\/?bold\}/g, '')}</span>;
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
        <CaseFile disableRotation>
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
                "One device hosts the shared board on a larger screen (a TV or a large monitor) — it's a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each player's hand appears privately on their own device.",
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

          <Box sx={{ height: { xs: 40, sm: 56 } }} />
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -7, position: 'relative', zIndex: 2 }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
