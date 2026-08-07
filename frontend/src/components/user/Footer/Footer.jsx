import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="#" className="footer-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>EaseMyHome</span>
          </a>
          <p className="footer-brand-desc">
            Premium local home services at the touch of a button. We verify every provider so you can relax knowing your home is in good hands.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-links-col">
            <h4>For Customers</h4>
            <ul>
              <li><a href="#services">Book Cleaning</a></li>
              <li><a href="#services">Book Plumbing</a></li>
              <li><a href="#services">Book Electrician</a></li>
              <li><a href="#services">Service Rates</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>For Partners</h4>
            <ul>
              <li><a href="#portals">Join as Provider</a></li>
              <li><a href="#how-it-works">How Partners Earn</a></li>
              <li><a href="#portals">Partner Code of Conduct</a></li>
              <li><a href="#portals">Payout Policies</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} EaseMyHome Inc. All rights reserved.</p>
          <p>Designed for premium quality and comfort.</p>
        </div>
      </div>
    </footer>
  );
}
