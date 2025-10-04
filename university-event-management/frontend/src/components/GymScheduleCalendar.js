import React, { useState } from "react";
import theme from "../theme";

const GymScheduleCalendar = ({ sessions, year, month }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getSessionsForDate = (date) => {
    const dayOfWeek = new Date(year, month - 1, date).getDay();
    return sessions.filter(session => session.dayOfWeek === dayOfWeek);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      yoga: "#8b5cf6",
      pilates: "#10b981",
      aerobics: "#f59e0b",
      zumba: "#ec4899",
      cross_circuit: "#ef4444",
      kickboxing: "#3b82f6",
      cardio: "#f97316",
      strength_training: "#6b7280",
      dance: "#d946ef",
      martial_arts: "#1f2937",
      swimming: "#06b6d4",
      spinning: "#84cc16",
    };
    return colors[type] || theme.colors.primary.main;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const styles = {
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.xl,
      boxShadow: theme.shadows.md,
      overflow: "hidden",
    },
    header: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      backgroundColor: theme.colors.background.default,
      borderBottom: `1px solid ${theme.colors.border.light}`,
    },
    dayHeader: {
      padding: theme.spacing[3],
      textAlign: "center",
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    calendar: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      minHeight: "600px",
    },
    dayCell: {
      minHeight: "120px",
      border: `1px solid ${theme.colors.border.light}`,
      padding: theme.spacing[2],
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    dayCellHover: {
      backgroundColor: theme.colors.background.default,
    },
    dayCellSelected: {
      backgroundColor: theme.colors.primary.light + "20",
      borderColor: theme.colors.primary.main,
    },
    dayNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[1],
    },
    dayNumberToday: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.text.white,
      borderRadius: theme.borderRadius.full,
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: theme.typography.fontSize.xs,
    },
    sessionsContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing[1],
      overflow: "hidden",
    },
    sessionItem: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.white,
      textAlign: "center",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    sessionItemHover: {
      transform: "scale(1.05)",
    },
    moreIndicator: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      textAlign: "center",
      fontStyle: "italic",
      marginTop: theme.spacing[1],
    },
    selectedDateDetails: {
      margin: theme.spacing[4],
      padding: theme.spacing[4],
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.lg,
      border: `2px solid ${theme.colors.primary.main}`,
    },
    selectedDateTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[3],
    },
    sessionDetails: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing[3],
    },
    sessionDetailItem: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing[3],
      padding: theme.spacing[3],
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border.light}`,
    },
    sessionTypeIndicator: {
      width: "12px",
      height: "40px",
      borderRadius: theme.borderRadius.sm,
    },
    sessionDetailContent: {
      flex: 1,
    },
    sessionDetailTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[1],
    },
    sessionDetailMeta: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    noSessionsMessage: {
      textAlign: "center",
      color: theme.colors.text.secondary,
      fontStyle: "italic",
      padding: theme.spacing[4],
    },
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayClick = (day) => {
    if (day && getSessionsForDate(day).length > 0) {
      setSelectedDate(day);
    } else {
      setSelectedDate(null);
    }
  };

  const renderSessionItem = (session, index, maxVisible = 2) => {
    if (index >= maxVisible) return null;

    return (
      <div
        key={`${session._id}-${index}`}
        style={{
          ...styles.sessionItem,
          backgroundColor: getSessionTypeColor(session.type),
        }}
        title={`${session.title} - ${formatTime(session.startTime)} with ${session.instructor.name}`}
      >
        {formatTime(session.startTime)} {session.title.length > 15 ? session.title.substring(0, 15) + '...' : session.title}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Calendar Header */}
      <div style={styles.header}>
        {dayNames.map(day => (
          <div key={day} style={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendar}>
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dayDate = new Date(year, month - 1, day);
          const isToday = isCurrentMonth && day === today.getDate();
          const sessionsForDay = getSessionsForDate(day);
          const isSelected = selectedDate === day;

          return (
            <div
              key={day}
              style={{
                ...styles.dayCell,
                ...(isSelected ? styles.dayCellSelected : {}),
              }}
              onClick={() => handleDayClick(day)}
              onMouseEnter={(e) => {
                if (sessionsForDay.length > 0) {
                  e.target.style.backgroundColor = styles.dayCellHover.backgroundColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <div style={isToday ? styles.dayNumberToday : styles.dayNumber}>
                {day}
              </div>
              
              <div style={styles.sessionsContainer}>
                {sessionsForDay.slice(0, 2).map((session, index) => 
                  renderSessionItem(session, index)
                )}
                
                {sessionsForDay.length > 2 && (
                  <div style={styles.moreIndicator}>
                    +{sessionsForDay.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div style={styles.selectedDateDetails}>
          <h3 style={styles.selectedDateTitle}>
            Sessions for {new Date(year, month - 1, selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          <div style={styles.sessionDetails}>
            {getSessionsForDate(selectedDate).length === 0 ? (
              <div style={styles.noSessionsMessage}>
                No gym sessions scheduled for this day.
              </div>
            ) : (
              getSessionsForDate(selectedDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(session => (
                  <div key={session._id} style={styles.sessionDetailItem}>
                    <div
                      style={{
                        ...styles.sessionTypeIndicator,
                        backgroundColor: getSessionTypeColor(session.type),
                      }}
                    />
                    <div style={styles.sessionDetailContent}>
                      <div style={styles.sessionDetailTitle}>
                        {session.title}
                      </div>
                      <div style={styles.sessionDetailMeta}>
                        {formatTime(session.startTime)} - {formatTime(session.endTime)} • 
                        {session.instructor.name} • 
                        {session.location}
                        {session.room && ` (${session.room})`} • 
                        {session.maxParticipants - session.currentParticipants} spots available
                      </div>
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

export default GymScheduleCalendar;