import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import { formatDisplayName } from '../../utils/formatDisplayName';

// Round 1 gets this many clues; subsequent rounds add one more each.
export const ROUND_1_COUNT = 6;

export function randomRotation() {
  return Math.floor(3 - Math.random() * 6);
}

interface SheetFrameProps {
  children: ReactNode;
}

export function SheetFrame({ children }: SheetFrameProps) {
  return (
    <Box sx={{ position: 'relative', width: 340 }}>
      <Pushpin color="#4a7c59" />
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

interface SheetHeaderProps {
  title: string;
  detectiveName: string;
  forensicScientistLabel: string;
}

export function SheetHeader({
  title,
  detectiveName,
  forensicScientistLabel,
}: SheetHeaderProps) {
  return (
    <>
      <Typography
        sx={{
          fontFamily: 'var(--font-typewriter)',
          fontSize: '1.4rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--text-color)',
          textAlign: 'center',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography
          component="span"
          title={detectiveName}
          sx={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75em',
            fontWeight: 'bold',
            color: 'var(--evidence-color)',
            display: 'inline-block',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatDisplayName(detectiveName)}
        </Typography>
        <Box
          sx={{
            borderTop: '1px dashed var(--text-color)',
            mt: 0.5,
            mx: 'auto',
            width: '60%',
          }}
        />
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            color: '#5f6c7b',
          }}
        >
          {forensicScientistLabel}
        </Typography>
      </Box>
    </>
  );
}

interface GluedNoteProps {
  rotation: number;
  zIndex: number;
  children: ReactNode;
}

export function GluedNote({ rotation, zIndex, children }: GluedNoteProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        mt: -2,
        mx: 1,
        transform: `rotate(${rotation}deg)`,
        zIndex,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4em',
          height: '1.2em',
          background: 'rgba(255, 245, 180, 0.5)',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.15)',
          zIndex: 2,
        }}
      />
      <Box
        sx={{
          bgcolor: '#faf5e8',
          p: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
