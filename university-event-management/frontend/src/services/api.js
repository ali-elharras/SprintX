import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
// EVENT API ENDPOINTS
// ============================================

export const eventAPI = {
  // Get all events
  getEvents: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/events${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get single event by ID
  getEvent: (id) => api.get(`/events/${id}`),

  // Get events by type
  getEventsByType: (type) => api.get(`/events/type/${type}`),

  // Create new event (Admin/Events Office only)
  createEvent: (eventData) => api.post("/events", eventData),

  // Update event (Admin/Events Office only)
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),

  // Delete event (Admin/Events Office only)
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// ============================================
// REGISTRATION API ENDPOINTS
// ============================================

export const registrationAPI = {
  // Register for an event
  registerForEvent: (registrationData) => 
    api.post("/registrations", registrationData),

  // Get current user's registrations with optional filtering
  getMyRegistrations: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add each parameter if it exists
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    return api.get(`/registrations/my${queryString ? `?${queryString}` : ""}`);
  },

  // Get registrations for a specific event (Admin/Events Office only)
  getEventRegistrations: (eventId) => 
    api.get(`/registrations/event/${eventId}`),

  // Cancel a registration
  cancelRegistration: (registrationId) => 
    api.delete(`/registrations/${registrationId}`),

  // Update registration status (Admin/Events Office only)
  updateRegistrationStatus: (registrationId, status) =>
    api.put(`/registrations/${registrationId}/status`, { status }),

  // Check-in participant (Admin/Events Office only)
  checkInParticipant: (registrationId) =>
    api.post(`/registrations/${registrationId}/checkin`),
};
