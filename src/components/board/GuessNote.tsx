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
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#333',
            textDecoration: isWrong ? 'line-through' : 'none',
            textDecorationColor: '#cc3333',
            textDecorationThickness: '2px',
            textAlign: 'center',
            '& span': {
              fontFamily: '"Permanent Marker", cursive',
            },
          }}
        >
          <span>{accuserName}</span> {saidThatLabel}{' '}
          <Box
            component="span"
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: -2,
                right: -2,
                bottom: -1,
                height: 3,
                bgcolor: 'rgba(51,51,51,0.5)',
                transform: 'rotate(-1deg)',
                borderRadius: '2px',
              },
            }}
          >
            {accusedName}
          </Box>{' '}
          {didItLabel}, {moLabel}{' '}
          <span style={{ color: '#1565c0' }}>{mean}</span> {keyEvidenceLabel} <span style={{ color: '#c62828' }}>{evidenceKey}</span>
        </Typography>
      </Box>
    </Box>
  );
});

export default GuessNote;
