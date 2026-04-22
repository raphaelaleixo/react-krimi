import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Pushpin from './Pushpin';
import { useI18n } from '../../hooks/useI18n';
import { formatDisplayName } from '../../utils/formatDisplayName';

export interface RoleCardProps {
  playerName: string;
  role: 'detective' | 'murderer';
  width?: number | string;
}

export default function RoleCard({ playerName, role, width = 260 }: RoleCardProps) {
  const { t } = useI18n();
  const isMurderer = role === 'murderer';

  return (
    <Box
      component={motion.div}
      initial={{ scale: 0.6, rotate: -8, opacity: 0, y: -20 }}
      animate={{ scale: 1, rotate: -2, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      sx={{
        position: 'relative',
        width,
        mx: 'auto',
        bgcolor: '#f5efe0',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
        px: 3,
        py: 2.5,
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <Pushpin color={isMurderer ? 'var(--evidence-color)' : '#3a4b5c'} />

      <Typography
        title={playerName}
        sx={{
          fontFamily: 'var(--font-script)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-color)',
          lineHeight: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatDisplayName(playerName)}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontFamily: 'var(--font-typewriter)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center',
          color: isMurderer ? 'var(--evidence-color)' : 'var(--text-color)',
        }}
      >
        {isMurderer ? t('The Murderer') : t('Private Detective')}
      </Typography>
    </Box>
  );
}
