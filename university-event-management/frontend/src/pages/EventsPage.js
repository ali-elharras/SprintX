import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import theme from "../theme";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EventsPage = () => {
  const navigate = useNavigate();
  const { isEventsOffice } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    upcoming: true,
  });

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters when events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvents({
        upcoming: "true",
      });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter((event) => event.type === filters.type);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
      );
    }

    // Filter upcoming events
    if (filters.upcoming) {
      const now = new Date();
      filtered = filtered.filter((event) => new Date(event.startDate) > now);
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegistrationSuccess = () => {
    toast.success("Registration successful!");
    // Refresh events to update participant counts
    fetchEvents();
  };

  const handleCreateConference = () => {
    navigate("/conferences/create");
  };

  const eventTypeOptions = [
    { value: "", label: "All Types" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "competition", label: "Competitions" },
    { value: "conference", label: "Conferences" },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}
      >
        Loading events...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.default,
          padding: theme.spacing[6],
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Page Header */}
          <div style={{ marginBottom: theme.spacing[8] }}>
            <h1
              style={{
                fontSize: theme.typography.fontSize["3xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
                textAlign: "center",
              }}
            >
              University Events
            </h1>
            <p
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary,
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Discover and register for workshops, trips, and other exciting events
              happening at our university.
            </p>
          </div>

          {/* Filters */}
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[5],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              marginBottom: theme.spacing[6],
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isEventsOffice 
                  ? "1fr 1fr auto auto auto" 
                  : "1fr 1fr auto auto",
                gap: theme.spacing[4],
                alignItems: "end",
              }}
            >
              <Input
                label="Search Events"
                placeholder="Search by name, description, or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <Select
                label="Event Type"
                options={eventTypeOptions}
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
              <Button
                variant={filters.upcoming ? "primary" : "secondary"}
                onClick={() => handleFilterChange("upcoming", !filters.upcoming)}
              >
                {filters.upcoming ? "Upcoming Only" : "All Events"}
              </Button>
              <Button variant="outline" onClick={fetchEvents}>
                Refresh
              </Button>
              {isEventsOffice && (
                <Button 
                  variant="primary" 
                  onClick={handleCreateConference}
                  style={{
                    background: theme.colors.eventTypes.conference.main,
                    whiteSpace: "nowrap",
                  }}
                >
                  + Create Conference
                </Button>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: theme.spacing[6],
              }}
            >
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRegistrationSuccess={handleRegistrationSuccess}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: theme.colors.background.paper,
                padding: theme.spacing[12],
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize["4xl"],
                  marginBottom: theme.spacing[4],
                }}
              >
                📅
              </div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[2],
                }}
              >
                No Events Found
              </h3>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing[4],
                }}
              >
                {filters.search || filters.type
                  ? "Try adjusting your filters to see more events."
                  : "There are no upcoming events at the moment."}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ type: "", search: "", upcoming: true })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Summary */}
          {filteredEvents.length > 0 && (
            <div
              style={{
                marginTop: theme.spacing[8],
                padding: theme.spacing[4],
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.base,
                textAlign: "center",
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Showing {filteredEvents.length} of {events.length} events
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventsPage;