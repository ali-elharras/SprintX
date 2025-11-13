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
// registrationIdOrData can be either:
// - A string (registrationId) for legacy flow
// - An object (registrationData) for new flow where registration is created after payment
export const createRegistrationCheckoutSession = async (registrationIdOrData, paymentMethod) => {
  try {
    // Determine if this is the new flow (object) or legacy flow (string)
    const isNewFlow = typeof registrationIdOrData === 'object' && registrationIdOrData !== null;
    
    let url, body;
    if (isNewFlow) {
      // New flow: send registrationData in body
      url = `${API_URL}/payments/create-checkout-session/registration`;
      body = { 
        paymentMethod,
        registrationData: registrationIdOrData
      };
    } else {
      // Legacy flow: registrationId in URL
      url = `${API_URL}/payments/create-checkout-session/registration/${registrationIdOrData}`;
      body = { paymentMethod };
    }
    
    const response = await axios.post(url, body, {
      headers: {
        Authorization: getAuthToken(),
      },
    });
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
// In the new flow, registration is created from the Stripe session metadata
// So we don't need registrationId anymore, just sessionId
export const verifyRegistrationPayment = async (sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify-payment/registration`,
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
