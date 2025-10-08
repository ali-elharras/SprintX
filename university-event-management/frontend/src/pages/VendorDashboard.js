import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventServices, applicationServices } from "../services/api";
import toast from "react-hot-toast";
import theme from "../theme";
import ApplyBazaarModal from "../components/vendor/ApplyBazaarModal";
import ApplyBoothModal from "../components/vendor/ApplyBoothModal";
import Navbar from "../components/Navbar";

const styles = {
  pageContainer: {
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing[4],
  },
  headerText: {
    color: theme.colors.neutral.white,
  },
  headerTitle: {
    fontSize: "2.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.secondary,
    marginBottom: theme.spacing[2],
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    opacity: 0.95,
    fontWeight: theme.typography.fontWeight.medium,
  },
  requestBoothButton: {
    background: theme.colors.neutral.white,
    color: theme.colors.primary.main,
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    borderRadius: "12px",
    border: "none",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  section: {
    marginBottom: theme.spacing[10],
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing[6],
    gap: theme.spacing[3],
  },
  sectionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.neutral.white,
    fontSize: "20px",
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: "1.75rem",
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: theme.spacing[6],
  },
  card: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: `1px solid ${theme.colors.border.light}`,
    position: "relative",
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.light} 100%)`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  bazaarTitle: {
    fontSize: "1.375rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    lineHeight: 1.3,
  },
  dateContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    background: theme.colors.neutral.gray50,
    borderRadius: "8px",
    width: "fit-content",
  },
  dateIcon: {
    fontSize: "14px",
  },
  bazaarDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  bazaarDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 1.7,
    flexGrow: 1,
    marginBottom: theme.spacing[4],
  },
  applyButton: {
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: "12px",
    border: "none",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  appliedButton: {
    background: theme.colors.neutral.gray200,
    color: theme.colors.neutral.gray600,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  applicationList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4],
  },
  applicationCard: {
    background: theme.colors.neutral.white,
    borderRadius: "16px",
    padding: theme.spacing[5],
    boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
    border: `1px solid ${theme.colors.border.light}`,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  applicationDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statusBadge: (status) => {
    const statusColors = {
      pending: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
      approved: { bg: "#D1FAE5", color: "#065F46", border: "#34D399" },
      rejected: { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
      confirmed: { bg: "#DBEAFE", color: "#1E40AF", border: "#60A5FA" },
    };
    const colors = statusColors[status?.toLowerCase()] || { bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
    
    return {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderRadius: "20px",
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: "capitalize",
      backgroundColor: colors.bg,
      color: colors.color,
      border: `2px solid ${colors.border}`,
      display: "inline-block",
    };
  },
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    border: `2px dashed ${theme.colors.border.light}`,
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

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}

.card-hover:hover .card-gradient {
  opacity: 1 !important;
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.request-booth-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
}

.application-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 25px rgba(0,0,0,0.08) !important;
  border-color: ${theme.colors.primary.light} !important;
}
`;

const BazaarCard = ({ bazaar, onApply, isApplied }) => (
  <div className="card-hover" style={styles.card}>
    <div className="card-gradient" style={styles.cardGradient}></div>
    <div>
      <h3 style={styles.bazaarTitle}>{bazaar.name || bazaar.title}</h3>
      <div style={styles.dateContainer}>
        <span style={styles.dateIcon}>📅</span>
        <p style={styles.bazaarDate}>
          {new Date(bazaar.startDate).toLocaleDateString()} - {new Date(bazaar.endDate).toLocaleDateString()}
        </p>
      </div>
      <p style={styles.bazaarDescription}>{bazaar.description}</p>
    </div>
    {isApplied ? (
      <button style={{...styles.applyButton, ...styles.appliedButton}} disabled>
        ✓ Applied
      </button>
    ) : (
      <button className="apply-button" style={styles.applyButton} onClick={() => onApply(bazaar)}>
        Apply to Bazaar →
      </button>
    )}
  </div>
);

const ApplicationItem = ({ application }) => (
  <div className="application-card" style={styles.applicationCard}>
    <div style={styles.applicationInfo}>
      <p style={styles.applicationTitle}>
        {application.bazaar?.name || application.bazaar?.title || "Booth Request"}
      </p>
      <p style={styles.applicationDate}>
        Applied on: {new Date(application.createdAt).toLocaleDateString()}
      </p>
    </div>
    <span style={styles.statusBadge(application.status)}>
      {application.status}
    </span>
  </div>
);

const ParticipationItem = ({ participation }) => (
  <div className="application-card" style={styles.applicationCard}>
    <div style={styles.applicationInfo}>
      <p style={styles.applicationTitle}>
        {participation.bazaar?.name || participation.bazaar?.title || "Booth Event"}
      </p>
      <p style={styles.applicationDate}>
        Event Date: {new Date(participation.bazaar.startDate).toLocaleDateString()}
      </p>
    </div>
    <span style={styles.statusBadge(participation.status)}>
      {participation.status}
    </span>
  </div>
);

