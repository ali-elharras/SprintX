import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { gymAPI } from "../services/api";
import theme from "../theme";
import Modal from "./Modal";
import EditSessionModal from "./EditSessionModal";
import GymSessionDetailsModal from "./GymSessionDetailsModal";

const GymSessionCard = ({ session, onUpdated, isRegistered = false, registration = null, onRegister }) => {
  const { user, isAdmin, isEventsOffice } = useAuth();
  const auth = { isAdmin, isEventsOffice };
  const [isRegistering, setIsRegistering] = useState(false);
  // details are handled via modal now
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
    if (!user) {
      toast.error("Please log in to register for sessions");
      return;
    }

    try {
      setIsRegistering(true);
      await gymAPI.register(session._id, { registrationType: 'regular' });
      toast.success('Successfully registered for gym session!');
      if (typeof onRegister === 'function') {
        await onRegister(session._id);
      }
      if (typeof onUpdated === 'function') {
        await onUpdated(session._id);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Failed to register for session");
    } finally {
      setIsRegistering(false);
    }
  };

  const canUserRegister = () => {
    if (!user) return false;
    if (session.status !== "active") return false;
    if (session.isFull && !session.waitlistEnabled) return false;
    if (!session.eligibleRoles.includes(user.role)) return false;
    return true;
  };

  const styles = {
    card: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.xl,
      boxShadow: theme.shadows.card,
      overflow: "hidden",
      transition: "all 0.3s ease",
      cursor: "pointer",
      border: `2px solid transparent`,
      ":hover": {
        transform: "translateY(-5px)",
        boxShadow: theme.shadows.cardHover,
      },
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
    if (!user) return "Login to Register";
    if (!canUserRegister()) return "Not Eligible";
    if (session.isFull && session.waitlistEnabled) return "Join Waitlist";
    if (session.isFull) return "Session Full";
    return isRegistering ? "Registering..." : "Register";
  };

  // registered state comes from server
  const effectiveRegistered = Boolean(isRegistered);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.typeTag}>{session.type.replace("_", " ")}</div>
        {effectiveRegistered && (
          <div style={{ position: 'absolute', top: theme.spacing[3], left: theme.spacing[3], backgroundColor: theme.colors.success.dark, color: theme.colors.text.white, padding: '4px 8px', borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.xs }}>
            Registered
          </div>
        )}
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

        <div style={styles.buttons}>
          <button
            style={getRegisterButtonStyle()}
            onClick={() => {
              if (effectiveRegistered) return;
              setIsRegisterOpen(true);
            }}
            disabled={isRegistering || effectiveRegistered || !canUserRegister()}
          >
            {effectiveRegistered ? "Registered" : getRegisterButtonText()}
          </button>

          {(auth.isAdmin || auth.isEventsOffice) && (
            <button style={{ ...styles.detailsButton, backgroundColor: theme.colors.background.paper }} onClick={() => setIsEditOpen(true)}>Edit</button>
          )}

          {!(auth.isAdmin || auth.isEventsOffice) && (
            <button style={styles.detailsButton} onClick={() => setIsDetailsOpen(true)}>Details</button>
          )}
        </div>

        {/* Edit modal */}
        <EditSessionModal session={session} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSaved={(id) => { if (typeof onUpdated === 'function') onUpdated(id); }} />

        {/* Details modal */}
        <GymSessionDetailsModal session={session} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} isAdminOrEventsOffice={auth.isAdmin || auth.isEventsOffice} onSaved={(id) => { if (typeof onUpdated === 'function') onUpdated(id); }} />

        {/* Register confirmation modal */}
        <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} ariaLabel={`Register for ${session.title}`}>
          <div>
            <h3 style={{ ...theme.typography.h4 }}>Register for {session.title}</h3>
            <p>Do you want to register for this session on {getDayName(session.dayOfWeek)} at {formatTime(session.startTime)}?</p>
            <div style={{ marginTop: theme.spacing[3], display: 'flex', gap: theme.spacing[2], justifyContent: 'flex-end' }}>
              <button onClick={() => setIsRegisterOpen(false)} style={{ ...theme.components.button.secondary }}>Cancel</button>
              <button onClick={async () => {
                try {
                  await handleRegister();
                  setIsRegisterOpen(false);
                } catch (err) {
                  console.error(err);
                }
              }} style={{ ...theme.components.button.primary }}>{getRegisterButtonText()}</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GymSessionCard;
