import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import BloodSplatters from './BloodSplatters';

export interface RoundTitleCardProps {
  round: number | undefined;
  detectiveName: string;
  durationMs?: number;
}

const EXIT_MS = 450;

export default function RoundTitleCard({
  round,
  detectiveName,
  durationMs = 8000,
}: RoundTitleCardProps) {
  const { t } = useI18n();
  const [lastSeenRound, setLastSeenRound] = useState<number | undefined>(round);
  const [visibleRound, setVisibleRound] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);

  if (round !== undefined && round !== lastSeenRound) {
    setLastSeenRound(round);
    if (lastSeenRound !== undefined) {
      setVisibleRound(round);
      setExiting(false);
    }
  }

  useEffect(() => {
    if (visibleRound === null) return;
    const holdMs = Math.max(0, durationMs - EXIT_MS);
    const exitTimer = window.setTimeout(() => setExiting(true), holdMs);
    const unmountTimer = window.setTimeout(() => {
      setVisibleRound(null);
      setExiting(false);
    }, durationMs);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [visibleRound, durationMs]);

  if (visibleRound === null) return null;

  const [messageBefore, messageAfter] = t(
    '{name}, please add a new forensic clue to every player.'
  ).split('{name}');

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        pointerEvents: 'none',
      }}
    >
      <Box
        key={visibleRound}
        className={exiting ? 'krimi-anim-tossed-out' : 'krimi-anim-tossed'}
        sx={{
          position: 'relative',
          px: { xs: 5, sm: 8 },
          py: { xs: 5, sm: 7 },
          minWidth: { xs: '82vw', sm: 520 },
          maxWidth: { xs: '92vw', sm: 640 },
          bgcolor: '#f5efe0',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          border: '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          overflow: 'hidden',
        }}
      >
        <BloodSplatters seed={visibleRound} />

        <Typography
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: { xs: '2.25rem', sm: '2.75rem' },
            lineHeight: 1,
            color: 'var(--weapon-color)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {t('Round {n}').replace('{n}', String(visibleRound))}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: { xs: '1rem', sm: '1.15rem' },
            color: 'var(--text-color)',
            textAlign: 'center',
            lineHeight: 1.5,
            position: 'relative',
          }}
        >
          {messageBefore}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {detectiveName}
          </Box>
          {messageAfter}
        </Typography>
      </Box>
    </Box>
  );
}
