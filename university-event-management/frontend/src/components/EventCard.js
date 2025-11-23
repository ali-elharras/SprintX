import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import theme, { getEventTypeColor } from "../theme";
import Button from "./Button";
import RegistrationForm from "./RegistrationForm";
import { useAuth } from "../context/AuthContext";
import { conferenceAPI } from "../services/api";
import { eventAPI } from "../services/api";
import { applicationServices } from "../services/api";
import { favoritesAPI } from "../services/api";
import toast from "react-hot-toast";

const EventCard = ({ event, showRegistration = true, onRegistrationSuccess, onEventUpdate, onEditConference, onEdit, onEditTrip, onDelete, showArchiveButton, showUnarchiveButton, onArchive, onUnarchive, onExportRegistrations, onRestrict, onViewDetails, isFavorited = false, onFavoriteToggle, userRegistrations = [] }) => {
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
    startDate: event.startDate || event.date || new Date().toISOString(),
    endDate: event.endDate || event.startDate || event.date || new Date().toISOString(),
  };

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [participatingVendors, setParticipatingVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const navigate = useNavigate();
  const { isEventsOffice, user, isAdmin } = useAuth();

  useEffect(() => {
    setIsFavorite(isFavorited);
  }, [isFavorited]);

  // Initialize hasRegistered state based on userRegistrations - runs on every userRegistrations change
  useEffect(() => {
    console.log("=== REGISTRATION CHECK ===");
    console.log("Event:", normalizedEvent.title);
    console.log("Event ID:", normalizedEvent._id);
    console.log("User:", user?.email);
    console.log("Total userRegistrations:", userRegistrations?.length || 0);
    
    if (!user) {
      console.log("No user logged in");
      setHasRegistered(false);
      return;
    }
    
    if (!userRegistrations || userRegistrations.length === 0) {
      console.log("No registrations found");
      setHasRegistered(false);
      return;
    }
    
    console.log("All registrations:", userRegistrations.map(r => ({
      eventId: r.event?._id || r.event,
      eventTitle: r.event?.title || r.event?.name || 'unknown',
      status: r.status
    })));
    
    const isRegistered = userRegistrations.some(registration => {
      const regEventId = registration.event?._id || registration.event;
      const currentEventId = normalizedEvent._id;
      const isActiveStatus = registration.status !== 'cancelled';
      
      const matches = regEventId === currentEventId && isActiveStatus;
      
      if (matches) {
        console.log("✅ FOUND MATCHING REGISTRATION!");
      }
      
      return matches;
    });
    
    console.log("Final hasRegistered value:", isRegistered);
    console.log("=========================");
    
    setHasRegistered(isRegistered);
  }, [user, userRegistrations, normalizedEvent._id, normalizedEvent.title]);

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

  // Check if user is registered
  const isUserRegistered = () => {
    // Check local state first (for immediate feedback after registration)
    if (hasRegistered) {
      console.log("User is registered (local state)");
      return true;
    }
    
    if (!user || !userRegistrations || userRegistrations.length === 0) {
      console.log("No user or no registrations");
      return false;
    }
    
    // Check if user has an active registration for this event
    const registered = userRegistrations.some(registration => {
      const regEventId = registration.event?._id || registration.event;
      const currentEventId = normalizedEvent._id;
      const isActiveStatus = registration.status !== 'cancelled';
      
      console.log("Checking registration:", { regEventId, currentEventId, isActiveStatus });
      
      return regEventId === currentEventId && isActiveStatus;
    });
    
    console.log("User registered from userRegistrations:", registered);
    return registered;
  };

  const canRegister = () => {
    const now = new Date();
    const startDate = new Date(normalizedEvent.startDate);
    const registrationDeadline = normalizedEvent.registrationDeadline
      ? new Date(normalizedEvent.registrationDeadline)
      : null;

    // Check if user is already registered
    if (isUserRegistered()) {
      return false;
    }

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

  const handleEditClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (onEditConference && normalizedEvent.type === "conference") {
      onEditConference(normalizedEvent);
    } else if (onEditTrip && normalizedEvent.type === "trip") {
      onEditTrip(normalizedEvent);
    } else if (onEdit) {
      onEdit(normalizedEvent);
    }
  };

  const handleDeleteEvent = async (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (normalizedEvent.currentParticipants > 0) {
      toast.error("This event cannot be deleted because there are registered participants.");
      return;
    }
    if (onDelete) {
      onDelete(normalizedEvent);
    }
  };

  const handleRegistrationSuccess = (registrationData) => {
    console.log("Registration successful, setting hasRegistered to true");
    setShowRegistrationForm(false);
    setHasRegistered(true);
    onRegistrationSuccess && onRegistrationSuccess(registrationData);
    toast.success("Successfully registered for this event!");
  };

  const statusInfo = getStatusInfo();
  const participationPercentage = (normalizedEvent.currentParticipants / normalizedEvent.maxParticipants) * 100;

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

  const eventHasStarted = (event) => {
    if (!event || !event.startDate) return false;
    const now = new Date();
    const start = new Date(event.startDate);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    return start <= now;
  };

  const isOwner = (() => {
    const uid = user?.id || user?._id;
    const owner = normalizedEvent.organizer || normalizedEvent.createdBy;
    if (!uid || !owner) return false;
    if (typeof owner === "object") return owner._id === uid || owner.id === uid;
    return owner === uid;
  })();

  const hasStarted = eventHasStarted(normalizedEvent);
  const hasEnded = new Date(normalizedEvent.endDate) < new Date();
  
  // Debug logs
  const userIsRegistered = isUserRegistered();
  const userCanRegister = canRegister();
  console.log("EventCard render:", {
    eventTitle: normalizedEvent.title,
    hasRegistered,
    userIsRegistered,
    userCanRegister,
    isEventsOffice,
    isAdmin,
    showRegistration
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onClick={() => onViewDetails && onViewDetails(normalizedEvent)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: "20px",
        border: `2px solid ${isHovered ? getEventTypeColor(normalizedEvent.type) : '#e5e7eb'}`,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "480px",
        boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: "8px",
        background: `linear-gradient(180deg, ${getEventTypeColor(normalizedEvent.type)}, ${getEventTypeColor(normalizedEvent.type)}dd)`,
        transition: "width 0.3s ease",
        borderTopLeftRadius: "20px",
        borderBottomLeftRadius: "20px",
      }} />

      <div
        style={{
          background: '#ffffff',
          padding: '1.25rem',
          paddingLeft: '1.75rem',
          color: '#111827',
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: '0.75rem',
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: `${getEventTypeColor(normalizedEvent.type)}15`,
              padding: '0.5rem 1rem',
              borderRadius: "30px",
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: getEventTypeColor(normalizedEvent.type),
            }}
          >
            {getEventTypeLabel(normalizedEvent.type)}
          </motion.div>
          
          <div style={{ display: "flex", gap: '0.5rem', alignItems: "center" }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  if (isFavorite) {
                    await favoritesAPI.removeFavorite(normalizedEvent._id);
                    setIsFavorite(false);
                    toast.success("Removed from favorites");
                  } else {
                    await favoritesAPI.addFavorite(normalizedEvent._id);
                    setIsFavorite(true);
                    toast.success("Added to favorites");
                  }
                  if (onFavoriteToggle) {
                    onFavoriteToggle();
                  }
                } catch (err) {
                  toast.error(err.message || "Failed to update favorites");
                }
              }}
              style={{
                background: isFavorite ? "#fef2f2" : "#f9fafb",
                color: isFavorite ? "#ef4444" : "#6b7280",
                border: `2px solid ${isFavorite ? "#ef4444" : "#e5e7eb"}`,
                padding: '0.5rem',
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isFavorite ? "❤️" : "♥"}
            </motion.button>
            
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              style={{
                background: statusInfo.color,
                color: '#ffffff',
                padding: '0.5rem 0.75rem',
                borderRadius: "30px",
                fontSize: '0.75rem',
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: '0.25rem',
              }}
            >
              <span>✓</span>
              {statusInfo.status}
            </motion.div>
          </div>
        </div>
        
        <motion.h3
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {normalizedEvent.title}
        </motion.h3>
      </div>

      <div style={{ padding: '1.25rem', display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: '0.5rem',
            padding: '0.5rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#111827',
          }}>
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <span style={{ fontWeight: 500 }}>{formatDate(normalizedEvent.startDate)}</span>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: '0.5rem',
            padding: '0.5rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#111827',
          }}>
            <span style={{ fontSize: "1.2rem" }}>🕐</span>
            <span style={{ fontWeight: 500 }}>{formatTime(normalizedEvent.startDate)}</span>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: '0.5rem',
            padding: '0.5rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#111827',
          }}>
            <span style={{ fontSize: "1.2rem" }}>📍</span>
            <span style={{ fontWeight: 500 }}>{normalizedEvent.location}</span>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: 1.6,
            marginBottom: '0.75rem',
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {normalizedEvent.description}
        </p>

        <motion.button
          whileHover={{ x: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails && onViewDetails(normalizedEvent);
          }}
          style={{
            background: "none",
            border: "none",
            color: getEventTypeColor(normalizedEvent.type),
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            marginBottom: '1rem',
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: '0.25rem',
          }}
        >
          Read more <span>→</span>
        </motion.button>

        {normalizedEvent.type === 'bazaar' && (
          <div
            style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginBottom: '1rem',
              border: '2px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>🏪</span>
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Participating Vendors ({participatingVendors.length})
              </h4>
            </div>
            {vendorsLoading ? (
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                margin: 0 
              }}>
                Loading vendors...
              </p>
            ) : participatingVendors.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: '0.5rem',
                }}
              >
                {participatingVendors.slice(0, 5).map((vendor) => (
                  <div
                    key={vendor._id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#111827',
                      display: "flex",
                      alignItems: "center",
                      gap: '0.25rem',
                    }}
                  >
                    <span style={{ fontSize: "0.9em" }}>🏢</span>
                    {vendor.companyName}
                  </div>
                ))}
                {participatingVendors.length > 5 && (
                  <div
                    style={{
                      background: getEventTypeColor(normalizedEvent.type),
                      color: '#ffffff',
                      border: '1px solid transparent',
                      borderRadius: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
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
                fontSize: '0.875rem', 
                color: '#6b7280',
                margin: 0,
                fontStyle: 'italic'
              }}>
                No vendors have been approved yet
              </p>
            )}
          </div>
        )}

        {(normalizedEvent.registrationRequired || normalizedEvent.type === 'bazaar') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f9fafb, #ffffff)',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginBottom: '1rem',
              border: '2px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#6b7280',
                }}
              >
                👥 {normalizedEvent.type === 'bazaar' ? 'Vendors' : 'Participants'}
              </span>
              <span
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: getEventTypeColor(normalizedEvent.type),
                }}
              >
                {normalizedEvent.currentParticipants} / {normalizedEvent.maxParticipants}
              </span>
            </div>
            
            <div style={{
              width: "100%",
              height: "8px",
              background: '#e5e7eb',
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: '0.5rem',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${participationPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${getEventTypeColor(normalizedEvent.type)}, ${getEventTypeColor(normalizedEvent.type)}dd)`,
                  borderRadius: "999px",
                }}
              />
            </div>
            
            {normalizedEvent.registrationDeadline && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Registration Deadline
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#111827',
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
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  💰 Cost
                </span>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: getEventTypeColor(normalizedEvent.type),
                  }}
                >
                  ${normalizedEvent.cost}
                </span>
              </div>
            )}
          </div>
        )}

        {normalizedEvent.type === "workshop" && normalizedEvent.instructor && (
          <div
            style={{
              background: '#f9fafb',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
                margin: 0,
              }}
            >
              <strong style={{ color: '#111827' }}>Instructor:</strong> {normalizedEvent.instructor}
            </p>
            {normalizedEvent.duration && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '0.25rem',
                }}
              >
                <strong style={{ color: '#111827' }}>Duration:</strong> {normalizedEvent.duration} hours
              </p>
            )}
          </div>
        )}
        
        <div style={{ flexGrow: 1 }}></div>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: '0.75rem',
            marginTop: "auto",
            paddingTop: '1rem'
          }}
        >
          {isAdmin ? (
            <>
              {normalizedEvent.currentParticipants === 0 && (
                <Button
                  variant="danger"
                  onClick={handleDeleteEvent}
                  title="Delete event (only if no registrations)"
                  style={{
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
                  }}
                >
                  Delete Event
                </Button>
              )}
            </>
          ) : isEventsOffice ? (
            <>
              {(isOwner || onEdit || onEditTrip || onEditConference) && !hasStarted && normalizedEvent.type !== 'workshop' && (
                <Button
                  variant="primary"
                  onClick={handleEditClick}
                  style={{
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
                  }}
                >
                  Edit
                </Button>
              )}

              {(isOwner || onDelete) && !hasStarted && normalizedEvent.currentParticipants === 0 && (
                <Button
                  variant="danger"
                  onClick={handleDeleteEvent}
                  style={{
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
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
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
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
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
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
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.8rem',
                  }}
                >
                  Export
                </Button>
              )}
              {isEventsOffice && !hasEnded && onRestrict && (
                <Button
                  variant="secondary"
                  onClick={() => onRestrict(normalizedEvent)}
                  style={{
                    minHeight: "48px",
                    padding: '0.75rem 0.5rem',
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
                  }}
                >
                  Restrict
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Regular users: Show Register button or Already Registered badge */}
              {!isEventsOffice && !isAdmin && showRegistration && canRegister() && !isUserRegistered() && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRegistrationForm(true);
                    }}
                    style={{
                      width: "100%",
                      minHeight: "52px",
                      borderRadius: '0.75rem',
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: `linear-gradient(135deg, ${getEventTypeColor(normalizedEvent.type)}, ${getEventTypeColor(normalizedEvent.type)}dd)`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: 'none',
                      color: '#ffffff',
                    }}
                  >
                    ✨ Register Now
                  </Button>
                </motion.div>
              )}
              {!isEventsOffice && !isAdmin && isUserRegistered() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <div
                    style={{
                      width: "100%",
                      minHeight: "52px",
                      borderRadius: '0.75rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      color: '#15803d',
                      border: '2px solid #22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'default',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <span style={{ 
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}>
                      ✓
                    </span>
                    <span>Already Registered</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;