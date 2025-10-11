import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conferenceAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import { toast } from 'react-toastify';

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
    maxWidth: '700px',
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

.textarea:focus {
  outline: none;
  border-color: ${theme.colors.primary.main} !important;
  box-shadow: 0 0 0 3px ${theme.colors.primary.light}20;
}
`;

const ConferenceModal = ({ isOpen, onClose, conference = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEdit] = useState(!!conference);

  useEffect(() => {
    if (conference) {
      setFormData({
        title: conference.title || '',
        description: conference.description || '',
        date: conference.date ? new Date(conference.date).toISOString().split('T')[0] : '',
        location: conference.location || '',
        capacity: conference.capacity || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: ''
      });
    }
  }, [conference, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await conferenceAPI.updateConference(conference._id, formData);
        toast.success('Conference updated successfully!');
      } else {
        await conferenceAPI.createConference(formData);
        toast.success('Conference created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} conference`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
                label="Title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
              
              <div>
                <label 
                  htmlFor="description" 
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={styles.textarea}
                  placeholder="Enter conference description..."
                />
              </div>

              <div style={styles.grid}>
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

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
                  label="Capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>

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