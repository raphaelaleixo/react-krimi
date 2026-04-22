import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useMotionVariants } from '../../motion/variants';

export interface RoundTitleCardProps {
  round: number | undefined;
  durationMs?: number;
}

export default function RoundTitleCard({ round, durationMs = 1200 }: RoundTitleCardProps) {
  const { t } = useI18n();
  const { tossed } = useMotionVariants();
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

  return (
    <AnimatePresence>
      {visibleRound !== null && (
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
            component={motion.div}
            key={visibleRound}
            variants={tossed}
            initial="initial"
            animate="animate"
            exit="exit"
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
      )}
    </AnimatePresence>
  );
}
