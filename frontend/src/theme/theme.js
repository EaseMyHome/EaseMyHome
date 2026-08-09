import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#818cf8' : '#4f46e5', // Indigo
      light: mode === 'dark' ? '#a5b4fc' : '#818cf8',
      dark: mode === 'dark' ? '#4f46e5' : '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#34d399' : '#059669', // Emerald/Teal
      light: mode === 'dark' ? '#6ee7b7' : '#34d399',
      dark: mode === 'dark' ? '#059669' : '#047857',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc', // Slate 900 vs Slate 50
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',   // Slate 800 vs White
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#475569',
    },
    divider: mode === 'dark' ? '#334155' : '#e2e8f0',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(79, 70, 229, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark' 
            ? '0px 4px 20px rgba(0, 0, 0, 0.25)' 
            : '0px 4px 20px rgba(148, 163, 184, 0.1)',
          border: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0px 8px 30px rgba(0, 0, 0, 0.4)'
              : '0px 8px 30px rgba(148, 163, 184, 0.15)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
          borderRight: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          borderBottom: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default getDesignTokens;
