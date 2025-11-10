import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import theme from '../../theme';
import Button from '../Button';
import Card from '../Card';
import LoyaltyEnrollmentModal from './LoyaltyEnrollmentModal';
import api from '../../services/api';

const LoyaltyProgram = () => {
  const { vendor } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  useEffect(() => {
    fetchLoyaltyPrograms();
  }, []);

  const fetchLoyaltyPrograms = async () => {
    try {
      const response = await api.get('/loyalty');
      setPrograms(response.data);
    } catch (error) {
      console.error('Fetch loyalty programs error:', error);
      toast.error('Failed to fetch loyalty programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (formData) => {
    try {
      const response = await api.post('/loyalty', formData);
      
      if (response.data) {
        toast.success('Successfully created loyalty program');
        fetchLoyaltyPrograms();
      }
    } catch (error) {
      console.error('Create loyalty program error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to create loyalty program');
      throw error;
    }
  };

  const handleCancelProgram = async (programId) => {
    if (window.confirm('Are you sure you want to cancel this loyalty program?')) {
      try {
        await api.delete(`/loyalty/${programId}`);
        toast.success('Successfully cancelled loyalty program');
        fetchLoyaltyPrograms();
      } catch (error) {
        console.error('Cancel loyalty program error:', error);
        toast.error(error.response?.data?.error || error.message || 'Failed to cancel program');
      }
    }
  };

  const styles = {
    container: {
      padding: theme.spacing[6],
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[6],
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    programsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: theme.spacing[6],
    },
    programCard: {
      padding: theme.spacing[4],
    },
    programTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      marginBottom: theme.spacing[2],
    },
    discountRate: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[4],
    },
    termsBox: {
      marginBottom: theme.spacing[4],
    },
    termsTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: theme.spacing[2],
    },
    termsText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    cancelButton: {
      marginTop: theme.spacing[4],
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Vendor Loyalty Programs</h2>
        <Button
          variant="primary"
          onClick={() => setShowEnrollmentModal(true)}
        >
          Create New Program
        </Button>
      </div>

      <div style={styles.programsGrid}>
        {programs.map(program => (
          <Card key={program._id}>
            <div style={styles.programCard}>
              <h3 style={styles.programTitle}>
                Promo Code: {program.promoCode}
              </h3>
              <p style={styles.discountRate}>
                Discount Rate: {program.discountRate}%
              </p>
              <div style={styles.termsBox}>
                <h4 style={styles.termsTitle}>Terms & Conditions:</h4>
                <p style={styles.termsText}>{program.termsAndConditions}</p>
              </div>
              <Button
                variant="danger"
                onClick={() => handleCancelProgram(program._id)}
                style={styles.cancelButton}
              >
                Cancel Program
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <LoyaltyEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onEnroll={handleCreateProgram}
      />
    </div>
  );
};

export default LoyaltyProgram;