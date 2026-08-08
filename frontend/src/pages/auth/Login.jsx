import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, TextField, Typography, Link, Alert, CircularProgress, Divider, Stack } from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../../redux/auth/authSlice';
import { useToast } from '../../components/common/ToastProvider';
import './Login.css';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      // Mock Login API response delayed by 800ms
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let userRole = 'Admin';
      let name = 'Neha Sharma';

      if (data.email.includes('super')) {
        userRole = 'Super Admin';
        name = 'Super Administrator';
      } else if (data.email.includes('support')) {
        userRole = 'Support Executive';
        name = 'Amit Kumar';
      }

      const mockResponse = {
        token: 'mock-jwt-token-xyz123',
        user: {
          id: 'ADM-100',
          name,
          email: data.email,
          role: userRole,
          avatar: '',
        },
      };

      dispatch(loginSuccess({ ...mockResponse, role: 'admin' }));
      showToast(`Welcome back, ${name}! Logged in as ${userRole}.`, 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      dispatch(loginFailure('Invalid email or password'));
      showToast('Login failed. Please check credentials.', 'error');
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setValue('email', roleEmail);
    setValue('password', 'admin123');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, textAlign: 'left' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'text.primary' }}>
        Admin Sign In
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password')}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, mb: 2 }}>
        <Link component={RouterLink} to="/admin/forgot-password" variant="body2" sx={{ underline: 'hover' }}>
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ py: 1.5, mt: 1, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          DEMO LOGINS (CLICK TO FILL)
        </Typography>
      </Divider>

      <Stack spacing={1}>
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth 
          onClick={() => handleQuickLogin('super@easemyhome.com')}
          sx={{ textTransform: 'none' }}
        >
          Super Admin (Full Access)
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth 
          onClick={() => handleQuickLogin('neha@easemyhome.com')}
          sx={{ textTransform: 'none' }}
        >
          Admin (Manager Access)
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth 
          onClick={() => handleQuickLogin('support@easemyhome.com')}
          sx={{ textTransform: 'none' }}
        >
          Support Executive (Read/Write Support Tickets)
        </Button>
      </Stack>
    </Box>
  );
};

export default Login;
