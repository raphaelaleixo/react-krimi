import { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import CorkBoard from './board/CorkBoard';
import PolaroidCard from './board/PolaroidCard';
import { useI18n } from '../hooks/useI18n';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

export default function Board() {
  const { gameState } = useGame();
  const { t } = useI18n();

  // Memoize random rotations so they don't change on re-render
  const cardRotations = useMemo(() => {
    if (!gameState) return {};
    const rotations: Record<number, { card: number; stamp: number }> = {};
    gameState.playerOrder.forEach((pid) => {
      rotations[pid] = { card: randomRotation(), stamp: randomRotation() };
    });
    return rotations;
  }, [gameState?.playerOrder]);

  const cardOffsets = useMemo(() => {
    if (!gameState) return {};
    const offsets: Record<number, number> = {};
    gameState.playerOrder.forEach((pid) => {
      offsets[pid] = Math.floor(Math.random() * 20) - 10;
    });
    return offsets;
  }, [gameState?.playerOrder]);

  const analysisRotations = useMemo(() => {
    if (!gameState?.forensicAnalysis) return [];
    return gameState.forensicAnalysis.map(() => randomRotation());
  }, [gameState?.forensicAnalysis]);

  if (!gameState) return null;

  const suspects = gameState.playerOrder
    .map((pid, idx) => ({ id: pid, index: idx, name: gameState.playerNames[pid] }))
    .filter((p) => p.index !== gameState.detective);

  const detectiveName =
    gameState.playerNames[gameState.playerOrder[gameState.detective]] || 'Detective';

  return (
    <CorkBoard>
      <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
        <Box sx={{ flex: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h2">
                {t('Game')}{' '}
                <Box
                  component="code"
                  sx={{ color: 'error.main', textTransform: 'uppercase' }}
                >
                  {gameState.playerOrder.length > 0 ? '' : ''}
                </Box>
                <Typography component="small" sx={{ ml: { lg: 4 }, fontSize: '0.5em' }}>
                  {t('Round')} {gameState.round} {t('of')} 3
                </Typography>
              </Typography>
              <Typography variant="h4" sx={{ my: 4 }}>
                {t('Suspects of the crime:')}
              </Typography>
            </Box>

            {suspects.map((player) => {
              const rotation = cardRotations[player.id]?.card || 0;
              const offsetY = cardOffsets[player.id] || 0;
              const playerMeans = gameState.means.slice(player.index * 4, player.index * 4 + 4);
              const playerClues = gameState.clues.slice(player.index * 4, player.index * 4 + 4);

              return (
                <Box key={player.id} sx={{ width: 220 }}>
                  <PolaroidCard
                    name={player.name}
                    means={playerMeans}
                    clues={playerClues}
                    rotation={rotation}
                    offsetY={offsetY}
                    passedTurn={gameState.passedTurns?.[player.index]}
                    passedTurnLabel={t('Passed this turn')}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Analysis sidebar */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>
            {t('Analysis')}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"Shadows Into Light", cursive',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.25em',
                  color: '#3da9fc',
                  letterSpacing: 0,
                }}
              >
                {detectiveName}
              </Box>
              <Box
                component="span"
                sx={{
                  fontFamily: '"kingthings_trypewriter_2Rg", serif',
                  fontSize: '0.5em',
                  lineHeight: 1.2,
                  wordSpacing: '5px',
                  borderTop: '1px dashed #094067',
                }}
              >
                {t('Forensic Scientist')}
              </Box>
            </Box>
          </Typography>

          {gameState.forensicAnalysis &&
            gameState.forensicAnalysis.map((item, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  transform: `rotate(${analysisRotations[index] || 0}deg)`,
                }}
              >
                <CardContent>
                  <Box
                    component="strong"
                    sx={{
                      fontFamily: '"kingthings_trypewriter_2Rg", serif',
                      mr: 1,
                    }}
                  >
                    {index + 1} {gameState.analysis[index]?.title}:
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontFamily: '"Shadows Into Light", cursive',
                      fontWeight: 'bold',
                      fontSize: '1.5em',
                      color: '#3da9fc',
                      display: 'inline-block',
                    }}
                  >
                    {item}
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </Box>
    </CorkBoard>
  );
}
