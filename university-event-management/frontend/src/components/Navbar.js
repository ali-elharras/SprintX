import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import theme, { getRoleColor } from "../theme";
import Button from "../components/Button";
import NotificationCenter from "../components/NotificationCenter";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isUser, isVendor, user, vendor } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown]) {
        if (!dropdownRefs.current[activeDropdown].contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

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
        avatar: vendor.logoUrl || null,
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

  // Student Navigation Groups
  const studentNavGroups = {
    events: {
      label: "Events & Activities",
      items: [
        { label: "Browse Events", path: "/events" },
        { label: "Saved Events", path: "/favorites" },
        { label: "Booth Polls", path: "/booth-polls" },
        { label: "Loyalty Programs", path: "/loyalty-program" },
      ],
    },
    sports: {
      label: "Sports & Fitness",
      items: [
        { label: "Book Courts", path: "/courts", badge: "Student Only" },
        { label: "Gym Schedule", path: "/gym-schedule" },
      ],
    },
    account: {
      label: "My Account",
      items: [
        { label: "My Registrations", path: "/my-registrations" },
        { label: "Wallet", path: "/wallet" },
      ],
    },
  };

  // Staff/TA/Professor Navigation Groups
  const staffNavGroups = {
    events: {
      label: "Events & Activities",
      items: [
        { label: "Browse Events", path: "/events" },
        { label: "Saved Events", path: "/favorites" },
        { label: "Booth Polls", path: "/booth-polls" },
        { label: "Loyalty Programs", path: "/loyalty-program" },
      ],
    },
    activities: {
      label: "Campus Activities",
      items: [
        { label: "Gym Schedule", path: "/gym-schedule" },
      ],
    },
    account: {
      label: "My Account",
      items: [
        { label: "My Registrations", path: "/my-registrations" },
        { label: "Wallet", path: "/wallet" },
      ],
    },
  };

  // Professor-specific Navigation Groups
  const professorNavGroups = {
    events: {
      label: "Events & Activities",
      items: [
        { label: "Browse Events", path: "/events" },
        { label: "My Workshops", path: "/my-workshops" },
        { label: "Saved Events", path: "/favorites" },
        { label: "Booth Polls", path: "/booth-polls" },
        { label: "Loyalty Programs", path: "/loyalty-program" },
      ],
    },
    activities: {
      label: "Campus Activities",
      items: [
        { label: "Gym Schedule", path: "/gym-schedule" },
      ],
    },
    account: {
      label: "My Account",
      items: [
        { label: "My Registrations", path: "/my-registrations" },
        { label: "Wallet", path: "/wallet" },
      ],
    },
  };

  // Events Office Navigation Groups
  const eventsOfficeNavGroups = {
    management: {
      label: "Management",
      items: [
        { label: "Admin Dashboard", path: "/admin-dashboard" },
        { label: "Reports", path: "/reports" },
        { label: "Event Ratings", path: "/events-ratings" },
      ],
    },
    events: {
      label: "Events & Activities",
      items: [
        { label: "Browse Events", path: "/events" },
        { label: "Saved Events", path: "/favorites" },
        { label: "Booth Polls", path: "/booth-polls" },
        { label: "Loyalty Programs", path: "/loyalty-program" },
      ],
    },
    activities: {
      label: "Campus Activities",
      items: [
        { label: "Gym Schedule", path: "/gym-schedule" },
      ],
    },
    account: {
      label: "My Account",
      items: [
        { label: "Wallet", path: "/wallet" },
      ],
    },
  };

  const isPathInGroup = (groupItems) => {
    return groupItems.some(item => location.pathname === item.path);
  };

  const renderStudentNav = () => {
    return (
      <div style={navLinkContainerStyles}>
        {/* Dashboard - Always visible */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            ...navLinkStyles,
            color: location.pathname === "/dashboard"
              ? theme.colors.primary.main
              : theme.colors.text.secondary,
            borderBottom: location.pathname === "/dashboard"
              ? `2px solid ${theme.colors.primary.main}`
              : "2px solid transparent",
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

        {/* Events & Activities Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["events"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("events")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(studentNavGroups.events.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(studentNavGroups.events.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {studentNavGroups.events.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "events" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "events" && (
            <div style={dropdownMenuStyles}>
              {studentNavGroups.events.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sports & Fitness Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["sports"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("sports")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(studentNavGroups.sports.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(studentNavGroups.sports.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {studentNavGroups.sports.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "sports" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "sports" && (
            <div style={dropdownMenuStyles}>
              {studentNavGroups.sports.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <span style={exclusiveBadgeStyles}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Account Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["account"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("account")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(studentNavGroups.account.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(studentNavGroups.account.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {studentNavGroups.account.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "account" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "account" && (
            <div style={dropdownMenuStyles}>
              {studentNavGroups.account.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStaffNav = () => {
    // Use professor-specific navigation if user is a professor
    const navGroups = user?.role === "professor" ? professorNavGroups : staffNavGroups;
    
    return (
      <div style={navLinkContainerStyles}>
        {/* Dashboard - Always visible */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            ...navLinkStyles,
            color: location.pathname === "/dashboard"
              ? theme.colors.primary.main
              : theme.colors.text.secondary,
            borderBottom: location.pathname === "/dashboard"
              ? `2px solid ${theme.colors.primary.main}`
              : "2px solid transparent",
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

        {/* Events & Activities Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["events"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("events")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(navGroups.events.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(navGroups.events.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {navGroups.events.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "events" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "events" && (
            <div style={dropdownMenuStyles}>
              {navGroups.events.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campus Activities Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["activities"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("activities")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(navGroups.activities.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(navGroups.activities.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {navGroups.activities.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "activities" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "activities" && (
            <div style={dropdownMenuStyles}>
              {navGroups.activities.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Account Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["account"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("account")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(navGroups.account.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(navGroups.account.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {navGroups.account.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "account" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "account" && (
            <div style={dropdownMenuStyles}>
              {navGroups.account.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEventsOfficeNav = () => {
    return (
      <div style={navLinkContainerStyles}>
        {/* Dashboard - Always visible */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            ...navLinkStyles,
            color: location.pathname === "/dashboard"
              ? theme.colors.primary.main
              : theme.colors.text.secondary,
            borderBottom: location.pathname === "/dashboard"
              ? `2px solid ${theme.colors.primary.main}`
              : "2px solid transparent",
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

        {/* Management Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["management"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("management")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(eventsOfficeNavGroups.management.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(eventsOfficeNavGroups.management.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {eventsOfficeNavGroups.management.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "management" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "management" && (
            <div style={dropdownMenuStyles}>
              {eventsOfficeNavGroups.management.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events & Activities Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["events"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("events")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(eventsOfficeNavGroups.events.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(eventsOfficeNavGroups.events.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {eventsOfficeNavGroups.events.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "events" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "events" && (
            <div style={dropdownMenuStyles}>
              {eventsOfficeNavGroups.events.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campus Activities Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["activities"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("activities")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(eventsOfficeNavGroups.activities.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(eventsOfficeNavGroups.activities.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {eventsOfficeNavGroups.activities.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "activities" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "activities" && (
            <div style={dropdownMenuStyles}>
              {eventsOfficeNavGroups.activities.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Account Dropdown */}
        <div
          ref={(el) => (dropdownRefs.current["account"] = el)}
          style={dropdownContainerStyles}
        >
          <button
            onClick={() => toggleDropdown("account")}
            style={{
              ...navLinkStyles,
              color: isPathInGroup(eventsOfficeNavGroups.account.items)
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
              borderBottom: isPathInGroup(eventsOfficeNavGroups.account.items)
                ? `2px solid ${theme.colors.primary.main}`
                : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1],
            }}
          >
            {eventsOfficeNavGroups.account.label}
            <ChevronDown size={16} style={{
              transform: activeDropdown === "account" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} />
          </button>
          {activeDropdown === "account" && (
            <div style={dropdownMenuStyles}>
              {eventsOfficeNavGroups.account.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setActiveDropdown(null);
                  }}
                  style={{
                    ...dropdownItemStyles,
                    background: location.pathname === item.path
                      ? `${theme.colors.primary.main}10`
                      : "transparent",
                    color: location.pathname === item.path
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = theme.colors.neutral.gray50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const navLinkContainerStyles = {
    display: "flex",
    gap: theme.spacing[6],
    alignItems: "center",
  };

  const navLinkStyles = {
    background: "none",
    border: "none",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    padding: theme.spacing[2],
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily.primary,
  };

  const dropdownContainerStyles = {
    position: "relative",
  };

  const dropdownMenuStyles = {
    position: "absolute",
    top: "100%",
    left: "0",
    marginTop: theme.spacing[2],
    background: theme.colors.neutral.white,
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: theme.spacing[2],
    minWidth: "200px",
    zIndex: 1000,
    border: `1px solid ${theme.colors.border.light}`,
  };

  const dropdownItemStyles = {
    width: "100%",
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: "left",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  };

  const exclusiveBadgeStyles = {
    fontSize: theme.typography.fontSize.xs,
    padding: "2px 6px",
    borderRadius: "4px",
    background: `${theme.colors.eventTypes.competition.main}20`,
    color: theme.colors.eventTypes.competition.main,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

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
          renderEventsOfficeNav()
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
              onClick={() => navigate("/admin-comments")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/admin-comments"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/admin-comments"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/admin-comments") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/admin-comments") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Comments
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
              onClick={() => navigate("/loyalty-program")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/loyalty-program"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/loyalty-program"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/loyalty-program") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/loyalty-program") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Loyalty Program
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
              User Management
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
            <button
              onClick={() => navigate("/events-ratings")}
              style={{
                background: "none",
                border: "none",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color:
                  location.pathname === "/events-ratings"
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                cursor: "pointer",
                padding: theme.spacing[2],
                textDecoration: "none",
                borderBottom:
                  location.pathname === "/events-ratings"
                    ? `2px solid ${theme.colors.primary.main}`
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/events-ratings") {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/events-ratings") {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              Events Ratings
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
        ) : user && user.role === "student" ? (
          renderStudentNav()
        ) : isUser ? (
          // Staff, TA, Professor - use grouped navigation
          renderStaffNav()
        ) : (
          <></>
        )}
      </div>

      {/* Account Section */}
      <div style={accountSectionStyles}>
        {/* Notification Center for all stakeholder roles */}
        {(user?.role === "professor" || 
          user?.role === "staff" || 
          user?.role === "events_office" || 
          user?.role === "student" || 
          user?.role === "ta" ||
          user?.role === "admin") && (
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
