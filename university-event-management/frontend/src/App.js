import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

// Pages
import Login from "./pages/Login";
import UserSignup from "./pages/UserSignup";
import VendorSignup from "./pages/VendorSignup";
import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/EventsPage";
import MyRegistrations from "./pages/MyRegistrations";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.typography.fontFamily.primary,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}
      >
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.typography.fontFamily.primary,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}
      >
        Loading...
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/user"
        element={
          <PublicRoute>
            <UserSignup />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/vendor"
        element={
          <PublicRoute>
            <VendorSignup />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute>
            <MyRegistrations />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="/signup" element={<Navigate to="/signup/user" replace />} />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.typography.fontFamily.primary,
              textAlign: "center",
              padding: theme.spacing[4],
            }}
          >
            <h1
              style={{
                fontSize: theme.typography.fontSize["4xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              404 - Page Not Found
            </h1>
            <p
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[6],
              }}
            >
              The page you're looking for doesn't exist.
            </p>
            <a
              href="/events"
              style={{
                ...theme.components.button.primary,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Browse Events
            </a>
          </div>
        }
      />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div
          style={{
            fontFamily: theme.typography.fontFamily.primary,
            minHeight: "100vh",
          }}
        >
          <AppRoutes />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme.colors.background.paper,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.primary,
                boxShadow: theme.shadows.lg,
              },
              success: {
                iconTheme: {
                  primary: theme.colors.success.main,
                  secondary: theme.colors.success.light,
                },
              },
              error: {
                iconTheme: {
                  primary: theme.colors.error.main,
                  secondary: theme.colors.error.light,
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
