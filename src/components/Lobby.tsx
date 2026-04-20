import { useState, useCallback, useMemo } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import Box from '@mui/material/Box';
import {
  RoomQRCode,
  PlayerSlotView,
  buildJoinUrl,
  buildPlayerUrl,
  useRoomState,
} from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';

export default function Lobby() {
  const { roomState, startTheGame } = useGame();
  const { t } = useI18n();
  const [activeDetective, setActiveDetective] = useState(0);
  const [snackbar, setSnackbar] = useState(false);

  const { canStart, readyPlayers } = useRoomState(roomState!);

  const playerCount = useMemo(() => {
    if (readyPlayers.length === 0) return t('No players joined yet.');
    if (readyPlayers.length === 1) return `${readyPlayers.length} ${t('player joined.')}`;
    return `${readyPlayers.length} ${t('players joined.')}`;
  }, [readyPlayers.length, t]);

  const joinUrl = useMemo(
    () => buildJoinUrl(roomState?.roomId || ''),
    [roomState?.roomId]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
    setSnackbar(true);
  }, [joinUrl]);

  const handleStart = useCallback(async () => {
    await startTheGame(activeDetective);
  }, [startTheGame, activeDetective]);

  if (!roomState) return null;

  return (
    <Container sx={{ height: '100vh' }}>
      <Grid container sx={{ height: '100%', alignItems: 'center' }}>
        <Grid
          size={{ xs: 12, md: 5 }}
          offset={{ lg: 2, xl: 3 }}
          sx={{ mt: 10 }}
        >
          <Typography variant="h2" component="h2">
            {t('Lobby for room')}{' '}
            <Box
              component="code"
              sx={{ color: 'error.main', textTransform: 'uppercase' }}
            >
              {roomState.roomId}
            </Box>
          </Typography>
          <Typography variant="subtitle1" sx={{ my: 4 }}>
            {t('Waiting for players')}. {playerCount}
          </Typography>
          <LinearProgress
            color="error"
            sx={{ mb: 2, borderRadius: 1 }}
          />

          {/* Player list using react-gameroom PlayerSlotView + detective badge */}
          <Card>
            <CardContent>
              {readyPlayers.map((slot, index) => (
                <Box
                  key={slot.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: index < readyPlayers.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '& a': {
                      color: 'text.primary',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-typewriter)',
                    },
                  }}
                >
                  <PlayerSlotView
                    slot={slot}
                    href={buildPlayerUrl(roomState.roomId, slot.id)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setActiveDetective(index)}
                    sx={{
                      color: index === activeDetective ? 'secondary.main' : 'grey.400',
                    }}
                  >
                    <LocalPoliceIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{ mt: 4, px: 4, py: 1.5 }}
            disabled={!canStart}
            onClick={handleStart}
          >
            {t('Start game')}
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 3, xl: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ '& svg': { maxWidth: '100%', height: 'auto' } }}>
                <RoomQRCode
                  roomId={roomState.roomId}
                  url={joinUrl}
                  size={250}
                />
              </Box>
              <Button
                onClick={handleCopy}
                fullWidth
                sx={{ mt: 2, color: 'error.main' }}
              >
                {t('Copy game url')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
        message={t('URL Copied')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
}
