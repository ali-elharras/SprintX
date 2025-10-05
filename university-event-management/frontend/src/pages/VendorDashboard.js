
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventServices, applicationServices } from "../services/api";
import toast from "react-hot-toast";
import theme from "../theme";
import ApplyBazaarModal from "../components/vendor/ApplyBazaarModal";
import ApplyBoothModal from "../components/vendor/ApplyBoothModal";

// --- Reusable Styled Components ---

const styles = {
  pageContainer: {
    background: theme.colors.background.default,
    minHeight: "100vh",
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
    fontFamily: theme.typography.fontFamily.primary,
  },
  header: {
    ...theme.typography.h2,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
    borderBottom: `2px solid ${theme.colors.border.light}`,
    paddingBottom: theme.spacing[4],
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: theme.spacing[6],
  },
  card: {
    ...theme.components.card.base,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.ease}`,
  },
  cardHover: {
    "&:hover": {
      ...theme.components.card.hover,
    },
  },
  bazaarTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.dark,
    marginBottom: theme.spacing[2],
  },
  bazaarDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  bazaarDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    flexGrow: 1,
  },
  button: {
    ...theme.components.button.primary,
    marginTop: theme.spacing[4],
    width: "100%",
  },
  applicationItem: {
    ...theme.components.card.base,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  statusBadge: (status) => ({
    ...theme.components.badge.base,
    backgroundColor: theme.colors.status[status.toLowerCase()] || theme.colors.neutral.gray200,
    color: theme.colors.neutral.white,
  }),
  loadingText: {
    color: theme.colors.text.secondary,
    textAlign: "center",
    padding: theme.spacing[8],
  },
  errorText: {
    color: theme.colors.error.main,
    textAlign: "center",
    padding: theme.spacing[8],
  },
};

// --- Helper Components ---

const BazaarCard = ({ bazaar, onApply, isApplied }) => (
  <div style={{ ...styles.card, ...styles.cardHover }}>
    <div>
      <h3 style={styles.bazaarTitle}>{bazaar.name || bazaar.title}</h3>
      <p style={styles.bazaarDate}>
        {new Date(bazaar.startDate).toLocaleDateString()} - {new Date(bazaar.endDate).toLocaleDateString()}
      </p>
      <p style={styles.bazaarDescription}>{bazaar.description}</p>
    </div>
    {isApplied ? (
        <button style={{...styles.button, background: theme.colors.neutral.gray400, cursor: 'not-allowed'}} disabled>
            Applied
        </button>
    ) : (
        <button style={styles.button} onClick={() => onApply(bazaar)}>
            Apply to this Bazaar
        </button>
    )}
  </div>
);

const ApplicationItem = ({ application }) => (
  <div style={styles.applicationItem}>
    <div>
      <p style={{ fontWeight: theme.typography.fontWeight.medium }}>
        {application.bazaar?.name || application.bazaar?.title || "Booth Request"}
      </p>
      <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
        Applied on: {new Date(application.createdAt).toLocaleDateString()}
      </p>
    </div>
    <span style={styles.statusBadge(application.status)}>
      {application.status}
    </span>
  </div>
);

const ParticipationItem = ({ participation }) => (
    <div style={styles.applicationItem}>
        <div>
            <p style={{ fontWeight: theme.typography.fontWeight.medium }}>
                {participation.bazaar?.name || participation.bazaar?.title || "Booth Event"}
            </p>
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                Event Date: {new Date(participation.bazaar.startDate).toLocaleDateString()}
            </p>
        </div>
        <span style={styles.statusBadge(participation.status)}>
            {participation.status}
        </span>
    </div>
);

// --- Main Page Component ---

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
      fetchApplications(); // Refresh applications to show the new one
    } catch (err) {
      toast.error(err.message || "Application failed.");
    }
  };

  const handleBoothApplicationSubmit = async (applicationData) => {
    try {
      const response = await applicationServices.applyForBooth(applicationData);
      toast.success(response.message || "Successfully applied for booth!");
      setIsBoothModalOpen(false);
      fetchApplications(); // Refresh applications to show the new one
      fetchParticipations();
    } catch (err) {
      toast.error(err.message || "Booth application failed.");
    }
  };

  const appliedBazaarIds = new Set(myApplications.map(app => app.bazaar?._id));

  return (
    <div style={styles.pageContainer}>
      <header style={{...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2>Vendor Dashboard</h2>
          <p>Welcome, {vendor?.businessName || "Vendor"}!</p>
        </div>
        <button 
          style={{...styles.button, width: 'auto', marginTop: 0}}
          onClick={() => setIsBoothModalOpen(true)}
        >
          Request a Standalone Booth
        </button>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Upcoming Bazaars</h2>
        {loading.bazaars ? (
          <p style={styles.loadingText}>Loading Bazaars...</p>
        ) : error.bazaars ? (
          <p style={styles.errorText}>{error.bazaars}</p>
        ) : (
          <div style={styles.grid}>
            {upcomingBazaars.length > 0 ? (
              upcomingBazaars.map((bazaar) => (
                <BazaarCard 
                  key={bazaar._id} 
                  bazaar={bazaar} 
                  onApply={handleApplyClick} 
                  isApplied={appliedBazaarIds.has(bazaar._id)}
                />
              ))
            ) : (
              <p>No upcoming bazaars at the moment.</p>
            )}
          </div>
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>My Upcoming Participations</h2>
        {loading.participations ? (
          <p style={styles.loadingText}>Loading Participations...</p>
        ) : error.participations ? (
          <p style={styles.errorText}>{error.participations}</p>
        ) : (
          <div>
            {myParticipations.length > 0 ? (
              myParticipations.map((app) => (
                <ParticipationItem key={app._id} participation={app} />
              ))
            ) : (
              <p>You have no upcoming participations.</p>
            )}
          </div>
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>My Applications</h2>
        {loading.applications ? (
          <p style={styles.loadingText}>Loading Applications...</p>
        ) : error.applications ? (
          <p style={styles.errorText}>{error.applications}</p>
        ) : (
          <div>
            {myApplications.length > 0 ? (
              myApplications.map((app) => (
                <ApplicationItem key={app._id} application={app} />
              ))
            ) : (
              <p>You have not submitted any applications yet.</p>
            )}
          </div>
        )}
      </section>

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
  );
};

export default VendorDashboard;
