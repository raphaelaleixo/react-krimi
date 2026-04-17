import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pushpin from './Pushpin';
import type { AnalysisItem } from '../../data/analysis';

function randomRotation() {
  return Math.floor(3 - Math.random() * 6);
}

interface ForensicSheetProps {
  detectiveName: string;
  analysis: AnalysisItem[];
  forensicAnalysis?: string[];
  round: number;
  forensicScientistLabel: string;
}

// Round 1 gets 6 clues, round 2+ gets 1 extra each
const ROUND_1_COUNT = 6;

export default function ForensicSheet({
  detectiveName,
  analysis,
  forensicAnalysis,
  round: _round,
  forensicScientistLabel,
}: ForensicSheetProps) {
  const gluedNoteRotations = useMemo(() => {
    if (!forensicAnalysis) return [];
    return forensicAnalysis.slice(ROUND_1_COUNT).map(() => randomRotation());
  }, [forensicAnalysis]);

  if (!forensicAnalysis || forensicAnalysis.length === 0) return null;

  const round1Items = forensicAnalysis.slice(0, ROUND_1_COUNT);
  const laterItems = forensicAnalysis.slice(ROUND_1_COUNT);

  return (
    <Box sx={{ position: 'relative', width: 340 }}>
      <Pushpin color="#4a7c59" />

      {/* Main sheet */}
      <Box
        sx={{
          bgcolor: '#f8f6f0',
          p: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          // Faint ruled lines
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)',
          backgroundPosition: '0 48px',
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontFamily: '"kingthings_trypewriter_2Rg", serif',
            fontSize: '1.4rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-color)',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          Forensic Analysis
        </Typography>

        {/* Detective signature */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Shadows Into Light", cursive',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--weapon-color)',
            }}
          >
            {detectiveName}
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
              fontFamily: '"kingthings_trypewriter_2Rg", serif',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              color: '#5f6c7b',
            }}
          >
            {forensicScientistLabel}
          </Typography>
        </Box>

        {/* Round 1 analysis items */}
        {round1Items.map((item, index) => (
          <Box key={index} sx={{ mb: 1.5 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"kingthings_trypewriter_2Rg", serif',
                fontSize: '1rem',
                color: 'var(--text-color)',
              }}
            >
              {index + 1}. {analysis[index]?.title}:{' '}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Shadows Into Light", cursive',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: 'var(--evidence-color)',
              }}
            >
              {item}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Glued-on notes for round 2/3 */}
      {laterItems.map((item, i) => {
        const index = ROUND_1_COUNT + i;
        const rotation = gluedNoteRotations[i] || 0;
        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              mt: -2,
              mx: 1,
              transform: `rotate(${rotation}deg)`,
              zIndex: 1 + i,
            }}
          >
            {/* Tape strip */}
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
              <Typography
                component="span"
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '1rem',
                  color: 'var(--text-color)',
                }}
              >
                {index + 1}. {analysis[index]?.title}:{' '}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: '"Shadows Into Light", cursive',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  color: 'var(--evidence-color)',
                }}
              >
                {item}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
