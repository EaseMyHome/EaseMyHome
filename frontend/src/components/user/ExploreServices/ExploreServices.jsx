
import React from 'react';
import Banner from '../Banner/Banner';
import WorkersMapView from '../../../pages/user/WorkersMapView/WorkersMapView';
import './ExploreServices.css';

export default function ExploreServices({
  exploreViewMode,
  setExploreViewMode,
  searchQuery,
  setSearchQuery,
  savedLocation,
  activeWorkers = [],
  categories = [],
  selectedCategory,
  setSelectedCategory,
  loading,
  handleOpenProviderModal
}) {
  return (
    <div className="main-tab-content">
      <Banner />
      <section className="workers-banner-card">
        <div className="banner-left">
          <span className="live-status-pill">
            {exploreViewMode === 'map' && !searchQuery 
              ? '🟢 Live Verified Workers • 📍 Nearest Partners (10 km Radius)' 
              : '🟢 Live Verified Workers • All Available Partners'}
          </span>
          <h1>
            {exploreViewMode === 'map' && !searchQuery 
              ? `${activeWorkers.length} Nearest Service Partners (10 km)` 
              : `${activeWorkers.length} Active Service Partners Available`}
          </h1>
          <p>
            {exploreViewMode === 'map' && !searchQuery 
              ? `Showing verified service partners within 10 km radius of ${savedLocation?.address ? savedLocation.address.substring(0, 30) + '...' : 'your area'}. Switch to Grid View or search to see all partners.`
              : 'Browse all active service providers, search sub-services or worker names, and click any provider card to view full profile & book.'}
          </p>
        </div>

        <div className="banner-right">
          <div className="workers-avatar-stack">
            {activeWorkers.slice(0, 4).map((w, idx) => (
              <img key={w.id || idx} src={w.selfieImage || `https://i.pravatar.cc/100?img=${idx + 10}`} alt={w.name} />
            ))}
            {activeWorkers.length > 4 && <div className="avatar-more">+{activeWorkers.length - 4}</div>}
          </div>
        </div>
      </section>

      {/* Category Selector Section */}
      <section className="section-block">
        <h2 className="section-heading">1. Select Category</h2>
        <div className="categories-scroll-wrapper">
          <button 
            className={`cat-btn ${selectedCategory === 'All' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            <span className="cat-icon">✨</span>
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id || cat.name}
              className={`cat-btn ${selectedCategory === (cat.name || cat.id) ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(cat.name || cat.id)}
            >
              <span className="cat-icon">{cat.image?.length < 5 ? cat.image : '🛠️'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Multi-Filter Search Bar */}
      <section className="section-block">
        <h2 className="section-heading">2. Search Workers or Sub-Services</h2>
        <div className="dashboard-search-bar">
          <span className="search-lens">🔍</span>
          <input 
            type="text" 
            placeholder="Search by worker name, category (e.g. Plumbing), or sub-service (e.g. Tap Repair, Sofa Cleaning)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕ Clear</button>
          )}
        </div>
      </section>

      {/* Active Workers Section */}
      <section className="section-block">
        <div className="section-title-row">
          <div className="title-with-filter">
            <h2 className="section-heading">Available Workers ({activeWorkers.length})</h2>
            {selectedCategory !== 'All' && (
              <span className="active-filter-tag">Filter: {selectedCategory}</span>
            )}
          </div>

          <div className="view-mode-toggle-pills">
            <button 
              type="button" 
              className={`view-mode-btn ${exploreViewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setExploreViewMode('grid')}
            >
              📱 Grid View
            </button>
            <button 
              type="button" 
              className={`view-mode-btn ${exploreViewMode === 'map' ? 'active' : ''}`}
              onClick={() => setExploreViewMode('map')}
            >
              🗺️ Live Map View ({activeWorkers.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="dash-loading-state">
            <div className="spinner"></div>
            <p>Finding active workers in your area...</p>
          </div>
        ) : activeWorkers.length === 0 ? (
          <div className="no-workers-box">
            <div className="empty-icon">👷‍♂️</div>
            <h3>No Workers Found</h3>
            <p>No active workers matched your search filter "{searchQuery}". Try selecting a different category or clearing the search query.</p>
            <button className="btn-reset-filters" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>Reset Filters</button>
          </div>
        ) : exploreViewMode === 'map' ? (
          <WorkersMapView 
            activeWorkers={activeWorkers}
            userLocation={savedLocation}
            onSelectWorker={handleOpenProviderModal}
            selectedCategory={selectedCategory}
          />
        ) : (
          <div className="workers-grid">
            {activeWorkers.map((worker) => (
              <div 
                key={worker.id} 
                className="worker-card"
                onClick={() => handleOpenProviderModal(worker)}
              >
                <div className="worker-card-header">
                  <img 
                    src={worker.selfieImage || `https://i.pravatar.cc/150?img=${worker.id || 1}`} 
                    alt={worker.name} 
                    className="worker-avatar"
                  />
                  <div className="worker-meta">
                    <h3>{worker.name}</h3>
                    <span className="worker-category-badge">🔧 {worker.serviceType}</span>
                  </div>
                </div>

                <div className="worker-card-body">
                  <div className="worker-stat-row">
                    <span>⭐ {worker.rating || '4.9'} ({worker.reviewsCount || 12} reviews)</span>
                    <span className="status-online">🟢 Active Partner</span>
                  </div>

                  <p className="worker-bio-snippet">
                    {worker.bio ? (worker.bio.length > 80 ? worker.bio.substring(0, 80) + '...' : worker.bio) : 'Verified professional offering quality home services.'}
                  </p>
                </div>

                <div className="worker-card-footer">
                  <button className="btn-view-services">View Services & Book →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
