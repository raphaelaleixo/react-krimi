import { useState, useCallback, type FormEvent } from 'react';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import { useDirectionalNavigate } from '../router/useDirectionalNavigate';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useI18n } from '../hooks/useI18n';
import { getRoomStatus } from '../utils/roomStatus';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import TapedNoteButton from '../components/board/TapedNoteButton';
import StampButton from '../components/board/StampButton';

type SubmittingRole = 'host' | 'player' | null;

export default function Join() {
  const navigate = useDirectionalNavigate();
  const { t } = useI18n();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<SubmittingRole>(null);
  const [pendingHostCode, setPendingHostCode] = useState<string | null>(null);

  const trimmed = code.trim();
  const disabled = submitting !== null || trimmed.length === 0;

  const resolveStatus = useCallback(async (role: SubmittingRole) => {
    setError('');
    setSubmitting(role);
    const status = await getRoomStatus(trimmed);
    setSubmitting(null);
    if (status === null) {
      setError(t('Room not found. Check the code and try again.'));
      return null;
    }
    return status;
  }, [trimmed, t]);

  const handleResumeAsHost = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    const status = await resolveStatus('host');
    if (status === null) return;
    if (isLikelyMobileHost()) {
      setPendingHostCode(trimmed);
      return;
    }
    navigate(`/room/${trimmed}`);
  }, [trimmed, resolveStatus, navigate]);

  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(status === 'started' ? `/room/${trimmed}/players` : `/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);

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
            {t('Resume')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('Enter the room code your friends shared to jump back in.')}
          </Typography>

          <Box component="form" onSubmit={handleResumeAsHost}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('Room code')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
                htmlInput: { autoCapitalize: 'characters', autoComplete: 'off' },
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <StampButton variant="primary" type="submit" disabled={disabled}>
                {submitting === 'host' ? t('Resuming…') : t('Resume as host')}
              </StampButton>
              <StampButton variant="text" type="button" onClick={handleResumeAsPlayer} disabled={disabled}>
                {submitting === 'player' ? t('Resuming…') : t('Resume as player')}
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

      <HostDeviceWarningModal
        open={pendingHostCode !== null}
        onConfirm={() => {
          const roomCode = pendingHostCode;
          setPendingHostCode(null);
          if (roomCode) navigate(`/room/${roomCode}`);
        }}
        onCancel={() => setPendingHostCode(null)}
        labels={{
          title: t('Heads up'),
          body: t("You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet."),
          confirmLabel: t('Host anyway'),
          cancelLabel: t('Cancel'),
        }}
      />
    </BoardSurface>
  );
}
