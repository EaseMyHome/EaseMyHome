import './ProviderServices.css';

import React from 'react';
import './ProviderServicesTab.css';

export default function ProviderServicesTab({ services = [] }) {
  return (
    <div className="provider-services-container">
      <h3>My Offereing Services</h3>
      <p style={{ color: '#6b7280' }}>Manage prices and subservice offerings.</p>
    </div>
  );
}
