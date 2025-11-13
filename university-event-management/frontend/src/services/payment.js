import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Create checkout session for bazaar application
export const createBazaarCheckoutSession = async (applicationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-checkout-session/bazaar/${applicationId}`,
      {},
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create checkout session for booth application
export const createBoothCheckoutSession = async (applicationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-checkout-session/booth/${applicationId}`,
      {},
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify payment
export const verifyPayment = async (applicationType, applicationId, sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify-payment/${applicationType}/${applicationId}`,
      { sessionId },
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment status
export const getPaymentStatus = async (applicationType, applicationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/status/${applicationType}/${applicationId}`,
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create checkout session for event registration
export const createRegistrationCheckoutSession = async (registrationId, paymentMethod) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-checkout-session/registration/${registrationId}`,
      { paymentMethod },
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create checkout session for gym registration
export const createGymCheckoutSession = async (gymRegistrationId, paymentMethod) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-checkout-session/gym/${gymRegistrationId}`,
      { paymentMethod },
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify registration payment
export const verifyRegistrationPayment = async (registrationId, sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify-payment/registration/${registrationId}`,
      { sessionId },
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify gym payment
export const verifyGymPayment = async (gymRegistrationId, sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify-payment/gym/${gymRegistrationId}`,
      { sessionId },
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
