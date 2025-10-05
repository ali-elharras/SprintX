import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error responses
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("vendor");
      localStorage.removeItem("userType");
      window.location.href = "/login";
    }

    // Return formatted error
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;

// ============================================
// API Service Functions
// ============================================

// Event Services
export const eventServices = {
  getUpcomingBazaars: async () => {
    try {
      const response = await api.get("/events/bazaars/upcoming");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Application Services
export const applicationServices = {
  applyToBazaar: async (bazaarId, applicationData) => {
    try {
      const response = await api.post(
        `/applications/bazaar/${bazaarId}`,
        applicationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  applyForBooth: async (applicationData) => {
    try {
      const response = await api.post("/applications/booth", applicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyParticipations: async () => {
    try {
      const response = await api.get("/applications/my-participations");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyRequests: async () => {
    try {
      const response = await api.get("/applications/my-requests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllApplications: async () => {
    try {
      const response = await api.get("/applications");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateApplicationStatus: async (applicationType, applicationId, status) => {
    try {
      const response = await api.put(
        `/applications/${applicationType}/${applicationId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
