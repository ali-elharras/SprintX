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
  buttonRow: { marginTop: theme.spacing[4], display: "flex", gap: theme.spacing[3], justifyContent: "flex-end" },
};

const EditSessionModal = ({ session, isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
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
    } else {
      setForm(null);
    }
  }, [session]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      const payload = { ...form };
      await gymAPI.updateSession(session._id, payload);
      toast.success("Session updated");
      if (onSaved) onSaved(session._id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update session");
    }
  };

  if (!isOpen || !form) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Edit session ${session.title}`}>
      <div>
        <h3 style={styles.header}>Edit Session</h3>
        <div style={styles.grid}>
          <input style={styles.input} value={form.title} onChange={(e)=>handleChange('title', e.target.value)} placeholder="Title" />
          <select style={styles.input} value={form.type} onChange={(e)=>handleChange('type', e.target.value)}>
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

          <input type="date" style={styles.input} value={form.startDate} onChange={(e)=>handleChange('startDate', e.target.value)} />
          <input type="date" style={styles.input} value={form.endDate} onChange={(e)=>handleChange('endDate', e.target.value)} />

          <input type="time" style={styles.input} value={form.startTime} onChange={(e)=>handleChange('startTime', e.target.value)} />
          <input type="time" style={styles.input} value={form.endTime} onChange={(e)=>handleChange('endTime', e.target.value)} />

          <input type="number" style={styles.input} value={form.duration} onChange={(e)=>handleChange('duration', parseInt(e.target.value || 0))} />
          <input type="number" style={styles.input} value={form.maxParticipants} onChange={(e)=>handleChange('maxParticipants', parseInt(e.target.value || 0))} />

          <select style={styles.input} value={form.skillLevel} onChange={(e)=>handleChange('skillLevel', e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all_levels">All Levels</option>
          </select>
          <input type="number" step="0.01" style={styles.input} value={form.cost} onChange={(e)=>handleChange('cost', parseFloat(e.target.value || 0))} />

          <input style={{ ...styles.input, gridColumn: '1 / -1' }} value={form.location} onChange={(e)=>handleChange('location', e.target.value)} placeholder="Location" />
          <input style={{ ...styles.input, gridColumn: '1 / -1' }} value={form.room} onChange={(e)=>handleChange('room', e.target.value)} placeholder="Room (optional)" />

          <select style={styles.input} value={form.status} onChange={(e)=>handleChange('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
            <option value="full">Full</option>
          </select>
          <div />

          <textarea style={{ ...styles.input, height: 120, gridColumn: '1 / -1' }} value={form.description} onChange={(e)=>handleChange('description', e.target.value)} placeholder="Description (optional)" />
        </div>

        <div style={styles.buttonRow}>
          <button onClick={onClose} style={{ ...theme.components.button.secondary }}>Cancel</button>
          <button onClick={handleSave} style={{ ...theme.components.button.primary }}>Save</button>
        </div>
      </div>
    </Modal>
  );
};

export default EditSessionModal;
