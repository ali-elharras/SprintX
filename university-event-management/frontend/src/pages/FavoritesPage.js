import React, { useEffect, useState } from "react";
// Modal view instead of navigation
import EventDetailsModal from "../components/EventDetailsModal";
import { favoritesAPI } from "../services/api";
import Navbar from "../components/Navbar";
import theme from "../theme";
import toast from "react-hot-toast";

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  },
  header: {
    background: theme.colors.primary.gradient,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    color: theme.colors.text.white,
    boxShadow: theme.shadows.lg,
    marginBottom: theme.spacing[6],
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: theme.spacing[5],
  },
  card: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    overflow: "hidden",
    boxShadow: theme.shadows.md,
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    background: theme.colors.neutral.gray200,
  },
  content: { padding: theme.spacing[4] },
  title: {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  meta: {
    marginTop: theme.spacing[1],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  primaryBtn: {
    background: theme.colors.primary.gradient,
    color: theme.colors.text.white,
    border: "none",
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    fontWeight: theme.typography.fontWeight.semibold,
    boxShadow: theme.shadows.sm,
  },
  dangerBtn: {
    background: `linear-gradient(135deg, ${theme.colors.error.main} 0%, #dc2626 100%)`,
    color: theme.colors.text.white,
    border: "none",
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    fontWeight: theme.typography.fontWeight.semibold,
    boxShadow: theme.shadows.sm,
  },
  empty: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    padding: theme.spacing[8],
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
};

const FavoritesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const favs = await favoritesAPI.getMyFavorites();
      setItems(favs);
    } catch (e) {
      toast.error(e.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try {
      await favoritesAPI.removeFavorite(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Removed from favorites");
    } catch (e) {
      toast.error(e.message || "Failed to remove");
    }
  };

  const openDetails = (item) => {
    setSelectedEvent(item);
  };
  const closeModal = () => setSelectedEvent(null);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0 }}>My Favorites</h1>
          <p style={{ marginTop: theme.spacing[2], opacity: 0.95 }}>
            Quickly access events you’ve saved. You can remove any at any time.
          </p>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={styles.empty}>You haven’t added any favorites yet.</div>
        ) : (
          <div style={styles.grid}>
            {items.map((e) => (
              <div key={e._id} style={styles.card}>
                {e.images?.[0] && (
                  <img alt={e.title} style={styles.image} src={e.images[0]} />
                )}
                <div style={styles.content}>
                  <h3 style={styles.title}>{e.title}</h3>
                  <div style={styles.meta}>
                    {new Date(e.startDate).toLocaleDateString()} • {e.location}
                  </div>
                </div>
                <div style={styles.actions}>
                  <button style={styles.primaryBtn} onClick={() => openDetails(e)}>
                    View Details
                  </button>
                  <button style={styles.dangerBtn} onClick={() => remove(e._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedEvent && (
        <EventDetailsModal
          eventId={selectedEvent._id}
          initialEvent={selectedEvent}
          disableFavorite={true}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default FavoritesPage;
