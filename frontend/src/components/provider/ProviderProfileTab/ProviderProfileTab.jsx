
import React from 'react';
import './ProviderProfileTab.css';

export default function ProviderProfileTab({ user = {} }) {
  return (
    <div className="provider-profile-container">
      <h3>Provider Profile & Service Area</h3>
      <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {user.name || 'Provider'}</p>
      <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {user.email || 'N/A'}</p>
      <p style={{ margin: '0.5rem 0' }}><strong>Coverage Area:</strong> {user.coverageArea || 'Not set'}</p>
      <p style={{ margin: '0.5rem 0' }}><strong>Working Radius:</strong> {user.workingRadius || 10} km</p>
    </div>
  );
}
