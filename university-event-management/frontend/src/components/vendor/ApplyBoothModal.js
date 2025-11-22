import React, { useState } from "react";
import toast from "react-hot-toast";
import theme from "../../theme";
import BoothMapSelector from "./BoothMapSelector";
import { X, Calendar, MapPin, Upload, Users } from 'lucide-react';

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.default,
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    padding: theme.spacing[6],
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  closeButton: {
    backgroundColor: theme.colors.neutral.gray100,
    border: 'none',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: theme.colors.text.secondary,
    flexShrink: 0,
    marginLeft: theme.spacing[4],
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing[6],
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  input: {
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.neutral.white,
  },
  select: {
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: theme.colors.neutral.white,
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing[4],
  },
  radioGroup: {
    display: 'flex',
    gap: theme.spacing[3],
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.neutral.white,
    flex: 1,
    minWidth: '120px',
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  costSummary: {
    padding: theme.spacing[5],
    backgroundColor: theme.colors.neutral.gray50,
    borderRadius: '12px',
    marginTop: theme.spacing[4],
    border: `1px solid ${theme.colors.border.light}`,
  },
  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  costLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  costValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  costRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[3],
    borderTop: `2px solid ${theme.colors.border.light}`,
    marginTop: theme.spacing[3],
  },
  costLabelTotal: {
    fontSize: '1.125rem',
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  costValueTotal: {
    fontSize: '1.5rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  attendeeCard: {
    padding: theme.spacing[4],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    backgroundColor: theme.colors.neutral.gray50,
    marginBottom: theme.spacing[3],
  },
  attendeeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  attendeeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  },
  removeButton: {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.error.light,
    color: theme.colors.error.dark,
    border: 'none',
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  fileUpload: {
    position: 'relative',
    padding: theme.spacing[4],
    border: `2px dashed ${theme.colors.border.light}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.neutral.white,
  },
  fileText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  fileName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
    fontStyle: 'italic',
  },
  addButton: {
    padding: theme.spacing[3],
    backgroundColor: 'transparent',
    color: theme.colors.primary.main,
    border: `2px dashed ${theme.colors.primary.main}`,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: theme.spacing[3],
  },
  modalFooter: {
    display: 'flex',
    gap: theme.spacing[3],
    padding: theme.spacing[6],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  primaryButton: {
    flex: 1,
    padding: theme.spacing[3],
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.neutral.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '10px',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

const ApplyBoothModal = ({ isOpen, onClose, onSubmit }) => {
  const [boothSize, setBoothSize] = useState("2x2");
  const [startDate, setStartDate] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [selectedBoothId, setSelectedBoothId] = useState(null);
  const [attendees, setAttendees] = useState([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  if (!isOpen) return null;

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttendees = [...attendees];
        newAttendees[index].idProofBase64 = reader.result;
        newAttendees[index].idProofFileName = file.name;
        setAttendees(newAttendees);
      };
      reader.readAsDataURL(file);
    } else {
      const newAttendees = [...attendees];
      newAttendees[index].idProofBase64 = null;
      newAttendees[index].idProofFileName = "";
      setAttendees(newAttendees);
    }
  };

  const addAttendeeRow = () => {
    if (attendees.length < 5) {
      setAttendees([...attendees, { name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    }
  };

  const removeAttendeeRow = (index) => {
    const newAttendees = attendees.filter((_, i) => i !== index);
    setAttendees(newAttendees);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAttendees = attendees.filter(a => a.name && a.email);
    if (finalAttendees.length === 0) {
      toast.error("Please add at least one attendee.");
      return;
    }
    for (const attendee of finalAttendees) {
      if (attendee.name && attendee.email && !attendee.idProofBase64) {
        toast.error(`Please upload an ID proof for ${attendee.name}.`);
        return;
      }
    }
    if (!selectedBoothId) {
      toast.error("Please select a booth location on the map.");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (durationWeeks * 7));

    onSubmit({ 
      boothSize, 
      startDate: start.toISOString(), 
      endDate: end.toISOString(), 
      durationWeeks, 
      location: selectedBoothId,
      attendees: finalAttendees 
    });

    // Reset form
    setBoothSize("2x2");
    setStartDate("");
    setDurationWeeks(1);
    setSelectedBoothId(null);
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
  };

  const handleClose = () => {
    setBoothSize("2x2");
    setStartDate("");
    setDurationWeeks(1);
    setSelectedBoothId(null);
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={handleClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalHeaderContent}>
            <h2 style={styles.modalTitle}>Request Standalone Booth</h2>
            <p style={styles.modalSubtitle}>Book a permanent booth location</p>
          </div>
          <button style={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalContent}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <MapPin size={18} />
                Preferred Location
              </label>
              <BoothMapSelector
                onSelectBooth={setSelectedBoothId}
                selectedBoothId={selectedBoothId}
                startDate={startDate}
                durationWeeks={durationWeeks}
              />
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Calendar size={18} />
                  Start Date
                </label>
                <input
                  type="date"
                  style={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={tomorrow}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Duration</label>
                <select 
                  style={styles.select}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                >
                  <option value={1}>1 week</option>
                  <option value={2}>2 weeks</option>
                  <option value={3}>3 weeks</option>
                  <option value={4}>4 weeks</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Booth Size</label>
              <div style={styles.radioGroup}>
                {['2x2', '4x4'].map(size => (
                  <label key={size} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="boothSize"
                      value={size}
                      checked={boothSize === size}
                      onChange={(e) => setBoothSize(e.target.value)}
                      style={styles.radio}
                    />
                    <span>{size} meters</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Users size={18} />
                Attendees (Max 5)
              </label>
              {attendees.map((attendee, index) => (
                <div key={index} style={styles.attendeeCard}>
                  <div style={styles.attendeeHeader}>
                    <h4 style={styles.attendeeTitle}>Attendee {index + 1}</h4>
                    {attendees.length > 1 && (
                      <button 
                        type="button"
                        style={styles.removeButton}
                        onClick={() => removeAttendeeRow(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Name"
                      value={attendee.name}
                      onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      type="email"
                      style={styles.input}
                      placeholder="Email"
                      value={attendee.email}
                      onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <div style={styles.fileUpload}>
                      <Upload size={20} color={theme.colors.neutral.gray600} />
                      <span style={styles.fileText}>
                        {attendee.idProofFileName || 'Upload ID Proof'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={styles.fileInput}
                        onChange={(e) => handleFileChange(index, e)}
                        required
                      />
                    </div>
                    {attendee.idProofFileName && (
                      <p style={styles.fileName}>File: {attendee.idProofFileName}</p>
                    )}
                  </div>
                </div>
              ))}
              {attendees.length < 5 && (
                <button type="button" style={styles.addButton} onClick={addAttendeeRow}>
                  + Add Another Attendee
                </button>
              )}
            </div>

            <div style={styles.costSummary}>
              <div style={styles.costRow}>
                <span style={styles.costLabel}>Weekly Rate</span>
                <span style={styles.costValue}>$500</span>
              </div>
              <div style={styles.costRow}>
                <span style={styles.costLabel}>Duration</span>
                <span style={styles.costValue}>{durationWeeks} week(s)</span>
              </div>
              <div style={styles.costRowTotal}>
                <span style={styles.costLabelTotal}>Total Cost</span>
                <span style={styles.costValueTotal}>${500 * durationWeeks}</span>
              </div>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.secondaryButton} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" style={styles.primaryButton}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyBoothModal;