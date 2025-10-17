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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing[3],
  },
  fullRow: { gridColumn: "1 / -1" },
  input: { ...theme.components.input.base, width: "100%", padding: theme.spacing[3] },
  inputError: { 
    ...theme.components.input.base, 
    width: "100%", 
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.error.main}`,
    backgroundColor: theme.colors.error.light,
  },
  buttonRow: { marginTop: theme.spacing[4], display: "flex", gap: theme.spacing[3], justifyContent: "flex-end" },
  errorText: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing[1],
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
};

const EditSessionModal = ({ session, isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (session) {
      setForm({
        title: session.title || "",
        description: session.description || "",
        type: session.type || "yoga",
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime || "09:00",
        endTime: session.endTime || "10:00",
        duration: session.duration || 60,
        startDate: session.startDate ? new Date(session.startDate).toISOString().slice(0,10) : "",
        endDate: session.endDate ? new Date(session.endDate).toISOString().slice(0,10) : "",
        location: session.location || "",
        room: session.room || "",
        maxParticipants: session.maxParticipants || 20,
        skillLevel: session.skillLevel || "all_levels",
        cost: session.cost || 0,
        status: session.status || "active",
      });
      setErrors({});
    } else {
      setForm(null);
    }
  }, [session]);

  const handleChange = (key, value) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto-calculate duration when time changes
      if ((key === 'startTime' || key === 'endTime') && updated.startTime && updated.endTime) {
        const [startHour, startMin] = updated.startTime.split(':').map(Number);
        const [endHour, endMin] = updated.endTime.split(':').map(Number);
        
        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;
        
        if (endTotalMin > startTotalMin) {
          updated.duration = endTotalMin - startTotalMin;
        }
      }
      
      // Auto-calculate end time when duration changes
      if (key === 'duration' && updated.startTime && value > 0) {
        const [startHour, startMin] = updated.startTime.split(':').map(Number);
        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = startTotalMin + value;
        
        const endHour = Math.floor(endTotalMin / 60);
        const endMin = endTotalMin % 60;
        
        updated.endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      }
      
      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title || form.title.trim().length === 0) {
      newErrors.title = "Title is required";
    }
    if (!form.type) {
      newErrors.type = "Type is required";
    }
    if (!form.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!form.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      newErrors.endTime = "End time must be after start time";
    }
    if (!form.duration || form.duration < 15 || form.duration > 180) {
      newErrors.duration = "Duration must be between 15 and 180 minutes";
    }
    if (!form.location || form.location.trim().length === 0) {
      newErrors.location = "Location is required";
    }
    if (!form.maxParticipants || form.maxParticipants <= 0) {
      newErrors.maxParticipants = "Max participants must be greater than 0";
    } else if (session?.currentParticipants && form.maxParticipants < session.currentParticipants) {
      newErrors.maxParticipants = `Max participants cannot be less than current participants (${session.currentParticipants})`;
    }
    if (!form.skillLevel) {
      newErrors.skillLevel = "Skill level is required";
    }
    if (form.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the errors highlighted below");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...form };
      await gymAPI.updateSession(session._id, payload);
      toast.success("Session updated successfully");
      if (onSaved) onSaved(session._id);
      onClose();
    } catch (err) {
      console.error("Error updating session:", err);
      
      // Handle backend validation errors
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to update session";
      
      // If it's a detailed validation error, show specific fields
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => {
          const field = e.param || e.field || e.path;
          if (field) {
            fieldErrors[field] = e.msg || e.message || "Invalid value";
          }
        });
        setErrors(fieldErrors);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !form) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Edit session ${session.title}`}>
      <div>
        <h3 style={styles.header}>Edit Session</h3>
        <div style={styles.grid}>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Title <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              style={errors.title ? styles.inputError : styles.input} 
              value={form.title} 
              onChange={(e)=>handleChange('title', e.target.value)} 
              placeholder="Title" 
            />
            {errors.title && <div style={styles.errorText}>{errors.title}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Type <span style={{ color: theme.colors.error.main }}>*</span></label>
            <select 
              style={errors.type ? styles.inputError : styles.input} 
              value={form.type} 
              onChange={(e)=>handleChange('type', e.target.value)}
            >
              <option value="yoga">Yoga</option>
              <option value="pilates">Pilates</option>
              <option value="aerobics">Aerobics</option>
              <option value="zumba">Zumba</option>
              <option value="cross_circuit">Cross Circuit</option>
              <option value="kickboxing">Kickboxing</option>
              <option value="cardio">Cardio</option>
              <option value="strength_training">Strength Training</option>
              <option value="dance">Dance</option>
              <option value="martial_arts">Martial Arts</option>
              <option value="swimming">Swimming</option>
              <option value="spinning">Spinning</option>
            </select>
            {errors.type && <div style={styles.errorText}>{errors.type}</div>}
          </div>

          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Start Date <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="date" 
              style={errors.startDate ? styles.inputError : styles.input} 
              value={form.startDate} 
              onChange={(e)=>handleChange('startDate', e.target.value)} 
            />
            {errors.startDate && <div style={styles.errorText}>{errors.startDate}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>End Date <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="date" 
              style={errors.endDate ? styles.inputError : styles.input} 
              value={form.endDate} 
              onChange={(e)=>handleChange('endDate', e.target.value)} 
            />
            {errors.endDate && <div style={styles.errorText}>{errors.endDate}</div>}
          </div>

          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Start Time <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="time" 
              style={errors.startTime ? styles.inputError : styles.input} 
              value={form.startTime} 
              onChange={(e)=>handleChange('startTime', e.target.value)} 
            />
            {errors.startTime && <div style={styles.errorText}>{errors.startTime}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>End Time <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="time" 
              style={errors.endTime ? styles.inputError : styles.input} 
              value={form.endTime} 
              onChange={(e)=>handleChange('endTime', e.target.value)} 
            />
            {errors.endTime && <div style={styles.errorText}>{errors.endTime}</div>}
          </div>

          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Duration (min) <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="number" 
              style={errors.duration ? styles.inputError : styles.input} 
              value={form.duration} 
              onChange={(e)=>handleChange('duration', parseInt(e.target.value || 0))} 
            />
            {errors.duration && <div style={styles.errorText}>{errors.duration}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Max Participants <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              type="number" 
              style={errors.maxParticipants ? styles.inputError : styles.input} 
              value={form.maxParticipants} 
              onChange={(e)=>handleChange('maxParticipants', parseInt(e.target.value || 0))} 
            />
            {errors.maxParticipants && <div style={styles.errorText}>{errors.maxParticipants}</div>}
          </div>

          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Skill Level <span style={{ color: theme.colors.error.main }}>*</span></label>
            <select 
              style={errors.skillLevel ? styles.inputError : styles.input} 
              value={form.skillLevel} 
              onChange={(e)=>handleChange('skillLevel', e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all_levels">All Levels</option>
            </select>
            {errors.skillLevel && <div style={styles.errorText}>{errors.skillLevel}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Cost</label>
            <input 
              type="number" 
              step="0.01" 
              style={errors.cost ? styles.inputError : styles.input} 
              value={form.cost} 
              onChange={(e)=>handleChange('cost', parseFloat(e.target.value || 0))} 
            />
            {errors.cost && <div style={styles.errorText}>{errors.cost}</div>}
          </div>

          <div style={{ ...styles.inputWrapper, gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Location <span style={{ color: theme.colors.error.main }}>*</span></label>
            <input 
              style={errors.location ? styles.inputError : styles.input} 
              value={form.location} 
              onChange={(e)=>handleChange('location', e.target.value)} 
              placeholder="Location" 
            />
            {errors.location && <div style={styles.errorText}>{errors.location}</div>}
          </div>
          <div style={{ ...styles.inputWrapper, gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Room</label>
            <input style={styles.input} value={form.room} onChange={(e)=>handleChange('room', e.target.value)} placeholder="Room (optional)" />
          </div>

          <div style={styles.inputWrapper}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Status</label>
            <select style={styles.input} value={form.status} onChange={(e)=>handleChange('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div />

          <div style={{ ...styles.inputWrapper, gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Description</label>
            <textarea style={{ ...styles.input, height: 120 }} value={form.description} onChange={(e)=>handleChange('description', e.target.value)} placeholder="Description (optional)" />
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button onClick={onClose} style={{ ...theme.components.button.secondary }} disabled={isSaving}>Cancel</button>
          <button onClick={handleSave} style={{ ...theme.components.button.primary }} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditSessionModal;
