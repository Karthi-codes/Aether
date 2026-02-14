import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Luxury Black
    },
    secondary: {
      main: '#D4AF37', // Gold Accent (Subtle)
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F8F8',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 0, // Sharp edges for premium feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 28px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#333',
          },
        },
        contained: {
          color: '#fff',
          backgroundColor: '#000',
        },
        outlined: {
          borderColor: '#000',
          color: '#000',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderColor: '#000',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0px 1px 0px rgba(0,0,0,0.05)', // Very subtle divider
        },
      },
    },
  },
});
