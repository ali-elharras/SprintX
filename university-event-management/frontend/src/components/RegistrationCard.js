import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import theme, { getEventTypeColor } from "../theme";
import Button from "./Button";
import RatingModal from "./RatingModal";
import ViewRatingsModal from "./ViewRatingsModal";
import { useAuth } from "../context/AuthContext";

const RegistrationCard = ({ registration, onCancel, isPastEvent = false }) => {
  const { user } = useAuth();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showViewRatingsModal, setShowViewRatingsModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!registration || !registration.event) {
    return null;
  }

  const { event } = registration;
  
  // Check if user can rate events
  const canRateEvents = () => {
    const allowedRoles = ['student', 'staff', 'ta', 'professor'];
    return user && allowedRoles.includes(user.role.toLowerCase());
  };

  // Check if user can view ratings
  const canViewRatings = () => {
    const allowedRoles = ['student', 'staff', 'ta', 'professor', 'events_office', 'admin'];
    return user && allowedRoles.includes(user.role.toLowerCase());
  };

  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format gym session time (HH:MM format)
  const formatGymTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayNum) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum];
  };

  const isGymSession = registration.isGymSession || event.type === 'gym';
  const isCourtReservation = registration.isCourtReservation || event.type === 'court';
  
  // Determine if ratings and comments should be shown
  const showRatingsAndComments = !isGymSession && !isCourtReservation;

  // Check if cancellation is allowed (24 hours before event)
  const canCancel = () => {
    if (isPastEvent || registration.status === "cancelled") return false;
    
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const cancellationDeadline = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
    
    return now <= cancellationDeadline;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return theme.colors.success.main;
      case "pending":
        return theme.colors.warning.main;
      case "cancelled":
        return theme.colors.error.main;
      case "attended":
        return theme.colors.info.main;
      case "no-show":
        return theme.colors.text.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "attended":
        return "Attended";
      case "no-show":
        return "No Show";
      default:
        return status;
    }
  };

  const cardStyles = {
    position: "relative",
    opacity: registration.status === "cancelled" ? 0.7 : 1,
    background: theme.colors.background.paper,
    borderRadius: "20px",
    border: `2px solid ${isHovered ? getEventTypeColor(event.type) : '#e5e7eb'}`,
    boxShadow: isHovered
      ? "0 20px 40px rgba(0, 0, 0, 0.15)"
      : "0 10px 30px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    padding: theme.spacing[5],
  };

  const headerStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[3],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
    lineHeight: theme.typography.lineHeight.tight,
  };

  const typeStyles = {
    display: "inline-flex",
    alignItems: "center",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: getEventTypeColor(event.type),
    textTransform: "capitalize",
    marginBottom: theme.spacing[2],
  };

  const statusStyles = {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: `${getStatusColor(registration.status)}20`,
    color: getStatusColor(registration.status),
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: "capitalize",
  };

  const detailsStyles = {
    display: "grid",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  };

  const detailRowStyles = {
    display: "flex",
    alignItems: "center",
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const detailLabelStyles = {
    fontWeight: theme.typography.fontWeight.medium,
    minWidth: "100px",
    color: theme.colors.text.primary,
  };

  const detailValueStyles = {
    color: theme.colors.text.secondary,
  };

  const actionsStyles = {
    display: "flex",
    gap: theme.spacing[2],
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing[3],
    borderTop: `1px solid ${theme.colors.border.light}`,
  };

  const registrationDateStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  };

  const buttonGroupStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: theme.spacing[2],
  };

  return (
    <>
      <motion.div
        style={cardStyles}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Vertical Color Strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "8px",
            background: `linear-gradient(to bottom, ${getEventTypeColor(event.type)}, ${getEventTypeColor(event.type)}dd)`,
            borderTopLeftRadius: "18px",
            borderBottomLeftRadius: "18px",
            zIndex: 1,
          }}
        />
        {/* Header */}
        <div style={headerStyles}>
          <div style={{ flex: 1 }}>
            <div style={typeStyles}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getEventTypeColor(event.type),
                  marginRight: theme.spacing[2],
                }}
              />
              {event.type}
            </div>
            <h3 style={titleStyles}>{event.title}</h3>
          </div>
          <div style={statusStyles}>
            {getStatusText(registration.status)}
          </div>
        </div>

        {/* Event Details */}
        <div style={detailsStyles}>
          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>📅 Date:</span>
            <span style={detailValueStyles}>
              {isGymSession && event.dayOfWeek !== undefined 
                ? `${getDayName(event.dayOfWeek)}s (${formatDate(event.startDate)} - ${formatDate(event.endDate)})`
                : (
                  <>
                    {formatDate(event.startDate)}
                    {event.endDate && 
                      new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && 
                      ` - ${formatDate(event.endDate)}`
                    }
                  </>
                )
              }
            </span>
          </div>
          
          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>🕒 Time:</span>
            <span style={detailValueStyles}>
              {isGymSession && event.startTime 
                ? `${formatGymTime(event.startTime)} - ${formatGymTime(event.endTime)}`
                : isCourtReservation && event.startTime
                ? `${formatGymTime(event.startTime)} - ${formatGymTime(event.endTime)}`
                : (
                  <>
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </>
                )
              }
            </span>
          </div>

          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>📍 Location:</span>
            <span style={detailValueStyles}>
              {event.location}
              {event.room && ` (${event.room})`}
            </span>
          </div>

          {isGymSession && event.instructor && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>👤 Instructor:</span>
              <span style={detailValueStyles}>{event.instructor.name}</span>
            </div>
          )}

          {isGymSession && event.skillLevel && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>📊 Level:</span>
              <span style={{ ...detailValueStyles, textTransform: 'capitalize' }}>
                {event.skillLevel.replace('_', ' ')}
              </span>
            </div>
          )}

          {isCourtReservation && event.courtType && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>🏟️ Court Type:</span>
              <span style={{ ...detailValueStyles, textTransform: 'capitalize' }}>
                {event.courtType}
              </span>
            </div>
          )}

          {isCourtReservation && event.duration && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>⏱️ Duration:</span>
              <span style={detailValueStyles}>
                {Math.round(event.duration / 60)} hour{event.duration > 60 ? 's' : ''}
              </span>
            </div>
          )}

          {isCourtReservation && event.purpose && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>🎯 Purpose:</span>
              <span style={{ ...detailValueStyles, textTransform: 'capitalize' }}>
                {event.purpose}
              </span>
            </div>
          )}

          {(event.cost > 0 || (isCourtReservation && event.amountPaid !== undefined)) && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>💰 Cost:</span>
              <span style={detailValueStyles}>
                ${isCourtReservation ? event.amountPaid : event.cost}
                {(registration.paymentStatus || event.paymentStatus) && (
                  <span style={{ 
                    marginLeft: theme.spacing[2],
                    color: (registration.paymentStatus || event.paymentStatus) === 'paid' 
                      ? theme.colors.success.main 
                      : (registration.paymentStatus || event.paymentStatus) === 'waived'
                      ? theme.colors.info.main
                      : theme.colors.warning.main,
                    fontWeight: theme.typography.fontWeight.medium,
                    textTransform: 'capitalize'
                  }}>
                    ({registration.paymentStatus || event.paymentStatus})
                  </span>
                )}
              </span>
            </div>
          )}

          {event.maxParticipants && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>👥 Capacity:</span>
              <span style={detailValueStyles}>
                {event.currentParticipants}/{event.maxParticipants} participants
              </span>
            </div>
          )}

          {registration.checkedIn && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>✅ Check-in:</span>
              <span style={detailValueStyles}>
                {formatDate(registration.checkInTime)} at {formatTime(registration.checkInTime)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={actionsStyles}>
          <div style={registrationDateStyles}>
            Registered on {formatDate(registration.registrationDate)}
          </div>
          
          <div style={buttonGroupStyles}>
            {/* Show View Ratings button for allowed roles (only for regular events) */}
            {showRatingsAndComments && canViewRatings() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowViewRatingsModal(true)}
              >
                View All Ratings
              </Button>
            )}

            {/* Show Rate & Comment button only for past events and allowed roles (only for regular events) */}
            {showRatingsAndComments && isPastEvent && canRateEvents() && registration.status !== "cancelled" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowRatingModal(true)}
              >
                Rate & Comment
              </Button>
            )}

            {/* Existing Browse Events button */}
            {!isPastEvent && (
              <Link to="/events">
                <Button variant="outline" size="sm">
                  Browse Events
                </Button>
              </Link>
            )}
            
            {/* Existing Cancel button */}
            {canCancel() && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(registration._id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Special Requirements Display */}
        {(registration.specialRequirements || registration.dietaryRestrictions) && (
          <div style={{
            marginTop: theme.spacing[3],
            padding: theme.spacing[3],
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
          }}>
            {registration.specialRequirements && (
              <div style={{ marginBottom: theme.spacing[2] }}>
                <strong style={{ color: theme.colors.text.primary }}>
                  Special Requirements:
                </strong>
                <span style={{ marginLeft: theme.spacing[2], color: theme.colors.text.secondary }}>
                  {registration.specialRequirements}
                </span>
              </div>
            )}
            {registration.dietaryRestrictions && (
              <div>
                <strong style={{ color: theme.colors.text.primary }}>
                  Dietary Restrictions:
                </strong>
                <span style={{ marginLeft: theme.spacing[2], color: theme.colors.text.secondary }}>
                  {registration.dietaryRestrictions}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Rating Modal - only for regular events */}
      {showRatingsAndComments && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          event={event}
          onRatingSubmitted={() => {
            // Optionally refresh data or show success message
            setShowRatingModal(false);
          }}
        />
      )}

      {/* View Ratings Modal - only for regular events */}
      {showRatingsAndComments && (
        <ViewRatingsModal
          isOpen={showViewRatingsModal}
          onClose={() => setShowViewRatingsModal(false)}
          event={event}
        />
      )}
    </>
  );
};

export default RegistrationCard;