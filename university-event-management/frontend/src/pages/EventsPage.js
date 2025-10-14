import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import theme, { getEventTypeColor } from "../theme";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import ConferenceModal from "./ConferenceModal";
import LoadingScreen from "../components/LoadingScreen";
import api, { eventAPI, workshopAPI, createCancelTokenSource } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import CreateDropdownButton from '../components/CreateDropdownButton';

const BazaarManagementCard = ({ bazaar, onEdit, onDelete }) => {
  const cardStyle = {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.card,
    boxShadow: theme.shadows.card,
    overflow: "hidden",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${getEventTypeColor('bazaar')} 0%, ${getEventTypeColor('bazaar')}dd 100%)`,
    padding: theme.spacing[4],
    color: theme.colors.text.white,
  };

  const labelStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: 'inline-block',
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.tight,
    margin: 0,
    marginTop: theme.spacing[2],
  };

  const now = new Date();
  const hasStarted = new Date(bazaar.startDate) <= now;
  const hasEnded = new Date(bazaar.endDate) < now;

  return (
    <div style={cardStyle}>
      <div>
        <div style={headerStyle}>
          <div style={labelStyle}>
            Bazaar
          </div>
          <h3 style={titleStyle}>
            {bazaar.title || bazaar.name}
          </h3>
        </div>

        <div style={{ padding: theme.spacing[5] }}>
          <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: theme.typography.fontSize.sm }}>
            {new Date(bazaar.startDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <p style={{ color: theme.colors.text.secondary, margin: `${theme.spacing[1]} 0`, fontSize: theme.typography.fontSize.sm }}>
            📍 {bazaar.location}
          </p>
          <p style={{ color: theme.colors.text.primary, marginTop: theme.spacing[4], fontSize: theme.typography.fontSize.base, maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {bazaar.description}
          </p>
        </div>
      </div>

      <div style={{ padding: `0 ${theme.spacing[5]} ${theme.spacing[5]}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing[4], borderTop: `1px solid ${theme.colors.border}`,
            paddingTop: theme.spacing[4] }}>
          <span>Participants</span>
          <span style={{ fontWeight: "bold" }}>
            {bazaar.currentParticipants} / {bazaar.maxParticipants}
          </span>
        </div>
        <div style={{ display: "flex", gap: theme.spacing[2], width: "100%" }}>
          {!hasStarted ? (
            <>
              <Button variant="primary" onClick={() => onEdit(bazaar)} style={{ flex: 1 }}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(bazaar._id)} style={{ flex: 1 }}>
                Delete
              </Button>
            </>
          ) : hasEnded ? (
            <Button variant="secondary" disabled style={{ width: "100%" }}>
              Event Ended
            </Button>
          ) : (
            <Button variant="secondary" disabled style={{ width: "100%" }}>
              Event Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const navigate = useNavigate();
  const { isEventsOffice } = useAuth();
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [editingConference, setEditingConference] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    upcoming: true,
  });

  // Add ref for cancel token to prevent memory leaks and connection issues
  const cancelTokenRef = useRef(null);

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

  // State for creating a new bazaar
  const [createBazaarOpen, setCreateBazaarOpen] = useState(false);
  const [bazaarData, setBazaarData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "University Courtyard",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  // Edit Modal state
  const [editingBazaar, setEditingBazaar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBazaarData, setEditBazaarData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  const fetchEvents = async () => {
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled due to new request');
    }

    // Create new cancel token
    cancelTokenRef.current = createCancelTokenSource();
    const currentCancelToken = cancelTokenRef.current;

    try {
      setLoading(true);
      setError(null);
      
      // Use cancel token for the main events request
      const response = await eventAPI.getEvents(
        { /*status: ["published", "accepted", "approved"]*/ }, 
        currentCancelToken
      );
      
      let allEvents = response.data?.data || [];

      // If current user is Events Office, fetch their other items
      if (auth?.isEventsOffice) {
        try {
          // 1. Fetch pending and needs_revision workshops
          const pendingCancelToken = createCancelTokenSource();
          const revisionCancelToken = createCancelTokenSource();
          
          const [pendingResp, revisionResp, userBazaarsResponse] = await Promise.all([
            api.get('/workshops?status=pending', {
              cancelToken: pendingCancelToken.token
            }),
            api.get('/workshops?status=needs_revision', {
              cancelToken: revisionCancelToken.token
            }),
            // 2. Fetch user-created bazaars (drafts, etc.)
            api.get('/bazaars', {
              cancelToken: currentCancelToken.token
            })
          ]);
          
          const pendingWorkshopsData = pendingResp.data || [];
          const revisionWorkshops = revisionResp.data || [];
          
          setPendingWorkshops([...pendingWorkshopsData, ...revisionWorkshops]);

          const allBazaars = userBazaarsResponse.data?.data || [];
          const userBazaars = allBazaars.filter(bazaar => {
              const isOwner = (typeof bazaar.organizer === "object" && bazaar.organizer?._id === auth.user?.id) || (typeof bazaar.organizer === "string" && bazaar.organizer === auth.user?.id);
              return isOwner;
          });

          // Combine and de-duplicate events and bazaars
          const eventsMap = new Map();
          allEvents.forEach(event => eventsMap.set(event._id, event));
          userBazaars.forEach(bazaar => eventsMap.set(bazaar._id, bazaar));

          allEvents = Array.from(eventsMap.values());

        } catch (err) {
          // Only log if not a cancellation
          if (!err.isCancelled && err.name !== 'CanceledError') {
            console.warn('Could not fetch additional Events Office data', err);
          }
        }
      }
      
      setEvents(allEvents);

    } catch (err) {
      // Don't show error for cancelled requests
      if (err.isCancelled || err.name === 'CanceledError') {
        return;
      }
      
      console.error(err);
      setError(err);
      toast.error("Failed to load events. Please try again.");
    } finally {
      // Always update loading state to prevent UI stuck in loading
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Listen for workshop deletion events from other tabs via localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'workshop_deleted' && e.newValue) {
        console.log('Workshop deleted in another tab, refreshing events...');
        fetchEvents();
        // Clear the flag
        localStorage.removeItem('workshop_deleted');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function to cancel any pending requests when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      
      // Cancel any pending requests to prevent connection issues
      if (cancelTokenRef.current) {
        try {
          cancelTokenRef.current.cancel('Component unmounting');
        } catch (error) {
          // Ignore cancellation errors during cleanup
        }
      }
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

const applyFilters = () => {
  let filtered = [...events];
  
  if (filters.type) {
    filtered = filtered.filter((e) => e.type === filters.type);
  }
  
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter((e) => {
      const title = (e.title || e.name || "").toLowerCase();
      const description = (e.description || "").toLowerCase();
      const location = (e.location || "").toLowerCase();
      const instructor = (e.instructor || e.professorName || "").toLowerCase();
      
      return (
        title.includes(s) ||
        description.includes(s) ||
        location.includes(s) ||
        instructor.includes(s)
      );
    });
  }
  
  if (filters.upcoming) {
    const now = new Date();
    filtered = filtered.filter((e) => new Date(e.startDate) > now);
  }
  
  setFilteredEvents(filtered);
};
// 1. First, fix the button:


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
      fetchEvents();
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
    setEditBazaarData({
      title: bazaar.title || bazaar.name,
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
      !editBazaarData.title ||
      !editBazaarData.description ||
      !editBazaarData.startDate ||
      !editBazaarData.endDate ||
      !editBazaarData.registrationDeadline ||
      !editBazaarData.theme ||
      !editBazaarData.location ||
      !editBazaarData.maxParticipants
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (
      new Date(editBazaarData.registrationDeadline) >= 
      new Date(editBazaarData.startDate)
    ) {
      toast.error(
        "Registration deadline must be before the event's start date."
      );
      return;
    }
    try {
      const updatedEventData = {
        title: editBazaarData.title,
        description: editBazaarData.description,
        startDate: new Date(editBazaarData.startDate).toISOString(),
        endDate: new Date(editBazaarData.endDate).toISOString(),
        location: editBazaarData.location,
        maxParticipants: Number(editBazaarData.maxParticipants),
        registrationDeadline: new Date(
          editBazaarData.registrationDeadline
        ).toISOString(),
        tags: editBazaarData.theme ? [editBazaarData.theme] : [],
      };
      await api.put(`/bazaars/${editingBazaar._id}`, updatedEventData);
      toast.success("Bazaar updated successfully!");
      handleCloseEditModal();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bazaar.");
    }
  };

  const eventTypeOptions = [
    { value: "", label: "All Types" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "booth", label: "Booths" },
    { value: "conference", label: "Conferences" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: theme.colors.background.default }}>
      <Navbar />
      <LoadingScreen type="events" />
    </div>
  );

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
              label="Bazaar Name *"
              value={editBazaarData.title}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, title: e.target.value })
              }
            />
            <Input
              label="Theme *"
              value={editBazaarData.theme}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, theme: e.target.value })
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
                Description *
              </label>
              <textarea
                rows="4"
                value={editBazaarData.description}
                onChange={(e) =>
                  setEditBazaarData({ ...editBazaarData, description: e.target.value })
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
                label="Start Date *"
                type="datetime-local"
                value={editBazaarData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  const updatedData = {
                    ...editBazaarData,
                    startDate: newStartDate,
                  };
                  if (updatedData.endDate && newStartDate > updatedData.endDate)
                    updatedData.endDate = "";
                  if (
                    updatedData.registrationDeadline &&
                    newStartDate <= updatedData.registrationDeadline
                  )
                    updatedData.registrationDeadline = "";
                  setEditBazaarData(updatedData);
                }}
              />
              <Input
                label="End Date *"
                type="datetime-local"
                value={editBazaarData.endDate}
                min={editBazaarData.startDate}
                onChange={(e) =>
                  setEditBazaarData({ ...editBazaarData, endDate: e.target.value })
                }
              />
            </div>
            <Input
              label="Location *"
              value={editBazaarData.location}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, location: e.target.value })
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
                label="Max Participants *"
                type="number"
                min="1"
                value={editBazaarData.maxParticipants}
                onChange={(e) =>
                  setEditBazaarData({
                    ...editBazaarData,
                    maxParticipants: e.target.value,
                  })
                }
              />
              <Input
                label="Registration Deadline *"
                type="datetime-local"
                value={editBazaarData.registrationDeadline}
                max={editBazaarData.startDate}
                onChange={(e) =>
                  setEditBazaarData({
                    ...editBazaarData,
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
    <>
      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
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
                      {w.workshopName || w.name}
                    </div>
                    <div style={{ color: theme.colors.text.secondary, marginTop: theme.spacing[1] }}>
                      <strong>Professor:</strong> {w.createdBy ? `${w.createdBy.firstName} ${w.createdBy.lastName}` : (w.professorName || 'N/A')} • <strong>Date:</strong>{" "}
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

                    // Remove from pending list locally
                    setPendingWorkshops((prev) => prev.filter((p) => p._id !== w._id));

                    // Call backend API to request edits
                    if (w._id) {
                      try {
                        await workshopAPI.requestEditWorkshop(w._id, requestEditsMessage.trim());
                        toast.success("Edit request sent successfully!");
                      } catch (err) {
                        console.error("Failed to send edit request:", err);
                        toast.error("Failed to send edit request. Please try again.");
                      }
                    } else {
                      toast.success("Edit request sent successfully!");
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
          <CreateDropdownButton onConferenceModalOpen={() => setShowConferenceModal(true)} onBazaarModalOpen={() => setCreateBazaarOpen(true)} />
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
            {filteredEvents.map((event) => {
              const isOwner = (typeof event.organizer === "object" && event.organizer?._id === auth.user?.id) || (typeof event.organizer === "string" && event.organizer === auth.user?.id);
              if (event.type === 'bazaar' && auth.isEventsOffice && isOwner) {
                return (
                  <BazaarManagementCard
                    key={event._id}
                    bazaar={event}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBazaar}
                  />
                );
              }
              return (
                <EventCard
                  key={event._id}
                  event={event}
                  onRegistrationSuccess={handleRegistrationSuccess}
                  onEventUpdate={fetchEvents}
                  onEditConference={(conference) => {
                    setEditingConference(conference);
                    setShowConferenceModal(true);
                  }}
                />
              );
            })}
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

        {/* Error state - Only show when there are no events AND there's an error */}
        {error && !loading && filteredEvents.length === 0 && (
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
                <h2 style={{ margin: 0 }}>{selectedPending.workshopName || selectedPending.name}</h2>
                <div style={{ display: "flex", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setSelectedPending(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div style={{ marginTop: theme.spacing[4], color: theme.colors.text.secondary }}>
                <p><strong>Professor / Instructor:</strong> {selectedPending.createdBy ? `${selectedPending.createdBy.firstName} ${selectedPending.createdBy.lastName}` : (selectedPending.professorName || selectedPending.instructor || 'N/A')}</p>
                <p>
                  <strong>Date:</strong> {new Date(selectedPending.startDate).toLocaleString()} - {new Date(selectedPending.endDate).toLocaleString()}
                </p>
                <p><strong>Location:</strong> {selectedPending.location}</p>
                <p style={{ marginTop: theme.spacing[3] }}>{selectedPending.shortDescription || selectedPending.description}</p>

                <hr style={{ margin: `${theme.spacing[4]} 0`, borderColor: theme.colors.border }} />

                <h3>Full Details</h3>
                <p><strong>Agenda</strong></p>
                <pre style={{ whiteSpace: 'pre-wrap', background: theme.colors.background.default, padding: theme.spacing[3], borderRadius: theme.borderRadius.sm }}>{selectedPending.fullAgenda || selectedPending.details?.agenda || 'No agenda provided'}</pre>

                <p><strong>Faculty Responsible:</strong> {selectedPending.facultyResponsible || selectedPending.details?.facultyResponsible || 'N/A'}</p>
                <p><strong>Budget:</strong> {selectedPending.requiredBudget || selectedPending.details?.budget || 'N/A'}</p>
                <p><strong>Funding Source:</strong> {selectedPending.fundingSource || selectedPending.details?.fundingSource || 'N/A'}</p>
                <p><strong>Contact Email:</strong> {selectedPending.contactEmail || selectedPending.details?.contactEmail || 'N/A'}</p>
                <p><strong>Extra Resources:</strong> {selectedPending.extraRequiredResources || selectedPending.details?.materials || 'N/A'}</p>
                <p><strong>Professors Participating:</strong> {selectedPending.professorsParticipating || selectedPending.details?.prerequisites || 'N/A'}</p>
                <p><strong>Registration Deadline:</strong> {selectedPending.registrationDeadline ? new Date(selectedPending.registrationDeadline).toLocaleString() : 'N/A'}</p>
                <p><strong>Capacity:</strong> {selectedPending.capacity || 'N/A'}</p>
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
                  onClick={async () => {
                    const w = publishCandidate;

                    try {
                      // Call the backend API to publish the workshop
                      const response = await workshopAPI.publishWorkshop(w._id);
                      
                      if (response.data.success && response.data.event) {
                        const publishedEvent = response.data.event;
                        
                        // Remove from pending workshops
                        setPendingWorkshops((prev) => prev.filter((p) => p._id !== w._id));
                        
                        // Add to events list
                        setEvents((prev) => [publishedEvent, ...prev]);
                        
                        // Show success message with workshop name
                        toast.success(`Workshop "${w.workshopName || 'successfully'}" published!`);
                      } else {
                        toast.error("Failed to publish workshop. Please try again.");
                      }
                    } catch (err) {
                      console.error("Failed to publish workshop:", err);
                      toast.error(err.response?.data?.message || "Failed to publish workshop on server.");
                    }

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
                        await workshopAPI.rejectWorkshop(w._id);
                        toast.success(`Workshop successfully rejected!`);
                      } catch (err) {
                        console.error("Failed to reject workshop:", err);
                        toast.error("Failed to reject workshop on server. See console for details.");
                      }
                    } else {
                      toast.success(`Workshop successfully rejected!`);
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
      {/* Create Bazaar Panel */}
      {createBazaarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 20000,
            display: "flex",
            justifyContent: "center",
            paddingTop: theme.spacing[6],
          }}
          onClick={() => setCreateBazaarOpen(false)}
        >
          <div
            style={{
              width: "800px",
              maxWidth: "95%",
              background: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              padding: theme.spacing[6],
              animation: "slide-down 0.3s ease-out",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4] }}>
              Create New Bazaar
            </h2>
            
            <div style={{ display: "grid", gap: theme.spacing[4] }}>
              <Input
                label="Bazaar Name *"
                placeholder="e.g., Annual Spring Fair"
                value={bazaarData.title}
                onChange={(e) => setBazaarData({ ...bazaarData, title: e.target.value })}
              />
              <Input
                label="Theme *"
                placeholder="e.g., 80s Retro, Sci-Fi, etc."
                value={bazaarData.theme}
                onChange={(e) => setBazaarData({ ...bazaarData, theme: e.target.value })}
              />
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing[2], color: theme.colors.text.secondary }}>Description *</label>
                <textarea
                  rows="4"
                  placeholder="A brief summary of the bazaar, what vendors can expect, and any special attractions."
                  value={bazaarData.description}
                  onChange={(e) => setBazaarData({ ...bazaarData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: theme.spacing[3],
                    fontSize: theme.typography.fontSize.base,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                <Input
                  label="Start Date *"
                  type="datetime-local"
                  value={bazaarData.startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    const updatedData = { ...bazaarData, startDate: newStartDate };

                    // If the new start date makes the end date invalid, clear it.
                    if (updatedData.endDate && newStartDate > updatedData.endDate) {
                      updatedData.endDate = "";
                    }

                    // If the registration deadline is now invalid (i.e., not before the start date), clear it.
                    if (
                      updatedData.registrationDeadline &&
                      newStartDate <= updatedData.registrationDeadline
                    ) {
                      updatedData.registrationDeadline = "";
                    }

                    setBazaarData(updatedData);
                  }}
                />
                <Input
                  label="End Date *"
                  type="datetime-local"
                  value={bazaarData.endDate}
                  min={bazaarData.startDate} // Prevent selecting an end date before the start date
                  onChange={(e) => setBazaarData({ ...bazaarData, endDate: e.target.value })}
                />
              </div>
              <Input
                label="Location *"
                value={bazaarData.location}
                onChange={(e) => setBazaarData({ ...bazaarData, location: e.target.value })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                <Input
                  label="Max Participants *"
                  type="number"
                  placeholder="50"
                  min="1"
                  value={bazaarData.maxParticipants}
                  onChange={(e) => setBazaarData({ ...bazaarData, maxParticipants: e.target.value })}
                />
                <Input
                  label="Registration Deadline *"
                  type="datetime-local"
                  value={bazaarData.registrationDeadline}
                  max={bazaarData.startDate}
                  onChange={(e) => setBazaarData({ ...bazaarData, registrationDeadline: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
              <Button variant="outline" onClick={() => setCreateBazaarOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setBazaarData({ title: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" });
                  toast.success("Form fields cleared");
                }}
              >
                Clear Draft
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    if (!bazaarData.title || !bazaarData.description || !bazaarData.theme || !bazaarData.startDate || !bazaarData.endDate || !bazaarData.maxParticipants || !bazaarData.registrationDeadline) {
                      toast.error("Please fill all required fields: Name, Description, Theme, Dates, Max Participants, and Registration Deadline.");
                      return;
                    }

                    if (new Date(bazaarData.registrationDeadline) >= new Date(bazaarData.startDate)) {
                      toast.error("Registration deadline must be set before the event's start date.");
                      return;
                    }

                    const eventData = {
                      title: bazaarData.title,
                      description: bazaarData.description,
                      startDate: new Date(bazaarData.startDate).toISOString(),
                      endDate: new Date(bazaarData.endDate).toISOString(),
                      location: bazaarData.location,
                      maxParticipants: Number(bazaarData.maxParticipants),
                      registrationDeadline: new Date(bazaarData.registrationDeadline).toISOString(),
                      registrationRequired: true,
                      tags: bazaarData.theme ? [bazaarData.theme] : [],
                      status: 'published',
                    };

                    await api.post("/bazaars", eventData);

                    toast.success(`Bazaar "${bazaarData.title}" has been published!`);
                    setCreateBazaarOpen(false);
                    setBazaarData({ title: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" });
                    fetchEvents();
                  } catch (error) {
                    console.error("Failed to create bazaar:", error);
                    toast.error(error.data?.message || error.message || "Failed to create bazaar. Please try again.");
                  }
                }}
              >
                Publish Bazaar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Conference Modal */}
      <ConferenceModal
        isOpen={showConferenceModal}
        onClose={() => {
          setShowConferenceModal(false);
          setEditingConference(null);
        }}
        conference={editingConference}
        onSuccess={() => {
          fetchEvents(); // Refresh events list
          setEditingConference(null);
        }}
      />
      {renderEditModal()}
    </>
  );
};

export default EventsPage;