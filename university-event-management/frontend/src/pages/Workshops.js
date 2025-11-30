import React, { useState, useMemo, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Helper functions to get tomorrow's date in local time
const getTomorrowDateString = () => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- STYLES as a JavaScript Object (Centralized Styles) ---
const themeColors = {
  indigo600: "#4f46e5",
  indigo50: "#eef2ff",
  orange600: "#ea580c",
  fuchsia600: "#c026d3",
  green600: "#16a34a",
  cyan600: "#0ea5e9",
  amber600: "#f59e42",
  gray100: "#f3f4f6",
  gray900: "#111827",
  gray500: "#6b7280",
  red600: "#dc2626",
  red50: "#fef2f2",
};

// Helper function to get faculty colors (similar to getEventTypeColor)
const getFacultyColor = (faculty) => {
  const facultyColors = {
    MET: themeColors.indigo600,
    IET: themeColors.orange600,
    MGT: themeColors.green600,
    PHAR: themeColors.cyan600,
    ARCH: themeColors.amber600,
    ART: themeColors.fuchsia600,
  };
  return facultyColors[faculty] || themeColors.gray500;
};

const styleSheet = {
  // --- Card Border Styles ---
  "card-border-MET": { borderTopColor: themeColors.indigo600 },
  "card-border-IET": { borderTopColor: themeColors.orange600 },
  "card-border-MGT": { borderTopColor: "#16a34a" },
  "card-border-PHAR": { borderTopColor: "#0ea5e9" },
  "card-border-ARCH": { borderTopColor: "#f59e42" },
  "card-border-ART": { borderTopColor: themeColors.fuchsia600 },
  "card-border-Other": { borderTopColor: themeColors.gray500 },

  // --- Faculty Badge Styles ---
  "badge-MET": {
    backgroundColor: themeColors.indigo50,
    color: themeColors.indigo600,
  },
  "badge-IET": { backgroundColor: "#fff7ed", color: "#c2410c" },
  "badge-MGT": { backgroundColor: "#dcfce7", color: "#16a34a" },
  "badge-PHAR": { backgroundColor: "#e0f2fe", color: "#0ea5e9" },
  "badge-ARCH": { backgroundColor: "#fef9c3", color: "#f59e42" },
  "badge-ART": { backgroundColor: "#fae8ff", color: "#a215b9" },
  "badge-Other": {
    backgroundColor: themeColors.gray100,
    color: themeColors.gray500,
  },
  "badge-default": {
    backgroundColor: themeColors.gray100,
    color: themeColors.gray500,
  },

  // --- Button Base Styles ---
  "card-btn-edit-default": {
    color: themeColors.indigo600,
    borderColor: themeColors.indigo600,
    backgroundColor: "transparent",
  },
  "card-btn-view-toggle-default": {
    color: themeColors.indigo600,
    backgroundColor: themeColors.indigo50,
    borderColor: "transparent",
  },
  // New Delete Button Base Style
  "card-btn-delete-default": {
    color: themeColors.red600,
    borderColor: themeColors.red600,
    backgroundColor: "transparent",
  },
};

// --- Dummy Data (Fixed to use correct schema keys for safe fallback) ---
const FALLBACK_WORKSHOP = {
  _id: "fallback-123",
  workshopName: "💡 Demo Workshop (Fallback)",
  shortDescription:
    "This item is a placeholder. If you see it, your API fetch failed. Check your server!",
  fullAgenda: "Check server connection and API route /api/workshops.",
  location: "Local Dev Server",
  startDate: "2024-01-01",
  startTime: "12:00 PM",
  endDate: "2024-01-01",
  endTime: "1:00 PM",
  duration: "1 hour",
  facultyResponsible: "DEFAULT",
  professorsParticipating: ["API Error Handler"],
  capacity: 0,
  attendees: 0,
  registrationDeadline: "N/A",
  requiredBudget: "N/A",
  fundingSource: "N/A",
  extraRequiredResources: "Check the backend console for error details.",
  status: "Failed",
};

// --- Utility Components (Unchanged) ---
const FacultyBadge = ({ faculty }) => {
  let styleKey = "";
  switch (faculty) {
    case "MET":
      styleKey = "badge-MET";
      break;
    case "IET":
      styleKey = "badge-IET";
      break;
    case "MGT":
      styleKey = "badge-MGT";
      break;
    case "PHAR":
      styleKey = "badge-PHAR";
      break;
    case "ARCH":
      styleKey = "badge-ARCH";
      break;
    case "ART":
      styleKey = "badge-ART";
      break;
    case "Other":
      styleKey = "badge-Other";
      break;
    default:
      styleKey = "badge-default";
  }

  const baseStyle = {
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: "9999px",
  };

  return (
    <span style={{ ...baseStyle, ...styleSheet[styleKey] }}>{faculty}</span>
  );
};

// Status Badge Component for Workshop Status
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#fef3c7", color: "#d97706" }; // Yellow
      case "published":
        return { backgroundColor: "#dcfce7", color: "#16a34a" }; // Green
      case "rejected":
        return { backgroundColor: "#fecaca", color: "#dc2626" }; // Red
      case "needs_revision":
        return { backgroundColor: "#dbeafe", color: "#2563eb" }; // Blue
      default:
        return { backgroundColor: "#f3f4f6", color: "#6b7280" }; // Gray
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "⏳ Pending for Approval";
      case "published":
        return "✅ Published";
      case "rejected":
        return "❌ Rejected";
      case "needs_revision":
        return "📝 Needs Revision";
      default:
        return status;
    }
  };

  const baseStyle = {
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: "9999px",
    display: "inline-block",
    marginLeft: "0.5rem",
  };

  return (
    <span style={{ ...baseStyle, ...getStatusStyle() }}>
      {getStatusLabel()}
    </span>
  );
};

