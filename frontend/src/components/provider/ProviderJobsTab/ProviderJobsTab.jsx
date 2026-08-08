
import React from 'react';
import './ProviderJobsTab.css';

export default function ProviderJobsTab({ bookings = [], onStatusUpdate }) {
  return (
    <div className="provider-jobs-container">
      <h3>Manage Bookings & Jobs</h3>
      {bookings.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="job-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>#EMH-{booking.id} - {booking.serviceType || 'Service'}</h4>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>
                {booking.status}
              </span>
            </div>
            <p style={{ color: '#4b5563', margin: '0.5rem 0' }}>Customer: {booking.customerName || 'Customer'}</p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>Address: {booking.address || 'Address N/A'}</p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>Date: {booking.bookingDate || 'TBD'} ({booking.bookingTime || 'Anytime'})</p>
          </div>
        ))
      )}
    </div>
  );
}
