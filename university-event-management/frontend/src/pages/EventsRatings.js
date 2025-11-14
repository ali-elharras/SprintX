import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { eventAPI } from "../services/api";
import theme from "../theme";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import ViewRatingsModal from "../components/ViewRatingsModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EventsRatings = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRatingsModal, setShowRatingsModal] = useState(false);

  // Check if user is authorized
  const isAuthorized = user && (user.role === "events_office" || user.role === "admin");

  const eventTypeOptions = [
    { value: "all", label: "All Events" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "booth", label: "Booths" },
    { value: "conference", label: "Conferences" },
  ];

  const sortOptions = [
    { value: "startDate", label: "Start Date" },
    { value: "endDate", label: "End Date" },
    { value: "title", label: "Event Title" },
    { value: "type", label: "Event Type" },
  ];

  const fetchPastEvents = useCallback(async () => {
    if (!isAuthenticated || !isAuthorized) return;

    try {
      setLoading(true);

      // Fetch all events (the API returns all event types)
      const eventsResponse = await eventAPI.getEvents();
      const allEvents = eventsResponse.data?.data || [];

      // Filter for events that have started or ended
      const now = new Date();
      const pastOrOngoingEvents = allEvents.filter(event => {
        const startDate = new Date(event.startDate);
        // Include events that have already started (past or ongoing)
        return startDate <= now;
      });

      setEvents(pastOrOngoingEvents);
    } catch (error) {
      console.error("Error fetching past events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthorized]);

  useEffect(() => {
    fetchPastEvents();
  }, [fetchPastEvents]);

  // Filter and sort events
  const getFilteredEvents = () => {
    let filtered = [...events];

    // Search filter
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          (event.title || event.name || "").toLowerCase().includes(lowercasedSearch) ||
          event.description?.toLowerCase().includes(lowercasedSearch) ||
          event.location?.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === "endDate") {
        aVal = new Date(a.endDate || a.startDate);
        bVal = new Date(b.endDate || b.startDate);
      } else if (sortBy === "startDate") {
        aVal = new Date(a.startDate);
        bVal = new Date(b.startDate);
      } else if (sortBy === "title") {
        aVal = (a.title || a.name || "").toLowerCase();
        bVal = (b.title || b.name || "").toLowerCase();
      } else {
        aVal = a[sortBy];
        bVal = b[sortBy];
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewRatings = (event) => {
    setSelectedEvent(event);
    setShowRatingsModal(true);
  };

  // Get event status badge
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate || event.startDate);

    if (endDate < now) {
      return { label: "Completed", color: theme.colors.success.main };
    } else if (startDate <= now && endDate >= now) {
      return { label: "Ongoing", color: theme.colors.warning.main };
    }
    return { label: "Upcoming", color: theme.colors.info.main };
  };

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

  const filtersStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  };

  const statsCardStyles = {
    background: theme.colors.background.gradient,
    color: theme.colors.text.white,
    marginBottom: theme.spacing[6],
    textAlign: "center",
  };

  const statsValueStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
  };

  const statsLabelStyles = {
    fontSize: theme.typography.fontSize.base,
    opacity: 0.9,
  };

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: theme.spacing[4],
  };

  const eventCardStyles = {
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const eventHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[3],
    gap: theme.spacing[2],
  };

  const eventTitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const eventTypeStyles = {
    display: "inline-block",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.primary.main + "20",
    color: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: "capitalize",
  };

  const statusBadgeStyles = (color) => ({
    display: "inline-block",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: color + "20",
    color: color,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing[2],
  });

  const eventDetailStyles = {
    display: "flex",
    alignItems: "center",
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  };

  const emptyStateStyles = {
    textAlign: "center",
    padding: theme.spacing[8],
    color: theme.colors.text.secondary,
  };

  // Authorization check
  if (!isAuthenticated) {
    return (
      <div style={containerStyles}>
        <Navbar />
        <div style={contentStyles}>
          <Card style={{ textAlign: "center", padding: theme.spacing[8] }}>
            <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
              Please log in
            </h2>
            <Button variant="primary" onClick={() => navigate("/")}>
              Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={containerStyles}>
        <Navbar />
        <div style={contentStyles}>
          <Card style={{ textAlign: "center", padding: theme.spacing[8] }}>
            <div style={{ fontSize: "64px", marginBottom: theme.spacing[4] }}>🚫</div>
            <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
              Access Denied
            </h2>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[6] }}>
              This page is only accessible to Events Office and Admin users.
            </p>
            <Button variant="primary" onClick={() => navigate("/events")}>
              Go to Events
            </Button>
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
          <h1 style={titleStyles}>Events Ratings & Feedback</h1>
          <p style={subtitleStyles}>
            View ratings and comments from attendees for all past and ongoing events
          </p>
        </div>

        {/* Statistics */}
        <Card style={statsCardStyles}>
          <div style={statsValueStyles}>{filteredEvents.length}</div>
          <div style={statsLabelStyles}>Events Available for Rating</div>
        </Card>

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersStyles}>
            <Input
              label="Search Events"
              placeholder="Search by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Filter by Type"
              options={eventTypeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
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

        {/* Events Grid */}
        {loading ? (
          <Card style={emptyStateStyles}>
            <div>Loading events...</div>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card style={emptyStateStyles}>
            <div style={{ fontSize: "64px", marginBottom: theme.spacing[4] }}>📊</div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              No Events Found
            </h3>
            <p>
              {search || filterType !== "all"
                ? "Try adjusting your filters to see more events."
                : "There are no past or ongoing events yet."}
            </p>
          </Card>
        ) : (
          <div style={gridStyles}>
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <Card key={event._id} style={eventCardStyles} hover>
                  <div style={eventHeaderStyles}>
                    <div style={{ flex: 1 }}>
                      <div style={eventTypeStyles}>{event.type}</div>
                      <h3 style={eventTitleStyles}>{event.title || event.name}</h3>
                      <div style={statusBadgeStyles(status.color)}>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: theme.spacing[4] }}>
                    <div style={eventDetailStyles}>
                      <span style={{ marginRight: theme.spacing[2] }}>📅</span>
                      <span>
                        {formatDate(event.startDate)}
                        {event.endDate &&
                          new Date(event.startDate).toDateString() !==
                            new Date(event.endDate).toDateString() &&
                          ` - ${formatDate(event.endDate)}`}
                      </span>
                    </div>

                    <div style={eventDetailStyles}>
                      <span style={{ marginRight: theme.spacing[2] }}>📍</span>
                      <span>
                        {event.location}
                        {event.venue && event.venue !== event.location && ` - ${event.venue}`}
                      </span>
                    </div>

                    {event.description && (
                      <p
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          marginTop: theme.spacing[2],
                          lineHeight: theme.typography.lineHeight.relaxed,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      paddingTop: theme.spacing[3],
                      borderTop: `1px solid ${theme.colors.border.light}`,
                    }}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewRatings(event)}
                      style={{ width: "100%" }}
                    >
                      View All Ratings & Comments
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Ratings Modal */}
      {selectedEvent && (
        <ViewRatingsModal
          isOpen={showRatingsModal}
          onClose={() => {
            setShowRatingsModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default EventsRatings;