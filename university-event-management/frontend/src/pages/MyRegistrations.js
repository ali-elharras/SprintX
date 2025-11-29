import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { registrationAPI, eventAPI, gymAPI, courtAPI } from "../services/api";
import theme from "../theme";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import RegistrationCard from "../components/RegistrationCard";
import toast from "react-hot-toast";
import axios from "axios";

const MyRegistrations = () => {
  const { isAuthenticated, isEventsOffice, user } = useAuth();

  // Unified state management
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState({
    upcoming: [],
    past: [],
  });

  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ref for request cancellation
  const cancelTokenRef = useRef(null);

  const eventTypeOptions = [
    { value: "all", label: "All Events" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "competition", label: "Competitions" },
    { value: "conference", label: "Conferences" },
    { value: "gym", label: "Gym Sessions" },
    { value: "court", label: "Court Reservations" },
  ];

  const sortOptions = [
    { value: "startDate", label: "Event Date" },
    { value: "title", label: "Event Title" },
    { value: "type", label: "Event Type" },
    { value: "registrationDate", label: "Registration Date" },
  ];

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled due to new request');
    }
    
    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch event registrations with cancellation token
      const regResponse = await registrationAPI.getMyRegistrations({}, cancelTokenRef.current);
      const fetchedRegistrations = (
        regResponse.data?.data?.upcoming || []
      ).concat(regResponse.data?.data?.past || []);

      // 2. Fetch gym registrations
      const gymRegResponse = await gymAPI.getMyRegistrations({}, cancelTokenRef.current);
      const gymRegistrations = gymRegResponse.data?.data || [];
      
      console.log('Gym registrations response:', gymRegResponse.data);
      console.log('Gym registrations array:', gymRegistrations);
      
      // Transform gym registrations to match event registration format
      const transformedGymRegs = gymRegistrations
        .filter(gymReg => gymReg.gymSession) // Only process if gymSession is populated
        .map(gymReg => ({
          _id: gymReg._id,
          event: {
            _id: gymReg.gymSession._id,
            title: gymReg.gymSession.title,
            description: gymReg.gymSession.description || '',
            type: 'gym',
            startDate: gymReg.gymSession.startDate,
            endDate: gymReg.gymSession.endDate,
            location: gymReg.gymSession.location,
            room: gymReg.gymSession.room,
            // Additional fields for gym sessions
            instructor: gymReg.gymSession.instructor,
            startTime: gymReg.gymSession.startTime,
            endTime: gymReg.gymSession.endTime,
            dayOfWeek: gymReg.gymSession.dayOfWeek,
            skillLevel: gymReg.gymSession.skillLevel,
            cost: gymReg.gymSession.cost,
          },
          registrationDate: gymReg.registrationDate,
          status: gymReg.status,
          isGymSession: true, // Flag to identify gym sessions
        }));
      
      console.log('Transformed gym registrations:', transformedGymRegs);

      // 3. Fetch court reservations
      const courtResponse = await courtAPI.getMyReservations(cancelTokenRef.current);
      const courtReservations = courtResponse.data?.data || [];
      
      console.log('Court reservations response:', courtResponse.data);
      console.log('Court reservations array:', courtReservations);
      
      // Transform court reservations to match event registration format
      const transformedCourtReservations = courtReservations
        .filter(reservation => reservation.court) // Only process if court is populated
        .map(reservation => ({
          _id: reservation._id,
          event: {
            _id: reservation.court._id,
            title: `${reservation.court.name} - ${reservation.court.type.charAt(0).toUpperCase() + reservation.court.type.slice(1)}`,
            description: `${reservation.startTime} - ${reservation.endTime}`,
            type: 'court',
            startDate: reservation.date,
            endDate: reservation.date,
            location: reservation.court.location,
            // Additional fields for court reservations
            courtType: reservation.court.type,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            duration: reservation.duration,
            purpose: reservation.purpose,
            amountPaid: reservation.finalAmount,
            paymentStatus: reservation.paymentStatus,
          },
          registrationDate: reservation.createdAt,
          status: reservation.status,
          isCourtReservation: true, // Flag to identify court reservations
          reservationData: reservation, // Keep full reservation data for cancellation
        }));
      
      console.log('Transformed court reservations:', transformedCourtReservations);

      // Combine all types of registrations
      const allRegistrations = [...fetchedRegistrations, ...transformedGymRegs, ...transformedCourtReservations];
      console.log('All registrations:', allRegistrations);
      setAllItems(allRegistrations);
    } catch (err) {
      // Don't show error if request was cancelled
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
        return;
      }
      setError(err);
      toast.error("Failed to load all event data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function to cancel request on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, [fetchData, refreshTrigger]);

  // Handles all client-side filtering, sorting, and categorization
  useEffect(() => {
    let items = [...allItems];

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.event.title.toLowerCase().includes(lowercasedSearch) ||
          item.event.description.toLowerCase().includes(lowercasedSearch) ||
          item.event.location.toLowerCase().includes(lowercasedSearch)
      );
    }

    if (filter !== "all") {
      items = items.filter((item) => item.event.type === filter);
    }

    items.sort((a, b) => {
      const aVal =
        sortBy === "title" ? a.event[sortBy] : a.event[sortBy] || a[sortBy];
      const bVal =
        sortBy === "title" ? b.event[sortBy] : b.event[sortBy] || b[sortBy];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const upcoming = items.filter((item) => {
      const startDate = new Date(item.event.startDate);
      const endDate = new Date(item.event.endDate);
      
      // For gym sessions (recurring/weekly), check if we're within the date range
      if (item.isGymSession) {
        return endDate >= now;
      }
      
      // For other events: include future events and same-day events
      if (startDate >= now) return true;

      // Check if it's a same-day event happening today
      const sameDay =
        startDate &&
        endDate &&
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      const isToday = startDate >= startOfToday && startDate <= endOfToday;
      return sameDay && isToday;
    });
    
    const past = items.filter((item) => {
      const startDate = new Date(item.event.startDate);
      const endDate = new Date(item.event.endDate);
      
      // For gym sessions (recurring/weekly), check if the session has ended
      if (item.isGymSession) {
        return endDate < now;
      }
      
      // For other events, use endDate to determine if past
      return endDate < now;
    });

    setDisplayedItems({ upcoming, past });

    setSummary({
      totalRegistrations: items.length,
      allUpcomingCount: upcoming.length,
      allPastCount: past.length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
    });
  }, [allItems, search, filter, sortBy, sortOrder]);

  const handleCancelRegistration = async (registrationId, isGymSession = false, isCourtReservation = false) => {
    if (!window.confirm("Are you sure you want to cancel this registration?"))
      return;
    try {
      if (isCourtReservation) {
        await courtAPI.cancelReservation(registrationId, "Cancelled by user");
      } else if (isGymSession) {
        await gymAPI.cancelRegistration(registrationId);
      } else {
        await registrationAPI.cancelRegistration(registrationId);
      }
      toast.success("Registration cancelled successfully");
      setRefreshTrigger((p) => p + 1);
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

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
  const headerStyles = { marginBottom: theme.spacing[6] };
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
    borderBottom: `3px solid ${
      isActive ? theme.colors.primary.main : "transparent"
    }`,
    color: isActive ? theme.colors.primary.main : theme.colors.text.secondary,
    fontWeight: isActive
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal,
    fontSize: theme.typography.fontSize.base,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily.primary,
  });
  const filtersStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
  const statStyles = { textAlign: "center" };
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

  const currentItems = displayedItems[activeTab] || [];

  if (!isAuthenticated) {
    return (
      <div style={containerStyles}>
        
        <div style={contentStyles}>
          <Card style={{ textAlign: "center", padding: theme.spacing[8] }}>
            <h2
              style={{
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              Please log in
            </h2>
            <Link to="/">
              <Button variant="primary">Login</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>My Events</h1>
          <p style={subtitleStyles}>
            View and manage your registered events.
          </p>
        </div>

        {summary && (
          <Card style={summaryCardStyles}>
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                marginBottom: theme.spacing[4],
                color: "inherit",
              }}
            >
              Event Summary
            </h3>
            <div style={statsGridStyles}>
              <div style={statStyles}>
                <div style={statValueStyles}>
                  {summary.totalRegistrations || 0}
                </div>
                <div style={statLabelStyles}>Total Events</div>
              </div>
              <div style={statStyles}>
                <div style={statValueStyles}>
                  {summary.allUpcomingCount || 0}
                </div>
                <div style={statLabelStyles}>Upcoming</div>
              </div>
              <div style={statStyles}>
                <div style={statValueStyles}>{summary.allPastCount || 0}</div>
                <div style={statLabelStyles}>Past Events</div>
              </div>
            </div>
          </Card>
        )}

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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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

        {loading && (
          <Card style={emptyStateStyles}>
            <div>Loading your events...</div>
          </Card>
        )}

        {error && !loading && (
          <Card
            style={{
              ...emptyStateStyles,
              border: `2px solid ${theme.colors.status.error}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize["2xl"],
                marginBottom: theme.spacing[4],
                color: theme.colors.status.error,
              }}
            >
              ⚠️
            </div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              Failed to Load Events
            </h3>
            <p style={{ marginBottom: theme.spacing[6] }}>
              {error.message ||
                "There was an error loading your events. Please try again."}
            </p>
            <Button variant="primary" onClick={fetchData}>
              Retry
            </Button>
          </Card>
        )}

        {!loading && currentItems.length === 0 && (
          <Card style={emptyStateStyles}>
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              {activeTab === "upcoming"
                ? "No Upcoming Events"
                : "No Past Events"}
            </h3>
            <p style={{ marginBottom: theme.spacing[6] }}>
              {activeTab === "upcoming"
                ? "You haven't registered for or created any upcoming events yet."
                : "You don't have any past events."}
            </p>
            {activeTab === "upcoming" && (
              <Link to="/events">
                <Button variant="primary">Browse Events</Button>
              </Link>
            )}
          </Card>
        )}

        {!loading && currentItems.length > 0 && (
          <div style={gridStyles}>
            {currentItems.map((item) =>
                <RegistrationCard
                  key={item._id}
                  registration={item}
                  onCancel={(regId) => handleCancelRegistration(regId, item.isGymSession, item.isCourtReservation)}
                  isPastEvent={activeTab === "past"}
                  hideRatingsButton={activeTab === "upcoming"}
                />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;