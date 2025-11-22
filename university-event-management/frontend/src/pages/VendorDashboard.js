import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventServices, applicationServices, bazaarServices } from "../services/api";
import toast from "react-hot-toast";
import theme from "../theme";
import ApplyBazaarModal from "../components/vendor/ApplyBazaarModal";
import ApplyBoothModal from "../components/vendor/ApplyBoothModal";
import PaymentButton from "../components/vendor/PaymentButton";
import Navbar from "../components/Navbar";
import LoyaltyProgram from '../components/vendor/LoyaltyProgram';
import { Calendar, Store, FileText, Award, DollarSign, Clock, Search, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const styles = {
  pageContainer: {
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    minHeight: "100vh",
    padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
    fontFamily: theme.typography.fontFamily.primary,
  },
  contentWrapper: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    flexWrap: 'wrap',
    gap: theme.spacing[4],
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    borderRadius: "24px",
    padding: `${theme.spacing[6]} ${theme.spacing[6]}`,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
  headerText: {
    position: "relative",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: "2rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.white,
    margin: 0,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.white,
    opacity: 0.95,
    marginTop: theme.spacing[2],
  },
  requestBoothButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    backgroundColor: theme.colors.neutral.white,
    color: theme.colors.primary.main,
    border: 'none',
    borderRadius: '12px',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    position: "relative",
    zIndex: 1,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  statCard: {
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing[5],
    borderRadius: '16px',
    display: 'flex',
    gap: theme.spacing[4],
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: `1px solid ${theme.colors.border.light}`,
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: `0 0 ${theme.spacing[1]} 0`,
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[1]} 0`,
  },
  statTrend: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success.main,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabContainer: {
    display: 'flex',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[8],
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing[2],
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    overflowX: 'auto',
  },
  tab: {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.neutral.white,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
  },
  filterBar: {
    display: 'flex',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.neutral.white,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: `1px solid ${theme.colors.border.light}`,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  filterSelect: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.neutral.white,
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: theme.spacing[6],
  },
  card: {
    background: theme.colors.neutral.white,
    borderRadius: "16px",
    padding: theme.spacing[6],
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    border: `1px solid ${theme.colors.border.light}`,
    cursor: 'pointer',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },
  bazaarTitle: {
    fontSize: "1.25rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  bazaarDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
    marginBottom: theme.spacing[4],
  },
  applyButton: {
    width: '100%',
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: '12px',
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  appliedButton: {
    background: theme.colors.neutral.gray200,
    color: theme.colors.neutral.gray600,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  applicationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  },
  applicationCard: {
    background: theme.colors.neutral.white,
    borderRadius: '16px',
    padding: theme.spacing[5],
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    border: `1px solid ${theme.colors.border.light}`,
  },
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[3],
    flexWrap: 'wrap',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  applicationDate: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  applicationBadges: {
    display: 'flex',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
    alignItems: 'center',
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
  cancelButton: {
    background: theme.colors.error.main,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: '8px',
    border: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginTop: theme.spacing[8],
  },
  paginationButton: {
    padding: theme.spacing[2],
    backgroundColor: theme.colors.neutral.white,
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  pageNumbers: {
    display: 'flex',
    gap: theme.spacing[2],
  },
  pageNumber: {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.neutral.white,
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  pageNumberActive: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.neutral.white,
    borderColor: theme.colors.primary.main,
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

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
}

.stat-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
}
`;

// Stats Card Component
const StatCard = ({ icon, title, value, color, trend }) => (
  <div className="stat-card-hover" style={styles.statCard}>
    <div style={{ ...styles.statIcon, backgroundColor: `${color}15` }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div style={styles.statContent}>
      <p style={styles.statTitle}>{title}</p>
      <h3 style={styles.statValue}>{value}</h3>
      {trend && <span style={styles.statTrend}>{trend}</span>}
    </div>
  </div>
);

const BazaarCard = ({ bazaar, onApply, application }) => {
  const [isHovered, setIsHovered] = useState(false);
  const registrationClosed = new Date(bazaar.registrationDeadline) < new Date();
  const canApply = !application || application.status === 'rejected';

  const buttonText = registrationClosed && !application
    ? 'Registration Closed'
    : !application
    ? 'Apply to Bazaar →'
    : application.status === 'approved'
    ? '✓ Accepted Already'
    : application.status === 'rejected'
    ? 'Apply Again →'
    : application.status === 'pending'
    ? '✓ Pending Already'
    : 'Apply to Bazaar →';

  const isButtonDisabled = !canApply || (registrationClosed && !application);

  return (
    <div 
      className="card-hover" 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={styles.bazaarTitle}>{bazaar.name || bazaar.title}</h3>
      <div style={styles.dateContainer}>
        <Calendar size={16} />
        <span>
          {new Date(bazaar.startDate).toLocaleDateString()} - {new Date(bazaar.endDate).toLocaleDateString()}
        </span>
      </div>
      <p style={styles.bazaarDescription}>{bazaar.description}</p>

      <button
        style={{
          ...styles.applyButton,
          ...(isButtonDisabled ? styles.appliedButton : {}),
        }}
        onClick={() => canApply && onApply(bazaar)}
        disabled={isButtonDisabled}
      >
        {buttonText}
      </button>
    </div>
  );
};

const ApplicationItem = ({ application, onCancel }) => {
  const [cancelling, setCancelling] = React.useState(false);
  const applicationType = application.bazaar ? 'bazaar' : 'booth';
  
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this application? This action cannot be undone.')) {
      setCancelling(true);
      try {
        await applicationServices.cancelApplication(applicationType, application._id);
        toast.success('Application cancelled successfully');
        onCancel();
      } catch (error) {
        toast.error(error.message || 'Failed to cancel application');
      } finally {
        setCancelling(false);
      }
    }
  };

  const canCancel = application.paymentStatus !== 'completed' && application.status !== 'rejected';
  
  return (
    <div style={styles.applicationCard}>
      <div style={styles.applicationHeader}>
        <div style={styles.applicationInfo}>
          <p style={styles.applicationTitle}>
            {application.bazaar?.name || application.bazaar?.title || "Booth Request"}
          </p>
          <p style={styles.applicationDate}>
            <Clock size={14} />
            Applied: {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={styles.applicationBadges}>
          <span style={styles.statusBadge(application.status)}>
            {application.status}
          </span>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                ...styles.cancelButton,
                opacity: cancelling ? 0.6 : 1,
                cursor: cancelling ? 'not-allowed' : 'pointer',
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
      {application.status === 'approved' && (
        <PaymentButton application={application} applicationType={applicationType} />
      )}
    </div>
  );
};

const ParticipationItem = ({ participation }) => (
  <div style={styles.applicationCard}>
    <div style={styles.applicationHeader}>
      <div style={styles.applicationInfo}>
        <p style={styles.applicationTitle}>
          {participation.bazaar?.name || participation.bazaar?.title || "Booth Event"}
        </p>
        <p style={styles.applicationDate}>
          <MapPin size={14} />
          Event Date: {participation.bazaar ? new Date(participation.bazaar.startDate).toLocaleDateString() : new Date(participation.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span style={styles.statusBadge(participation.status)}>
        {participation.status}
      </span>
    </div>
  </div>
);

const VendorDashboard = () => {
  const { vendor } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingBazaars, setUpcomingBazaars] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [bazaarApplications, setBazaarApplications] = useState(new Map());
  const [loading, setLoading] = useState({ bazaars: true, applications: true, participations: true });
  const [error, setError] = useState({ bazaars: null, applications: null, participations: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [selectedBazaar, setSelectedBazaar] = useState(null);

  // Pagination and filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBazaars = async () => {
    try {
      setLoading(prev => ({ ...prev, bazaars: true }));
      const data = await eventServices.getUpcomingBazaars();
      setUpcomingBazaars(data.data || []);
      const applications = new Map();
      for (const bazaar of data.data) {
        try {
          const appData = await bazaarServices.getBazaarApplication(bazaar._id);
          if (appData.success) {
            applications.set(bazaar._id, appData.data);
          }
        } catch (error) {
          if (error.status !== 404) {
            console.error(`Failed to fetch application for bazaar ${bazaar._id}`, error);
          }
        }
      }
      setBazaarApplications(applications);
    } catch (err) {
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
    const application = bazaarApplications.get(bazaar._id);
    if (!application || application.status === 'rejected') {
      setSelectedBazaar(bazaar);
      setIsModalOpen(true);
    }
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
      fetchBazaars();
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

  // Filter and pagination logic
  const filteredApplications = myApplications.filter(app => 
    (filterStatus === 'all' || app.status === filterStatus) &&
    (searchQuery === '' || (app.bazaar?.name || app.bazaar?.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const stats = {
    totalApplications: myApplications.length,
    activeParticipations: myParticipations.length,
    pendingPayments: myApplications.filter(app => app.paymentStatus === 'pending').length,
    approvedApplications: myApplications.filter(app => app.status === 'approved').length,
  };

  const renderOverviewTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>Upcoming Bazaars</h2>
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
          {upcomingBazaars.slice(0, 6).map((bazaar) => (
            <BazaarCard 
              key={bazaar._id} 
              bazaar={bazaar} 
              onApply={handleApplyClick} 
              application={bazaarApplications.get(bazaar._id)}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>🎪</div>
          <p style={styles.emptyStateText}>No upcoming bazaars at the moment</p>
        </div>
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>My Applications</h2>
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={20} color={theme.colors.neutral.gray600} />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.searchInput}
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
      ) : paginatedApplications.length > 0 ? (
        <>
          <div style={styles.applicationList}>
            {paginatedApplications.map((app) => (
              <ApplicationItem 
                key={app._id} 
                application={app} 
                onCancel={() => {
                  fetchApplications();
                  fetchParticipations();
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <div style={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    style={{
                      ...styles.pageNumber,
                      ...(currentPage === page ? styles.pageNumberActive : {})
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📄</div>
          <p style={styles.emptyStateText}>
            {searchQuery || filterStatus !== 'all' 
              ? 'No applications match your filters' 
              : 'You have not submitted any applications yet'}
          </p>
        </div>
      )}
    </div>
  );

  const renderParticipationsTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>My Upcoming Participations</h2>
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
    </div>
  );

  const renderLoyaltyTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>Loyalty Program</h2>
      <LoyaltyProgram />
    </div>
  );

  return (
    <>
      <Navbar />
      <style>{cssKeyframes}</style>
      <div style={styles.pageContainer}>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.headerContainer}>
            <div style={styles.headerGlow}></div>
            <div style={styles.headerText}>
              <h1 style={styles.headerTitle}>Vendor Dashboard</h1>
              <p style={styles.headerSubtitle}>Welcome back, {vendor?.businessName || "Vendor"}! 👋</p>
            </div>
            <button 
              style={styles.requestBoothButton}
              onClick={() => setIsBoothModalOpen(true)}
            >
              <Store size={20} />
              Request Booth
            </button>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <StatCard 
              icon={<FileText size={24} />}
              title="Total Applications"
              value={stats.totalApplications}
              color={theme.colors.primary.main}
              trend={`${stats.approvedApplications} approved`}
            />
            <StatCard 
              icon={<Calendar size={24} />}
              title="Active Events"
              value={stats.activeParticipations}
              color={theme.colors.success.main}
            />
            <StatCard 
              icon={<DollarSign size={24} />}
              title="Pending Payments"
              value={stats.pendingPayments}
              color={theme.colors.warning.main}
              trend={stats.pendingPayments > 0 ? `${stats.pendingPayments} due` : 'All paid'}
            />
            <StatCard 
              icon={<Award size={24} />}
              title="Status"
              value="Active"
              color={theme.colors.primary.main}
              trend="Good standing"
            />
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            {['overview', 'applications', 'participations', 'loyalty'].map(tab => (
              <button
                key={tab}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab ? styles.activeTab : {})
                }}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'applications' && renderApplicationsTab()}
          {activeTab === 'participations' && renderParticipationsTab()}
          {activeTab === 'loyalty' && renderLoyaltyTab()}
        </div>

        {/* Modals */}
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