import type { StringConnection } from '../../hooks/useStringPositions';

interface RedStringsProps {
  connections: StringConnection[];
  width: number;
  height: number;
}

export default function RedStrings({ connections, width, height }: RedStringsProps) {
  if (connections.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {connections.map((conn, i) => {
        // Quadratic bezier with control point offset for a natural drape
        const midX = (conn.from.x + conn.to.x) / 2;
        const midY = (conn.from.y + conn.to.y) / 2;
        // Drape downward slightly
        const controlY = midY + 30;
        const d = `M ${conn.from.x} ${conn.from.y} Q ${midX} ${controlY} ${conn.to.x} ${conn.to.y}`;

        return (
          <path
            key={i}
            d={d}
            stroke="var(--evidence-color)"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
          />
        );
      })}
    </svg>
  );
}
