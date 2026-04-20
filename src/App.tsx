import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import krimiTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import { GameProvider } from './contexts/GameContext';
import { I18nProvider } from './hooks/useI18n';
import Home from './pages/Home';
import Join from './pages/Join';
import Room from './pages/Room';
import Player from './pages/Player';
import MockBoard from './pages/MockBoard';
import HowToPlay from './pages/HowToPlay';
import PlayerJoin from './pages/PlayerJoin';
import RejoinPlayers from './pages/RejoinPlayers';

export default function App() {
  return (
    <ThemeProvider theme={krimiTheme}>
      <CssBaseline />
      <GlobalStyles />
      <I18nProvider>
        <GameProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join" element={<Join />} />
              <Route path="/room/:id" element={<Room />} />
              <Route path="/room/:id/player" element={<PlayerJoin />} />
              <Route path="/room/:id/player/:playerId" element={<Player />} />
              <Route path="/room/:id/players" element={<RejoinPlayers />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/mock" element={<MockBoard />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
