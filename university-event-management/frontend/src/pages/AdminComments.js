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
 * Allows an admin to view & delete any user rating/comment across all events.
 * Minimal MVP implementation with:
 *  - Filters: search (comment/userName), eventType, userRole
 *  - Pagination (page, limit)
 *  - Delete action (with confirmation)
 */
const AdminComments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');
  const [userRole, setUserRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });

  const isAdmin = user && user.role === 'admin';

  const fetchComments = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (eventType) params.eventType = eventType;
      if (userRole) params.userRole = userRole;

      const response = await ratingAPI.getAllRatingsAdmin(params);
      const data = response.data; // axios response -> data property
      // Our backend returns { success, data, meta }
      setComments(data.data || []);
      setMeta(data.meta || { total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed fetching comments:', err);
      setError(err.message || 'Failed to load comments');
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, eventType, userRole, page, limit]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await ratingAPI.deleteRatingAdmin(id);
      toast.success('Comment deleted');
      // Refetch current page; if we deleted last item on page and not first page adjust
      if (comments.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchComments();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete');
    }
  };

  // UI Styles
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

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.fontSize.sm,
  };

  const thStyles = {
    textAlign: 'left',
    padding: theme.spacing[3],
    borderBottom: `2px solid ${theme.colors.border.light}`,
    backgroundColor: theme.colors.background.paper,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  };

  const tdStyles = {
    padding: theme.spacing[3],
    borderBottom: `1px solid ${theme.colors.border.light}`,
    verticalAlign: 'top',
  };

  const badge = (text, color) => (
    <span
      style={{
        display: 'inline-block',
        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
        backgroundColor: color + '20',
        color,
        borderRadius: theme.borderRadius.full,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
        textTransform: 'capitalize',
      }}
    >
      {text}
    </span>
  );

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
          <h1 style={titleStyles}>All Comments & Ratings</h1>
          <p style={subtitleStyles}>
            View and moderate user feedback across all events.
          </p>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <div style={filtersGrid}>
            <Input
              label="Search"
              placeholder="Search comment or user name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <Select
              label="Event Type"
              value={eventType}
              onChange={(e) => { setEventType(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Types' },
                { value: 'event', label: 'Event' },
                { value: 'gym', label: 'Gym' },
                { value: 'court', label: 'Court' },
              ]}
            />
            <Select
              label="User Role"
              value={userRole}
              onChange={(e) => { setUserRole(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'student', label: 'Student' },
                { value: 'staff', label: 'Staff' },
                { value: 'ta', label: 'TA' },
                { value: 'professor', label: 'Professor' },
              ]}
            />
            <Select
              label="Page Size"
              value={String(limit)}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              options={[10,20,50,100].map(n => ({ value: String(n), label: `${n} / page` }))}
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div style={{ padding: theme.spacing[6], textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: theme.spacing[6], color: theme.colors.error.main }}>{error}</div>
          ) : comments.length === 0 ? (
            <div style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
              No comments found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>User</th>
                    <th style={thStyles}>Role</th>
                    <th style={thStyles}>Event Type</th>
                    <th style={thStyles}>Rating</th>
                    <th style={thStyles}>Comment</th>
                    <th style={thStyles}>Created</th>
                    <th style={thStyles}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map(c => (
                    <tr key={c._id}>
                      <td style={tdStyles}>{c.userName || 'Unknown'}</td>
                      <td style={tdStyles}>{badge(c.userRole, theme.colors.info.main)}</td>
                      <td style={tdStyles}>{badge(c.eventType, theme.colors.primary.main)}</td>
                      <td style={tdStyles}>{c.rating}</td>
                      <td style={{ ...tdStyles, maxWidth: 300 }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{c.comment}</div>
                      </td>
                      <td style={tdStyles}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={tdStyles}>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => handleDelete(c._id)}
                          style={{ padding: `${theme.spacing[1]} ${theme.spacing[3]}` }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination Controls */}
        <div style={{ marginTop: theme.spacing[6], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
            Page {page} of {meta.totalPages || 1} • {meta.total} total comments
          </div>
          <div style={{ display: 'flex', gap: theme.spacing[3] }}>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComments;
