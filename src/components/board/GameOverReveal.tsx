import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { formatDisplayName } from '../../utils/formatDisplayName';
import BloodSplatters from './BloodSplatters';

export interface GameOverRevealProps {
  finished: boolean;
  roomId: string;
  winner?: 'detectives' | 'murderer';
  murdererName: string;
  murdererMeans: string[];
  murdererClues: string[];
  murdererChoice?: { mean: string; key: string };
}

const STAMP_RED = '#9E1B1B';
const MANILA_BODY = '#d4b87d';
const MANILA_EDGE = '#a88e5a';
const MANILA_INNER_FOLD = 'rgba(0, 0, 0, 0.08)';

function Newspaper({
  headline,
  splattered = false,
}: {
  headline: string;
  splattered?: boolean;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 230,
        bgcolor: '#f1ece0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: '1px solid rgba(0,0,0,0.2)',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {splattered && (
        <BloodSplatters
          seed={headline}
          minCount={2}
          maxCount={3}
          minSize={60}
          maxSize={110}
        />
      )}
      <Typography
        sx={{
          position: 'relative',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '0.95rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          textAlign: 'center',
          borderBottom: '1.5px double #1c1b1b',
          pb: 0.35,
          color: '#1c1b1b',
          WebkitTextStroke: '0.3px currentColor',
        }}
      >
        The Daily Ledger
      </Typography>
      <Typography
        sx={{
          position: 'relative',
          fontFamily: 'var(--font-typewriter)',
          fontSize: '1.1rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          lineHeight: 1.05,
          color: '#1c1b1b',
          textAlign: 'center',
        }}
      >
        {headline}
      </Typography>
      {/* fake columns */}
      <Box sx={{ position: 'relative', display: 'flex', gap: 0.75, mt: 0.75 }}>
        {[0, 1].map((col) => (
          <Box key={col} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 2,
                  bgcolor: '#1c1b1b',
                  opacity: 0.55,
                  width: i % 3 === 2 ? '70%' : '100%',
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

interface SectionProps {
  label: string;
  color: string;
  items: string[];
  selected?: string;
}

function Section({ label, color, items, selected }: SectionProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color,
          borderBottom: '1px solid rgba(0, 0, 0, 0.35)',
          pb: 0.5,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <Box key={item} sx={{ position: 'relative', display: 'inline-block' }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: 'var(--text-color)',
                  lineHeight: 1.5,
                  px: 0.5,
                }}
              >
                {item}
              </Typography>
              {isSelected && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: '-12%',
                    left: '-6%',
                    width: '112%',
                    height: '124%',
                    pointerEvents: 'none',
                    border: '2.5px solid var(--evidence-color)',
                    borderRadius: '55% 45% 52% 48% / 60% 40% 60% 40%',
                    transform: 'rotate(-2deg)',
                    opacity: 0.85,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function GameOverReveal({
  finished,
  roomId,
  winner,
  murdererName,
  murdererMeans,
  murdererClues,
  murdererChoice,
}: GameOverRevealProps) {
  const { t } = useI18n();
  const [lastSeenFinished, setLastSeenFinished] = useState(finished);
  const [visible, setVisible] = useState(false);
  const [identityRevealed, setIdentityRevealed] = useState(false);

  const detectivesWon = winner === 'detectives';

  if (finished !== lastSeenFinished) {
    setLastSeenFinished(finished);
    if (finished && !lastSeenFinished) {
      setVisible(true);
      setIdentityRevealed(detectivesWon);
    }
  }

  useEffect(() => {
    if (!visible || detectivesWon) return;
    const timer = window.setTimeout(() => setIdentityRevealed(true), 2200);
    return () => window.clearTimeout(timer);
  }, [visible, detectivesWon]);

  if (!visible) return null;

  const dismiss = () => setVisible(false);
  const stampText = detectivesWon ? t('Detectives Win') : t('Murderer Wins');
  const stampColor = detectivesWon ? 'var(--weapon-color)' : STAMP_RED;

  return (
    <Box
      className="krimi-anim-fade"
      onClick={dismiss}
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        cursor: 'pointer',
        px: 3,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 500 }}>
        {/* Folder tab */}
        <Box
          sx={{
            position: 'relative',
            width: 240,
            mx: 'auto',
            bgcolor: '#f8f6f0',
            borderRadius: '6px 6px 0 0',
            borderTop: `1px solid ${MANILA_EDGE}`,
            borderLeft: `1px solid ${MANILA_EDGE}`,
            borderRight: `1px solid ${MANILA_EDGE}`,
            py: 1.25,
            textAlign: 'center',
            boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '1.1rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: STAMP_RED,
              lineHeight: 1.1,
            }}
          >
            {t('Case #{id}').replace('{id}', roomId)}
          </Typography>
        </Box>

        {/* Folder body */}
        <Box
          sx={{
            position: 'relative',
            bgcolor: MANILA_BODY,
            border: `1px solid ${MANILA_EDGE}`,
            borderRadius: '2px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 4 },
          }}
        >
          {/* Fold line */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 6,
              left: 12,
              right: 12,
              height: 0,
              borderTop: `1px solid ${MANILA_INNER_FOLD}`,
              pointerEvents: 'none',
            }}
          />

          {/* Evidence pinned: polaroid top-right, newspaper bottom */}
          <Box
            sx={{
              position: 'absolute',
              zIndex: 3,
              animation: 'krimi-pinned-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
              animationDelay: '700ms',
              ...(detectivesWon
                ? { top: -16, right: -16, transform: 'rotate(6deg)' }
                : { bottom: -20, right: -16, transform: 'rotate(-4deg)' }),
            }}
          >
            <Newspaper
              headline={
                detectivesWon
                  ? t('Murderer caught')
                  : t('Murderer still at large')
              }
              splattered={!detectivesWon}
            />
          </Box>

          {/* Murderer identity + clues (delayed reveal on murderer win) */}
          <Box
            sx={{
              opacity: identityRevealed ? 1 : 0,
              transition: 'opacity 600ms ease-out',
            }}
          >
          <Box sx={{ position: 'relative', mb: 2, pr: { xs: 0, sm: 12 } }}>
            <Typography
              title={murdererName}
              sx={{
                fontFamily: 'var(--font-script)',
                fontSize: { xs: '1.8rem', sm: '2.1rem' },
                lineHeight: 1,
                color: 'var(--text-color)',
                textAlign: 'left',
              }}
            >
              {formatDisplayName(murdererName)}
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontFamily: 'var(--font-typewriter)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                color: STAMP_RED,
              }}
            >
              {t('The Murderer')}
            </Typography>
          </Box>

          {/* Means + Key Evidence */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
            <Section
              label={t('Means')}
              color="var(--weapon-color)"
              items={murdererMeans}
              selected={murdererChoice?.mean}
            />
            <Section
              label={t('Key evidence')}
              color="var(--evidence-color)"
              items={murdererClues}
              selected={murdererChoice?.key}
            />
          </Box>
          </Box>

          {/* Stamp overlaid diagonally */}
          <Box
            className="krimi-anim-stamp"
            sx={{
              position: 'absolute',
              top: detectivesWon ? '50%' : 'calc(100% - 240px)',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-8deg)',
              color: stampColor,
              border: `4px solid ${stampColor}`,
              borderRadius: 1,
              px: 2,
              py: 0.5,
              fontFamily: 'var(--font-typewriter)',
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.4rem' },
              letterSpacing: '3px',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              animationDelay: '900ms',
              whiteSpace: 'nowrap',
              opacity: 0.9,
              zIndex: 2,
            }}
          >
            {stampText}
          </Box>
        </Box>
      </Box>

      <Box
        className="krimi-anim-fade"
        sx={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          animationDelay: '1700ms',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {t('Tap to continue')}
        </Typography>
      </Box>
    </Box>
  );
}
