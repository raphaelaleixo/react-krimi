import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { PlayerScreen } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import Detective from '../components/Detective';
import ForensicAnalysis from '../components/ForensicAnalysis';
import PickPhase from '../components/PickPhase';
import PlayerHeader from '../components/board/PlayerHeader';
import { isRolesRevealed } from '../utils/rules';

export default function Player() {
  const { id, playerId: playerIdParam } = useParams<{ id: string; playerId: string }>();
  const { roomState, gameState, loading, loadRoom } = useGame();
  const { t, setLang } = useI18n();
  const playerId = Number(playerIdParam);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  useEffect(() => {
    if (gameState?.lang) {
      setLang(gameState.lang);
    }
  }, [gameState?.lang, setLang]);

  if (loading || !roomState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const notFound = (
    <Container sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography>Player not found in this game.</Typography>
    </Container>
  );

  return (
    <PlayerScreen
      roomState={roomState}
      playerId={playerId}
      labels={{ invalidSlot: 'Player not found in this game.' }}
      renderHeader={() => null}
      renderEmpty={() => notFound}
      renderReady={() => (
        <>
          <PlayerHeader roomState={roomState} playerId={playerId} gameState={gameState} />
          <Container sx={{ height: '100vh' }}>
            <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {t('You are in room')}{' '}
                  <Box
                    component="code"
                    sx={{ color: 'error.main', textTransform: 'uppercase' }}
                  >
                    {roomState.roomId}
                  </Box>
                </Typography>
                <Typography variant="subtitle1">
                  {t('Waiting for the game start')}
                </Typography>
              </Grid>
            </Grid>
          </Container>
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
  );
}
