import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

// Pages (combined from both branches)
import UserTypeSelection from "./components/UserTypeSelection";
import Login from "./pages/Login";
import VendorLogin from "./pages/VendorLogin";
import UserSignup from "./pages/UserSignup";
import VerificationEmailSelection from "./pages/VerificationEmailSelection";
import VerificationSuccess from "./pages/VerificationSuccess";
import VerificationPending from "./pages/VerificationPending";
import EmailVerified from "./pages/EmailVerified";
import VendorSignup from "./pages/VendorSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventsPage from "./pages/EventsPage";
import CourtsPage from "./pages/CourtsPage";
import MyRegistrations from "./pages/MyRegistrations";
import GymSchedulePage from "./pages/GymSchedulePage";
import CreateWorkshop from "./pages/CreateWorkshop";
import Workshops from "./pages/Workshops";
import AdminUserManagement from "./pages/AdminUserManagement";
import ReportsPage from "./pages/ReportsPage";
// ---------------------------
// Protected Route Components
// ---------------------------

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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
  const { user, isLoading } = useAuth();

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

  if (!user || (user.role !== "admin" && user.role !== "events_office")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const VendorRoute = ({ children }) => {
  const { isVendor, isLoading } = useAuth();

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

  if (!isVendor) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ---------------------------
// Router Configuration (merged)
// ---------------------------

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
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
    element: <UserTypeSelection />,
  },
  {
    path: "/vendor-login",
    element: (
      <PublicRoute>
        <VendorLogin />
      </PublicRoute>
    ),
  },
  {
    path: "/signup/user",
    element: (
      <PublicRoute>
        <UserSignup />
      </PublicRoute>
    ),
  },
  {
    path: "/signup/vendor",
    element: (
      <PublicRoute>
        <VendorSignup />
      </PublicRoute>
    ),
  },
  {
    path: "/verification-email-selection",
    element: (
      <PublicRoute>
        <VerificationEmailSelection />
      </PublicRoute>
    ),
  },
  {
    path: "/verification-success",
    element: (
      <PublicRoute>
        <VerificationSuccess />
      </PublicRoute>
    ),
  },
  {
    path: "/verification-pending",
    element: (
      <PublicRoute>
        <VerificationPending />
      </PublicRoute>
    ),
  },
  {
    path: "/email-verified",
    element: <EmailVerified />,
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },

  // Protected Routes
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
        <VendorRoute>
          <VendorDashboard />
        </VendorRoute>
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
    path: "/admin-users",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminUserManagement />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <ReportsPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },

  // New pages from main branch
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <EventsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courts",
    element: (
      <ProtectedRoute>
        <CourtsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-registrations",
    element: (
      <ProtectedRoute>
        <MyRegistrations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gym-schedule",
    element: (
      <ProtectedRoute>
        <GymSchedulePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-workshop",
    element: (
      <ProtectedRoute>
        <CreateWorkshop />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workshops",
    element: <Navigate to="/events" replace />,
  },

  // 404 Fallback
  {
    path: "*",
    element: (
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
    ),
  },
]);

// ---------------------------
// Main App
// ---------------------------

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
          position="bottom-right"
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
