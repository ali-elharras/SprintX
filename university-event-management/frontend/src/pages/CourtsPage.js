import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import theme from "../theme";
import CourtCard from "../components/CourtCard";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import CourtAvailabilityCalendar from "../components/CourtAvailabilityCalendar";
import LoadingScreen from "../components/LoadingScreen";
import { courtAPI } from "../services/api";
import axios from "axios";

const CourtsPage = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    status: "active",
  });
  
  // Ref for request cancellation
  const cancelTokenRef = useRef(null);

  // Fetch courts and stats
  useEffect(() => {
    fetchCourts();
    fetchStats();
    
    // Cleanup function to cancel requests on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Apply filters when courts or filters change
  useEffect(() => {
    applyFilters();
  }, [courts, filters]);

  const fetchCourts = async () => {
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled due to new request');
    }
    
    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    
    try {
      setLoading(true);
      const response = await courtAPI.getCourts({
        status: filters.status,
      }, cancelTokenRef.current);
      setCourts(response.data.data || []);
    } catch (error) {
      // Don't show error if request was cancelled
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error("Error fetching courts:", error);
      toast.error("Failed to load courts");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await courtAPI.getCourtStats(cancelTokenRef.current);
      setStats(response.data.data);
    } catch (error) {
      // Don't show error if request was cancelled
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error("Error fetching court stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...courts];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter((court) => court.type === filters.type);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (court) =>
          court.name.toLowerCase().includes(searchTerm) ||
          court.description?.toLowerCase().includes(searchTerm) ||
          court.location.toLowerCase().includes(searchTerm) ||
          court.building?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredCourts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBookingClick = (court) => {
    setSelectedCourt(court);
    setShowCalendar(true);
  };

  const courtTypeOptions = [
    { value: "", label: "All Court Types" },
    { value: "basketball", label: "Basketball Courts" },
    { value: "tennis", label: "Tennis Courts" },
    { value: "football", label: "Football Fields" },
  ];

  const statusOptions = [
    { value: "active", label: "Active Courts" },
    { value: "", label: "All Statuses" },
    { value: "maintenance", label: "Under Maintenance" },
    { value: "closed", label: "Closed" },
  ];

  const getCourtTypeIcon = (type) => {
    const icons = {
      basketball: "🏀",
      tennis: "🎾",
      football: "⚽",
    };
    return icons[type] || "🏟️";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.default,
        }}
      >
        <Navbar />
        <LoadingScreen type="courts" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.default,
          padding: theme.spacing[6],
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Page Header */}
          <div style={{ marginBottom: theme.spacing[8] }}>
            <h1
              style={{
                fontSize: theme.typography.fontSize["3xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
                textAlign: "center",
              }}
            >
              Campus Sports Courts
            </h1>
            <p
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary,
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
                marginBottom: theme.spacing[2],
              }}
            >
              Discover and book basketball, tennis, and football courts across campus.
              Click "View Availability" to see real-time court schedules and pricing.
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.primary.main,
                textAlign: "center",
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              📅 Interactive calendar available for each court • 💰 Student discounts shown
            </p>
          </div>

          {/* Court Statistics */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: theme.spacing[4],
                marginBottom: theme.spacing[6],
              }}
            >
              <div
                style={{
                  background: theme.colors.background.paper,
                  padding: theme.spacing[4],
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.md,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize["2xl"],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary.main,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {stats.totalCourts}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Total Courts
                </div>
              </div>
              <div
                style={{
                  background: theme.colors.background.paper,
                  padding: theme.spacing[4],
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.md,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize["2xl"],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.success.main,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {stats.activeCourts}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Available Now
                </div>
              </div>
              {stats.statsByType && stats.statsByType.map((typeStat) => (
                <div
                  key={typeStat._id}
                  style={{
                    background: theme.colors.background.paper,
                    padding: theme.spacing[4],
                    borderRadius: theme.borderRadius.lg,
                    boxShadow: theme.shadows.md,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.fontSize["2xl"],
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {getCourtTypeIcon(typeStat._id)}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {typeStat.activeCount}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      textTransform: "capitalize",
                    }}
                  >
                    {typeStat._id} Courts
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[5],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              marginBottom: theme.spacing[6],
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: theme.spacing[4],
                alignItems: "end",
              }}
            >
              <Input
                label="Search Courts"
                placeholder="Search by name, location, or building..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <Select
                label="Court Type"
                options={courtTypeOptions}
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
              <Button variant="outline" onClick={fetchCourts}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Courts Grid */}
          {filteredCourts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: theme.spacing[6],
              }}
            >
              {filteredCourts.map((court) => (
                <CourtCard
                  key={court._id}
                  court={court}
                  onBookingClick={handleBookingClick}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: theme.colors.background.paper,
                padding: theme.spacing[12],
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize["4xl"],
                  marginBottom: theme.spacing[4],
                }}
              >
                🏟️
              </div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[2],
                }}
              >
                No Courts Found
              </h3>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing[4],
                }}
              >
                {filters.search || filters.type !== ""
                  ? "Try adjusting your filters to see more courts."
                  : "There are no courts matching your criteria."}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ type: "", search: "", status: "active" })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Summary */}
          {filteredCourts.length > 0 && (
            <div
              style={{
                marginTop: theme.spacing[8],
                padding: theme.spacing[4],
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.base,
                textAlign: "center",
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Showing {filteredCourts.length} of {courts.length} courts
            </div>
          )}

          {/* Quick Actions */}
          <div
            style={{
              marginTop: theme.spacing[8],
              padding: theme.spacing[6],
              background: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
              }}
            >
              Quick Access
            </h3>
            <div
              style={{
                display: "flex",
                gap: theme.spacing[4],
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outline"
                onClick={() => handleFilterChange("type", "basketball")}
              >
                🏀 Basketball Courts
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFilterChange("type", "tennis")}
              >
                🎾 Tennis Courts
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFilterChange("type", "football")}
              >
                ⚽ Football Fields
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Modal */}
      {showCalendar && selectedCourt && (
        <CourtAvailabilityCalendar
          court={selectedCourt}
          onClose={() => {
            setShowCalendar(false);
            setSelectedCourt(null);
          }}
        />
      )}
    </>
  );
};

export default CourtsPage;