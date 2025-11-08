import React, { useState } from 'react';
import { createBazaarCheckoutSession, createBoothCheckoutSession } from '../../services/payment';
import toast from 'react-hot-toast';
import theme from '../../theme';

const styles = {
  paymentContainer: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[4],
    background: theme.colors.neutral.gray50,
    borderRadius: '12px',
    border: `1px solid ${theme.colors.neutral.gray200}`,
  },
  paymentInfo: {
    marginBottom: theme.spacing[3],
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
  },
  label: {
    color: theme.colors.neutral.gray600,
    fontWeight: theme.typography.fontWeight.medium,
  },
  value: {
    color: theme.colors.neutral.gray900,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  amount: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
  deadline: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.medium,
  },
  payButton: {
    width: '100%',
    background: `linear-gradient(135deg, ${theme.colors.success.main} 0%, ${theme.colors.success.dark} 100%)`,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: '12px',
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  payButtonDisabled: {
    background: theme.colors.neutral.gray300,
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  paidBadge: {
    display: 'inline-block',
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    background: theme.colors.success.light,
    color: theme.colors.success.dark,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  expiredBadge: {
    display: 'inline-block',
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    background: theme.colors.error.light,
    color: theme.colors.error.dark,
    borderRadius: '8px',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
};

const PaymentButton = ({ application, applicationType }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      let response;
      if (applicationType === 'bazaar') {
        response = await createBazaarCheckoutSession(application._id);
      } else {
        response = await createBoothCheckoutSession(application._id);
      }

      if (response.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Check if payment is completed
  if (application.paymentStatus === 'completed') {
    return (
      <div style={styles.paymentContainer}>
        <div style={styles.paidBadge}>✓ Payment Completed</div>
        {application.paidAt && (
          <p style={{ ...styles.label, marginTop: theme.spacing[2] }}>
            Paid on: {new Date(application.paidAt).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  // Check if payment deadline has passed
  const isExpired = application.paymentDeadline && new Date() > new Date(application.paymentDeadline);
  if (isExpired || application.paymentStatus === 'expired') {
    return (
      <div style={styles.paymentContainer}>
        <div style={styles.expiredBadge}>Payment Deadline Expired</div>
        <p style={{ ...styles.label, marginTop: theme.spacing[2] }}>
          Please contact support for assistance.
        </p>
      </div>
    );
  }

  // Show payment button for pending payments
  if (application.paymentStatus === 'pending' && application.status === 'approved') {
    const deadline = new Date(application.paymentDeadline);
    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div style={styles.paymentContainer}>
        <div style={styles.paymentInfo}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Payment Amount:</span>
            <span style={styles.amount}>${application.paymentAmount?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Payment Deadline:</span>
            <span style={styles.value}>{deadline.toLocaleDateString()}</span>
          </div>
        </div>
        {daysLeft <= 1 && (
          <p style={styles.deadline}>
            ⚠️ Payment due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!
          </p>
        )}
        <button
          style={{
            ...styles.payButton,
            ...(loading ? styles.payButtonDisabled : {}),
          }}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>💳</span>
              <span>Pay Now</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
};

export default PaymentButton;
