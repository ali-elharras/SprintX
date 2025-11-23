import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import theme, { getEventTypeColor, getRoleColor } from "../theme";
import Card from "../components/Card";

import axios from "axios";
import { 
  Calendar, 
  CreditCard, 
  Dumbbell, 
  Heart, 
  Trophy, 
  Wallet as WalletIcon,
  ArrowRight,
  Bell,
  TrendingUp
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
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
  content: {
    position: "relative",
    zIndex: 1,
    padding: theme.spacing[6],
    maxWidth: theme.layout.containerMaxWidth.xl,
    margin: "0 auto",
  },
  welcomeCard: (isVendor) => ({
    background: isVendor
      ? `linear-gradient(135deg, ${theme.colors.eventTypes.bazaar.main} 0%, ${theme.colors.eventTypes.bazaar.dark} 100%)`
      : `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.text.white,
    position: "relative",
    overflow: "hidden",
    padding: theme.spacing[8],
    borderRadius: "24px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset",
    marginBottom: theme.spacing[8],
  }),
  welcomeGlow: {
    position: "absolute",
    top: "-50%",
    right: "-20%",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  welcomeContent: {
    position: "relative",
    zIndex: 2,
  },
  welcomeTitle: {
    fontSize: "2.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[3],
    color: "inherit",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  welcomeMessage: {
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing[6],
    color: "inherit",
    opacity: 0.95,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  featuresSection: {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: theme.spacing[5],
    backdropFilter: "blur(10px)",
  },
  featuresTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[4],
    color: "inherit",
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing[3],
  },
  featureItem: {
    fontSize: theme.typography.fontSize.sm,
    color: "inherit",
    opacity: 0.95,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  featureIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },
  decorCircle1: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    opacity: 0.5,
  },
  decorCircle2: {
    position: "absolute",
    bottom: "-50px",
    left: "-50px",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    opacity: 0.3,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
  statGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  statValue: (color) => ({
    fontSize: "2.25rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: color,
    marginBottom: theme.spacing[2],
    textTransform: "capitalize",
  }),
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    fontWeight: theme.typography.fontWeight.medium,
  },
  sectionHeader: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: "1.875rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  eventTypesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  eventTypeCard: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: `1px solid ${theme.colors.border.light}`,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  eventTypeHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  eventTypeDot: (color) => ({
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: color,
    marginRight: theme.spacing[3],
    boxShadow: `0 0 0 4px ${color}20`,
  }),
  eventTypeName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  },
  eventTypeDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  gettingStartedCard: {
    background: theme.colors.neutral.white,
    borderRadius: "24px",
    padding: theme.spacing[8],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: `1px solid ${theme.colors.border.light}`,
  },
  gettingStartedTitle: {
    fontSize: "1.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  stepsGrid: {
    display: "grid",
    gap: theme.spacing[6],
  },
  stepCard: {
    padding: theme.spacing[5],
    borderRadius: "16px",
    background: theme.colors.neutral.gray50,
    transition: "all 0.3s ease",
    border: `2px solid transparent`,
  },
  stepNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    marginRight: theme.spacing[3],
  },
  stepTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    display: "flex",
    alignItems: "center",
  },
  stepDescription: {
    color: theme.colors.text.secondary,
    margin: 0,
    lineHeight: theme.typography.lineHeight.relaxed,
    paddingLeft: "44px",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  actionCard: (color) => ({
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: `2px solid ${theme.colors.border.light}`,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
  }),
  actionIcon: (color) => ({
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    background: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
    flexShrink: 0,
    transition: "all 0.3s ease",
  }),
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    marginBottom: theme.spacing[1],
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  actionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  },
  actionArrow: {
    color: theme.colors.text.tertiary,
    flexShrink: 0,
    transition: "all 0.3s ease",
  },
  exclusiveBadge: {
    fontSize: theme.typography.fontSize.xs,
    padding: "4px 8px",
    borderRadius: "6px",
    background: `${theme.colors.eventTypes.competition.main}20`,
    color: theme.colors.eventTypes.competition.main,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  widgetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  widgetCard: {
    background: theme.colors.neutral.white,
    borderRadius: "20px",
    padding: theme.spacing[6],
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: `1px solid ${theme.colors.border.light}`,
    transition: "all 0.3s ease",
  },
  widgetHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  widgetIconWrapper: (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
  }),
  widgetTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  },
  widgetBody: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4],
  },
  widgetValue: {
    fontSize: "2.5rem",
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: 1,
  },
  widgetLoading: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    padding: theme.spacing[4],
    textAlign: "center",
  },
  widgetEmpty: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    padding: theme.spacing[2],
  },
  widgetDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  widgetButton: (color) => ({
    background: color,
    color: theme.colors.neutral.white,
    border: "none",
    borderRadius: "12px",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: "center",
  }),
  widgetList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2],
  },
  widgetListItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  widgetEventDot: (color) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: color,
    flexShrink: 0,
  }),
  widgetEventName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

const cssKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}

.stat-card:hover .stat-gradient {
  opacity: 1 !important;
}

.event-type-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
  border-color: ${theme.colors.primary.light} !important;
}

.step-card:hover {
  background: ${theme.colors.neutral.white} !important;
  border-color: ${theme.colors.primary.light} !important;
  transform: translateX(8px);
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
  color: ${theme.colors.primary.main} !important;
}

.widget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important;
}

.widget-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0.9;
}

.welcome-card {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, vendor, isUser, isVendor, getCurrentAccount } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isUser && user?.role === "student") {
      fetchStudentData();
    } else {
      setLoadingData(false);
    }
  }, [isUser, user]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch wallet balance
      const walletRes = await axios.get(
        "http://localhost:5000/api/wallet",
        config
      );
      setWalletBalance(walletRes.data.balance || 0);

      // Fetch registrations
      const regRes = await axios.get(
        "http://localhost:5000/api/registrations/user",
        config
      );
      
      // Filter upcoming registrations
      const now = new Date();
      const upcoming = regRes.data.filter(reg => {
        const eventDate = new Date(reg.event?.date);
        return eventDate > now && reg.status === "confirmed";
      }).slice(0, 3);
      
      setUpcomingRegistrations(upcoming);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getUserWelcomeMessage = () => {
    if (isVendor && vendor) {
      return {
        title: `Welcome, ${vendor.companyName}!`,
        message: `Your vendor account is currently ${
          vendor.verificationStatus
        }. ${
          vendor.verificationStatus === "approved"
            ? "You can now participate in university events!"
            : "Please wait for admin approval to access all features."
        }`,
        features: [
          "View available events",
          "Submit participation requests",
          "Manage company profile",
          "Track application status",
        ],
      };
    } else if (isUser && user) {
      const roleMessages = {
        student:
          "Discover events, workshops, and activities designed for students.",
        staff:
          "Access staff events, training sessions, and university activities.",
        ta: "Find TA-specific events, workshops, and professional development opportunities.",
        professor:
          "Propose academic events, manage workshops, and access faculty resources.",
        admin: "Manage all aspects of the university event system.",
        events_office:
          "Oversee event planning, approvals, and campus activities.",
      };

      return {
        title: `Welcome, ${user.firstName}!`,
        message: roleMessages[user.role] || "Welcome to SprintX!",
        features: [
          "Browse upcoming events",
          "Register for events",
          "View your registrations",
          "Manage your profile",
        ],
      };
    }

    return {
      title: "Welcome to SprintX!",
      message: "Your gateway to university events and activities.",
      features: [],
    };
  };

  const getQuickStats = () => {
    if (isVendor) {
      return [
        {
          label: "Verification Status",
          value: vendor?.verificationStatus || "Unknown",
          color: theme.colors.status.pending,
        },
        {
          label: "Interested Events",
          value: vendor?.interestedEventTypes?.length || 0,
          color: theme.colors.eventTypes.bazaar.main,
        },
        {
          label: "Company Size",
          value: vendor?.companySize || "Not specified",
          color: theme.colors.primary.main,
        },
        {
          label: "Industry",
          value: vendor?.industry || "Not specified",
          color: theme.colors.secondary.main,
        },
      ];
    } else if (isUser) {
      return [
        {
          label: "Role",
          value: user?.role || "Unknown",
          color: getRoleColor(user?.role),
        },
        {
          label: "Department",
          value: user?.department || "Not specified",
          color: theme.colors.primary.main,
        },
        {
          label: "University ID",
          value: user?.universityId || "Not specified",
          color: theme.colors.secondary.main,
        },
        {
          label: "Account Status",
          value: user?.isVerified ? "Verified" : "Unverified",
          color: user?.isVerified
            ? theme.colors.success.main
            : theme.colors.warning.main,
        },
      ];
    }

    return [];
  };

  const eventTypes = [
    {
      key: "bazaar",
      name: "Bazaars",
      icon: "🎪",
      description: "Student-run markets and vendor events",
    },
    {
      key: "trip",
      name: "Trips",
      icon: "✈️",
      description:
        "Educational and recreational trips to Cairo, Berlin, and more",
    },
    {
      key: "workshop",
      name: "Workshops",
      icon: "🛠️",
      description: "Skill-building sessions and training programs",
    },
    {
      key: "competition",
      name: "Competitions",
      icon: "🏆",
      description: "Academic and extracurricular competitions",
    },
    {
      key: "conference",
      name: "Conferences",
      icon: "🎤",
      description: "Academic conferences and professional meetings",
    },
  ];

  const welcomeInfo = getUserWelcomeMessage();
  const quickStats = getQuickStats();

  return (
    <>
      <style>{cssKeyframes}</style>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>


        <div style={styles.content}>
          {/* Welcome Card */}
          <div className="welcome-card" style={styles.welcomeCard(isVendor)}>
            <div style={styles.welcomeGlow}></div>
            <div style={styles.decorCircle1}></div>
            <div style={styles.decorCircle2}></div>

            <div style={styles.welcomeContent}>
              <h1 style={styles.welcomeTitle}>{welcomeInfo.title}</h1>
              <p style={styles.welcomeMessage}>{welcomeInfo.message}</p>

              {welcomeInfo.features.length > 0 && (
                <div style={styles.featuresSection}>
                  <h4 style={styles.featuresTitle}>What you can do:</h4>
                  <ul style={styles.featuresList}>
                    {welcomeInfo.features.map((feature, index) => (
                      <li key={index} style={styles.featureItem}>
                        <span style={styles.featureIcon}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {quickStats.length > 0 && (
            <div style={styles.statsGrid}>
              {quickStats.map((stat, index) => (
                <div key={index} className="stat-card" style={styles.statCard}>
                  <div
                    className="stat-gradient"
                    style={{
                      ...styles.statGradient,
                      background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                    }}
                  ></div>
                  <div style={styles.statValue(stat.color)}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions - Student Only */}
          {isUser && user?.role === "student" && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
                <p style={styles.sectionSubtitle}>
                  Jump right into what you need to do
                </p>
              </div>

              <div style={styles.quickActionsGrid}>
                <div
                  className="action-card"
                  style={styles.actionCard(theme.colors.primary.main)}
                  onClick={() => navigate("/events")}
                >
                  <div style={styles.actionIcon(theme.colors.primary.main)}>
                    <Calendar size={28} />
                  </div>
                  <div style={styles.actionContent}>
                    <h3 style={styles.actionTitle}>Browse Events</h3>
                    <p style={styles.actionDescription}>
                      Find workshops, trips, and activities
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    style={styles.actionArrow}
                    className="action-arrow"
                  />
                </div>

                <div
                  className="action-card"
                  style={styles.actionCard(theme.colors.eventTypes.competition.main)}
                  onClick={() => navigate("/courts")}
                >
                  <div style={styles.actionIcon(theme.colors.eventTypes.competition.main)}>
                    <Trophy size={28} />
                  </div>
                  <div style={styles.actionContent}>
                    <h3 style={styles.actionTitle}>
                      Book a Court{" "}
                      <span style={styles.exclusiveBadge}>Student Only</span>
                    </h3>
                    <p style={styles.actionDescription}>
                      Reserve tennis, basketball & more
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    style={styles.actionArrow}
                    className="action-arrow"
                  />
                </div>

                <div
                  className="action-card"
                  style={styles.actionCard(theme.colors.eventTypes.workshop.main)}
                  onClick={() => navigate("/gym-schedule")}
                >
                  <div style={styles.actionIcon(theme.colors.eventTypes.workshop.main)}>
                    <Dumbbell size={28} />
                  </div>
                  <div style={styles.actionContent}>
                    <h3 style={styles.actionTitle}>Gym Schedule</h3>
                    <p style={styles.actionDescription}>
                      View fitness classes & sessions
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    style={styles.actionArrow}
                    className="action-arrow"
                  />
                </div>

                <div
                  className="action-card"
                  style={styles.actionCard(theme.colors.secondary.main)}
                  onClick={() => navigate("/my-registrations")}
                >
                  <div style={styles.actionIcon(theme.colors.secondary.main)}>
                    <Bell size={28} />
                  </div>
                  <div style={styles.actionContent}>
                    <h3 style={styles.actionTitle}>My Registrations</h3>
                    <p style={styles.actionDescription}>
                      View all your bookings & events
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    style={styles.actionArrow}
                    className="action-arrow"
                  />
                </div>
              </div>

              {/* Student Widgets */}
              <div style={styles.widgetsGrid}>
                {/* Wallet Widget */}
                <div style={styles.widgetCard} className="widget-card">
                  <div style={styles.widgetHeader}>
                    <div style={styles.widgetIconWrapper(theme.colors.success.main)}>
                      <WalletIcon size={24} />
                    </div>
                    <h3 style={styles.widgetTitle}>Wallet Balance</h3>
                  </div>
                  <div style={styles.widgetBody}>
                    {loadingData ? (
                      <div style={styles.widgetLoading}>Loading...</div>
                    ) : (
                      <>
                        <div style={styles.widgetValue}>
                          ${walletBalance.toFixed(2)}
                        </div>
                        <button
                          onClick={() => navigate("/wallet")}
                          style={styles.widgetButton(theme.colors.success.main)}
                          className="widget-button"
                        >
                          Manage Wallet
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Upcoming Events Widget */}
                <div style={styles.widgetCard} className="widget-card">
                  <div style={styles.widgetHeader}>
                    <div style={styles.widgetIconWrapper(theme.colors.primary.main)}>
                      <Calendar size={24} />
                    </div>
                    <h3 style={styles.widgetTitle}>Upcoming Events</h3>
                  </div>
                  <div style={styles.widgetBody}>
                    {loadingData ? (
                      <div style={styles.widgetLoading}>Loading...</div>
                    ) : upcomingRegistrations.length > 0 ? (
                      <>
                        <div style={styles.widgetValue}>
                          {upcomingRegistrations.length}
                        </div>
                        <div style={styles.widgetList}>
                          {upcomingRegistrations.map((reg, idx) => (
                            <div key={idx} style={styles.widgetListItem}>
                              <span style={styles.widgetEventDot(
                                getEventTypeColor(reg.event?.type)
                              )}></span>
                              <span style={styles.widgetEventName}>
                                {reg.event?.title || "Event"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate("/my-registrations")}
                          style={styles.widgetButton(theme.colors.primary.main)}
                          className="widget-button"
                        >
                          View All
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={styles.widgetEmpty}>No upcoming events</div>
                        <button
                          onClick={() => navigate("/events")}
                          style={styles.widgetButton(theme.colors.primary.main)}
                          className="widget-button"
                        >
                          Browse Events
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Favorites Widget */}
                <div style={styles.widgetCard} className="widget-card">
                  <div style={styles.widgetHeader}>
                    <div style={styles.widgetIconWrapper(theme.colors.error.main)}>
                      <Heart size={24} />
                    </div>
                    <h3 style={styles.widgetTitle}>Saved Events</h3>
                  </div>
                  <div style={styles.widgetBody}>
                    <div style={styles.widgetDescription}>
                      Keep track of events you're interested in
                    </div>
                    <button
                      onClick={() => navigate("/favorites")}
                      style={styles.widgetButton(theme.colors.error.main)}
                      className="widget-button"
                    >
                      View Favorites
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Event Types Section */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Event Types</h2>
            <p style={styles.sectionSubtitle}>
              Explore different types of events available on campus
            </p>
          </div>

          <div style={styles.eventTypesGrid}>
            {eventTypes.map((eventType) => (
              <div
                key={eventType.key}
                className="event-type-card"
                style={styles.eventTypeCard}
              >
                <div style={styles.eventTypeHeader}>
                  <div
                    style={styles.eventTypeDot(
                      getEventTypeColor(eventType.key)
                    )}
                  ></div>
                  <h3 style={styles.eventTypeName}>
                    {eventType.icon} {eventType.name}
                  </h3>
                </div>
                <p style={styles.eventTypeDescription}>
                  {eventType.description}
                </p>
              </div>
            ))}
          </div>

          {/* Getting Started Section */}
          <div style={styles.gettingStartedCard}>
            <h3 style={styles.gettingStartedTitle}>
              <span>🚀</span>
              <span>Getting Started</span>
            </h3>

            <div style={styles.stepsGrid}>
              {isVendor ? (
                <>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>1</span>
                      Complete Your Profile
                    </h4>
                    <p style={styles.stepDescription}>
                      Add your company logo, upload required documents, and
                      complete your business profile.
                    </p>
                  </div>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>2</span>
                      Wait for Approval
                    </h4>
                    <p style={styles.stepDescription}>
                      Our admin team will review your application and verify
                      your business credentials.
                    </p>
                  </div>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>3</span>
                      Start Participating
                    </h4>
                    <p style={styles.stepDescription}>
                      Once approved, you can view and apply to participate in
                      relevant campus events.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>1</span>
                      Explore Events
                    </h4>
                    <p style={styles.stepDescription}>
                      Browse upcoming events, workshops, and activities that
                      match your interests.
                    </p>
                  </div>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>2</span>
                      Register for Events
                    </h4>
                    <p style={styles.stepDescription}>
                      Sign up for events you want to attend and receive
                      confirmation details.
                    </p>
                  </div>
                  <div className="step-card" style={styles.stepCard}>
                    <h4 style={styles.stepTitle}>
                      <span style={styles.stepNumber}>3</span>
                      Stay Connected
                    </h4>
                    <p style={styles.stepDescription}>
                      Get notifications about new events and updates about your
                      registrations.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
