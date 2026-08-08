
import React from 'react';
import './ReportIssueModal.css';

export default function ReportIssueModal({
  reportModalOpen,
  setReportModalOpen,
  reportBooking,
  reportSuccess,
  handleSubmitReport,
  selectedIssueType,
  setSelectedIssueType,
  reportDescription,
  setReportDescription,
  handleReportImageUpload,
  uploadingReportImage,
  reportImageFiles = [],
  handleRemoveReportImage,
  submittingReport
}) {
  if (!reportModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
      <div className="report-modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setReportModalOpen(false)}>✕</button>

        {!reportSuccess ? (
          <>
            <div className="report-modal-header">
              <div className="report-modal-icon-badge">🚨</div>
              <div>
                <h2>Report Issue to Admin</h2>
                <p className="report-modal-subtitle">
                  Booking Ref: <strong>#EMH-{reportBooking?.id}</strong> ({reportBooking?.serviceType})
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="report-form-body">
              <div className="form-group-block">
                <label className="field-label">Issue Category</label>
                <select
                  className="dash-input-text"
                  value={selectedIssueType}
                  onChange={e => setSelectedIssueType(e.target.value)}
                  required
                >
                  <option value="Provider didn't arrive">Provider didn't arrive / No Show</option>
                  <option value="Poor Quality Work">Poor Quality Work / Damage Caused</option>
                  <option value="Overcharged Payment">Overcharged Payment / Extra Money Demanded</option>
                  <option value="Unprofessional Behavior">Unprofessional / Rude Behavior</option>
                  <option value="Incomplete Work">Work Left Incomplete</option>
                  <option value="Other Issue">Other Issue</option>
                </select>
              </div>

              <div className="form-group-block">
                <label className="field-label">Describe Problem in Detail</label>
                <textarea
                  className="dash-textarea"
                  rows="4"
                  placeholder="Explain exactly what happened, arrival times, work done, or extra charges demanded..."
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-block">
                <label className="field-label">Attach Proof Photo / Invoice Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReportImageUpload}
                  disabled={uploadingReportImage}
                  className="file-upload-input"
                />
                {uploadingReportImage && (
                  <span className="uploading-txt">⏳ Uploading image proof...</span>
                )}
                
                {reportImageFiles.length > 0 && (
                  <div className="report-uploaded-thumbs">
                    {reportImageFiles.map((img, idx) => (
                      <div key={idx} className="thumb-preview-item">
                        <img src={img.url} alt="Proof preview" />
                        <button
                          type="button"
                          className="btn-remove-thumb"
                          onClick={() => handleRemoveReportImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="report-modal-actions">
                <button
                  type="button"
                  className="btn-cancel-report"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-report"
                  disabled={submittingReport || uploadingReportImage}
                >
                  {submittingReport ? 'Submitting Ticket...' : 'Submit Complaint to Admin 🚨'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="report-success-body">
            <div className="success-icon-badge">✅</div>
            <h2>Complaint Ticket Raised!</h2>
            <p className="ticket-id-txt">Ticket ID: <strong>{reportSuccess.ticketId}</strong></p>
            <p className="ticket-desc">
              Your issue regarding <strong>#EMH-{reportBooking?.id}</strong> has been logged. Our Customer Support & Admin team will review and resolve this within 24 hours.
            </p>
            <button
              className="btn-close-report-success"
              onClick={() => setReportModalOpen(false)}
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
