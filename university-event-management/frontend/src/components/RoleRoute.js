import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import theme from "../theme";

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading, isVendor } = useAuth();

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

  if (!user) return <Navigate to="/login" replace />;

  // Don't allow vendors to access consumer loyalty page
  if (isVendor) return <Navigate to="/dashboard" replace />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return children;
};

export default RoleRoute;
