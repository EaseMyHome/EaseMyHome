import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Login Button */}
        <div className="navbar-action-btn">
          <Link to="/user/auth?mode=login" className="btn btn-accent login-btn-red">
            Login/Signup
          </Link>
        </div>
      </div>
    </header>
  );
}
