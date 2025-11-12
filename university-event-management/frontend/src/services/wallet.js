import api from './api';

// Wallet API service
export const walletAPI = {
  // Get wallet details
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  // Get wallet balance
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  // Get transaction history
  getTransactionHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    
    const response = await api.get(`/wallet/transactions?${queryParams}`);
    return response.data;
  },

  // Admin: Add credit to user wallet
  addCredit: async (creditData) => {
    const response = await api.post('/wallet/credit', creditData);
    return response.data;
  },

  // Admin: Get wallet statistics
  getWalletStats: async () => {
    const response = await api.get('/wallet/admin/stats');
    return response.data;
  },
};

// Event Payment API service
export const eventPaymentAPI = {
  // Create payment for event registration
  createPayment: async (registrationId, paymentData) => {
    const response = await api.post(`/payments/events/${registrationId}`, paymentData);
    return response.data;
  },

  // Verify Stripe payment
  verifyStripePayment: async (verificationData) => {
    const response = await api.post('/payments/events/verify-stripe', verificationData);
    return response.data;
  },

  // Process refund for cancelled registration
  processRefund: async (paymentId, refundData) => {
    const response = await api.post(`/payments/events/${paymentId}/refund`, refundData);
    return response.data;
  },

  // Get user's payment history
  getMyPayments: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await api.get(`/payments/events/my-payments?${queryParams}`);
    return response.data;
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/payments/events/${paymentId}`);
    return response.data;
  },
};