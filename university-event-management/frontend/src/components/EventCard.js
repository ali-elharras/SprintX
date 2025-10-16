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

const EventCard = ({ event, showRegistration = true, onRegistrationSuccess, onEventUpdate, onEditConference, onEdit }) => {
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
  const { isEventsOffice, user } = useAuth();

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
    const startDate = new Date(normalizedEvent.startDate);
    const registrationDeadline = normalizedEvent.registrationDeadline
      ? new Date(normalizedEvent.registrationDeadline)
      : null;

    if (normalizedEvent.status !== "published") {
      return { status: "Not Published", color: theme.colors.neutral.gray500 };
    }

    if (startDate < now) {
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

  const handleEditClick = () => {
  if (onEditConference && normalizedEvent.type === "conference") {
    onEditConference(normalizedEvent);
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
        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing[3],
            alignItems: "stretch",
          }}
        >
          {/* Events Office buttons for conferences and workshops */}
          {isEventsOffice && (normalizedEvent.type === "conference" || normalizedEvent.type === "workshop") ? (
            <>
              {normalizedEvent.type === "conference" && (
                <>
                  <div style={{ flex: 1 }}>
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
                  </div>
                  <div style={{ flex: 1 }}>
                    <Button
                      variant="danger"
                      onClick={handleDeleteConference}
                      disabled={isDeleting}
                      style={{ 
                        width: "100%",
                        minHeight: "44px",
                        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                        whiteSpace: "nowrap",
                        opacity: isDeleting ? 0.6 : 1,
                      }}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </>
              )}
              {normalizedEvent.type === "workshop" && (
                <div style={{ flex: 1 }}>
                  <Button
                    variant="danger"
                    onClick={handleDeleteWorkshop}
                    disabled={isDeleting || normalizedEvent.currentParticipants > 0}
                    title={normalizedEvent.currentParticipants > 0 ? "Cannot delete - students are registered" : "Delete workshop"}
                    style={{ 
                      width: "100%",
                      minHeight: "44px",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      whiteSpace: "nowrap",
                      opacity: (isDeleting || normalizedEvent.currentParticipants > 0) ? 0.6 : 1,
                      cursor: (isDeleting || normalizedEvent.currentParticipants > 0) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Single Register Now button for regular users only */
            !isEventsOffice && showRegistration && canRegister() && (
              <div style={{ flex: 1 }}>
                <Button
                  variant="primary"
                  onClick={() => setShowRegistrationForm(true)}
                  style={{ 
                    width: "100%",
                    minHeight: "44px",
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  Register Now
                </Button>
              </div>
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