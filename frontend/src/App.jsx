import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getDesignTokens from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/common/ToastProvider';

function App() {
  // Select theme mode from Redux
  const mode = useSelector((state) => state.theme.mode);

  // Generate MUI Theme dynamically based on Redux mode state
  const theme = useMemo(() => {
    return createTheme(getDesignTokens(mode));
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
