import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';

export interface RoundTitleCardProps {
  round: number | undefined;
  durationMs?: number;
}

export default function RoundTitleCard({ round, durationMs = 1200 }: RoundTitleCardProps) {
  const { t } = useI18n();
  const [lastSeenRound, setLastSeenRound] = useState<number | undefined>(round);
  const [visibleRound, setVisibleRound] = useState<number | null>(null);

  if (round !== undefined && round !== lastSeenRound) {
    setLastSeenRound(round);
    if (lastSeenRound !== undefined) {
      setVisibleRound(round);
    }
  }

  useEffect(() => {
    if (visibleRound === null) return;
    const timer = window.setTimeout(() => setVisibleRound(null), durationMs);
    return () => window.clearTimeout(timer);
  }, [visibleRound, durationMs]);

  if (visibleRound === null) return null;

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
        className="krimi-anim-tossed"
        sx={{
          px: 4,
          py: 3,
          bgcolor: '#f5efe0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          border: '1px solid rgba(0,0,0,0.12)',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--text-color)',
            textAlign: 'center',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          {t('Round {n}').replace('{n}', String(visibleRound))}
        </Typography>
      </Box>
    </Box>
  );
}
