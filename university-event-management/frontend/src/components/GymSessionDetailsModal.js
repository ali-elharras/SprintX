import React from "react";
import Modal from "./Modal";
import theme from "../theme";
import EditSessionModal from "./EditSessionModal";
import { gymAPI } from "../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const styles = {
  header: { ...theme.typography.h4, marginBottom: theme.spacing[3] },
  meta: { color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
  section: { marginBottom: theme.spacing[3] },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: theme.spacing[2] },
};

const GymSessionDetailsModal = ({ session, isOpen, onClose, onSaved, isAdminOrEventsOffice = false, viewOnly = false, userGymRegistrations = [] }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);
  const [hasRegistered, setHasRegistered] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState("");
  const { user } = useAuth();

  // Check if user can register (not admin/events office viewing mode and not already registered)
  const canRegister = !isAdminOrEventsOffice && !viewOnly && user && !hasRegistered;
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
    if (isOpen) {
      console.log('GymSessionDetailsModal Debug:', {
        isAdminOrEventsOffice,
        viewOnly,
        user: user ? 'Logged in' : 'Not logged in',
        canRegister,
        sessionTitle: session?.title
      });
    }
  }, [isOpen, isAdminOrEventsOffice, viewOnly, user, canRegister, session]);

  const handleRegister = async () => {
    if (!session || !user) return;
    
    try {
      setRegistering(true);
      const registrationData = {
        registrationType: "regular",
        notifications: {
          email: true,
          reminder24h: true
        }
      };
      
      await gymAPI.register(session._id, registrationData);
      toast.success("Successfully registered for this session!");
      
      // Refresh the session data
      if (onSaved) {
        onSaved(session._id);
      }
      
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register for session");
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await gymAPI.cancelSession(session._id, { 
        reason: deleteReason || "Session deleted by Events Office",
        notifyParticipants: true 
      });
      toast.success("Session deleted successfully. Participants have been notified.");
      if (onSaved) onSaved(session._id);
      setShowDeleteConfirm(false);
      setDeleteReason("");
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to delete session";
      toast.error(errorMsg);
    }
  };

  if (!isOpen || !session) return null;
  
  if (showDeleteConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={() => setShowDeleteConfirm(false)} ariaLabel="Delete session confirmation">
        <div>
          <h3 style={styles.header}>Delete Gym Session</h3>
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
    );
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Details for ${session.title}`}>
      <div>
        <h3 style={styles.header}>{session.title}</h3>
        <div style={styles.meta}>{session.type.replace('_', ' ')} • {session.skillLevel}</div>

        <div style={styles.section}>
          <strong>Schedule</strong>
          <div>{session.dayOfWeek !== undefined ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][session.dayOfWeek] : ''} {session.startTime} - {session.endTime}</div>
          <div>From: {session.startDate ? new Date(session.startDate).toLocaleDateString() : ''} To: {session.endDate ? new Date(session.endDate).toLocaleDateString() : ''}</div>
        </div>

        <div style={styles.section}>
          <strong>Instructor</strong>
          <div>{session.instructor?.name} {session.instructor?.certifications ? `• ${session.instructor.certifications.join(', ')}` : ''}</div>
          {session.instructor?.bio && <div style={{ marginTop: theme.spacing[2] }}>{session.instructor.bio}</div>}
        </div>

        <div style={styles.section}>
          <strong>Details</strong>
          {session.description && <p>{session.description}</p>}
          <div>Location: {session.location}{session.room ? ` (${session.room})` : ''}</div>
          <div>Capacity: {session.currentParticipants || 0} / {session.maxParticipants}</div>
          <div>Cost: {session.cost === 0 ? 'Free' : `$${session.cost}`}</div>
          {session.equipment && session.equipment.length > 0 && <div>Equipment: {session.equipment.join(', ')}</div>}
          {session.tags && session.tags.length > 0 && <div>Tags: {session.tags.join(', ')}</div>}
        </div>

        <div style={styles.section}>
          <strong>Eligibility</strong>
          <div>Eligible roles: {session.eligibleRoles?.join(', ')}</div>
          {session.ageRestriction && <div>Age: {session.ageRestriction.minAge} - {session.ageRestriction.maxAge}</div>}
        </div>

        <div style={styles.actions}>
          {hasRegistered && !isAdminOrEventsOffice && (
            <div
              style={{
                padding: '12px 24px',
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
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>✓</span>
              <span>Registered</span>
            </div>
          )}
          {canRegister && (
            <button 
              onClick={handleRegister} 
              disabled={registering || session.isFull}
              style={{ 
                ...theme.components.button.primary,
                opacity: (registering || session.isFull) ? 0.6 : 1,
                cursor: (registering || session.isFull) ? 'not-allowed' : 'pointer'
              }}
            >
              {registering ? "Registering..." : session.isFull ? "Session Full" : "Register for Session"}
            </button>
          )}
          {isAdminOrEventsOffice && !viewOnly && (
            <>
              <button onClick={() => setIsEditOpen(true)} style={{ ...theme.components.button.primary }}>Edit</button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                style={{ 
                  ...theme.components.button.secondary,
                  backgroundColor: theme.colors.error?.main || "#ef4444",
                  color: theme.colors.text.white,
                  border: "none"
                }}
              >
                Delete
              </button>
            </>
          )}
          <button onClick={onClose} style={{ ...theme.components.button.secondary }}>Close</button>
        </div>

        {isAdminOrEventsOffice && !viewOnly && (
          <EditSessionModal session={session} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSaved={(id)=>{ setIsEditOpen(false); onSaved && onSaved(id); onClose && onClose(); }} />
        )}
      </div>
    </Modal>
  );
};

export default GymSessionDetailsModal;
