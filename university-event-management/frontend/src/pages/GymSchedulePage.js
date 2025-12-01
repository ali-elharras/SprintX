import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import GymScheduleCalendar from "../components/GymScheduleCalendar";
import GymSessionCard from "../components/GymSessionCard";
import LoadingScreen from "../components/LoadingScreen";
import { gymAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import axios from "axios";

const GymSchedulePage = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [userGymRegistrations, setUserGymRegistrations] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    skillLevel: "",
    instructor: "",
    dayOfWeek: "",
    availableOnly: false,
  });
  const auth = useAuth();
  const showCreateButton = auth?.isEventsOffice || auth?.isAdmin;
  
  // Ref for request cancellation
  const cancelTokenRef = useRef(null);

  const fetchSessionTypes = useCallback(async () => {
    try {
      const response = await gymAPI.getSessionTypes(cancelTokenRef.current);
      if (response.data.success) {
        setSessionTypes(response.data.data);
      }
    } catch (error) {
      // Don't show error if request was cancelled
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled due to new request');
    }
    
    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    
    try {
      setLoading(true);
      let response;

      if (viewMode === "calendar") {
        response = await gymAPI.getSessionsByMonth(currentYear, currentMonth, {}, cancelTokenRef.current);
      } else {
        response = await gymAPI.getSessions({}, cancelTokenRef.current);
      }

      if (response.data.success) {
        // Handle both response formats
        const sessionsData = response.data.data.sessions || response.data.data;
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      }
    } catch (error) {
      // Don't show error if request was cancelled
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error("Error fetching gym sessions:", error);
      toast.error("Failed to load gym sessions");
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentYear, currentMonth]);

  const fetchMyRegistrations = useCallback(async () => {
    // Only fetch if user is logged in and not admin/events office
    if (!auth?.user || auth?.isAdmin || auth?.isEventsOffice) {
      setUserGymRegistrations([]);
      return;
    }

    try {
      const response = await gymAPI.getMyRegistrations({ status: 'active' });
      if (response.data.success) {
        setUserGymRegistrations(response.data.data || []);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error('Error fetching gym registrations:', error);
      // Don't show error toast, just fail silently
    }
  }, [auth?.user, auth?.isAdmin, auth?.isEventsOffice]);

  const handleAfterRegister = useCallback(async () => {
    await fetchSessions();
    await fetchMyRegistrations();
  }, [fetchSessions, fetchMyRegistrations]);

  const cancelRegistration = useCallback(async ({ registrationId = null, sessionId = null } = {}) => {
    // Removed - page is now view-only
    throw new Error('Registration functionality has been removed');
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...sessions];

    if (filters.type) {
      filtered = filtered.filter(session => session.type === filters.type);
    }

    if (filters.skillLevel) {
      filtered = filtered.filter(session => session.skillLevel === filters.skillLevel);
    }

    if (filters.instructor) {
      filtered = filtered.filter(session =>
        session.instructor.name.toLowerCase().includes(filters.instructor.toLowerCase())
      );
    }

    if (filters.dayOfWeek) {
      filtered = filtered.filter(session =>
        session.dayOfWeek === parseInt(filters.dayOfWeek)
      );
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(session => !session.isFull);
    }

    setFilteredSessions(filtered);
  }, [sessions, filters]);

  useEffect(() => {
    fetchSessionTypes();
    fetchSessions();
    fetchMyRegistrations();
    
    // Cleanup function to cancel requests on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, [currentMonth, currentYear, fetchSessionTypes, fetchSessions, fetchMyRegistrations]);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters, applyFilters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleMonthChange = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  const getDayName = (dayNum) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum];
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: theme.colors.background.default,
      fontFamily: theme.typography.fontFamily.primary,
    },
    content: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: theme.spacing[6],
    },
    header: {
      marginBottom: theme.spacing[8],
      textAlign: "center",
    },
    title: {
      fontSize: theme.typography.fontSize["4xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[4],
      background: theme.colors.primary.gradient,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    controls: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
      padding: theme.spacing[6],
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.xl,
      boxShadow: theme.shadows.md,
    },
    filtersRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing[4],
      alignItems: "center",
    },
    monthNavigation: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing[4],
    },
    monthButton: {
      ...theme.components.button.secondary,
      minWidth: "auto",
      padding: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
    },
    monthTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      minWidth: "200px",
      textAlign: "center",
    },
    viewToggle: {
      display: "flex",
      gap: theme.spacing[2],
    },
    toggleButton: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      border: `2px solid ${theme.colors.primary.main}`,
      backgroundColor: "transparent",
      color: theme.colors.primary.main,
      borderRadius: theme.borderRadius.md,
      cursor: "pointer",
      transition: theme.transitions.duration.fast,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.background.paper,
    },
    filterSelect: {
      padding: theme.spacing[2],
      border: `1px solid ${theme.colors.border.main}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.primary,
      minWidth: "150px",
    },
    filterInput: {
      padding: theme.spacing[2],
      border: `1px solid ${theme.colors.border.main}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.primary,
      minWidth: "200px",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing[2],
    },
    sessionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: theme.spacing[6],
      marginTop: theme.spacing[6],
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
    },
    noSessions: {
      textAlign: "center",
      padding: theme.spacing[8],
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        
        <LoadingScreen type="gym" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Gym Schedule</h1>
          <p style={styles.subtitle}>
            Browse our comprehensive fitness program. From yoga to kickboxing,
            explore the perfect workout for your lifestyle and fitness goals.
          </p>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.filtersRow}>
            {/* Month Navigation */}
            <div style={styles.monthNavigation}>
              <button
                style={styles.monthButton}
                onClick={() => handleMonthChange("prev")}
              >
                ←
              </button>
              <h2 style={styles.monthTitle}>
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <button
                style={styles.monthButton}
                onClick={() => handleMonthChange("next")}
              >
                →
              </button>
            </div>

            {/* View Toggle */}
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(viewMode === "calendar" ? styles.toggleButtonActive : {}),
                }}
                onClick={() => setViewMode("calendar")}
              >
                Calendar View
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(viewMode === "list" ? styles.toggleButtonActive : {}),
                }}
                onClick={() => setViewMode("list")}
              >
                List View
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filtersRow}>
            <select
              style={styles.filterSelect}
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Session Types</option>
              {sessionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              style={styles.filterSelect}
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange("skillLevel", e.target.value)}
            >
              <option value="">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all_levels">All Levels</option>
            </select>

            <select
              style={styles.filterSelect}
              value={filters.dayOfWeek}
              onChange={(e) => handleFilterChange("dayOfWeek", e.target.value)}
            >
              <option value="">All Days</option>
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <option key={day} value={day}>
                  {getDayName(day)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search instructor..."
              style={styles.filterInput}
              value={filters.instructor}
              onChange={(e) => handleFilterChange("instructor", e.target.value)}
            />

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange("availableOnly", e.target.checked)}
              />
              <label htmlFor="availableOnly">Available spots only</label>
            </div>

            {/* Spacer to push create button to the right */}
            <div style={{ flex: 1 }} />

            {/* Events Office Create Session Button */}
            <CreateSessionInline
              isVisible={showCreateButton}
              onCreated={() => fetchSessions()}
              sessionTypes={sessionTypes}
              styles={styles}
            />
          </div>
        </div>

        {/* Content */}
        {viewMode === "calendar" ? (
          <GymScheduleCalendar
            sessions={filteredSessions}
            year={currentYear}
            month={currentMonth}
            onSessionUpdated={handleAfterRegister}
            userGymRegistrations={userGymRegistrations}
          />
        ) : (
          <div>
            {filteredSessions.length === 0 ? (
              <div style={styles.noSessions}>
                No gym sessions found matching your criteria.
              </div>
            ) : (
              <div style={styles.sessionsGrid}>
                {filteredSessions.map(session => (
                  <GymSessionCard
                    key={session._id}
                    session={session}
                    onUpdated={handleAfterRegister}
                    viewOnly={false}
                    userGymRegistrations={userGymRegistrations}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Inline simple create session modal component

const CreateSessionInline = ({ isVisible, onCreated, sessionTypes, styles }) => {
  const getTomorrowDateString = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const minStartDate = getTomorrowDateString();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "yoga",
    instructor_name: "",
    instructor_email: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    startDate: minStartDate, // Initialize with tomorrow's date
    endDate: minStartDate, // Also initialize endDate to tomorrow, makes sense if not recurring
    location: "Main Gym",
    room: "",
    maxParticipants: 20,
    skillLevel: "all_levels",
    isRecurring: false, // Changed to false by default for single sessions
    status: "active",
    registrationRequired: true,
    waitlistEnabled: false,
    eligibleRoles: ["student","staff","ta","professor"],
    ageMin: 16,
    ageMax: 100,
    cost: 0,
    dropInAllowed: true,
    dropInCost: 0,
  });

  const [formErrors, setFormErrors] = useState({});

  // Client-side validation aligned with backend GymSession model required fields
  const validateForm = () => {
    const errors = {};

    // title
    if (!form.title || !form.title.trim()) {
      errors.title = 'Title is required';
    } else if (form.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    // type
    if (!form.type) {
      errors.type = 'Session type is required';
    }

    // instructor name
    if (!form.instructor_name || !form.instructor_name.trim()) {
      errors.instructor_name = 'Instructor name is required';
    } else if (form.instructor_name.length > 100) {
      errors.instructor_name = 'Instructor name cannot exceed 100 characters';
    }

    // instructor email validation
    if (form.instructor_email && form.instructor_email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.instructor_email.trim())) {
        errors.instructor_email = 'Invalid Email';
      }
    }

    // dayOfWeek
    const dow = parseInt(form.dayOfWeek);
    if (isNaN(dow) || dow < 0 || dow > 6) {
      errors.dayOfWeek = 'Day of week is required and must be between 0 (Sun) and 6 (Sat)';
    }

    // times
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!form.startTime || !timeRegex.test(form.startTime)) {
      errors.startTime = 'Start time is required and must be in HH:MM format';
    }
    if (!form.endTime || !timeRegex.test(form.endTime)) {
      errors.endTime = 'End time is required and must be in HH:MM format';
    }

    // duration (optional)
    const dur = parseInt(form.duration);
    if (form.duration && !isNaN(dur)) {
      if (dur < 15) {
        errors.duration = 'Duration must be at least 15 minutes';
      } else if (dur > 180) {
        errors.duration = 'Duration cannot exceed 180 minutes';
      }
    }

    // dates
    const sd = new Date(form.startDate);
    sd.setHours(0,0,0,0); // For date-only comparison

    if (!form.startDate || isNaN(sd.getTime())) {
      errors.startDate = 'Start date is required';
    } else if (sd < new Date(minStartDate)) { // Compare with tomorrow
      errors.startDate = 'Start date must be tomorrow or later';
    }
    const ed = new Date(form.endDate);
    if (!form.endDate || isNaN(ed.getTime())) {
      errors.endDate = 'End date is required';
    }
    if (!errors.startDate && !errors.endDate && ed < sd) {
      errors.endDate = 'End date must be the same day or after start date';
    }
    
    // end time must be after start time
    if (!errors.startTime && !errors.endTime && form.startTime && form.endTime) {
      if (form.endTime <= form.startTime) {
        errors.endTime = 'End time must be after start time';
      }
    }

    // location
    if (!form.location || !form.location.trim()) {
      errors.location = 'Location is required';
    } else if (form.location.length > 100) {
      errors.location = 'Location cannot exceed 100 characters';
    }

    // maxParticipants
    const maxP = parseInt(form.maxParticipants);
    if (isNaN(maxP)) {
      errors.maxParticipants = 'Maximum participants is required';
    } else if (maxP < 1) {
      errors.maxParticipants = 'Maximum participants must be at least 1';
    } else if (maxP > 100) {
      errors.maxParticipants = 'Maximum participants cannot exceed 100';
    }

    console.log('Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // set default type when sessionTypes load
  useEffect(() => {
    if (sessionTypes && sessionTypes.length > 0) {
      setForm(prev => ({ ...prev, type: sessionTypes[0].value }));
    }
  }, [sessionTypes]);

  // Automatically update dayOfWeek when startDate changes
  useEffect(() => {
    if (form.startDate) {
      const date = new Date(form.startDate);
      if (!isNaN(date.getTime())) {
        const dayOfWeek = date.getDay();
        setForm(prev => ({ ...prev, dayOfWeek }));
        
        // If not recurring, set end date same as start date
        if (!form.isRecurring) {
          setForm(prev => ({ ...prev, endDate: form.startDate }));
        }
      }
    }
  }, [form.startDate, form.isRecurring]);

  // When isRecurring changes, adjust end date
  useEffect(() => {
    if (!form.isRecurring && form.startDate) {
      setForm(prev => ({ ...prev, endDate: form.startDate }));
    }
  }, [form.isRecurring, form.startDate]);

  const show = Boolean(isVisible);

  const handleChange = (k, v) => {
    setForm(prev => {
      const newForm = { ...prev, [k]: v };
      // If startTime changes and endTime is set but becomes invalid, clear endTime
      if (k === 'startTime' && newForm.endTime && v && newForm.endTime <= v) {
        newForm.endTime = ''; 
      }
      return newForm;
    });
  };

  const clearFieldError = (k) => setFormErrors(prev => {
    if (!prev) return {};
    const copy = { ...prev };
    if (copy[k]) delete copy[k];
    return copy;
  });

  const create = async () => {
    try {
      // client-side validation first
      const ok = validateForm();
      if (!ok) {
        toast.error('Please fix the highlighted fields');
        return;
      }
      // Build payload matching GymSession model
      const payload = {
        title: form.title,
        description: form.description || '',
        type: form.type,
        instructor: {
          name: form.instructor_name,
          email: form.instructor_email || '',
          bio: '',
          certifications: [],
        },
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        startDate: form.startDate,
        endDate: form.isRecurring ? form.endDate : form.startDate, // Use same date if not recurring
        location: form.location,
        room: form.room || '',
        equipment: [],
        maxParticipants: parseInt(form.maxParticipants),
        registrationRequired: form.registrationRequired,
        waitlistEnabled: form.waitlistEnabled,
        eligibleRoles: form.eligibleRoles,
        skillLevel: form.skillLevel,
        ageRestriction: {
          minAge: parseInt(form.ageMin) || 16,
          maxAge: parseInt(form.ageMax) || 100,
        },
        status: form.status,
        isRecurring: form.isRecurring,
        prerequisites: '',
        benefits: [],
        calories: undefined,
        tags: [],
        cost: form.cost ? parseFloat(form.cost) : 0,
        dropInAllowed: form.dropInAllowed,
        dropInCost: form.dropInCost ? parseFloat(form.dropInCost) : 0,
      };

      await gymAPI.createSession(payload);
      toast.success(form.isRecurring ? "Recurring gym session created" : "Gym session created");
      setOpen(false);
      onCreated && onCreated();
    } catch (err) {
      console.error("Create session failed:", err);
      console.error("Error response data:", err.response?.data);
      
      // Parse backend validation errors if present
      const resp = err.response?.data;
      if (resp && resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
        // resp.errors is an array of { msg/message, param/field/path }
        const map = {};
        resp.errors.forEach(e => {
          const key = e.param || e.field || e.path || null;
          const msg = e.msg || e.message || (typeof e === 'string' ? e : 'Invalid value');
          if (!key) return;
          // normalize field names used in our form
          const normalize = (k) => {
            if (!k) return k;
            if (k === 'instructor.name') return 'instructor_name';
            if (k === 'instructor.email') return 'instructor_email';
            if (k === 'ageRestriction.minAge') return 'ageMin';
            if (k === 'ageRestriction.maxAge') return 'ageMax';
            return k.replace(/\./g, '_');
          };
          map[normalize(key)] = msg;
        });
        setFormErrors(map);
        toast.error('Please fix the highlighted fields');
      } else if (resp && resp.message) {
        toast.error(resp.message);
      } else {
        toast.error("Failed to create session. Please check all fields.");
      }
    }
  };

  if (!show) return null;

  const inputStyle = styles.filterInput;
  const selectStyle = styles.filterSelect;
  const buttonPrimary = { ...theme.components.button.primary, marginRight: 8 };
  const buttonSecondary = { ...theme.components.button.secondary };

  // Modal overlay and container styles
  const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing[4],
    overflow: 'auto',
  };

  const modalContainer = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.xl,
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: theme.spacing[6],
  };

  return (
    <>
      <button
        style={{ 
          ...theme.components.button.primary, 
          padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: theme.spacing[2],
          whiteSpace: 'nowrap',
        }}
        onClick={() => setOpen(true)}
        aria-label="Create Session"
      >
        <span style={{ display: 'inline-block' }}>Create Session</span>
        <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: 'inline-block' }}>
          <path fill="#ffffff" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
        </svg>
      </button>

      {open && (
        <div style={modalOverlay} onClick={() => setOpen(false)}>
          <div style={modalContainer} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginTop: 0 }}>Create Gym Session</h3>
          <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
            Fill in the essential details to create a new gym session. By default, the session will occur only on the selected date.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[4] }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Session Title *</label>
              <input 
                style={inputStyle} 
                placeholder="e.g., Morning Yoga, HIIT Workout" 
                value={form.title} 
                onChange={(e)=>{ handleChange('title', e.target.value); clearFieldError('title'); }} 
              />
              {formErrors.title && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.title}</div>}
            </div>

            {/* Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Session Type *</label>
              <select style={selectStyle} value={form.type} onChange={(e)=>handleChange('type', e.target.value)}>
                {sessionTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Skill Level */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Skill Level *</label>
              <select style={selectStyle} value={form.skillLevel} onChange={(e)=>handleChange('skillLevel', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all_levels">All Levels</option>
              </select>
            </div>

            {/* Instructor Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Instructor Name *</label>
              <input 
                style={inputStyle} 
                placeholder="John Doe"
                value={form.instructor_name} 
                onChange={(e)=>{ handleChange('instructor_name', e.target.value); clearFieldError('instructor_name'); }} 
              />
              {formErrors.instructor_name && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.instructor_name}</div>}
            </div>

            {/* Instructor Email (optional) */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Instructor Email</label>
              <input 
                style={inputStyle} 
                placeholder="john@example.com"
                value={form.instructor_email} 
                onChange={(e)=>{ handleChange('instructor_email', e.target.value); clearFieldError('instructor_email'); }} 
              />
              {formErrors.instructor_email && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.instructor_email}</div>}
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Session Date *</label>
              <input 
                style={inputStyle} 
                type="date" 
                value={form.startDate} 
                min={minStartDate}
                onChange={(e)=>{ handleChange('startDate', e.target.value); clearFieldError('startDate'); }} 
              />
              {formErrors.startDate && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.startDate}</div>}
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: 4 }}>
                Day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][form.dayOfWeek]}
              </div>
            </div>

            {/* Recurring Checkbox */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                <input 
                  type="checkbox" 
                  id="isRecurring" 
                  checked={form.isRecurring} 
                  onChange={(e) => handleChange('isRecurring', e.target.checked)}
                  style={{ cursor: 'pointer', width: 18, height: 18 }}
                />
                <label htmlFor="isRecurring" style={{ fontSize: theme.typography.fontSize.sm, cursor: 'pointer', fontWeight: theme.typography.fontWeight.medium }}>
                  Repeat weekly
                </label>
              </div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: 4, marginLeft: 26 }}>
                {form.isRecurring 
                  ? `Will repeat every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][form.dayOfWeek]}`
                  : 'Single session only'}
              </div>
            </div>

            {/* End Date (only shown if recurring) */}
            {form.isRecurring && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Repeat Until *</label>
                <input 
                  style={inputStyle} 
                  type="date" 
                  value={form.endDate} 
                  min={form.startDate}
                  onChange={(e)=>{ handleChange('endDate', e.target.value); clearFieldError('endDate'); }} 
                />
                {formErrors.endDate && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.endDate}</div>}
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: 4 }}>
                  Session will occur every {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][form.dayOfWeek]} from {new Date(form.startDate).toLocaleDateString()} to {new Date(form.endDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Time Range */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Start Time *</label>
              <input 
                style={inputStyle} 
                type="time" 
                value={form.startTime} 
                onChange={(e)=>{ handleChange('startTime', e.target.value); clearFieldError('startTime'); }} 
              />
              {formErrors.startTime && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.startTime}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>End Time *</label>
              <input 
                style={inputStyle} 
                type="time" 
                value={form.endTime} 
                min={form.startTime}
                onChange={(e)=>{ handleChange('endTime', e.target.value); clearFieldError('endTime'); }} 
              />
              {formErrors.endTime && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.endTime}</div>}
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Location *</label>
              <input 
                style={inputStyle} 
                placeholder="Main Gym, Studio A, etc."
                value={form.location} 
                onChange={(e)=>{ handleChange('location', e.target.value); clearFieldError('location'); }} 
              />
              {formErrors.location && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.location}</div>}
            </div>

            {/* Max Participants */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Max Participants *</label>
              <input 
                style={inputStyle} 
                type="number" 
                min="1"
                max="100"
                value={form.maxParticipants} 
                onChange={(e)=>{ handleChange('maxParticipants', e.target.value); clearFieldError('maxParticipants'); }} 
              />
              {formErrors.maxParticipants && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.maxParticipants}</div>}
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: theme.typography.fontWeight.medium }}>Description</label>
              <textarea 
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} 
                placeholder="Brief description of the session..."
                value={form.description} 
                onChange={(e)=>handleChange('description', e.target.value)} 
              />
            </div>
          </div>

            <div style={{ marginTop: theme.spacing[4], display: 'flex', justifyContent: 'flex-end', gap: theme.spacing[2] }}>
              <button onClick={()=>setOpen(false)} style={buttonSecondary}>Cancel</button>
              <button onClick={create} style={buttonPrimary}>Create Session</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GymSchedulePage;
