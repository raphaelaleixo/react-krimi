import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import Lobby from '../components/Lobby';
import Board from '../components/Board';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import TapedNoteButton from '../components/board/TapedNoteButton';
import logo from '../assets/logo-wordmark.svg';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const { roomState, gameState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    // See PlayerJoin.tsx for the same pattern: this flag can't be derived
    // from render-time values, so setState-in-effect is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [id, loadRoom]);

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

  if (!roomState) {
    return <GameNotFoundView />;
  }

  return gameState?.started ? <Board /> : <Lobby />;
}

function GameNotFoundView() {
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
          <Box
            component="img"
            src={logo}
            alt="Krimi"
            sx={{
              height: 88,
              width: 'auto',
              mx: 'auto',
              mb: 2,
              display: 'block',
              filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.45))',
            }}
          />
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
            {t('Game not found')}
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
