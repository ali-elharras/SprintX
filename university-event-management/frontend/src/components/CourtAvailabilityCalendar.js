import React, { useState, useEffect } from "react";
import theme from "../theme";
import { courtAPI } from "../services/api";
import toast from "react-hot-toast";

const CourtAvailabilityCalendar = ({ court, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate, court]);

  const fetchAvailability = async () => {
    if (!court || !selectedDate) return;
    
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching availability for court:', court._id || court.id, 'date:', dateStr);
      const courtId = court._id || court.id;
      const response = await courtAPI.getCourtAvailability(courtId, dateStr);
      console.log('Availability response:', response.data);
      setAvailability(response.data.data?.availableSlots || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load availability");
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    
    // Get first day of week (0 = Sunday)
    const startDay = firstDay.getDay();
    
    // Add empty cells for days before month starts
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const getOperatingHours = (date) => {
    if (!court || !date) return null;
    const dayOfWeek = getDayOfWeek(date);
    return court.operatingHours?.[dayOfWeek];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing[4],
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.white,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[6],
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing[6],
            paddingBottom: theme.spacing[4],
            borderBottom: `2px solid ${theme.colors.border.light}`,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: theme.typography.fontSize["2xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing[1],
              }}
            >
              {court?.name} - Availability
            </h2>
            <p
              style={{
                color: theme.colors.text.secondary,
                margin: 0,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Select a date to view available time slots
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: theme.typography.fontSize.xl,
              cursor: "pointer",
              color: theme.colors.text.secondary,
              padding: theme.spacing[2],
              borderRadius: theme.borderRadius.md,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.background.gray;
              e.target.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = theme.colors.text.secondary;
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: theme.spacing[6] }}>
          {/* Calendar */}
          <div style={{ flex: 1 }}>
            {/* Calendar Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing[4],
              }}
            >
              <button
                onClick={previousMonth}
                style={{
                  background: theme.colors.primary.main,
                  color: theme.colors.text.white,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  cursor: "pointer",
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#4f46e5";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary.main;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                ‹
              </button>
              
              <h3
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: 0,
                }}
              >
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={nextMonth}
                style={{
                  background: theme.colors.primary.main,
                  color: theme.colors.text.white,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  cursor: "pointer",
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#4f46e5";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary.main;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                ›
              </button>
            </div>

            {/* Day Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: theme.spacing[1],
                marginBottom: theme.spacing[2],
              }}
            >
              {dayNames.map((day) => (
                <div
                  key={day}
                  style={{
                    padding: theme.spacing[2],
                    textAlign: "center",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: theme.spacing[1],
              }}
            >
              {days.map((date, index) => {
                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);
                const operatingHours = getOperatingHours(date);
                const isOpen = operatingHours?.isOpen;

                return (
                  <button
                    key={index}
                    onClick={() => date && !disabled && setSelectedDate(date)}
                    disabled={disabled || !date}
                    style={{
                      padding: theme.spacing[3],
                      border: selected
                        ? `3px solid ${theme.colors.primary.main}`
                        : `1px solid ${theme.colors.border.default}`,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: selected
                        ? theme.colors.primary.main
                        : disabled || !isOpen
                        ? "#f3f4f6"
                        : theme.colors.background.white,
                      color: selected
                        ? theme.colors.text.white
                        : disabled || !isOpen
                        ? "#9ca3af"
                        : theme.colors.text.primary,
                      cursor: disabled || !date || !isOpen ? "not-allowed" : "pointer",
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: selected ? theme.typography.fontWeight.bold : theme.typography.fontWeight.normal,
                      transition: "all 0.2s ease",
                      opacity: !date ? 0 : 1,
                      boxShadow: selected ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled && date && isOpen && !selected) {
                        e.target.style.backgroundColor = "#e5e7eb";
                        e.target.style.borderColor = theme.colors.primary.main;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled && date && !selected) {
                        e.target.style.backgroundColor = theme.colors.background.white;
                        e.target.style.borderColor = theme.colors.border.default;
                      }
                    }}
                  >
                    {date ? date.getDate() : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Panel */}
          <div
            style={{
              flex: 1,
              padding: theme.spacing[4],
              backgroundColor: "#f8fafc",
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border.light}`,
            }}
          >
            <h4
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[4]} 0`,
              }}
            >
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </h4>

            {selectedDate && (
              <>
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: theme.spacing[6],
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Loading availability...
                  </div>
                ) : (
                  <>
                    {(() => {
                      const dayHours = getOperatingHours(selectedDate);
                      
                      if (!dayHours?.isOpen) {
                        return (
                          <div
                            style={{
                              textAlign: "center",
                              padding: theme.spacing[6],
                              color: theme.colors.text.secondary,
                            }}
                          >
                            <p>Court is closed on this day</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div
                            style={{
                              marginBottom: theme.spacing[4],
                              padding: theme.spacing[3],
                              backgroundColor: theme.colors.background.white,
                              borderRadius: theme.borderRadius.md,
                              border: `1px solid ${theme.colors.border.light}`,
                            }}
                          >
                            <h5
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text.secondary,
                                margin: `0 0 ${theme.spacing[1]} 0`,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Operating Hours
                            </h5>
                            <p
                              style={{
                                margin: 0,
                                color: theme.colors.text.primary,
                                fontWeight: theme.typography.fontWeight.medium,
                              }}
                            >
                              {formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}
                            </p>
                          </div>

                          <div
                            style={{
                              marginBottom: theme.spacing[4],
                              padding: theme.spacing[3],
                              backgroundColor: theme.colors.background.white,
                              borderRadius: theme.borderRadius.md,
                              border: `1px solid ${theme.colors.border.light}`,
                            }}
                          >
                            <h5
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text.secondary,
                                margin: `0 0 ${theme.spacing[2]} 0`,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Pricing
                            </h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[1] }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: theme.colors.text.secondary }}>Regular Rate:</span>
                                <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
                                  {court?.pricing?.hourlyRate} {court?.pricing?.currency}/hour
                                </span>
                              </div>
                              {court?.pricing?.studentDiscount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: theme.colors.text.secondary }}>Student Rate:</span>
                                  <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.success.main }}>
                                    {Math.round(court?.pricing?.hourlyRate * (1 - court?.pricing?.studentDiscount / 100))} {court?.pricing?.currency}/hour
                                    <span style={{ fontSize: theme.typography.fontSize.xs, marginLeft: theme.spacing[1] }}>
                                      (-{court?.pricing?.studentDiscount}%)
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text.secondary,
                                margin: `0 0 ${theme.spacing[2]} 0`,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Available Time Slots
                            </h5>
                            
                            {availability.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                                {availability.map((slot, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      padding: theme.spacing[3],
                                      backgroundColor: slot.available 
                                        ? "#f0f9ff" 
                                        : "#fef2f2",
                                      borderRadius: theme.borderRadius.md,
                                      border: `2px solid ${slot.available 
                                        ? "#0284c7" 
                                        : "#dc2626"}`,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span style={{ 
                                      fontWeight: theme.typography.fontWeight.medium,
                                      color: "#1f2937"
                                    }}>
                                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: theme.typography.fontSize.xs,
                                        color: slot.available ? "#0284c7" : "#dc2626",
                                        fontWeight: theme.typography.fontWeight.bold,
                                        textTransform: "uppercase",
                                        backgroundColor: slot.available ? "#e0f2fe" : "#fee2e2",
                                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                                        borderRadius: theme.borderRadius.sm,
                                      }}
                                    >
                                      {slot.available ? "Available" : "Booked"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: theme.spacing[4],
                                  color: theme.colors.text.secondary,
                                  backgroundColor: theme.colors.background.white,
                                  borderRadius: theme.borderRadius.md,
                                  border: `1px solid ${theme.colors.border.light}`,
                                }}
                              >
                                <p>No time slots available</p>
                                <p style={{ fontSize: theme.typography.fontSize.sm, margin: `${theme.spacing[2]} 0 0 0` }}>
                                  Court may be fully booked or closed for maintenance
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtAvailabilityCalendar;