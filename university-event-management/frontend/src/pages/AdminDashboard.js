import React, { useState, useEffect } from "react";
import { applicationServices } from "../services/api";
import theme from "../theme";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

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
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  applicationCard: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: `1px solid ${theme.colors.border.light}`,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  cardTopBar: (color) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
  }),
  cardHeader: {
    marginBottom: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  companyName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  bazaarTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  badgeContainer: {
    display: "flex",
    gap: theme.spacing[2],
    flexWrap: "wrap",
    marginBottom: theme.spacing[4],
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
  cardDetails: {
    marginBottom: theme.spacing[4],
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: `${theme.spacing[2]} 0`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "right",
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
    display: "flex",
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
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
      <Navbar />
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

          {/* Cards Grid */}
          {filteredApplications.length > 0 ? (
            <div style={styles.cardsGrid}>
              {filteredApplications.map((app) => (
                <div key={app._id} className="application-card" style={styles.applicationCard}>
                  <div style={styles.cardTopBar(getStatusColor(app.status))}></div>
                  
                  <div style={styles.cardHeader}>
                    <div style={styles.companyName}>
                      {app.vendor?.companyName || "N/A"}
                    </div>
                    <div style={styles.bazaarTitle}>
                      {app.applicationType === 'bazaar' 
                        ? app.bazaar?.title || app.bazaar?.startDate?.substring(0, 10) || "N/A" 
                        : "Standalone Booth"}
                    </div>
                    <div style={styles.badgeContainer}>
                      <span style={styles.statusBadge(app.status)}>
                        {app.status}
                      </span>
                      <span style={styles.typeBadge(app.applicationType)}>
                        {app.applicationType}
                      </span>
                    </div>
                  </div>

                  <div style={styles.cardDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Booth Size</span>
                      <span style={styles.detailValue}>{app.boothSize || 'N/A'}</span>
                    </div>
                    {app.applicationType === 'booth' && app.startDate && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Start Date</span>
                        <span style={styles.detailValue}>{new Date(app.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {app.applicationType === 'booth' && app.endDate && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>End Date</span>
                        <span style={styles.detailValue}>{new Date(app.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {app.applicationType === 'booth' && app.durationWeeks && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Duration</span>
                        <span style={styles.detailValue}>{app.durationWeeks} week(s)</span>
                      </div>
                    )}
                    {app.applicationType === 'booth' && app.location && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Location</span>
                        <span style={styles.detailValue}>{app.location}</span>
                      </div>
                    )}
                    
                    {app.attendees?.length > 0 && (
                      <div style={styles.attendeesSection}>
                        <div style={styles.attendeesTitle}>
                          Attendees ({app.attendees.length})
                        </div>
                        {app.attendees.map((attendee, idx) => (
                          <div key={idx} style={styles.attendeeItem}>
                            • {attendee.name} ({attendee.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
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
                </div>
              ))}
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