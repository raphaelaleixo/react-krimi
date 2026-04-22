import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import { isRolesRevealed } from '../utils/rules';
import CorkBoard from './board/CorkBoard';
import ForensicSheetFillable from './board/ForensicSheetFillable';
import PlayerFolder from './board/PlayerFolder';
import Pushpin from './board/Pushpin';
import WaitingNote from './board/WaitingNote';
import type { KrimiGameState } from '../types';

interface ForensicAnalysisProps {
  gameState: KrimiGameState;
  playerId: number;
  playerOrderIndex: number;
}

export default function ForensicAnalysis({ gameState, playerId }: ForensicAnalysisProps) {
  const { setAnalysis } = useGame();
  const { t } = useI18n();

  const playerName = gameState.playerNames[playerId] || `Player ${playerId}`;

  const murderer = useMemo(() => {
    const murdererOrderIndex = gameState.murderer;
    const murdererPlayerId = gameState.playerOrder[murdererOrderIndex];
    return {
      orderIndex: murdererOrderIndex,
      name: gameState.playerNames[murdererPlayerId] ?? '',
    };
  }, [gameState]);

  const murdererMeans = useMemo(
    () => gameState.means.slice(murderer.orderIndex * 4, murderer.orderIndex * 4 + 4),
    [gameState.means, murderer.orderIndex],
  );
  const murdererClues = useMemo(
    () => gameState.clues.slice(murderer.orderIndex * 4, murderer.orderIndex * 4 + 4),
    [gameState.clues, murderer.orderIndex],
  );

  const rolesRevealed = isRolesRevealed(gameState);

  return (
    <CorkBoard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          px: 2,
          py: 5,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        {rolesRevealed && gameState.murdererChoice ? (
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Pushpin color="var(--evidence-color)" />
            <PlayerFolder
              playerName={murderer.name}
              means={murdererMeans}
              clues={murdererClues}
              mode="display"
              selectedMean={gameState.murdererChoice.mean}
              selectedKey={gameState.murdererChoice.key}
              tabSubtitle={t('Murderer')}
            />
          </Box>
        ) : (
          <WaitingNote
            subtitle={t('Waiting for all players to submit their picks...')}
            width={340}
          />
        )}

        <ForensicSheetFillable
          analysis={gameState.analysis}
          availableClues={gameState.availableClues}
          forensicAnalysis={gameState.forensicAnalysis}
          detectiveName={playerName}
          onSubmit={setAnalysis}
          disabled={!rolesRevealed}
        />
      </Box>
    </CorkBoard>
  );
}
