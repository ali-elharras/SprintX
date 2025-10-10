import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { registrationAPI, eventAPI } from "../services/api";
import theme from "../theme";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import RegistrationCard from "../components/RegistrationCard";
import toast from "react-hot-toast";

// Card for displaying Bazaars created by the Events Office user
const MyBazaarCard = ({ bazaar, onEdit, onDelete }) => {
  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    boxShadow: theme.shadows.md,
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  };

  const statusBadgeStyle = {
    background:
      bazaar.status === "draft"
        ? theme.colors.secondary.main
        : theme.colors.primary.main,
    color: "white",
    padding: "4px 10px",
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
  };

  return (
    <Card style={cardStyle}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: theme.spacing[3],
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: "bold",
              color: theme.colors.text.primary,
              margin: 0,
              paddingRight: theme.spacing[2],
            }}
          >
            {bazaar.title || bazaar.name}
          </h3>
          <span style={statusBadgeStyle}>{bazaar.status}</span>
        </div>
        <p
          style={{
            color: theme.colors.text.secondary,
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {new Date(bazaar.startDate).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p
          style={{
            color: theme.colors.text.secondary,
            margin: `${theme.spacing[1]} 0`,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          📍 {bazaar.location}
        </p>
        <p
          style={{
            color: theme.colors.text.primary,
            marginTop: theme.spacing[4],
            fontSize: theme.typography.fontSize.base,
            maxHeight: "100px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {bazaar.description}
        </p>
      </div>
      <div style={{ marginTop: theme.spacing[4] }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing[4],
          }}
        >
          <span>Participants</span>
          <span style={{ fontWeight: "bold" }}>
            {bazaar.currentParticipants} / {bazaar.maxParticipants}
          </span>
        </div>
        <div style={{ display: "flex", gap: theme.spacing[2], width: "100%" }}>
          {new Date(bazaar.startDate) > new Date() ? (
            <>
              <Button
                variant="primary"
                onClick={() => onEdit(bazaar)}
                style={{ flex: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => onDelete(bazaar._id)}
                style={{ flex: 1 }}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button variant="secondary" disabled style={{ width: "100%" }}>
              Event Started
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

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
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [instructor, setInstructor] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Edit Modal state
  const [editingBazaar, setEditingBazaar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bazaarData, setBazaarData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  const eventTypeOptions = [
    { value: "all", label: "All Events" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "competition", label: "Competitions" },
    { value: "conference", label: "Conferences" },
  ];

  const sortOptions = [
    { value: "startDate", label: "Event Date" },
    { value: "title", label: "Event Title" },
    { value: "type", label: "Event Type" },
    { value: "registrationDate", label: "Registration Date" },
  ];

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch registrations
      const regResponse = await registrationAPI.getMyRegistrations();
      const fetchedRegistrations = (
        regResponse.data?.data?.upcoming || []
      ).concat(regResponse.data?.data?.past || []);

      // 2. Fetch created bazaars if user is Events Office
      let createdItems = [];
      if (isEventsOffice && user?.id) {
        const bazaarResponse = await api.get("/bazaars");
        const allBazaars = bazaarResponse.data?.data || [];
        const userBazaars = allBazaars.filter(
          (bazaar) =>
            (typeof bazaar.organizer === "object" &&
              bazaar.organizer?._id === user.id) ||
            (typeof bazaar.organizer === "string" &&
              bazaar.organizer === user.id)
        );
        createdItems = userBazaars.map((bazaar) => ({
          _id: `created-${bazaar._id}`,
          event: bazaar,
          isCreator: true,
          registrationDate: bazaar.createdAt || bazaar.startDate,
        }));
      }

      // 3. De-duplicate, prioritizing creator items
      const combinedItemsMap = new Map();
      fetchedRegistrations.forEach((reg) => {
        if (reg.event?._id) {
          combinedItemsMap.set(reg.event._id, reg);
        }
      });
      createdItems.forEach((item) => {
        if (item.event?._id) {
          combinedItemsMap.set(item.event._id, item); // This overwrites the registration with the creator item
        }
      });
      const combinedItems = Array.from(combinedItemsMap.values());

      setAllItems(combinedItems);
    } catch (err) {
      setError(err);
      toast.error("Failed to load all event data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isEventsOffice, user]);

  useEffect(() => {
    fetchData();
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
    const upcoming = items.filter(
      (item) => new Date(item.event.startDate) > now
    );
    const past = items.filter((item) => new Date(item.event.startDate) <= now);

    setDisplayedItems({ upcoming, past });

    setSummary({
      totalRegistrations: items.length,
      allUpcomingCount: upcoming.length,
      allPastCount: past.length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
    });
  }, [allItems, search, filter, sortBy, sortOrder]);

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?"))
      return;
    try {
      await registrationAPI.cancelRegistration(registrationId);
      toast.success("Registration cancelled successfully");
      setRefreshTrigger((p) => p + 1);
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  const handleDeleteBazaar = async (bazaarId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this bazaar?"
      )
    )
      return;
    try {
      await api.delete(`/bazaars/${bazaarId}`);
      toast.success("Bazaar deleted successfully");
      setRefreshTrigger((p) => p + 1);
    } catch (error) {
      console.error("Failed to delete bazaar:", error);
      toast.error(error.response?.data?.message || "Failed to delete bazaar.");
    }
  };

  const handleOpenEditModal = (bazaar) => {
    const formatForInput = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };
    setEditingBazaar(bazaar);
    setBazaarData({
      name: bazaar.title || bazaar.name,
      description: bazaar.description,
      startDate: formatForInput(bazaar.startDate),
      endDate: formatForInput(bazaar.endDate),
      location: bazaar.location,
      theme: bazaar.tags?.join(", ") || "",
      maxParticipants: bazaar.maxParticipants?.toString() || "50",
      registrationDeadline: formatForInput(bazaar.registrationDeadline),
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBazaar(null);
  };

  const handleUpdateBazaar = async () => {
    if (!editingBazaar) return;
    if (
      !bazaarData.name ||
      !bazaarData.description ||
      !bazaarData.startDate ||
      !bazaarData.endDate ||
      !bazaarData.registrationDeadline
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (
      new Date(bazaarData.registrationDeadline) >=
      new Date(bazaarData.startDate)
    ) {
      toast.error(
        "Registration deadline must be before the event's start date."
      );
      return;
    }
    try {
      const updatedEventData = {
        name: bazaarData.name,
        title: bazaarData.name,
        description: bazaarData.description,
        startDate: new Date(bazaarData.startDate).toISOString(),
        endDate: new Date(bazaarData.endDate).toISOString(),
        location: bazaarData.location,
        maxParticipants: Number(bazaarData.maxParticipants),
        registrationDeadline: new Date(
          bazaarData.registrationDeadline
        ).toISOString(),
        tags: bazaarData.theme
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await api.put(`/bazaars/${editingBazaar._id}`, updatedEventData);
      toast.success("Bazaar updated successfully!");
      handleCloseEditModal();
      setRefreshTrigger((p) => p + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bazaar.");
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
        <Navbar />
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

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          animation: "slide-down 0.3s ease-out",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 20000,
          display: "flex",
          justifyContent: "center",
          paddingTop: theme.spacing[6],
        }}
        onClick={handleCloseEditModal}
      >
        <div
          style={{
            width: "800px",
            maxWidth: "95%",
            background: theme.colors.background.paper,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            padding: theme.spacing[6],
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4] }}>
            Edit Bazaar
          </h2>
          <div style={{ display: "grid", gap: theme.spacing[4] }}>
            <Input
              label="Bazaar Name"
              value={bazaarData.name}
              onChange={(e) =>
                setBazaarData({ ...bazaarData, name: e.target.value })
              }
            />
            <Input
              label="Theme"
              value={bazaarData.theme}
              onChange={(e) =>
                setBazaarData({ ...bazaarData, theme: e.target.value })
              }
            />
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing[2],
                  color: theme.colors.text.secondary,
                }}
              >
                Description
              </label>
              <textarea
                rows="4"
                value={bazaarData.description}
                onChange={(e) =>
                  setBazaarData({ ...bazaarData, description: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: theme.spacing[3],
                  fontSize: theme.typography.fontSize.base,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.base,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing[4],
              }}
            >
              <Input
                label="Start Date"
                type="datetime-local"
                value={bazaarData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  const updatedData = {
                    ...bazaarData,
                    startDate: newStartDate,
                  };
                  if (updatedData.endDate && newStartDate > updatedData.endDate)
                    updatedData.endDate = "";
                  if (
                    updatedData.registrationDeadline &&
                    newStartDate <= updatedData.registrationDeadline
                  )
                    updatedData.registrationDeadline = "";
                  setBazaarData(updatedData);
                }}
              />
              <Input
                label="End Date"
                type="datetime-local"
                value={bazaarData.endDate}
                min={bazaarData.startDate}
                onChange={(e) =>
                  setBazaarData({ ...bazaarData, endDate: e.target.value })
                }
              />
            </div>
            <Input
              label="Location"
              value={bazaarData.location}
              onChange={(e) =>
                setBazaarData({ ...bazaarData, location: e.target.value })
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing[4],
              }}
            >
              <Input
                label="Max Participants"
                type="number"
                min="1"
                value={bazaarData.maxParticipants}
                onChange={(e) =>
                  setBazaarData({
                    ...bazaarData,
                    maxParticipants: e.target.value,
                  })
                }
              />
              <Input
                label="Registration Deadline"
                type="datetime-local"
                value={bazaarData.registrationDeadline}
                max={bazaarData.startDate}
                onChange={(e) =>
                  setBazaarData({
                    ...bazaarData,
                    registrationDeadline: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing[3],
              marginTop: theme.spacing[5],
            }}
          >
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateBazaar}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyles}>
      <Navbar />
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>My Events</h1>
          <p style={subtitleStyles}>
            View and manage your registered and created events.
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
              item.isCreator ? (
                <MyBazaarCard
                  key={item._id}
                  bazaar={item.event}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteBazaar}
                />
              ) : (
                <RegistrationCard
                  key={item._id}
                  registration={item}
                  onCancel={handleCancelRegistration}
                  isPastEvent={activeTab === "past"}
                />
              )
            )}
          </div>
        )}
      </div>
      {renderEditModal()}
    </div>
  );
};

export default MyRegistrations;
