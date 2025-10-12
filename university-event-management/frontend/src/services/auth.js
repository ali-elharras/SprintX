import api from "./api";

// Authentication API calls
export const authAPI = {
  // User registration (Student/Staff/TA/Professor)
  registerUser: async (userData) => {
    const response = await api.post("/auth/register/user", userData);
    return response.data;
  },

  // Vendor registration
  registerVendor: async (vendorData) => {
    const response = await api.post("/auth/register/vendor", vendorData);
    return response.data;
  },

  // Login for both users and vendors
  login: async (loginData) => {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  },

  // Complete user registration with verification email
  completeUserRegistration: async (completionData) => {
    const response = await api.post(
      "/auth/complete-registration",
      completionData
    );
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user/vendor profile
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password: newPassword,
    });
    return response.data;
  },
};

// Helper functions for local storage management
export const authStorage = {
  // Store authentication data
  setAuth: (data) => {
    const { token, user, vendor } = data;
    localStorage.setItem("token", token);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userType", "user");
    } else if (vendor) {
      localStorage.setItem("vendor", JSON.stringify(vendor));
      localStorage.setItem("userType", "vendor");
    }
  },

  // Get stored authentication data
  getAuth: () => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const user = localStorage.getItem("user");
    const vendor = localStorage.getItem("vendor");

    if (!token) return null;

    return {
      token,
      userType,
      user: user ? JSON.parse(user) : null,
      vendor: vendor ? JSON.parse(vendor) : null,
    };
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");
    localStorage.removeItem("userType");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get user type
  getUserType: () => {
    return localStorage.getItem("userType");
  },

  // Get current user/vendor data
  getCurrentAccount: () => {
    const userType = localStorage.getItem("userType");

    if (userType === "user") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } else if (userType === "vendor") {
      const vendor = localStorage.getItem("vendor");
      return vendor ? JSON.parse(vendor) : null;
    }

    return null;
  },
};
