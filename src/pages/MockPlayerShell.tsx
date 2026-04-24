import Player from './Player';
import { GameContext } from '../contexts/GameContext';
import { buildMockGameContextValue } from '../mocks/krimiFixture';

export default function MockPlayerShell() {
  return (
    <GameContext.Provider value={buildMockGameContextValue()}>
      <Player />
    </GameContext.Provider>
  );
}
