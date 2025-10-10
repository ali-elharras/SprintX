import React, { useState, useEffect } from "react";
import theme from "../theme";
import Button from "./Button";
import CourtAvailabilityCalendar from "./CourtAvailabilityCalendar";
import { courtAPI } from "../services/api";

const CourtCard = ({ court, showBooking = true, onBookingClick }) => {
  const [todayAvailability, setTodayAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (court && court._id) {
      loadTodayAvailability();
    }
  }, [court]);

  const loadTodayAvailability = async () => {
    try {
      setLoading(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateToFetch = tomorrow.toISOString().split('T')[0];
      const response = await courtAPI.getCourtAvailability(court._id, dateToFetch);
      setTodayAvailability(response.data.data);
    } catch (error) {
      console.error("Error loading court availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourtTypeColor = (type) => {
    const colors = {
      basketball: theme.colors.eventTypes.competition.main,
      tennis: theme.colors.eventTypes.workshop.main,
      football: theme.colors.eventTypes.bazaar.main,
    };
    return colors[type] || theme.colors.primary.main;
  };

  const getCourtTypeIcon = (type) => {
    const icons = {
      basketball: "🏀",
      tennis: "🎾", 
      football: "⚽",
    };
    return icons[type] || "🏟️";
  };

  const getSurfaceDisplayName = (surface) => {
    const surfaces = {
      grass: "Natural Grass",
      hardcourt: "Hard Court",
      clay: "Clay Court",
      artificial_turf: "Artificial Turf",
      indoor_court: "Indoor Court",
    };
    return surfaces[surface] || surface;
  };

  const getStatusInfo = () => {
    if (court.status === "maintenance") {
      return { status: "Under Maintenance", color: theme.colors.warning.main };
    }
    if (court.status === "closed") {
      return { status: "Closed", color: theme.colors.error.main };
    }
    if (court.status === "under_construction") {
      return { status: "Under Construction", color: theme.colors.neutral.gray500 };
    }
    
    // Check if court is currently available
    if (court.isCurrentlyAvailable) {
      return { status: "Available Now", color: theme.colors.success.main };
    } else {
      return { status: "Currently Closed", color: theme.colors.warning.main };
    }
  };

  const getTodayOperatingHours = () => {
    if (!court.todayHours) return "Not Available";
    
    if (!court.todayHours.isOpen) {
      return "Closed Today";
    }
    
    return `${court.todayHours.openTime} - ${court.todayHours.closeTime}`;
  };

  const formatCurrency = (amount, currency = "EGP") => {
    return `${amount} ${currency}`;
  };

  const calculateStudentPrice = () => {
    const originalPrice = court.pricing.hourlyRate;
    const discount = court.pricing.studentDiscount || 0;
    const discountAmount = (originalPrice * discount) / 100;
    return originalPrice - discountAmount;
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      style={{
        background: theme.colors.background.paper,
        borderRadius: theme.borderRadius.card,
        boxShadow: theme.shadows.card,
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = theme.shadows.cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.card;
      }}
    >
      {/* Court Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${getCourtTypeColor(court.type)} 0%, ${getCourtTypeColor(court.type)}dd 100%)`,
          padding: theme.spacing[4],
          color: theme.colors.text.white,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        {court.images && court.images.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${court.images[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.2,
              zIndex: 0,
            }}
          />
        )}
        
        {/* Content overlay */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: theme.spacing[2],
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                borderRadius: theme.borderRadius.full,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.semibold,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[1],
                backdropFilter: "blur(10px)",
              }}
            >
              <span>{getCourtTypeIcon(court.type)}</span>
              {court.type}
            </div>
            <div
              style={{
                background: statusInfo.color,
                color: theme.colors.text.white,
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                backdropFilter: "blur(10px)",
              }}
            >
              {statusInfo.status}
            </div>
          </div>
          <h3
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              lineHeight: theme.typography.lineHeight.tight,
              margin: 0,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {court.name}
          </h3>
        </div>
      </div>

      {/* Court Images Gallery */}
      {court.images && court.images.length > 1 && (
        <div style={{ padding: `0 ${theme.spacing[4]} ${theme.spacing[3]}` }}>
          <div
            style={{
              display: "flex",
              gap: theme.spacing[2],
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: theme.spacing[1],
            }}
          >
            {court.images.slice(1).map((image, index) => (
              <div
                key={index}
                style={{
                  minWidth: "80px",
                  height: "60px",
                  borderRadius: theme.borderRadius.sm,
                  overflow: "hidden",
                  border: `2px solid ${theme.colors.border.light}`,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                <img
                  src={image}
                  alt={`${court.name} view ${index + 2}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Court Content */}
      <div style={{ padding: theme.spacing[5], flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Court Details */}
        <div style={{ marginBottom: theme.spacing[4] }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>📍</span>
            <span>{court.location}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>🏟️</span>
            <span>{getSurfaceDisplayName(court.surface)}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>👥</span>
            <span>Capacity: {court.capacity} people</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            <span>🕒</span>
            <span>Today: {getTodayOperatingHours()}</span>
          </div>
        </div>

        {/* Description */}
        {court.description && (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
              marginBottom: theme.spacing[4],
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {court.description}
          </p>
        )}

        {/* Availability Info */}
        <div
          style={{
            background: theme.colors.neutral.gray50,
            padding: theme.spacing[3],
            borderRadius: theme.borderRadius.base,
            marginBottom: theme.spacing[4],
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.spacing[2],
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Slot Duration
            </span>
            <span
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              {court.slotDuration} minutes
            </span>
          </div>
          
          {todayAvailability && !loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing[2],
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                Available Today
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: todayAvailability.availableSlotsCount > 0 ? theme.colors.success.main : theme.colors.error.main,
                }}
              >
                {todayAvailability.availableSlotsCount} / {todayAvailability.totalSlots} slots
              </span>
            </div>
          )}

          {court.pricing.hourlyRate > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing[2],
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Regular Price
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {formatCurrency(court.pricing.hourlyRate, court.pricing.currency)}/hour
                </span>
              </div>
              
              {court.pricing.studentDiscount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Student Price ({court.pricing.studentDiscount}% off)
                  </span>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.success.main,
                    }}
                  >
                    {formatCurrency(calculateStudentPrice(), court.pricing.currency)}/hour
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Facilities */}
        {court.facilities && court.facilities.length > 0 && (
          <div style={{ marginBottom: theme.spacing[4] }}>
            <h4
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Facilities
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing[1],
              }}
            >
              {court.facilities.slice(0, 6).map((facility, index) => (
                <span
                  key={index}
                  style={{
                    background: theme.colors.primary.light + "20",
                    color: theme.colors.primary.dark,
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    textTransform: "capitalize",
                  }}
                >
                  {facility.replace(/_/g, " ")}
                </span>
              ))}
              {court.facilities.length > 6 && (
                <span
                  style={{
                    background: theme.colors.neutral.gray200,
                    color: theme.colors.text.secondary,
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  +{court.facilities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: showBooking && court.status === "active" ? "row" : "column",
            gap: theme.spacing[3],
            alignItems: "stretch",
            marginTop: "auto",
          }}
        >
          {showBooking && court.status === "active" && (
            <Button
              variant="primary"
              onClick={() => setShowCalendar(true)}
              style={{ 
                flex: 1,
                width: "100%",
                minHeight: "44px",
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                whiteSpace: "nowrap",
              }}
            >
              View Availability
            </Button>
          )}
        </div>
      </div>
      
      {/* Availability Calendar Modal */}
      {showCalendar && (
        <CourtAvailabilityCalendar
          court={court}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default CourtCard;