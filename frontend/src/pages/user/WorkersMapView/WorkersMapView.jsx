import React, { useEffect, useRef, useState } from 'react';
import './WorkersMapView.css';

export default function WorkersMapView({ 
  activeWorkers = [], 
  userLocation = null, 
  onSelectWorker,
  selectedCategory = 'All'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedMapWorker, setSelectedMapWorker] = useState(null);
  const [mapRadiusMode, setMapRadiusMode] = useState('10km'); // '10km' | 'all'

  // Default center coordinates (Mumbai or user saved location)
  const centerLat = userLocation?.latitude || 19.0596;
  const centerLng = userLocation?.longitude || 72.8295;

  // Compute worker coordinates relative to user location
  const workersWithCoords = activeWorkers.map((worker) => {
    if (worker.latitude && worker.longitude) {
      const dist = (Math.hypot(parseFloat(worker.latitude) - centerLat, parseFloat(worker.longitude) - centerLng) * 111).toFixed(1);
      return { 
        ...worker, 
        lat: parseFloat(worker.latitude), 
        lng: parseFloat(worker.longitude),
        distanceKm: dist
      };
    }
    // Deterministic offset based on provider ID
    const id = worker.id || 1;
    const angle = (id * 137.5) * (Math.PI / 180);
    const distanceKm = 0.6 + ((id * 2.7) % 4.2);
    const deltaLat = (distanceKm / 111) * Math.cos(angle);
    const deltaLng = (distanceKm / (111 * Math.cos(centerLat * (Math.PI / 180)))) * Math.sin(angle);

    return {
      ...worker,
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng,
      distanceKm: distanceKm.toFixed(1)
    };
  });

  // Filter displayed workers according to selected mapRadiusMode ('10km' vs 'all')
  const displayedWorkers = workersWithCoords.filter(worker => {
    if (mapRadiusMode === '10km') {
      return parseFloat(worker.distanceKm) <= 10.0;
    }
    return true;
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    // Clean up previous map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Configure default Leaflet icon paths
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Create Map Instance
    const initialZoom = mapRadiusMode === '10km' ? 13 : 11;
    const map = window.L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: initialZoom,
      zoomControl: false
    });
    mapInstanceRef.current = map;

    // Add Zoom Control to Top Right
    window.L.control.zoom({ position: 'topright' }).addTo(map);

    // Tile Layer: OpenStreetMap Carto (Clean tile theme)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // 1. Add User Location Marker (Red Pin with pulse circle)
    const userIcon = window.L.divIcon({
      className: 'custom-user-map-pin',
      html: `<div class="user-pin-wrapper">
               <div class="user-pulse-ring"></div>
               <div class="user-pin-core">🏠</div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const userMarker = window.L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup(`
      <div class="map-popup-user">
        <strong>📍 Your Delivery Location</strong>
        <p>${userLocation?.address || 'Current Selected Address'}</p>
      </div>
    `);

    // 2. Add Displayed Worker Markers
    markersRef.current = [];

    displayedWorkers.forEach((worker) => {
      const avatarUrl = worker.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80';
      const serviceBadge = worker.serviceType || 'Partner';
      
      const workerIcon = window.L.divIcon({
        className: 'custom-worker-map-pin',
        html: `<div class="worker-pin-card">
                 <img src="${avatarUrl}" alt="${worker.name}" class="worker-pin-avatar" />
                 <span class="worker-pin-status">🟢</span>
                 <div class="worker-pin-label">${worker.name.split(' ')[0]} • ${serviceBadge}</div>
               </div>`,
        iconSize: [120, 50],
        iconAnchor: [60, 25]
      });

      const marker = window.L.marker([worker.lat, worker.lng], { icon: workerIcon }).addTo(map);
      marker.workerData = worker;

      marker.on('click', () => {
        setSelectedMapWorker(worker);
      });

      markersRef.current.push(marker);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, displayedWorkers.length, mapRadiusMode]);

  const handleRecenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], mapRadiusMode === '10km' ? 14 : 11, { animate: true });
    }
  };

  const handleFocusWorkerOnMap = (worker) => {
    setSelectedMapWorker(worker);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([worker.lat, worker.lng], 15, { animate: true });
    }
  };

  return (
    <div className="workers-map-wrapper">
      {/* Top Map Control Banner */}
      <div className="map-top-bar">
        <div className="map-bar-info">
          <span className="live-radar-dot">🟢 Live Radar</span>
          <h3>{displayedWorkers.length} Workers Displayed on Map</h3>
          <p>
            Showing {mapRadiusMode === '10km' ? 'nearest providers within 10 km radius' : 'all active service partners across the city'} of <strong>{userLocation?.address ? `${userLocation.address.substring(0, 30)}...` : 'Your Area'}</strong>
          </p>
        </div>

        <div className="map-bar-actions">
          {/* Map Radius Toggle Pills */}
          <div className="map-radius-toggle-pills">
            <button 
              type="button" 
              className={`btn-radius-toggle ${mapRadiusMode === '10km' ? 'active' : ''}`}
              onClick={() => setMapRadiusMode('10km')}
            >
              📍 Within 10 km
            </button>
            <button 
              type="button" 
              className={`btn-radius-toggle ${mapRadiusMode === 'all' ? 'active' : ''}`}
              onClick={() => setMapRadiusMode('all')}
            >
              🌐 All Workers ({workersWithCoords.length})
            </button>
          </div>

          <button type="button" className="btn-recenter-map" onClick={handleRecenterMap}>
            🎯 Recenter
          </button>
        </div>
      </div>

      {/* Main Map Container Grid */}
      <div className="map-body-grid">
        {/* Leaflet Map Canvas */}
        <div className="map-canvas-container">
          <div ref={mapContainerRef} className="leaflet-map-element" />

          {/* Floating Worker Detail Card Overlay */}
          {selectedMapWorker && (
            <div className="map-worker-float-card">
              <button 
                type="button" 
                className="btn-close-float-card" 
                onClick={() => setSelectedMapWorker(null)}
              >
                ✕
              </button>

              <div className="float-card-content">
                <img 
                  src={selectedMapWorker.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80'} 
                  alt={selectedMapWorker.name} 
                  className="float-avatar"
                />

                <div className="float-info">
                  <span className="float-online-tag">🟢 Available Now • {selectedMapWorker.distanceKm} km away</span>
                  <h4 className="float-name">{selectedMapWorker.name}</h4>
                  <span className="float-service-badge">{selectedMapWorker.serviceType} Specialist</span>
                  <div className="float-meta">
                    <span>💼 {selectedMapWorker.experience || 2}+ Yrs Exp</span>
                    <span>📍 {selectedMapWorker.coverageArea || 'Local Radius'}</span>
                  </div>
                </div>
              </div>

              <div className="float-card-actions">
                <button 
                  type="button" 
                  className="btn-view-worker-profile"
                  onClick={() => onSelectWorker(selectedMapWorker)}
                >
                  View Profile & Book Services →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar List of Live Workers */}
        <div className="map-sidebar-workers">
          <div className="sidebar-header">
            <h4>Active Workers ({displayedWorkers.length})</h4>
            <small>{mapRadiusMode === '10km' ? 'Filtered: < 10km radius' : 'Showing all workers'}</small>
          </div>

          <div className="sidebar-list-scroll">
            {displayedWorkers.length === 0 ? (
              <div className="map-no-workers">
                <span>👷‍♂️</span>
                <p>No active workers found within 10 km radius.</p>
                <button 
                  type="button" 
                  className="btn-pinpoint" 
                  onClick={() => setMapRadiusMode('all')}
                  style={{ marginTop: '0.5rem' }}
                >
                  Show All Workers Instead
                </button>
              </div>
            ) : (
              displayedWorkers.map((worker) => (
                <div 
                  key={worker.id}
                  className={`map-sidebar-item ${selectedMapWorker?.id === worker.id ? 'active' : ''}`}
                  onClick={() => handleFocusWorkerOnMap(worker)}
                >
                  <img 
                    src={worker.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=100&q=80'} 
                    alt={worker.name} 
                    className="sidebar-avatar"
                  />
                  <div className="sidebar-worker-info">
                    <h5>{worker.name}</h5>
                    <span className="sidebar-service">{worker.serviceType}</span>
                    <div className="sidebar-distance">
                      <span>📍 {worker.distanceKm} km away</span>
                      <span className="dot-sep">•</span>
                      <span className="status-live">🟢 Active</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-pinpoint"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFocusWorkerOnMap(worker);
                    }}
                  >
                    📍 Locate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
