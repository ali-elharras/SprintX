import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI, favoritesAPI } from "../services/api";
import theme, { getEventTypeColor } from "../theme";
import toast from "react-hot-toast";

const EventDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const stateEvent = location.state?.event; // event passed from FavoritesPage
  const [event, setEvent] = useState(stateEvent || null);
  const [loading, setLoading] = useState(!stateEvent);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stateEvent) return; // already have data
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const resp = await eventAPI.getEvent(id);
        setEvent(resp.data);
      } catch (e) {
        setError(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, stateEvent]);

  const addToFavorites = async () => {
    try {
      await favoritesAPI.addFavorite(event._id);
      toast.success("Added to favorites");
    } catch (e) {
      toast.error(e.message || "Failed to add to favorites");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: theme.spacing[8], textAlign: "center" }}>Loading...</div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div style={{ padding: theme.spacing[8], textAlign: "center", color: theme.colors.error.main }}>
          {error || "Event not found"}
        </div>
      </>
    );
  }

  const color = getEventTypeColor(event.type);

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
          padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
          fontFamily: theme.typography.fontFamily.primary,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: theme.colors.background.paper,
            borderRadius: theme.borderRadius.xl,
            border: `1px solid ${theme.colors.border.light}`,
            boxShadow: theme.shadows.lg,
            overflow: "hidden",
          }}
        >
          {/* Header */}
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
                fontSize: theme.typography.fontSize["3xl"],
                fontWeight: theme.typography.fontWeight.bold,
                lineHeight: 1.1,
              }}
            >
              {event.title || event.name}
            </h1>
            <p
              style={{
                marginTop: theme.spacing[3],
                maxWidth: 700,
                fontSize: theme.typography.fontSize.base,
                lineHeight: theme.typography.lineHeight.relaxed,
                opacity: 0.95,
              }}
            >
              {event.description}
            </p>
            <div style={{ display: "flex", gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
              <button
                onClick={addToFavorites}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                  borderRadius: theme.borderRadius.full,
                  cursor: "pointer",
                  fontWeight: theme.typography.fontWeight.medium,
                  backdropFilter: "blur(4px)",
                }}
              >
                ♥ Favorite
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: theme.spacing[6], display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
            <section>
              <h2
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[3],
                  color: theme.colors.text.primary,
                }}
              >
                Details
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: theme.spacing[4] }}>
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
              <section>
                <h2
                  style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.xl,
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

            {event.attendees && event.attendees.length > 0 && (
              <section>
                <h2
                  style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing[3],
                    color: theme.colors.text.primary,
                  }}
                >
                  Attendees ({event.attendees.length})
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: theme.spacing[2],
                  }}
                >
                  {event.attendees.map((a) => (
                    <span
                      key={a._id || a}
                      style={{
                        background: color + "22",
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        borderRadius: theme.borderRadius.full,
                        fontSize: theme.typography.fontSize.xs,
                        color: color,
                        border: `1px solid ${color}55`,
                      }}
                    >
                      {a.companyName || a.email || a._id || "Attendee"}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
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

export default EventDetailsPage;
