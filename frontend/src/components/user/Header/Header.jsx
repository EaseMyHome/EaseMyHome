import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../redux/auth/authSlice';
import './Header.css';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: "${searchQuery}" in ${location}`);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="logo-text">Ease<span>MyHome</span></span>
        </Link>

        {/* Location Dropdown */}
        <div className="location-picker-wrapper">
          <span className="delivery-label">Service in</span>
          <button className="location-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {location}
            <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          
          <div className="location-tooltip">
            Select your city to see available services
          </div>

          {dropdownOpen && (
            <div className="location-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
              {['Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'].map((city) => (
                <button 
                  key={city} 
                  className={`loc-item ${location === city ? 'active' : ''}`}
                  onClick={() => {
                    setLocation(city);
                    setDropdownOpen(false);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="navbar-menu-links">
          <a href="#services" className="menu-link">Browse Catalogue</a>
          <a href="#quality-section" className="menu-link">Quality</a>
          <a href="#portals" className="menu-link">Partner Portal</a>
        </nav>

        {/* Search Bar in Header */}
        <form onSubmit={handleSearchSubmit} className="header-search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search for cleaning, plumber, repairs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* User Session Info / Login Button */}
        <div className="navbar-action-btn">
          {isAuthenticated && user ? (
            <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="user-name-tag" style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>
                Hi, <strong>{user.name}</strong> 
                <span className="user-role-badge" style={{ 
                  fontSize: '0.75rem', 
                  marginLeft: '0.25rem', 
                  backgroundColor: user.role === 'PROVIDER' ? '#E6F4EA' : '#E0E7FF',
                  color: user.role === 'PROVIDER' ? 'var(--secondary)' : 'var(--primary)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {user.role === 'PROVIDER' ? 'Partner' : 'Customer'}
                </span>
              </span>
              <button 
                onClick={() => {
                  dispatch(logout());
                  alert('Signed out successfully.');
                }} 
                className="btn btn-secondary btn-signout-header"
                style={{ 
                  padding: '0.45rem 1rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-accent login-btn-red">
              Login/Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
