import api from './api';

export const loyaltyService = {
  // Get vendor's loyalty program status
  getVendorStatus: async () => {
    try {
      const response = await api.get('/loyalty/vendor-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor loyalty status:', error);
      throw error;
    }
  },

  // Get available rewards
  getAvailableRewards: async () => {
    try {
      const response = await api.get('/loyalty/rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty rewards:', error);
      throw error;
    }
  },

  // Redeem a reward
  redeemReward: async (rewardId) => {
    try {
      const response = await api.post(`/loyalty/rewards/${rewardId}/redeem`);
      return response.data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  },

  // Get loyalty point history
  getPointHistory: async () => {
    try {
      const response = await api.get('/loyalty/points/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching point history:', error);
      throw error;
    }
  },

  checkEnrollmentStatus: async () => {
    try {
      const response = await api.get('/loyalty/enrollment-status');
      return response.data;
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      throw error;
    }
  },

  enrollInProgram: async () => {
    try {
      const response = await api.post('/loyalty/enroll');
      return response.data;
    } catch (error) {
      console.error('Error enrolling in program:', error);
      throw error;
    }
  },

  cancelEnrollment: async () => {
    try {
      const response = await api.post('/loyalty/cancel-enrollment');
      return response.data;
    } catch (error) {
      console.error('Error canceling enrollment:', error);
      throw error;
    }
  }
};