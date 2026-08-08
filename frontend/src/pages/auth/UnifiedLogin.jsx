import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { loginStart, loginSuccess, loginFailure } from '../../redux/auth/authSlice';
import { googleLogin } from '../../services/auth/oauthService';
import './UnifiedLogin.css';

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  // ── Navigate after successful login based on role ──────────────────────────
  const navigateByRole = (appRole, user) => {
    if (appRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (appRole === 'provider') {
      const status = user?.status;
      if (status === 'Active') {
        const hasProfile = user?.coverageArea && user?.workingRadius > 0;
        navigate(hasProfile ? '/provider/dashboard' : '/provider/setup-profile');
      } else {
        navigate('/provider/under-review');
      }
    } else {
      const userEmail = user?.email || '';
      const savedLocation = localStorage.getItem(`user_location_${userEmail}`);
      const hasAddress = savedLocation && (() => {
        try { return !!JSON.parse(savedLocation)?.address; } catch { return false; }
      })();
      navigate(hasAddress ? '/user/dashboard' : '/user/select-location');
    }
  };

  // ── Determine appRole from backend role string ─────────────────────────────
  const resolveAppRole = (roleStr) => {
    const upper = (roleStr || '').toUpperCase();
    if (upper.includes('ADMIN') || upper.includes('SUPPORT')) return 'admin';
    if (upper.includes('PROVIDER')) return 'provider';
    return 'user';
  };

  // ── Regular email/password login ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    dispatch(loginStart());
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:8085/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        const appRole = resolveAppRole(data.user?.role);
        dispatch(loginSuccess({ user: data.user, token: data.token, role: appRole }));
        navigateByRole(appRole, data.user);
      } else {
        const message = data.message || (data.errors ? data.errors.join(', ') : 'Invalid email or password');
        setErrorMsg(message);
        dispatch(loginFailure(message));
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend server.');
      dispatch(loginFailure('Network error'));
    }
  };

  // ── Google OAuth success handler ───────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setErrorMsg('');
    dispatch(loginStart());
    try {
      // useGoogleLogin with flow:'implicit' gives back access_token
      // but also populates id_token on some browsers via tokenResponse.id_token
      // We send whichever token is available to the backend
      const idToken = tokenResponse.id_token || tokenResponse.access_token;
      const data = await googleLogin(idToken);
      const appRole = resolveAppRole(data.user?.role);
      dispatch(loginSuccess({ user: data.user, token: data.token, role: appRole }));
      navigateByRole(appRole, data.user);
    } catch (err) {
      const msg = err.message || 'Google sign-in failed. Please try again.';
      setErrorMsg(msg);
      dispatch(loginFailure(msg));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Google sign-in was cancelled or failed. Please try again.');
    dispatch(loginFailure('Google sign-in failed'));
    setGoogleLoading(false);
  };

  const googleSignIn = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <div className="auth-page-container">
      {/* ── Brand Side ── */}
      <div className="auth-brand-side login-theme">
        <div className="brand-side-content">
          <Link to="/" className="auth-back-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Homepage
          </Link>

          <div className="brand-logo-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>EaseMyHome</span>
          </div>

          <div className="brand-info-text">
            <h2>Welcome Back to EaseMyHome</h2>
            <p>Sign in to manage your bookings, account settings, or partner services. One central gateway for all users and partners.</p>
            <div className="brand-benefits">
              <div className="benefit-item">
                <span className="benefit-num">1</span>
                <span>Automatic Role Recognition</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-num">2</span>
                <span>100% Secure JWT Authentication</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-num">3</span>
                <span>Instant Access to Your Custom Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div className="auth-form-side">
        <div className="form-card">
          <div className="role-indicator">EaseMyHome Single Portal</div>

          <h2>Welcome Back</h2>
          <p className="form-subtitle">Enter your credentials to access your account.</p>

          {/* Error Message */}
          {errorMsg && (
            <div className="auth-error-box">{errorMsg}</div>
          )}

          {/* ── Google OAuth Button ── */}
          <button
            id="btn-google-login"
            type="button"
            className="btn-google-oauth"
            onClick={() => googleSignIn()}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="spinner-sm-dark" />
            ) : (
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* ── Divider ── */}
          <div className="oauth-divider">
            <span className="oauth-divider-line" />
            <span className="oauth-divider-text">or sign in with email</span>
            <span className="oauth-divider-line" />
          </div>

          {/* ── Email/Password Form ── */}
          <form onSubmit={handleSubmit} className="auth-form-fields">
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading || googleLoading}>
              {loading ? (
                <><span className="spinner-sm-dark"></span> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="register-prompt-container">
            <div className="register-prompt-item">
              <span>New customer?</span>
              <Link to="/user/auth?mode=register" className="register-link-accent">Create Account</Link>
            </div>
            <div className="register-prompt-item">
              <span>Want to deliver services?</span>
              <Link to="/provider/auth?mode=register" className="register-link-accent">Register as Partner</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
