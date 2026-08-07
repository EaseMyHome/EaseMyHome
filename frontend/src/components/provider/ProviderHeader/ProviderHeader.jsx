
import React from 'react';
import './ProviderHeader.css';

export default function ProviderHeader({ user, title, onLogout }) {
  return (
    <header className="provider-header-bar">
      <h2 className="header-title-text">{title || 'Provider Portal'}</h2>
      <div className="header-actions-group">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name || 'Provider User'}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.serviceType || 'Partner'}</div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
