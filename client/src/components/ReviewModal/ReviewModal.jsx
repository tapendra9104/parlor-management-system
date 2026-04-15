/**
 * ============================================
 * SalonFlow — Review Modal Component
 * ============================================
 * Star rating selector with text feedback.
 * Used for post-appointment reviews.
 */

import { useState } from 'react';
import { FiStar, FiX, FiSend } from 'react-icons/fi';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, appointment }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit?.({
        appointmentId: appointment?._id,
        rating,
        feedback,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal review-modal" id="review-modal">
        <div className="modal-header">
          <h2 className="modal-title">Rate Your Experience</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {appointment && (
          <div className="review-appointment-info">
            <div className="review-services">
              {(appointment.services || []).map((s, i) => (
                <span key={i} className="spec-tag">{s.name}</span>
              ))}
            </div>
            {appointment.staff?.userId?.name && (
              <p className="review-staff">Stylist: <strong>{appointment.staff.userId.name}</strong></p>
            )}
          </div>
        )}

        {/* Star Rating */}
        <div className="review-rating-section">
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`review-star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar size={32} />
              </button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <span className="review-rating-label">
              {ratingLabels[hoveredRating || rating]}
            </span>
          )}
        </div>

        {/* Feedback */}
        <div className="form-group">
          <label className="form-label">Your Feedback (Optional)</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Tell us about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            id="review-feedback"
          />
        </div>

        {/* Submit */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Maybe Later</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            id="review-submit"
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }}></span> : (
              <>Submit Review <FiSend /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
