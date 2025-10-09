import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registrationAPI } from "../services/api";
import theme from "../theme";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import RegistrationCard from "../components/RegistrationCard";
import toast from "react-hot-toast";

const MyRegistrations = () => {
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState({ upcoming: [], past: [] });
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [instructor, setInstructor] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Event type options for filtering
  const eventTypeOptions = [
    { value: "all", label: "All Events" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "competition", label: "Competitions" },
    { value: "conference", label: "Conferences" },
  ];

  // Sort options
  const sortOptions = [
    { value: "startDate", label: "Event Date" },
    { value: "title", label: "Event Title" },
    { value: "type", label: "Event Type" },
    { value: "registrationDate", label: "Registration Date" },
  ];

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filter !== "all") params.filter = filter;
      if (instructor) params.instructor = instructor;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const response = await registrationAPI.getMyRegistrations(params);
      setRegistrations(response.data.data);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load your registrations");
    } finally {
      setLoading(false);
    }
  }, [search, filter, instructor, sortBy, sortOrder]);

  // Handle registration cancellation
  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      await registrationAPI.cancelRegistration(registrationId);
      toast.success("Registration cancelled successfully");
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, fetchRegistrations, refreshTrigger]);

  // Styles
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
    marginBottom: theme.spacing[6],
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

  const tabStyles = {
    display: "flex",
    gap: theme.spacing[1],
    marginBottom: theme.spacing[6],
    borderBottom: `1px solid ${theme.colors.border.default}`,
  };

  const tabButtonStyles = (isActive) => ({
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: `3px solid ${isActive ? theme.colors.primary.main : "transparent"}`,
    color: isActive ? theme.colors.primary.main : theme.colors.text.secondary,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
    fontSize: theme.typography.fontSize.base,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily.primary,
  });

  const filtersStyles = {
    display: "grid",
    gridTemplateColumns: filter === "workshop" 
      ? "repeat(auto-fit, minmax(180px, 1fr))" 
      : "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  };

  const summaryCardStyles = {
    background: theme.colors.background.gradient,
    color: theme.colors.text.white,
    marginBottom: theme.spacing[6],
  };

  const statsGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: theme.spacing[4],
  };

  const statStyles = {
    textAlign: "center",
  };

  const statValueStyles = {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: "inherit",
    marginBottom: theme.spacing[1],
  };

  const statLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: "inherit",
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  };

  const emptyStateStyles = {
    textAlign: "center",
    padding: theme.spacing[8],
    color: theme.colors.text.secondary,
  };

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: theme.spacing[4],
  };

  // Get current events to display
  const currentEvents = registrations[activeTab] || [];
  const isPastEvent = (event) => {
    if (!event || !event.endDate) {
      // If there's no event data or end date, consider it not past
      return false;
    }
    const now = new Date();
    const eventEnd = new Date(event.endDate);
    return eventEnd < now;
  };
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={containerStyles}>
        <Navbar />
        <div style={contentStyles}>
          <Card style={{ textAlign: "center", padding: theme.spacing[8] }}>
            <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
              Please log in to view your registrations
            </h2>
            <Link to="/login">
              <Button variant="primary">Login</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Navbar />

      <div style={contentStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={titleStyles}>My Registrations</h1>
          <p style={subtitleStyles}>
            View and manage your registered events, both upcoming and past
          </p>
        </div>

        {/* Summary Card */}
        {summary && (
          <Card style={summaryCardStyles}>
            <h3 style={{ 
              fontSize: theme.typography.fontSize.xl, 
              fontWeight: theme.typography.fontWeight.semibold, 
              marginBottom: theme.spacing[4],
              color: "inherit"
            }}>
              Registration Summary
            </h3>
            <div style={statsGridStyles}>
              <div style={statStyles}>
                <div style={statValueStyles}>{summary.totalRegistrations || 0}</div>
                <div style={statLabelStyles}>Total Events</div>
              </div>
              <div style={statStyles}>
                <div style={statValueStyles}>{summary.allUpcomingCount || 0}</div>
                <div style={statLabelStyles}>Upcoming</div>
              </div>
              <div style={statStyles}>
                <div style={statValueStyles}>{summary.allPastCount || 0}</div>
                <div style={statLabelStyles}>Past Events</div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersStyles}>
            <Input
              label="Search Events"
              placeholder="Search by title, type, location, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Filter by Type"
              options={eventTypeOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter === "workshop" && (
              <Input
                label="Instructor Name"
                placeholder="Search by instructor..."
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
              />
            )}
            <Select
              label="Sort by"
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
            <Select
              label="Sort Order"
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </Card>

        {/* Tabs */}
        <div style={tabStyles}>
          <button
            style={tabButtonStyles(activeTab === "upcoming")}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Events ({summary.upcomingCount || 0})
          </button>
          <button
            style={tabButtonStyles(activeTab === "past")}
            onClick={() => setActiveTab("past")}
          >
            Past Events ({summary.pastCount || 0})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card style={emptyStateStyles}>
            <div>Loading your registrations...</div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && currentEvents.length === 0 && (
          <Card style={emptyStateStyles}>
            <h3 style={{ 
              fontSize: theme.typography.fontSize.xl, 
              color: theme.colors.text.primary, 
              marginBottom: theme.spacing[4] 
            }}>
              {activeTab === "upcoming" ? "No Upcoming Events" : "No Past Events"}
            </h3>
            <p style={{ marginBottom: theme.spacing[6] }}>
              {activeTab === "upcoming" 
                ? "You haven't registered for any upcoming events yet." 
                : "You don't have any past event registrations."}
            </p>
            {activeTab === "upcoming" && (
              <Link to="/events">
                <Button variant="primary">Browse Events</Button>
              </Link>
            )}
          </Card>
        )}

        {/* Events Grid */}
        {!loading && currentEvents.length > 0 && (
          <div style={gridStyles}>
            {currentEvents.map((registration) => (
              <RegistrationCard
                key={registration._id}
                registration={registration}
                onCancel={handleCancelRegistration}
                isPastEvent={activeTab === "past"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;