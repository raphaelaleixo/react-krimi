import { useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactTyped } from 'react-typed';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import logo from '../assets/logo.svg';
import ludoratory from '../assets/ludoratory.svg';

export default function Home() {
  const navigate = useNavigate();
  const { createRoom } = useGame();
  const { t, lang, setLang } = useI18n();

  const handleCreate = useCallback(async () => {
    const roomId = await createRoom(lang);
    navigate(`/room/${roomId}`);
  }, [createRoom, lang, navigate]);

  const toggleLocale = useCallback(() => {
    setLang(lang === 'pt_br' ? 'en' : 'pt_br');
  }, [lang, setLang]);

  return (
    <Container sx={{ height: '100vh' }}>
      <Grid container sx={{ height: '100%', alignItems: 'center' }}>
        <Grid
          size={{ xs: 12, lg: 6, xl: 4 }}
          offset={{ xl: 4 }}
        >
          <Box component="img" src={logo} sx={{ maxWidth: 136, mb: 4 }} />
          <Typography variant="h2" component="h2">
            {t('A game of')}
            <Box
              component="span"
              sx={{
                display: 'block',
                '& .typed-cursor': { color: '#094067' },
              }}
            >
              <ReactTyped
                strings={[t('deception'), t('deduction')]}
                typeSpeed={120}
                backSpeed={50}
                backDelay={2000}
                loop
                style={{ color: '#3da9fc' }}
              />
            </Box>
          </Typography>
          <Typography
            sx={{ my: 1, fontSize: '1.5em' }}
          >
            {t("A web-version of Tobey Ho's")}{' '}
            <strong>Deception: Murder in Hong Kong</strong>.
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 4, mb: 10 }}>
            {t(
              "In the game, players take on the roles of investigators attempting to solve a murder case – but there's a twist. The killer is one of the investigators! Find out who among you can cut through deception to find the truth and who is capable of getting away with murder!"
            )}
          </Typography>
          <Box sx={{ display: { lg: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/join"
              variant="contained"
              size="large"
              sx={{
                mr: { lg: 2 },
                mb: { xs: 2, lg: 0 },
                bgcolor: 'grey.100',
                color: 'text.primary',
                '&:hover': { bgcolor: 'grey.200' },
                px: 4,
                py: 1.5,
              }}
            >
              {t('Join game')}
            </Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              size="large"
              color="error"
              sx={{ mb: { xs: 2, lg: 0 }, px: 4, py: 1.5 }}
            >
              {t('Create new game')}
            </Button>
          </Box>
          <Box sx={{ display: { lg: 'flex' }, mt: 4 }}>
            <Button
              href="https://medium.com/@raphaelaleixo/krimi-how-to-play-87839028f5ef"
              target="_blank"
              color="error"
              sx={{ mr: { lg: 2 }, mb: { xs: 2, lg: 0 } }}
            >
              {t('How to play')}
            </Button>
            <Button
              href="https://github.com/raphaelaleixo/krimi"
              target="_blank"
              color="error"
              sx={{ mr: { lg: 2 }, mb: { xs: 2, lg: 0 } }}
            >
              {t('About this project')}
            </Button>
            <Button
              onClick={toggleLocale}
              color="error"
              sx={{ mb: { xs: 2, lg: 0 } }}
            >
              {t('Versão em português')}
            </Button>
          </Box>
          <Box
            component="img"
            src={ludoratory}
            sx={{ maxWidth: 136, mt: 10 }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
