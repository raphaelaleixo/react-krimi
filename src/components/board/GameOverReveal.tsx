import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import RoleCard from './RoleCard';

export interface GameOverRevealProps {
  finished: boolean;
  murdererName: string;
}

const STAMP_RED = '#9E1B1B';

export default function GameOverReveal({ finished, murdererName }: GameOverRevealProps) {
  const { t } = useI18n();
  const [lastSeenFinished, setLastSeenFinished] = useState(finished);
  const [visible, setVisible] = useState(false);

  if (finished !== lastSeenFinished) {
    setLastSeenFinished(finished);
    if (finished && !lastSeenFinished) {
      setVisible(true);
    }
  }

  if (!visible) return null;

  const dismiss = () => setVisible(false);

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
        gap: 4,
        zIndex: 1300,
        cursor: 'pointer',
        px: 3,
      }}
    >
      <Box
        className="krimi-anim-stamp"
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
          animationDelay: '150ms',
        }}
      >
        {t('Case Closed')}
      </Box>

      <Box sx={{ width: { xs: '90%', sm: 320 }, animationDelay: '400ms' }}>
        <RoleCard playerName={murdererName} role="murderer" width="100%" />
      </Box>

      <Box
        className="krimi-anim-fade"
        sx={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          animationDelay: '1500ms',
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
