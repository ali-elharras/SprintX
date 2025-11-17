import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { ratingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';
import toast from 'react-hot-toast';

/**
 * AdminComments Page
 * Shows events that have ratings/comments in a card grid (like events page)
 * Admin clicks "View Ratings" to see a modal with all comments for that event
 * Inside modal, admin can delete individual comments
 */
const AdminComments = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRatings, setEventRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const isAdmin = user && user.role === 'admin';

  const fetchEventsWithRatings = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ratingAPI.getEventsWithRatings();
      const data = response.data;
      setEvents(data.data || []);
    } catch (err) {
      console.error('Failed fetching events with ratings:', err);
      setError(err.message || 'Failed to load events');
      toast.error('Failed to load events with ratings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchEventsWithRatings();
  }, [fetchEventsWithRatings]);

  const handleViewRatings = async (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setLoadingRatings(true);
    try {
      const response = await ratingAPI.getEventRatings(event._id);
      setEventRatings(response.data?.data?.ratings || []);
    } catch (err) {
      console.error('Failed loading ratings:', err);
      toast.error('Failed to load ratings');
      setEventRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await ratingAPI.deleteRatingAdmin(ratingId);
      toast.success('Comment deleted');
      // Remove from local state
      setEventRatings(prev => prev.filter(r => r._id !== ratingId));
      // If no more ratings, close modal and refresh events
      const remaining = eventRatings.filter(r => r._id !== ratingId);
      if (remaining.length === 0) {
        setShowModal(false);
        fetchEventsWithRatings();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setEventRatings([]);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    let matches = true;
    if (search.trim()) {
      const s = search.toLowerCase();
      matches = matches && (
        (event.title || event.name || '').toLowerCase().includes(s) ||
        (event.description || '').toLowerCase().includes(s) ||
        (event.location || '').toLowerCase().includes(s)
      );
    }
    if (filterType) {
      matches = matches && event.type === filterType;
    }
    return matches;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Styles
  const containerStyles = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const contentStyles = {
    padding: theme.spacing[6],
    maxWidth: theme.layout.containerMaxWidth.xl,
    margin: '0 auto',
  };

  const headerStyles = {
    marginBottom: theme.spacing[6],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  };

  const filtersGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing[4],
  };

  const eventCardStyles = {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const eventTypeStyles = {
    display: 'inline-block',
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.primary.main + '20',
    color: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
    marginBottom: theme.spacing[2],
  };

  const eventTitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const eventDetailStyles = {
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  };

  const ratingBadgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.warning.main + '20',
    color: theme.colors.warning.main,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  };

  if (!isAdmin) {
    return (
      <div style={containerStyles}>
        <Navbar />
        <div style={contentStyles}>
          <Card style={{ padding: theme.spacing[8], textAlign: 'center' }}>
            <h2 style={{ marginBottom: theme.spacing[4] }}>Access Denied</h2>
            <p style={{ color: theme.colors.text.secondary }}>
              This page is only accessible to administrators.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Navbar />
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Manage Comments & Ratings</h1>
          <p style={subtitleStyles}>
            View and moderate user feedback across all events.
          </p>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersGrid}>
            <Input
              label="Search Events"
              placeholder="Search by title, description, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Event Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'trip', label: 'Trip' },
                { value: 'bazaar', label: 'Bazaar' },
                { value: 'booth', label: 'Booth' },
                { value: 'conference', label: 'Conference' },
              ]}
            />
          </div>
        </Card>

        {/* Events Grid */}
        {loading ? (
          <Card style={{ padding: theme.spacing[6], textAlign: 'center' }}>Loading events...</Card>
        ) : error ? (
          <Card style={{ padding: theme.spacing[6], color: theme.colors.error.main }}>{error}</Card>
        ) : filteredEvents.length === 0 ? (
          <Card style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>💬</div>
            <h3 style={{ fontSize: theme.typography.fontSize.xl, color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
              No Events with Comments
            </h3>
            <p>{search || filterType ? 'Try adjusting your filters.' : 'No events have ratings yet.'}</p>
          </Card>
        ) : (
          <div style={gridStyles}>
            {filteredEvents.map(event => (
              <Card key={event._id} style={eventCardStyles} hover>
                <div style={eventTypeStyles}>{event.type}</div>
                <h3 style={eventTitleStyles}>{event.title || event.name}</h3>

                <div style={eventDetailStyles}>
                  <span style={{ marginRight: theme.spacing[2] }}>📅</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>

                <div style={eventDetailStyles}>
                  <span style={{ marginRight: theme.spacing[2] }}>📍</span>
                  <span>{event.location}</span>
                </div>

                {event.description && (
                  <p style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing[2],
                    marginBottom: theme.spacing[3],
                    lineHeight: theme.typography.lineHeight.relaxed,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {event.description}
                  </p>
                )}

                <div style={{ marginTop: theme.spacing[3], marginBottom: theme.spacing[3] }}>
                  <div style={ratingBadgeStyles}>
                    ⭐ {event.averageRating.toFixed(1)} • {event.ratingsCount} comment{event.ratingsCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{ paddingTop: theme.spacing[3], borderTop: `1px solid ${theme.colors.border.light}` }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewRatings(event)}
                    style={{ width: '100%' }}
                  >
                    View & Manage Comments
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing and deleting ratings */}
      {showModal && selectedEvent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: theme.zIndex.modal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing[4],
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows['2xl'],
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: theme.spacing[6],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing[4] }}>
              <div>
                <h2 style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing[2] }}>
                  {selectedEvent.title || selectedEvent.name}
                </h2>
                <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  {eventRatings.length} comment{eventRatings.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: theme.typography.fontSize['2xl'],
                  cursor: 'pointer',
                  color: theme.colors.text.secondary,
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {loadingRatings ? (
              <div style={{ padding: theme.spacing[6], textAlign: 'center' }}>Loading comments...</div>
            ) : eventRatings.length === 0 ? (
              <div style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
                No comments available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                {eventRatings.map(rating => (
                  <Card key={rating._id} style={{ padding: theme.spacing[4] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
                      <div>
                        <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>
                          {rating.userName}
                        </div>
                        <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                          {new Date(rating.createdAt).toLocaleDateString()} • {rating.userRole}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1] }}>
                        <span style={{ color: theme.colors.warning.main, fontSize: theme.typography.fontSize.lg }}>
                          {'⭐'.repeat(rating.rating)}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      color: theme.colors.text.primary,
                      lineHeight: theme.typography.lineHeight.relaxed,
                      marginBottom: theme.spacing[3],
                    }}>
                      {rating.comment}
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRating(rating._id)}
                    >
                      Delete Comment
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
