import React, { useState, useEffect } from 'react';
import { eventPaymentAPI } from '../services/wallet';
import { registrationAPI } from '../services/api';
import toast from 'react-hot-toast';
import theme from '../theme';
import Modal from './Modal';
import Button from './Button';

const styles = {
  container: {
    padding: theme.spacing[6],
    maxWidth: '500px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  warningSection: {
    background: theme.colors.warning.light,
    border: `1px solid ${theme.colors.warning.main}`,
    borderRadius: '12px',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  warningIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  warningTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning.dark,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  warningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning.dark,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  eventInfo: {
    background: theme.colors.neutral.gray50,
    padding: theme.spacing[4],
    borderRadius: '12px',
    marginBottom: theme.spacing[6],
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  eventDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.5,
  },
  paymentInfo: {
    background: theme.colors.success.light,
    border: `1px solid ${theme.colors.success.main}`,
    borderRadius: '12px',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  paymentTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success.dark,
    marginBottom: theme.spacing[2],
  },
  refundAmount: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success.dark,
    textAlign: 'center',
  },
  reasonSection: {
    marginBottom: theme.spacing[6],
  },
  reasonLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  reasonTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.neutral.gray300}`,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    resize: 'vertical',
    '::placeholder': {
      color: theme.colors.text.secondary,
    },
  },
  reasonHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing[3],
    justifyContent: 'flex-end',
  },
  errorText: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    padding: theme.spacing[2],
    background: theme.colors.error.light,
    borderRadius: '8px',
    marginBottom: theme.spacing[4],
  },
  timeWarning: {
    background: theme.colors.error.light,
    border: `1px solid ${theme.colors.error.main}`,
    borderRadius: '12px',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  },
  timeWarningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.dark,
    fontWeight: theme.typography.fontWeight.medium,
  },
};

const CancelRegistrationModal = ({ isOpen, onClose, registration, event, payment }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [hoursUntilEvent, setHoursUntilEvent] = useState(null);

  useEffect(() => {
    if (isOpen && event) {
      calculateTimeUntilEvent();
    }
  }, [isOpen, event]);

  const calculateTimeUntilEvent = () => {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    const hours = (eventDate - now) / (1000 * 60 * 60);
    setHoursUntilEvent(Math.max(0, hours));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleCancelRegistration = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (payment && payment.status === 'completed') {
        // Process refund if payment exists (this also deletes the registration)
        await eventPaymentAPI.processRefund(payment._id, {
          reason: reason.trim(),
        });
        toast.success('Registration cancelled and refund processed to your wallet!');
      } else {
        // Delete registration if no payment or payment not completed
        await registrationAPI.cancelRegistration(registration._id);
        toast.success('Registration cancelled successfully!');
      }

      onClose();
      // Refresh the page to update registration status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Cancellation error:', error);
      setError(error.message || 'Failed to cancel registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event || !registration) {
    return null;
  }

  const canCancel = hoursUntilEvent === null || hoursUntilEvent >= 24;
  const refundAmount = payment?.amount || event.cost || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Cancel registration">
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Cancel Registration</h2>
          <p style={styles.subtitle}>
            Cancel your registration and request refund
          </p>
        </div>

        {/* Time Warning */}
        {hoursUntilEvent !== null && hoursUntilEvent < 24 && (
          <div style={styles.timeWarning}>
            <div style={styles.timeWarningText}>
              ⚠️ Cancellation not allowed within 24 hours of event start<br/>
              Time until event: {Math.round(hoursUntilEvent)} hours
            </div>
          </div>
        )}

        {/* Warning Section */}
        {canCancel && (
          <div style={styles.warningSection}>
            <div style={styles.warningIcon}>⚠️</div>
            <div style={styles.warningTitle}>Important Notice</div>
            <div style={styles.warningText}>
              Cancelling your registration will remove your spot from this event. 
              This action cannot be undone. If you paid for this event, 
              a refund will be processed to your wallet.
            </div>
          </div>
        )}

        {/* Event Information */}
        <div style={styles.eventInfo}>
          <h3 style={styles.eventTitle}>{event.title}</h3>
          <div style={styles.eventDetails}>
            📅 {formatDate(event.startDate)}<br/>
            📍 {event.location}<br/>
            🎫 Registration ID: {registration._id?.slice(-6)}<br/>
            💰 Cost: {formatCurrency(event.cost || 0)}
          </div>
        </div>

        {/* Payment/Refund Information */}
        {canCancel && refundAmount > 0 && (
          <div style={styles.paymentInfo}>
            <div style={styles.paymentTitle}>
              💰 Refund Information
            </div>
            <div style={styles.refundAmount}>
              {formatCurrency(refundAmount)} will be refunded to your wallet
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        {canCancel && (
          <div style={styles.reasonSection}>
            <label style={styles.reasonLabel}>
              Reason for Cancellation <span style={{ color: theme.colors.error.main }}>*</span>
            </label>
            <textarea
              style={styles.reasonTextarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancelling your registration (minimum 10 characters)..."
              maxLength={500}
            />
            <div style={styles.reasonHint}>
              {reason.length}/500 characters (minimum 10 required)
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorText}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Keep Registration
          </Button>
          {canCancel && (
            <Button
              variant="danger"
              onClick={handleCancelRegistration}
              disabled={loading || !reason.trim() || reason.trim().length < 10}
            >
              {loading ? 'Processing...' : 'Cancel Registration'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CancelRegistrationModal;