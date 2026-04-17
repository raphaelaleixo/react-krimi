import Box from '@mui/material/Box';

interface Stain {
  top: string;
  left: string;
  size: number;
  opacity: number;
}

const STAINS: Stain[] = [
  { top: '15%', left: '72%', size: 90, opacity: 0.12 },
  { top: '78%', left: '8%', size: 70, opacity: 0.08 },
];

export default function CoffeeStains() {
  return (
    <>
      {STAINS.map((stain, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: stain.top,
            left: stain.left,
            width: stain.size,
            height: stain.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 45%, rgba(101, 67, 33, ${stain.opacity}) 50%, rgba(101, 67, 33, ${stain.opacity * 0.7}) 55%, transparent 60%)`,
            filter: 'blur(1px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
