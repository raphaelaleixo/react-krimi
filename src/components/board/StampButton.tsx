import Button, { type ButtonProps } from '@mui/material/Button';
import { forwardRef, useMemo } from 'react';

export type StampButtonVariant = 'primary' | 'text';

export type StampButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: StampButtonVariant;
  to?: string;
  href?: string;
};

const STAMP_RED = '#9E1B1B';

const DISTRESS_MASK =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><filter id='d'><feTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -30 22'/></filter><rect width='100%' height='100%' filter='url(%23d)'/></svg>\")";

function generateDistressedStamp() {
  const points: string[] = [];
  const r = 8;
  const cornerPts = 8;
  const sidePts = 18;
  const biteProb = 0.15;
  const maxBite = 2;
  const bite = () =>
    Math.random() < biteProb ? Math.random() * maxBite : 0;

  const addCorner = (cx: number, cy: number, startAngle: number) => {
    for (let i = 0; i <= cornerPts; i++) {
      const angle = startAngle + (i / cornerPts) * (Math.PI / 2);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const b = bite();
      const dx = cx - x;
      const dy = cy - y;
      const len = Math.hypot(dx, dy) || 1;
      points.push(
        `${(x + (dx / len) * b).toFixed(2)}% ${(y + (dy / len) * b).toFixed(2)}%`,
      );
    }
  };

  addCorner(r, r, Math.PI);
  for (let i = 1; i < sidePts; i++) {
    const x = r + (i / sidePts) * (100 - 2 * r);
    points.push(`${x.toFixed(2)}% ${bite().toFixed(2)}%`);
  }
  addCorner(100 - r, r, 1.5 * Math.PI);
  for (let i = 1; i < sidePts; i++) {
    const y = r + (i / sidePts) * (100 - 2 * r);
    points.push(`${(100 - bite()).toFixed(2)}% ${y.toFixed(2)}%`);
  }
  addCorner(100 - r, 100 - r, 0);
  for (let i = 1; i < sidePts; i++) {
    const x = (100 - r) - (i / sidePts) * (100 - 2 * r);
    points.push(`${x.toFixed(2)}% ${(100 - bite()).toFixed(2)}%`);
  }
  addCorner(r, 100 - r, 0.5 * Math.PI);
  for (let i = 1; i < sidePts; i++) {
    const y = (100 - r) - (i / sidePts) * (100 - 2 * r);
    points.push(`${bite().toFixed(2)}% ${y.toFixed(2)}%`);
  }

  return `polygon(${points.join(', ')})`;
}

const StampButton = forwardRef<HTMLButtonElement, StampButtonProps>(
  function StampButton({ variant = 'primary', sx, children, ...rest }, ref) {
    const muiVariant = variant === 'primary' ? 'outlined' : 'text';
    const distressed = useMemo(() => generateDistressedStamp(), []);

    const variantSx =
      variant === 'primary'
        ? {
            color: STAMP_RED,
            borderColor: STAMP_RED,
            borderWidth: 4,
            borderRadius: 2,
            bgcolor: 'transparent',
            clipPath: distressed,
            maskImage: DISTRESS_MASK,
            maskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: DISTRESS_MASK,
            WebkitMaskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            transform: 'rotate(-1.5deg)',
            '&:hover': {
              borderColor: STAMP_RED,
              borderWidth: 4,
              bgcolor: 'rgba(158, 27, 27, 0.06)',
              transform: 'rotate(-1.5deg) translateY(-1px)',
            },
            '&.Mui-disabled': { color: STAMP_RED, opacity: 0.4, borderColor: STAMP_RED },
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
              '&:hover': { transform: 'none' },
            },
          }
        : {
            color: STAMP_RED,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          };

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disableElevation
        disableRipple
        sx={{
          fontFamily: '"kingthings_trypewriter_2Rg", "IBM Plex Mono", monospace',
          fontWeight: 700,
          fontSize: variant === 'primary' ? '1.25rem' : undefined,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          px: variant === 'text' ? 1 : 4,
          py: variant === 'text' ? 0.5 : 1.5,
          ...variantSx,
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export default StampButton;
