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
    calc( 0 * var(--w)) -1.2em var(--text-color), calc(-1 * var(--w)) -1.2em var(--text-color), calc(-2 * var(--w)) -1.2em var(--text-color), calc(-3 * var(--w)) -1.2em var(--text-color), calc(-4 * var(--w)) -1.2em var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  4% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) -1.2em var(--text-color), calc(-2 * var(--w)) -1.2em var(--text-color), calc(-3 * var(--w)) -1.2em var(--text-color), calc(-4 * var(--w)) -1.2em var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  8% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) -1.2em var(--text-color), calc(-3 * var(--w)) -1.2em var(--text-color), calc(-4 * var(--w)) -1.2em var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  12% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) -1.2em var(--text-color), calc(-4 * var(--w)) -1.2em var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  16% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) -1.2em var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  20% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) -1.2em var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  24% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) -1.2em var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  28% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) -1.2em var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  32% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 0 var(--text-color), calc(-8 * var(--w)) -1.2em var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  36% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 0 var(--text-color), calc(-8 * var(--w)) 0 var(--text-color), calc(-9 * var(--w)) -1.2em var(--text-color); }
  40%, 60% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 0 var(--text-color), calc(-8 * var(--w)) 0 var(--text-color), calc(-9 * var(--w)) 0 var(--text-color); }
  64% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 0 var(--text-color), calc(-8 * var(--w)) 0 var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  68% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 0 var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  72% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 0 var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  76% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 0 var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  80% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 0 var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  84% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 0 var(--text-color), calc(-4 * var(--w)) 1.2em var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  88% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 0 var(--text-color), calc(-3 * var(--w)) 1.2em var(--text-color), calc(-4 * var(--w)) 1.2em var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  92% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 0 var(--text-color), calc(-2 * var(--w)) 1.2em var(--text-color), calc(-3 * var(--w)) 1.2em var(--text-color), calc(-4 * var(--w)) 1.2em var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  96% { text-shadow:
    calc( 0 * var(--w)) 0 var(--text-color), calc(-1 * var(--w)) 1.2em var(--text-color), calc(-2 * var(--w)) 1.2em var(--text-color), calc(-3 * var(--w)) 1.2em var(--text-color), calc(-4 * var(--w)) 1.2em var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
  100% { text-shadow:
    calc( 0 * var(--w)) 1.2em var(--text-color), calc(-1 * var(--w)) 1.2em var(--text-color), calc(-2 * var(--w)) 1.2em var(--text-color), calc(-3 * var(--w)) 1.2em var(--text-color), calc(-4 * var(--w)) 1.2em var(--text-color),
    calc(-5 * var(--w)) 1.2em var(--text-color), calc(-6 * var(--w)) 1.2em var(--text-color), calc(-7 * var(--w)) 1.2em var(--text-color), calc(-8 * var(--w)) 1.2em var(--text-color), calc(-9 * var(--w)) 1.2em var(--text-color); }
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
          '--w': '10ch',
          display: 'inline-block',
          fontFamily: 'var(--font-typewriter)',
          fontSize: '2rem',
          lineHeight: 1.2,
          fontWeight: 'bold',
          letterSpacing: 'var(--w)',
          width: 'var(--w)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          color: 'transparent',
          animation: `${loadingDrop} 2s infinite`,
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            color: 'var(--text-color)',
            letterSpacing: 'normal',
            width: 'auto',
          },
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
