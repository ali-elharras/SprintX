import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { applicationServices } from "../services/api";
import theme from "../theme";
import toast from "react-hot-toast";

const styles = {
  container: {
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    minHeight: "100vh",
    fontFamily: theme.typography.fontFamily.primary,
    position: "relative",
    overflow: "hidden",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.colors.primary.main} 1px, transparent 0)`,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  contentWrapper: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: `${theme.spacing[8]}`
  },
  headerContainer: {
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    borderRadius: "24px",
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset",
    position: "relative",
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: "-50%",
    right: "-20%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: "2.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing[2],
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral.white,
    opacity: 0.95,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  statCard: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    textAlign: "center",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: `1px solid ${theme.colors.border.light}`,
    position: "relative",
    overflow: "hidden",
  },
  statGradient: (color) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
  }),
  statValue: {
    fontSize: "2.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[2],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterContainer: {
    background: theme.colors.neutral.white,
    borderRadius: "16px",
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
    boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
    border: `1px solid ${theme.colors.border.light}`,
    display: "flex",
    gap: theme.spacing[4],
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  filterButton: (isActive) => ({
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: "12px",
    border: `2px solid ${isActive ? theme.colors.primary.main : theme.colors.border.light}`,
    background: isActive ? theme.colors.primary.main : theme.colors.neutral.white,
    color: isActive ? theme.colors.neutral.white : theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
  }),
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  applicationCard: (isHovered, statusColor) => ({
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[5],
    boxShadow: isHovered
      ? "0 20px 40px rgba(0, 0, 0, 0.15)"
      : "0 10px 30px rgba(0, 0, 0, 0.08)",
    border: `2px solid ${isHovered ? statusColor : theme.colors.border.light}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  }),
  cardVerticalStrip: (color) => ({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "8px",
    background: `linear-gradient(to bottom, ${color}, ${color}dd)`,
    borderTopLeftRadius: "18px",
    borderBottomLeftRadius: "18px",
    zIndex: 1,
  }),
  cardHeader: {
    marginBottom: theme.spacing[3],
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
    lineHeight: theme.typography.lineHeight.tight,
  },
  bazaarTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  badgeContainer: {
    display: "flex",
    gap: theme.spacing[2],
    flexWrap: "wrap",
    marginBottom: theme.spacing[2],
  },
  statusBadge: (status) => {
    const statusColors = {
      pending: { bg: "#FEF3C7", color: "#92400E" },
      approved: { bg: "#D1FAE5", color: "#065F46" },
      rejected: { bg: "#FEE2E2", color: "#991B1B" },
    };
    const colors = statusColors[status?.toLowerCase()] || { bg: "#F3F4F6", color: "#374151" };
    
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: "capitalize",
      backgroundColor: colors.bg,
      color: colors.color,
    };
  },
  typeBadge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: "capitalize",
    backgroundColor: type === 'bazaar' ? "#EDE9FE" : "#DBEAFE",
    color: type === 'bazaar' ? "#5B21B6" : "#1E40AF",
  }),
  cardDetails: {
    display: "grid",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailLabel: {
    fontWeight: theme.typography.fontWeight.medium,
    minWidth: "120px",
    color: theme.colors.text.primary,
  },
  detailValue: {
    color: theme.colors.text.secondary,
  },
  attendeesSection: {
    marginTop: theme.spacing[3],
    padding: theme.spacing[3],
    background: theme.colors.neutral.gray50,
    borderRadius: "12px",
  },
  attendeesTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  attendeeItem: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    padding: `${theme.spacing[1]} 0`,
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: theme.spacing[2],
    paddingTop: theme.spacing[3],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  actionButton: (variant) => {
    const variants = {
      approve: {
        bg: "#D1FAE5",
        color: "#065F46",
        border: "#34D399",
        hoverBg: "#34D399",
      },
      reject: {
        bg: "#FEE2E2",
        color: "#991B1B",
        border: "#FCA5A5",
        hoverBg: "#FCA5A5",
      },
    };
    const colors = variants[variant] || variants.approve;
    
    return {
      flex: 1,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderRadius: "12px",
      border: `2px solid ${colors.border}`,
      background: colors.bg,
      color: colors.color,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      cursor: "pointer",
      transition: "all 0.3s ease",
      textAlign: "center",
    };
  },
  statusIndicator: (status) => {
    const statusStyles = {
      approved: {
        bg: "#D1FAE5",
        color: "#065F46",
        border: "#34D399",
      },
      rejected: {
        bg: "#FEE2E2",
        color: "#991B1B",
        border: "#FCA5A5",
      },
    };
    const colors = statusStyles[status?.toLowerCase()] || { bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
    
    return {
      flex: 1,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderRadius: "12px",
      border: `2px solid ${colors.border}`,
      background: colors.bg,
      color: colors.color,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: "center",
      textTransform: "capitalize",
    };
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  emptyStateIcon: {
    fontSize: "64px",
    marginBottom: theme.spacing[4],
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  loadingContainer: {
    textAlign: "center",
    padding: theme.spacing[12],
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: `4px solid ${theme.colors.neutral.gray200}`,
    borderTop: `4px solid ${theme.colors.primary.main}`,
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 1s linear infinite",
  },
  tableContainer: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    border: `1px solid ${theme.colors.border.light}`,
    marginBottom: theme.spacing[8],
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    textAlign: "left",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wider,
    background: theme.colors.neutral.gray50,
    borderBottom: `2px solid ${theme.colors.border.light}`,
  },
  td: {
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    verticalAlign: "middle",
  },
};

const cssKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}

.application-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
}

