import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import { useDirectionalNavigate } from '../router/useDirectionalNavigate';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useRoomState, type RoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import type { KrimiPlayerData } from '../types';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PlayerFile from '../components/board/PlayerFile';
import PlayerHeader from '../components/board/PlayerHeader';
import TapedNoteButton from '../components/board/TapedNoteButton';
import StampButton from '../components/board/StampButton';

function randomRotation() {
  return parseInt(String(3 - Math.random() * 6));
}

function randomOffset() {
  return Math.floor(Math.random() * 20) - 10;
}

export default function PlayerJoin() {
  const navigate = useDirectionalNavigate();
  const { id: roomId = '' } = useParams<{ id: string }>();
  const { roomState, loading, joinRoom, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    loadRoom(roomId);
    // Signal that the subscription has been initiated. This flag gates the
    // "Room not found" guard below so it can't fire before loadRoom runs —
    // which in turn prevents a one-paint flash on first mount. React
    // Compiler discourages setState in effects, but this flag can't be
    // derived from render-time values (roomState+loading both start false).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [roomId, loadRoom]);

  // Spinner until we've subscribed AND the first snapshot has resolved.
  if (!hasSubscribed || loading) {
    return (
      <BoardSurface>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100dvh',
          }}
        >
          <CircularProgress />
        </Box>
      </BoardSurface>
    );
  }

  // Subscription responded with no data → room does not exist.
  if (!roomState) {
    return <RoomNotFoundView />;
  }

  if (roomState.status === 'started') {
    return <RejoinView roomId={roomId} roomState={roomState} />;
  }

  // Lobby: existing nickname form.
  return (
    <LobbyView
      roomId={roomId}
      roomState={roomState}
      joinRoom={joinRoom}
      onJoined={(playerId) => navigate(`/room/${roomId}/player/${playerId}`)}
    />
  );
}

function RoomNotFoundView() {
  const { t } = useI18n();
  return (
    <BoardSurface>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          py: 6,
        }}
      >
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
            {t('Room not found')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Check the code and try again.')}
          </Typography>
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

interface RejoinViewProps {
  roomId: string;
  roomState: RoomState<KrimiPlayerData>;
}

function RejoinView({ roomId, roomState }: RejoinViewProps) {
  const { t } = useI18n();
  const { readyPlayers } = useRoomState(roomState);

  const slotIdsKey = readyPlayers.map((s) => s.id).join(',');
  const cardRotations = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => {
      map[s.id] = randomRotation();
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const cardOffsets = useMemo(() => {
    const map: Record<number, number> = {};
    readyPlayers.forEach((s) => {
      map[s.id] = randomOffset();
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  return (
    <BoardSurface>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <PlayerHeader
          roomState={roomState}
          playerId={0}
          gameState={null}
          showRoomCode
        />
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            py: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Tap your name to rejoin')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {readyPlayers.map((slot, index) => (
              <Box
                key={slot.id}
                component={RouterLink}
                to={`/room/${roomId}/player/${slot.id}`}
                aria-label={`${t('Rejoin as')} ${slot.name ?? ''}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <PlayerFile
                  name={slot.name ?? ''}
                  slotLabel={`${t('Player')} ${index + 1}`}
                  rotation={cardRotations[slot.id] ?? 0}
                  offsetY={cardOffsets[slot.id] ?? 0}
                />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </BoardSurface>
  );
}

interface LobbyViewProps {
  roomId: string;
  roomState: RoomState<KrimiPlayerData>;
  joinRoom: (roomId: string, name: string) => Promise<number>;
  onJoined: (playerId: number) => void;
}

function LobbyView({ roomId, roomState, joinRoom, onJoined }: LobbyViewProps) {
  const { t } = useI18n();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nickname.trim()) {
        setError(t('Enter your nickname:'));
        return;
      }
      setError('');
      try {
        const playerId = await joinRoom(roomId, nickname.trim());
        onJoined(playerId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error joining game';
        setError(message);
      }
    },
    [joinRoom, nickname, onJoined, roomId, t],
  );

  return (
    <BoardSurface>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <PlayerHeader
          roomState={roomState}
          playerId={0}
          gameState={null}
          showRoomCode={false}
        />
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            py: 6,
          }}
        >
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
      </Box>
    </BoardSurface>
  );
}
