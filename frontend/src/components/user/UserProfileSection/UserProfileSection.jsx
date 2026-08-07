
import React from 'react';
import './UserProfileSection.css';

export default function UserProfileSection({
  profileName,
  setProfileName,
  profilePhone,
  setProfilePhone,
  profileEmail,
  profileAddress,
  setProfileAddress,
  profileMsg,
  customerBookings = [],
  handleSaveProfile
}) {
  return (
    <div className="main-tab-content">
      <div className="profile-container-grid">
        
        {/* Left Profile Avatar Summary Card */}
        <div className="profile-left-card">
          <div className="avatar-large-circle">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <h2>{profileName}</h2>
          <span className="user-role-badge">Verified Customer</span>
          <p className="profile-email-text">{profileEmail}</p>
          <div className="profile-stats-list">
            <div className="p-stat-item">
              <span>Total Bookings</span>
              <strong>{customerBookings.length}</strong>
            </div>
            <div className="p-stat-item">
              <span>Account Status</span>
              <strong className="status-active-txt">🟢 Active</strong>
            </div>
          </div>
        </div>

        {/* Right Profile Details Form */}
        <div className="profile-right-card">
          <h2>Account Details & Settings</h2>
          <p className="subtitle">Update your contact details and default delivery address for home services.</p>

          {profileMsg && (
            <div className="profile-success-alert">{profileMsg}</div>
          )}

          <form onSubmit={handleSaveProfile} className="profile-edit-form">
            <div className="form-row-2col">
              <div className="form-group-block">
                <label className="field-label">Full Name</label>
                <input 
                  type="text" 
                  className="dash-input-text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-block">
                <label className="field-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="dash-input-text" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-block">
              <label className="field-label">Email Address (Account ID)</label>
              <input 
                type="email" 
                className="dash-input-text disabled-field" 
                value={profileEmail}
                disabled
              />
            </div>

            <div className="form-group-block">
              <label className="field-label">Default Home Service Delivery Address</label>
              <textarea 
                className="dash-textarea" 
                rows="3"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="Enter flat/house number, street name, locality, landmark..."
                required
              />
            </div>

            <button type="submit" className="btn-save-profile">
              Save Profile Changes ✓
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
