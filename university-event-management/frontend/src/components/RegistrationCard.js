import React from "react";
import { Link } from "react-router-dom";
import theme, { getEventTypeColor } from "../theme";
import Card from "./Card";
import Button from "./Button";

const RegistrationCard = ({ registration, onCancel, isPastEvent = false }) => {
  if (!registration || !registration.event) {
    return null;
  }

  const { event } = registration;
  
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
    transition: "all 0.2s ease",
    opacity: registration.status === "cancelled" ? 0.7 : 1,
    borderLeft: `4px solid ${getEventTypeColor(event.type)}`,
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
    display: "flex",
    gap: theme.spacing[2],
  };

  return (
    <Card style={cardStyles} hover>
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
            {formatDate(event.startDate)}
            {event.endDate && 
              new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && 
              ` - ${formatDate(event.endDate)}`
            }
          </span>
        </div>
        
        <div style={detailRowStyles}>
          <span style={detailLabelStyles}>🕒 Time:</span>
          <span style={detailValueStyles}>
            {formatTime(event.startDate)}
            {event.endDate && ` - ${formatTime(event.endDate)}`}
          </span>
        </div>

        <div style={detailRowStyles}>
          <span style={detailLabelStyles}>📍 Location:</span>
          <span style={detailValueStyles}>{event.location}</span>
        </div>

        {event.cost > 0 && (
          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>💰 Cost:</span>
            <span style={detailValueStyles}>
              ${event.cost}
              {registration.paymentStatus && (
                <span style={{ 
                  marginLeft: theme.spacing[2],
                  color: registration.paymentStatus === 'paid' 
                    ? theme.colors.success.main 
                    : theme.colors.warning.main,
                  fontWeight: theme.typography.fontWeight.medium
                }}>
                  ({registration.paymentStatus})
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
          <Link to="/events">
            <Button variant="outline" size="sm">
              Browse Events
            </Button>
          </Link>
          
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
    </Card>
  );
};

export default RegistrationCard;