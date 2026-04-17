import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Pushpin from './Pushpin';

interface PolaroidCardProps {
  name: string;
  means: string[];
  clues: string[];
  rotation: number;
  offsetY: number;
  passedTurn?: boolean;
  passedTurnLabel: string;
}

export default function PolaroidCard({
  name,
  means,
  clues,
  rotation,
  offsetY,
  passedTurn,
  passedTurnLabel,
}: PolaroidCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        marginTop: `${offsetY}px`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <Pushpin />

      {/* Polaroid frame */}
      <Box
        sx={{
          bgcolor: '#fff',
          p: '10px',
          pb: '40px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
      >
        {/* Polaroid interior — yellowed paper */}
        <Box
          sx={{
            bgcolor: '#faf5e8',
            p: 1.5,
            filter: 'sepia(0.05)',
          }}
        >
          {passedTurn && (
            <Typography
              sx={{
                fontFamily: '"Shadows Into Light", cursive',
                fontSize: 16,
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {passedTurnLabel}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {means.map((mean) => (
              <Chip
                key={mean}
                label={mean}
                size="small"
                sx={{ bgcolor: '#bbdefb', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {clues.map((clue) => (
              <Chip
                key={clue}
                label={clue}
                size="small"
                sx={{ bgcolor: '#ffcdd2', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>

        {/* Player name — handwritten on polaroid border */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
