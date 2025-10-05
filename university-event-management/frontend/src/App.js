import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
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
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

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

const AdminRoute = ({ children }) => {
  const { isAdmin, isEventsOffice, isVendor } = useAuth();

  if (!isAdmin && !isEventsOffice && !isVendor) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const router = createBrowserRouter([
    {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <UserSignup />
      </PublicRoute>
    ),
  },
  {
    path: "/vendor-signup",
    element: (
      <PublicRoute>
        <VendorSignup />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendor-dashboard",
    element: (
      <ProtectedRoute>
        <VendorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <div
        style={{
          fontFamily: theme.typography.fontFamily.primary,
          minHeight: "100vh",
        }}
      >
        <RouterProvider router={router} />

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
  );
};


export default App;
