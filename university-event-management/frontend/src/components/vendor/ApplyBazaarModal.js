import React, { useState } from "react";
import toast from "react-hot-toast";
import theme from "../../theme";
import { X, Upload, Users, MapPin, Info } from 'lucide-react';

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
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    gap: theme.spacing[2],
  },
  progressStepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  progressStep: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: theme.colors.neutral.gray200,
    color: theme.colors.neutral.gray600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    transition: 'all 0.3s ease',
    fontSize: theme.typography.fontSize.base,
  },
  progressStepActive: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.neutral.white,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing[6],
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  },
  infoCard: {
    display: 'flex',
    alignItems: 'start',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: `${theme.colors.primary.main}10`,
    borderRadius: '12px',
    border: `1px solid ${theme.colors.primary.light}`,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    margin: 0,
    lineHeight: 1.6,
  },
  boothOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing[4],
  },
  boothOption: {
    padding: theme.spacing[4],
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.neutral.white,
  },
  boothOptionSelected: {
    borderColor: theme.colors.primary.main,
    backgroundColor: `${theme.colors.primary.main}05`,
  },
  boothIcon: {
    marginBottom: theme.spacing[3],
    display: 'flex',
    justifyContent: 'center',
  },
  boothSize: {
    fontSize: '1.125rem',
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[2]} 0`,
  },
  boothPrice: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    margin: 0,
  },
  attendeeCard: {
    padding: theme.spacing[4],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    backgroundColor: theme.colors.neutral.gray50,
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
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    display: 'block',
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
  },
  reviewCard: {
    padding: theme.spacing[5],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    backgroundColor: theme.colors.neutral.white,
  },
  reviewTitle: {
    fontSize: '1.25rem',
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  reviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  reviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing[3],
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  reviewLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  reviewValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  termsBox: {
    display: 'flex',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.neutral.gray50,
    borderRadius: '8px',
    alignItems: 'start',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0,
  },
  termsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
    margin: 0,
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

const ApplyBazaarModal = ({ bazaar, isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [boothSize, setBoothSize] = useState("2x2");
  const [attendees, setAttendees] = useState([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
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
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    const finalAttendees = attendees.filter(a => a.name && a.email);
    onSubmit({ boothSize, attendees: finalAttendees });
    
    // Reset form
    setStep(1);
    setBoothSize("2x2");
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    setAgreedToTerms(false);
  };

  const handleClose = () => {
    setStep(1);
    setBoothSize("2x2");
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={handleClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalHeaderContent}>
            <h2 style={styles.modalTitle}>Apply to {bazaar?.name || bazaar?.title}</h2>
            <p style={styles.modalSubtitle}>Step {step} of 3</p>
          </div>
          <button style={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progressContainer}>
          {[1, 2, 3].map(num => (
            <div key={num} style={styles.progressStepWrapper}>
              <div style={{
                ...styles.progressStep,
                ...(num <= step ? styles.progressStepActive : {})
              }}>
                {num}
              </div>
              <span style={styles.progressLabel}>
                {num === 1 ? 'Booth Size' : num === 2 ? 'Attendees' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalContent}>
            {step === 1 && (
              <div style={styles.stepContent}>
                <div style={styles.infoCard}>
                  <Info size={20} color={theme.colors.primary.main} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={styles.infoText}>Select your preferred booth size for this bazaar</p>
                </div>
                
                <div style={styles.boothOptions}>
                  {['2x2', '4x4'].map(size => (
                    <div
                      key={size}
                      style={{
                        ...styles.boothOption,
                        ...(boothSize === size ? styles.boothOptionSelected : {})
                      }}
                      onClick={() => setBoothSize(size)}
                    >
                      <div style={styles.boothIcon}>
                        <MapPin size={32} color={boothSize === size ? theme.colors.primary.main : theme.colors.neutral.gray600} />
                      </div>
                      <h3 style={styles.boothSize}>{size} meters</h3>
                      <p style={styles.boothPrice}>Standard booth</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={styles.stepContent}>
                <div style={styles.infoCard}>
                  <Users size={20} color={theme.colors.primary.main} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={styles.infoText}>Add up to 5 attendees who will be present at your booth</p>
                </div>

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
                      <label style={styles.label}>Full Name</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="John Doe"
                        value={attendee.name}
                        onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email Address</label>
                      <input
                        type="email"
                        style={styles.input}
                        placeholder="john@example.com"
                        value={attendee.email}
                        onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>ID Proof (Image)</label>
                      <div style={styles.fileUpload}>
                        <Upload size={20} color={theme.colors.neutral.gray600} />
                        <span style={styles.fileText}>
                          {attendee.idProofFileName || 'Click to upload'}
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
            )}

            {step === 3 && (
              <div style={styles.stepContent}>
                <div style={styles.reviewCard}>
                  <h3 style={styles.reviewTitle}>Application Summary</h3>
                  
                  <div style={styles.reviewSection}>
                    <div style={styles.reviewRow}>
                      <span style={styles.reviewLabel}>Bazaar</span>
                      <span style={styles.reviewValue}>{bazaar?.name || bazaar?.title}</span>
                    </div>
                    <div style={styles.reviewRow}>
                      <span style={styles.reviewLabel}>Booth Size</span>
                      <span style={styles.reviewValue}>{boothSize} meters</span>
                    </div>
                    <div style={styles.reviewRow}>
                      <span style={styles.reviewLabel}>Number of Attendees</span>
                      <span style={styles.reviewValue}>{attendees.filter(a => a.name && a.email).length}</span>
                    </div>
                  </div>

                  <div style={styles.termsBox}>
                    <input 
                      type="checkbox" 
                      id="terms" 
                      style={styles.checkbox}
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <label htmlFor="terms" style={styles.termsLabel}>
                      I agree to the terms and conditions and understand that payment is required within 48 hours of approval
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.modalFooter}>
            {step > 1 && (
              <button type="button" style={styles.secondaryButton} onClick={handleBack}>
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" style={styles.primaryButton} onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button type="submit" style={styles.primaryButton}>
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyBazaarModal;