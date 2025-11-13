import React, { useEffect, useState } from "react";
import { eventAPI, favoritesAPI } from "../services/api";
import theme, { getEventTypeColor } from "../theme";
import toast from "react-hot-toast";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: theme.spacing[6],
};

const modalStyle = {
  width: "100%",
  maxWidth: 900,
  background: theme.colors.background.paper,
  borderRadius: theme.borderRadius.xl,
  border: `1px solid ${theme.colors.border.light}`,
  boxShadow: theme.shadows.xl,
  overflow: "hidden",
  animation: "fadeIn 0.25s ease",
  display: "flex",
  flexDirection: "column",
  maxHeight: "90vh",
};

const EventDetailsModal = ({ eventId, initialEvent, onClose, disableFavorite = false }) => {
  const [event, setEvent] = useState(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialEvent) return; // Already have data
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const resp = await eventAPI.getEvent(eventId);
        setEvent(resp.data);
      } catch (e) {
        setError(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, initialEvent]);

  const addToFavorites = async () => {
    try {
      await favoritesAPI.addFavorite(event._id);
      toast.success("Added to favorites");
    } catch (e) {
      toast.error(e.message || "Failed to add to favorites");
    }
  };

  const color = getEventTypeColor(event?.type || "workshop");

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div style={{ padding: theme.spacing[6] }}>Loading...</div>
        ) : error || !event ? (
          <div style={{ padding: theme.spacing[6], color: theme.colors.error.main }}>{error || "Event not found"}</div>
        ) : (
          <>
            <div
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                padding: theme.spacing[6],
                color: theme.colors.text.white,
                position: "relative",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize["2xl"],
                  fontWeight: theme.typography.fontWeight.bold,
                  lineHeight: 1.1,
                }}
              >
                {event.title || event.name}
              </h1>
              <p
                style={{
                  marginTop: theme.spacing[3],
                  maxWidth: 650,
                  fontSize: theme.typography.fontSize.sm,
                  lineHeight: theme.typography.lineHeight.relaxed,
                  opacity: 0.95,
                }}
              >
                {event.description}
              </p>
              <div style={{ display: "flex", gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
                {disableFavorite ? (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      border: "none",
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      borderRadius: theme.borderRadius.full,
                      cursor: "default",
                      fontWeight: theme.typography.fontWeight.semibold,
                      fontSize: theme.typography.fontSize.base,
                      backdropFilter: "blur(4px)",
                      userSelect: "none",
                    }}
                  >
                    ♥ Favorite
                  </span>
                ) : (
                  <button
                    onClick={addToFavorites}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      border: "none",
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      borderRadius: theme.borderRadius.full,
                      cursor: "pointer",
                      fontWeight: theme.typography.fontWeight.semibold,
                      fontSize: theme.typography.fontSize.base,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ♥ Favorite
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    border: "none",
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    borderRadius: theme.borderRadius.full,
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ padding: theme.spacing[6], overflowY: "auto" }}>
              <section style={{ marginBottom: theme.spacing[5] }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing[3],
                    color: theme.colors.text.primary,
                  }}
                >
                  Details
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: theme.spacing[4] }}>
                  <Detail label="Start" value={new Date(event.startDate).toLocaleString()} />
                  <Detail label="End" value={new Date(event.endDate).toLocaleString()} />
                  <Detail label="Location" value={event.location} />
                  {event.cost != null && <Detail label="Cost" value={`$${event.cost}`} />}
                  {event.maxParticipants && <Detail label="Capacity" value={event.maxParticipants} />}
                  {event.instructor && <Detail label="Instructor" value={event.instructor} />}
                  {event.companyName && <Detail label="Vendor" value={event.companyName} />}
                </div>
              </section>
              {event.fullAgenda && (
                <section style={{ marginBottom: theme.spacing[5] }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginBottom: theme.spacing[3],
                      color: theme.colors.text.primary,
                    }}
                  >
                    Agenda
                  </h2>
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      background: theme.colors.neutral.gray50,
                      padding: theme.spacing[4],
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.border.light}`,
                      fontSize: theme.typography.fontSize.sm,
                      lineHeight: theme.typography.lineHeight.relaxed,
                    }}
                  >
                    {event.fullAgenda}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[1] }}>
    <span
      style={{
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: theme.colors.text.secondary,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.medium,
        lineHeight: theme.typography.lineHeight.snug,
      }}
    >
      {value || "—"}
    </span>
  </div>
);

export default EventDetailsModal;