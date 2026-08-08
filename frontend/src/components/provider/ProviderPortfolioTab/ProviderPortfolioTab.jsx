
import React from 'react';
import './ProviderPortfolioTab.css';

export default function ProviderPortfolioTab({ portfolio = [] }) {
  return (
    <div className="provider-portfolio-container">
      <h3>Work Portfolio Gallery</h3>
      <div className="portfolio-grid">
        {portfolio.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No photos uploaded yet.</p>
        ) : (
          portfolio.map((photo, idx) => (
            <img key={idx} src={photo.url || photo} alt="Portfolio item" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
          ))
        )}
      </div>
    </div>
  );
}
