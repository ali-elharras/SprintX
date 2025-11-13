import React, { useState } from 'react';
import toast from 'react-hot-toast';
import theme from '../theme';
import { createRegistrationCheckoutSession, createGymCheckoutSession } from '../services/payment';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  registrationId, 
  gymRegistrationId,
  amount, 
  title,
  type // 'event' or 'gym'
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);
    try {
      let response;
      
      if (type === 'event' && registrationId) {
        response = await createRegistrationCheckoutSession(registrationId, paymentMethod);
      } else if (type === 'gym' && gymRegistrationId) {
        response = await createGymCheckoutSession(gymRegistrationId, paymentMethod);
      } else {
        throw new Error('Invalid registration type');
      }

      if (paymentMethod === 'balance') {
        // Payment completed with balance
        toast.success(response.message || 'Payment successful!');
        onClose(true); // Pass true to indicate success
      } else if (paymentMethod === 'stripe' && response.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const userBalance = user?.balance || 0;
  const hasInsufficientBalance = paymentMethod === 'balance' && userBalance < amount;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: theme.spacing[4],
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: theme.colors.background.paper,
          borderRadius: theme.borderRadius.xl,
          maxWidth: '500px',
          width: '100%',
          padding: theme.spacing[6],
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2],
        }}>
          Complete Payment
        </h2>
        
        <p style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing[6],
        }}>
          {title}
        </p>

        <div style={{
          padding: theme.spacing[4],
          background: theme.colors.neutral.gray50,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing[6],
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}>
              Total Amount
            </span>
            <span style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary.main,
            }}>
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: theme.spacing[6] }}>
          <label style={{
            display: 'block',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[3],
          }}>
            Select Payment Method
          </label>

          {/* Credit Card Option */}
          <div
            onClick={() => setPaymentMethod('stripe')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: theme.spacing[4],
              border: `2px solid ${paymentMethod === 'stripe' ? theme.colors.primary.main : theme.colors.border.light}`,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing[3],
              cursor: 'pointer',
              background: paymentMethod === 'stripe' ? theme.colors.primary.light + '20' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={() => setPaymentMethod('stripe')}
              style={{ marginRight: theme.spacing[3] }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[1],
              }}>
                Credit Card
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
              }}>
                Pay securely with Stripe
              </div>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xl,
            }}>
              💳
            </div>
          </div>

          {/* Balance Option */}
          <div
            onClick={() => setPaymentMethod('balance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: theme.spacing[4],
              border: `2px solid ${paymentMethod === 'balance' ? theme.colors.primary.main : theme.colors.border.light}`,
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              background: paymentMethod === 'balance' ? theme.colors.primary.light + '20' : 'transparent',
              transition: 'all 0.2s ease',
              opacity: hasInsufficientBalance ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="balance"
              checked={paymentMethod === 'balance'}
              onChange={() => setPaymentMethod('balance')}
              disabled={hasInsufficientBalance}
              style={{ marginRight: theme.spacing[3] }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[1],
              }}>
                Account Balance
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: hasInsufficientBalance ? theme.colors.error.main : theme.colors.text.secondary,
              }}>
                Available: ${userBalance.toFixed(2)}
                {hasInsufficientBalance && ' (Insufficient)'}
              </div>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xl,
            }}>
              💰
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: theme.spacing[3],
        }}>
          <button
            onClick={onClose}
            disabled={processing}
            style={{
              flex: 1,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border.main}`,
              background: theme.colors.background.paper,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || hasInsufficientBalance}
            style={{
              flex: 1,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.md,
              border: 'none',
              background: (processing || hasInsufficientBalance) 
                ? theme.colors.neutral.gray300 
                : theme.colors.primary.main,
              color: theme.colors.text.white,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: (processing || hasInsufficientBalance) ? 'not-allowed' : 'pointer',
            }}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
