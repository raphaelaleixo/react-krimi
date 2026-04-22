import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useMotionVariants } from '../../motion/variants';

export interface GuessUnlockedStampProps {
  label: string;
}

const STAMP_RED = '#9E1B1B';

export default function GuessUnlockedStamp({ label }: GuessUnlockedStampProps) {
  const { pinned } = useMotionVariants();

  return (
    <Box
      component={motion.div}
      variants={pinned}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ rotate: -3 }}
      sx={{
        display: 'inline-block',
        color: STAMP_RED,
        border: `4px solid ${STAMP_RED}`,
        borderRadius: 1,
        px: 2,
        py: 0.75,
        fontFamily: 'var(--font-typewriter)',
        fontWeight: 700,
        fontSize: '1.25rem',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        bgcolor: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <Typography component="span" sx={{ fontFamily: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}>
        {label}
      </Typography>
    </Box>
  );
}
