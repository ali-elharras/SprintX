import React, { useState, useEffect } from "react";
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
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    upcoming: true,
  });

  // Pending workshops (visible only to Events Office on this page)
  // Two dummy workshops for testing (follow the project's workshop structure)
  const [pendingWorkshops, setPendingWorkshops] = useState([
    {
      id: "local-pw-1",
      name: "Advanced Quantum Computing Workshop",
      description:
        "An advanced workshop exploring quantum algorithms, error correction, and near-term quantum devices.",
      type: "workshop",
      instructor: "Dr. Ayesha Khan",
      professorName: "Dr. Ayesha Khan",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week from now
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 3).toISOString(), // +3 hours
      location: "Room 402, Engineering Building",
      shortDescription:
        "Hands-on sessions and lectures covering quantum circuits and algorithms.",
      // Extended workshop fields (for details view)
      details: {
        agenda:
          "09:00 - Welcome\n09:30 - Quantum Circuits\n11:00 - Break\n11:15 - Algorithms\n13:00 - Hands-on Lab",
        facultyResponsible: "Prof. Omar Saeed",
        budget: "$4,500",
        fundingSource: "Department Research Fund",
        contactEmail: "ayesha.khan@university.edu",
        materials: "Laptop with Qiskit installed; basic linear algebra notes",
        prerequisites: "Undergraduate quantum mechanics or equivalent",
      },
    },
    {
      id: "local-pw-2",
      name: "Data Visualization for Researchers",
      description:
        "Practical techniques for creating publication-quality visualizations using Python and D3.",
      type: "workshop",
      instructor: "Dr. Miguel Alvarez",
      professorName: "Dr. Miguel Alvarez",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks from now
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 4).toISOString(), // +4 hours
      location: "Lab 2, Data Science Center",
      shortDescription:
        "Create compelling charts and interactive visuals for research and presentations.",
      details: {
        agenda:
          "10:00 - Principles of Visual Encoding\n11:00 - Matplotlib & Seaborn\n12:30 - Lunch\n13:30 - Interactive D3 examples",
        facultyResponsible: "Dr. Nina Patel",
        budget: "$2,000",
        fundingSource: "Graduate School Professional Development",
        contactEmail: "miguel.alvarez@university.edu",
        materials: "Laptop with Python 3.8+, Jupyter",
        prerequisites: "Comfortable with Python basics",
      },
    },
  ]);

  // Modal state for viewing details of a pending workshop
  const [selectedPending, setSelectedPending] = useState(null);
  // Candidate pending workshop to publish (for confirmation modal)
  const [publishCandidate, setPublishCandidate] = useState(null);
  // Candidate pending workshop to reject (for confirmation modal)
  const [rejectCandidate, setRejectCandidate] = useState(null);
  // Candidate pending workshop to request edits for (opens small message modal)
  const [requestEditsCandidate, setRequestEditsCandidate] = useState(null);
  const [requestEditsMessage, setRequestEditsMessage] = useState("");

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching events...");
      
      const response = await eventAPI.getEvents({
        status: "published",
        upcoming: "true",
      });
      
      console.log("Events response:", response);
      // The response structure is response.data.data due to the backend API structure
      setEvents(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters when events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

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
          event.title.toLowerCase().includes(searchTerm) ||
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
    // Refresh events to update participant counts
    fetchEvents();
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
      <>
        <Navbar />
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
      </>
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
  {/* Pending workshops — Events Office approvals (visible only to Events Office users) */}
  {auth.isEventsOffice && pendingWorkshops.length > 0 && (
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[5],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              marginBottom: theme.spacing[6],
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: theme.spacing[3],
                color: theme.colors.text.primary,
              }}
            >
              Pending Workshop Approvals
            </h2>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
              These workshops were submitted by professors and are awaiting approval. They are not visible to other
              stakeholders until published.
            </p>

            <div style={{ display: "grid", gap: theme.spacing[4] }}>
              {pendingWorkshops.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: theme.spacing[4],
                    borderRadius: theme.borderRadius.base,
                    background: theme.colors.background.default,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 600 }}>
                      {w.name}
                    </div>
                    <div style={{ color: theme.colors.text.secondary, marginTop: theme.spacing[1] }}>
                      <strong>Professor:</strong> {w.professorName} • <strong>Date:</strong>{" "}
                      {new Date(w.startDate).toLocaleString()} • <strong>Location:</strong> {w.location}
                    </div>
                    <div style={{ marginTop: theme.spacing[2], color: theme.colors.text.primary }}>
                      {w.shortDescription}
                    </div>
                  </div>

                    <div style={{ display: "flex", gap: theme.spacing[3] }}>
                    <Button
                      variant="primary"
                      onClick={() => {
                        // Open custom confirmation modal for this pending workshop
                        setPublishCandidate(w);
                      }}
                    >
                      Accept & Publish
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedPending(w)}
                    >
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // Open small input modal to request edits
                        setRequestEditsCandidate(w);
                        setRequestEditsMessage("");
                      }}
                    >
                      Request Edits
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => {
                        // Ask for confirmation before rejecting
                        setRejectCandidate(w);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Request Edits modal */}
        {requestEditsCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              zIndex: 10000,
            }}
            onClick={() => setRequestEditsCandidate(null)}
          >
            <div
              style={{
                width: "560px",
                maxWidth: "95%",
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing[5],
                boxShadow: theme.shadows.lg,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2] }}>
                Request Edits for "{requestEditsCandidate.name}"
              </h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                Provide a short message that will be sent back to the professor explaining what needs to be changed. This will mark the workshop as "needs revision" and remove it from the pending approvals list.
              </p>

              <Input
                label="Edit message"
                name="requestEditsMessage"
                value={requestEditsMessage}
                onChange={(e) => setRequestEditsMessage(e.target.value)}
                placeholder="Please make the agenda clearer and include contact info..."
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                <Button variant="outline" onClick={() => setRequestEditsCandidate(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    const w = requestEditsCandidate;

                    // Minimal validation
                    if (!requestEditsMessage || requestEditsMessage.trim().length < 3) {
                      toast.error("Please enter a short message to request edits.");
                      return;
                    }

                    // Store edit request locally (for now) so professor can later view it.
                    try {
                      const key = "event_edit_requests";
                      const existing = JSON.parse(localStorage.getItem(key) || "{}");
                      existing[w.id || w._id || `local-${Date.now()}`] = {
                        eventId: w._id || w.id,
                        message: requestEditsMessage.trim(),
                        requestedBy: {
                          name: auth.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName}` : "Events Office",
                          id: auth.user?.id || null,
                        },
                        requestedAt: new Date().toISOString(),
                        status: "needs_revision",
                      };
                      localStorage.setItem(key, JSON.stringify(existing));
                    } catch (err) {
                      console.error("Failed to persist edit request locally:", err);
                    }

                    // Remove from pending list locally
                    setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));

                    // If this has a backend id, attempt to update status to 'rejected' or 'needs_revision' via API
                    // Since backend doesn't yet have a 'needs_revision' status in the controller allowed list,
                    // we'll set status to 'rejected' for backend but keep a local note. This simulates the flow
                    // until backend support is added.
                    if (w._id) {
                      try {
                        // Send needs_revision with message to backend
                        await eventAPI.updateEventStatus(w._id, "needs_revision", requestEditsMessage.trim());
                        toast.success(`Requested edits for "${w.name}" (professor notified)`);
                      } catch (err) {
                        console.error("Failed to update event status on server:", err);
                        toast.error("Edit request saved locally. Server update failed.");
                      }
                    } else {
                      toast.success(`Requested edits for "${w.name}"`);
                    }

                    setRequestEditsCandidate(null);
                    setRequestEditsMessage("");
                  }}
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        )}
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
              gridTemplateColumns: "1fr 1fr auto auto",
              gap: theme.spacing[4],
              alignItems: "end",
            }}
          >
            <Input
              label="Search Events"
              placeholder="Search by title, description, or location..."
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

        {/* Error state */}
        {error && !loading && (
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[8],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              textAlign: "center",
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
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Failed to Load Events
            </h3>
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[4],
              }}
            >
              {error.message || "There was an error loading events. Please try again."}
            </p>
            <Button variant="primary" onClick={fetchEvents}>
              Retry
            </Button>
          </div>
        )}
        {/* Pending workshop details modal */}
        {selectedPending && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              zIndex: 9999,
            }}
            onClick={() => setSelectedPending(null)}
          >
            <div
              style={{
                width: "800px",
                maxWidth: "95%",
                maxHeight: "90%",
                overflow: "auto",
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing[6],
                boxShadow: theme.shadows.lg,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0 }}>{selectedPending.name}</h2>
                <div style={{ display: "flex", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setSelectedPending(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div style={{ marginTop: theme.spacing[4], color: theme.colors.text.secondary }}>
                <p><strong>Professor / Instructor:</strong> {selectedPending.professorName || selectedPending.instructor}</p>
                <p>
                  <strong>Date:</strong> {new Date(selectedPending.startDate).toLocaleString()} - {new Date(selectedPending.endDate).toLocaleString()}
                </p>
                <p><strong>Location:</strong> {selectedPending.location}</p>
                <p style={{ marginTop: theme.spacing[3] }}>{selectedPending.description || selectedPending.shortDescription}</p>

                <hr style={{ margin: `${theme.spacing[4]} 0`, borderColor: theme.colors.border }} />

                <h3>Full Details</h3>
                <p><strong>Agenda</strong></p>
                <pre style={{ whiteSpace: 'pre-wrap', background: theme.colors.background.default, padding: theme.spacing[3], borderRadius: theme.borderRadius.sm }}>{selectedPending.details?.agenda}</pre>

                <p><strong>Faculty Responsible:</strong> {selectedPending.details?.facultyResponsible}</p>
                <p><strong>Budget:</strong> {selectedPending.details?.budget}</p>
                <p><strong>Funding Source:</strong> {selectedPending.details?.fundingSource}</p>
                <p><strong>Contact Email:</strong> {selectedPending.details?.contactEmail}</p>
                <p><strong>Materials:</strong> {selectedPending.details?.materials}</p>
                <p><strong>Prerequisites:</strong> {selectedPending.details?.prerequisites}</p>
              </div>
            </div>
          </div>
        )}
        {/* Publish confirmation modal */}
        {publishCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              zIndex: 10000,
            }}
            onClick={() => setPublishCandidate(null)}
          >
            <div
              style={{
                width: "520px",
                maxWidth: "95%",
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing[5],
                boxShadow: theme.shadows.lg,
                transition: "transform 180ms ease, opacity 180ms ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2] }}>
                Are you sure you want to publish this workshop?
              </h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
                Publishing will make the workshop visible to all stakeholders (students, staff, TAs, professors,
                and admins). This action can be reversed later by an Events Office administrator.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                <Button variant="outline" onClick={() => setPublishCandidate(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const w = publishCandidate;

                    // Create a published event object consistent with EventCard expectations
                    const publishedEvent = {
                      _id: `local-published-${Date.now()}`,
                      title: w.name,
                      name: w.name,
                      description: w.description || w.shortDescription,
                      type: "workshop",
                      startDate: w.startDate,
                      endDate: w.endDate,
                      location: w.location,
                      instructor: w.instructor,
                      duration: w.duration || 3,
                      status: "published",
                      // Ensure registration is required so the card shows "Registration Open"
                      registrationRequired: true,
                      currentParticipants: 0,
                      maxParticipants: 100,
                      // No registrationDeadline provided so registration remains open until start
                      organizerDetails: { name: w.professorName },
                    };

                    // Animate removal and insertion: update states
                    setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));
                    setEvents((prev) => [publishedEvent, ...prev]);
                    toast.success(`Published "${w.name}"`);

                    // Close modal
                    setPublishCandidate(null);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Reject confirmation modal */}
        {rejectCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              zIndex: 10000,
            }}
            onClick={() => setRejectCandidate(null)}
          >
            <div
              style={{
                width: "520px",
                maxWidth: "95%",
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing[5],
                boxShadow: theme.shadows.lg,
                transition: "transform 180ms ease, opacity 180ms ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2] }}>
                Confirm rejection
              </h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
                Rejecting this workshop will mark it as <strong>rejected</strong> and remove it from the pending approvals list.
                This does not delete the workshop from the database and it will not appear in any public views.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                <Button variant="outline" onClick={() => setRejectCandidate(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const w = rejectCandidate;

                    // Remove locally
                    setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));

                    // If this pending has a backend id, call API to mark rejected
                    if (w._id) {
                      try {
                        await eventAPI.updateEventStatus(w._id, "rejected");
                        toast.success(`Rejected "${w.name}"`);
                      } catch (err) {
                        console.error("Failed to mark event as rejected:", err);
                        toast.error("Failed to reject event on server. See console for details.");
                      }
                    } else {
                      toast.success(`Rejected "${w.name}"`);
                    }

                    setRejectCandidate(null);
                  }}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default EventsPage;