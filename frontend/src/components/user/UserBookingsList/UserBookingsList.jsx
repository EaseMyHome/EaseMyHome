
import React from 'react';
import './UserBookingsList.css';

export default function UserBookingsList({
  bookingFilterStatus,
  setBookingFilterStatus,
  customerBookings = [],
  filteredBookings = [],
  loadingBookings,
  getBookingAmount,
  saveBookingOtp,
  handleOpenReportModal,
  reportedBookingsMap = {},
  handleAcceptReschedule,
  handleDeclineReschedule,
  isBookingReviewed,
  openReviewModal,
  setSelectedBookingForPayment,
  setRazorpayModalOpen,
  fetchCustomerBookings
}) {
  return (
    <div className="main-tab-content">
      {/* Bookings Status Tabs */}
      <div className="bookings-status-tabs">
        {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'WORK_COMPLETED', 'COMPLETED', 'RESCHEDULED', 'DECLINED'].map((status) => (
          <button
            key={status}
            className={`status-tab-btn ${bookingFilterStatus === status ? 'active' : ''}`}
            onClick={() => setBookingFilterStatus(status)}
          >
            {status}
            {status === 'ALL' && ` (${customerBookings.length})`}
          </button>
        ))}
      </div>

      {loadingBookings ? (
        <div className="dash-loading-state">
          <div className="spinner"></div>
          <p>Loading your booking history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-workers-box">
          <div className="empty-icon">📦</div>
          <h3>No {bookingFilterStatus} Bookings</h3>
          <p>You have no bookings under this status filter.</p>
        </div>
      ) : (
        <div className="orders-list-wrapper">
          {filteredBookings.map((b) => (
            <div key={b.id} className="order-card-item">
              <div className="order-card-header">
                <div className="order-title-group">
                  <span className="order-id-badge">#EMH-{b.id}</span>
                  <h3>{b.serviceType}</h3>
                </div>
                <span className={`order-status-pill status-${(b.status || 'PENDING').toLowerCase()}`}>
                  {b.status}
                </span>
              </div>

              <div className="order-details-grid">
                <div className="detail-item">
                  <span className="lbl">Provider</span>
                  <strong>{b.providerName || b.provider?.name || 'Assigned Provider'}</strong>
                </div>
                <div className="detail-item">
                  <span className="lbl">Date & Time</span>
                  <strong>{b.bookingDate} ({b.bookingTime || 'Scheduled'})</strong>
                </div>
                <div className="detail-item">
                  <span className="lbl">Service Address</span>
                  <strong>{b.address}</strong>
                </div>
                <div className="detail-item">
                  <span className="lbl">Amount</span>
                  <strong>₹{getBookingAmount(b)}</strong>
                </div>
              </div>

              {b.completionOtp && (
                <div className="otp-verification-card">
                  <span className="otp-label">🔑 Completion OTP:</span>
                  <span className="otp-code-box">{b.completionOtp}</span>
                  <p className="otp-instruction">Share this 6-digit OTP with the service provider when they arrive at your location to start the job.</p>
                </div>
              )}

              {b.notes && (
                <div className="order-notes-bar">
                  <span>📝 Special Note: "{b.notes}"</span>
                </div>
              )}

              <div className="order-card-footer">
                <span className="order-guarantee-text">🔒 EaseMyHome Service Guarantee</span>
                
                <div className="order-footer-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {['ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'ON THE WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_COMPLETED', 'STARTED', 'COMPLETED'].includes(String(b.status || '').toUpperCase()) && (
                    reportedBookingsMap[b.id] ? (
                      reportedBookingsMap[b.id].status === 'Resolved' ? (
                        <div className="reported-status-badge resolved-badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>✅ Action Taken ({reportedBookingsMap[b.id].ticketId})</span>
                          <small style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>{reportedBookingsMap[b.id].adminResponse || 'Complaint investigated & resolved by Admin'}</small>
                        </div>
                      ) : reportedBookingsMap[b.id].status === 'False Complaint' ? (
                        <div className="reported-status-badge false-badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>❌ Dismissed: False Complaint ({reportedBookingsMap[b.id].ticketId})</span>
                          <small style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>{reportedBookingsMap[b.id].adminResponse || 'Dismissed: Invalid / False Complaint'}</small>
                        </div>
                      ) : (
                        <div className="reported-status-badge pending-badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>⚠️ Complaint Filed ({reportedBookingsMap[b.id].ticketId})</span>
                          <small style={{ fontSize: '0.72rem' }}>Status: {reportedBookingsMap[b.id].status || 'Open'} • Admin reviewing</small>
                        </div>
                      )
                    ) : (
                      <button 
                        type="button"
                        className="btn-report-issue"
                        onClick={() => handleOpenReportModal(b)}
                        title="Report an issue with this booking to EaseMyHome Admin"
                      >
                        ⚠️ Report Issue
                      </button>
                    )
                  )}

                  {b.status === 'RESCHEDULED' ? (
                    <div className="reschedule-action-buttons">
                      <button 
                        className="btn-accept-reschedule"
                        onClick={() => handleAcceptReschedule(b.id)}
                      >
                        Accept New Schedule ✓
                      </button>
                      <button 
                        className="btn-decline-reschedule"
                        onClick={() => handleDeclineReschedule(b.id)}
                      >
                        Reject Request ✕
                      </button>
                    </div>
                  ) : b.status === 'PENDING' ? (
                    <button 
                      className="btn-cancel-booking-request"
                      onClick={() => handleDeclineReschedule(b.id)}
                    >
                      Cancel Request
                    </button>
                  ) : (b.status === 'WORK_COMPLETED' || b.status === 'COMPLETED') ? (
                    <>
                      {!isBookingReviewed(b) ? (
                        <button 
                          type="button"
                          className="btn-leave-review"
                          onClick={() => openReviewModal(b.id)}
                        >
                          Leave a Review ⭐️
                        </button>
                      ) : (
                        <span className="review-submitted-badge" style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ✓ Reviewed ⭐
                        </span>
                      )}

                      {b.paymentStatus !== 'SUCCESS' && b.status !== 'COMPLETED' ? (
                        <button
                          type="button"
                          style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSelectedBookingForPayment(b);
                            setRazorpayModalOpen(true);
                          }}
                        >
                          Pay ₹{getBookingAmount(b)} via Razorpay 💳
                        </button>
                      ) : (
                        <span style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '0.75rem' }}>
                          Paid via Razorpay (₹{getBookingAmount(b)}) ✓
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
