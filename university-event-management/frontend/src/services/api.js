import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
    },
    withCredentials: true
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

// ============================================
// COURT API ENDPOINTS
// ============================================

export const courtAPI = {
  // Get all courts
  getCourts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/courts${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get single court by ID
  getCourt: (id) => api.get(`/courts/${id}`),

  // Get courts by type
  getCourtsByType: (type) => api.get(`/courts/type/${type}`),

  // Get court availability for specific date
  getCourtAvailability: (courtId, date) => 
    api.get(`/courts/${courtId}/availability/${date}`),

  // Get weekly availability for a court
  getWeeklyAvailability: (courtId, startDate = null) => {
    const params = startDate ? `?startDate=${startDate}` : "";
    return api.get(`/courts/${courtId}/weekly-availability${params}`);
  },

  // Get court statistics
  getCourtStats: () => api.get("/courts/stats"),

  // Create new court (Admin only)
  createCourt: (courtData) => api.post("/courts", courtData),

  // Update court (Admin/Manager only)
  updateCourt: (id, courtData) => api.put(`/courts/${id}`, courtData),

  // Delete court (Admin only)
  deleteCourt: (id) => api.delete(`/courts/${id}`),
};

// ============================================
// GYM API FUNCTIONS
// ============================================

// Get all gym sessions
export const getGymSessions = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/gym/sessions${queryString ? `?${queryString}` : ""}`);
};

// Get gym sessions by month
export const getGymSessionsByMonth = (year, month, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/gym/sessions/month/${year}/${month}${queryString ? `?${queryString}` : ""}`);
};

// Get gym sessions by date
export const getGymSessionsByDate = (date) => {
  return api.get(`/gym/sessions/date/${date}`);
};

// Get single gym session
export const getGymSession = (id) => {
  return api.get(`/gym/sessions/${id}`);
};

// Get gym session types
export const getGymSessionTypes = () => {
  return api.get("/gym/types");
};

// Register for gym session
export const registerForGymSession = (sessionId, registrationData) => {
  return api.post(`/gym/sessions/${sessionId}/register`, registrationData);
};

// Get user's gym registrations
export const getUserGymRegistrations = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/gym/registrations${queryString ? `?${queryString}` : ""}`);
};

// Cancel gym registration
export const cancelGymRegistration = (registrationId, reason) => {
  return api.delete(`/gym/registrations/${registrationId}`, {
    data: { reason }
  });
};

// Get gym schedule overview
export const getGymScheduleOverview = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/gym/schedule/overview${queryString ? `?${queryString}` : ""}`);
};

// ============================================
// Conference API ENDPOINTS
// ============================================

export const conferenceAPI = {
    // Create new conference
    createConference: (conferenceData) => api.post('/conferences', conferenceData),
    
    // Update conference
    updateConference: (id, conferenceData) => api.put(`/conferences/${id}`, conferenceData),
    
    // Delete conference
    deleteConference: (id) => api.delete(`/conferences/${id}`),

    getConference: (id) => api.get(`/conferences/${id}`),
};