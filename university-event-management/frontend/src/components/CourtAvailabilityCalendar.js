import React, { useState, useEffect, useRef } from "react";
import theme from "../theme";
import { courtAPI } from "../services/api";
import toast from "react-hot-toast";

// Add CSS for the loading animation
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const CourtAvailabilityCalendar = ({ court, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClosing, setIsClosing] = useState(false);
  const [unavailabilityReason, setUnavailabilityReason] = useState(null);
  
  // Ref to track the last error shown to prevent duplicates
  const lastErrorRef = useRef(null);
  
  // Ref to track the current request to prevent race conditions
  const currentRequestRef = useRef(null);

  useEffect(() => {
    if (selectedDate && court) {
      fetchAvailability();
    }
  }, [selectedDate]); // Only depend on selectedDate, not court object

  const fetchAvailability = async () => {
    if (!court || !selectedDate) return;
    
    // Create a unique request identifier
    const requestId = Date.now();
    currentRequestRef.current = requestId;
    
    // Declare variables at function level so they're accessible in catch block
    const dateStr = selectedDate.toISOString().split('T')[0];
    const courtId = court._id || court.id;
    
    try {
      setLoading(true);
      console.log('Fetching availability for court:', courtId, 'date:', dateStr);
      const response = await courtAPI.getCourtAvailability(courtId, dateStr);
      
      // Check if this is still the current request
      if (currentRequestRef.current !== requestId) {
        return; // Request was superseded, ignore response
      }
      
      console.log('Availability response:', response.data);
      setAvailability(response.data.data?.availableSlots || []);
      setUnavailabilityReason(response.data.data?.unavailabilityReason || null);
      
      // Clear any previous errors on successful fetch
      lastErrorRef.current = null;
      
    } catch (error) {
      // Check if this is still the current request
      if (currentRequestRef.current !== requestId) {
        return; // Request was superseded, ignore error
      }
      
      console.error("Error fetching availability:", error);
      console.error("Error details:", error.response?.data);
      
      // Extract error message from backend and set it for display (no toast)
      const errorMessage = error.response?.data?.message || "Failed to load availability";
      setUnavailabilityReason(errorMessage);
      
      setAvailability([]);
    } finally {
      // Only update loading if this is still the current request
      if (currentRequestRef.current === requestId) {
        setLoading(false);
      }
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing[4],
        opacity: isClosing ? 0 : 1,
        transition: "opacity 0.2s ease, backdrop-filter 0.2s ease",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "24px",
          padding: "0",
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "95vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          transform: isClosing ? "scale(0.95)" : "scale(1)",
          transition: "transform 0.2s ease",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header with Gradient */}
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.secondary.main} 100%)`,
            padding: theme.spacing[6],
            color: theme.colors.text.white,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              transform: "rotate(-45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30%",
              left: "-10%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          />
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing[3],
                  marginBottom: theme.spacing[2],
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    padding: theme.spacing[2],
                    backdropFilter: "blur(10px)",
                  }}
                >
                  🏟️
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: theme.typography.fontSize["3xl"],
                      fontWeight: theme.typography.fontWeight.bold,
                      margin: 0,
                      marginBottom: theme.spacing[1],
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {court?.name}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.lg,
                      opacity: 0.9,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    📍 {court?.location} • 🏟️ {court?.surface?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.base,
                  opacity: 0.8,
                  lineHeight: theme.typography.lineHeight.relaxed,
                }}
              >
                📅 Select a date to view available time slots and book your perfect session
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "12px",
                padding: theme.spacing[3],
                cursor: "pointer",
                color: theme.colors.text.white,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                minWidth: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div 
          style={{ 
            padding: theme.spacing[6],
            background: "#ffffff",
            maxHeight: "calc(95vh - 140px)",
            overflow: "auto",
          }}
        >
          <div style={{ display: "flex", gap: theme.spacing[8], flexWrap: "wrap" }}>
            {/* Enhanced Calendar Section */}
            <div style={{ flex: "1 1 400px", minWidth: "400px" }}>
              {/* Calendar Header with improved styling */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing[6],
                  padding: theme.spacing[4],
                  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  onClick={previousMonth}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: theme.colors.text.white,
                    border: "none",
                    borderRadius: "12px",
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    cursor: "pointer",
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    minWidth: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px) scale(1.05)";
                    e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  ‹
                </button>
                
                <div style={{ textAlign: "center" }}>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize["2xl"],
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary,
                      margin: 0,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: theme.typography.fontSize.sm, 
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing[1]
                  }}>
                    📅 Choose your booking date
                  </p>
                </div>
                
                <button
                  onClick={nextMonth}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: theme.colors.text.white,
                    border: "none",
                    borderRadius: "12px",
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    cursor: "pointer",
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    minWidth: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px) scale(1.05)";
                    e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  ›
                </button>
              </div>

              {/* Enhanced Day Headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: theme.spacing[2],
                  marginBottom: theme.spacing[4],
                }}
              >
                {dayNames.map((day) => (
                  <div
                    key={day}
                    style={{
                      padding: theme.spacing[3],
                      textAlign: "center",
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.secondary,
                      background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Enhanced Calendar Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: theme.spacing[2],
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
                        padding: theme.spacing[4],
                        border: selected
                          ? "3px solid transparent"
                          : disabled || !isOpen
                          ? "2px solid #f1f5f9"
                          : "2px solid #e2e8f0",
                        borderRadius: "12px",
                        background: selected
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : disabled || !isOpen
                          ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        color: selected
                          ? theme.colors.text.white
                          : disabled || !isOpen
                          ? "#94a3b8"
                          : theme.colors.text.primary,
                        cursor: disabled || !date || !isOpen ? "not-allowed" : "pointer",
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: selected 
                          ? theme.typography.fontWeight.bold 
                          : theme.typography.fontWeight.semibold,
                        transition: "all 0.3s ease",
                        opacity: !date ? 0 : 1,
                        boxShadow: selected 
                          ? "0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)" 
                          : disabled || !isOpen
                          ? "none"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                        textShadow: selected ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                        minHeight: "48px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled && date && isOpen && !selected) {
                          e.target.style.background = "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)";
                          e.target.style.borderColor = theme.colors.primary.main;
                          e.target.style.transform = "translateY(-1px) scale(1.02)";
                          e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled && date && !selected) {
                          e.target.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.transform = "translateY(0) scale(1)";
                          e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                    >
                      {date ? date.getDate() : ""}
                      {/* Add a small dot indicator for today */}
                      {date && date.toDateString() === new Date().toDateString() && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: selected ? "rgba(255,255,255,0.7)" : theme.colors.primary.main,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Availability Panel */}
            <div
              style={{
                flex: "1 1 400px",
                minWidth: "400px",
                padding: theme.spacing[6],
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative elements */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "rgba(102, 126, 234, 0.1)",
                }}
              />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing[3],
                    marginBottom: theme.spacing[6],
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "12px",
                      padding: theme.spacing[3],
                      color: "white",
                      fontSize: theme.typography.fontSize.xl,
                    }}
                  >
                    📅
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                        margin: 0,
                        marginBottom: theme.spacing[1],
                      }}
                    >
                      {selectedDate ? formatDate(selectedDate) : "Select a date"}
                    </h4>
                    {selectedDate && (
                      <p
                        style={{
                          margin: 0,
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.sm,
                        }}
                      >
                        🕒 View available time slots below
                      </p>
                    )}
                  </div>
                </div>

                {selectedDate && (
                  <>
                    {loading ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: theme.spacing[8],
                          color: theme.colors.text.secondary,
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #e2e8f0",
                            borderTop: "4px solid #667eea",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto",
                            marginBottom: theme.spacing[3],
                          }}
                        />
                        <p style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.medium }}>
                          Loading availability...
                        </p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const dayHours = getOperatingHours(selectedDate);
                          
                          // Show unavailability message if we have a specific reason
                          if (unavailabilityReason || (!dayHours?.isOpen && availability.length === 0)) {
                            const displayMessage = unavailabilityReason || `This court is closed on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s`;
                            return (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: theme.spacing[8],
                                  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                                  borderRadius: "16px",
                                  border: "2px solid #fecaca",
                                }}
                              >
                                <div style={{ fontSize: "48px", marginBottom: theme.spacing[3] }}>🚫</div>
                                <h3
                                  style={{
                                    fontSize: theme.typography.fontSize.lg,
                                    fontWeight: theme.typography.fontWeight.bold,
                                    color: "#dc2626",
                                    marginBottom: theme.spacing[2],
                                  }}
                                >
                                  Court Unavailable
                                </h3>
                                <p style={{ 
                                  color: "#991b1b", 
                                  margin: 0,
                                  fontSize: theme.typography.fontSize.base,
                                  lineHeight: theme.typography.lineHeight.relaxed,
                                }}>
                                  {displayMessage}
                                </p>
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Operating Hours Card */}
                              <div
                                style={{
                                  marginBottom: theme.spacing[5],
                                  padding: theme.spacing[4],
                                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                                  borderRadius: "16px",
                                  border: "2px solid #e0e7ff",
                                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: theme.spacing[3],
                                    marginBottom: theme.spacing[3],
                                  }}
                                >
                                  <div
                                    style={{
                                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      borderRadius: "8px",
                                      padding: theme.spacing[2],
                                      color: "white",
                                    }}
                                  >
                                    🕒
                                  </div>
                                  <h5
                                    style={{
                                      fontSize: theme.typography.fontSize.lg,
                                      fontWeight: theme.typography.fontWeight.bold,
                                      color: theme.colors.text.primary,
                                      margin: 0,
                                    }}
                                  >
                                    Operating Hours
                                  </h5>
                                </div>
                                <p
                                  style={{
                                    margin: 0,
                                    color: theme.colors.text.primary,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    fontSize: theme.typography.fontSize.lg,
                                  }}
                                >
                                  {formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}
                                </p>
                              </div>

                              {/* Pricing Card */}
                              <div
                                style={{
                                  marginBottom: theme.spacing[5],
                                  padding: theme.spacing[4],
                                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                                  borderRadius: "16px",
                                  border: "2px solid #bae6fd",
                                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.1)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: theme.spacing[3],
                                    marginBottom: theme.spacing[3],
                                  }}
                                >
                                  <div
                                    style={{
                                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                                      borderRadius: "8px",
                                      padding: theme.spacing[2],
                                      color: "white",
                                    }}
                                  >
                                    💰
                                  </div>
                                  <h5
                                    style={{
                                      fontSize: theme.typography.fontSize.lg,
                                      fontWeight: theme.typography.fontWeight.bold,
                                      color: theme.colors.text.primary,
                                      margin: 0,
                                    }}
                                  >
                                    Pricing Information
                                  </h5>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      padding: theme.spacing[2],
                                      background: "rgba(59, 130, 246, 0.1)",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <span style={{ color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium }}>
                                      Regular Rate:
                                    </span>
                                    <span
                                      style={{
                                        fontWeight: theme.typography.fontWeight.bold,
                                        color: theme.colors.text.primary,
                                        fontSize: theme.typography.fontSize.lg,
                                      }}
                                    >
                                      {court?.pricing?.hourlyRate} {court?.pricing?.currency}/hour
                                    </span>
                                  </div>
                                  {court?.pricing?.studentDiscount > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: theme.spacing[2],
                                        background: "rgba(16, 185, 129, 0.1)",
                                        borderRadius: "8px",
                                      }}
                                    >
                                      <span style={{ color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium }}>
                                        Student Rate:
                                      </span>
                                      <div style={{ textAlign: "right" }}>
                                        <span
                                          style={{
                                            fontWeight: theme.typography.fontWeight.bold,
                                            color: theme.colors.success.main,
                                            fontSize: theme.typography.fontSize.lg,
                                          }}
                                        >
                                          {Math.round(court?.pricing?.hourlyRate * (1 - court?.pricing?.studentDiscount / 100))} {court?.pricing?.currency}/hour
                                        </span>
                                        <div
                                          style={{
                                            fontSize: theme.typography.fontSize.xs,
                                            color: theme.colors.success.main,
                                            fontWeight: theme.typography.fontWeight.medium,
                                            background: theme.colors.success.light,
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            marginTop: "2px",
                                            display: "inline-block",
                                          }}
                                        >
                                          {court?.pricing?.studentDiscount}% OFF
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Time Slots Section */}
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: theme.spacing[3],
                                    marginBottom: theme.spacing[4],
                                  }}
                                >
                                  <div
                                    style={{
                                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                      borderRadius: "8px",
                                      padding: theme.spacing[2],
                                      color: "white",
                                    }}
                                  >
                                    ⏰
                                  </div>
                                  <h5
                                    style={{
                                      fontSize: theme.typography.fontSize.lg,
                                      fontWeight: theme.typography.fontWeight.bold,
                                      color: theme.colors.text.primary,
                                      margin: 0,
                                    }}
                                  >
                                    Available Time Slots
                                  </h5>
                                </div>
                                
                                {availability.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
                                    {availability.map((slot, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          padding: theme.spacing[4],
                                          background: slot.available 
                                            ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" 
                                            : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                                          borderRadius: "12px",
                                          border: `2px solid ${slot.available 
                                            ? "#10b981" 
                                            : "#ef4444"}`,
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          transition: "all 0.3s ease",
                                          cursor: slot.available ? "pointer" : "default",
                                          boxShadow: slot.available 
                                            ? "0 4px 12px rgba(16, 185, 129, 0.2)" 
                                            : "0 4px 12px rgba(239, 68, 68, 0.2)",
                                        }}
                                        onMouseEnter={(e) => {
                                          if (slot.available) {
                                            e.target.style.transform = "translateY(-2px)";
                                            e.target.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (slot.available) {
                                            e.target.style.transform = "translateY(0)";
                                            e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
                                          }
                                        }}
                                      >
                                        <div>
                                          <span style={{ 
                                            fontWeight: theme.typography.fontWeight.bold,
                                            color: "#1f2937",
                                            fontSize: theme.typography.fontSize.lg
                                          }}>
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                          </span>
                                          <div
                                            style={{
                                              fontSize: theme.typography.fontSize.sm,
                                              color: "#6b7280",
                                              marginTop: "2px",
                                            }}
                                          >
                                            {slot.available ? "Ready to book" : "Already reserved"}
                                          </div>
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: theme.spacing[2],
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: theme.typography.fontSize.sm,
                                              color: slot.available ? "#059669" : "#dc2626",
                                              fontWeight: theme.typography.fontWeight.bold,
                                              textTransform: "uppercase",
                                              backgroundColor: slot.available ? "#d1fae5" : "#fee2e2",
                                              padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                                              borderRadius: "20px",
                                              letterSpacing: "0.05em",
                                              border: `1px solid ${slot.available ? "#059669" : "#dc2626"}`,
                                            }}
                                          >
                                            {slot.available ? "✅ Available" : "❌ Booked"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      padding: theme.spacing[8],
                                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                      borderRadius: "16px",
                                      border: "2px dashed #cbd5e1",
                                    }}
                                  >
                                    <div style={{ fontSize: "48px", marginBottom: theme.spacing[3] }}>�</div>
                                    <h3
                                      style={{
                                        fontSize: theme.typography.fontSize.lg,
                                        fontWeight: theme.typography.fontWeight.bold,
                                        color: theme.colors.text.primary,
                                        marginBottom: theme.spacing[2],
                                      }}
                                    >
                                      No Slots Available
                                    </h3>
                                    <p style={{ 
                                      color: theme.colors.text.secondary, 
                                      margin: 0,
                                      fontSize: theme.typography.fontSize.sm,
                                      lineHeight: theme.typography.lineHeight.relaxed
                                    }}>
                                      Court may be fully booked or closed for maintenance on this date.
                                      <br />Try selecting a different date.
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
      </div>
    </div>
  );
};

export default CourtAvailabilityCalendar;