
import React from 'react';
import './ProviderDetailView.css';

export default function ProviderDetailView({
  selectedProvider,
  setSelectedProvider,
  providerActiveTab,
  setProviderActiveTab,
  providerSubServices = [],
  loadingSubServices,
  handleInitiateBooking,
  providerPortfolio = [],
  loadingPortfolio,
  setPreviewImage,
  providerReviews = [],
  loadingReviews
}) {
  if (!selectedProvider) return null;

  return (
    <div className="fullpage-provider-overlay">
      <div className="fullpage-header">
        <button className="btn-back-dash" onClick={() => setSelectedProvider(null)}>
          ← Back to Dashboard
        </button>
        <div className="fullpage-header-title">
          <span className="verified-dot">🟢</span>
          <span>{selectedProvider.name}</span>
          <small>({selectedProvider.serviceType})</small>
        </div>
      </div>

      <div className="fullpage-body-container">
        <div className="provider-hero-card">
          <div className="provider-hero-avatar-wrap">
            <img 
              src={selectedProvider.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80'} 
              alt={selectedProvider.name} 
              className="hero-avatar-img"
            />
          </div>
          <div className="provider-hero-info">
            <div className="hero-name-row">
              <h2>{selectedProvider.name}</h2>
              <span className="hero-category-tag">🔧 {selectedProvider.serviceType}</span>
            </div>
            <p className="hero-bio-txt">{selectedProvider.bio || 'Verified professional partner on EaseMyHome.'}</p>
            <div className="hero-stats-chips">
              <span className="chip">⭐ {selectedProvider.rating || '4.9'} ({selectedProvider.reviewsCount || 12} Reviews)</span>
              <span className="chip">📍 {selectedProvider.coverageArea || 'Coverage Radius 10 km'}</span>
              <span className="chip">💼 {selectedProvider.experience || 2}+ Years Exp</span>
            </div>
          </div>
        </div>

        <div className="provider-tabs-navbar">
          <button 
            className={`p-tab-btn ${providerActiveTab === 'subservices' ? 'active' : ''}`}
            onClick={() => setProviderActiveTab('subservices')}
          >
            🛠️ Services & Rates ({providerSubServices.length})
          </button>
          <button 
            className={`p-tab-btn ${providerActiveTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setProviderActiveTab('portfolio')}
          >
            📸 Work Portfolio Gallery ({providerPortfolio.length})
          </button>
          <button 
            className={`p-tab-btn ${providerActiveTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setProviderActiveTab('reviews')}
          >
            ⭐️ Customer Reviews ({providerReviews.length})
          </button>
        </div>

        <div className="provider-tab-panel-body">
          {providerActiveTab === 'subservices' && (
            <div className="subservices-panel">
              <h3>Available Services offered by {selectedProvider.name}</h3>
              <p className="panel-subtitle">Select any service package below and click "Book Now" to schedule an appointment.</p>

              {loadingSubServices ? (
                <div className="dash-loading-state">
                  <div className="spinner"></div>
                  <p>Loading service rate cards...</p>
                </div>
              ) : providerSubServices.length === 0 ? (
                <div className="no-data-notice">
                  <p>No custom sub-services listed yet. Standard inspection rates apply.</p>
                </div>
              ) : (
                <div className="subservices-cards-grid">
                  {providerSubServices.map((sub) => (
                    <div key={sub.id} className="subservice-rate-card">
                      <div className="sub-card-header">
                        <h4>{sub.name}</h4>
                        <span className="sub-price-badge">₹{sub.price}</span>
                      </div>
                      {sub.description && <p className="sub-desc">{sub.description}</p>}
                      <div className="sub-card-footer">
                        <span className="unit-txt">Unit: {sub.unit || 'per visit'}</span>
                        <button 
                          className="btn-book-subservice"
                          onClick={() => handleInitiateBooking(sub)}
                        >
                          Book Now ⚡
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {providerActiveTab === 'portfolio' && (
            <div className="portfolio-panel">
              <h3>Work Portfolio & Project Photos</h3>
              {loadingPortfolio ? (
                <div className="dash-loading-state"><div className="spinner"></div></div>
              ) : providerPortfolio.length === 0 ? (
                <p className="no-data-notice">No portfolio photos uploaded yet.</p>
              ) : (
                <div className="portfolio-gallery-grid">
                  {providerPortfolio.map((item) => (
                    <div key={item.id} className="gallery-item-card" onClick={() => setPreviewImage(item.url)}>
                      <img src={item.url} alt={item.caption || 'Work photo'} />
                      {item.caption && <div className="img-caption-bar">{item.caption}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {providerActiveTab === 'reviews' && (
            <div className="reviews-panel">
              <h3>Customer Feedback & Ratings</h3>
              {loadingReviews ? (
                <div className="dash-loading-state"><div className="spinner"></div></div>
              ) : providerReviews.length === 0 ? (
                <p className="no-data-notice">No reviews published yet for this provider.</p>
              ) : (
                <div className="reviews-list-wrapper">
                  {providerReviews.map((rev) => (
                    <div key={rev.id} className="review-card-item">
                      <div className="review-header">
                        <span className="reviewer-name">👤 {rev.customerName || 'Customer'}</span>
                        <span className="review-stars">{"⭐".repeat(rev.rating || 5)}</span>
                      </div>
                      <p className="review-comment-txt">"{rev.comment}"</p>
                      <small className="review-date-txt">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
