import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';

interface LobbyWaitingNoteProps {
  remaining: number;    // minPlayers - readyPlayers.length, clamped to >= 0
  canStart: boolean;
}

const loadingDrop = keyframes`
  0% { text-shadow:
    calc( 0 * var(--w)) -1.2em currentColor, calc(-1 * var(--w)) -1.2em currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  4% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) -1.2em currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  8% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) -1.2em currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  12% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) -1.2em currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  16% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) -1.2em currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  20% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) -1.2em currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  24% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) -1.2em currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  28% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) -1.2em currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  32% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) -1.2em currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  36% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) -1.2em currentColor; }
  40%, 60% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) 0 currentColor; }
  64% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 0 currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  68% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 0 currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  72% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 0 currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  76% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 0 currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  80% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 0 currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  84% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 0 currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  88% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 0 currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  92% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 0 currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  96% { text-shadow:
    calc( 0 * var(--w)) 0 currentColor, calc(-1 * var(--w)) 1.2em currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
  100% { text-shadow:
    calc( 0 * var(--w)) 1.2em currentColor, calc(-1 * var(--w)) 1.2em currentColor, calc(-2 * var(--w)) 1.2em currentColor, calc(-3 * var(--w)) 1.2em currentColor, calc(-4 * var(--w)) 1.2em currentColor,
    calc(-5 * var(--w)) 1.2em currentColor, calc(-6 * var(--w)) 1.2em currentColor, calc(-7 * var(--w)) 1.2em currentColor, calc(-8 * var(--w)) 1.2em currentColor, calc(-9 * var(--w)) 1.2em currentColor; }
`;

export default function LobbyWaitingNote({ remaining, canStart }: LobbyWaitingNoteProps) {
  const { t } = useI18n();

  const headline = t('Waiting...');
  const subtitle = canStart
    ? t('We can start the game now')
    : t('Waiting for {n} more…').replace('{n}', String(remaining));

  return (
    <Box
      sx={{
        position: 'relative',
        width: 260,
        mx: 'auto',
        mt: 4,
        bgcolor: '#f8f6f0',
        color: 'var(--text-color)',
        px: 3,
        py: 2.5,
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}
    >
      <Pushpin color="#4a7c59" />

      <Box
        component="span"
        aria-label={headline}
        sx={{
          '--w': '1ch',
          display: 'inline-block',
          fontFamily: 'var(--font-typewriter)',
          fontSize: '2rem',
          lineHeight: 1.2,
          fontWeight: 'bold',
          letterSpacing: 'var(--w)',
          width: 'calc(var(--w) * 10)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          color: 'transparent',
          animation: `${loadingDrop} 2s infinite`,
          '&::before': {
            content: 'attr(data-text)',
          },
        }}
        data-text={headline}
      />

      <Typography
        aria-live="polite"
        sx={{
          mt: 1,
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.9rem',
          letterSpacing: '1px',
          color: '#5f6c7b',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
