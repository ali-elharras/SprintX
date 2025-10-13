import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI, authStorage } from "../services/auth";

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  vendor: null,
  userType: null,
  token: null,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOADING: "LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_PROFILE: "UPDATE_PROFILE",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user || null,
        vendor: action.payload.vendor || null,
        userType: action.payload.userType,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      if (state.userType === "user") {
        return {
          ...state,
          user: { ...state.user, ...action.payload },
        };
      } else if (state.userType === "vendor") {
        return {
          ...state,
          vendor: { ...state.vendor, ...action.payload },
        };
      }
      return state;

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const authData = authStorage.getAuth();

        if (authData && authData.token) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              token: authData.token,
              user: authData.user,
              vendor: authData.vendor,
              userType: authData.userType,
            },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Login function for users
  const loginUser = async (loginData) => {
    console.log("=== LOGIN ATTEMPT STARTED ===", loginData);
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(loginData);

      if (response.success) {
        const authData = {
          token: response.data.token,
          user: response.data.user,
          userType: "user",
        };

        // Store in localStorage
        authStorage.setAuth(authData);

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData,
        });

        return { success: true, data: response.data };
      } else {
        // Check if user has pending role (awaiting admin approval)
        if (response.isPending) {
          return {
            success: false,
            isPending: true,
            data: response.data,
            error: response.message,
          };
        }

        // Check if this is an incomplete registration (verification email required)
        if (response.requiresVerificationEmail) {
          return {
            success: false,
            requiresVerificationEmail: true,
            data: response.data,
            error: response.message,
          };
        }

        // Check if verification email has been sent but user hasn't verified
        if (response.emailVerificationSent && response.canReapply) {
          return {
            success: false,
            emailVerificationSent: true,
            canReapply: true,
            data: response.data,
            error: response.message,
          };
        }

        // Regular login failure
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: response.message || "Login failed",
        });
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error) {
      console.log("Login error caught:", error);
      console.log("Error response data:", error.response?.data);
      console.log("Error data direct:", error.data);

      // Get error data from either error.data or error.response.data
      const errorData = error.data || error.response?.data;

      // Check if this is an incomplete registration error
      if (errorData?.requiresVerificationEmail) {
        console.log("Detected incomplete registration");
        return {
          success: false,
          requiresVerificationEmail: true,
          data: errorData.data,
          error: errorData.message,
        };
      }

      // Check if verification email has been sent but user hasn't verified (from error response)
      if (errorData?.emailVerificationSent && errorData?.canReapply) {
        console.log("Detected verification email sent case");
        const returnValue = {
          success: false,
          emailVerificationSent: true,
          canReapply: true,
          data: errorData.data,
          error: errorData.message,
        };
        console.log("=== RETURNING FROM AuthContext ===", returnValue);

        // Make sure we dispatch loading false before returning
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        return returnValue;
      }

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || "Login failed",
      });
      return { success: false, error: error.message || "Login failed" };
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
    }
  };

  // Login function for vendors
  const loginVendor = async (loginData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(loginData);

      if (response.success) {
        const authData = {
          token: response.data.token,
          vendor: response.data.vendor,
          userType: "vendor",
        };

        // Store in localStorage
        authStorage.setAuth(authData);

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData,
        });

        return { success: true, data: response.data };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || "Login failed",
      });
      return { success: false, error: error.message || "Login failed" };
    }
  };

  // Register user function
  const registerUser = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.registerUser(userData);

      if (response.success) {
        // Check if verification email is required
        if (
          response.requiresVerificationEmail ||
          response.data?.requiresVerificationEmail
        ) {
          return {
            success: true,
            requiresVerificationEmail: true,
            data: response.data,
          };
        }

        const authData = {
          token: response.data.token,
          user: response.data.user,
          userType: "user",
        };

        // Store in localStorage
        authStorage.setAuth(authData);

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData,
        });

        return { success: true, data: response.data };
      }
    } catch (error) {
      // Check if this is a verification email required error
      if (error.response?.data?.requiresVerificationEmail) {
        return {
          success: false,
          requiresVerificationEmail: true,
          data: error.response.data.data,
          error: error.response.data.message,
        };
      }

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || "Registration failed",
      });
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
    }
  };

  // Reapply for verification function
  const reapplyVerification = async (userId) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.reapplyVerification(userId);

      if (response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: response.message || "Failed to reapply for verification",
        });
        return {
          success: false,
          error: response.message || "Failed to reapply for verification",
        };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to reapply for verification",
      });
      return {
        success: false,
        error: error.message || "Failed to reapply for verification",
      };
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
    }
  };

  // Register vendor function
  const registerVendor = async (vendorData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.registerVendor(vendorData);

      if (response.success) {
        const authData = {
          token: response.data.token,
          vendor: response.data.vendor,
          userType: "vendor",
        };

        // Store in localStorage
        authStorage.setAuth(authData);

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData,
        });

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("🚨 [AuthContext] Vendor registration error:", error);
      const errorMessage = error.message || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
        data: error.data, // Include validation errors if available
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call API logout (optional, since we're using JWT)
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local storage and state regardless of API call result
      authStorage.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Get current account data
  const getCurrentAccount = () => {
    if (state.userType === "user") {
      return state.user;
    } else if (state.userType === "vendor") {
      return state.vendor;
    }
    return null;
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update profile function
  const updateProfile = (profileData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: profileData,
    });

    // Update localStorage
    const currentAccount = getCurrentAccount();
    if (currentAccount) {
      const updatedAccount = { ...currentAccount, ...profileData };
      if (state.userType === "user") {
        localStorage.setItem("user", JSON.stringify(updatedAccount));
      } else if (state.userType === "vendor") {
        localStorage.setItem("vendor", JSON.stringify(updatedAccount));
      }
    }
  };

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    loginUser,
    loginVendor,
    registerUser,
    reapplyVerification,
    registerVendor,
    logout,
    clearError,
    updateProfile,

    // Helpers
    getCurrentAccount,
    isUser: state.userType === "user",
    isVendor: state.userType === "vendor",
    isAdmin: state.user?.role === "admin",
    isEventsOffice: state.user?.role === "events_office",
    isStudent: state.user?.role === "student",
    isStaff: state.user?.role === "staff",
    isTA: state.user?.role === "ta",
    isProfessor: state.user?.role === "professor",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