const VendorDashboard = () => {
  const { vendor } = useAuth();
  const [upcomingBazaars, setUpcomingBazaars] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState({ bazaars: true, applications: true, participations: true });
  const [error, setError] = useState({ bazaars: null, applications: null, participations: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [selectedBazaar, setSelectedBazaar] = useState(null);

  const fetchBazaars = async () => {
    try {
      setLoading(prev => ({ ...prev, bazaars: true }));
      const data = await eventServices.getUpcomingBazaars();
      setUpcomingBazaars(data.data || []);
      setError(prev => ({ ...prev, bazaars: null }));
    } catch (err) {
      console.error("Error fetching bazaars:", err);
      setError(prev => ({ ...prev, bazaars: err.message || "Failed to fetch bazaars" }));
      toast.error("Could not load upcoming bazaars.");
    } finally {
      setLoading(prev => ({ ...prev, bazaars: false }));
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(prev => ({ ...prev, applications: true }));
      const response = await applicationServices.getMyRequests();
      const applications = (response.data.bazaars || []).concat(response.data.booths || []);
      setMyApplications(applications);
    } catch (err) {
      setError(prev => ({ ...prev, applications: err.message || "Failed to fetch applications" }));
      toast.error("Could not load your applications.");
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const fetchParticipations = async () => {
    try {
      setLoading(prev => ({ ...prev, participations: true }));
      const response = await applicationServices.getMyParticipations();
      const participations = (response.data.bazaars || []).concat(response.data.booths || []);
      setMyParticipations(participations);
    } catch (err) {
      setError(prev => ({ ...prev, participations: err.message || "Failed to fetch participations" }));
      toast.error("Could not load your participations.");
    } finally {
      setLoading(prev => ({ ...prev, participations: false }));
    }
  };

  useEffect(() => {
    fetchBazaars();
    fetchApplications();
    fetchParticipations();
  }, []);

  const handleApplyClick = (bazaar) => {
    setSelectedBazaar(bazaar);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBazaar(null);
  };

  const handleApplicationSubmit = async (applicationData) => {
    if (!selectedBazaar) return;
    try {
      const response = await applicationServices.applyToBazaar(selectedBazaar._id, applicationData);
      toast.success(response.message || "Successfully applied to bazaar!");
      handleModalClose();
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Application failed.");
    }
  };

  const handleBoothApplicationSubmit = async (applicationData) => {
    try {
      const response = await applicationServices.applyForBooth(applicationData);
      toast.success(response.message || "Successfully applied for booth!");
      setIsBoothModalOpen(false);
      fetchApplications();
      fetchParticipations();
    } catch (err) {
      toast.error(err.message || "Booth application failed.");
    }
  };

  const appliedBazaarIds = new Set(
    myApplications
      .filter(app => app.bazaar && app.bazaar._id)
      .map(app => String(app.bazaar._id))
  );

  return (
    <>
      <Navbar />
      <style>{cssKeyframes}</style>
      <div style={styles.pageContainer}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.contentWrapper}>
          <div style={styles.headerContainer}>
            <div style={styles.headerGlow}></div>
            <div style={styles.headerContent}>
              <div style={styles.headerText}>
                <h1 style={styles.headerTitle}>Vendor Dashboard</h1>
                <p style={styles.headerSubtitle}>Welcome back, {vendor?.businessName || "Vendor"}! 👋</p>
              </div>
              <button 
                className="request-booth-button"
                style={styles.requestBoothButton}
                onClick={() => setIsBoothModalOpen(true)}
              >
                <span>🏪</span>
                Request Standalone Booth
              </button>
            </div>
          </div>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>🎪</div>
              <h2 style={styles.sectionTitle}>Upcoming Bazaars</h2>
            </div>
            {loading.bazaars ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
              </div>
            ) : error.bazaars ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>⚠️</div>
                <p style={styles.emptyStateText}>{error.bazaars}</p>
              </div>
            ) : upcomingBazaars.length > 0 ? (
              <div style={styles.grid}>
                {upcomingBazaars.map((bazaar) => (
                  <BazaarCard 
                    key={bazaar._id} 
                    bazaar={bazaar} 
                    onApply={handleApplyClick} 
                    isApplied={appliedBazaarIds.has(String(bazaar._id))}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🎪</div>
                <p style={styles.emptyStateText}>No upcoming bazaars at the moment</p>
              </div>
            )}
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>📍</div>
              <h2 style={styles.sectionTitle}>My Upcoming Participations</h2>
            </div>
            {loading.participations ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
              </div>
            ) : error.participations ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>⚠️</div>
                <p style={styles.emptyStateText}>{error.participations}</p>
              </div>
            ) : myParticipations.length > 0 ? (
              <div style={styles.applicationList}>
                {myParticipations.map((app) => (
                  <ParticipationItem key={app._id} participation={app} />
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📋</div>
                <p style={styles.emptyStateText}>You have no upcoming participations</p>
              </div>
            )}
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>📝</div>
              <h2 style={styles.sectionTitle}>My Applications</h2>
            </div>
            {loading.applications ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
              </div>
            ) : error.applications ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>⚠️</div>
                <p style={styles.emptyStateText}>{error.applications}</p>
              </div>
            ) : myApplications.length > 0 ? (
              <div style={styles.applicationList}>
                {myApplications.map((app) => (
                  <ApplicationItem key={app._id} application={app} />
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📄</div>
                <p style={styles.emptyStateText}>You have not submitted any applications yet</p>
              </div>
            )}
          </section>
        </div>

        {selectedBazaar && (
          <ApplyBazaarModal
            bazaar={selectedBazaar}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleApplicationSubmit}
          />
        )}

        <ApplyBoothModal 
          isOpen={isBoothModalOpen}
          onClose={() => setIsBoothModalOpen(false)}
          onSubmit={handleBoothApplicationSubmit}
        />
      </div>
    </>
  );
};

export default VendorDashboard;