
import React from 'react';
import './ReviewModal.css';

export default function ReviewModal({
  reviewModalOpen,
  setReviewModalOpen,
  reviewRating,
  setReviewRating,
  reviewHoverRating,
  setReviewHoverRating,
  reviewComment,
  setReviewComment,
  handleSubmitReview,
  submittingReview
}) {
  if (!reviewModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
      <div className="review-modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setReviewModalOpen(false)}>✕</button>

        <div className="review-modal-header">
          <div className="review-modal-icon-badge">⭐</div>
          <h2>Rate Your Experience</h2>
          <p>How satisfied were you with the completed service?</p>
        </div>

        {/* Interactive 5-Star Rating Component */}
        <div className="star-rating-interactive-box">
          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (reviewHoverRating || reviewRating);
              return (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${isFilled ? 'filled' : ''}`}
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHoverRating(star)}
                  onMouseLeave={() => setReviewHoverRating(0)}
                >
                  ★
                </button>
              );
            })}
          </div>
          <div className="rating-meaning-badge">
            { (reviewHoverRating || reviewRating) === 5 && '😍 5/5 — Excellent! Exceeded Expectations' }
            { (reviewHoverRating || reviewRating) === 4 && '😊 4/5 — Good & Satisfactory Work' }
            { (reviewHoverRating || reviewRating) === 3 && '😐 3/5 — Average Experience' }
            { (reviewHoverRating || reviewRating) === 2 && '🙁 2/5 — Poor Quality Service' }
            { (reviewHoverRating || reviewRating) === 1 && '😡 1/5 — Terrible & Unsatisfactory' }
          </div>
        </div>

        {/* Review Comment Textarea */}
        <div className="form-group-block">
          <label className="field-label" style={{ marginBottom: '0.4rem', display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#374151' }}>
            Write a Review (Optional)
          </label>
          <textarea 
            className="review-textarea-field" 
            rows="4" 
            placeholder="Tell us what you liked about the service! Was the partner punctual, polite, and clean?"
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
          />
        </div>

        <div className="review-modal-actions">
          <button 
            type="button"
            className="btn-cancel-review-modal"
            onClick={() => setReviewModalOpen(false)}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="btn-submit-review-modal" 
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review ⭐'}
          </button>
        </div>
      </div>
    </div>
  );
}
