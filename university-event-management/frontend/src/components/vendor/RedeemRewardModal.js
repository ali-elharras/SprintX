import React, { useState } from 'react';
import { loyaltyService } from '../../services/loyaltyService';
import toast from 'react-hot-toast';
import theme from '../../theme';
import Button from '../Button';

const RedeemRewardModal = ({ isOpen, onClose, reward, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    try {
      setLoading(true);
      const response = await loyaltyService.redeemReward(reward.id);
      
      if (response.success) {
        toast.success('Reward redeemed successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Redeem Reward</h3>
        <p style={styles.modalDescription}>
          Are you sure you want to redeem {reward.title} for {reward.points} points?
        </p>
        
        <div style={styles.buttonGroup}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRedeem}
            loading={loading}
          >
            Confirm Redemption
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    maxWidth: '500px',
    width: '90%',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[4],
  },
  modalDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing[4],
    justifyContent: 'flex-end',
  },
};

export default RedeemRewardModal;