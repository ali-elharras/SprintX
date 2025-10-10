import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import theme from "../theme";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import api, { eventAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EventsPage = () => {
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [pendingWorkshops, setPendingWorkshops] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: "", search: "", upcoming: true });
  
  // State for confirmation modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [workshopToReject, setWorkshopToReject] = useState(null);
  
  // State for edit request modal
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState(null);
  const [editRequestMessage, setEditRequestMessage] = useState("");

  // State for creating a new bazaar
  const [createBazaarOpen, setCreateBazaarOpen] = useState(false);
  const [bazaarData, setBazaarData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "University Courtyard",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getEvents({ status: "published", upcoming: "true" });
      setEvents(response.data?.data || []);

      // If current user is Events Office, also fetch pending and needs_revision workshops
      if (auth?.isEventsOffice) {
        try {
          // Fetch both pending and needs_revision workshops
          const [pendingResp, revisionResp] = await Promise.all([
            api.get('/workshops?status=pending'),
            api.get('/workshops?status=needs_revision')
          ]);
          
          // Combine both types of workshops
          const pendingWorkshops = pendingResp.data || [];
          const revisionWorkshops = revisionResp.data || [];
          
          setPendingWorkshops([...pendingWorkshops, ...revisionWorkshops]);
        } catch (err) {
          console.warn('Could not fetch pending workshops', err);
          setPendingWorkshops([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const applyFilters = () => {
    let filtered = [...events];
    if (filters.type) filtered = filtered.filter((e) => e.type === filters.type);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) => (e.title || e.name || "").toLowerCase().includes(s) || (e.description || "").toLowerCase().includes(s) || (e.location || "").toLowerCase().includes(s)
      );
    }
    if (filters.upcoming) {
      const now = new Date();
      filtered = filtered.filter((e) => new Date(e.startDate) > now);
    }
    setFilteredEvents(filtered);
  };

  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value }));
  const handleRegistrationSuccess = () => fetchEvents();

  const eventTypeOptions = [
    { value: "", label: "All Types" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "competition", label: "Competitions" },
    { value: "conference", label: "Conferences" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: theme.colors.background.default }}>
      <Navbar />
      <LoadingScreen type="events" />
    </div>
  );

  return (
    <>
      <style>{`@keyframes slide-down { from { transform: translateY(-20%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <Navbar />
      <div style={{ minHeight: "100vh", background: theme.colors.background.default, padding: theme.spacing[6] }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: theme.spacing[8] }}>
            <h1 style={{ fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing[2], textAlign: "center" }}>University Events</h1>
            <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
              Discover and register for workshops, trips, and other exciting events happening at our university.
            </p>
          </div>

          <div style={{ background: theme.colors.background.paper, padding: theme.spacing[5], borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing[6] }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: theme.spacing[4], alignItems: "end" }}>
              <Input label="Search Events" placeholder="Search by title, description, or location..." value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} />
              <Select label="Event Type" options={eventTypeOptions} value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)} />
              <Button variant={filters.upcoming ? "primary" : "secondary"} onClick={() => handleFilterChange("upcoming", !filters.upcoming)}>{filters.upcoming ? "Upcoming Only" : "All Events"}</Button>
              <Button variant="outline" onClick={fetchEvents}>Refresh</Button>
              {auth.isEventsOffice && (
                <Button variant="primary" onClick={() => setCreateBazaarOpen(true)} style={{ background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)', color: 'white', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>+ Create Bazaar</Button>
              )}
            </div>
          </div>

          {/* Events Office: Pending Workshops Approval Section - MOVED TO TOP */}
          {auth.isEventsOffice && pendingWorkshops.length > 0 && (
            <div style={{ marginBottom: theme.spacing[8] }}>
              <h2 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing[4] }}>Workshops Waiting for Approval</h2>
              <div style={{ display: 'flex', gap: theme.spacing[3], marginBottom: theme.spacing[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: theme.colors.primary.light 
                  }}></div>
                  <span style={{ fontSize: theme.typography.fontSize.sm }}>Pending</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: theme.colors.warning.main 
                  }}></div>
                  <span style={{ fontSize: theme.typography.fontSize.sm }}>Needs Revision</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: theme.spacing[6] }}>
                {pendingWorkshops.map((w) => (
                  <div key={w._id} style={{ 
                    background: theme.colors.background.paper, 
                    padding: theme.spacing[4], 
                    borderRadius: theme.borderRadius.lg, 
                    boxShadow: theme.shadows.md,
                    position: 'relative'
                  }}>
                    {/* Status badge */}
                    {w.status === 'needs_revision' && (
                      <div style={{
                        position: 'absolute',
                        top: theme.spacing[2],
                        right: theme.spacing[2],
                        backgroundColor: theme.colors.warning.main,
                        color: theme.colors.warning.contrastText,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        borderRadius: theme.borderRadius.full,
                      }}>
                        Needs Revision
                      </div>
                    )}
                    <h3 style={{ marginTop: 0 }}>{w.workshopName}</h3>
                    <p style={{ color: theme.colors.text.secondary }}>{w.shortDescription}</p>
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Start: {new Date(w.startDate).toLocaleString()}</p>
                    
                    {/* Show edit requests if they exist */}
                    {w.editRequests && w.editRequests.length > 0 && (
                      <div style={{
                        marginTop: theme.spacing[3],
                        padding: theme.spacing[3],
                        backgroundColor: theme.colors.background.default,
                        borderRadius: theme.borderRadius.base,
                        borderLeft: `4px solid ${theme.colors.warning.main}`
                      }}>
                        <p style={{ 
                          fontSize: theme.typography.fontSize.sm, 
                          fontWeight: theme.typography.fontWeight.medium,
                          marginTop: 0, 
                          marginBottom: theme.spacing[2] 
                        }}>
                          Latest Edit Request:
                        </p>
                        <p style={{ 
                          fontSize: theme.typography.fontSize.sm,
                          marginTop: 0,
                          marginBottom: theme.spacing[1]
                        }}>
                          {w.editRequests[w.editRequests.length-1].message}
                        </p>
                        <p style={{ 
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.text.secondary,
                          margin: 0 
                        }}>
                          Requested by: {w.editRequests[w.editRequests.length-1].requestedBy?.name || 'Events Office'}
                          {w.editRequests[w.editRequests.length-1].requestedAt && 
                           ` on ${new Date(w.editRequests[w.editRequests.length-1].requestedAt).toLocaleString()}`}
                        </p>
                      </div>
                    )}
                    <div style={{ marginTop: theme.spacing[4], display: 'flex', justifyContent: 'flex-end', gap: theme.spacing[3] }}>
                      <Button variant="primary" onClick={async () => {
                        try {
                          const toastId = toast.loading('Publishing workshop...');

                          // Call the publish endpoint
                          const response = await api.post(`/workshops/${w._id}/publish`);

                          console.log('Publish response:', response);
                          toast.dismiss(toastId);
                          toast.success('Workshop published successfully!');

                          // If backend returned the created event object, add it locally so the UI updates immediately
                          const createdEvent = response?.data?.event || response?.data?.data || null;
                          if (createdEvent) {
                            // Normalize fields to match frontend EventCard expectations
                            const normalized = {
                              ...createdEvent,
                              title: createdEvent.title || createdEvent.name || createdEvent.workshopName || '',
                              name: createdEvent.name || createdEvent.title || createdEvent.workshopName || '',
                              startDate: createdEvent.startDate ? new Date(createdEvent.startDate).toISOString() : new Date().toISOString(),
                              endDate: createdEvent.endDate ? new Date(createdEvent.endDate).toISOString() : (createdEvent.startDate ? new Date(createdEvent.startDate).toISOString() : new Date().toISOString()),
                              description: createdEvent.description || createdEvent.shortDescription || createdEvent.fullAgenda || '',
                            };

                            // Ensure we don't duplicate
                            setEvents((prev) => {
                              const exists = prev.some((ev) => (ev._id || ev.id) === (normalized._id || normalized.id));
                              if (exists) return prev;
                              return [normalized, ...prev];
                            });

                            // Remove the published workshop from pendingWorkshops locally
                            setPendingWorkshops((prev) => prev.filter((p) => p._id !== w._id));
                          }

                          // Still trigger a background refresh to keep everything fully synced
                          fetchEvents();
                        } catch (err) {
                          console.error('Publish error:', err);
                          toast.dismiss();

                          // Extract error message from various possible locations
                          let errorMsg;
                          if (err.response?.data?.message) {
                            errorMsg = err.response.data.message;
                          } else if (err.data?.message) {
                            errorMsg = err.data.message;
                          } else if (err.message) {
                            errorMsg = err.message;
                          } else {
                            errorMsg = 'Failed to publish workshop. Please check if you have Events Office permissions.';
                          }

                          toast.error(errorMsg);
                        }
                      }}>Accept and Publish</Button>
                      <Button 
                        variant="outline" 
                        style={{
                          color: theme.colors.primary.main,
                          borderColor: theme.colors.primary.main,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => {
                          // Open edit request modal and set current workshop
                          setWorkshopToEdit(w);
                          setEditRequestModalOpen(true);
                        }}
                      >Request Edit</Button>
                      <Button 
                        variant="outline" 
                        style={{ 
                          color: theme.colors.status.error, 
                          borderColor: theme.colors.status.error,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => {
                          // Open confirmation modal and set current workshop
                          setWorkshopToReject(w);
                          setRejectModalOpen(true);
                        }}
                      >Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular Events Section */}
          {filteredEvents.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: theme.spacing[6] }}>
              {filteredEvents.map((event) => <EventCard key={event._id} event={event} onRegistrationSuccess={handleRegistrationSuccess} />)}
            </div>
          ) : (
            <div style={{ background: theme.colors.background.paper, padding: theme.spacing[12], borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center" }}>
              <div style={{ fontSize: theme.typography.fontSize["4xl"], marginBottom: theme.spacing[4] }}>📅</div>
              <h3 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing[2] }}>No Events Found</h3>
              <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>{filters.search || filters.type ? "Try adjusting your filters to see more events." : "There are no upcoming events at the moment."}</p>
              <Button variant="outline" onClick={() => setFilters({ type: "", search: "", upcoming: true })}>Clear Filters</Button>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div style={{ marginTop: theme.spacing[8], padding: theme.spacing[4], background: theme.colors.background.paper, borderRadius: theme.borderRadius.base, textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              Showing {filteredEvents.length} of {events.length} events
            </div>
          )}

          {error && !loading && (
            <div style={{ background: theme.colors.background.paper, padding: theme.spacing[8], borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center", border: `2px solid ${theme.colors.status.error}` }}>
              <div style={{ fontSize: theme.typography.fontSize["2xl"], marginBottom: theme.spacing[4], color: theme.colors.status.error }}>⚠️</div>
              <h3 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing[2] }}>Failed to Load Events</h3>
              <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>{error.message || "There was an error loading events. Please try again."}</p>
              <Button variant="primary" onClick={fetchEvents}>Retry</Button>
            </div>
          )}

        </div>
      </div>

      {/* Edit Request Modal */}
      {editRequestModalOpen && workshopToEdit && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20000, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setEditRequestModalOpen(false)}>
          <div style={{ width: "600px", maxWidth: "95%", background: theme.colors.background.paper, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.lg, padding: theme.spacing[6], animation: "slide-down 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4], color: theme.colors.primary.main }}>Request Workshop Edits</h2>
            <p style={{ marginBottom: theme.spacing[4], fontSize: theme.typography.fontSize.base }}>
              Please provide feedback for <strong>{workshopToEdit.workshopName}</strong>. 
              This will mark the workshop as "needs_revision" and send your feedback to the professor.
            </p>
            
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing[2], color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium }}>
                Edit Request Details:
              </label>
              <textarea 
                rows="4" 
                placeholder="Please provide specific details about what needs to be changed or improved..." 
                value={editRequestMessage}
                onChange={(e) => setEditRequestMessage(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: theme.spacing[3], 
                  fontSize: theme.typography.fontSize.base, 
                  border: `1px solid ${theme.colors.border}`, 
                  borderRadius: theme.borderRadius.base, 
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }} 
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
              <Button variant="outline" onClick={() => {
                setEditRequestModalOpen(false);
                setWorkshopToEdit(null);
                setEditRequestMessage("");
              }}>Cancel</Button>
              <Button 
                variant="primary"
                disabled={!editRequestMessage.trim()}
                onClick={async () => {
                  try {
                    if (!editRequestMessage.trim()) {
                      toast.error("Please provide feedback for the edit request.");
                      return;
                    }
                    
                    const toastId = toast.loading('Sending edit request...');
                    
                    // Send edit request using the dedicated endpoint
                    await api.post(`/workshops/${workshopToEdit._id}/request-edit`, {
                      message: editRequestMessage
                    });
                    
                    toast.dismiss(toastId);
                    toast.success('Edit request sent successfully.');
                    
                    // Update UI to reflect the status change and add the new edit request
                    setPendingWorkshops((prev) => prev.map(w => 
                      w._id === workshopToEdit._id 
                      ? { 
                          ...w, 
                          status: 'needs_revision',
                          editRequests: [
                            ...(w.editRequests || []),
                            {
                              message: editRequestMessage,
                              requestedBy: {
                                id: auth.user?.id,
                                name: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : 'Events Office'
                              },
                              requestedAt: new Date(),
                              status: 'needs_revision'
                            }
                          ]
                        }
                      : w
                    ));
                    
                    // Close modal and reset state
                    setEditRequestModalOpen(false);
                    setWorkshopToEdit(null);
                    setEditRequestMessage("");
                    
                    // Refresh the workshops list to ensure everything is updated
                    fetchEvents();
                  } catch (err) {
                    console.error('Edit request error:', err);
                    toast.error('Failed to send edit request. Please try again.');
                  }
                }}
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Workshop Modal */}
      {rejectModalOpen && workshopToReject && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20000, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setRejectModalOpen(false)}>
          <div style={{ width: "500px", maxWidth: "95%", background: theme.colors.background.paper, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.lg, padding: theme.spacing[6], animation: "slide-down 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4], color: theme.colors.status.error }}>Reject Workshop</h2>
            <p style={{ marginBottom: theme.spacing[4], fontSize: theme.typography.fontSize.base }}>
              Are you sure you want to reject <strong>{workshopToReject.workshopName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
              <Button variant="outline" onClick={() => {
                setRejectModalOpen(false);
                setWorkshopToReject(null);
              }}>Cancel</Button>
              <Button 
                variant="primary" 
                style={{ 
                  backgroundColor: theme.colors.status.error, 
                  borderColor: theme.colors.status.error 
                }}
                onClick={async () => {
                  try {
                    const toastId = toast.loading('Rejecting workshop...');
                    // Delete the workshop from database
                    await api.delete(`/workshops/${workshopToReject._id}`);
                    
                    toast.dismiss(toastId);
                    toast.success('Workshop rejected and removed.');
                    
                    // Remove from UI immediately
                    setPendingWorkshops((prev) => prev.filter((p) => p._id !== workshopToReject._id));
                    
                    // Close modal and reset state
                    setRejectModalOpen(false);
                    setWorkshopToReject(null);
                  } catch (err) {
                    console.error('Reject error:', err);
                    toast.error('Failed to reject workshop. Please try again.');
                  }
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {createBazaarOpen && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20000, display: "flex", justifyContent: "center", paddingTop: theme.spacing[6] }} onClick={() => setCreateBazaarOpen(false)}>
          <div style={{ width: "800px", maxWidth: "95%", background: theme.colors.background.paper, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.lg, padding: theme.spacing[6], animation: "slide-down 0.3s ease-out", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4] }}>Create New Bazaar</h2>
            <div style={{ display: "grid", gap: theme.spacing[4] }}>
              <Input label="Bazaar Name" placeholder="e.g., Annual Spring Fair" value={bazaarData.name} onChange={(e) => setBazaarData({ ...bazaarData, name: e.target.value })} />
              <Input label="Theme" placeholder="e.g., 80s Retro, Sci-Fi, etc." value={bazaarData.theme} onChange={(e) => setBazaarData({ ...bazaarData, theme: e.target.value })} />
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing[2], color: theme.colors.text.secondary }}>Description</label>
                <textarea rows="4" placeholder="A brief summary of the bazaar, what vendors can expect, and any special attractions." value={bazaarData.description} onChange={(e) => setBazaarData({ ...bazaarData, description: e.target.value })} style={{ width: '100%', padding: theme.spacing[3], fontSize: theme.typography.fontSize.base, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                <Input label="Start Date" type="datetime-local" value={bazaarData.startDate} onChange={(e) => {
                  const newStartDate = e.target.value; const updatedData = { ...bazaarData, startDate: newStartDate };
                  if (updatedData.endDate && newStartDate > updatedData.endDate) updatedData.endDate = "";
                  if (updatedData.registrationDeadline && newStartDate <= updatedData.registrationDeadline) updatedData.registrationDeadline = "";
                  setBazaarData(updatedData);
                }} />
                <Input label="End Date" type="datetime-local" value={bazaarData.endDate} min={bazaarData.startDate} onChange={(e) => setBazaarData({ ...bazaarData, endDate: e.target.value })} />
              </div>
              <Input label="Location" value={bazaarData.location} onChange={(e) => setBazaarData({ ...bazaarData, location: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                <Input label="Max Participants" type="number" placeholder="50" min="1" value={bazaarData.maxParticipants} onChange={(e) => setBazaarData({ ...bazaarData, maxParticipants: e.target.value })} />
                <Input label="Registration Deadline" type="datetime-local" value={bazaarData.registrationDeadline} max={bazaarData.startDate} onChange={(e) => setBazaarData({ ...bazaarData, registrationDeadline: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
              <Button variant="outline" onClick={() => setCreateBazaarOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => { setBazaarData({ name: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" }); toast.success("Form fields cleared"); }}>Clear Draft</Button>
              <Button variant="primary" onClick={async () => {
                try {
                  if (!bazaarData.name || !bazaarData.description || !bazaarData.theme || !bazaarData.startDate || !bazaarData.endDate || !bazaarData.maxParticipants || !bazaarData.registrationDeadline) { toast.error("Please fill all required fields: Name, Description, Theme, Dates, Max Participants, and Registration Deadline."); return; }
                  if (new Date(bazaarData.registrationDeadline) >= new Date(bazaarData.startDate)) { toast.error("Registration deadline must be set before the event's start date."); return; }
                  const eventData = { name: bazaarData.name, description: bazaarData.description, startDate: new Date(bazaarData.startDate).toISOString(), endDate: new Date(bazaarData.endDate).toISOString(), location: bazaarData.location, maxParticipants: Number(bazaarData.maxParticipants), registrationDeadline: new Date(bazaarData.registrationDeadline).toISOString(), registrationRequired: true, tags: bazaarData.theme ? [bazaarData.theme] : [] };
                  await api.post("/bazaars", eventData);
                  toast.success(`Bazaar "${bazaarData.name}" created as a draft!`);
                  setCreateBazaarOpen(false);
                  setBazaarData({ name: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" });
                  fetchEvents();
                } catch (error) { console.error("Failed to create bazaar:", error); toast.error(error.data?.message || error.message || "Failed to create bazaar. Please try again."); }
              }}>Publish Bazaar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsPage;