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

const EventCard = ({ event, showRegistration = true, onRegistrationSuccess, onEventUpdate, onEditConference, onEdit, onEditTrip }) => {
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [participatingVendors, setParticipatingVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { isEventsOffice, user, isAdmin } = useAuth();

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

    return (
      normalizedEvent.status === "published" &&
      normalizedEvent.registrationRequired &&
      startDate > now &&
      normalizedEvent.currentParticipants < normalizedEvent.maxParticipants &&
      (!registrationDeadline || now <= registrationDeadline)
    );
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
    console.log('Edit button clicked!', { 
      event: normalizedEvent, 
      onEdit, 
      onEditConference,
      onEditTrip,
      hasOnEdit: !!onEdit,
      hasOnEditConference: !!onEditConference,
      hasOnEditTrip: !!onEditTrip,
      willCallOnEdit: !onEditConference || normalizedEvent.type !== "conference"
    });
    if (onEditConference && normalizedEvent.type === "conference") {
      console.log('Calling onEditConference');
      onEditConference(normalizedEvent);
    } else if (onEditTrip && normalizedEvent.type === "trip") {
      console.log('Calling onEditTrip with event:', normalizedEvent);
      onEditTrip(normalizedEvent);
    } else if (onEdit) {
      console.log('Calling onEdit with event:', normalizedEvent);
      onEdit(normalizedEvent);
    } else {
      console.log('ERROR: No edit callback available!');
    }
  };

const handleDeleteConference = async () => {
  if (!window.confirm("Are you sure you want to delete this conference? This action cannot be undone.")) {
    return;
  }

  try {
    setIsDeleting(true);
    await conferenceAPI.deleteConference(normalizedEvent._id);
    toast.success("Conference deleted successfully!");
    if (onEventUpdate) {
      onEventUpdate(); // Refresh the events list
    }
  } catch (error) {
    console.error("Error deleting conference:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete conference";
    toast.error(errorMessage);
  } finally {
    setIsDeleting(false);
  }
};

const handleDeleteWorkshop = async () => {
  // Check if there are registrations before showing modal
  if (normalizedEvent.currentParticipants > 0) {
    toast.error("This workshop cannot be deleted because there are registered users.");
    return;
  }

  // Show modal instead of browser confirm
  setShowDeleteModal(true);
};

const confirmDeleteWorkshop = async () => {
  setShowDeleteModal(false);
  
  try {
    setIsDeleting(true);
    // Import workshopAPI at the top and use it here
    const { workshopAPI } = await import("../services/api");
    
    // Published workshops are displayed as Event documents, so we need to delete by Event ID
    await workshopAPI.deleteWorkshopByEventId(normalizedEvent._id);
    
    // Signal other tabs that a workshop was deleted
    localStorage.setItem('workshop_deleted', Date.now().toString());
    
    toast.success("Workshop deleted successfully!");
    if (onEventUpdate) {
      onEventUpdate(); // Refresh the events list
    }
  } catch (error) {
    console.error("Error deleting workshop:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete workshop";
    
    // Show specific error for registered users
    if (errorMessage.includes('students have already registered')) {
      toast.error("This workshop cannot be deleted because there are registered users.");
    } else {
      toast.error(errorMessage);
    }
  } finally {
    setIsDeleting(false);
  }
};

  const handleDeleteEvent = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${normalizedEvent.type}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await eventAPI.deleteEvent(normalizedEvent._id);
      toast.success(`${getEventTypeLabel(normalizedEvent.type)} deleted successfully!`);
      
      // Trigger refresh on parent component
      if (onEventUpdate) {
        onEventUpdate();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete event";
      
      // Check if error is due to registrations
      if (errorMessage.includes('registration')) {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
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
      if (event.type === 'bazaar' && event._id) {
        setVendorsLoading(true);
        try {
          const response = await applicationServices.getApprovedVendorsForBazaar(event._id);
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
  }, [event.type, event._id]);

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

  // Debug logging for trip edit button
  if (normalizedEvent.type === 'trip') {
    console.log('Trip Edit Debug:', {
      type: normalizedEvent.type,
      isEventsOffice,
      isOwner,
      hasStarted,
      userId: user?.id || user?._id,
      organizer: normalizedEvent.organizer,
      createdBy: normalizedEvent.createdBy,
      showEditButton: isEventsOffice && isOwner && !hasStarted
    });
  }

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
        {event.type === 'bazaar' && participatingVendors.length > 0 && (
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
        {normalizedEvent.registrationRequired && (
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
              // Admin: show Delete button only when no participants
              <>
                {/* Admin: Edit button for trips/conferences/bazaars */}
                {!hasStarted && normalizedEvent.type !== 'workshop' && (
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
                {normalizedEvent.currentParticipants === 0 && (
                  <Button
                    variant="danger"
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                    title="Delete event (only if no registrations)"
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                      opacity: isDeleting ? 0.6 : 1,
                      cursor: isDeleting ? "not-allowed" : "pointer",
                      gridColumn: !hasStarted && normalizedEvent.type !== 'workshop' ? "auto" : "1 / -1",
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete Event"}
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
                    disabled={isDeleting}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                      opacity: isDeleting ? 0.6 : 1,
                      gridColumn: isOwner && !hasStarted && normalizedEvent.type !== 'workshop' ? "auto" : "1 / -1",
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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

      {/* Delete Workshop Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              width: "480px",
              maxWidth: "95%",
              background: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing[6],
              boxShadow: theme.shadows.xl,
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: theme.spacing[3],
                color: theme.colors.error.main,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
              }}
            >
              🗑️ Delete Workshop?
            </h3>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                lineHeight: 1.6,
                fontSize: theme.typography.fontSize.base,
              }}
            >
              Are you sure you want to permanently delete this workshop?
            </p>
            <p
              style={{
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
                fontWeight: theme.typography.fontWeight.semibold,
                fontSize: theme.typography.fontSize.lg,
                padding: theme.spacing[3],
                background: theme.colors.neutral.gray50,
                borderRadius: theme.borderRadius.base,
                borderLeft: `4px solid ${theme.colors.error.main}`,
              }}
            >
              "{normalizedEvent.title}"
            </p>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[5],
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              <strong>⚠️ Warning:</strong> This action cannot be undone. The workshop will be completely removed from the system.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: theme.spacing[3],
              }}
            >
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  minWidth: "100px",
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteWorkshop}
                style={{
                  minWidth: "100px",
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                }}
              >
                Delete Workshop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default EventCard;