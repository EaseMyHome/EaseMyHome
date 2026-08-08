import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Alert, CircularProgress } from '@mui/material';
import { useToast } from '../../components/common/ToastProvider';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8085/api/auth/forgot-password/send-otp?email=${encodeURIComponent(email.trim())}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast('OTP sent to your email!', 'success');
        setStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8085/api/auth/verify-otp?email=${encodeURIComponent(email.trim())}&otp=${encodeURIComponent(otp.trim())}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast('OTP verified successfully!', 'success');
        setStep(3);
      } else {
        setErrorMsg(data.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8085/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Password reset successfully!', 'success');
        setSuccessMsg('Your password has been reset successfully. You can now login with your new password.');
        setStep(4);
      } else {
        setErrorMsg(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 1, textAlign: 'left', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'text.primary' }}>
        Forgot Password
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address and we'll send you an OTP to reset your password.
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mt: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter the 6-digit OTP sent to {email}
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            id="otp"
            label="6-digit OTP"
            name="otp"
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mt: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button variant="text" onClick={() => setStep(1)} disabled={loading}>
              Change Email
            </Button>
          </Box>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your new password.
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        </form>
      )}

      {step === 4 && (
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMsg}
          </Alert>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate('/login')}
            sx={{ py: 1.5 }}
          >
            Proceed to Login
          </Button>
        </Box>
      )}

      {step !== 4 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2" sx={{ underline: 'hover' }}>
            Back to Login
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ForgotPassword;
