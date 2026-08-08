import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { loginStart, loginSuccess, loginFailure } from '../../redux/auth/authSlice';
import { addNotification } from '../../redux/common/dataSlice';
import { googleLogin } from '../../services/auth/oauthService';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import './Auth.css';

// ── Google OAuth section component (used in user login only) ──────────────────
function GoogleOAuthSection({ dispatch, navigate }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const navigateByRole = (appRole, user) => {
    if (appRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (appRole === 'provider') {
      navigate(user?.status === 'Active' ? '/provider/dashboard' : '/provider/under-review');
    } else {
      const userEmail = user?.email || '';
      const savedLocation = localStorage.getItem(`user_location_${userEmail}`);
      const hasAddress = savedLocation && (() => {
        try { return !!JSON.parse(savedLocation)?.address; } catch { return false; }
      })();
      navigate(hasAddress ? '/user/dashboard' : '/user/select-location');
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setGoogleError('');
    dispatch(loginStart());
    try {
      const idToken = tokenResponse.id_token || tokenResponse.access_token;
      const data = await googleLogin(idToken);
      const upper = (data.user?.role || '').toUpperCase();
      const appRole = upper.includes('ADMIN') || upper.includes('SUPPORT')
        ? 'admin' : upper.includes('PROVIDER') ? 'provider' : 'user';
      dispatch(loginSuccess({ user: data.user, token: data.token, role: appRole }));
      navigateByRole(appRole, data.user);
    } catch (err) {
      const msg = err.message || 'Google sign-in failed. Please try again.';
      setGoogleError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleSignIn = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setGoogleError('Google sign-in was cancelled. Please try again.');
      dispatch(loginFailure('Google sign-in cancelled'));
      setGoogleLoading(false);
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {googleError && (
        <div style={{
          backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
          padding: '0.65rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem'
        }}>
          {googleError}
        </div>
      )}
      <button
        id="btn-google-auth-user"
        type="button"
        className="btn-google-oauth"
        onClick={() => googleSignIn()}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <span className="spinner-loader" style={{ width: 18, height: 18 }} />
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

      <div className="oauth-divider">
        <span className="oauth-divider-line" />
        <span className="oauth-divider-text">or sign in with email</span>
        <span className="oauth-divider-line" />
      </div>
    </div>
  );
}

export default function Auth({ role }) {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  
  // Extract configuration from URL parameters or default
  const urlMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [isRegister, setIsRegister] = useState(urlMode === 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    serviceType: 'cleaning',
    experience: '',
  });

  const [errors, setErrors] = useState({});

  // --- Provider Registration Step Wizard States ---
  const [step, setStep] = useState(1); // Steps: 1, 2, 3

  // OTP Verification States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState({ message: '', type: '' });

  // Document Upload States
  const [documentType, setDocumentType] = useState('AADHAR'); // 'AADHAR' or 'PAN'
  const [documentImage, setDocumentImage] = useState(null); // Base64 dataURL
  const [documentName, setDocumentName] = useState('');

  // Selfie States
  const [selfieImage, setSelfieImage] = useState(null); // Base64 dataURL
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setIsRegister(urlMode === 'register');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      serviceType: categories.length > 0 ? categories[0].name : '',
      experience: '',
    });
    setErrors({});
    setStep(1);
    
    // Fetch active categories
    fetch('http://localhost:8085/api/categories')
      .then(res => res.json())
      .then(data => {
        const activeCategories = data.filter(c => c.status === 'Active');
        setCategories(activeCategories);
        if (activeCategories.length > 0) {
          setFormData(prev => ({ ...prev, serviceType: activeCategories[0].name }));
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
      
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpFeedback({ message: '', type: '' });
    setDocumentImage(null);
    setDocumentName('');
    setSelfieImage(null);
    stopCamera();
  }, [urlMode, role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // --- Camera Operations ---
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 350, height: 350, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Webcam access blocked or unavailable. Please upload a selfie image manually instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSelfie = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Crop video to a square
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = 300;
      canvas.height = 300;
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      ctx.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/jpeg');
      stopCamera();

      try {
        const providerFolder = formData.name || formData.email || 'new_provider';
        const url = await uploadImageToCloudinary(dataUrl, providerFolder);
        setSelfieImage(url);
      } catch (err) {
        console.warn('Selfie Cloudinary upload failed, falling back to local base64:', err.message);
        setSelfieImage(dataUrl);
      }
    }
  };

  // --- File uploads ---
  const handleDocumentFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentName(file.name);
      
      // Read local base64 as fallback in case Cloudinary fails
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const providerFolder = formData.name || formData.email || 'new_provider';
          const url = await uploadImageToCloudinary(file, providerFolder);
          setDocumentImage(url);
        } catch (err) {
          console.warn('Document Cloudinary upload failed, falling back to local base64:', err.message);
          setDocumentImage(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read local base64 as fallback in case Cloudinary fails
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const providerFolder = formData.name || formData.email || 'new_provider';
          const url = await uploadImageToCloudinary(file, providerFolder);
          setSelfieImage(url);
        } catch (err) {
          console.warn('Selfie Cloudinary upload failed, falling back to local base64:', err.message);
          setSelfieImage(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- OTP Services API Calls ---
  const sendEmailOtp = async () => {
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setOtpFeedback({ message: 'Please enter a valid email address first.', type: 'error' });
      return;
    }

    setOtpLoading(true);
    setOtpFeedback({ message: '', type: '' });
    try {
      const response = await fetch(`http://localhost:8085/api/auth/send-otp?email=${encodeURIComponent(formData.email.trim())}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setOtpFeedback({ message: 'OTP sent! Check the backend console/logs to find the 6-digit code.', type: 'success' });
      } else {
        setOtpFeedback({ message: data.message || 'Failed to send OTP. Please try again.', type: 'error' });
      }
    } catch (err) {
      setOtpFeedback({ message: 'Network error connecting to backend API.', type: 'error' });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpFeedback({ message: 'Please enter the 6-digit OTP code.', type: 'error' });
      return;
    }

    setOtpLoading(true);
    setOtpFeedback({ message: '', type: '' });
    try {
      const response = await fetch(`http://localhost:8085/api/auth/verify-otp?email=${encodeURIComponent(formData.email.trim())}&otp=${encodeURIComponent(otp.trim())}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        setOtpFeedback({ message: 'Email verified successfully!', type: 'success' });
      } else {
        setOtpFeedback({ message: data.message || 'Invalid or expired OTP code.', type: 'error' });
      }
    } catch (err) {
      setOtpFeedback({ message: 'Network error connecting to backend API.', type: 'error' });
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Step navigation checks ---
  const validateStep1 = () => {
    let errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    let errs = {};
    if (!formData.experience.trim()) errs.experience = 'Years of experience is required';
    else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
      errs.experience = 'Experience must be a positive number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      alert('Email and password are required');
      return;
    }

    dispatch(loginStart());
    try {
      const response = await fetch('http://localhost:8085/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const userRole = data.user.role?.toUpperCase() || '';
        const status = data.user.status;

        // Determine the app-level role for routing guards
        let appRole = 'user';
        if (userRole.includes('ADMIN') || userRole.includes('SUPPORT')) {
          appRole = 'admin';
        } else if (userRole.includes('PROVIDER')) {
          appRole = 'provider';
        }

        dispatch(loginSuccess({ user: data.user, token: data.token, role: appRole }));
        alert(`Welcome back, ${data.user.name}!`);

        if (appRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (appRole === 'provider') {
          if (status === 'Pending') {
            navigate('/provider/under-review');
          } else if (status === 'Active') {
            const hasProfile = data.user.coverageArea && data.user.workingRadius > 0;
            navigate(hasProfile ? '/provider/dashboard' : '/provider/setup-profile');
          } else {
            navigate('/');
          }
        } else {
          // Regular user
          const userEmail = data.user?.email || '';
          const savedLocation = localStorage.getItem(`user_location_${userEmail}`);
          const hasAddress = savedLocation && (() => {
            try { return !!JSON.parse(savedLocation)?.address; } catch { return false; }
          })();
          navigate(hasAddress ? '/user/dashboard' : '/user/select-location');
        }
      } else {
        dispatch(loginFailure(data.message || 'Login failed'));
        alert(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      dispatch(loginFailure('Network error'));
      alert('Network error connecting to backend API during login.');
    }
  };

  // --- Final Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'user') {
      // User customer registration
      let userErrors = {};
      if (!formData.name.trim()) userErrors.name = 'Full name is required';
      if (!formData.email.trim()) userErrors.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) userErrors.email = 'Invalid email address';
      
      if (!formData.password) userErrors.password = 'Password is required';
      else if (formData.password.length < 6) userErrors.password = 'Password must be at least 6 characters';
      
      if (formData.password !== formData.confirmPassword) {
        userErrors.confirmPassword = 'Passwords do not match';
      }

      setErrors(userErrors);
      if (Object.keys(userErrors).length > 0) return;

      if (!otpVerified) {
        alert('Please complete the Email OTP verification first.');
        return;
      }

      dispatch(loginStart());
      try {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          address: formData.address.trim()
        };

        const response = await fetch('http://localhost:8085/api/auth/register-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
          dispatch(loginSuccess({ user: data.user, token: data.token, role: 'user' }));
          alert('Registration complete! Welcome as our new Customer.');
          // New users need to select location
          navigate('/user/select-location');
        } else {
          dispatch(loginFailure(data.message || 'Registration failed'));
          alert(data.message || 'Registration failed.');
        }
      } catch (err) {
        dispatch(loginFailure('Network error'));
        alert('Network error connecting to backend API during registration.');
      }
      return;
    }

    // Provider signup submit
    if (!otpVerified) {
      alert('Please complete the Email OTP verification first.');
      return;
    }
    if (!documentImage) {
      alert('Please upload your Aadhar or PAN Card image.');
      return;
    }
    if (!selfieImage) {
      alert('Please capture or upload your selfie photo.');
      return;
    }

    dispatch(loginStart());
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        serviceType: formData.serviceType,
        experience: parseInt(formData.experience),
        documentType: documentType,
        documentImage: documentImage,
        selfieImage: selfieImage
      };

      const response = await fetch('http://localhost:8085/api/auth/register-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(loginSuccess({ user: data.user, token: data.token, role: 'provider' }));
        dispatch(addNotification({
          providerId: data.user?.id,
          title: 'New Provider Registration',
          message: `${data.user?.name || formData.name} (${formData.serviceType || 'Service Partner'}) applied for verification.`,
          channel: 'InApp',
          audience: 'All Admin',
          read: false
        }));
        alert('Registration complete! Welcome as our new Service Partner.');
        navigate('/provider/under-review');
      } else {
        dispatch(loginFailure(data.message || 'Registration failed'));
        alert(data.message || 'Registration failed. Please check details.');
      }
    } catch (err) {
      dispatch(loginFailure('Network error'));
      alert('Network error connecting to backend API during registration.');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Side Brand Info Block */}
      <div className={`auth-brand-side ${role === 'provider' ? 'provider-theme' : 'user-theme'}`}>
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

          {role === 'user' ? (
            <div className="brand-info-text">
              <h2>Find Comfort in Your Home Services</h2>
              <p>Sign up to book verified local service partners for cleaning, repair, and installations. Manage bookings and secure digital payments instantly.</p>
              <div className="brand-benefits">
                <div className="benefit-item">
                  <span className="benefit-num">1</span>
                  <span>100% Verified Professionals</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-num">2</span>
                  <span>Upfront pricing. No hidden fees</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-num">3</span>
                  <span>Premium quality satisfaction guarantee</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="brand-info-text">
              <h2>Grow Your Local Business With Us</h2>
              <p>List your professional services, accept localized booking requests, set your hours, and earn weekly direct bank payouts.</p>
              <div className="brand-benefits">
                <div className="benefit-item">
                  <span className="benefit-num">✓</span>
                  <span>Steady stream of local bookings</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-num">✓</span>
                  <span>Flexible schedules. Be your own boss</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-num">✓</span>
                  <span>Easy mobile job management panel</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Container */}
      <div className="auth-form-side">
        <div className="form-card glass">
          <div className="role-indicator">
            Role: <strong>{role === 'user' ? 'Customer' : 'Service Partner'}</strong>
          </div>

          <div className="form-toggle">
            <button 
              className={`toggle-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => {
                navigate('/login');
              }}
            >
              Sign In
            </button>
            <button 
              className={`toggle-btn ${isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(true);
                navigate(`/${role}/auth?mode=register`);
              }}
            >
              Create Account
            </button>
          </div>

          <h2>{isRegister ? 'Get Started' : 'Welcome Back'}</h2>
          <p className="form-subtitle">
            {isRegister 
              ? `Sign up as a ${role === 'user' ? 'customer' : 'service partner'} to get started.` 
              : 'Sign in to access your dashboard.'
            }
          </p>

          {/* Login Form */}
          {!isRegister && (
            <>
            {/* Google OAuth — only for customers, not providers */}
            {role === 'user' && (
              <GoogleOAuthSection dispatch={dispatch} navigate={navigate} />
            )}
            <form onSubmit={handleLoginSubmit} className="auth-form-fields">
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
              <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
                {loading ? <span className="spinner-loader"></span> : 'Sign In'}
              </button>
            </form>
            </>
          )}

          {/* Register Form */}
          {isRegister && (
            <form onSubmit={handleSubmit} className="auth-form-fields">
              
              {/* --- CUSTOMER REGISTRATION --- */}
              {role === 'user' && (
                <>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="e.g. name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={otpVerified}
                        className={errors.email ? 'input-error' : ''}
                        style={{ flex: 1 }}
                      />
                      {!otpVerified && (
                        <button 
                          type="button" 
                          className="btn-otp" 
                          onClick={sendEmailOtp} 
                          disabled={otpLoading}
                          style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="otp-verify-input animation-fade" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        maxLength={6} 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="otp-code-input"
                        style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={verifyEmailOtp}
                        disabled={otpLoading}
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: '600' }}
                      >
                        Verify
                      </button>
                    </div>
                  )}

                  {otpFeedback.message && (
                    <div className={`otp-feedback ${otpFeedback.type}`} style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: otpFeedback.type === 'success' ? '#059669' : '#DC2626' }}>
                      {otpFeedback.message}
                    </div>
                  )}

                  {otpVerified && (
                    <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      ✓ Email Verified Successfully
                    </div>
                  )}

                  <div className="form-field">
                    <label>Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'input-error' : ''}
                    />
                    {errors.password && <span className="field-error">{errors.password}</span>}
                  </div>
                  
                  <div className="form-field">
                    <label>Confirm Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? 'input-error' : ''}
                    />
                    {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                  </div>
                  
                  <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
                    {loading ? <span className="spinner-loader"></span> : 'Register Account'}
                  </button>
                </>
              )}

              {/* --- PROVIDER REGISTRATION (MULTI-STEP) --- */}
              {role === 'provider' && (
                <>
                  {/* Step indicators */}
                  <div className="step-wizard">
                    <div className={`step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
                    <div className="step-connector"></div>
                    <div className={`step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
                    <div className="step-connector"></div>
                    <div className={`step-node ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>3</div>
                  </div>
                  <div className="step-label">
                    {step === 1 && <span>Step 1: Account Details</span>}
                    {step === 2 && <span>Step 2: Professional Information</span>}
                    {step === 3 && <span>Step 3: Verification & Security</span>}
                  </div>

                  {/* Step 1: Account details */}
                  {step === 1 && (
                    <div className="step-content animation-fade">
                      <div className="form-field">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="e.g. John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                      </div>

                      <div className="form-field">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="e.g. name@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                      </div>

                      <div className="form-field">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={errors.phone ? 'input-error' : ''}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                      </div>

                      <div className="form-field">
                        <label>Password</label>
                        <input 
                          type="password" 
                          name="password" 
                          placeholder="Minimum 6 characters"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                      </div>

                      <div className="form-field">
                        <label>Confirm Password</label>
                        <input 
                          type="password" 
                          name="confirmPassword" 
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={errors.confirmPassword ? 'input-error' : ''}
                        />
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                      </div>

                      <button type="button" className="btn btn-primary form-submit-btn" onClick={handleNextStep}>
                        Next: Professional Info
                      </button>
                    </div>
                  )}

                  {/* Step 2: Professional info */}
                  {step === 2 && (
                    <div className="step-content animation-fade">
                      <div className="form-field">
                        <label>Primary Skill Category</label>
                        <select 
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleInputChange}
                        >
                          {categories.length > 0 ? (
                            categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))
                          ) : (
                            <option value="">No categories available</option>
                          )}
                        </select>
                      </div>

                      <div className="form-field">
                        <label>Years of Professional Experience</label>
                        <input 
                          type="number" 
                          name="experience" 
                          placeholder="e.g. 5"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className={errors.experience ? 'input-error' : ''}
                        />
                        {errors.experience && <span className="field-error">{errors.experience}</span>}
                      </div>

                      <div className="wizard-navigation">
                        <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                          Back
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                          Next: Verification
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Verification (OTP, Document upload, Selfie camera) */}
                  {step === 3 && (
                    <div className="step-content animation-fade">
                      
                      {/* 3A: Email OTP Verification */}
                      <div className="verification-section card-sub">
                        <div className="section-header">
                          <span className="badge-num">A</span>
                          <h4>Verify Email Address</h4>
                        </div>
                        
                        <div className="otp-controls">
                          <input 
                            type="email" 
                            value={formData.email} 
                            disabled 
                            className="bg-disabled" 
                          />
                          {!otpVerified && (
                            <button 
                              type="button" 
                              className="btn-otp" 
                              onClick={sendEmailOtp} 
                              disabled={otpLoading}
                            >
                              {otpSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                          )}
                        </div>

                        {otpSent && !otpVerified && (
                          <div className="otp-verify-input animation-fade">
                            <input 
                              type="text" 
                              placeholder="Enter 6-digit OTP code" 
                              maxLength={6} 
                              value={otp} 
                              onChange={(e) => setOtp(e.target.value)} 
                              className="otp-code-input"
                            />
                            <button 
                              type="button" 
                              className="btn btn-primary btn-verify-otp" 
                              onClick={verifyEmailOtp}
                              disabled={otpLoading}
                            >
                              Verify
                            </button>
                          </div>
                        )}

                        {otpFeedback.message && (
                          <div className={`otp-feedback ${otpFeedback.type}`}>
                            {otpFeedback.message}
                          </div>
                        )}

                        {otpVerified && (
                          <div className="verified-success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Email Verified Successfully
                          </div>
                        )}
                      </div>

                      {/* 3B: Aadhar or PAN Upload */}
                      <div className="verification-section card-sub">
                        <div className="section-header">
                          <span className="badge-num">B</span>
                          <h4>Identity Verification Document</h4>
                        </div>
                        
                        <div className="document-toggle-bar">
                          <button 
                            type="button" 
                            className={`doc-toggle-btn ${documentType === 'AADHAR' ? 'active' : ''}`}
                            onClick={() => setDocumentType('AADHAR')}
                          >
                            Aadhar Card
                          </button>
                          <button 
                            type="button" 
                            className={`doc-toggle-btn ${documentType === 'PAN' ? 'active' : ''}`}
                            onClick={() => setDocumentType('PAN')}
                          >
                            PAN Card
                          </button>
                        </div>

                        <div className="file-drop-area">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="upload-cloud-icon">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p>Upload a clear photo of your <strong>{documentType === 'AADHAR' ? 'Aadhar Card' : 'PAN Card'}</strong></p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleDocumentFileChange}
                            className="hidden-file-input"
                            id="doc-file-input"
                          />
                          <label htmlFor="doc-file-input" className="file-select-label">
                            Select Image
                          </label>
                          {documentName && <span className="selected-filename">{documentName}</span>}
                        </div>

                        {documentImage && (
                          <div className="doc-preview-container animation-fade">
                            <img src={documentImage} alt="Document Preview" className="doc-thumbnail-preview" />
                          </div>
                        )}
                      </div>

                      {/* 3C: Selfie Photo */}
                      <div className="verification-section card-sub">
                        <div className="section-header">
                          <span className="badge-num">C</span>
                          <h4>Selfie Verification</h4>
                        </div>

                        {!selfieImage && !isCameraActive && (
                          <div className="selfie-actions">
                            <button type="button" className="btn-camera" onClick={startCamera}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              Take Selfie via Camera
                            </button>
                            <span className="or-text">or upload photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleSelfieFileChange}
                              className="hidden-file-input"
                              id="selfie-file-input"
                            />
                            <label htmlFor="selfie-file-input" className="file-select-label file-selfie-label">
                              Upload Selfie
                            </label>
                          </div>
                        )}

                        {isCameraActive && (
                          <div className="camera-viewport-container animation-fade">
                            <div className="camera-frame">
                              <video ref={videoRef} autoPlay playsInline className="video-feed" />
                            </div>
                            <div className="camera-controls">
                              <button type="button" className="btn-capture" onClick={captureSelfie}>
                                Capture Photo
                              </button>
                              <button type="button" className="btn-cancel-camera" onClick={stopCamera}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {cameraError && <div className="camera-error-feedback">{cameraError}</div>}

                        {selfieImage && (
                          <div className="selfie-preview-wrapper animation-fade">
                            <div className="selfie-frame-preview">
                              <img src={selfieImage} alt="Selfie Preview" />
                            </div>
                            <button type="button" className="btn-retake" onClick={() => { setSelfieImage(null); startCamera(); }}>
                              Retake Photo
                            </button>
                          </div>
                        )}

                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                      </div>

                      {/* Step Navigation */}
                      <div className="wizard-navigation nav-submit-row">
                        <button type="button" className="btn-secondary" onClick={handlePrevStep} disabled={loading}>
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary register-submit-btn" 
                          disabled={loading || !otpVerified || !documentImage || !selfieImage}
                        >
                          {loading ? <span className="spinner-loader"></span> : 'Register Account'}
                        </button>
                      </div>

                    </div>
                  )}
                </>
              )}

            </form>
          )}

          <div className="role-switch-suggestion">
            {role === 'user' ? (
              <p>Are you a service provider? <Link to="/provider/auth?mode=register">Join as a Partner</Link></p>
            ) : (
              <p>Looking to book a service? <Link to="/user/auth?mode=register">Sign up as Customer</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
