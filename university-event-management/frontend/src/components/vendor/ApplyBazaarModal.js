
import React, { useState } from "react";
import toast from "react-hot-toast";
import theme from "../../theme";

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: theme.colors.background.default,
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamily.secondary,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  formGroup: {
    marginBottom: theme.spacing[4],
  },
  label: {
    display: "block",
    marginBottom: theme.spacing[2],
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    ...theme.components.input.base,
    width: "100%",
  },
  select: {
    ...theme.components.input.base,
    width: "100%",
  },
  attendeeRow: {
    display: "flex",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  button: {
    ...theme.components.button.primary,
    width: "100%",
    marginTop: theme.spacing[4],
  },
  closeButton: {
    ...theme.components.button.secondary,
    width: "100%",
    marginTop: theme.spacing[2],
  },
  addButton: {
    ...theme.components.button.secondary,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    fontSize: theme.typography.fontSize.sm,
  },
};

const ApplyBazaarModal = ({ bazaar, isOpen, onClose, onSubmit }) => {
  const [boothSize, setBoothSize] = useState("2x2");
  const [attendees, setAttendees] = useState([{ name: "", email: "" }]);

  if (!isOpen) return null;

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const addAttendeeRow = () => {
    setAttendees([...attendees, { name: "", email: "" }]);
  };

  const removeAttendeeRow = (index) => {
    const newAttendees = attendees.filter((_, i) => i !== index);
    setAttendees(newAttendees);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty attendees
    const finalAttendees = attendees.filter(a => a.name && a.email);
    if (finalAttendees.length === 0) {
        toast.error("Please add at least one attendee.");
        return;
    }
    onSubmit({ boothSize, attendees: finalAttendees });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalHeader}>Apply to {bazaar.title}</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="boothSize">
              Booth Size
            </label>
            <select
              id="boothSize"
              style={styles.select}
              value={boothSize}
              onChange={(e) => setBoothSize(e.target.value)}
            >
              <option value="2x2">2x2 meters</option>
              <option value="4x4">4x4 meters</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Attendees</label>
            {attendees.map((attendee, index) => (
              <div key={index} style={styles.attendeeRow}>
                <input
                  type="text"
                  placeholder="Name"
                  style={styles.input}
                  value={attendee.name}
                  onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  style={styles.input}
                  value={attendee.email}
                  onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                  required
                />
                {attendees.length > 1 && (
                  <button type="button" style={styles.addButton} onClick={() => removeAttendeeRow(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {attendees.length < 5 && (
              <button type="button" style={styles.addButton} onClick={addAttendeeRow}>
                Add Attendee
              </button>
            )}
          </div>

          <button type="submit" style={styles.button}>
            Submit Application
          </button>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyBazaarModal;
