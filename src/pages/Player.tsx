import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import Detective from '../components/Detective';
import ForensicAnalysis from '../components/ForensicAnalysis';

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

  // Before game starts — waiting screen
  if (!gameState?.started) {
    return (
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
    );
  }

  // After game starts — determine role
  const playerOrderIndex = gameState.playerOrder.indexOf(playerId);
  if (playerOrderIndex === -1) {
    return (
      <Container sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Player not found in this game.</Typography>
      </Container>
    );
  }

  // Detective (forensic scientist) sees forensic analysis view
  if (playerOrderIndex === gameState.detective) {
    return <ForensicAnalysis gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
  }

  // Everyone else sees investigator/murderer view
  return <Detective gameState={gameState} playerId={playerId} playerOrderIndex={playerOrderIndex} />;
}
