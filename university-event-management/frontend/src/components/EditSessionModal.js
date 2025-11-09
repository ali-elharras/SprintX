import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import theme from "../theme";
import { gymAPI } from "../services/api";
import { toast } from "react-hot-toast";

const styles = {
  header: {
    ...theme.typography.h4,
    marginBottom: theme.spacing[4],
    color: theme.colors.text.primary,
  },
  infoBox: {
    padding: theme.spacing[3],
    backgroundColor: theme.colors.info?.light || "#e3f2fd",
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.info?.dark || "#1976d2",
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing[3],
  },
  fullRow: { gridColumn: "1 / -1" },
  label: {
    display: "block",
    marginBottom: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  input: { ...theme.components.input.base, width: "100%", padding: theme.spacing[3] },
  buttonRow: { 
    marginTop: theme.spacing[4], 
    display: "flex", 
    gap: theme.spacing[3], 
    justifyContent: "space-between" 
  },
  cancelSessionButton: {
    ...theme.components.button.secondary,
    backgroundColor: theme.colors.error?.main || "#ef4444",
    color: theme.colors.text.white,
    border: "none",
  },
};

const EditSessionModal = ({ session, isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (session) {
      // Calculate day of week from startDate
      const startDate = session.startDate ? new Date(session.startDate) : new Date();
      const dayOfWeek = startDate.getDay();
      
      setForm({
        dayOfWeek: dayOfWeek,
        startTime: session.startTime || "09:00",
        endTime: session.endTime || "10:00",
        duration: session.duration || 60,
        startDate: session.startDate ? new Date(session.startDate).toISOString().slice(0,10) : "",
        endDate: session.endDate ? new Date(session.endDate).toISOString().slice(0,10) : "",
      });
    } else {
      setForm(null);
    }
  }, [session]);

  // Update dayOfWeek when startDate changes
  useEffect(() => {
    if (form?.startDate) {
      const date = new Date(form.startDate);
      if (!isNaN(date.getTime())) {
        const dayOfWeek = date.getDay();
        setForm(prev => ({ ...prev, dayOfWeek }));
      }
    }
  }, [form?.startDate]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      // Only send the fields that can be edited
      const payload = {
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        duration: parseInt(form.duration),
        dayOfWeek: form.dayOfWeek,
      };
      
      await gymAPI.updateSession(session._id, payload);
      toast.success("Session updated successfully. Participants have been notified.");
      if (onSaved) onSaved(session._id);
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to update session";
      toast.error(errorMsg);
    }
  };

  const handleCancelSession = async () => {
    try {
      await gymAPI.cancelSession(session._id, { 
        reason: cancelReason || "Session cancelled by Events Office",
        notifyParticipants: true 
      });
      toast.success("Session cancelled successfully. Participants have been notified.");
      if (onSaved) onSaved(session._id);
      setShowCancelConfirm(false);
      setCancelReason("");
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to cancel session";
      toast.error(errorMsg);
    }
  };

  const getDayName = (dayNum) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum] || "Unknown";
  };

  if (!isOpen || !form) return null;

  if (showCancelConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={() => setShowCancelConfirm(false)} ariaLabel="Cancel session confirmation">
        <div>
          <h3 style={styles.header}>Cancel Gym Session</h3>
          <p style={{ marginBottom: theme.spacing[4], color: theme.colors.text.secondary }}>
            Are you sure you want to cancel "{session.title}"? All registered participants will be notified and their registrations will be cancelled.
          </p>
          
          <div style={{ marginBottom: theme.spacing[4] }}>
            <label style={styles.label}>Cancellation Reason (Optional)</label>
            <textarea
              style={{ ...styles.input, height: 100, resize: "vertical" }}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation (will be included in participant notifications)..."
            />
          </div>

          <div style={styles.buttonRow}>
            <button onClick={() => setShowCancelConfirm(false)} style={{ ...theme.components.button.secondary }}>
              Go Back
            </button>
            <button onClick={handleCancelSession} style={styles.cancelSessionButton}>
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Edit session ${session.title}`}>
      <div>
        <h3 style={styles.header}>Edit Session: {session.title}</h3>
        
        <div style={styles.infoBox}>
          📝 <strong>Note:</strong> You can only edit the date, time, and duration of this session. 
          All registered participants will be automatically notified of any changes.
        </div>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Start Date *</label>
            <input 
              type="date" 
              style={styles.input} 
              value={form.startDate} 
              onChange={(e)=>handleChange('startDate', e.target.value)} 
            />
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: 4 }}>
              Day: {getDayName(form.dayOfWeek)}
            </div>
          </div>

          <div>
            <label style={styles.label}>End Date *</label>
            <input 
              type="date" 
              style={styles.input} 
              value={form.endDate} 
              onChange={(e)=>handleChange('endDate', e.target.value)} 
            />
          </div>

          <div>
            <label style={styles.label}>Start Time *</label>
            <input 
              type="time" 
              style={styles.input} 
              value={form.startTime} 
              onChange={(e)=>handleChange('startTime', e.target.value)} 
            />
          </div>

          <div>
            <label style={styles.label}>End Time *</label>
            <input 
              type="time" 
              style={styles.input} 
              value={form.endTime} 
              onChange={(e)=>handleChange('endTime', e.target.value)} 
            />
          </div>

          <div style={styles.fullRow}>
            <label style={styles.label}>Duration (minutes) *</label>
            <input 
              type="number" 
              style={styles.input} 
              value={form.duration} 
              onChange={(e)=>handleChange('duration', parseInt(e.target.value || 0))}
              min="15"
              max="180"
            />
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: 4 }}>
              Must be between 15 and 180 minutes
            </div>
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button 
            onClick={() => setShowCancelConfirm(true)} 
            style={styles.cancelSessionButton}
          >
            Cancel Session
          </button>
          <div style={{ display: "flex", gap: theme.spacing[2] }}>
            <button onClick={onClose} style={{ ...theme.components.button.secondary }}>Close</button>
            <button onClick={handleSave} style={{ ...theme.components.button.primary }}>Save Changes</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditSessionModal;
