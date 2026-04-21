import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RoomQRCode } from 'react-gameroom';
import { useI18n } from '../../hooks/useI18n';

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

function generateDistressedCircle() {
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const bite = Math.random() < 0.3 ? Math.random() * 8 : 0;
    const r = 50 - bite;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

interface CasePolaroidProps {
  roomId: string;
  joinUrl: string;
  /** 0 for lobby (no rounds crossed). 1–3 in-game (rounds ≤ currentRound are crossed). */
  currentRound: number;
}

export default function CasePolaroid({ roomId, joinUrl, currentRound }: CasePolaroidProps) {
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
              {r <= currentRound && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      bgcolor: 'var(--evidence-color)',
                      transform: 'rotate(-25deg)',
                      transformOrigin: 'center',
                      clipPath: crossClipPaths[r - 1][0],
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-4px',
                      right: '-4px',
                      height: '3px',
                      bgcolor: 'var(--evidence-color)',
                      transform: 'rotate(25deg)',
                      transformOrigin: 'center',
                      clipPath: crossClipPaths[r - 1][1],
                    }}
                  />
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
