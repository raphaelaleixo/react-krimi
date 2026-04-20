import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PaperSurface from '../components/paper/PaperSurface';
import PaperButton from '../components/paper/PaperButton';
import { useI18n } from '../hooks/useI18n';

export default function HowToPlay() {
  const { t } = useI18n();

  return (
    <PaperSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, py: 6 }}>
        <Typography variant="h2" component="h1">{t('How to play')}</Typography>
        <Typography variant="body1">{t('Content coming soon.')}</Typography>
        <Box>
          <PaperButton variant="secondary" component={RouterLink} to="/">
            {t('Back')}
          </PaperButton>
        </Box>
      </Container>
    </PaperSurface>
  );
}
