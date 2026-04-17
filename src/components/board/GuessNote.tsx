import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';

interface GuessNoteProps {
  accuserName: string;
  accusedName: string;
  mean: string;
  evidenceKey: string;
  isWrong: boolean;
  rotation: number;
  moLabel: string;
  keyEvidenceLabel: string;
  saidThatLabel: string;
  didItLabel: string;
}

const GuessNote = forwardRef<HTMLDivElement, GuessNoteProps>(function GuessNote(
  {
    accuserName,
    accusedName,
    mean,
    evidenceKey,
    isWrong,
    rotation,
    moLabel,
    keyEvidenceLabel,
    saidThatLabel,
    didItLabel,
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: 180,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Pushpin color="#d4a437" />

      <Box
        sx={{
          bgcolor: '#faf5e8',
          p: 1.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          filter: 'sepia(0.05)',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#5f6c7b',
            textDecoration: isWrong ? 'line-through' : 'none',
            textDecorationColor: '#cc3333',
            textDecorationThickness: '2px',
          }}
        >
          {accuserName} {saidThatLabel} {accusedName} {didItLabel}, {moLabel}{' '}
          {mean} {keyEvidenceLabel} {evidenceKey}
        </Typography>
      </Box>
    </Box>
  );
});

export default GuessNote;
