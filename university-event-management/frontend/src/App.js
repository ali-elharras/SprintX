import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";
import Navbar from "./components/Navbar";
import AdminSidebar from "./components/AdminSidebar";

// Pages
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import Login from "./pages/Login";
import VendorLogin from "./pages/VendorLogin";
import AccountBanned from "./pages/AccountBanned";
import VerificationEmailSelection from "./pages/VerificationEmailSelection";
import VerificationSuccess from "./pages/VerificationSuccess";
import VerificationPending from "./pages/VerificationPending";
import EmailVerified from "./pages/EmailVerified";
import EmailVerificationSent from "./pages/EmailVerificationSent";
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
import PaymentSuccess from "./pages/PaymentSuccess";
import EventsRatings from "./pages/EventsRatings";
import AdminComments from "./pages/AdminComments";
import FavoritesPage from "./pages/FavoritesPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import BoothPolls from "./pages/BoothPolls";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import WalletPage from "./pages/WalletPage";
import UploadedFilesPage from "./pages/UploadedFilesPage";
import RewardsPage from "./pages/RewardsPage";
import RoleRoute from "./components/RoleRoute";
import DailyRewardNotification from "./components/DailyRewardNotification";

// --- Layout Components ---

const AppLayout = () => {
  const { user, dailyReward, clearDailyReward } = useAuth();
  const isAdmin = user && user.role === "admin";
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.default,
        minHeight: "100vh",
      }}
    >
      {isAdmin && <AdminSidebar isOpen={isSidebarOpen} />}
      <div
        style={{
          marginLeft: isAdmin && isSidebarOpen ? "260px" : "0",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <Navbar onMenuClick={isAdmin ? handleToggleSidebar : undefined} />
        <main style={{ padding: `0 ${theme.spacing[8]} ${theme.spacing[8]}` }}>
          <Outlet />
        </main>
      </div>
      {dailyReward && (
        <DailyRewardNotification
          dailyReward={dailyReward}
          onClose={clearDailyReward}
        />
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user || (user.role !== "admin" && user.role !== "events_office")) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const VendorRoute = ({ children }) => {
  const { isVendor, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isVendor) return <Navigate to="/login" replace />;
  return children;
};

// --- Router Configuration ---

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: (
      <PublicRoute>
        <LandingPage />
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
  { path: "/account-banned", element: <AccountBanned /> },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
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
    path: "/email-verification-sent",
    element: (
      <PublicRoute>
        <EmailVerificationSent />
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
  { path: "/email-verified", element: <EmailVerified /> },
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

  // Protected Routes with Layout
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: (() => {
          const DashboardWrapper = () => {
            const { isVendor } = useAuth();
            if (isVendor) return <Navigate to="/vendor-dashboard" replace />;
            return <Dashboard />;
          };
          return <DashboardWrapper />;
        })(),
      },
      { path: "/events", element: <EventsPage /> },
      { path: "/events/:id", element: <EventDetailsPage /> },
      { path: "/my-registrations", element: <MyRegistrations /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/courts", element: <CourtsPage /> },
      { path: "/gym-schedule", element: <GymSchedulePage /> },
      { path: "/booth-polls", element: <BoothPolls /> },
      { path: "/wallet", element: <WalletPage /> },
      { path: "/rewards", element: <RewardsPage /> },
      {
        path: "/loyalty-program",
        element: (
          <RoleRoute
            allowedRoles={[
              "student",
              "staff",
              "ta",
              "professor",
              "events_office",
              "admin",
            ]}
          >
            <LoyaltyProgram />
          </RoleRoute>
        ),
      },
      {
        path: "/create-workshop",
        element: (
          <RoleRoute allowedRoles={["professor"]}>
            <CreateWorkshop />
          </RoleRoute>
        ),
      },
      {
        path: "/my-workshops",
        element: (
          <RoleRoute allowedRoles={["professor"]}>
            <Workshops />
          </RoleRoute>
        ),
      },
      { path: "/workshops", element: <Navigate to="/events" replace /> },
      {
        path: "/events-ratings",
        element: (
          <AdminRoute>
            <EventsRatings />
          </AdminRoute>
        ),
      },
      {
        path: "/admin-dashboard",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "/admin-users",
        element: (
          <AdminRoute>
            <AdminUserManagement />
          </AdminRoute>
        ),
      },
      {
        path: "/admin-comments",
        element: (
          <AdminRoute>
            <AdminComments />
          </AdminRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        ),
      },
      {
        path: "/uploaded-files",
        element: (
          <AdminRoute>
            <UploadedFilesPage />
          </AdminRoute>
        ),
      },
      {
        path: "/vendor-dashboard",
        element: (
          <VendorRoute>
            <VendorDashboard />
          </VendorRoute>
        ),
      },
      {
        path: "/vendor/payment-success",
        element: (
          <VendorRoute>
            <PaymentSuccess />
          </VendorRoute>
        ),
      },
      {
        path: "/vendor/my-participations",
        element: (
          <VendorRoute>
            <VendorDashboard />
          </VendorRoute>
        ),
      },
    ],
  },

  // 404 Fallback
  {
    path: "*",
    element: <div>404 - Page Not Found</div>,
  },
]);

// --- Main App Component ---

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: theme.colors.background.paper,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.light}`,
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
