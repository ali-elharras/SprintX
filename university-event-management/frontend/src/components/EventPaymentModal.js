import React, { useState, useEffect } from 'react';
import { eventPaymentAPI, walletAPI } from '../services/wallet';
import toast from 'react-hot-toast';
import theme from '../theme';
import Modal from './Modal';
import Button from './Button';
import './EventPaymentModal.css';

const styles = {
  container: {
    padding: theme.spacing[6],
    maxWidth: '550px',
    width: '100%',
    position: 'relative',
  },
  
  // Header with gradient background
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    position: 'relative',
    padding: theme.spacing[6],
    background: theme.colors.primary.gradient,
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(-10px)',
  },
  
  headerIcon: {
    fontSize: '48px',
    marginBottom: theme.spacing[3],
    display: 'block',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
  },
  
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    opacity: 0.9,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Enhanced event info card
  eventInfo: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: theme.spacing[5],
    borderRadius: '20px',
    marginBottom: theme.spacing[6],
    border: '1px solid rgba(102, 126, 234, 0.1)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  eventInfoGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  
  eventTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.gray800,
    marginBottom: theme.spacing[3],
    position: 'relative',
    zIndex: 1,
  },
  
  eventDetails: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray600,
    lineHeight: 1.6,
    position: 'relative',
    zIndex: 1,
  },
  
  eventDetailRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
    padding: theme.spacing[2],
    borderRadius: '12px',
    background: 'rgba(102, 126, 234, 0.04)',
    transition: 'all 0.2s ease',
  },
  
  eventDetailIcon: {
    fontSize: '20px',
    marginRight: theme.spacing[3],
    minWidth: '24px',
    textAlign: 'center',
  },

  // Premium cost info styling
  costInfo: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing[6],
    borderRadius: '20px',
    marginBottom: theme.spacing[6],
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
  },
  
  costInfoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  
  costAmount: {
    fontSize: '3rem',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  
  costLabel: {
    fontSize: theme.typography.fontSize.base,
    opacity: 0.9,
    fontWeight: theme.typography.fontWeight.medium,
    position: 'relative',
    zIndex: 1,
  },
  // Enhanced payment methods section
  paymentMethods: {
    marginBottom: theme.spacing[6],
  },
  
  methodTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.gray800,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  
  methodOption: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing[4],
    border: '2px solid transparent',
    borderRadius: '16px',
    marginBottom: theme.spacing[4],
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    transform: 'translateY(0)',
  },
  
  methodOptionHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
  
  methodOptionSelected: {
    border: `2px solid ${theme.colors.primary.main}`,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    boxShadow: `0 8px 25px rgba(102, 126, 234, 0.25)`,
    transform: 'translateY(-2px)',
  },
  
  methodOptionSelectedGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: '16px',
    pointerEvents: 'none',
  },
  
  methodOptionDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    filter: 'grayscale(0.3)',
    transform: 'none !important',
  },
  
  methodIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
    fontSize: '28px',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
  },
  
  walletIcon: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
  },
  
  stripeIcon: {
    background: 'linear-gradient(135deg, #635bff 0%, #4f46e5 100%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(99, 91, 255, 0.3)',
  },
  
  methodInfo: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  
  methodName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.gray800,
    marginBottom: theme.spacing[1],
  },
  
  methodDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray600,
    marginBottom: theme.spacing[2],
    lineHeight: 1.5,
  },
  
  walletBalance: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    padding: `${theme.spacing[1]}px ${theme.spacing[3]}px`,
    borderRadius: '20px',
    display: 'inline-block',
  },
  
  walletBalancePositive: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: theme.colors.success.dark,
  },
  
  insufficientBalance: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: theme.colors.error.dark,
  },
  
  methodBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    background: theme.colors.primary.main,
    color: 'white',
    padding: `${theme.spacing[1]}px ${theme.spacing[2]}px`,
    borderRadius: '12px',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  // Enhanced processing fee notice
  processingFee: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    padding: theme.spacing[4],
    borderRadius: '16px',
    marginBottom: theme.spacing[6],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.warning.dark,
    textAlign: 'center',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  processingFeeIcon: {
    fontSize: '24px',
    marginBottom: theme.spacing[2],
    display: 'block',
  },
  
  // Enhanced button container with better spacing
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing[4],
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing[6],
    paddingTop: theme.spacing[4],
    borderTop: '1px solid rgba(102, 126, 234, 0.1)',
  },
  
  cancelButton: {
    flex: '0 0 auto',
    minWidth: '120px',
    width: 'auto',
  },
  
  payButton: {
    flex: '0 0 auto',
    minWidth: '180px',
    background: theme.colors.primary.gradient,
    border: 'none',
    color: 'white',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    padding: `${theme.spacing[3]}px ${theme.spacing[6]}px`,
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  payButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  },
  
  payButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  
  // Enhanced loading state
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(102, 126, 234, 0.2)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: theme.spacing[4],
  },
  
  loadingText: {
    textAlign: 'center',
    color: theme.colors.neutral.gray600,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Enhanced error styling
  errorText: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: theme.colors.error.dark,
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    padding: theme.spacing[4],
    borderRadius: '16px',
    marginBottom: theme.spacing[4],
    border: '1px solid rgba(239, 68, 68, 0.2)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  
  errorIcon: {
    fontSize: '20px',
  },
  
  // Security badge
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success.dark,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  securityIcon: {
    fontSize: '16px',
  },
};

