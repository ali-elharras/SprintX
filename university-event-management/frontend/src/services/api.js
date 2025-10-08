import axios from "axios";

// ============================================
// CREATE CANCELLATION TOKEN MANAGER
// ============================================
export const createCancelTokenSource = () => axios.CancelToken.source();

// ============================================
// RETRY LOGIC UTILITY
// ============================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      // Don't retry if request was cancelled
      if (axios.isCancel(error)) {
        throw error;
      }

      // Don't retry on authentication errors or client errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
      
      console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
    }
  }
};

// ============================================
// AXIOS INSTANCE SETUP
// ============================================
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  timeout: 30000, // Increased timeout to 30 seconds
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
    // Don't process cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection and try again.",
        status: 0,
        isNetworkError: true,
      });
    }

    // Handle 401 authentication errors
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

    // Handle server errors with user-friendly messages
    let errorMessage;
    if (error.response?.status >= 500) {
      errorMessage = "Server error. Please try again in a moment.";
    } else if (error.response?.status === 429) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
    } else {
      errorMessage = error.response?.data?.message || error.message || "An error occurred";
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      isServerError: error.response?.status >= 500,
      isRateLimit: error.response?.status === 429,
    });
  }
);

export default api;

// ============================================
// BAZAAR & APPLICATION SERVICES (from HEAD)
// ============================================

export const eventServices = {
  getUpcomingBazaars: async (cancelToken = null) => {
    try {
      return await retryRequest(async () => {
        const response = await api.get("/events/bazaars/upcoming", {
          ...(cancelToken && { cancelToken: cancelToken.token })
        });
        return response.data;
      });
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
  getEvents: (params = {}, cancelToken = null) => {
    const queryParams = new URLSearchParams(params).toString();
    return retryRequest(async () => {
      return api.get(`/events${queryParams ? `?${queryParams}` : ""}`, {
        ...(cancelToken && { cancelToken: cancelToken.token })
      });
    });
  },

  getEvent: (id, cancelToken = null) => 
    retryRequest(async () => 
      api.get(`/events/${id}`, { 
        ...(cancelToken && { cancelToken: cancelToken.token })
      })
    ),

  getEventsByType: (type, cancelToken = null) => 
    retryRequest(async () => 
      api.get(`/events/type/${type}`, { 
        ...(cancelToken && { cancelToken: cancelToken.token })
      })
    ),

  createEvent: (eventData) => api.post("/events", eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  updateEventStatus: (id, status, message = null) => api.put(`/events/${id}/status`, message ? { status, message } : { status }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// ============================================
// REGISTRATION API ENDPOINTS
// ============================================
export const registrationAPI = {
  registerForEvent: (registrationData) =>
    api.post("/registrations", registrationData),

  getMyRegistrations: (params = {}, cancelToken = null) => {
    const queryParams = new URLSearchParams(params).toString();
    return retryRequest(async () => {
      return api.get(`/registrations/my${queryParams ? `?${queryParams}` : ""}`, {
        ...(cancelToken && { cancelToken: cancelToken.token })
      });
    });
  },

  getEventRegistrations: (eventId, cancelToken = null) =>
    retryRequest(async () =>
      api.get(`/registrations/event/${eventId}`, { 
        ...(cancelToken && { cancelToken: cancelToken.token })
      })
    ),

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
