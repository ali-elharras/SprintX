import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { eventAPI } from "../services/api";
import theme from "../theme";
import Card from "../components/Card";
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
  const [expandedEventId, setExpandedEventId] = useState(null);
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

    // Sort by start date (most recent first)
    filtered.sort((a, b) => {
      const aDate = new Date(a.startDate);
      const bDate = new Date(b.startDate);
      return bDate - aDate;
    });

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewRatings = (event) => {
    setSelectedEvent(event);
    setShowRatingsModal(true);
  };

  const toggleEventExpansion = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
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
    maxWidth: theme.layout.containerMaxWidth['xl'],
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

  const filtersGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  };

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    boxShadow: theme.shadows.sm,
  };

  const tableHeaderStyles = {
    backgroundColor: theme.colors.primary.main + "08",
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const tableHeaderCellStyles = {
    padding: theme.spacing[4],
    textAlign: "left",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const tableRowStyles = {
    borderBottom: `1px solid ${theme.colors.border.light}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const tableCellStyles = {
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    verticalAlign: "top",
  };

  const expandedRowStyles = {
    backgroundColor: theme.colors.primary.main + "04",
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const eventDetailCardStyles = {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    margin: `${theme.spacing[4]} 0`,
  };

  const eventTypeBadgeStyles = {
    display: "inline-block",
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.background.paper,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: "capitalize",
  };

  const statusBadgeStyles = (color) => ({
    display: "inline-block",
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: color + "20",
    color: color,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing[2],
  });

  const eventDetailLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[1],
    color: theme.colors.text.secondary,
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
      <div style={contentStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={titleStyles}>Events Ratings & Feedback</h1>
          <p style={subtitleStyles}>
            View ratings and comments from attendees for all past and ongoing events
          </p>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersGrid}>
            <Input
              label="Search Events"
              placeholder="Search by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Event Type"
              options={eventTypeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </Card>

        {/* Events Table */}
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
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={tableStyles}>
              <thead style={tableHeaderStyles}>
                <tr>
                  <th style={tableHeaderCellStyles}>Event Details</th>
                  <th style={tableHeaderCellStyles}>Date</th>
                  <th style={tableHeaderCellStyles}>Location</th>
                  <th style={{ ...tableHeaderCellStyles, width: "150px" }}>Actions</th>
                  <th style={{ ...tableHeaderCellStyles, width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const isExpanded = expandedEventId === event._id;
                  const status = getEventStatus(event);
                  
                  return (
                    <React.Fragment key={event._id}>
                      <tr 
                        style={tableRowStyles}
                        onClick={() => toggleEventExpansion(event._id)}
                      >
                        <td style={tableCellStyles}>
                          <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1], fontSize: theme.typography.fontSize.base }}>
                            {event.title || event.name}
                          </div>
                          <div style={eventTypeBadgeStyles}>
                            {event.type}
                          </div>
                          <span style={statusBadgeStyles(status.color)}>
                            {status.label}
                          </span>
                        </td>
                        <td style={tableCellStyles}>
                          <div style={{ marginBottom: theme.spacing[1] }}>
                            {formatDate(event.startDate)}
                          </div>
                          {event.endDate && new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                              to {formatDate(event.endDate)}
                            </div>
                          )}
                        </td>
                        <td style={tableCellStyles}>
                          <div>{event.location}</div>
                          {event.venue && event.venue !== event.location && (
                            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: theme.spacing[1] }}>
                              {event.venue}
                            </div>
                          )}
                        </td>
                        <td style={tableCellStyles}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRatings(event);
                            }}
                          >
                            View Ratings
                          </Button>
                        </td>
                        <td style={tableCellStyles}>
                          <div style={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            fontSize: theme.typography.fontSize.lg,
                            color: theme.colors.text.secondary,
                            textAlign: 'center'
                          }}>
                            ▼
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Event Details */}
                      {isExpanded && (
                        <tr style={expandedRowStyles}>
                          <td colSpan="5" style={{ ...tableCellStyles, paddingTop: 0 }}>
                            <div style={eventDetailCardStyles}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing[3] }}>
                                <div>
                                  <h4 style={{
                                    fontSize: theme.typography.fontSize.lg,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    marginBottom: theme.spacing[2]
                                  }}>
                                    Complete Event Information
                                  </h4>
                                </div>
                              </div>
              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[4] }}>
                                <div>
                                  <div style={eventDetailLabelStyles}>
                                    Event Title
                                  </div>
                                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                    {event.title || event.name}
                                  </div>
                                </div>
                                
                                <div>
                                  <div style={eventDetailLabelStyles}>
                                    Event Type
                                  </div>
                                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary, textTransform: "capitalize" }}>
                                    {event.type}
                                  </div>
                                </div>
                                
                                <div>
                                  <div style={eventDetailLabelStyles}>
                                    Status
                                  </div>
                                  <div style={{ fontSize: theme.typography.fontSize.sm, color: status.color }}>
                                    {status.label}
                                  </div>
                                </div>

                                <div>
                                  <div style={eventDetailLabelStyles}>
                                    Start Date
                                  </div>
                                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                    {formatDate(event.startDate)}
                                  </div>
                                </div>

                                {event.endDate && (
                                  <div>
                                    <div style={eventDetailLabelStyles}>
                                      End Date
                                    </div>
                                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                      {formatDate(event.endDate)}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <div style={eventDetailLabelStyles}>
                                    Location
                                  </div>
                                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                    {event.location}
                                  </div>
                                </div>

                                {event.venue && (
                                  <div>
                                    <div style={eventDetailLabelStyles}>
                                      Venue
                                    </div>
                                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                      {event.venue}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {event.description && (
                                <div style={{ marginTop: theme.spacing[4] }}>
                                  <div style={eventDetailLabelStyles}>
                                    Description
                                  </div>
                                  <div style={{ 
                                    fontSize: theme.typography.fontSize.sm, 
                                    color: theme.colors.text.primary,
                                    lineHeight: theme.typography.lineHeight.relaxed,
                                  }}>
                                    {event.description}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
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