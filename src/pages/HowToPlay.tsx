import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BoardSurface from '../components/board/BoardSurface';
import CaseFile from '../components/board/CaseFile';
import PinnedNote from '../components/board/PinnedNote';
import { useI18n } from '../hooks/useI18n';

export default function HowToPlay() {
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
              mb: 2,
              textAlign: 'center',
            }}
          >
            {t('How to play')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-typewriter)',
              color: '#1C1B1B',
              textAlign: 'center',
            }}
          >
            {t('Content coming soon.')}
          </Typography>
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
