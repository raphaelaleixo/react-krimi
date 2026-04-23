import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import krimiTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import { GameProvider } from './contexts/GameContext';
import { I18nProvider } from './hooks/useI18n';

const Home = lazy(() => import('./pages/Home'));
const Join = lazy(() => import('./pages/Join'));
const Room = lazy(() => import('./pages/Room'));
const Player = lazy(() => import('./pages/Player'));
const HowToPlay = lazy(() => import('./pages/HowToPlay'));
const PlayerJoin = lazy(() => import('./pages/PlayerJoin'));
const RejoinPlayers = lazy(() => import('./pages/RejoinPlayers'));

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/join', element: <Join /> },
  { path: '/room/:id', element: <Room /> },
  { path: '/room/:id/player', element: <PlayerJoin /> },
  { path: '/room/:id/player/:playerId', element: <Player /> },
  { path: '/room/:id/players', element: <RejoinPlayers /> },
  { path: '/how-to-play', element: <HowToPlay /> },
];

if (import.meta.env.DEV) {
  const MockBoard = lazy(() => import('./pages/MockBoard'));
  const MockChangeRound = lazy(() => import('./pages/MockChangeRound'));
  routes.push(
    { path: '/mock', element: <MockBoard /> },
    { path: '/mock-change-round', element: <MockChangeRound /> },
  );
}

const router = createBrowserRouter(routes);

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={krimiTheme}>
      <CssBaseline />
      <GlobalStyles />
      <I18nProvider>
        <GameProvider>
          <Suspense fallback={<RouteFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </GameProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
