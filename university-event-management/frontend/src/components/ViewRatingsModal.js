import React, { useState, useEffect } from "react";
import theme from "../theme";
import Card from "./Card";
import Button from "./Button";
import { ratingAPI } from "../services/api";
import toast from "react-hot-toast";

const ViewRatingsModal = ({ isOpen, onClose, event }) => {
  const [ratings, setRatings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchRatings();
    }
  }, [isOpen, event]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await ratingAPI.getEventRatings(event._id);
      setRatings(response.data.data.ratings);
      setStatistics(response.data.data.statistics);
    } catch (error) {
      toast.error(error.message || "Failed to load ratings");
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
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
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
    zIndex: 1,
  };

  const headerStyles = {
    marginBottom: theme.spacing[6],
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

  const statisticsCardStyles = {
    background: theme.colors.background.gradient,
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
    color: theme.colors.text.white,
  };

  const statsGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: theme.spacing[4],
    marginTop: theme.spacing[4],
  };

  const statBoxStyles = {
    textAlign: "center",
  };

  const statValueStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[1],
  };

  const statLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  };

  const ratingItemStyles = {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    transition: "all 0.2s ease",
  };

  const ratingHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  };

  const userInfoStyles = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  };

  const avatarStyles = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.text.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  };

  const userNameStyles = {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  };

  const userRoleStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textTransform: "capitalize",
  };

  const starsStyles = {
    color: theme.colors.warning.main,
    fontSize: theme.typography.fontSize.lg,
  };

  const commentStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[2],
  };

  const dateStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  };

  const distributionStyles = {
    marginTop: theme.spacing[4],
  };

  const distributionBarStyles = (count, total) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  });

  const barLabelStyles = {
    minWidth: "60px",
    fontSize: theme.typography.fontSize.sm,
    color: "inherit",
  };

  const barContainerStyles = {
    flex: 1,
    height: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  };

  const barFillStyles = (percentage) => ({
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: theme.borderRadius.full,
    transition: "width 0.3s ease",
  });

  const barCountStyles = {
    minWidth: "30px",
    fontSize: theme.typography.fontSize.sm,
    color: "inherit",
    textAlign: "right",
  };

  const emptyStateStyles = {
    textAlign: "center",
    padding: theme.spacing[8],
    color: theme.colors.text.secondary,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <Card style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyles} onClick={onClose}>
          ×
        </button>

        <div style={headerStyles}>
          <h2 style={titleStyles}>Event Ratings & Comments</h2>
          <p style={eventTitleStyles}>{event?.title}</p>
        </div>

        {loading ? (
          <div style={emptyStateStyles}>
            <p>Loading ratings...</p>
          </div>
        ) : statistics && statistics.totalRatings > 0 ? (
          <>
            {/* Statistics Card */}
            <div style={statisticsCardStyles}>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[2],
                  color: "inherit",
                }}
              >
                Overall Rating
              </h3>

              <div style={statsGridStyles}>
                <div style={statBoxStyles}>
                  <div style={statValueStyles}>
                    {statistics.averageRating}
                  </div>
                  <div style={statLabelStyles}>Average Rating</div>
                </div>

                <div style={statBoxStyles}>
                  <div style={statValueStyles}>
                    {statistics.totalRatings}
                  </div>
                  <div style={statLabelStyles}>Total Ratings</div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div style={distributionStyles}>
                <h4
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing[3],
                    color: "inherit",
                  }}
                >
                  Rating Distribution
                </h4>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} style={distributionBarStyles()}>
                    <div style={barLabelStyles}>{star} ★</div>
                    <div style={barContainerStyles}>
                      <div
                        style={barFillStyles(
                          statistics.totalRatings > 0
                            ? (statistics.ratingDistribution[star] /
                                statistics.totalRatings) *
                                100
                            : 0
                        )}
                      />
                    </div>
                    <div style={barCountStyles}>
                      {statistics.ratingDistribution[star]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Ratings */}
            <div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[4],
                }}
              >
                All Reviews ({ratings.length})
              </h3>

              {ratings.map((ratingItem) => (
                <div
                  key={ratingItem._id}
                  style={ratingItemStyles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadows.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={ratingHeaderStyles}>
                    <div style={userInfoStyles}>
                      <div style={avatarStyles}>
                        {getInitials(ratingItem.userName)}
                      </div>
                      <div>
                        <div style={userNameStyles}>
                          {ratingItem.userName}
                        </div>
                        <div style={userRoleStyles}>
                          {ratingItem.userRole}
                        </div>
                      </div>
                    </div>
                    <div style={starsStyles}>
                      {renderStars(ratingItem.rating)}
                    </div>
                  </div>

                  <p style={commentStyles}>{ratingItem.comment}</p>

                  <div style={dateStyles}>
                    {formatDate(ratingItem.createdAt)}
                    {ratingItem.updatedAt !== ratingItem.createdAt &&
                      " (edited)"}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={emptyStateStyles}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: theme.spacing[4],
              }}
            >
              💬
            </div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              No Ratings Yet
            </h3>
            <p>Be the first to rate this event!</p>
          </div>
        )}

        <div
          style={{
            marginTop: theme.spacing[6],
            paddingTop: theme.spacing[4],
            borderTop: `1px solid ${theme.colors.border.default}`,
            textAlign: "right",
          }}
        >
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ViewRatingsModal;