import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conferenceAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import toast from 'react-hot-toast';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing[4],
  },
  modal: {
    background: theme.colors.background.paper,
    borderRadius: '24px',
    padding: theme.spacing[8],
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    border: `1px solid ${theme.colors.border.light}`,
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  header: {
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  date: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: theme.colors.text.secondary,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[6],
  },
  textarea: {
    width: '100%',
    padding: theme.spacing[4],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    backgroundColor: theme.colors.background.default,
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.3s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[4],
  },
  datetimeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing[4],
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing[3],
    marginTop: theme.spacing[6],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '24px',
    zIndex: 10,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${theme.colors.neutral.gray200}`,
    borderTop: `3px solid ${theme.colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  select: {
    width: '100%',
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.background.default,
    color: theme.colors.text.primary,
  },
};

const cssKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.close-button:hover {
  background: ${theme.colors.neutral.gray100} !important;
  color: ${theme.colors.text.primary} !important;
}

.textarea:focus, .select:focus {
  outline: none;
  border-color: ${theme.colors.primary.main} !important;
  box-shadow: 0 0 0 3px ${theme.colors.primary.light}20;
}
`;

const ConferenceModal = ({ isOpen, onClose, conference = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    shortDescription: '',
    fullAgenda: '',
    websiteLink: '',
    requiredBudget: '',
    sourceOfFunding: 'GUC',
    extraRequiredResources: '',
    location: '',
    maxParticipants: ''
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!conference;

  useEffect(() => {
    if (conference) {
      const startDateTime = new Date(conference.startDate);
      const endDateTime = new Date(conference.endDate);
      setFormData({
        name: conference.title || conference.name || '',
        startDate: conference.startDate ? startDateTime.toISOString().slice(0, 16) : '',
        endDate: conference.endDate ? endDateTime.toISOString().slice(0, 16) : '',
        shortDescription: conference.shortDescription || conference.description || '',
        fullAgenda: conference.fullAgenda || '',
        websiteLink: conference.websiteLink || '',
        requiredBudget: conference.requiredBudget || '',
        sourceOfFunding: conference.sourceOfFunding || 'GUC',
        extraRequiredResources: conference.extraRequiredResources || '',
        location: conference.location || '',
        maxParticipants: conference.maxParticipants || conference.capacity || ''
      });
    } else {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        shortDescription: '',
        fullAgenda: '',
        websiteLink: '',
        requiredBudget: '',
        sourceOfFunding: 'GUC',
        extraRequiredResources: '',
        location: '',
        maxParticipants: ''
      });
    }
  }, [conference, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(formData.startDate);
      const endDateTime = new Date(formData.endDate);
      
      const minimumEndDateTime = new Date(startDateTime);
      minimumEndDateTime.setHours(startDateTime.getHours() + 1); // Add 1 hour

      if (endDateTime < minimumEndDateTime) {
        toast.error('End date and time must be at least 1 hour after start date and time');
        setLoading(false);
        return;
      }
      
      const conferenceData = {
        name: formData.name,
        title: formData.name, // For backward compatibility
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        shortDescription: formData.shortDescription,
        description: formData.shortDescription, // For backward compatibility
        fullAgenda: formData.fullAgenda,
        websiteLink: formData.websiteLink,
        requiredBudget: Number(formData.requiredBudget),
        sourceOfFunding: formData.sourceOfFunding,
        extraRequiredResources: '',
        location: formData.location,
        maxParticipants: Number(formData.maxParticipants),
        capacity: Number(formData.maxParticipants), // For backward compatibility
      };

      if (isEdit) {
        await conferenceAPI.updateConference(conference._id, conferenceData);
        toast.success('Conference updated successfully!');
      } else {
        await conferenceAPI.createConference(conferenceData);
        toast.success('Conference created successfully!');
      }
      
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} conference`;
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // Auto-set end date to 1 hour after start date
      if (name === 'startDate' && value) {
        const dateTimeParts = value.split('T');
        const datePart = dateTimeParts[0];
        const timeParts = dateTimeParts[1].split(':');
        
        let hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        
        hours = hours + 1;
        
        let newDatePart = datePart;
        if (hours >= 24) {
          hours = hours - 24;
          const dateObj = new Date(datePart + 'T00:00');
          dateObj.setDate(dateObj.getDate() + 1);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          newDatePart = `${year}-${month}-${day}`;
        }
        
        const paddedHours = String(hours).padStart(2, '0');
        newFormData.endDate = `${newDatePart}T${paddedHours}:${minutes}`;
      }

      return newFormData;
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate tomorrow's datetime (minimum allowed datetime)
  const getTomorrowDateTimeString = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };
  
  const tomorrowString = getTomorrowDateTimeString();

  if (!isOpen) return null;

  return (
    <>
      <style>{cssKeyframes}</style>
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <AnimatePresence>
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {loading && (
              <div style={styles.loadingOverlay}>
                <div style={styles.spinner}></div>
              </div>
            )}

            <button
              className="close-button"
              style={styles.closeButton}
              onClick={onClose}
              disabled={loading}
            >
              ×
            </button>

            <div style={styles.header}>
              <h2 style={styles.title}>
                {isEdit ? 'Edit Conference' : 'Create New Conference'}
              </h2>
              <p style={styles.date}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <Input
                label="Conference Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <div style={styles.datetimeGrid}>
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min={tomorrowString}
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min={formData.startDate || tomorrowString}
                />
              </div>

              <div>
                <label 
                  htmlFor="shortDescription" 
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                </label>
                <Input
                  label= "Short Description"
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={styles.textarea}
                  placeholder="Enter short description..."
                />
              </div>

              <div>
                <label 
                  htmlFor="fullAgenda" 
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                </label>
                <Input
                  label= "Full Agenda"
                  id="fullAgenda"
                  name="fullAgenda"
                  value={formData.fullAgenda}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={styles.textarea}
                  placeholder="Enter full agenda..."
                />
              </div>

              <Input
                label="Conference Website Link"
                type="url"
                name="websiteLink"
                value={formData.websiteLink}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <Input
                label="Required Budget"
                type="number"
                name="requiredBudget"
                value={formData.requiredBudget}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                disabled={loading}
              />

              <div>
                <label 
                  htmlFor="sourceOfFunding" 
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                </label>
                <select
                  label= "Source of Funding"
                  id="sourceOfFunding"
                  name="sourceOfFunding"
                  value={formData.sourceOfFunding}
                  onChange={handleChange}
                  disabled={loading}
                  style={styles.select}
                  required
                >
                  <option value="GUC">GUC</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div>
                <label 
                  htmlFor="extraRequiredResources" 
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                </label>
                <textarea
                  label= "Extra Required Resources"
                  id="extraRequiredResources"
                  name="extraRequiredResources"
                  value={formData.extraRequiredResources}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={styles.textarea}
                  placeholder="Enter extra required resources..."
                />
              </div>

              <Input
                label="Location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <Input
                label="Max Participants"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
                min="1"
                disabled={loading}
              />

              <div style={styles.buttons}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isEdit ? 'Update Conference' : 'Create Conference')}
                </Button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ConferenceModal;