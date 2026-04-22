import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { RoomQRCode } from 'react-gameroom';
import { useI18n } from '../../hooks/useI18n';
import { generateDistressedCircle } from './distressedStamp';

function generateDistressedLine() {
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const topBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    const bottomBite = Math.random() < 0.35 ? Math.random() * 30 : 0;
    topPoints.push(`${x.toFixed(1)}% ${topBite.toFixed(1)}%`);
    bottomPoints.unshift(`${x.toFixed(1)}% ${(100 - bottomBite).toFixed(1)}%`);
  }
  return `polygon(${[...topPoints, ...bottomPoints].join(', ')})`;
}

interface CasePolaroidProps {
  roomId: string;
  joinUrl: string;
  /** How many round stamps to cross out (0–3). A round is crossed once its forensic analysis is submitted. */
  crossedRounds: number;
}

export default function CasePolaroid({ roomId, joinUrl, crossedRounds }: CasePolaroidProps) {
  const { t } = useI18n();

  const stampClipPaths = useMemo(
    () => [generateDistressedCircle(), generateDistressedCircle(), generateDistressedCircle()],
    [],
  );

  const crossClipPaths = useMemo(
    () => [
      [generateDistressedLine(), generateDistressedLine()],
      [generateDistressedLine(), generateDistressedLine()],
      [generateDistressedLine(), generateDistressedLine()],
    ],
    [],
  );

  return (
    <Box
      component="a"
      href={joinUrl}
      target="_blank"
      sx={{
        mb: 3,
        display: 'block',
        textDecoration: 'none',
        transform: 'rotate(2deg)',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'rotate(0deg) scale(1.03)' },
      }}
    >
      <Box
        sx={{
          bgcolor: '#f5f5f0',
          p: 1.5,
          pb: 4,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e0ddd5',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            '& svg': { width: 150, height: 150, display: 'block' },
          }}
        >
          <RoomQRCode roomId={roomId} url={joinUrl} size={150} />
        </Box>
        <Typography
          sx={{
            fontFamily: 'var(--font-typewriter)',
            fontSize: '2.2rem',
            color: 'var(--text-color)',
            textAlign: 'center',
            mt: 1.5,
            fontWeight: 'bold',
            letterSpacing: '-1px',
          }}
        >
          {t('Case')}#{roomId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mt: -0.5, justifyContent: 'center' }}>
          {[1, 2, 3].map((r) => (
            <Box
              key={r}
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                border: '3px solid',
                borderColor: 'var(--weapon-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${[-8, 3, -5][r - 1]}deg)`,
                clipPath: stampClipPaths[r - 1],
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: 'var(--weapon-color)',
                  lineHeight: 1,
                }}
              >
                {r}
              </Typography>
              {r <= crossedRounds && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      transform: 'rotate(-25deg)',
                      transformOrigin: 'center',
                    }}
                  >
                    <Box
                      component={motion.div}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.18, ease: [0.5, 0, 0.2, 1] }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'var(--evidence-color)',
                        transformOrigin: 'left center',
                        clipPath: crossClipPaths[r - 1][0],
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      transform: 'rotate(25deg)',
                      transformOrigin: 'center',
                    }}
                  >
                    <Box
                      component={motion.div}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.18, delay: 0.16, ease: [0.5, 0, 0.2, 1] }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'var(--evidence-color)',
                        transformOrigin: 'left center',
                        clipPath: crossClipPaths[r - 1][1],
                      }}
                    />
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
