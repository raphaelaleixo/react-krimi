import { DirectionalLink as RouterLink } from '../router/DirectionalLink';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import TapedNoteButton from '../components/board/TapedNoteButton';
import { useI18n } from '../hooks/useI18n';

export default function RejoinPlayers() {
  const { t } = useI18n();

  return (
    <BoardSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, py: 6 }}>
        <CaseFile>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-typewriter)',
              fontSize: '2rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#1C1B1B',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {t('Rejoin the game')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              mb: 2,
            }}
          >
            {t('Tap your name to rejoin')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {t('Content coming soon.')}
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
