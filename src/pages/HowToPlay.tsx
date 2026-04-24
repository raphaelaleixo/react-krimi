import type { ReactNode } from 'react';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import TapedNoteButton from '../components/board/TapedNoteButton';
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
                  "The {bold}Forensic Scientist{/bold} sees the Murderer's secret means and key evidence. During analysis they communicate only by placing tiles on the board — no speaking, no writing, no gestures.",
                ),
              )}
            </p>
            <p>
              {renderWithBold(
                t(
                  "The {bold}Murderer{/bold} is one of the Investigators. They secretly mark one means and one key evidence from their own hand — that pair is the crime the others must uncover.",
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
                "Krimi plays with 5 to 12 players. One device hosts the shared board on a larger screen (a TV or a big monitor) — it's a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each Investigator holds 4 means and 4 clues privately on their device.",
              )}
            </p>
          </Section>

          <Section title={t('Picks')}>
            <p>
              {t(
                "Before analysis begins, every Investigator secretly picks one means and one key evidence from their own hand. Only the Murderer's pick is the real crime — the rest are decoys. The Forensic Scientist already knows who the Murderer is; the camouflage is for the other Investigators, who would otherwise spot the Murderer the instant one player started submitting.",
              )}
            </p>
          </Section>

          <Section title={t('Analysis')}>
            <p>
              {t(
                "The Forensic Scientist fills forensic categories (Cause of death, Motive, Time of death, and so on). In round 1 they place 6 tiles; each following round adds one more, up to 8 by round 3. Every category offers 6 options, and the Scientist picks the single option that best nudges Investigators toward the Murderer's means and key evidence — without speaking, writing, or reacting.",
              )}
            </p>
          </Section>

          <Section title={t('Accusation')}>
            <p>
              {renderWithBold(
                t(
                  "Once this round's tiles are placed, any Investigator may accuse from their phone — and {bold}each Investigator gets only one accusation the entire game{/bold}. An accusation names a suspect, then picks one means and one key evidence from that suspect's hand. All three have to match the Murderer's secret pick.",
                ),
              )}
            </p>
            <p>
              {t(
                'Not ready? Pass the round — passing costs nothing and lets you wait for more clues.',
              )}
            </p>
          </Section>

          <Section title={t('Winning')}>
            <p>
              {renderWithBold(
                t(
                  "Investigators win the moment anyone correctly names the Murderer, their means, {bold}and{/bold} their key evidence. The Murderer wins if all three rounds pass without a correct accusation — or if every other Investigator has already accused incorrectly.",
                ),
              )}
            </p>
          </Section>

          <Box sx={{ height: { xs: 40, sm: 56 } }} />
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -7, position: 'relative', zIndex: 2 }}>
          <TapedNoteButton rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </TapedNoteButton>
        </Box>
      </Container>
    </BoardSurface>
  );
}
