import React, { useState, useEffect } from "react";
import theme from "../theme";
import Card from "./Card";
import Button from "./Button";
import Modal from "./Modal";
import { websiteRatingAPI } from "../services/api";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

const WebsiteRatingModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("overall");
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingRating();
    }
  }, [isOpen]);

  const fetchExistingRating = async () => {
    try {
      const response = await websiteRatingAPI.getMyRating();
      if (response.data.success && response.data.data) {
        setExistingRating(response.data.data);
        setRating(response.data.data.rating);
        setComment(response.data.data.comment);
        setCategory(response.data.data.category);
      }
    } catch (error) {
      // No existing rating, that's okay
      setExistingRating(null);
      setRating(0);
      setComment("");
      setCategory("overall");
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
      const response = await websiteRatingAPI.submitRating({
        rating,
        comment: comment.trim(),
        category,
      });

      if (response.data.success) {
        toast.success(
          existingRating
            ? "Rating updated successfully!"
            : "Thank you for your feedback!"
        );
        onClose();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit rating. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rate Your Experience">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.text }}
          >
            What would you like to rate?
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              focusRingColor: theme.colors.primary,
            }}
          >
            <option value="overall">Overall Experience</option>
            <option value="usability">Usability</option>
            <option value="design">Design</option>
            <option value="performance">Performance</option>
            <option value="features">Features</option>
          </select>
        </div>

        {/* Star Rating */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.text }}
          >
            Your Rating
          </label>
          <div className="flex gap-2 justify-center py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={40}
                  // Always show a yellow border; fill when selected/hovered
                  color={theme.colors.warning.main}
                  fill={
                    star <= (hoveredRating || rating) ? theme.colors.warning.main : "none"
                  }
                  strokeWidth={1.8}
                  style={{ transition: "all 140ms ease" }}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p
              className="text-center text-sm mt-2"
              style={{ color: theme.colors.text.secondary }}
            >
              {rating === 5 && "Excellent! ⭐"}
              {rating === 4 && "Very Good! 👍"}
              {rating === 3 && "Good 👌"}
              {rating === 2 && "Fair 😐"}
              {rating === 1 && "Needs Improvement 🔧"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.text }}
          >
            Your Feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          />
          <p
            className="text-xs mt-1 text-right"
            style={{ color: theme.colors.text.secondary }}
          >
            {comment.length}/1000 characters
          </p>
        </div>

        {existingRating && (
          <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: `${theme.colors.info.main}20`,
                color: theme.colors.info.main,
              }}
            >
            You previously rated this on{" "}
            {new Date(existingRating.createdAt).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || rating === 0}>
            {loading
              ? "Submitting..."
              : existingRating
              ? "Update Rating"
              : "Submit Rating"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WebsiteRatingModal;
