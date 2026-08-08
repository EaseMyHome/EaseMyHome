
import React from 'react';
import './ProviderEarningsTab.css';

export default function ProviderEarningsTab({ earnings = 0 }) {
  return (
    <div className="provider-earnings-container">
      <h3>Earnings & Payouts</h3>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
        ₹{earnings}
      </div>
    </div>
  );
}
