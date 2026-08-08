import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserNavbar.css';

export default function UserNavbar({
  activeMainTab,
  setActiveMainTab,
  customerBookings = [],
  savedLocation,
  firstName,
  handleLogout
}) {
  const navigate = useNavigate();

  return (
    <header className="dash-header">
      <div className="header-brand">
        <span className="brand-logo-icon">🏠</span>
        <span className="brand-name">EaseMyHome</span>
      </div>

      {/* E-Commerce Center Tabs Navigation */}
      <nav className="header-center-nav">
        <button 
          className={`nav-tab-btn ${activeMainTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('explore')}
        >
          🛍️ Explore Services
        </button>
        <button 
          className={`nav-tab-btn ${activeMainTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('bookings')}
        >
          📦 My Bookings
          {customerBookings.length > 0 && (
            <span className="nav-badge-count">{customerBookings.length}</span>
          )}
        </button>
        <button 
          className={`nav-tab-btn ${activeMainTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('profile')}
        >
          👤 My Account
        </button>
      </nav>

      {/* Delivery Location Badge */}
      <div className="location-selector-badge" onClick={() => navigate('/user/select-location')}>
        <span className="loc-icon">📍</span>
        <div className="loc-info">
          <small>Deliver To</small>
          <strong>{savedLocation?.address ? `${savedLocation.address.substring(0, 24)}...` : 'Select Location'}</strong>
        </div>
        <span className="loc-edit-btn">Edit ✏️</span>
      </div>

      <div className="header-user-actions">
        <span className="user-welcome">Hi, <strong>{firstName}</strong></span>
        <button className="btn-signout" onClick={handleLogout}>Sign Out</button>
      </div>
    </header>
  );
}
