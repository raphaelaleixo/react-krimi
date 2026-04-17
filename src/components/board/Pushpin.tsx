import Box from '@mui/material/Box';

interface PushpinProps {
  color?: string;
}

export default function Pushpin({ color = '#cc3333' }: PushpinProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color} 0%, ${color}cc 60%, ${color}88 100%)`,
        boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3)`,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '25%',
          left: '30%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
        },
      }}
    />
  );
}
