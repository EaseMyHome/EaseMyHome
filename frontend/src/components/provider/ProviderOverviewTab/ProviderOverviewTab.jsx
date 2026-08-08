
import React from 'react';
import './ProviderOverviewTab.css';

export default function ProviderOverviewTab({ bookings = [], stats = {} }) {
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => (b.status || '').toUpperCase() === 'PENDING').length;
  const completedBookings = bookings.filter(b => (b.status || '').toUpperCase() === 'COMPLETED').length;

  return (
    <div className="provider-overview-container">
      <h3>Overview Dashboard</h3>
      <div className="stat-card-grid">
        <div className="stat-card-item">
          <div style={{ fontSize: '2rem', color: '#2563eb' }}>📋</div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Jobs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalBookings}</div>
          </div>
        </div>
        <div className="stat-card-item">
          <div style={{ fontSize: '2rem', color: '#f59e0b' }}>⏳</div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending Jobs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pendingBookings}</div>
          </div>
        </div>
        <div className="stat-card-item">
          <div style={{ fontSize: '2rem', color: '#10b981' }}>✅</div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completed Jobs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedBookings}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
