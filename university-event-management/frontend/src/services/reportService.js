import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAttendeeReport = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/reports/attendees`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendee report:', error);
    throw error;
  }
};

export const fetchSalesReport = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/reports/sales`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

export const fetchFeatureFlags = async () => {
  try {
    const response = await axios.get(`${API_URL}/feature-flags`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return {};
  }
};