const EventPaymentModal = ({ isOpen, onClose, registration, event }) => {
  const [loading, setLoading] = useState(false);
  // Stripe-only for now
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('stripe');
      setError(null);
    }
  }, [isOpen]);

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

  const calculateProcessingFee = (amount, method) => {
    // Stripe sandbox: 2.9% + $0.30
    if (method === 'stripe') return (amount * 0.029) + 0.30;
    return 0;
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await eventPaymentAPI.createPayment(registration._id, {
        paymentMethod: selectedMethod,
      });

      // Redirect to Stripe checkout page
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen || !event || !registration) {
    return null;
  }

  const eventCost = event.cost || 0;
  const processingFee = calculateProcessingFee(eventCost, selectedMethod);
  const totalAmount = eventCost + processingFee;
  const hasInsufficientBalance = false; // wallet disabled

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Payment for event">
      <div style={styles.container} className="payment-modal-container">
        {/* Enhanced Header with gradient and icon */}
        <div style={styles.header} className="payment-header">
          <span style={styles.headerIcon} className="floating-icon">💳</span>
          <h2 style={styles.title} className="gradient-text">Complete Payment</h2>
          <p style={styles.subtitle}>
            Secure payment for your event registration
          </p>
        </div>

        {/* Enhanced Event Information */}
        <div style={styles.eventInfo} className="payment-event-info">
          <div style={styles.eventInfoGlow}></div>
          <h3 style={styles.eventTitle}>{event.title}</h3>
          <div style={styles.eventDetails}>
            <div style={styles.eventDetailRow}>
              <span style={styles.eventDetailIcon} className="floating-icon">📅</span>
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div style={styles.eventDetailRow}>
              <span style={styles.eventDetailIcon} className="floating-icon">📍</span>
              <span>{event.location}</span>
            </div>
            <div style={styles.eventDetailRow}>
              <span style={styles.eventDetailIcon} className="floating-icon">🎫</span>
              <span>Registration ID: {registration._id?.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Cost Information */}
        <div style={styles.costInfo} className="payment-cost-info">
          <div style={styles.costInfoGlow}></div>
          <div style={styles.costAmount}>
            {formatCurrency(eventCost)}
          </div>
          <div style={styles.costLabel}>
            Event Registration Fee
          </div>
        </div>

        {/* Stripe-only Payment Method */}
        <div style={styles.paymentMethods} className="payment-methods">
          <h3 style={styles.methodTitle}>💳 Choose Payment Method</h3>

          {/* Stripe Payment */}
          <div
            style={{
              ...styles.methodOption,
              ...(selectedMethod === 'stripe' && styles.methodOptionSelected),
            }}
            className={`payment-method-option ${selectedMethod === 'stripe' ? 'payment-method-selected' : ''}`}
            onClick={() => setSelectedMethod('stripe')}
            tabIndex={0}
            role="button"
            aria-pressed={selectedMethod === 'stripe'}
          >
            {selectedMethod === 'stripe' && <div style={styles.methodOptionSelectedGlow}></div>}
            {selectedMethod === 'stripe' && (
              <div style={styles.methodBadge}>✓ Selected</div>
            )}
            <div style={{ ...styles.methodIcon, ...styles.stripeIcon }} className="floating-icon">
              💳
            </div>
            <div style={styles.methodInfo}>
              <div style={styles.methodName}>💎 Credit/Debit Card</div>
              <div style={styles.methodDescription}>
                Secure payment via Stripe • Visa, Mastercard, Amex & more
              </div>
              <div style={{
                ...styles.walletBalance,
                ...styles.walletBalancePositive,
                opacity: 0.8
              }}>
                🔒 256-bit SSL Encryption
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Processing Fee Notice */}
        {selectedMethod === 'stripe' && processingFee > 0 && (
          <div style={styles.processingFee}>
            <span style={styles.processingFeeIcon}>⚡</span>
            <strong>Processing fee: {formatCurrency(processingFee)}</strong>
            <br />
            Total amount: <strong>{formatCurrency(totalAmount)}</strong>
          </div>
        )}

        {/* Enhanced Error Message */}
        {error && (
          <div style={styles.errorText}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div style={styles.buttonContainer}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            style={styles.cancelButton}
          >
            {loading ? '⏳ Processing...' : '✖️ Cancel'}
          </Button>
          <button
            style={{
              ...styles.payButton,
              ...(loading || !selectedMethod || hasInsufficientBalance ? styles.payButtonDisabled : {}),
            }}
            className={`payment-button-primary ${loading || !selectedMethod || hasInsufficientBalance ? 'disabled' : ''}`}
            onClick={handlePayment}
            disabled={loading || !selectedMethod || hasInsufficientBalance}
          >
            {loading ? (
              <>
                <span className="payment-loading-spinner"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <span className="floating-icon">💳</span>
                {` Pay ${formatCurrency(totalAmount)}`}
              </>
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div style={styles.securityBadge} className="payment-security-badge">
          <span style={styles.securityIcon} className="floating-icon">🔒</span>
          Your payment information is secure and encrypted
        </div>
      </div>
    </Modal>
  );
};

export default EventPaymentModal;