
import React from 'react';
import './ProviderSidebar.css';

export default function ProviderSidebar({ currentView, setCurrentView }) {
  const menuItems = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'bookings', label: 'Bookings & Jobs', icon: '📋' },
    { key: 'services', label: 'My Services', icon: '🛠️' },
    { key: 'portfolio', label: 'Work Gallery', icon: '📷' },
    { key: 'earnings', label: 'Earnings & Payouts', icon: '💰' },
    { key: 'reviews', label: 'Customer Reviews', icon: '⭐' },
    { key: 'settings', label: 'Profile Settings', icon: '⚙️' }
  ];

  return (
    <aside className="provider-sidebar-container">
      <div className="sidebar-brand-box">
        EaseMyHome <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>Partner</span>
      </div>
      <ul className="sidebar-menu-list">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`sidebar-menu-item ${currentView === item.key ? 'active' : ''}`}
            onClick={() => setCurrentView(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
