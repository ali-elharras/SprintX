import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import GymScheduleCalendar from "../components/GymScheduleCalendar";
import GymSessionCard from "../components/GymSessionCard";
import { getGymSessions, getGymSessionsByMonth, getGymSessionTypes } from "../services/api";
import theme from "../theme";

const GymSchedulePage = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
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

  useEffect(() => {
    fetchSessionTypes();
    fetchSessions();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const fetchSessionTypes = async () => {
    try {
      const response = await getGymSessionTypes();
      if (response.data.success) {
        setSessionTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let response;
      
      if (viewMode === "calendar") {
        response = await getGymSessionsByMonth(currentYear, currentMonth);
      } else {
        response = await getGymSessions();
      }
      
      if (response.data.success) {
        setSessions(response.data.data.sessions || response.data.data);
      }
    } catch (error) {
      console.error("Error fetching gym sessions:", error);
      toast.error("Failed to load gym sessions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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
  };

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
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            Loading gym schedule...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
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
                    onRegister={(sessionId) => {
                      // Handle registration
                      console.log("Register for session:", sessionId);
                    }}
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

export default GymSchedulePage;