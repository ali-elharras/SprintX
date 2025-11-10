import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { token, isProfessor, isStaff, isEventsOffice, isStudent, isTA } = useAuth();
    const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/notifications`;

    // Check if user has notification access
    const hasNotificationAccess = isProfessor || isStaff || isEventsOffice || isStudent || isTA;

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!token || !hasNotificationAccess) return;

        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [token, hasNotificationAccess, API_URL]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!token || !hasNotificationAccess) return;

        try {
            const response = await fetch(`${API_URL}/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [token, hasNotificationAccess, API_URL]);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
                );
                fetchUnreadCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                fetchUnreadCount();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Clear all notifications
    const clearAll = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error clearing all notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (token && hasNotificationAccess) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [token, hasNotificationAccess, fetchNotifications, fetchUnreadCount]);

    // Refresh every 30 seconds
    useEffect(() => {
        if (!token || !hasNotificationAccess) return;

        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [token, hasNotificationAccess, fetchNotifications, fetchUnreadCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'workshop_submitted':
                return '📝';
            case 'workshop_published':
                return '✅';
            case 'workshop_rejected':
                return '❌';
            case 'workshop_edit_requested':
                return '✏️';
            case 'professor_workshop_submitted':
                return '📤';
            case 'professor_workshop_edited':
                return '🔄';
            case 'event_created':
                return '🎉';
            default:
                return '🔔';
        }
    };

    if (!hasNotificationAccess) return null;

    return (
        <div style={styles.container} ref={dropdownRef}>
            {/* Bell Icon with Badge */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                style={styles.bellButton}
                aria-label="Notifications"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>
                        <h3 style={styles.title}>Notifications</h3>
                        {notifications.length > 0 && (
                            <div style={styles.headerActions}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} style={styles.linkButton}>
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={clearAll} style={styles.linkButton}>
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.notificationList}>
                        {isLoading ? (
                            <div style={styles.emptyState}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>🔔</div>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    style={{
                                        ...styles.notificationItem,
                                        ...(notification.isRead ? {} : styles.unreadItem),
                                    }}
                                >
                                    <div style={styles.notificationIcon}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div style={styles.notificationContent}>
                                        <p style={styles.notificationMessage}>
                                            {notification.message}
                                        </p>
                                        {notification.workshopName && (
                                            <p style={styles.workshopName}>
                                                {notification.workshopName}
                                            </p>
                                        )}
                                        <p style={styles.notificationTime}>
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    <div style={styles.notificationActions}>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                style={styles.actionButton}
                                                title="Mark as read"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            style={styles.actionButton}
                                            title="Delete"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        display: 'inline-block',
    },
    bellButton: {
        position: 'relative',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s',
    },
    badge: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '10px',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: '600',
        minWidth: '18px',
        textAlign: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '8px',
        width: '380px',
        maxHeight: '500px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
    },
    headerActions: {
        display: 'flex',
        gap: '12px',
    },
    linkButton: {
        background: 'transparent',
        border: 'none',
        color: '#4f46e5',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: '500',
    },
    notificationList: {
        overflowY: 'auto',
        maxHeight: '400px',
    },
    emptyState: {
        padding: '48px 24px',
        textAlign: 'center',
        color: '#6b7280',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '12px',
    },
    notificationItem: {
        display: 'flex',
        padding: '12px 16px',
        borderBottom: '1px solid #f3f4f6',
        transition: 'background 0.2s',
        cursor: 'pointer',
    },
    unreadItem: {
        background: '#f0f9ff',
    },
    notificationIcon: {
        fontSize: '24px',
        marginRight: '12px',
        flexShrink: 0,
    },
    notificationContent: {
        flex: 1,
        minWidth: 0,
    },
    notificationMessage: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        color: '#111827',
        lineHeight: '1.4',
    },
    workshopName: {
        margin: '0 0 4px 0',
        fontSize: '12px',
        color: '#4f46e5',
        fontWeight: '500',
    },
    notificationTime: {
        margin: 0,
        fontSize: '12px',
        color: '#6b7280',
    },
    notificationActions: {
        display: 'flex',
        gap: '4px',
        marginLeft: '8px',
    },
    actionButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '16px',
        color: '#6b7280',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
};

export default NotificationCenter;
