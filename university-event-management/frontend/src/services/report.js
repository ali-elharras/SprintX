import api from './api';

export const fetchAttendeeReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/attendees', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendee report:', error);
    throw error;
  }
};

export const fetchSalesReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/sales', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

export const fetchFeatureFlags = async () => {
  try {
    const response = await api.get('/feature-flags');
    return response.data;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return {};
  }
};