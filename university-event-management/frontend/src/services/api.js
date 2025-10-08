import axios from "axios";

// ============================================
// AXIOS INSTANCE SETUP
// ============================================
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR (Attach JWT)
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR (Handle common errors)
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasVendor = localStorage.getItem("userType") === "vendor";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("vendor");
      localStorage.removeItem("userType");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/vendor-login"
      ) {
        window.location.href = wasVendor ? "/vendor-login" : "/login";
      }
    }

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
// BAZAAR & APPLICATION SERVICES (from HEAD)
// ============================================

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

// ============================================
// EVENT API ENDPOINTS (from main)
// ============================================
export const eventAPI = {
  getEvents: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/events${queryParams ? `?${queryParams}` : ""}`);
  },

  getEvent: (id) => api.get(`/events/${id}`),
  getEventsByType: (type) => api.get(`/events/type/${type}`),
  createEvent: (eventData) => api.post("/events", eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// ============================================
// REGISTRATION API ENDPOINTS
// ============================================
export const registrationAPI = {
  registerForEvent: (registrationData) =>
    api.post("/registrations", registrationData),

  getMyRegistrations: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/registrations/my${queryParams ? `?${queryParams}` : ""}`);
  },

  getEventRegistrations: (eventId) =>
    api.get(`/registrations/event/${eventId}`),

  cancelRegistration: (registrationId) =>
    api.delete(`/registrations/${registrationId}`),

  updateRegistrationStatus: (registrationId, status) =>
    api.put(`/registrations/${registrationId}/status`, { status }),

  checkInParticipant: (registrationId) =>
    api.post(`/registrations/${registrationId}/checkin`),
};

// ============================================
// COURT API ENDPOINTS
// ============================================
export const courtAPI = {
  getCourts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/courts${queryParams ? `?${queryParams}` : ""}`);
  },

  getCourt: (id) => api.get(`/courts/${id}`),
  getCourtsByType: (type) => api.get(`/courts/type/${type}`),
  getCourtAvailability: (courtId, date) =>
    api.get(`/courts/${courtId}/availability/${date}`),

  getWeeklyAvailability: (courtId, startDate = null) => {
    const params = startDate ? `?startDate=${startDate}` : "";
    return api.get(`/courts/${courtId}/weekly-availability${params}`);
  },

  getCourtStats: () => api.get("/courts/stats"),
  createCourt: (courtData) => api.post("/courts", courtData),
  updateCourt: (id, courtData) => api.put(`/courts/${id}`, courtData),
  deleteCourt: (id) => api.delete(`/courts/${id}`),
};

// ============================================
// GYM API ENDPOINTS
// ============================================
export const gymAPI = {
  getSessions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/gym/sessions${queryString ? `?${queryString}` : ""}`);
  },

  getSessionsByMonth: (year, month, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(
      `/gym/sessions/month/${year}/${month}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  getSessionsByDate: (date) => api.get(`/gym/sessions/date/${date}`),
  getSession: (id) => api.get(`/gym/sessions/${id}`),
  getSessionTypes: () => api.get("/gym/types"),

  register: (sessionId, data) =>
    api.post(`/gym/sessions/${sessionId}/register`, data),

  getMyRegistrations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/gym/registrations${queryString ? `?${queryString}` : ""}`);
  },

  cancelRegistration: (registrationId, reason) =>
    api.delete(`/gym/registrations/${registrationId}`, { data: { reason } }),

  getScheduleOverview: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(
      `/gym/schedule/overview${queryString ? `?${queryString}` : ""}`
    );
  },
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