// Icons (using inline SVG for single-file component) - No change here
const IconMap = {
  // ... (Your SVG definitions) ...
  Location: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  People: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 17H10" />
    </svg>
  ),
  Agenda: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  Finance: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ChevronDown: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronUp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  Trash: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
};

const DetailSectionHeader = ({ title, icon }) => (
  <h4
    style={{
      fontSize: "0.875rem",
      fontWeight: 600,
      color: themeColors.indigo600,
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
    }}
  >
    <span style={{ marginRight: "0.25rem", width: "14px", height: "14px" }}>
      {icon}
    </span>
    {title}
  </h4>
);

// --- REVISED WorkshopCard with EventCard-inspired UI ---
const WorkshopCard = ({ workshop, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extract onViewParticipants from workshop object if it exists
  const { onViewParticipants, ...workshopData } = workshop;

  const uniqueId = workshop._id || workshop.id;
  const isRejected = workshop.status === "rejected";
  const facultyColor = getFacultyColor(workshop.facultyResponsible);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const professorsList = Array.isArray(workshop.professorsParticipating)
    ? workshop.professorsParticipating
    : workshop.professors || [];

  const participationPercentage =
    workshop.capacity > 0
      ? ((workshop.attendees || 0) / workshop.capacity) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: `2px solid ${isHovered ? facultyColor : "#e5e7eb"}`,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "480px",
        boxShadow: isHovered
          ? "0 20px 40px rgba(0,0,0,0.12)"
          : "0 4px 12px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      {/* Vertical color strip on the left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "4px",
          background: `linear-gradient(180deg, ${themeColors.indigo600}, ${themeColors.indigo600}dd)`,
          transition: "width 0.3s ease",
          zIndex: 0,
        }}
      />

      {/* Workshop Header */}
      <div
        style={{
          padding: "1.25rem",
          paddingLeft: "1.75rem",
          color: "#111827",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0.75rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: `${facultyColor}15`,
              padding: "0.5rem 1rem",
              borderRadius: "30px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: facultyColor,
            }}
          >
            {workshop.facultyResponsible}
          </motion.div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {workshop.status && <StatusBadge status={workshop.status} />}
          </div>
        </div>

        <motion.h3
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {workshop.workshopName}
        </motion.h3>
      </div>

      {/* Workshop Content */}
      <div
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* Edit Requests Section */}
        {workshop.editRequests &&
          workshop.editRequests.length > 0 &&
          workshop.status === "needs_revision" && (
            <div
              style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#92400e",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ✏️ Edit Request
              </h4>
              {workshop.editRequests.map((editReq, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      index < workshop.editRequests.length - 1 ? "0.5rem" : 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#78350f",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <strong>Message:</strong> {editReq.message}
                  </p>
                  {editReq.requestedBy && editReq.requestedBy.name && (
                    <p style={{ fontSize: "0.75rem", color: "#92400e" }}>
                      Requested by: {editReq.requestedBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* Workshop Details with Icons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem",
              background: "#f9fafb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              color: "#111827",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <span style={{ fontWeight: 500 }}>
              {formatDate(workshop.startDate)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem",
              background: "#f9fafb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              color: "#111827",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🕐</span>
            <span style={{ fontWeight: 500 }}>
              {workshop.startTime || "N/A"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem",
              background: "#f9fafb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              color: "#111827",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📍</span>
            <span style={{ fontWeight: 500 }}>{workshop.location}</span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            lineHeight: 1.6,
            marginBottom: "0.75rem",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {workshop.shortDescription}
        </p>

        <motion.button
          whileHover={{ x: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          style={{
            background: "none",
            border: "none",
            color: facultyColor,
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            marginBottom: "1rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {isExpanded ? "Show less" : "Read more"} <span>→</span>
        </motion.button>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "#f9fafb",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
              border: "2px solid #e5e7eb",
            }}
          >
            <div style={{ marginBottom: "0.75rem" }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: facultyColor,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.5rem" }}>{IconMap.Agenda}</span>
                Full Agenda
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#374151",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {workshop.fullAgenda}
              </p>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: facultyColor,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.5rem" }}>{IconMap.People}</span>
                Professors
              </h4>
              <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0 }}>
                {professorsList.join(", ")}
              </p>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: facultyColor,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.5rem" }}>{IconMap.Finance}</span>
                Finance
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#374151",
                  marginBottom: "0.25rem",
                }}
              >
                <strong>Budget:</strong> {workshop.requiredBudget}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0 }}>
                <strong>Funding Source:</strong> {workshop.fundingSource}
              </p>
            </div>

            <div>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: facultyColor,
                  marginBottom: "0.5rem",
                }}
              >
                Required Resources
              </h4>
              <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0 }}>
                {workshop.extraRequiredResources}
              </p>
            </div>
          </motion.div>
        )}

        {/* Participation Info with Progress Bar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (workshop.onViewParticipants) {
              workshop.onViewParticipants(workshop);
            }
          }}
          style={{
            background: "linear-gradient(135deg, #f9fafb, #ffffff)",
            padding: "1rem",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
            border: "2px solid #e5e7eb",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = `2px solid ${facultyColor}`;
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "2px solid #e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              👥 Participants
            </span>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: facultyColor,
              }}
            >
              {workshop.attendees || 0} / {workshop.capacity}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: "0.5rem",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${participationPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${facultyColor}, ${facultyColor}dd)`,
                borderRadius: "999px",
              }}
            />
          </div>

          {workshop.registrationDeadline && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "0.5rem",
                borderTop: "1px solid #e5e7eb",
                marginTop: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Registration Deadline
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {formatDate(workshop.registrationDeadline)}
              </span>
            </div>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div style={{ flexGrow: 1 }}></div>

        {/* Action Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginTop: "auto",
            paddingTop: "1rem",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(uniqueId, workshop.workshopName);
            }}
            style={{
              background: `linear-gradient(135deg, ${facultyColor}, ${facultyColor}dd)`,
              color: "#ffffff",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
            }}
          >
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(uniqueId, workshop.workshopName);
            }}
            style={{
              background: "#ffffff",
              color: themeColors.red600,
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: `2px solid ${themeColors.red600}`,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Edit Modal Component ---

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    overflow: "auto",
  },
  container: {
    background: "white",
    borderRadius: "1rem",
    padding: "2rem",
    minWidth: "350px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: themeColors.indigo600,
    marginBottom: "1rem",
    textAlign: "center",
  },
  label: {
    fontWeight: 600,
    color: themeColors.gray900,
    marginBottom: "0.25rem",
    fontSize: "1rem",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    marginBottom: "0.75rem",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    marginBottom: "0.75rem",
    width: "100%",
    minHeight: "80px",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: themeColors.indigo600,
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.75rem",
    fontWeight: 700,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "0.5rem",
    boxShadow: "0 2px 6px rgba(79,70,229,0.15)",
    transition: "background 0.2s",
  },
  cancelButton: {
    backgroundColor: themeColors.gray100,
    color: themeColors.gray900,
    padding: "0.75rem 1.5rem",
    borderRadius: "0.75rem",
    fontWeight: 600,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
};

const EditWorkshopModal = ({ open, workshop, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(workshop || {});
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    setFormData(workshop || {});
    setErrorMsg("");
  }, [workshop]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const validateForm = () => {
    // Required fields
    const requiredFields = [
      "workshopName",
      "shortDescription",
      "location",
      "startDate",
      "endDate",
      "fullAgenda",
      "facultyResponsible",
      "capacity",
      "registrationDeadline",
      "requiredBudget",
      "fundingSource",
    ];
    for (const field of requiredFields) {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        setErrorMsg("Please fill in all required fields.");
        return false;
      }
    }
    // Date logic
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const regDeadline = new Date(formData.registrationDeadline);
    if (endDate <= startDate) {
      setErrorMsg("End date must be after start date.");
      return false;
    }
    if (regDeadline > startDate) {
      setErrorMsg("Registration deadline must be on or before the start date.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Only send changed fields
    const changedFields = {};
    Object.keys(formData).forEach((key) => {
      // Handle array comparison (e.g., professorsParticipating)
      if (Array.isArray(formData[key]) && Array.isArray(workshop[key])) {
        const formArray = formData[key].filter(Boolean); // Remove empty strings
        const workshopArray = workshop[key].filter(Boolean);
        if (
          JSON.stringify(formArray.sort()) !==
          JSON.stringify(workshopArray.sort())
        ) {
          changedFields[key] = formArray;
        }
      }
      // Handle date comparison (convert both to date strings)
      else if (key.includes("Date") || key.includes("Deadline")) {
        const formDate = formData[key]
          ? new Date(formData[key]).toISOString().slice(0, 10)
          : "";
        const workshopDate = workshop[key]
          ? new Date(workshop[key]).toISOString().slice(0, 10)
          : "";
        if (formDate !== workshopDate) {
          changedFields[key] = formData[key];
        }
      }
      // Handle regular field comparison
      else if (formData[key] !== workshop[key]) {
        changedFields[key] = formData[key];
      }
    });

    // Always send at least one field to trigger update
    if (Object.keys(changedFields).length === 0) {
      setErrorMsg("No changes detected.");
      return;
    }

    onSubmit(changedFields);
  };

  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.title}>Edit Workshop</div>
        {errorMsg && (
          <div
            style={{
              color: themeColors.red600,
              background: themeColors.red50,
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label style={modalStyles.label}>Workshop Name</label>
          <input
            style={modalStyles.input}
            name="workshopName"
            value={formData.workshopName || ""}
            onChange={handleChange}
            placeholder="Workshop Name"
          />
          <label style={modalStyles.label}>Short Description</label>
          <textarea
            style={modalStyles.textarea}
            name="shortDescription"
            value={formData.shortDescription || ""}
            onChange={handleChange}
            placeholder="Short Description"
            maxLength={200}
          />
          <label style={modalStyles.label}>Full Agenda</label>
          <textarea
            style={modalStyles.textarea}
            name="fullAgenda"
            value={formData.fullAgenda || ""}
            onChange={handleChange}
            placeholder="Full Agenda"
          />
          <label style={modalStyles.label}>Location</label>
          <select
            style={modalStyles.input}
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            <option value="GUC Cairo">GUC Cairo</option>
            <option value="GUC Berlin">GUC Berlin</option>
          </select>
          <label style={modalStyles.label}>Start Date</label>
          <input
            style={modalStyles.input}
            type="date"
            name="startDate"
            value={formData.startDate ? formData.startDate.slice(0, 10) : ""}
            min={getTomorrowDateString()}
            onChange={handleChange}
          />
          <label style={modalStyles.label}>End Date</label>
          <input
            style={modalStyles.input}
            type="date"
            name="endDate"
            value={formData.endDate ? formData.endDate.slice(0, 10) : ""}
            min={
              formData.startDate
                ? formData.startDate.slice(0, 10)
                : getTomorrowDateString()
            }
            onChange={handleChange}
          />
          <label style={modalStyles.label}>Faculty Responsible</label>
          <select
            style={modalStyles.input}
            name="facultyResponsible"
            value={formData.facultyResponsible || ""}
            onChange={handleChange}
          >
            <option value="">Select Faculty</option>
            <option value="MET">MET</option>
            <option value="IET">IET</option>
            <option value="MGT">MGT</option>
            <option value="PHAR">PHAR</option>
            <option value="ARCH">ARCH</option>
            <option value="ART">ART</option>
            <option value="Other">Other</option>
          </select>
          <label style={modalStyles.label}>
            Professors Participating (comma separated)
          </label>
          <input
            style={modalStyles.input}
            name="professorsParticipating"
            value={
              Array.isArray(formData.professorsParticipating)
                ? formData.professorsParticipating.join(", ")
                : formData.professorsParticipating || ""
            }
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                professorsParticipating: e.target.value
                  .split(",")
                  .map((s) => s.trim()),
              }));
            }}
            placeholder="Professors Participating"
          />
          <label style={modalStyles.label}>Capacity</label>
          <input
            style={modalStyles.input}
            type="number"
            name="capacity"
            min={1}
            value={formData.capacity || ""}
            onChange={handleChange}
            placeholder="Capacity"
          />
          <label style={modalStyles.label}>Registration Deadline</label>
          <input
            style={modalStyles.input}
            type="date"
            name="registrationDeadline"
            value={
              formData.registrationDeadline
                ? formData.registrationDeadline.slice(0, 10)
                : ""
            }
            onChange={handleChange}
          />
          <label style={modalStyles.label}>Extra Required Resources</label>
          <textarea
            style={modalStyles.textarea}
            name="extraRequiredResources"
            value={formData.extraRequiredResources || ""}
            onChange={handleChange}
            placeholder="Extra Required Resources"
            maxLength={500}
          />
          <label style={modalStyles.label}>Required Budget</label>
          <input
            style={modalStyles.input}
            type="number"
            name="requiredBudget"
            min={0}
            value={formData.requiredBudget || ""}
            onChange={handleChange}
            placeholder="Required Budget"
          />
          <label style={modalStyles.label}>Funding Source</label>
          <select
            style={modalStyles.input}
            name="fundingSource"
            value={formData.fundingSource || ""}
            onChange={handleChange}
          >
            <option value="">Select Funding Source</option>
            <option value="External">External</option>
            <option value="GUC">GUC</option>
            <option value="Joint">Joint</option>
          </select>
          <button type="submit" style={modalStyles.button}>
            Save Changes
          </button>
          <button
            type="button"
            style={modalStyles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

// --- Main Component ---
const Workshops = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedWorkshopForParticipants, setSelectedWorkshopForParticipants] =
    useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const navigate = useNavigate();
  const { token, user } = useAuth(); // Get auth token and user info

  // Use environment variable for API URL
  const API_URL = `${
    process.env.REACT_APP_API_URL || "http://localhost:8080/api"
  }/workshops`;

  // --- Data Fetching Logic with Authentication ---
  const fetchWorkshops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authentication token if available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setWorkshops(data);
    } catch (e) {
      console.error("Fetch error. Displaying fallback workshop.", e);
      setError(e.message || "Failed to connect to the server.");
      setWorkshops([FALLBACK_WORKSHOP]);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  // --- Action Handlers ---

  // 1. Edit Workshop Handler
  const handleEditWorkshop = useCallback(
    (id, title) => {
      const workshop = workshops.find((w) => (w._id || w.id) === id);
      setEditingWorkshop(workshop);
      setEditModalOpen(true);
    },
    [workshops]
  );

  // Modal submit handler
  const handleModalSubmit = async (changedFields) => {
    if (!editingWorkshop || !editingWorkshop._id) return;

    console.log("Submitting workshop update:", changedFields);

    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // If workshop is being resubmitted after edit request, change status to pending
      const updatedFields = { ...changedFields };
      if (editingWorkshop.status === "needs_revision") {
        updatedFields.status = "pending";
      }

      const response = await fetch(`${API_URL}/${editingWorkshop._id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.message ||
          errorData.error ||
          `Server error: ${response.status} ${response.statusText}`;
        console.error("Update failed with error:", errorData);
        throw new Error(errorMsg);
      }

      const updatedWorkshop = await response.json();
      console.log("Workshop updated successfully:", updatedWorkshop);

      // Show success message
      if (editingWorkshop.status === "needs_revision") {
        toast.success(
          "Workshop resubmitted successfully! It is now pending approval from the Events Office.",
          { duration: 4000 }
        );
      } else {
        toast.success("Workshop updated successfully!", { duration: 3000 });
      }

      setEditModalOpen(false);
      setEditingWorkshop(null);
      await fetchWorkshops();
    } catch (e) {
      console.error("Failed to update workshop:", e);
      const errorMessage = e.message || "Failed to update workshop";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Delete Workshop Handler (NEW)
  const handleDeleteWorkshop = useCallback(
    async (id, title) => {
      if (
        !window.confirm(
          `Are you sure you want to permanently delete the workshop: "${title}"? This cannot be undone.`
        )
      ) {
        return;
      }

      console.log(`[DELETE ACTION] Deleting workshop ID: ${id} (${title})`);
      setError(null);
      setIsLoading(true); // Can show loading state, but often deletion is quick

      try {
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to delete workshop: ${response.statusText}`);
        }

        // Notify other tabs/windows about the deletion via localStorage
        // This will trigger the EventsPage to refresh and remove the deleted workshop
        localStorage.setItem("workshop_deleted", Date.now().toString());

        // On successful deletion, refetch the list to update the UI
        fetchWorkshops();
      } catch (e) {
        console.error("Delete error:", e);
        setError(`Could not delete workshop. Error: ${e.message}`);
        setIsLoading(false); // Stop loading on error
      }
      // Note: fetchWorkshops will set isLoading(false) on success
    },
    [API_URL, fetchWorkshops, token]
  ); // Dependencies: API_URL, fetchWorkshops, and token

  // 3. View Participants Handler
  const handleViewParticipants = useCallback(
    async (workshop) => {
      // Check if workshop has been published (has a publishedEventId)
      if (!workshop.publishedEventId && !workshop._id) {
        toast.error("This workshop hasn't been published yet, so there are no participants.");
        return;
      }

      setSelectedWorkshopForParticipants(workshop);
      setParticipantsModalOpen(true);
      setLoadingParticipants(true);
      setParticipants([]);

      try {
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Use publishedEventId if available, otherwise fall back to workshop._id
        const eventId = workshop.publishedEventId || workshop._id;
        
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8080/api"
          }/events/${eventId}/registrations`,
          {
            headers,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch participants: ${response.statusText}`
          );
        }

        const data = await response.json();
        setParticipants(data.registrations || []);
      } catch (e) {
        console.error("Error fetching participants:", e);
        toast.error("Failed to load participants");
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    },
    [token]
  );

  // --- Filtering Logic (Unchanged) ---
  const filteredWorkshops = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    const results = workshops.filter((workshop) => {
      if (!workshop) return false;

      // Use correct schema keys with safety checks
      const nameMatch =
        workshop.workshopName &&
        workshop.workshopName.toLowerCase().includes(searchLower);
      const descriptionMatch =
        workshop.shortDescription &&
        workshop.shortDescription.toLowerCase().includes(searchLower);

      const locationMatch =
        workshop.location &&
        workshop.location.toLowerCase().includes(searchLower);
      const facultyMatch =
        workshop.facultyResponsible &&
        workshop.facultyResponsible.toLowerCase().includes(searchLower);
      const statusMatch =
        workshop.status && workshop.status.toLowerCase().includes(searchLower);

      return (
        nameMatch ||
        descriptionMatch ||
        locationMatch ||
        facultyMatch ||
        statusMatch
      );
    });

    if (results.length === 1 && results[0]._id === "fallback-123") {
      return results;
    }

    return results.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [searchTerm, workshops]);

  // --- Main Component Render ---
  return (
    <>
      {/* CONTAINER: Max-width and background for main page */}
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          padding: "1.5rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Page Header and Actions - Centered and constrained */}
        <div
          style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "2.5rem",
            paddingLeft: "1rem", // Add padding for smaller screens
            paddingRight: "1rem",
          }}
        >
          {/* Header and Button - Flex layout for spacing */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: 800,
                color: themeColors.gray900,
              }}
            >
              My Workshops Dashboard
            </h1>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: themeColors.indigo600,
                color: "white",
                padding: "0.65rem 1.25rem",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s",
                fontSize: "1rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                // Note: Inline styles don't support pseudo-classes like :hover directly.
                // A custom component with state is needed for true hover on this element.
                transform: "scale(1)",
              }}
              onClick={() => navigate("/create-workshop")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "0.5rem" }}
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Workshop
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginTop: "1.5rem" }}>
            <input
              type="text"
              placeholder="Search workshops by title, description, location, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.75rem",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "border-color 0.15s, box-shadow 0.15s",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>

        {/* Workshops Grid Container */}
        <div
          style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "0 1rem",
          }}
        >
          {/* Display Loading / Error State */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 0",
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f3f4f6",
              }}
            >
              <p style={{ fontSize: "1.125rem", color: "#4b5563" }}>
                Loading workshops from database... ⏳
              </p>
            </div>
          )}

          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                backgroundColor: themeColors.red50,
                borderRadius: "0.75rem",
                border: `1px solid ${themeColors.red600}`,
              }}
            >
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: themeColors.red600,
                }}
              >
                Error: {error}
              </p>
              <p style={{ fontSize: "0.875rem", color: themeColors.red600 }}>
                Check your server and refresh the page. Displaying fallback
                data.
              </p>
            </div>
          )}

          {/* Display Workshops */}
          {!isLoading &&
          !error &&
          filteredWorkshops.length === 0 &&
          searchTerm === "" ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 0",
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f3f4f6",
              }}
            >
              <p style={{ fontSize: "1.125rem", color: "#4b5563" }}>
                No workshops found in the database. Start by creating a new one!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                // Grid Fix: Ensures 1 column on small screens and expands
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard
                  key={workshop._id || workshop.id}
                  workshop={{
                    ...workshop,
                    onViewParticipants: handleViewParticipants,
                  }}
                  onEdit={handleEditWorkshop}
                  onDelete={handleDeleteWorkshop} // Passed the new delete handler
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <EditWorkshopModal
        open={editModalOpen}
        workshop={editingWorkshop}
        onClose={() => {
          setEditModalOpen(false);
          setEditingWorkshop(null);
        }}
        onSubmit={handleModalSubmit}
      />

      {/* Participants Modal */}
      {participantsModalOpen &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setParticipantsModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "80vh",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "24px",
                  borderBottom: "2px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                      marginBottom: "4px",
                    }}
                  >
                    👥 Workshop Participants
                  </h2>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {selectedWorkshopForParticipants?.workshopName}
                  </p>
                </div>
                <button
                  onClick={() => setParticipantsModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "28px",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: "0",
                    lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#111827")}
                  onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div
                style={{
                  padding: "24px",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {loadingParticipants ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        marginBottom: "16px",
                      }}
                    >
                      ⏳
                    </div>
                    <p style={{ color: "#6b7280" }}>Loading participants...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      style={{
                        fontSize: "3rem",
                        marginBottom: "16px",
                      }}
                    >
                      📭
                    </div>
                    <p
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "8px",
                      }}
                    >
                      No participants yet
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      This workshop doesn't have any registered participants.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        padding: "12px 16px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#6b7280",
                        }}
                      >
                        Total Participants
                      </span>
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "#4f46e5",
                        }}
                      >
                        {participants.length} /{" "}
                        {selectedWorkshopForParticipants?.capacity || 0}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {participants.map((participant, index) => (
                        <div
                          key={participant._id || index}
                          style={{
                            padding: "16px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#4f46e5";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(79, 70, 229, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                  color: "#111827",
                                  marginBottom: "4px",
                                }}
                              >
                                {participant.user?.firstName}{" "}
                                {participant.user?.lastName}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                {participant.user?.email}
                              </div>
                              {participant.user?.universityId && (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#9ca3af",
                                    marginTop: "4px",
                                  }}
                                >
                                  ID: {participant.user?.universityId}
                                </div>
                              )}
                            </div>
                            {participant.registeredAt && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#6b7280",
                                  textAlign: "right",
                                }}
                              >
                                Registered:
                                <br />
                                {new Date(
                                  participant.registeredAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setParticipantsModalOpen(false)}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#4338ca")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#4f46e5")
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Workshops;
