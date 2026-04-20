import { useState, useCallback } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';

export default function PlayerJoin() {
  const navigate = useNavigate();
  const { id: roomId = '' } = useParams<{ id: string }>();
  const { joinRoom } = useGame();
  const { t } = useI18n();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError(t('Enter your nickname:'));
      return;
    }
    setError('');

    try {
      const playerId = await joinRoom(roomId, nickname.trim());
      navigate(`/room/${roomId}/player/${playerId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error joining game';
      setError(message);
    }
  }, [joinRoom, nickname, navigate, roomId, t]);

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Game code')}
              value={roomId}
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
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                {t('Enter')}
              </StampButton>
            </Box>
          </Box>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
