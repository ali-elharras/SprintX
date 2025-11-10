import axios from "axios";

// ============================================
// CREATE CANCELLATION TOKEN MANAGER
// ============================================
export const createCancelTokenSource = () => axios.CancelToken.source();

// ============================================
// RETRY LOGIC UTILITY
// ============================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryRequest = async (
  requestFn,
  maxRetries = 3,
  baseDelay = 1000
) => {
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

      console.log(
        `Retrying request (attempt ${
          attempt + 1
        }/${maxRetries}) after ${delay}ms...`
      );
    }
  }
};

// ============================================
// AXIOS INSTANCE SETUP
// ============================================
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  timeout: 30000, // Increased from 10s to 30s for better stability
  headers: {
    "Content-Type": "application/json",
  },
  // Additional connection settings for stability
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
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
    // Don't handle errors for cancelled requests
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    // Treat 401 Unauthorized and 403 Inactive/Forbidden similarly for forced logout cases
    if (error.response?.status === 401 || error.response?.status === 403) {
      // If 403 but the message isn't about inactive account, we may decide to not force logout.
      const message = error.response?.data?.message || "";
      const shouldForceLogout =
        error.response?.status === 401 ||
        /inactive|blocked|access denied/i.test(message);

      if (shouldForceLogout) {
      const wasVendor = localStorage.getItem("userType") === "vendor";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("vendor");
      localStorage.removeItem("userType");

      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/vendor-login"
      ) {
        window.location.href = wasVendor ? "/vendor-login" : "/";
      }
      }
    }

    // Handle server errors with user-friendly messages
    let errorMessage;
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      errorMessage = "Connection timeout. Please check your internet connection.";
    } else if (error.response?.status >= 500) {
      errorMessage = "Server error. Please try again in a moment.";
    } else if (error.response?.status === 429) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
    } else if (error.response?.status === 0 || !error.response) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else {
      errorMessage = error.response?.data?.message || error.message || "An error occurred";
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
      isCancelled: axios.isCancel(error),
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
          ...(cancelToken && { cancelToken: cancelToken.token }),
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
      const response = await api.post(`/applications/bazaar/${bazaarId}`, applicationData);
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

  getApprovedVendorsForBazaar: async (bazaarId) => {
    try {
      const response = await api.get(`/applications/bazaar/${bazaarId}/approved-vendors`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBoothConflicts: async (conflictData) => {
    try {
      const response = await api.post("/applications/booth-conflicts", conflictData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelApplication: async (applicationType, applicationId) => {
    try {
      const response = await api.delete(`/applications/${applicationType}/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// BAZAAR SERVICES
// ============================================
export const bazaarServices = {
  getBazaarApplication: async (bazaarId) => {
    try {
      const response = await api.get(`/applications/bazaar/${bazaarId}`);
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
        ...(cancelToken && { cancelToken: cancelToken.token }),
      });
    });
  },

  getEvent: (id, cancelToken = null) =>
    retryRequest(async () =>
      api.get(`/events/${id}`, {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      })
    ),

  getEventsByType: (type, cancelToken = null) =>
    retryRequest(async () =>
      api.get(`/events/type/${type}`, {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      })
    ),

  createEvent: (eventData) => api.post("/events", eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  updateEventStatus: (id, status, message = null) =>
    api.put(`/events/${id}/status`, message ? { status, message } : { status }),
  deleteEvent: (id) => api.delete(`/events/${id}`),

  toggleArchiveStatus: (id, isArchived) => api.patch(`/events/${id}/archive`, { isArchived }),
};

// ============================================
// WORKSHOP API ENDPOINTS
// ============================================
export const workshopAPI = {
  getAllWorkshops: (params = {}, cancelToken = null) => {
    const queryParams = new URLSearchParams(params).toString();
    return retryRequest(async () =>
      api.get(`/workshops${queryParams ? `?${queryParams}` : ""}`, {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      })
    );
  },
  createWorkshop: (workshopData) => api.post("/workshops", workshopData),
  updateWorkshop: (id, workshopData) => api.patch(`/workshops/${id}`, workshopData),
  deleteWorkshop: (id) => api.delete(`/workshops/${id}`),
  deleteWorkshopByEventId: (eventId) => api.delete(`/workshops/by-event/${eventId}`),
  publishWorkshop: (id) => api.post(`/workshops/${id}/publish`),
  rejectWorkshop: (id, reason = null) => 
    api.post(`/workshops/${id}/reject`, reason ? { reason } : {}),
  requestEditWorkshop: (id, message) => 
    api.post(`/workshops/${id}/request-edit`, { message }),
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
      return api.get(
        `/registrations/my${queryParams ? `?${queryParams}` : ""}`,
        {
          ...(cancelToken && { cancelToken: cancelToken.token }),
        }
      );
    });
  },

  getEventRegistrations: (eventId, cancelToken = null) =>
    retryRequest(async () =>
      api.get(`/registrations/event/${eventId}`, {
        ...(cancelToken && { cancelToken: cancelToken.token }),
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
  getCourts: (params = {}, cancelToken = null) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/courts${queryParams ? `?${queryParams}` : ""}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    });
  },

  getCourt: (id, cancelToken = null) => 
    api.get(`/courts/${id}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  getCourtsByType: (type, cancelToken = null) => 
    api.get(`/courts/type/${type}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  getCourtAvailability: (courtId, date, cancelToken = null) =>
    api.get(`/courts/${courtId}/availability/${date}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),

  getWeeklyAvailability: (courtId, startDate = null, cancelToken = null) => {
    const params = startDate ? `?startDate=${startDate}` : "";
    return api.get(`/courts/${courtId}/weekly-availability${params}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    });
  },

  getCourtStats: (cancelToken = null) => 
    api.get("/courts/stats", {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  createCourt: (courtData) => api.post("/courts", courtData),
  updateCourt: (id, courtData) => api.put(`/courts/${id}`, courtData),
  deleteCourt: (id) => api.delete(`/courts/${id}`),
  
  // Court Reservations
  reserveCourt: (courtId, reservationData) => 
    api.post(`/courts/${courtId}/reserve`, reservationData),
    
  getMyReservations: (cancelToken = null) => 
    api.get("/courts/my-reservations", {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  cancelReservation: (reservationId, reason) =>
    api.delete(`/courts/my-reservations/${reservationId}`, { data: { reason } }),
    
  getAvailableSlots: (courtId, date, cancelToken = null) =>
    api.get(`/courts/${courtId}/available-slots/${date}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
};

// ============================================
// GYM API ENDPOINTS
// ============================================
export const gymAPI = {
  getSessions: (params = {}, cancelToken = null) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/gym/sessions${queryString ? `?${queryString}` : ""}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    });
  },

  getSessionsByMonth: (year, month, params = {}, cancelToken = null) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(
      `/gym/sessions/month/${year}/${month}${
        queryString ? `?${queryString}` : ""
      }`,
      {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      }
    );
  },

  getSessionsByDate: (date, cancelToken = null) => 
    api.get(`/gym/sessions/date/${date}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  getSession: (id, cancelToken = null) => 
    api.get(`/gym/sessions/${id}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),
    
  getSessionTypes: (cancelToken = null) => 
    api.get("/gym/types", {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),

  register: (sessionId, data) =>
    api.post(`/gym/sessions/${sessionId}/register`, data),

  // Admin / Events Office: create a new gym session
  createSession: (sessionData) => api.post(`/gym/sessions`, sessionData),

  // Admin / Events Office: update existing gym session (only date, time, duration)
  updateSession: (id, sessionData) =>
    api.put(`/gym/sessions/${id}`, sessionData),

  // Admin / Events Office: cancel gym session
  cancelSession: (id, data) =>
    api.delete(`/gym/sessions/${id}`, { data }),

  getMyRegistrations: (params = {}, cancelToken = null) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/gym/registrations${queryString ? `?${queryString}` : ""}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    });
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

// ============================================
// Admin API ENDPOINTS
// ============================================


export const adminAPI = {
  // ✅ Fetch all users
  getAllUsers: async (cancelToken = null) => {
    try {
      const response = await api.get("/admin/users", {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Create Admin or Event Office
  createUser: async (userData) => {
    try {
      const response = await api.post("/admin/create-user", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Delete Admin or Event Office
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/delete-user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Get unverified academics (staff/ta/professor)
  getPendingAcademics: async (cancelToken = null) => {
    try {
      const response = await api.get("/admin/pending-academics", {
        ...(cancelToken && { cancelToken: cancelToken.token }),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Approve an academic: assign role and verify
  approveAcademic: async (id, role) => {
    try {
      const response = await api.patch(`/admin/approve-academic/${id}`, { role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Block user
  blockUser: async (id) => {
    try {
      const response = await api.patch(`/admin/block-user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Unblock user
  unblockUser: async (id) => {
    try {
      const response = await api.patch(`/admin/unblock-user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export const ratingAPI = {
  // Submit or update a rating
  submitRating: (ratingData) => 
    api.post('/ratings', ratingData),

  // Get all ratings for an event
  getEventRatings: (eventId, cancelToken = null) =>
    api.get(`/ratings/event/${eventId}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),

  // Get current user's rating for an event
  getMyRating: (eventId, cancelToken = null) =>
    api.get(`/ratings/my-rating/${eventId}`, {
      ...(cancelToken && { cancelToken: cancelToken.token }),
    }),

  // Delete a rating
  deleteRating: (ratingId) =>
    api.delete(`/ratings/${ratingId}`),
};

// ============================================
// Favorites API
// ============================================
export const favoritesAPI = {
  getMyFavorites: async () => {
    const res = await api.get("/favorites");
    return res.data?.favorites || [];
  },
  addFavorite: async (eventId) => {
    const res = await api.post("/favorites", { eventId });
    return res.data;
  },
  removeFavorite: async (eventId) => {
    const res = await api.delete(`/favorites/${eventId}`);
    return res.data;
  },
};