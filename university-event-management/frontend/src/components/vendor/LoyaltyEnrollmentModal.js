import React, { useState } from 'react';
import theme from '../../theme';
import Button from '../Button';
import toast from 'react-hot-toast';

const LoyaltyEnrollmentModal = ({ isOpen, onClose, onEnroll }) => {
  const [formData, setFormData] = useState({
    discountRate: '',
    promoCode: '',
    termsAndConditions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate discount rate
    const discountRate = Number(formData.discountRate);
    if (discountRate < 0 || discountRate > 100) {
      toast.error('Discount rate must be between 0 and 100');
      return;
    }

    try {
      await onEnroll({
        ...formData,
        discountRate: Number(formData.discountRate)
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create loyalty program');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Create Loyalty Program</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Discount Rate (%)</label>
            <input
              type="number"
              name="discountRate"
              value={formData.discountRate}
              onChange={handleChange}
              style={styles.input}
              min="0"
              max="100"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Promo Code</label>
            <input
              type="text"
              name="promoCode"
              value={formData.promoCode}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Terms and Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              style={{...styles.input, minHeight: '100px'}}
              required
            />
          </div>

          <div style={styles.buttonGroup}>
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Create Program
            </Button>
          </div>
        </form>
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
    marginBottom: theme.spacing[6],
  },
  formGroup: {
    marginBottom: theme.spacing[4],
  },
  label: {
    display: 'block',
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    width: '100%',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border.default}`,
    fontSize: theme.typography.fontSize.base,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing[4],
    justifyContent: 'flex-end',
  },
};

export default LoyaltyEnrollmentModal;