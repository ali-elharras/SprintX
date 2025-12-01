import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Users,
  Calendar,
  Star,
  MessageSquare,
  Award,
  BarChart2,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import theme from "../theme";

const AdminSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navGroups = [
    {
      title: "Administration",
      items: [
        {
          label: "Applications",
          path: "/admin-dashboard",
          icon: <ClipboardCheck size={20} />,
        },
        {
          label: "Users",
          path: "/admin-users",
          icon: <Users size={20} />,
        },
      ],
    },
    {
      title: "Content",
      items: [
        {
          label: "Events",
          path: "/events",
          icon: <Calendar size={20} />,
        },
        {
          label: "Event Ratings",
          path: "/events-ratings",
          icon: <Star size={20} />,
        },
        {
          label: "Comments",
          path: "/admin-comments",
          icon: <MessageSquare size={20} />,
        },
        {
          label: "Uploaded Files",
          path: "/uploaded-files",
          icon: <FileText size={20} />,
        },
      ],
    },
    {
      title: "Engagement",
      items: [
        {
          label: "Loyalty Program",
          path: "/loyalty-program",
          icon: <Award size={20} />,
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          label: "Reports",
          path: "/reports",
          icon: <BarChart2 size={20} />,
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarStyles = {
    width: "260px",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: theme.colors.neutral.white,
    borderRight: `1px solid ${theme.colors.border.light}`,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing[4],
    boxSizing: "border-box",
    fontFamily: theme.typography.fontFamily.primary,
    zIndex: 1100,
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease-in-out",
  };

  const navItemStyles = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
    padding: `${theme.spacing[3]}`,
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    color: active ? theme.colors.primary.main : theme.colors.text.primary,
    backgroundColor: active ? `${theme.colors.primary.main}10` : "transparent",
    fontWeight: active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.medium,
    transition: "all 0.2s ease",
    marginBottom: theme.spacing[1],
    whiteSpace: "nowrap",
    overflow: "hidden",
  });

  const groupTitleStyles = {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    padding: `0 ${theme.spacing[2]}`,
    marginBottom: theme.spacing[2],
    whiteSpace: "nowrap",
  };

  return (
    <div style={sidebarStyles}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing[2],
          padding: `0 ${theme.spacing[2]}`,
          height: "64px" /* Align with navbar height */,
        }}
      >
        <Shield size={24} color={theme.colors.primary.main} />
        <span
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
          }}
        >
          Admin Panel
        </span>
      </div>
      <nav>
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: theme.spacing[4] }}>
            <h3 style={groupTitleStyles}>{group.title}</h3>
            {group.items.map((item, itemIndex) => (
              <a
                key={itemIndex}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                style={navItemStyles(isActive(item.path))}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
