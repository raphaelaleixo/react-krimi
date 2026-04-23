import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { PlayerScreen } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import Detective from '../components/Detective';
import ForensicAnalysis from '../components/ForensicAnalysis';
import PickPhase from '../components/PickPhase';
import CorkBoard from '../components/board/CorkBoard';
import PlayerHeader from '../components/board/PlayerHeader';
import WaitingNote from '../components/board/WaitingNote';
import { isRolesRevealed } from '../utils/rules';
import RoundTitleCard from '../components/board/RoundTitleCard';
import GameOverReveal from '../components/board/GameOverReveal';

export default function Player() {
  const { id, playerId: playerIdParam } = useParams<{ id: string; playerId: string }>();
  const { roomState, gameState, loading, loadRoom } = useGame();
  const { t } = useI18n();
  const playerId = Number(playerIdParam);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (loading || !roomState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const slotExists = roomState.players.some((p) => p.id === playerId);
  if (!slotExists) {
    return <Navigate to={`/room/${id}/player`} replace />;
  }
  const notFound = <Navigate to={`/room/${id}/player`} replace />;

  const murdererName = gameState
    ? gameState.playerNames[gameState.playerOrder[gameState.murderer]] || ''
    : '';
  const detectiveName = gameState
    ? gameState.playerNames[gameState.playerOrder[gameState.detective]] || ''
    : '';

  return (
    <>
      <PlayerScreen
        roomState={roomState}
        playerId={playerId}
        labels={{ invalidSlot: 'Player not found in this game.' }}
        renderHeader={() => null}
        renderEmpty={() => notFound}
        renderReady={() => (
          <>
            <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
            <CorkBoard>
              <WaitingNote subtitle={t('Waiting for the game start')} />
            </CorkBoard>
          </>
        )}
        renderStarted={() => {
          if (!gameState) return null;
          const playerOrderIndex = gameState.playerOrder.indexOf(playerId);
          if (playerOrderIndex === -1) return notFound;
          let child;
          if (playerOrderIndex === gameState.detective) {
            child = <ForensicAnalysis gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
          } else if (!isRolesRevealed(gameState)) {
            child = <PickPhase gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
          } else {
            child = <Detective gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
          }
          return (
            <>
              <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
              {child}
            </>
          );
        }}
      />
      {gameState && (
        <>
          <RoundTitleCard round={gameState.round} detectiveName={detectiveName} />
          <GameOverReveal
            finished={gameState.finished}
            roomId={roomState.roomId}
            winner={gameState.winner}
            murdererName={murdererName}
            murdererMeans={gameState.means.slice(
              gameState.murderer * 4,
              gameState.murderer * 4 + 4,
            )}
            murdererClues={gameState.clues.slice(
              gameState.murderer * 4,
              gameState.murderer * 4 + 4,
            )}
            murdererChoice={gameState.murdererChoice}
          />
        </>
      )}
    </>
  );
}
