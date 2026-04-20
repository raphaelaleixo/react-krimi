import { useCallback, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { useI18n } from '../hooks/useI18n';
import PaperSurface from '../components/paper/PaperSurface';
import PaperButton from '../components/paper/PaperButton';
import logo from '../assets/logo.svg';
import ludoratory from '../assets/ludoratory.svg';

export default function Home() {
  const navigate = useNavigate();
  const { createRoom } = useGame();
  const { t, lang, setLang } = useI18n();
  const [hostWarningOpen, setHostWarningOpen] = useState(false);

  const createAndGo = useCallback(async () => {
    const roomId = await createRoom(lang);
    navigate(`/room/${roomId}`);
  }, [createRoom, lang, navigate]);

  const startCreate = useCallback(() => {
    if (isLikelyMobileHost()) {
      setHostWarningOpen(true);
      return;
    }
    void createAndGo();
  }, [createAndGo]);

  const toggleLocale = useCallback(
    () => setLang(lang === 'pt_br' ? 'en' : 'pt_br'),
    [lang, setLang],
  );

  return (
    <PaperSurface>
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
            py: 6,
          }}
        >
          <Box component="img" src={logo} sx={{ width: 136, mx: 'auto' }} alt="Krimi" />
          <Typography variant="h2" component="h1">
            {t('A game of deception & deduction')}
          </Typography>
          <Typography variant="subtitle1">
            {t("A web-version of Tobey Ho's")}{' '}
            <strong>Deception: Murder in Hong Kong</strong>.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <PaperButton variant="primary" size="large" onClick={startCreate}>
              {t('Create new game')}
            </PaperButton>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <PaperButton variant="secondary" component={RouterLink} to="/join">
                {t('Join game')}
              </PaperButton>
              <PaperButton variant="secondary" component={RouterLink} to="/how-to-play">
                {t('How to play')}
              </PaperButton>
            </Box>
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderTop: '1px dashed',
            borderColor: 'text.disabled',
            flexWrap: 'wrap',
          }}
        >
          <Box component="img" src={ludoratory} sx={{ width: 48 }} alt="Ludoratory" />
          <Box sx={{ flex: 1, fontSize: '0.85em', minWidth: 200 }}>
            <Typography variant="body2">
              {t('Made by')}{' '}
              <Link href="https://aleixo.me" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary' }}>
                Raphael Aleixo / Ludoratory
              </Link>
              .
            </Typography>
            <Typography variant="body2">
              {t('Licensed under')}{' '}
              <Link
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                CC BY-NC-SA 4.0
              </Link>
              .
            </Typography>
          </Box>
          <PaperButton variant="text" onClick={toggleLocale}>
            {t('Versão em português')}
          </PaperButton>
        </Box>
      </Container>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => {
          setHostWarningOpen(false);
          void createAndGo();
        }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: t('Heads up'),
          body: t(
            "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          ),
          confirmLabel: t('Host anyway'),
          cancelLabel: t('Cancel'),
        }}
      />
    </PaperSurface>
  );
}
