import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { gymAPI } from "../services/api";
import theme from "../theme";
import Modal from "./Modal";
import EditSessionModal from "./EditSessionModal";
import GymSessionDetailsModal from "./GymSessionDetailsModal";
import PaymentModal from "./PaymentModal";

const GymSessionCard = ({ session, onUpdated, viewOnly = false, userGymRegistrations = [] }) => {
  const { user, isAdmin, isEventsOffice } = useAuth();
  const auth = { isAdmin, isEventsOffice };
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [gymRegistrationData, setGymRegistrationData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const getSessionTypeColor = (type) => {
    const colors = {
      yoga: "#8b5cf6",
      pilates: "#10b981",
      aerobics: "#f59e0b",
      zumba: "#ec4899",
      cross_circuit: "#ef4444",
      kickboxing: "#3b82f6",
      cardio: "#f97316",
      strength_training: "#6b7280",
      dance: "#d946ef",
      martial_arts: "#1f2937",
      swimming: "#06b6d4",
      spinning: "#84cc16",
    };
    return colors[type] || theme.colors.primary.main;
  };

  const getSkillLevelDisplay = (level) => {
    const levels = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      all_levels: "All Levels",
    };
    return levels[level] || level;
  };

  const getDayName = (dayNum) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayNum];
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleRegister = async () => {
    if (!user || !session) return;
    
    try {
      setRegistering(true);
      const registrationData = {
        registrationType: "regular",
        notifications: {
          email: true,
          reminder24h: true
        }
      };
      
      const response = await gymAPI.register(session._id, registrationData);
      
      // Check if payment is required
      if (response.data.requiresPayment) {
        // Store registration info and show payment modal
        setGymRegistrationData(response.data.data);
        setShowPaymentModal(true);
      } else {
        // Free session or waitlisted - registration complete
        toast.success(response.data.message || "Successfully registered for this session!");
        
        // Refresh the session data
        if (onUpdated) {
          onUpdated(session._id);
        }
        setRegistering(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Failed to register for session");
      setRegistering(false);
    }
  };

  const handlePaymentComplete = (success) => {
    setShowPaymentModal(false);
    setRegistering(false);
    
    if (success) {
      toast.success("Registration and payment successful!");
      // Refresh the session data
      if (onUpdated) {
        onUpdated(session._id);
      }
    }
  };

  const handleDeleteSession = async () => {
    try {
      await gymAPI.cancelSession(session._id, { 
        reason: deleteReason || "Session deleted by Events Office",
        notifyParticipants: true 
      });
      toast.success("Session deleted successfully. Participants have been notified.");
      if (onUpdated) onUpdated(session._id);
      setShowDeleteConfirm(false);
      setDeleteReason("");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to delete session";
      toast.error(errorMsg);
    }
  };

  const canUserRegister = () => {
    if (viewOnly) return false;
    if (!user) return false;
    if (isAdmin || isEventsOffice) return false; // Admins/Events Office don't register
    if (hasRegistered) return false; // Already registered
    return session.status === 'active';
  };

  // Check if user is already registered for this session
  React.useEffect(() => {
    if (!user || !session || !userGymRegistrations) {
      setHasRegistered(false);
      return;
    }

    const isRegistered = userGymRegistrations.some(registration => {
      const regSessionId = registration.gymSession?._id || registration.gymSession;
      const currentSessionId = session._id;
      const isActiveStatus = registration.status === 'active';
      return regSessionId === currentSessionId && isActiveStatus;
    });

    setHasRegistered(isRegistered);
  }, [user, userGymRegistrations, session]);

  // Debug logging
  React.useEffect(() => {
    console.log('GymSessionCard Debug:', {
      viewOnly,
      user: user ? 'Logged in' : 'Not logged in',
      isAdmin,
      isEventsOffice,
      canRegister: canUserRegister(),
      sessionTitle: session?.title,
      sessionStatus: session?.status
    });
  }, [viewOnly, user, isAdmin, isEventsOffice, session]);

  const styles = {
    card: {
      position: "relative",
      backgroundColor: theme.colors.background.paper,
      borderRadius: "20px",
      border: `2px solid ${isHovered ? getSessionTypeColor(session.type) : '#e5e7eb'}`,
      boxShadow: isHovered
        ? "0 20px 40px rgba(0, 0, 0, 0.15)"
        : "0 10px 30px rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
      cursor: "pointer",
    },
    header: {
      padding: theme.spacing[4],
      background: `linear-gradient(135deg, ${getSessionTypeColor(session.type)}15, ${getSessionTypeColor(session.type)}05)`,
      borderBottom: `3px solid ${getSessionTypeColor(session.type)}`,
      position: "relative",
    },
    typeTag: {
      position: "absolute",
      top: theme.spacing[3],
      right: theme.spacing[3],
      background: getSessionTypeColor(session.type),
      color: theme.colors.text.white,
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
      paddingRight: theme.spacing[16], // Space for type tag
    },
    instructor: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    body: {
      padding: theme.spacing[4],
    },
    scheduleInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing[4],
      padding: theme.spacing[3],
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.md,
    },
    dayTime: {
      textAlign: "center",
    },
    day: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    time: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing[1],
    },
    duration: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
    location: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
    details: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: theme.spacing[4],
    },
    detailItem: {
      textAlign: "center",
    },
    detailLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontWeight: theme.typography.fontWeight.medium,
    },
    detailValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.semibold,
      marginTop: theme.spacing[1],
    },
    capacityBar: {
      marginBottom: theme.spacing[4],
    },
    capacityLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[2],
      display: "flex",
      justifyContent: "space-between",
    },
    progressBar: {
      width: "100%",
      height: "8px",
      backgroundColor: theme.colors.neutral.gray200,
      borderRadius: theme.borderRadius.full,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: theme.borderRadius.full,
      transition: "width 0.3s ease",
    },
    buttons: {
      display: "flex",
      gap: theme.spacing[2],
    },
    registerButton: {
      flex: 1,
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.md,
      border: "none",
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: "all 0.3s ease",
      textAlign: "center",
    },
    detailsButton: {
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border.main}`,
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: "pointer",
      transition: "all 0.3s ease",
      minWidth: "80px",
    },
    expandedDetails: {
      marginTop: theme.spacing[4],
      padding: theme.spacing[4],
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    statusBadge: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  };

  // const availableSpots = session.maxParticipants - session.currentParticipants; // Removed unused variable
  const capacityPercentage = (session.currentParticipants / session.maxParticipants) * 100;

  const getRegisterButtonStyle = () => {
    if (hasRegistered) {
      return {
        ...styles.registerButton,
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        color: '#15803d',
        border: '2px solid #22c55e',
        cursor: 'default',
        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
      };
    }

    if (!canUserRegister()) {
      return {
        ...styles.registerButton,
        backgroundColor: theme.colors.neutral.gray300,
        color: theme.colors.text.disabled,
        cursor: "not-allowed",
      };
    }

    if (session.isFull && session.waitlistEnabled) {
      return {
        ...styles.registerButton,
        backgroundColor: theme.colors.warning.main,
        color: theme.colors.text.white,
      };
    }

    return {
      ...styles.registerButton,
      background: getSessionTypeColor(session.type),
      color: theme.colors.text.white,
    };
  };

  const getProgressBarColor = () => {
    if (capacityPercentage >= 90) return theme.colors.error.main;
    if (capacityPercentage >= 70) return theme.colors.warning.main;
    return theme.colors.success.main;
  };

  const getRegisterButtonText = () => {
    if (hasRegistered) return (
      <>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', marginRight: '0.5rem' }}>✓</span>
        <span>Registered</span>
      </>
    );
    if (viewOnly) return "View Only";
    if (!user) return "Login to Register";

    if (registering) return "Registering...";
    if (session.isFull && !session.waitlistEnabled) return "Full";
    if (session.isFull && session.waitlistEnabled) return "Join Waitlist";
    if (session.status !== 'active') return "Inactive";
    return "Register";
  };

  return (
    <>
    <motion.div
      style={styles.card}
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
          background: `linear-gradient(to bottom, ${getSessionTypeColor(session.type)}, ${getSessionTypeColor(session.type)}dd)`,
          borderTopLeftRadius: "18px",
          borderBottomLeftRadius: "18px",
          zIndex: 1,
        }}
      />
      <div style={styles.header}>
        <div style={styles.typeTag}>{session.type.replace("_", " ")}</div>
        <h3 style={styles.title}>{session.title}</h3>
        <p style={styles.instructor}>with {session.instructor?.name}</p>
      </div>

      <div style={styles.body}>
        <div style={styles.details}>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Skill Level</div>
            <div style={styles.detailValue}>{getSkillLevelDisplay(session.skillLevel)}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Cost</div>
            <div style={styles.detailValue}>{session.cost === 0 ? "Free" : `$${session.cost}`}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Status</div>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: session.status === "active" ? theme.colors.success.light : theme.colors.neutral.gray200,
              color: session.status === "active" ? theme.colors.success.dark : theme.colors.text.secondary,
            }}>{session.status}</div>
          </div>
        </div>

        <div style={styles.capacityBar}>
          <div style={styles.capacityLabel}>
            <span>Capacity</span>
            <span>{session.currentParticipants} / {session.maxParticipants}</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${capacityPercentage}%`, backgroundColor: getProgressBarColor() }} />
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {!auth.isAdmin && !auth.isEventsOffice && (
            <button
              style={{
                ...getRegisterButtonStyle(),
                minHeight: "48px",
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: "0.75rem",
                whiteSpace: "nowrap",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!hasRegistered) {
                  handleRegister();
                }
              }}
              disabled={!canUserRegister() || registering || hasRegistered}
            >
              {getRegisterButtonText()}
            </button>
          )}

          {(auth.isAdmin || auth.isEventsOffice) && (
            <>
              <button
                style={{
                  ...styles.detailsButton,
                  backgroundColor: theme.colors.background.paper,
                  minHeight: "48px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "0.75rem",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditOpen(true);
                }}
              >
                Edit
              </button>
              <button
                style={{
                  ...styles.detailsButton,
                  backgroundColor: theme.colors.error?.main || "#ef4444",
                  color: theme.colors.text.white,
                  border: "none",
                  minHeight: "48px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "0.75rem",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
              >
                Delete
              </button>
            </>
          )}

          <button
            style={{
              ...styles.detailsButton,
              minHeight: "48px",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
              whiteSpace: "nowrap",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>

    {/* Render modals outside the motion.div to prevent layout issues */}
    {/* Edit modal */}
    <EditSessionModal session={session} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSaved={(id) => { if (typeof onUpdated === 'function') onUpdated(id); }} />

    {/* Details modal */}
    <GymSessionDetailsModal 
      session={session} 
      isOpen={isDetailsOpen} 
      onClose={() => setIsDetailsOpen(false)} 
      isAdminOrEventsOffice={auth.isAdmin || auth.isEventsOffice} 
      onSaved={(id) => { if (typeof onUpdated === 'function') onUpdated(id); }} 
      viewOnly={viewOnly}
    />

    {/* Payment Modal */}
    {showPaymentModal && gymRegistrationData && (
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentComplete}
        gymRegistrationId={gymRegistrationData._id}
        amount={session.cost || 0}
        title={`Registration for ${session.title}`}
        type="gym"
      />
    )}

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} ariaLabel="Delete session confirmation">
        <div>
          <h3 style={{ ...theme.typography.h4, marginBottom: theme.spacing[4], color: theme.colors.text.primary }}>
            Delete Gym Session
          </h3>
          <p style={{ marginBottom: theme.spacing[4], color: theme.colors.text.secondary }}>
            Are you sure you want to delete "{session.title}"? All registered participants will be notified and their registrations will be cancelled.
          </p>
          
          <div style={{ marginBottom: theme.spacing[4] }}>
            <label style={{ display: "block", marginBottom: theme.spacing[1], fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Deletion Reason (Optional)
            </label>
            <textarea
              style={{ ...theme.components.input.base, width: "100%", height: 100, resize: "vertical", padding: theme.spacing[2] }}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason for deletion (will be included in participant notifications)..."
            />
          </div>

          <div style={{ display: "flex", gap: theme.spacing[2], justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ ...theme.components.button.secondary }}>
              Cancel
            </button>
            <button 
              onClick={handleDeleteSession} 
              style={{ 
                ...theme.components.button.secondary,
                backgroundColor: theme.colors.error?.main || "#ef4444",
                color: theme.colors.text.white,
                border: "none"
              }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
};

export default GymSessionCard;
