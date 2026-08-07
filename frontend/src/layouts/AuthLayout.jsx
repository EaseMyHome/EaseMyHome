import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, useTheme } from '@mui/material';

const AuthLayout = () => {
  const theme = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const bgGradient = theme.palette.mode === 'dark'
    ? 'radial-gradient(circle at 20% 30%, #1e1b4b 0%, #0f172a 100%)' // Indigo-Slate dark gradient
    : 'radial-gradient(circle at 20% 30%, #e0e7ff 0%, #f8fafc 100%)'; // Light indigo-slate gradient

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgGradient,
        p: 2.5
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 12px 40px rgba(0, 0, 0, 0.5)'
            : '0 12px 40px rgba(148, 163, 184, 0.12)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            🏠 EaseMyHome
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise Home Services Booking Admin Panel
          </Typography>
        </Box>
        <Outlet />
      </Paper>
    </Box>
  );
};

export default AuthLayout;
