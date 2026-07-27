import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Auth({ role }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsRegister(urlMode === 'register');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      serviceType: 'cleaning',
      experience: '',
    });
    setErrors({});
  }, [urlMode, role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (isRegister) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
      }
      
      if (role === 'user' && !formData.address.trim()) {
        newErrors.address = 'Service delivery address is required';
      }
      
      if (role === 'provider') {
        if (!formData.experience.trim()) newErrors.experience = 'Years of experience is required';
        else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
          newErrors.experience = 'Experience must be a positive number';
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    // Simulate backend network API call
    setTimeout(() => {
      setLoading(false);
      alert(`Success! ${isRegister ? 'Registered' : 'Logged in'} as ${role === 'user' ? 'Customer' : 'Service Partner'}. (Backend authentication coming in next steps)`);
      navigate('/');
    }, 1500);
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

      {/* Form Form Container */}
      <div className="auth-form-side">
        <div className="form-card glass">
          <div className="role-indicator">
            Role: <strong>{role === 'user' ? 'Customer' : 'Service Partner'}</strong>
          </div>

          <div className="form-toggle">
            <button 
              className={`toggle-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(false);
                navigate(`/${role}/auth?mode=login`);
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

          <form onSubmit={handleSubmit} className="auth-form-fields">
            {isRegister && (
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
            )}

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

            {isRegister && (
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
            )}

            {/* User Specific Registration Fields */}
            {isRegister && role === 'user' && (
              <div className="form-field">
                <label>Delivery Address</label>
                <textarea 
                  name="address" 
                  placeholder="Your home address for service bookings"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'input-error' : ''}
                  rows="2"
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
            )}

            {/* Provider Specific Registration Fields */}
            {isRegister && role === 'provider' && (
              <>
                <div className="form-field">
                  <label>Primary Skill Category</label>
                  <select 
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                  >
                    <option value="cleaning">Deep Cleaning</option>
                    <option value="plumbing">Plumbing Solutions</option>
                    <option value="electrical">Electrical Repair</option>
                    <option value="appliance">Appliance Repair</option>
                    <option value="pest">Pest Control</option>
                    <option value="painting">Home Painting</option>
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
              </>
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

            {isRegister && (
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
            )}

            <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner-loader"></span>
              ) : (
                isRegister ? 'Register Account' : 'Sign In'
              )}
            </button>
          </form>

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
