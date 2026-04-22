import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import MockChangeRound from './pages/MockChangeRound';
import HowToPlay from './pages/HowToPlay';
import PlayerJoin from './pages/PlayerJoin';
import RejoinPlayers from './pages/RejoinPlayers';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/join', element: <Join /> },
  { path: '/room/:id', element: <Room /> },
  { path: '/room/:id/player', element: <PlayerJoin /> },
  { path: '/room/:id/player/:playerId', element: <Player /> },
  { path: '/room/:id/players', element: <RejoinPlayers /> },
  { path: '/how-to-play', element: <HowToPlay /> },
  { path: '/mock', element: <MockBoard /> },
  { path: '/mock-change-round', element: <MockChangeRound /> },
]);

export default function App() {
  return (
    <ThemeProvider theme={krimiTheme}>
      <CssBaseline />
      <GlobalStyles />
      <I18nProvider>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
