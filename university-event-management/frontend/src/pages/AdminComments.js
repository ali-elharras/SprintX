import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { ratingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';
import toast from 'react-hot-toast';

/**
 * Comments & Feedback Dashboard
 * Centralized moderation dashboard showing all user comments across all events
 * with expandable rows for detailed event information
 */
const AdminComments = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expandedCommentId, setExpandedCommentId] = useState(null);

  const isAdmin = user && user.role === 'admin';

  const fetchAllComments = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      // First, get all events with ratings
      const eventsResponse = await ratingAPI.getEventsWithRatings();
      const eventsData = eventsResponse.data.data || [];
      setEvents(eventsData);

      // Fetch ratings for each event to get full comment details
      const allCommentsData = [];
      
      for (const event of eventsData) {
        try {
          const eventId = event._id || event.id;
          if (eventId) {
            const ratingsResponse = await ratingAPI.getEventRatings(eventId);
            const eventRatings = ratingsResponse.data?.data?.ratings || [];
            
            // Add event information to each rating
            const commentsWithEventInfo = eventRatings.map(rating => ({
              ...rating,
              event: {
                _id: event._id,
                title: event.title || event.name,
                type: event.type,
                startDate: event.startDate,
                location: event.location,
                description: event.description
              }
            }));
            
            allCommentsData.push(...commentsWithEventInfo);
          }
        } catch (err) {
          console.error(`Failed to fetch ratings for event ${event._id}:`, err);
        }
      }
      
      setAllComments(allCommentsData);
      console.log('All comments loaded:', allCommentsData.length);
    } catch (err) {
      console.error('Failed fetching events with ratings:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load comments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await ratingAPI.deleteRatingAdmin(commentId);
      toast.success('Comment deleted');
      // Remove from local state
      setAllComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete');
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedCommentId(expandedCommentId === commentId ? null : commentId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter comments
  const filteredComments = allComments.filter(comment => {
    let matches = true;
    if (search.trim()) {
      const s = search.toLowerCase();
      matches = matches && (
        (comment.comment || '').toLowerCase().includes(s) ||
        (comment.userName || '').toLowerCase().includes(s) ||
        (comment.event?.title || '').toLowerCase().includes(s) ||
        (comment.event?.location || '').toLowerCase().includes(s)
      );
    }
    if (filterType) {
      matches = matches && comment.event?.type === filterType;
    }
    return matches;
  });

  // Styles
  const containerStyles = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const contentStyles = {
    padding: theme.spacing[6],
    maxWidth: theme.layout.containerMaxWidth['7xl'],
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

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    boxShadow: theme.shadows.sm,
  };

  const tableHeaderStyles = {
    backgroundColor: theme.colors.primary.main + '08',
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const tableHeaderCellStyles = {
    padding: theme.spacing[4],
    textAlign: 'left',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tableRowStyles = {
    borderBottom: `1px solid ${theme.colors.border.light}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const tableCellStyles = {
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    verticalAlign: 'top',
  };

  const commentTextStyles = {
    maxWidth: '400px',
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const collapsedCommentStyles = {
    ...commentTextStyles,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const expandedRowStyles = {
    backgroundColor: theme.colors.primary.main + '04',
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const eventDetailCardStyles = {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    margin: `${theme.spacing[4]} 0`,
  };

  const eventTypeBadgeStyles = {
    display: 'inline-block',
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.background.paper,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
    marginBottom: theme.spacing[3],
  };

  const eventDetailLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[1],
    color: theme.colors.text.secondary, // Added for consistency
  };

  const ratingStarsStyles = {
    color: theme.colors.warning.main,
    fontSize: theme.typography.fontSize.lg,
  };

  if (!isAdmin) {
    return (
      <div style={containerStyles}>
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
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Comments & Feedback Dashboard</h1>
          <p style={subtitleStyles}>
            Moderate user feedback across all events in one centralized view.
          </p>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersGrid}>
            <Input
              label="Search Comments"
              placeholder="Search by user, comment, event, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Event Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'All Event Types' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'trip', label: 'Trip' },
                { value: 'bazaar', label: 'Bazaar' },
                { value: 'booth', label: 'Booth' },
                { value: 'conference', label: 'Conference' },
              ]}
            />
          </div>
        </Card>

        {/* Comments Table */}
        {loading ? (
          <Card style={{ padding: theme.spacing[6], textAlign: 'center' }}>Loading comments...</Card>
        ) : error ? (
          <Card style={{ padding: theme.spacing[6], color: theme.colors.error.main }}>{error}</Card>
        ) : filteredComments.length === 0 ? (
          <Card style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>💬</div>
            <h3 style={{ fontSize: theme.typography.fontSize.xl, color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
              No Comments Found
            </h3>
            <p>{search || filterType ? 'Try adjusting your filters.' : 'No comments have been submitted yet.'}</p>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={tableStyles}>
              <thead style={tableHeaderStyles}>
                <tr>
                  <th style={tableHeaderCellStyles}>User & Rating</th>
                  <th style={tableHeaderCellStyles}>Comment</th>
                  <th style={tableHeaderCellStyles}>Date</th>
                  <th style={{ ...tableHeaderCellStyles, width: '120px' }}>Actions</th>
                  <th style={{ ...tableHeaderCellStyles, width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => {
                  const isExpanded = expandedCommentId === comment._id;
                  const commentText = comment.comment || 'No comment provided';
                  const shouldCollapse = commentText.length > 150;
                  
                  return (
                    <React.Fragment key={comment._id}>
                      <tr 
                        style={tableRowStyles}
                        onClick={() => toggleCommentExpansion(comment._id)}
                      >
                        <td style={tableCellStyles}>
                          <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>
                            {comment.userName}
                          </div>
                          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                            {comment.userRole}
                          </div>
                          <div style={ratingStarsStyles}>
                            {'⭐'.repeat(comment.rating)}
                            <span style={{ 
                              fontSize: theme.typography.fontSize.sm, 
                              color: theme.colors.text.secondary,
                              marginLeft: theme.spacing[1]
                            }}>
                              ({comment.rating}/5)
                            </span>
                          </div>
                        </td>
                        <td style={tableCellStyles}>
                          <div style={shouldCollapse && !isExpanded ? collapsedCommentStyles : commentTextStyles}>
                            {commentText}
                          </div>
                          {shouldCollapse && !isExpanded && (
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color: theme.colors.primary.main,
                                fontSize: theme.typography.fontSize.sm,
                                cursor: 'pointer',
                                padding: 0,
                                marginTop: theme.spacing[1],
                                fontWeight: theme.typography.fontWeight.medium,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCommentExpansion(comment._id);
                              }}
                            >
                              See more
                            </button>
                          )}
                          {shouldCollapse && isExpanded && (
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color: theme.colors.primary.main,
                                fontSize: theme.typography.fontSize.sm,
                                cursor: 'pointer',
                                padding: 0,
                                marginTop: theme.spacing[1],
                                fontWeight: theme.typography.fontWeight.medium,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCommentExpansion(comment._id);
                              }}
                            >
                              See less
                            </button>
                          )}
                        </td>
                        <td style={tableCellStyles}>
                          {formatDateTime(comment.createdAt)}
                        </td>
                        <td style={tableCellStyles}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComment(comment._id);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                        <td style={tableCellStyles}>
                          <div style={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            fontSize: theme.typography.fontSize.lg,
                            color: theme.colors.text.secondary,
                            textAlign: 'center'
                          }}>
                            ▼
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Event Details */}
                      {isExpanded && comment.event && (
                        <tr style={expandedRowStyles}>
                          <td colSpan="5" style={{ ...tableCellStyles, paddingTop: 0 }}>
                            <div style={eventDetailCardStyles}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing[3] }}>
                                                              <div>
                                                                <h4 style={{
                                                                  fontSize: theme.typography.fontSize.lg,
                                                                  fontWeight: theme.typography.fontWeight.semibold,
                                                                  marginBottom: theme.spacing[2]
                                                                }}>
                                                                  Event Details
                                                                </h4>
                                                                <div style={eventTypeBadgeStyles}>
                                                                  {comment.event.type}
                                                                </div>
                                                              </div>
                                                            </div>
                              
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[4] }}>
                                                              <div>
                                                                <div style={eventDetailLabelStyles}>
                                                                  Event Title
                                                                </div>
                                                                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                                                  {comment.event.title}
                                                                </div>
                                                              </div>
                                                              
                                                              <div>
                                                                <div style={eventDetailLabelStyles}>
                                                                  Event Date
                                                                </div>
                                                                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                                                  {formatDate(comment.event.startDate)}
                                                                </div>
                                                              </div>
                                                              
                                                              <div>
                                                                <div style={eventDetailLabelStyles}>
                                                                  Location
                                                                </div>
                                                                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                                                                  {comment.event.location}
                                                                </div>
                                                              </div>
                                                            </div>
                                                            
                                                            {comment.event.description && (
                                                              <div style={{ marginTop: theme.spacing[3] }}>
                                                                <div style={eventDetailLabelStyles}>
                                                                  Description
                                                                </div>
                                                                <div style={{ 
                                                                  fontSize: theme.typography.fontSize.sm, 
                                                                  color: theme.colors.text.primary,
                                                                  lineHeight: theme.typography.lineHeight.relaxed,
                                                                  display: '-webkit-box',
                                                                  WebkitLineClamp: 3,
                                                                  WebkitBoxOrient: 'vertical',
                                                                  overflow: 'hidden',
                                                                }}>
                                                                  {comment.event.description}
                                                                </div>
                                                              </div>
                                                            )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminComments;