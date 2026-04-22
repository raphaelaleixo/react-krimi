import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useMotionVariants } from '../../motion/variants';
import RoleCard from './RoleCard';

export interface GameOverRevealProps {
  finished: boolean;
  murdererName: string;
}

const STAMP_RED = '#9E1B1B';

export default function GameOverReveal({ finished, murdererName }: GameOverRevealProps) {
  const { t } = useI18n();
  const { pinned, reduced } = useMotionVariants();
  const [lastSeenFinished, setLastSeenFinished] = useState(finished);
  const [visible, setVisible] = useState(false);

  if (finished !== lastSeenFinished) {
    setLastSeenFinished(finished);
    if (finished && !lastSeenFinished) {
      setVisible(true);
    }
  }

  const dismiss = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <Box
          component={motion.div}
          key="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            zIndex: 1300,
            cursor: 'pointer',
            px: 3,
          }}
        >
          <Box
            component={motion.div}
            variants={pinned}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ delay: reduced ? 0 : 0.15 }}
            style={{ rotate: -4 }}
            sx={{
              color: STAMP_RED,
              border: `6px solid ${STAMP_RED}`,
              borderRadius: 1,
              px: 4,
              py: 2,
              fontFamily: 'var(--font-typewriter)',
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '3rem' },
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            {t('Case Closed')}
          </Box>

          <Box
            component={motion.div}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.1 : 0.4, duration: 0.4 }}
            sx={{ width: { xs: '90%', sm: 320 } }}
          >
            <RoleCard playerName={murdererName} role="murderer" width="100%" />
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0.2 : 1.5, duration: 0.3 }}
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              textAlign: 'center',
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
      )}
    </AnimatePresence>
  );
}
