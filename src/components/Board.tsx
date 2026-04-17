import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import CorkBoard from './board/CorkBoard';
import PolaroidCard from './board/PolaroidCard';
import ForensicSheet from './board/ForensicSheet';
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

        <ForensicSheet
          detectiveName={detectiveName}
          analysis={gameState.analysis}
          forensicAnalysis={gameState.forensicAnalysis}
          round={gameState.round}
          forensicScientistLabel={t('Forensic Scientist')}
        />
      </Box>
    </CorkBoard>
  );
}
