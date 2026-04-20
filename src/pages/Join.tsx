import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { JoinGame } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import StampButton from '../components/board/StampButton';

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

  if (prefilledRoom) {
    return (
      <BoardSurface>
        <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
          <CaseFile>
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
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                  {t('Enter')}
                </StampButton>
              </Box>
            </Box>
          </CaseFile>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PinnedNote rotation={-2} pinColor="#3A7085" component={RouterLink} to="/">
              {t('Back')}
            </PinnedNote>
          </Box>
        </Container>
      </BoardSurface>
    );
  }

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
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
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PinnedNote rotation={-2} pinColor="#3A7085" component={RouterLink} to="/">
            {t('Back')}
          </PinnedNote>
        </Box>
      </Container>
    </BoardSurface>
  );
}
