import React from "react";
import { useAuth } from "../context/AuthContext";
import theme, { getEventTypeColor, getRoleColor } from "../theme";
import Card from "../components/Card";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user, vendor, isUser, isVendor, getCurrentAccount } = useAuth();

  const currentAccount = getCurrentAccount();

  const containerStyles = {
    minHeight: "100vh",
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const contentStyles = {
    padding: theme.spacing[6],
    maxWidth: theme.layout.containerMaxWidth.xl,
    margin: "0 auto",
  };

  const headerStyles = {
    marginBottom: theme.spacing[8],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  };

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  };

  const welcomeCardStyles = {
    background: isVendor
      ? `linear-gradient(135deg, ${theme.colors.eventTypes.bazaar.main} 0%, ${theme.colors.eventTypes.bazaar.light} 100%)`
      : theme.colors.background.gradient,
    color: theme.colors.text.white,
    position: "relative",
    overflow: "hidden",
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
        message: roleMessages[user.role] || "Welcome to Campus Events Hub!",
        features: [
          "Browse upcoming events",
          "Register for events",
          "Track your registrations",
          "Manage your profile",
        ],
      };
    }

    return {
      title: "Welcome to Campus Events Hub!",
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

  const getEventTypeCards = () => {
    const eventTypes = [
      {
        key: "bazaar",
        name: "Bazaars",
        description: "Student-run markets and vendor events",
      },
      {
        key: "trip",
        name: "Trips",
        description:
          "Educational and recreational trips to Cairo, Berlin, and more",
      },
      {
        key: "workshop",
        name: "Workshops",
        description: "Skill-building sessions and training programs",
      },
      {
        key: "competition",
        name: "Competitions",
        description: "Academic and extracurricular competitions",
      },
      {
        key: "conference",
        name: "Conferences",
        description: "Academic conferences and professional meetings",
      },
    ];

    return eventTypes.map((eventType) => (
      <Card key={eventType.key} hover style={{ cursor: "pointer" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: theme.spacing[3],
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: getEventTypeColor(eventType.key),
              marginRight: theme.spacing[3],
            }}
          />
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              margin: 0,
            }}
          >
            {eventType.name}
          </h3>
        </div>
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            margin: 0,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {eventType.description}
        </p>
      </Card>
    ));
  };

  const welcomeInfo = getUserWelcomeMessage();
  const quickStats = getQuickStats();

  return (
    <div style={containerStyles}>
      <Navbar />

      <div style={contentStyles}>
        {/* Welcome Section */}
        <Card style={welcomeCardStyles}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: theme.typography.fontSize["2xl"],
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing[3],
                color: "inherit",
              }}
            >
              {welcomeInfo.title}
            </h1>
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                marginBottom: theme.spacing[4],
                color: "inherit",
                opacity: 0.9,
              }}
            >
              {welcomeInfo.message}
            </p>

            {welcomeInfo.features.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing[2],
                    color: "inherit",
                    textTransform: "uppercase",
                    letterSpacing: theme.typography.letterSpacing.wide,
                  }}
                >
                  What you can do:
                </h4>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: theme.spacing[2],
                  }}
                >
                  {welcomeInfo.features.map((feature, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: "inherit",
                        opacity: 0.9,
                      }}
                    >
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Decorative Background Elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              opacity: 0.3,
            }}
          />
        </Card>

        {/* Quick Stats */}
        {quickStats.length > 0 && (
          <div style={gridStyles}>
            {quickStats.map((stat, index) => (
              <Card key={index}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize["2xl"],
                      fontWeight: theme.typography.fontWeight.bold,
                      color: stat.color,
                      marginBottom: theme.spacing[2],
                      textTransform: "capitalize",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      textTransform: "uppercase",
                      letterSpacing: theme.typography.letterSpacing.wide,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Event Types Section */}
        <div style={headerStyles}>
          <h2 style={titleStyles}>Event Types</h2>
          <p style={subtitleStyles}>
            Explore different types of events available on campus
          </p>
        </div>

        <div style={gridStyles}>{getEventTypeCards()}</div>

        {/* Getting Started Section */}
        <Card>
          <h3
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            🚀 Getting Started
          </h3>

          <div style={{ display: "grid", gap: theme.spacing[4] }}>
            {isVendor ? (
              <>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    1. Complete Your Profile
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Add your company logo, upload required documents, and
                    complete your business profile.
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    2. Wait for Approval
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Our admin team will review your application and verify your
                    business credentials.
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    3. Start Participating
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Once approved, you can view and apply to participate in
                    relevant campus events.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    1. Explore Events
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Browse upcoming events, workshops, and activities that match
                    your interests.
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    2. Register for Events
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Sign up for events you want to attend and receive
                    confirmation details.
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    3. Stay Connected
                  </h4>
                  <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                    Get notifications about new events and updates about your
                    registrations.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
