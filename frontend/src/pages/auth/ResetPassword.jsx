import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, TextField, Typography, Link, Alert, CircularProgress } from '@mui/material';
import { useToast } from '../../components/common/ToastProvider';
import './ResetPassword.css';

const schema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      showToast('Password has been reset successfully!', 'success');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      showToast('Reset failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, textAlign: 'left' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'text.primary' }}>
        Reset Password
      </Typography>

      {success ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Password reset successful! Redirecting you to login page...
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Please enter your new password below.
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mt: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Link component={RouterLink} to="/admin/login" variant="body2" sx={{ underline: 'hover' }}>
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};

export default ResetPassword;
