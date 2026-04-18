import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';


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
        width: 200,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Box
        sx={{
          bgcolor: '#faf5e8',
          width: 200,
          height: 200,
          p: 2,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          filter: 'sepia(0.05)',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Caveat Brush", cursive',
            fontSize: '1.1rem',
            color: 'var(--text-color)',
            textDecoration: isWrong ? 'line-through' : 'none',
            textDecorationColor: 'var(--evidence-color)',
            textDecorationThickness: '2px',
            textAlign: 'center',
            '& span': {
              fontWeight: 'bold',
              textTransform: 'uppercase',
            },
          }}
        >
          <span>{accusedName}</span>
          <br />
          <span style={{ color: 'var(--weapon-color)' }}>{mean}</span>
          {' + '}
          <span style={{ color: 'var(--evidence-color)' }}>{evidenceKey}</span>
        </Typography>
        <Typography
          sx={{
            fontFamily: '"kingthings_trypewriter_2Rg", serif',
            fontSize: '0.75rem',
            color: 'var(--text-color)',
            position: 'absolute',
            bottom: 8,
            right: 16,
          }}
        >
          By {accuserName}
        </Typography>
      </Box>
    </Box>
  );
});

export default GuessNote;
