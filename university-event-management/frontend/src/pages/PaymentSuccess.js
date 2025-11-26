import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment, verifyRegistrationPayment, verifyGymPayment } from '../services/payment';
import toast from 'react-hot-toast';
import theme from '../theme';
import Navbar from '../components/Navbar';

const styles = {
  pageContainer: {
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    minHeight: '100vh',
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
    fontFamily: theme.typography.fontFamily.primary,
  },
  contentWrapper: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  card: {
    background: theme.colors.neutral.white,
    borderRadius: '24px',
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.success.light} 0%, ${theme.colors.success.main} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    animation: 'scaleIn 0.5s ease-out',
  },
  checkmark: {
    fontSize: '48px',
    color: theme.colors.neutral.white,
  },
  title: {
    fontSize: '2rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.gray900,
    marginBottom: theme.spacing[3],
  },
  message: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral.gray600,
    marginBottom: theme.spacing[6],
    lineHeight: 1.6,
  },
  button: {
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
    borderRadius: '12px',
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: `4px solid ${theme.colors.neutral.gray200}`,
    borderTop: `4px solid ${theme.colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  errorIcon: {
    fontSize: '48px',
    color: theme.colors.error.main,
  },
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id'); // for event payments
  const applicationType = searchParams.get('type');
  const applicationId = searchParams.get('applicationId');
  const registrationId = searchParams.get('registrationId');
  const gymRegistrationId = searchParams.get('gymRegistrationId');

  useEffect(() => {
    const verify = async () => {
      if (!sessionId || !applicationType) {
        toast.error('Invalid payment session');
        setVerifying(false);
        return;
      }

      try {
        let response;

        // Handle different payment types
        if (applicationType === 'registration') {
          // New flow: registration is created from session metadata, no registrationId needed
          response = await verifyRegistrationPayment(sessionId);
        } else if (applicationType === 'gym' && gymRegistrationId) {
          response = await verifyGymPayment(gymRegistrationId, sessionId);
        } else if ((applicationType === 'bazaar' || applicationType === 'booth') && applicationId) {
          response = await verifyPayment(applicationType, applicationId, sessionId);
        } else {
          throw new Error('Invalid payment parameters');
        }

        if (response.success) {
          setSuccess(true);
          toast.success('Payment verified successfully!');
        } else {
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(error.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, applicationType, applicationId, registrationId, gymRegistrationId]);

  const handleGoToDashboard = () => {
    // Navigate based on payment type
    if (applicationType === 'registration') {
      navigate('/my-registrations');
    } else if (applicationType === 'gym') {
      navigate('/fitness');
    } else {
      navigate('/vendor-dashboard');
    }
  };

  return (
    <>

      <div style={styles.pageContainer}>
        <div style={styles.contentWrapper}>
          <div style={styles.card}>
            {verifying ? (
              <>
                <div style={styles.loader}></div>
                <h1 style={styles.title}>Verifying Payment...</h1>
                <p style={styles.message}>Please wait while we confirm your payment.</p>
              </>
            ) : success ? (
              <>
                <div style={styles.iconContainer}>
                  <span style={styles.checkmark}>✓</span>
                </div>
                <h1 style={styles.title}>Payment Successful!</h1>
                <p style={styles.message}>
                  {applicationType === 'registration'
                    ? 'Your event registration payment has been processed successfully. You are now registered for the event!'
                    : applicationType === 'gym'
                      ? 'Your gym session payment has been processed successfully. You are now registered for the session!'
                      : 'Your payment has been processed successfully. You can now access your participation details.'}
                </p>
                <button style={styles.button} onClick={handleGoToDashboard}>
                  {applicationType === 'registration'
                    ? 'View My Registrations'
                    : applicationType === 'gym'
                      ? 'View Gym Schedule'
                      : 'Go to Dashboard'}
                </button>
              </>
            ) : (
              <>
                <div style={styles.iconContainer}>
                  <span style={styles.errorIcon}>✗</span>
                </div>
                <h1 style={styles.title}>Payment Verification Failed</h1>
                <p style={styles.message}>
                  We couldn't verify your payment. Please contact support if you believe this is an error.
                </p>
                <button style={styles.button} onClick={handleGoToDashboard}>
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PaymentSuccess;
