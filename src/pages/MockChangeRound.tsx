import { useState } from 'react';
import RoundTitleCard from '../components/board/RoundTitleCard';
import GameOverReveal from '../components/board/GameOverReveal';

const BUTTON_BASE: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 'bold',
  border: 'none',
  borderRadius: 4,
  color: '#fff',
};

const MURDERER_MEANS = ['Sulfuric Acid', 'Razor', 'Hammer', 'Trophy'];
const MURDERER_CLUES = ['Button', 'Lipstick', 'Glasses', 'Wine glass'];
const MURDERER_CHOICE = { mean: 'Sulfuric Acid', key: 'Glasses' };

export default function MockChangeRound() {
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState<'detectives' | 'murderer'>('detectives');
  const [murdererName, setMurdererName] = useState('Philip Marlowe');
  const [detectiveName, setDetectiveName] = useState('Hercule Poirot');

  const trigger = (w: 'detectives' | 'murderer') => {
    setWinner(w);
    setFinished(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <section>
        <h2 style={{ fontFamily: 'var(--font-typewriter)' }}>
          RoundTitleCard — current round: {round}
        </h2>
        <p style={{ maxWidth: 520 }}>
          Click a button to simulate a round advance. The cream "Round N" card
          should toss in, hold, then disappear after 8s.
        </p>

        <RoundTitleCard round={round} detectiveName={detectiveName} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setRound(n)}
              disabled={n === round}
              style={{
                ...BUTTON_BASE,
                cursor: n === round ? 'default' : 'pointer',
                background: '#094067',
                opacity: n === round ? 0.4 : 1,
              }}
            >
              Go to Round {n}
            </button>
          ))}
          <button
            onClick={() => setRound((r) => (r % 3) + 1)}
            style={{ ...BUTTON_BASE, cursor: 'pointer', background: '#c62828' }}
          >
            Next Round (cycle)
          </button>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            Detective:
            <input
              value={detectiveName}
              onChange={(e) => setDetectiveName(e.target.value)}
              style={{ padding: '6px 8px', fontSize: 14 }}
            />
          </label>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-typewriter)' }}>
          GameOverReveal — finished: {String(finished)}, winner: {winner}
        </h2>
        <p style={{ maxWidth: 520 }}>
          Pick a winner to trigger the case file reveal. Detectives-win shows
          the prison polaroid + "Case Closed". Murderer-win shows the newspaper
          + "Case Archived". Click the overlay to dismiss. Reset before
          triggering again.
        </p>

        <GameOverReveal
          finished={finished}
          roomId="X7K2M"
          winner={winner}
          murdererName={murdererName}
          murdererMeans={MURDERER_MEANS}
          murdererClues={MURDERER_CLUES}
          murdererChoice={MURDERER_CHOICE}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
          <button
            onClick={() => trigger('detectives')}
            disabled={finished}
            style={{
              ...BUTTON_BASE,
              cursor: finished ? 'default' : 'pointer',
              background: '#094067',
              opacity: finished ? 0.4 : 1,
            }}
          >
            Trigger — Detectives Win
          </button>
          <button
            onClick={() => trigger('murderer')}
            disabled={finished}
            style={{
              ...BUTTON_BASE,
              cursor: finished ? 'default' : 'pointer',
              background: '#9E1B1B',
              opacity: finished ? 0.4 : 1,
            }}
          >
            Trigger — Murderer Wins
          </button>
          <button
            onClick={() => setFinished(false)}
            disabled={!finished}
            style={{
              ...BUTTON_BASE,
              cursor: !finished ? 'default' : 'pointer',
              background: '#555',
              opacity: !finished ? 0.4 : 1,
            }}
          >
            Reset
          </button>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            Murderer:
            <input
              value={murdererName}
              onChange={(e) => setMurdererName(e.target.value)}
              style={{ padding: '6px 8px', fontSize: 14 }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
