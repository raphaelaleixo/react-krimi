import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { JoinGame } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';

export default function Join() {
  const navigate = useNavigate();
  const { id: routeRoomId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { joinRoom } = useGame();
  const { t } = useI18n();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [prefilledRoom, setPrefilledRoom] = useState('');

  useEffect(() => {
    const room = routeRoomId || searchParams.get('room');
    if (room) setPrefilledRoom(room);
  }, [routeRoomId, searchParams]);

  const handleJoin = useCallback(async (roomCode: string) => {
    if (!nickname.trim()) {
      setError(t('Enter your nickname:'));
      return;
    }
    setError('');

    try {
      const playerId = await joinRoom(roomCode.trim(), nickname.trim());
      navigate(`/room/${roomCode.trim()}/player/${playerId}`);
    } catch (err: any) {
      setError(err.message || 'Error joining game');
    }
  }, [joinRoom, nickname, navigate, t]);

  // If we have a prefilled room code, use a simple form instead of JoinGame
  if (prefilledRoom) {
    return (
      <Container sx={{ height: '100vh' }}>
        <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleJoin(prefilledRoom); }}>
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                label={t('Game code')}
                value={prefilledRoom}
                fullWidth
                variant="filled"
                sx={{ mb: 2 }}
                disabled
              />
              <TextField
                label={t('Nickname')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                fullWidth
                variant="filled"
                sx={{ mb: 3 }}
                required
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  sx={{ bgcolor: 'grey.100', color: 'text.primary', '&:hover': { bgcolor: 'grey.200' } }}
                  size="large"
                >
                  {t('Back')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  size="large"
                  disabled={!nickname.trim()}
                >
                  {t('Enter')}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container sx={{ height: '100vh' }}>
      <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label={t('Nickname')}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            fullWidth
            variant="filled"
            sx={{ mb: 3 }}
            required
          />
          <JoinGame
            onJoin={handleJoin}
            className="krimi-join-game"
            labels={{
              label: t('Game code'),
              placeholder: t('Game code'),
              submit: t('Enter'),
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              sx={{ bgcolor: 'grey.100', color: 'text.primary', '&:hover': { bgcolor: 'grey.200' } }}
              size="large"
            >
              {t('Back')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
