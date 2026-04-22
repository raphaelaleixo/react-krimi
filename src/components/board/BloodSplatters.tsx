import Box from '@mui/material/Box';
import { useMemo } from 'react';

type Droplet = { cx: number; cy: number; r: number; opacity: number };

type SplatterSpec = {
  id: number;
  anchor: 'tl' | 'tr' | 'bl' | 'br';
  offsetX: number;
  offsetY: number;
  rotation: number;
  size: number;
  opacity: number;
  droplets: Droplet[];
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeDroplets(): Droplet[] {
  const count = Math.floor(rand(5, 11));
  return Array.from({ length: count }, () => ({
    cx: rand(8, 92),
    cy: rand(8, 92),
    r: rand(0.9, 4.2),
    opacity: rand(0.55, 0.9),
  }));
}

function makeSplatters(options: { minCount: number; maxCount: number; minSize: number; maxSize: number }): SplatterSpec[] {
  const anchors: SplatterSpec['anchor'][] = ['tl', 'tr', 'bl', 'br'];
  for (let i = anchors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [anchors[i], anchors[j]] = [anchors[j], anchors[i]];
  }
  const count = Math.floor(rand(options.minCount, options.maxCount + 1));
  return anchors.slice(0, count).map((anchor, i) => ({
    id: i,
    anchor,
    offsetX: rand(18, 44),
    offsetY: rand(18, 44),
    rotation: rand(0, 360),
    size: rand(options.minSize, options.maxSize),
    opacity: rand(0.75, 0.95),
    droplets: makeDroplets(),
  }));
}

function Splatter({ size, droplets }: { size: number; droplets: Droplet[] }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <g fill="var(--evidence-color)">
        <path
          d="M46 22c6 2 12 1 17 6 6 6 9 15 6 23-2 7-9 11-16 13-9 2-20-1-25-9-5-9-2-22 6-28 3-3 8-6 12-5z"
          opacity="0.85"
        />
        {droplets.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} opacity={d.opacity} />
        ))}
      </g>
    </svg>
  );
}

function anchorStyle(spec: SplatterSpec): React.CSSProperties {
  const style: React.CSSProperties = {
    position: 'absolute',
    transform: `rotate(${spec.rotation}deg)`,
    opacity: spec.opacity,
    pointerEvents: 'none',
  };
  switch (spec.anchor) {
    case 'tl':
      style.top = -spec.offsetY;
      style.left = -spec.offsetX;
      break;
    case 'tr':
      style.top = -spec.offsetY;
      style.right = -spec.offsetX;
      break;
    case 'bl':
      style.bottom = -spec.offsetY;
      style.left = -spec.offsetX;
      break;
    case 'br':
      style.bottom = -spec.offsetY;
      style.right = -spec.offsetX;
      break;
  }
  return style;
}

export interface BloodSplattersProps {
  seed: unknown;
  minCount?: number;
  maxCount?: number;
  minSize?: number;
  maxSize?: number;
}

export default function BloodSplatters({
  seed,
  minCount = 2,
  maxCount = 3,
  minSize = 110,
  maxSize = 170,
}: BloodSplattersProps) {
  const splatters = useMemo(
    () => makeSplatters({ minCount, maxCount, minSize, maxSize }),
    // regenerate on seed change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed]
  );

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {splatters.map((spec) => (
        <Box key={spec.id} sx={anchorStyle(spec)}>
          <Splatter size={spec.size} droplets={spec.droplets} />
        </Box>
      ))}
    </Box>
  );
}
