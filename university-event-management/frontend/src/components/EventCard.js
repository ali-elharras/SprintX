import React, { useState } from "react";
import theme, { getEventTypeColor } from "../theme";
import Button from "./Button";
import RegistrationForm from "./RegistrationForm";

const EventCard = ({ event, showRegistration = true, onRegistrationSuccess }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      workshop: "Workshop",
      trip: "Trip",
      bazaar: "Bazaar",
      competition: "Competition",
      conference: "Conference",
    };
    return labels[type] || type;
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const registrationDeadline = event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : null;

    if (event.status !== "published") {
      return { status: "Not Published", color: theme.colors.neutral.gray500 };
    }

    if (startDate < now) {
      return { status: "Event Ended", color: theme.colors.neutral.gray500 };
    }

    if (!event.registrationRequired) {
      return { status: "No Registration Required", color: theme.colors.info.main };
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return { status: "Full", color: theme.colors.error.main };
    }

    if (registrationDeadline && now > registrationDeadline) {
      return { status: "Registration Closed", color: theme.colors.error.main };
    }

    return { status: "Registration Open", color: theme.colors.success.main };
  };

  const canRegister = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const registrationDeadline = event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : null;

    return (
      event.status === "published" &&
      event.registrationRequired &&
      startDate > now &&
      event.currentParticipants < event.maxParticipants &&
      (!registrationDeadline || now <= registrationDeadline)
    );
  };

  const statusInfo = getStatusInfo();

  const handleRegistrationSuccess = (registrationData) => {
    setShowRegistrationForm(false);
    onRegistrationSuccess && onRegistrationSuccess(registrationData);
  };

  if (showRegistrationForm) {
    return (
      <RegistrationForm
        event={event}
        onSuccess={handleRegistrationSuccess}
        onCancel={() => setShowRegistrationForm(false)}
      />
    );
  }

  return (
    <div
      style={{
        background: theme.colors.background.paper,
        borderRadius: theme.borderRadius.card,
        boxShadow: theme.shadows.card,
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = theme.shadows.cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.card;
      }}
    >
      {/* Event Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${getEventTypeColor(event.type)} 0%, ${getEventTypeColor(event.type)}dd 100%)`,
          padding: theme.spacing[4],
          color: theme.colors.text.white,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: theme.spacing[2],
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
              borderRadius: theme.borderRadius.full,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.semibold,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {getEventTypeLabel(event.type)}
          </div>
          <div
            style={{
              background: statusInfo.color,
              color: theme.colors.text.white,
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            {statusInfo.status}
          </div>
        </div>
        <h3
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            lineHeight: theme.typography.lineHeight.tight,
            margin: 0,
          }}
        >
          {event.name}
        </h3>
      </div>

      {/* Event Content */}
      <div style={{ padding: theme.spacing[5] }}>
        {/* Event Details */}
        <div style={{ marginBottom: theme.spacing[4] }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>📅</span>
            <span>
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>🕒</span>
            <span>{formatTime(event.startDate)}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.lineHeight.relaxed,
            marginBottom: theme.spacing[4],
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.description}
        </p>

        {/* Registration Info */}
        {event.registrationRequired && (
          <div
            style={{
              background: theme.colors.neutral.gray50,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.base,
              marginBottom: theme.spacing[4],
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing[2],
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                Participants
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                {event.currentParticipants} / {event.maxParticipants}
              </span>
            </div>
            {event.registrationDeadline && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing[2],
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Registration Deadline
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {formatDate(event.registrationDeadline)}
                </span>
              </div>
            )}
            {event.cost > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Cost
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary.main,
                  }}
                >
                  ${event.cost}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Additional Info for specific event types */}
        {event.type === "workshop" && event.instructor && (
          <div style={{ marginBottom: theme.spacing[4] }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              <strong>Instructor:</strong> {event.instructor}
            </p>
            {event.duration && (
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                <strong>Duration:</strong> {event.duration} hours
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: showRegistration && canRegister() ? "row" : "column",
            gap: theme.spacing[3],
            alignItems: "stretch",
          }}
        >
          {showRegistration && canRegister() && (
            <Button
              variant="primary"
              onClick={() => setShowRegistrationForm(true)}
              style={{ 
                flex: 1,
                width: "100%",
                minHeight: "44px",
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                whiteSpace: "nowrap",
              }}
            >
              Register Now
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Navigate to event details page
              console.log("View details for event:", event._id);
            }}
            style={{ 
              flex: 1,
              width: "100%",
              minHeight: "44px",
              padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
              whiteSpace: "nowrap",
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;