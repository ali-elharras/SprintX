import React, { useState, useEffect } from "react";
import theme from "../theme";
import Card from "./Card";
import Button from "./Button";
import { ratingAPI } from "../services/api";
import toast from "react-hot-toast";

const RatingModal = ({ isOpen, onClose, event, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (isOpen && event) {
      fetchExistingRating();
    }
  }, [isOpen, event]);

  const fetchExistingRating = async () => {
    try {
      const response = await ratingAPI.getMyRating(event._id);
      if (response.data.success && response.data.data) {
        setExistingRating(response.data.data);
        setRating(response.data.data.rating);
        setComment(response.data.data.comment);
      }
    } catch (error) {
      // No existing rating, that's okay
      setExistingRating(null);
      setRating(0);
      setComment("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length === 0) {
      toast.error("Please write a comment");
      return;
    }

    setLoading(true);
    try {
      const eventType = event.isGymSession ? 'gym' : event.isCourtReservation ? 'court' : 'event';
      
      console.log('Submitting rating:', { // ADD THIS
      eventId: event._id,
      eventType,
      rating,
      comment: comment.trim()
    });
    
      
      const response = await ratingAPI.submitRating({
        eventId: event._id,
        eventType,
        rating,
        comment: comment.trim()
      });
     
      console.log('Rating response:', response); // ADD THIS

      toast.success(response.data.message || "Rating submitted successfully!");
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      onClose();
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Rating error details:', error); // ADD THIS
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const overlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: theme.spacing[4],
  };

  const modalStyles = {
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  };

  const headerStyles = {
    marginBottom: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    borderBottom: `2px solid ${theme.colors.border.default}`,
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const eventTitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const starsContainerStyles = {
    display: "flex",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6],
    justifyContent: "center",
  };

  const starStyles = (index) => ({
    fontSize: "48px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: (hoveredRating || rating) >= index 
      ? theme.colors.warning.main 
      : theme.colors.border.default,
    transform: (hoveredRating || rating) >= index ? "scale(1.1)" : "scale(1)",
  });

  const textareaStyles = {
    width: "100%",
    minHeight: "150px",
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    border: `2px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const buttonGroupStyles = {
    display: "flex",
    gap: theme.spacing[3],
    justifyContent: "flex-end",
    marginTop: theme.spacing[4],
  };

  const closeButtonStyles = {
    position: "absolute",
    top: theme.spacing[4],
    right: theme.spacing[4],
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: theme.colors.text.secondary,
    padding: theme.spacing[2],
    lineHeight: 1,
  };

  const ratingLabelStyles = {
    textAlign: "center",
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return labels[value] || "Rate this event";
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <Card style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyles} onClick={onClose}>
          ×
        </button>

        <div style={headerStyles}>
          <h2 style={titleStyles}>
            {existingRating ? "Update Your Rating" : "Rate & Comment"}
          </h2>
          <p style={eventTitleStyles}>{event?.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: theme.spacing[6] }}>
            <label
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
                textAlign: "center",
              }}
            >
              How would you rate this event?
            </label>
            
            <div style={starsContainerStyles}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={starStyles(star)}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={ratingLabelStyles}>
              {getRatingLabel(hoveredRating || rating)}
            </div>
          </div>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              htmlFor="comment"
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Your Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this event..."
              style={textareaStyles}
              maxLength={1000}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary.main;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border.default;
              }}
            />
            <div
              style={{
                marginTop: theme.spacing[2],
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.tertiary,
                textAlign: "right",
              }}
            >
              {comment.length}/1000 characters
            </div>
          </div>

          <div style={buttonGroupStyles}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {existingRating ? "Update Rating" : "Submit Rating"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RatingModal;