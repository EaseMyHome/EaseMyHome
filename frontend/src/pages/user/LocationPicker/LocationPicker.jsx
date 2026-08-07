import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './LocationPicker.css';

export default function LocationPicker() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Per-user localStorage key so each account has its own saved address
  const storageKey = user?.email ? `user_location_${user.email}` : 'user_location';

  // Pre-fill from existing saved address (for edit flow)
  const existingLocation = (() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || null; } catch { return null; }
  })();
  const isEditMode = !!existingLocation?.address;

  const [address, setAddress] = useState(existingLocation?.address || 'Bandra West, Mumbai');
  const [landmark, setLandmark] = useState(existingLocation?.landmark || '');
  const [pincode, setPincode] = useState(existingLocation?.pincode || '');
  const [coordinates, setCoordinates] = useState(
    existingLocation?.latitude
      ? { lat: existingLocation.latitude, lng: existingLocation.longitude }
      : { lat: 19.0596, lng: 72.8295 }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Setup Leaflet Map
  useEffect(() => {
    if (window.L) {
      // Fix default marker icon issues in Leaflet
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map
      const map = window.L.map('customer-location-map').setView([coordinates.lat, coordinates.lng], 14);
      mapRef.current = map;

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add draggable marker
      const marker = window.L.marker([coordinates.lat, coordinates.lng], {
        draggable: true
      }).addTo(map);
      markerRef.current = marker;

      // Listen to dragend events
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        const lat = parseFloat(position.lat.toFixed(4));
        const lng = parseFloat(position.lng.toFixed(4));
        setCoordinates({ lat, lng });

        // Reverse geocode
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const simplified = parts.slice(0, 4).join(',').trim();
            setAddress(simplified);
            if (data.address && data.address.postcode) {
              setPincode(data.address.postcode);
            }
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }
      });

      // Listen to map clicks
      map.on('click', async (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(4));
        const lng = parseFloat(e.latlng.lng.toFixed(4));
        setCoordinates({ lat, lng });
        marker.setLatLng([lat, lng]);

        // Reverse geocode
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const simplified = parts.slice(0, 4).join(',').trim();
            setAddress(simplified);
            if (data.address && data.address.postcode) {
              setPincode(data.address.postcode);
            }
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Search location by address name
  const handleSearchLocation = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setCoordinates({ lat: newLat, lng: newLng });

        if (mapRef.current) {
          mapRef.current.setView([newLat, newLng], 14);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        }
      }
    } catch (err) {
      console.error('Address search error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  // Get Current Location via Browser GPS
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setCoordinates({ lat, lng });

          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 14);
          }
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              const simplified = parts.slice(0, 4).join(',').trim();
              setAddress(simplified);
              if (data.address && data.address.postcode) {
                setPincode(data.address.postcode);
              }
            }
          } catch (err) {
            console.error('Reverse geocoding error:', err);
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn('GPS location error:', error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Please select or enter your delivery address');
      return;
    }

    const locationData = {
      address: address.trim(),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      latitude: coordinates.lat,
      longitude: coordinates.lng
    };

    // Save under per-user key so each account has its own address
    localStorage.setItem(storageKey, JSON.stringify(locationData));
    localStorage.setItem('user_location', JSON.stringify(locationData));

    // Save location to MySQL Database if logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:8085/api/auth/location', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(locationData)
        });
      } catch (err) {
        console.error('Failed to sync location to DB:', err);
      }
    }

    navigate('/user/dashboard');
  };


  return (
    <div className="location-picker-page">
      <div className="location-card glass-panel">
        <div className="location-header">
          <div className="icon-badge">📍</div>
          <h2>{isEditMode ? 'Update Your Location' : 'Set Delivery Location'}</h2>
          <p>{isEditMode
            ? 'Update your home address for service bookings. Click the map or drag the pin.'
            : 'Click on the map or drag the pin to set your home address for service bookings.'
          }</p>
        </div>

        {/* Real OpenStreetMap Container */}
        <div className="leaflet-map-container">
          <div id="customer-location-map" style={{ width: '100%', height: '280px', borderRadius: '16px' }}></div>
          <div className="map-coords-badge">
            <span>Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}</span>
          </div>
          <button 
            type="button" 
            className="btn-gps-floating" 
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? 'Locating...' : '🎯 Locate Me (GPS)'}
          </button>
        </div>

        {/* Address Form */}
        <form onSubmit={handleSaveLocation} className="location-form">
          <div className="form-group">
            <label>Full Address / Area *</label>
            <div className="address-input-wrap">
              <input 
                type="text" 
                placeholder="e.g. Flat 402, Bandra West, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={handleSearchLocation}
                required
              />
              <button 
                type="button" 
                className="btn-search-loc"
                onClick={handleSearchLocation}
                disabled={geocoding}
              >
                {geocoding ? '...' : '🔍 Find'}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Landmark (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Near Station"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input 
                type="text" 
                placeholder="e.g. 400050"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-confirm-location">
              Confirm Location & Enter Dashboard →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
