import { createTheme } from '@mui/material/styles';

const krimiTheme = createTheme({
  palette: {
    primary: { main: '#094067' },
    secondary: { main: '#3da9fc' },
    error: { main: '#ef4565' },
    text: {
      primary: '#5f6c7b',
      secondary: '#094067',
    },
    background: {
      default: 'transparent',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Mono", monospace',
    h2: {
      fontFamily: '"kingthings_trypewriter_2Rg", serif',
      color: '#094067',
      letterSpacing: '-2px',
      wordSpacing: '-10px',
    },
    h3: {
      fontFamily: '"kingthings_trypewriter_2Rg", serif',
      color: '#094067',
      letterSpacing: '-2px',
      wordSpacing: '-10px',
    },
    h4: {
      fontFamily: '"kingthings_trypewriter_2Rg", serif',
      letterSpacing: '-2px',
      wordSpacing: '-10px',
    },
    button: {
      fontWeight: 'bolder',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 5px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bolder',
        },
      },
    },
  },
});

export default krimiTheme;
