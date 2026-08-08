
import React from 'react';
import './ProviderReviewsTab.css';

export default function ProviderReviewsTab({ reviews = [] }) {
  return (
    <div className="provider-reviews-container">
      <h3>Customer Reviews & Ratings</h3>
      {reviews.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No customer reviews yet.</p>
      ) : (
        reviews.map((rev, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
            <div style={{ fontWeight: 600 }}>{rev.customerName || 'Customer'} - ★ {rev.rating || 5}</div>
            <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>{rev.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}
