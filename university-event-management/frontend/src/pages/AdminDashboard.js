import React, { useState, useEffect } from "react";
import { applicationServices } from "../services/api";
import theme, { getStatusColor } from "../theme";
import Button from "../components/Button";
import Card from "../components/Card";
import toast from "react-hot-toast";

const styles = {
  container: {
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    minHeight: "100vh",
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
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
  tableCard: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: 0,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: `1px solid ${theme.colors.border.light}`,
    overflow: "hidden",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: theme.colors.neutral.gray50,
  },
  th: {
    padding: theme.spacing[4],
    textAlign: "left",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    borderBottom: `2px solid ${theme.colors.border.light}`,
  },
  tr: {
    transition: "all 0.2s ease",
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  td: {
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  statusBadge: (status) => {
    const statusColors = {
      pending: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
      approved: { bg: "#D1FAE5", color: "#065F46", border: "#34D399" },
      rejected: { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
    };
    const colors = statusColors[status?.toLowerCase()] || { bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
    
    return {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      borderRadius: "12px",
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: "capitalize",
      backgroundColor: colors.bg,
      color: colors.color,
      border: `2px solid ${colors.border}`,
      display: "inline-block",
    };
  },
  typeBadge: (type) => ({
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: "12px",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "capitalize",
    backgroundColor: type === 'bazaar' ? "#EDE9FE" : "#DBEAFE",
    color: type === 'bazaar' ? "#5B21B6" : "#1E40AF",
    border: `2px solid ${type === 'bazaar' ? "#C4B5FD" : "#93C5FD"}`,
    display: "inline-block",
  }),
  actionsCell: {
    display: "flex",
    gap: theme.spacing[2],
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
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      borderRadius: "10px",
      border: `2px solid ${colors.border}`,
      background: colors.bg,
      color: colors.color,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    };
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
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

.table-row:hover {
  background: ${theme.colors.neutral.gray50} !important;
}

.action-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
}

.filter-button:hover {
  transform: translateY(-2px);
}
`;

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

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

  useEffect(() => {
    fetchApplications();
  }, []);

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
              <h1 style={styles.headerTitle}>Admin Dashboard</h1>
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

          {/* Table */}
          <div style={styles.tableCard}>
            {filteredApplications.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>Applicant</th>
                      <th style={styles.th}>Event</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="table-row" style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{fontWeight: theme.typography.fontWeight.semibold}}>
                            {app.vendor?.companyName || "N/A"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          {app.applicationType === 'bazaar' 
                            ? app.bazaar?.name || app.bazaar?.startDate?.substring(0, 10) || "N/A" 
                            : "Standalone Booth"}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.typeBadge(app.applicationType)}>
                            {app.applicationType}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(app.status)}>
                            {app.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionsCell}>
                            <button
                              className="action-button"
                              style={{
                                ...styles.actionButton("approve"),
                                ...(app.status === "approved" ? styles.disabledButton : {})
                              }}
                              onClick={() => handleUpdateStatus(app.applicationType, app._id, "approved")}
                              disabled={app.status === "approved"}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="action-button"
                              style={{
                                ...styles.actionButton("reject"),
                                ...(app.status === "rejected" ? styles.disabledButton : {})
                              }}
                              onClick={() => handleUpdateStatus(app.applicationType, app._id, "rejected")}
                              disabled={app.status === "rejected"}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
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
      </div>
    </>
  );
};

export default AdminDashboard;