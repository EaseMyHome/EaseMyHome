
import React from 'react';
import './BookingModal.css';

export default function BookingModal({
  bookingSubService,
  setBookingSubService,
  selectedProvider,
  setSelectedProvider,
  bookingSuccess,
  handleConfirmBookingRequest,
  bookingDate,
  setBookingDate,
  timeSlots = [],
  bookingTimeSlot,
  setBookingTimeSlot,
  customTime,
  setCustomTime,
  bookingAddress,
  setBookingAddress,
  bookingNotes,
  setBookingNotes,
  submittingBooking,
  setActiveMainTab
}) {
  if (!bookingSubService) return null;

  return (
    <div className="modal-overlay" onClick={() => setBookingSubService(null)}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setBookingSubService(null)}>✕</button>

        {!bookingSuccess ? (
          <form onSubmit={handleConfirmBookingRequest} className="booking-modal-form">
            <div className="modal-header-block">
              <span className="modal-tag-pill">⚡ FAST BOOKING APPOINTMENT</span>
              <h2>Book Service: {bookingSubService.name}</h2>
              <p className="modal-provider-sub">
                Selected Partner: <strong>{selectedProvider?.name}</strong> ({selectedProvider?.serviceType})
              </p>
            </div>

            {/* Service Summary Card */}
            <div className="modal-service-summary-card">
              <div className="summary-left">
                <span className="summary-lbl">Selected Package Rate</span>
                <span className="summary-val">{bookingSubService.name} ({bookingSubService.unit || 'per visit'})</span>
              </div>
              <div className="summary-right">
                <span className="summary-price-tag">₹{bookingSubService.price}</span>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="form-group-block">
              <label className="field-label">📅 1. Preferred Service Date</label>
              <input 
                type="date" 
                className="dash-input-text"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-block">
              <label className="field-label">⏰ 2. Choose Time Slot</label>
              <div className="time-slots-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-pill ${bookingTimeSlot === slot && !customTime ? 'selected' : ''}`}
                    onClick={() => {
                      setBookingTimeSlot(slot);
                      setCustomTime('');
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group-block">
              <label className="field-label">Or Custom Specific Time (Optional):</label>
              <input 
                type="text" 
                className="dash-input-text"
                placeholder="e.g. 10:30 AM sharply"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>

            <div className="form-group-block">
              <label className="field-label">📍 3. Service Delivery Address</label>
              <textarea 
                className="dash-textarea"
                rows="2"
                value={bookingAddress}
                onChange={(e) => setBookingAddress(e.target.value)}
                placeholder="Enter complete address..."
                required
              />
            </div>

            <div className="form-group-block">
              <label className="field-label">📝 4. Special Instructions (Optional)</label>
              <input 
                type="text" 
                className="dash-input-text"
                placeholder="e.g. Ring bell twice, bring long ladder, call before arriving..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="modal-actions-row">
              <button type="button" className="btn-cancel-modal" onClick={() => setBookingSubService(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-confirm-booking" disabled={submittingBooking}>
                {submittingBooking ? 'Submitting Request...' : 'Confirm Booking Request →'}
              </button>
            </div>
          </form>
        ) : (
          /* BOOKING SUCCESS STATE */
          <div className="booking-success-container">
            <div className="success-icon-animated">🎉</div>
            <h2>Booking Request Sent!</h2>
            <p>Your service request has been sent to <strong>{selectedProvider?.name}</strong>. The provider will review and accept your time slot.</p>

            <div className="booking-receipt-card">
              <div className="receipt-row">
                <span>Booking ID</span>
                <strong>#EMH-{bookingSuccess.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Sub-Service</span>
                <strong>{bookingSubService.name}</strong>
              </div>
              <div className="receipt-row">
                <span>Scheduled Date</span>
                <strong>📅 {bookingSuccess.bookingDate}</strong>
              </div>
              <div className="receipt-row">
                <span>Scheduled Time</span>
                <strong>⏰ {bookingSuccess.bookingTime}</strong>
              </div>
              <div className="receipt-row">
                <span>Delivery Address</span>
                <strong className="address-trunc">{bookingSuccess.address}</strong>
              </div>
              <div className="receipt-row">
                <span>Status</span>
                <span className="status-pending-pill">⏳ PENDING APPROVAL</span>
              </div>
            </div>

            <button 
              className="btn-done-close" 
              onClick={() => { 
                setBookingSubService(null); 
                setSelectedProvider(null);
                setActiveMainTab('bookings'); // Switch directly to My Bookings tab!
              }}
            >
              View My Bookings →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
