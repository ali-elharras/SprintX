import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme, { getRoleColor } from "../theme";
import Button from "../components/Button";
import NotificationCenter from "../components/NotificationCenter";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isUser, isVendor, user, vendor } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = () => {
    if (isVendor && vendor && vendor.verificationStatus) {
      const statusColors = {
        pending: theme.colors.status.pending,
        approved: theme.colors.status.approved,
        rejected: theme.colors.status.rejected,
        under_review: theme.colors.status.active,
      };

      const statusColor =
        statusColors[vendor.verificationStatus] || theme.colors.neutral.gray500;

      return (
        <div
          style={{
            ...theme.components.badge.base,
            backgroundColor: statusColor + "20",
            color: statusColor,
            border: `1px solid ${statusColor}`,
            fontSize: theme.typography.fontSize.xs,
            textTransform: "uppercase",
            letterSpacing: theme.typography.letterSpacing.wide,
          }}
        >
          {vendor.verificationStatus.replace("_", " ")}
        </div>
      );
    }
    return null;
  };

  const getAccountDisplayInfo = () => {
    if (isVendor && vendor) {
      return {
        name: vendor.companyName,
        subtitle: `${vendor.industry} • ${vendor.verificationStatus}`,
        role: "vendor",
        avatar: vendor.logo || null,
      };
    } else if (isUser && user) {
      return {
        name: `${user.firstName} ${user.lastName}`,
        subtitle: `${user.role} • ${user.department}`,
        role: user.role,
        avatar: user.profilePicture || null,
      };
    }
    return null;
  };

  const accountInfo = getAccountDisplayInfo();
  const roleColor = accountInfo
    ? getRoleColor(accountInfo.role)
    : theme.colors.primary.main;

  const statusBadge = getStatusBadge();

  const navbarStyles = {
    ...theme.components.navbar,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: theme.typography.fontFamily.primary,
  };

  const logoStyles = {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  };

  const accountSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
  };

  const userInfoStyles = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[3],
  };

  const avatarStyles = {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: roleColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.text.white,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.base,
    flexShrink: 0,
  };

  const userDetailsStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing[1],
    minWidth: "0",
  };

  const nameStyles = {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    textTransform: "capitalize",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };

  if (!accountInfo) {
    return null;
  }

  return (
    <nav style={navbarStyles}>
      {/* Logo */}
      <div style={logoStyles}>
        <img
          src={require("../assets/images/SprintXLogo.png")}
          alt="SprintX"
          style={{ height: "40px", width: "auto" }}
        />
      </div>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: theme.spacing[6] }}>
        {user && user.role === "events_office" ? (
          <>
            <button
              onClick={() => navigate("/admin-dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/admin-dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/admin-dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/admin-dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/admin-dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/events")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/events"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/events"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Events
            </button>
            <button
              onClick={() => navigate("/favorites")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/favorites"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/favorites"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/favorites") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/favorites") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Favorites
            </button>

            <button
              onClick={() => navigate("/gym-schedule")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/gym-schedule"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/gym-schedule"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/gym-schedule") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/gym-schedule") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Gym Schedule
            </button>

            <button
              onClick={() => navigate("/reports")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/reports"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/reports"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/reports") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/reports") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Reports
            </button>
          </>
        ) : user && user.role === "admin" ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/events")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/events"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/events"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Events
            </button>
            <button
              onClick={() => navigate("/admin-dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/admin-dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/admin-dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/admin-dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/admin-dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => navigate("/admin-users")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/admin-users"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/admin-users"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/admin-users") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/admin-users") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Admin Users
            </button>

            <button
              onClick={() => navigate("/reports")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/reports"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/reports"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/reports") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/reports") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Reports
            </button>
          </>
        ) : isVendor ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/vendor-dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/vendor-dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/vendor-dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/vendor-dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/vendor-dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Vendor Dashboard
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/events")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/events"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/events"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/events") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Events
            </button>

            <button
              onClick={() => navigate("/favorites")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/favorites"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/favorites"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/favorites") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/favorites") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Favorites
            </button>

            {user.role == "student" && (
              <button
                onClick={() => navigate("/courts")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color:
                    location.pathname === "/courts"
                      ? theme.colors.primary.main
                      : theme.colors.text.secondary,
                  cursor: "pointer",
                  padding: theme.spacing[2],
                  textDecoration: "none",
                  borderBottom:
                    location.pathname === "/courts"
                      ? `2px solid ${theme.colors.primary.main}`
                      : "2px solid transparent",
                  transition: "all 0.2s ease",
                  fontFamily: theme.typography.fontFamily.primary,
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/courts") {
                    e.target.style.color = theme.colors.primary.main;
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/courts") {
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                Courts
              </button>
            )}

            <button
              onClick={() => navigate("/gym-schedule")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/gym-schedule"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/gym-schedule"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/gym-schedule") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/gym-schedule") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Gym Schedule
            </button>

            {isUser && user.role !== "events_office" && (
              <button
                onClick={() => navigate("/my-registrations")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color:
                    location.pathname === "/my-registrations"
                      ? theme.colors.primary.main
                      : theme.colors.text.secondary,
                  cursor: "pointer",
                  padding: theme.spacing[2],
                  textDecoration: "none",
                  borderBottom:
                    location.pathname === "/my-registrations"
                      ? `2px solid ${theme.colors.primary.main}`
                      : "2px solid transparent",
                  transition: "all 0.2s ease",
                  fontFamily: theme.typography.fontFamily.primary,
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/my-registrations") {
                    e.target.style.color = theme.colors.primary.main;
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/my-registrations") {
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                My Registrations
              </button>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/dashboard"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/dashboard"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/dashboard") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Dashboard
            </button>
          </>
        )}
      </div>

      {/* Account Section */}
      <div style={accountSectionStyles}>
        {/* Notification Center for all stakeholder roles */}
        {(user?.role === "professor" || 
          user?.role === "staff" || 
          user?.role === "events_office" || 
          user?.role === "student" || 
          user?.role === "ta") && (
          <div style={{ marginRight: theme.spacing[4] }}>
            <NotificationCenter />
          </div>
        )}

        <div style={userInfoStyles}>
          {/* Avatar */}
          <div style={avatarStyles}>
            {accountInfo.avatar ? (
              <img
                src={accountInfo.avatar}
                alt={accountInfo.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              getInitials(accountInfo.name)
            )}
          </div>

          {/* User Details */}
          <div style={userDetailsStyles}>
            <div style={nameStyles}>{accountInfo.name}</div>
            <div style={subtitleStyles}>
              {accountInfo.subtitle}
              {statusBadge && (
                <span style={{ marginLeft: theme.spacing[2] }}>
                  {statusBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          style={{
            minWidth: "auto",
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
          }}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
