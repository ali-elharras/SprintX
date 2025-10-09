import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import GymScheduleCalendar from "../components/GymScheduleCalendar";
import GymSessionCard from "../components/GymSessionCard";
import LoadingScreen from "../components/LoadingScreen";
import { gymAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import theme from "../theme";

const GymSchedulePage = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registeredSessionIds, setRegisteredSessionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  const fetchSessionTypes = useCallback(async () => {
    try {
      const response = await gymAPI.getSessionTypes();
      if (response.data.success) {
        setSessionTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (viewMode === "calendar") {
        response = await gymAPI.getSessionsByMonth(currentYear, currentMonth);
      } else {
        response = await gymAPI.getSessions();
      }

      if (response.data.success) {
        setSessions(response.data.data.sessions || response.data.data);
      }
    } catch (error) {
      console.error("Error fetching gym sessions:", error);
      toast.error("Failed to load gym sessions");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, [viewMode, currentYear, currentMonth]);

  const fetchMyRegistrations = useCallback(async () => {
    try {
      if (!auth?.user) {
        setMyRegistrations([]);
        setRegisteredSessionIds(new Set());
        return;
      }

      const response = await gymAPI.getMyRegistrations({ upcoming: true });
      // API returns { success, data: [...] } or an array in some endpoints; handle both
      const regs = response.data?.data || response.data || [];
      setMyRegistrations(regs);
      const ids = new Set(regs.map(r => {
        // registration may populate gymSession as object or just an id
        if (!r) return null;
        if (r.gymSession && typeof r.gymSession === 'object') return r.gymSession._id;
        return r.gymSession || null;
      }).filter(Boolean));
      setRegisteredSessionIds(ids);
    } catch (err) {
      console.error('Failed to fetch user gym registrations', err);
      setMyRegistrations([]);
      setRegisteredSessionIds(new Set());
    }
  }, [auth?.user]);

  const handleAfterRegister = useCallback(async () => {
    try {
      await fetchSessions();
      await fetchMyRegistrations();
    } catch (err) {
      console.error('Refresh after register failed', err);
    }
  }, [fetchSessions, fetchMyRegistrations]);

  const cancelRegistration = useCallback(async ({ registrationId = null, sessionId = null } = {}) => {
    try {
      let regId = registrationId;
      if (!regId && sessionId) {
        const found = myRegistrations.find(r => {
          if (!r) return false;
          if (r.gymSession && typeof r.gymSession === 'object') return r.gymSession._id === sessionId;
          return r.gymSession === sessionId;
        });
        regId = found?._id;
      }

      if (!regId) {
        throw new Error('Registration not found to cancel');
      }

      await gymAPI.cancelRegistration(regId);
      toast.success('Registration cancelled');
      await handleAfterRegister();
    } catch (err) {
      console.error('Cancel registration failed', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel registration');
      throw err;
    }
  }, [myRegistrations, handleAfterRegister]);

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
        <Navbar />
        <LoadingScreen type="gym" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {/* Events Office Create Session Button */}
        <CreateSessionInline
          isVisible={showCreateButton}
          onCreated={() => fetchSessions()}
          sessionTypes={sessionTypes}
          styles={styles}
        />
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Gym Schedule</h1>
          <p style={styles.subtitle}>
            Discover and join our comprehensive fitness program. From yoga to kickboxing,
            find the perfect workout for your lifestyle and fitness goals.
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
          </div>
        </div>

        {/* Content */}
        {viewMode === "calendar" ? (
          <GymScheduleCalendar
            sessions={filteredSessions}
            year={currentYear}
            month={currentMonth}
            registeredSessionIds={registeredSessionIds}
            onRegistered={handleAfterRegister}
            onCancelRegistration={cancelRegistration}
            getRegistrationForSession={(sessionId) => myRegistrations.find(r => {
              if (!r) return false;
              if (r.gymSession && typeof r.gymSession === 'object') return r.gymSession._id === sessionId;
              return r.gymSession === sessionId;
            })}
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
                    isRegistered={registeredSessionIds.has(session._id)}
                    registration={myRegistrations.find(r => {
                      if (!r) return false;
                      if (r.gymSession && typeof r.gymSession === 'object') return r.gymSession._id === session._id;
                      return r.gymSession === session._id;
                    })}
                    onRegister={async (sessionId) => {
                      try {
                        await fetchSessions();
                        await fetchMyRegistrations();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    onUpdated={() => fetchSessions()}
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "yoga",
    instructor_name: "",
    instructor_email: "",
    instructor_bio: "",
    instructor_certifications: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    startDate: new Date().toISOString().slice(0,10),
    endDate: new Date().toISOString().slice(0,10),
    location: "Main Gym",
    room: "",
    equipment: "",
    maxParticipants: 20,
    registrationRequired: true,
    waitlistEnabled: false,
    eligibleRoles: ["student","staff","ta","professor"],
    skillLevel: "all_levels",
    ageMin: 16,
    ageMax: 100,
    status: "active",
    isRecurring: true,
    prerequisites: "",
    benefits: "",
    calories: "",
    tags: "",
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

    // duration
    const dur = parseInt(form.duration);
    if (isNaN(dur)) {
      errors.duration = 'Duration is required';
    } else if (dur < 15) {
      errors.duration = 'Duration must be at least 15 minutes';
    } else if (dur > 180) {
      errors.duration = 'Duration cannot exceed 180 minutes';
    }

    // dates
    const sd = new Date(form.startDate);
    const ed = new Date(form.endDate);
    if (!form.startDate || isNaN(sd.getTime())) {
      errors.startDate = 'Start date is required';
    }
    if (!form.endDate || isNaN(ed.getTime())) {
      errors.endDate = 'End date is required';
    }
    if (!errors.startDate && !errors.endDate && ed < sd) {
      errors.endDate = 'End date must be the same day or after start date';
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // set default type when sessionTypes load
  useEffect(() => {
    if (sessionTypes && sessionTypes.length > 0) {
      setForm(prev => ({ ...prev, type: sessionTypes[0].value }));
    }
  }, [sessionTypes]);

  const show = Boolean(isVisible);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

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
        description: form.description,
        type: form.type,
        instructor: {
          name: form.instructor_name,
          email: form.instructor_email,
          bio: form.instructor_bio,
          certifications: form.instructor_certifications ? form.instructor_certifications.split(",").map(s=>s.trim()).filter(Boolean) : [],
        },
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        duration: parseInt(form.duration),
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location,
        room: form.room,
        equipment: form.equipment ? form.equipment.split(",").map(s=>s.trim()).filter(Boolean) : [],
        maxParticipants: parseInt(form.maxParticipants),
        registrationRequired: Boolean(form.registrationRequired),
        waitlistEnabled: Boolean(form.waitlistEnabled),
        eligibleRoles: Array.isArray(form.eligibleRoles) ? form.eligibleRoles : form.eligibleRoles.split(",").map(s=>s.trim()).filter(Boolean),
        skillLevel: form.skillLevel,
        ageRestriction: {
          minAge: parseInt(form.ageMin) || 16,
          maxAge: parseInt(form.ageMax) || 100,
        },
        status: form.status,
        isRecurring: Boolean(form.isRecurring),
        prerequisites: form.prerequisites,
        benefits: form.benefits ? form.benefits.split(",").map(s=>s.trim()).filter(Boolean) : [],
        calories: form.calories ? parseInt(form.calories) : undefined,
        tags: form.tags ? form.tags.split(",").map(s=>s.trim()).filter(Boolean) : [],
        cost: form.cost ? parseFloat(form.cost) : 0,
        dropInAllowed: Boolean(form.dropInAllowed),
        dropInCost: form.dropInCost ? parseFloat(form.dropInCost) : 0,
        
      };

      await gymAPI.createSession(payload);
      toast.success("Gym session created");
      setOpen(false);
      onCreated && onCreated();
    } catch (err) {
      console.error("Create session failed:", err);
      // Parse backend validation errors if present
      const resp = err.response?.data;
      if (resp && resp.errors) {
        // resp.errors may be an array of { msg/message, param/field/path }
        const errors = Array.isArray(resp.errors) ? resp.errors : (resp.errors.data || []);
        const map = {};
        errors.forEach(e => {
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
      } else {
        toast.error(err.message || "Failed to create session");
      }
    }
  };

  if (!show) return null;

  const modalStyle = {
    ...styles.controls,
    padding: theme.spacing[4],
    maxWidth: 800,
    marginBottom: theme.spacing[4],
    minWidth:'90vw',
  };

  const inputStyle = styles.filterInput;
  const selectStyle = styles.filterSelect;
  const buttonPrimary = { ...theme.components.button.primary, marginRight: 8 };
  const buttonSecondary = { ...theme.components.button.secondary };

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        style={{ ...theme.components.button.primary, padding: '8px 12px', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: theme.spacing[2] }}
        onClick={() => setOpen(true)}
        aria-label="Create Session"
      >
        <span style={{ display: 'inline-block' }}>Create Session</span>
         <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: 'inline-block' }}>
          <path fill="#ffffff" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
        </svg>
      </button>

      {open && (
        <div style={styles.controls}>
          <h3 style={{ marginTop: 0 }}>Create Gym Session</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <input style={inputStyle} placeholder="Title" value={form.title} onChange={(e)=>{ handleChange('title', e.target.value); clearFieldError('title'); }} />
            {formErrors.title && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.title}</div>}
            <select style={selectStyle} value={form.type} onChange={(e)=>handleChange('type', e.target.value)}>
              {sessionTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <textarea style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 80 }} placeholder="Description" value={form.description} onChange={(e)=>handleChange('description', e.target.value)} />

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Instructor Name</label>
              <input style={inputStyle} value={form.instructor_name} onChange={(e)=>{ handleChange('instructor_name', e.target.value); clearFieldError('instructor_name'); }} />
              {formErrors.instructor_name && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.instructor_name}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Instructor Email</label>
              <input style={inputStyle} value={form.instructor_email} onChange={(e)=>{ handleChange('instructor_email', e.target.value); clearFieldError('instructor_email'); }} />
              {formErrors.instructor_email && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.instructor_email}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Instructor Bio</label>
              <input style={inputStyle} value={form.instructor_bio} onChange={(e)=>handleChange('instructor_bio', e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Instructor Certifications (comma separated)</label>
              <input style={inputStyle} value={form.instructor_certifications} onChange={(e)=>handleChange('instructor_certifications', e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Day of week</label>
              <select style={selectStyle} value={form.dayOfWeek} onChange={(e)=>{ handleChange('dayOfWeek', e.target.value); clearFieldError('dayOfWeek'); }}>
                {[0,1,2,3,4,5,6].map(d=> <option key={d} value={d}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</option>)}
              </select>
              {formErrors.dayOfWeek && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.dayOfWeek}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Duration (minutes)</label>
              <input style={inputStyle} type="number" value={form.duration} onChange={(e)=>{ handleChange('duration', e.target.value); clearFieldError('duration'); }} />
              {formErrors.duration && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.duration}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Start time</label>
              <input style={inputStyle} type="time" value={form.startTime} onChange={(e)=>{ handleChange('startTime', e.target.value); clearFieldError('startTime'); }} />
              {formErrors.startTime && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.startTime}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>End time</label>
              <input style={inputStyle} type="time" value={form.endTime} onChange={(e)=>{ handleChange('endTime', e.target.value); clearFieldError('endTime'); }} />
              {formErrors.endTime && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.endTime}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Start Date</label>
              <input style={inputStyle} type="date" value={form.startDate} onChange={(e)=>{ handleChange('startDate', e.target.value); clearFieldError('startDate'); }} />
              {formErrors.startDate && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.startDate}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>End Date</label>
              <input style={inputStyle} type="date" value={form.endDate} onChange={(e)=>{ handleChange('endDate', e.target.value); clearFieldError('endDate'); }} />
              {formErrors.endDate && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.endDate}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Location</label>
              <input style={inputStyle} value={form.location} onChange={(e)=>{ handleChange('location', e.target.value); clearFieldError('location'); }} />
              {formErrors.location && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.location}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Room</label>
              <input style={inputStyle} value={form.room} onChange={(e)=>handleChange('room', e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Equipment (comma separated)</label>
              <input style={inputStyle} value={form.equipment} onChange={(e)=>handleChange('equipment', e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Max Participants</label>
              <input style={inputStyle} type="number" value={form.maxParticipants} onChange={(e)=>{ handleChange('maxParticipants', e.target.value); clearFieldError('maxParticipants'); }} />
              {formErrors.maxParticipants && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.maxParticipants}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Skill Level</label>
              <select style={selectStyle} value={form.skillLevel} onChange={(e)=>handleChange('skillLevel', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all_levels">All Levels</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Eligible Roles (comma separated)</label>
              <input style={inputStyle} value={form.eligibleRoles} onChange={(e)=>{ handleChange('eligibleRoles', e.target.value); clearFieldError('eligibleRoles'); }} />
              {formErrors.eligibleRoles && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.eligibleRoles}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Min Age</label>
              <input style={inputStyle} type="number" value={form.ageMin} onChange={(e)=>{ handleChange('ageMin', e.target.value); clearFieldError('ageMin'); }} />
              {formErrors.ageMin && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.ageMin}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Max Age</label>
              <input style={inputStyle} type="number" value={form.ageMax} onChange={(e)=>{ handleChange('ageMax', e.target.value); clearFieldError('ageMax'); }} />
              {formErrors.ageMax && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.ageMax}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Cost</label>
              <input style={inputStyle} type="number" step="0.01" value={form.cost} onChange={(e)=>{ handleChange('cost', e.target.value); clearFieldError('cost'); }} />
              {formErrors.cost && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.cost}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Tags (comma separated)</label>
              <input style={inputStyle} value={form.tags} onChange={(e)=>{ handleChange('tags', e.target.value); clearFieldError('tags'); }} />
              {formErrors.tags && <div style={{ color: theme.colors.error.main, marginTop: 6, fontSize: 13 }}>{formErrors.tags}</div>}
            </div>

            
          </div>

          <div style={{ marginTop: theme.spacing[4], display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={create} style={buttonPrimary}>Create</button>
            <button onClick={()=>setOpen(false)} style={buttonSecondary}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymSchedulePage;
