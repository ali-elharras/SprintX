import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import theme from "../theme";
import { eventAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import EventCard from "../components/EventCard";
import EventEditModal from "../components/EventEditModal";
import CreateTripModal from "../components/CreateTripModal";

const fieldStyle = {
  display: "block",
  width: "100%",
  padding: theme.spacing[3],
  marginBottom: theme.spacing[3],
  border: `1px solid ${theme.colors.border.light}`,
  borderRadius: theme.borderRadius.sm,
};

const TripsPage = () => {
  const auth = useAuth();
  const { user } = auth;

  const [trips, setTrips] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // only list for trips
  const [filters, setFilters] = useState({ search: "", upcoming: true });

  // create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: theme.colors.background.default,
      fontFamily: theme.typography.fontFamily.primary,
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: theme.spacing[6],
    },
    header: {
      marginBottom: theme.spacing[6],
      textAlign: "center",
    },
    title: {
      fontSize: theme.typography.fontSize["3xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      maxWidth: "800px",
      margin: "0 auto",
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    controls: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
      padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.xl,
      boxShadow: theme.shadows.md,
    },
    filterInput: {
      padding: theme.spacing[2],
      border: `1px solid ${theme.colors.border.main}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.primary,
      minWidth: "320px",
    },
    listGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: theme.spacing[6],
      marginTop: theme.spacing[6],
    },
    noItems: {
      textAlign: "center",
      padding: theme.spacing[8],
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
    },
    createPanel: {
      padding: theme.spacing[4],
      background: theme.colors.background.paper,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      marginBottom: theme.spacing[6],
    },
  };

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await eventAPI.getEvents({ type: "trip", status: "published", upcoming: "true" });
      const list = resp.data?.data || [];
      setTrips(list);
    } catch (err) {
      console.error("Failed to fetch trips", err);
      toast.error("Failed to load trips");
      setTrips([]);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    // apply simple search filter
    let f = [...trips];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      f = f.filter(t => (t.name || t.title || "").toLowerCase().includes(s) || (t.description || "").toLowerCase().includes(s) || (t.location || "").toLowerCase().includes(s));
    }
    if (filters.upcoming) {
      const now = new Date();
      f = f.filter(t => new Date(t.startDate) > now);
    }
    setFiltered(f);
  }, [trips, filters]);


  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <LoadingScreen type="trips" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trips</h1>
          <p style={styles.subtitle}>Create and manage trips — events created here will appear on the main Events page.</p>
        </div>

        <div style={styles.controls}>
          <div style={{ display: 'flex', gap: theme.spacing[3], alignItems: 'center' }}>
            <input
              placeholder="Search trips..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              style={styles.filterInput}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={filters.upcoming} onChange={(e) => setFilters(f => ({ ...f, upcoming: e.target.checked }))} /> Upcoming only
            </label>
          </div>

          {(auth.isEventsOffice || auth.isAdmin) && (
            <div>
              <button style={{ ...theme.components.button.primary, display: 'inline-flex', alignItems: 'center', gap: theme.spacing[2] }} onClick={() => setCreateOpen(true)}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
                <span>Create Trip</span>
              </button>
            </div>
          )}
        </div>
        <CreateTripModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={async () => { setCreateOpen(false); await fetchTrips(); }} currentUser={user} />

        {/* List */}
        {filtered.length === 0 ? (
          <div style={styles.noItems}>No trips found.</div>
        ) : (
          <div style={styles.listGrid}>
                {filtered.map((t) => (
                  <EventCard key={t._id || t.id} event={t} showRegistration={true} onRegistrationSuccess={() => fetchTrips()} onEdit={(evt) => { setEditEvent(evt); setEditOpen(true); }} />
                ))}
          </div>
        )}
        {editOpen && (
          <EventEditModal open={editOpen} event={editEvent} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); fetchTrips(); }} />
        )}
      </div>
    </div>
  );
};

// Render edit modal outside return's main JSX via portal control
// We will render modal at bottom of file using state from above via default export consumer pattern


export default TripsPage;
