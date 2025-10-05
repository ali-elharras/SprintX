import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme, { getRoleColor } from "../theme";
import Button from "../components/Button";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    logout,
    getCurrentAccount,
    userType,
    isUser,
    isVendor,
    user,
    vendor,
  } = useAuth();

  const currentAccount = getCurrentAccount();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
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
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: roleColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.text.white,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  };

  const userDetailsStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  };

  const nameStyles = {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    textTransform: "capitalize",
  };

  if (!accountInfo) {
    return null;
  }

  return (
    <nav style={navbarStyles}>
      {/* Logo */}
      <div style={logoStyles}>🎓 Campus Events Hub</div>

      {/* Account Section */}
      <div style={accountSectionStyles}>
        <div style={userInfoStyles}>
          {/* Avatar */}
          <div style={avatarStyles}>
            {accountInfo.avatar ? (
              <img
                src={accountInfo.avatar}
                alt={accountInfo.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
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