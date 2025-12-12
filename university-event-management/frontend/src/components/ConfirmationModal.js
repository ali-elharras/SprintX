import React from 'react';
import Modal from './Modal';
import Button from './Button';
import theme from '../theme';

const styles = {
  container: {
    padding: theme.spacing[4],
  },
  header: {
    marginBottom: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  message: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.4,
    maxWidth: '300px',
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing[2],
    justifyContent: 'flex-end',
    marginTop: theme.spacing[3],
  },
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.buttonContainer}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