.action-button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
}

.status-indicator:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
}

.filter-button:hover {
  transform: translateY(-2px);
}
`;

// New ApplicationRow component for the table
const ApplicationRow = ({ app, onUpdateStatus, getStatusColor }) => {
  return (
    <tr style={{ background: theme.colors.neutral.white }}>
      <td style={styles.td}>
        <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
          {app.vendor?.companyName || "N/A"}
        </div>
        <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
          {app.vendor?.contactPerson || "N/A"}
        </div>
      </td>
      <td style={styles.td}>
        {app.applicationType === 'bazaar' 
          ? app.bazaar?.title || app.bazaar?.startDate?.substring(0, 10) || "N/A" 
          : "Standalone Booth"}
      </td>
      <td style={styles.td}>
        <span style={styles.typeBadge(app.applicationType)}>
          {app.applicationType}
        </span>
      </td>
      <td style={styles.td}>{app.boothSize || 'N/A'}</td>
      <td style={styles.td}>
        <span style={styles.statusBadge(app.status)}>
          {app.status}
        </span>
      </td>
      <td style={styles.td}>
        {app.status === "pending" ? (
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <button
              className="action-button"
              style={{ ...styles.actionButton("approve"), padding: `${theme.spacing[2]} ${theme.spacing[3]}` }}
              onClick={() => onUpdateStatus(app.applicationType, app._id, "approved")}
            >
              ✓ Approve
            </button>
            <button
              className="action-button"
              style={{ ...styles.actionButton("reject"), padding: `${theme.spacing[2]} ${theme.spacing[3]}` }}
              onClick={() => onUpdateStatus(app.applicationType, app._id, "rejected")}
            >
              ✕ Reject
            </button>
          </div>
        ) : (
          <div style={{
            ...styles.td, // Inherit base td styles
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.secondary,
          }}>
            N/A
          </div>
        )}
      </td>
    </tr>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin, isEventsOffice, isAuthenticated, userType } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Debug logging
  useEffect(() => {
    console.log("=== ADMIN DASHBOARD DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("userType:", userType);
    console.log("user:", user);
    console.log("isAdmin:", isAdmin);
    console.log("isEventsOffice:", isEventsOffice);

    // Check if user has admin or events office access
    if (isAuthenticated && userType === "user" && !isAdmin && !isEventsOffice) {
      console.error("User does not have admin or events office privileges");
      setError("Admin or Events Office access required");
      setLoading(false);
      return;
    }
  }, [isAuthenticated, userType, user, isAdmin, isEventsOffice]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationServices.getAllApplications();
      const combinedApplications = [
        ...(data.data.bazaarApplications || []).map(app => ({ ...app, applicationType: 'bazaar' })),
        ...(data.data.boothApplications || []).map(app => ({ ...app, applicationType: 'booth' })),
      ];
      setApplications(combinedApplications);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch applications.");
      toast.error(err.message || "Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationType, applicationId, status) => {
    try {
      await applicationServices.updateApplicationStatus(
        applicationType,
        applicationId,
        status
      );
      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Failed to update application status.");
    }
  };

  const filteredApplications = applications.filter(app => {
    const statusMatch = filterStatus === "all" || app.status === filterStatus;
    const typeMatch = filterType === "all" || app.applicationType === filterType;
    return statusMatch && typeMatch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#F59E0B",
      approved: "#10B981",
      rejected: "#EF4444",
    };
    return colors[status?.toLowerCase()] || "#6B7280";
  };

  if (loading) {
    return (
      <>
        <style>{cssKeyframes}</style>
        <div style={styles.container}>
          <div style={styles.backgroundPattern}></div>
          <div style={styles.contentWrapper}>
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={{...styles.emptyStateText, marginTop: theme.spacing[4]}}>Loading applications...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{cssKeyframes}</style>
        <div style={styles.container}>
          <div style={styles.backgroundPattern}></div>
          <div style={styles.contentWrapper}>
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>⚠️</div>
              <p style={styles.emptyStateText}>Error: {error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssKeyframes}</style>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.headerContainer}>
            <div style={styles.headerGlow}></div>
            <div style={styles.headerContent}>
              <h1 style={styles.headerTitle}>Applications</h1>
              <p style={styles.headerSubtitle}>Manage all vendor applications and booth requests</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div className="stat-card" style={styles.statCard}>
              <div style={styles.statGradient(theme.colors.primary.main)}></div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Applications</div>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <div style={styles.statGradient("#F59E0B")}></div>
              <div style={{...styles.statValue, color: "#F59E0B"}}>{stats.pending}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <div style={styles.statGradient("#10B981")}></div>
              <div style={{...styles.statValue, color: "#10B981"}}>{stats.approved}</div>
              <div style={styles.statLabel}>Approved</div>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <div style={styles.statGradient("#EF4444")}></div>
              <div style={{...styles.statValue, color: "#EF4444"}}>{stats.rejected}</div>
              <div style={styles.statLabel}>Rejected</div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filterContainer}>
            <span style={styles.filterLabel}>Filter by Status:</span>
            <button
              className="filter-button"
              style={styles.filterButton(filterStatus === "all")}
              onClick={() => setFilterStatus("all")}
            >
              All
            </button>
            <button
              className="filter-button"
              style={styles.filterButton(filterStatus === "pending")}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </button>
            <button
              className="filter-button"
              style={styles.filterButton(filterStatus === "approved")}
              onClick={() => setFilterStatus("approved")}
            >
              Approved
            </button>
            <button
              className="filter-button"
              style={styles.filterButton(filterStatus === "rejected")}
              onClick={() => setFilterStatus("rejected")}
            >
              Rejected
            </button>

            <div style={{width: "2px", height: "24px", background: theme.colors.border.light}}></div>

            <span style={styles.filterLabel}>Filter by Type:</span>
            <button
              className="filter-button"
              style={styles.filterButton(filterType === "all")}
              onClick={() => setFilterType("all")}
            >
              All Types
            </button>
            <button
              className="filter-button"
              style={styles.filterButton(filterType === "bazaar")}
              onClick={() => setFilterType("bazaar")}
            >
              Bazaar
            </button>
            <button
              className="filter-button"
              style={styles.filterButton(filterType === "booth")}
              onClick={() => setFilterType("booth")}
            >
              Booth
            </button>
          </div>

          {/* Applications Table */}
          {filteredApplications.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Booth Size</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <ApplicationRow
                      key={app._id}
                      app={app}
                      onUpdateStatus={handleUpdateStatus}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📋</div>
              <p style={styles.emptyStateText}>
                No applications found matching your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;