import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import theme, { getEventTypeColor } from "../theme";
import Button from "./Button";
import RegistrationForm from "./RegistrationForm";
import { useAuth } from "../context/AuthContext";
import { conferenceAPI } from "../services/api";
import { eventAPI } from "../services/api";
import { applicationServices } from "../services/api";
import toast from "react-hot-toast";

const ALL_ROLES = ["student", "staff", "ta", "professor", "admin", "events_office"];

const EventCard = ({ event, showRegistration = true, onRegistrationSuccess, onEventUpdate, onEditConference, onEdit, onEditTrip, onDelete, showArchiveButton, showUnarchiveButton, onArchive, onUnarchive, onExportRegistrations, currentUserRole, eligibleRoles }) => {
  // Normalize event/conference object for consistent display
  const normalizedEvent = {
    ...event,
    type: event.type || "conference",
    title: event.name || event.title || "",
    description: event.shortDescription || event.description || "",
    status: event.status || "published",
    registrationRequired: event.registrationRequired !== undefined ? event.registrationRequired : true,
    currentParticipants: event.currentParticipants || 0,
    maxParticipants: event.maxParticipants || event.capacity || 0,
    registrationDeadline: event.registrationDeadline || null,
    cost: event.cost || 0,
    // Ensure dates are present
    startDate: event.startDate || event.date || new Date().toISOString(),
    endDate: event.endDate || event.startDate || event.date || new Date().toISOString(),
  };

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [participatingVendors, setParticipatingVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const navigate = useNavigate();
  const { isEventsOffice, user, isAdmin } = useAuth();

  // Determine if the event is restricted to certain roles
  const isRestricted = eligibleRoles && eligibleRoles.length > 0 && eligibleRoles.length < ALL_ROLES.length;
  const isEligible = !isRestricted || (currentUserRole && eligibleRoles.includes(currentUserRole));

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

  const canRegister = () => {
    const now = new Date();
    const startDate = new Date(normalizedEvent.startDate);
    const registrationDeadline = normalizedEvent.registrationDeadline
      ? new Date(normalizedEvent.registrationDeadline)
      : null;

    // Check general event conditions
    const generalConditions = (
      normalizedEvent.status === "published" &&
      normalizedEvent.registrationRequired &&
      startDate > now &&
      normalizedEvent.currentParticipants < normalizedEvent.maxParticipants &&
      (!registrationDeadline || now <= registrationDeadline)
    );

    // Check role eligibility
    const roleEligibility = isEligible;

    return generalConditions && roleEligibility;
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = normalizedEvent.startDate ? new Date(normalizedEvent.startDate) : null;
    const endDate = normalizedEvent.endDate ? new Date(normalizedEvent.endDate) : startDate;
    const registrationDeadline = normalizedEvent.registrationDeadline
      ? new Date(normalizedEvent.registrationDeadline)
      : null;

    if (normalizedEvent.status && normalizedEvent.status !== "published") {
      return { status: "Not Published", color: theme.colors.neutral.gray500 };
    }

    // Treat "same-day (today)" events as upcoming (do not mark ended even if end time passed)
    const isSameCalendarDay =
      startDate &&
      endDate &&
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate();

    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);
    const startIsToday = startDate && startDate >= startOfToday && startDate <= endOfToday;

    // If event has ended and it's NOT a same-day-today event, show Event Ended
    if (endDate && endDate < now && !(isSameCalendarDay && startIsToday)) {
      return { status: "Event Ended", color: theme.colors.neutral.gray500 };
    }

    if (!normalizedEvent.registrationRequired) {
      return { status: "No Registration Required", color: theme.colors.info.main };
    }

    if (normalizedEvent.currentParticipants >= normalizedEvent.maxParticipants) {
      return { status: "Full", color: theme.colors.error.main };
    }

    if (registrationDeadline && now > registrationDeadline) {
      return { status: "Registration Closed", color: theme.colors.error.main };
    }

    return { status: "Registration Open", color: theme.colors.success.main };
  };

  const handleEditClick = () => {
    if (onEditConference && normalizedEvent.type === "conference") {
      onEditConference(normalizedEvent);
    } else if (onEditTrip && normalizedEvent.type === "trip") {
      onEditTrip(normalizedEvent);
    } else if (onEdit) {
      onEdit(normalizedEvent);
    } else {
      console.log('ERROR: No edit callback available!');
    }
  };

const handleDeleteConference = async () => {
  // Call parent delete handler
  if (onDelete) {
    onDelete(normalizedEvent);
  }
};

const handleDeleteWorkshop = async () => {
  // Check if there are registrations before triggering delete
  if (normalizedEvent.currentParticipants > 0) {
    toast.error("This workshop cannot be deleted because there are registered users.");
    return;
  }

  // Call parent delete handler
  if (onDelete) {
    onDelete(normalizedEvent);
  }
};

  const handleDeleteEvent = async () => {
    // Check if there are registrations before triggering delete
    if (normalizedEvent.currentParticipants > 0) {
      toast.error("This event cannot be deleted because there are registered participants.");
      return;
    }

    // Call parent delete handler
    if (onDelete) {
      onDelete(normalizedEvent);
    }
  };

  const handleRegistrationSuccess = (registrationData) => {
    setShowRegistrationForm(false);
    onRegistrationSuccess && onRegistrationSuccess(registrationData);
  };

  const statusInfo = getStatusInfo();

  // Fetch participating vendors for bazaar events
  useEffect(() => {
    const fetchParticipatingVendors = async () => {
      if (normalizedEvent.type === 'bazaar' && normalizedEvent._id) {
        setVendorsLoading(true);
        try {
          const response = await applicationServices.getApprovedVendorsForBazaar(normalizedEvent._id);
          setParticipatingVendors(response.data || []);
        } catch (error) {
          console.error('Error fetching participating vendors:', error);
          // Don't show error toast for this - it's not critical for event display
          setParticipatingVendors([]);
        } finally {
          setVendorsLoading(false);
        }
      }
    };

    fetchParticipatingVendors();
  }, [normalizedEvent.type, normalizedEvent._id]);

  if (showRegistrationForm) {
    return (
      <RegistrationForm
        event={normalizedEvent}
        onSuccess={handleRegistrationSuccess}
        onCancel={() => setShowRegistrationForm(false)}
      />
    );
  }

  // helper: consider event started if startDate is today or earlier
  const eventHasStarted = (event) => {
    if (!event || !event.startDate) return false;
    const now = new Date();
    const start = new Date(event.startDate);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    return start <= now; // started if start is today or in the past
  };

  // convenience flag used in JSX
  const canShowEventsOfficeControls = isEventsOffice &&
    ['conference', 'bazaar', 'trip', 'workshop'].includes(normalizedEvent.type) &&
    !eventHasStarted(normalizedEvent);

  // ownership helper (organizer or createdBy)
  const isOwner = (() => {
    const uid = user?.id || user?._id;
    const owner = normalizedEvent.organizer || normalizedEvent.createdBy;
    if (!uid || !owner) return false;
    if (typeof owner === "object") return owner._id === uid || owner.id === uid;
    return owner === uid;
  })();

  const hasStarted = eventHasStarted(normalizedEvent);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          background: theme.colors.background.paper,
          borderRadius: theme.borderRadius.card,
          boxShadow: theme.shadows.card,
          overflow: "hidden",
          transition: "all 0.3s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
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
          background: `linear-gradient(135deg, ${getEventTypeColor(normalizedEvent.type)} 0%, ${getEventTypeColor(normalizedEvent.type)}dd 100%)`,
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
            {getEventTypeLabel(normalizedEvent.type)}
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
          {normalizedEvent.title}
        </h3>
        {isRestricted && (
            <p style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.white,
                background: 'rgba(255, 255, 255, 0.2)',
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
                marginTop: theme.spacing[2],
                display: 'inline-block',
            }}>
                Only for {eligibleRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
            </p>
        )}
      </div>

      {/* Event Content */}
      <div style={{ padding: theme.spacing[5], display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
              {formatDate(normalizedEvent.startDate)}
              {normalizedEvent.startDate !== normalizedEvent.endDate && ` - ${formatDate(normalizedEvent.endDate)}`}
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
            <span>🕐</span>
            <span>{formatTime(normalizedEvent.startDate)}</span>
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
            <span>{normalizedEvent.location}</span>
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
          {normalizedEvent.description}
        </p>

        {/* Participating Vendors Section - Only for Bazaars */}
        {normalizedEvent.type === 'bazaar' && (
          <div
            style={{
              background: theme.colors.neutral.gray50,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.base,
              marginBottom: theme.spacing[4],
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[2],
                marginBottom: theme.spacing[3],
              }}
            >
              <span style={{ fontSize: theme.typography.fontSize.lg }}>🏪</span>
              <h4
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                Participating Vendors ({participatingVendors.length})
              </h4>
            </div>
            {vendorsLoading ? (
              <p style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: theme.colors.text.secondary,
                margin: 0 
              }}>
                Loading vendors...
              </p>
            ) : participatingVendors.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: theme.spacing[2],
                }}
              >
                {participatingVendors.slice(0, 5).map((vendor) => (
                  <div
                    key={vendor._id}
                    style={{
                      background: theme.colors.background.paper,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.sm,
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing[1],
                    }}
                  >
                    <span style={{ fontSize: "0.9em" }}>🏢</span>
                    {vendor.companyName}
                  </div>
                ))}
                {participatingVendors.length > 5 && (
                  <div
                    style={{
                      background: theme.colors.primary.main,
                      color: theme.colors.text.white,
                      border: `1px solid ${theme.colors.primary.dark}`,
                      borderRadius: theme.borderRadius.sm,
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    +{participatingVendors.length - 5} more
                  </div>
                )}
              </div>
            ) : (
              <p style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: theme.colors.text.secondary,
                margin: 0,
                fontStyle: 'italic'
              }}>
                No vendors have been approved yet
              </p>
            )}
          </div>
        )}

        {/* Loading state for vendors */}
        {event.type === 'bazaar' && vendorsLoading && (
          <div
            style={{
              background: theme.colors.neutral.gray50,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.base,
              marginBottom: theme.spacing[4],
              border: `1px solid ${theme.colors.border}`,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              Loading vendors...
            </p>
          </div>
        )}

        {/* Registration Info */}
        {(normalizedEvent.registrationRequired || normalizedEvent.type === 'bazaar') && (
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
                {normalizedEvent.type === 'bazaar' ? 'Vendors' : 'Participants'}
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                {normalizedEvent.currentParticipants} / {normalizedEvent.maxParticipants}
              </span>
            </div>
            {normalizedEvent.registrationDeadline && (
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
                  Registration Deadline
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {formatDate(normalizedEvent.registrationDeadline)}
                </span>
              </div>
            )}
            {normalizedEvent.cost > 0 && (
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
                  ${normalizedEvent.cost}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Additional Info for specific event types */}
        {normalizedEvent.type === "workshop" && normalizedEvent.instructor && (
          <div style={{ marginBottom: theme.spacing[4] }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[1],
              }}
            >
              <strong>Instructor:</strong> {normalizedEvent.instructor}
            </p>
            {normalizedEvent.duration && (
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  margin: 0,
                }}
              >
                <strong>Duration:</strong> {normalizedEvent.duration} hours
              </p>
            )}
          </div>
        )}
        
        {/* Spacer to push buttons to bottom */}
        <div style={{ flexGrow: 1 }}></div>
        
        {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: theme.spacing[3],
              alignItems: "stretch",
              marginTop: "auto",
              paddingTop: theme.spacing[4]
            }}
          >
            {isAdmin ? (
              // Admin: show Delete button only when no participants (NO EDIT)
              <>
                {normalizedEvent.currentParticipants === 0 && (
                  <Button
                    variant="danger"
                    onClick={handleDeleteEvent}
                    title="Delete event (only if no registrations)"
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete Event
                  </Button>
                )}
              </>
            ) : isEventsOffice ? (
              <>
                {/* Events Office: Edit shown only for events they own and only if event has NOT started */}
                {isOwner && !hasStarted && normalizedEvent.type !== 'workshop' && (
                  <Button
                    variant="primary"
                    onClick={handleEditClick}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit
                  </Button>
                )}

                {/* Events Office: Delete shown only for events they own, only if NOT started AND participants === 0 */}
                {isOwner && !hasStarted && normalizedEvent.currentParticipants === 0 && (
                  <Button
                    variant="danger"
                    onClick={handleDeleteEvent}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                      gridColumn: isOwner && !hasStarted && normalizedEvent.type !== 'workshop' ? "auto" : "1 / -1",
                    }}
                  >
                    Delete
                  </Button>
                )}
                {showArchiveButton && (
                  <Button
                    variant="outline"
                    onClick={onArchive}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Archive
                  </Button>
                )}
                {showUnarchiveButton && (
                  <Button
                    variant="outline"
                    onClick={onUnarchive}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Unarchive
                  </Button>
                )}
                 {isEventsOffice && normalizedEvent.type !== 'conference' && (
                  <Button
                    variant="outline"
                    onClick={() => onExportRegistrations(normalizedEvent)}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Export Registrations
                  </Button>
                )}
              </>
            ) : (
              // Regular users: keep Register Now as-is
              !isEventsOffice && !isAdmin && showRegistration && canRegister() && (
                <Button
                  variant="primary"
                  onClick={() => setShowRegistrationForm(true)}
                  style={{
                    width: "100%",
                    minHeight: "44px",
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    whiteSpace: "nowrap",
                    gridColumn: "1 / -1",
                  }}
                >
                  Register Now
                </Button>
              )
            )}
          </div>
      </div>

    </div>
    </>
  );
};

export default EventCard;