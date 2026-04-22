import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import { useDirectionalNavigate } from '../router/useDirectionalNavigate';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import TapedNoteButton from '../components/board/TapedNoteButton';
import StampButton from '../components/board/StampButton';

export default function PlayerJoin() {
  const navigate = useDirectionalNavigate();
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
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Case')}#{roomId}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('Enter your nickname for the case file.')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
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
              variant="standard"
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 700,
                },
                '& .MuiInput-input': {
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.75rem',
                  color: '#1C1B1B',
                },
              }}
              required
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          fontFamily: 'var(--font-script)',
                          fontSize: '1.75rem',
                          color: '#1E3A8A',
                          opacity: 0.7,
                          lineHeight: 1,
                        }}
                      >
                        x
                      </Box>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
                htmlInput: { autoComplete: 'off' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <StampButton variant="primary" type="submit" disabled={!nickname.trim()}>
                {t('Enter')}
              </StampButton>
            </Box>
          </Box>
        </CaseFile>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TapedNoteButton rotation={-2} component={RouterLink} to="/">
            {t('Back')}
          </TapedNoteButton>
        </Box>
      </Container>
    </BoardSurface>
  );
}
