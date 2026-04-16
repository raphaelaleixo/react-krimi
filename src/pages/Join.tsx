import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';

export default function Join() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinRoom } = useGame();
  const { t } = useI18n();

  const [gameId, setGameId] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const room = searchParams.get('room');
    if (room) setGameId(room);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim() || !nickname.trim()) return;
    setDisabled(true);
    setError('');

    try {
      const playerId = await joinRoom(gameId.trim(), nickname.trim());
      navigate(`/room/${gameId.trim()}/player/${playerId}`);
    } catch (err: any) {
      setError(err.message || 'Error joining game');
      setDisabled(false);
    }
  };

  return (
    <Container sx={{ height: '100vh' }}>
      <Grid container sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Game code')}
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              fullWidth
              variant="filled"
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label={t('Nickname')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              variant="filled"
              sx={{ mb: 3 }}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'grey.200' },
                }}
                size="large"
              >
                {t('Back')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                size="large"
                disabled={disabled || !gameId.trim() || !nickname.trim()}
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
