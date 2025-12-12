import React, { useState, useEffect } from "react";
import theme from "../theme";
import Card from "./Card";
import Button from "./Button";
import { websiteRatingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Filter,
  Trash2,
  RefreshCw,
} from "lucide-react";

const WebsiteRatingsAdmin = () => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minRating: "",
    maxRating: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratingsResponse, statsResponse] = await Promise.all([
        websiteRatingAPI.getAllRatings(filters),
        websiteRatingAPI.getStats(),
      ]);

      if (ratingsResponse.data.success) {
        setRatings(ratingsResponse.data.data);
        setPagination(ratingsResponse.data.pagination);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Failed to load ratings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) {
      return;
    }

    try {
      const response = await websiteRatingAPI.deleteRating(id);
      if (response.data.success) {
        toast.success("Rating deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Failed to delete rating");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const renderStarDistribution = () => {
    if (!stats) return null;

    const starData = [
      { stars: 5, count: stats.overall.fiveStars },
      { stars: 4, count: stats.overall.fourStars },
      { stars: 3, count: stats.overall.threeStars },
      { stars: 2, count: stats.overall.twoStars },
      { stars: 1, count: stats.overall.oneStar },
    ];

    const maxCount = Math.max(...starData.map((d) => d.count));

    return (
      <div className="space-y-2">
        {starData.map((data) => (
          <div key={data.stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span style={{ color: theme.colors.text }}>{data.stars}</span>
              <Star size={16} fill={theme.colors.warning.main} stroke="none" />
            </div>
            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxCount > 0 ? (data.count / maxCount) * 100 : 0}%`,
                  backgroundColor: theme.colors.warning.main,
                }}
              />
            </div>
            <span
              className="w-12 text-right"
              style={{ color: theme.colors.text.secondary }}
            >
              {data.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderRatingCard = (rating) => (
    <Card
      key={rating._id}
      className="p-6 mb-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>
            {rating.userName}
          </h3>
          <p style={{ color: theme.colors.text.secondary }} className="text-sm">
            {rating.userEmail} • {rating.userRole}
          </p>
        </div>
        <button
          onClick={() => handleDeleteRating(rating._id)}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
          style={{ color: theme.colors.danger }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              color={theme.colors.warning.main}
              fill={star <= rating.rating ? theme.colors.warning.main : "none"}
              strokeWidth={1.4}
            />
          ))}
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${theme.colors.primary.main}20`,
            color: theme.colors.primary.main,
          }}
        >
          {rating.category}
        </span>
      </div>

      <p style={{ color: theme.colors.text }} className="mb-3">
        {rating.comment}
      </p>

      <p style={{ color: theme.colors.text.secondary }} className="text-sm">
        {new Date(rating.createdAt).toLocaleString()}
        {rating.updatedAt !== rating.createdAt && " (edited)"}
      </p>
    </Card>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary.main }}></div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
          Website Ratings Dashboard
        </h1>
        <Button onClick={fetchData} variant="secondary">
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3
                className="text-sm font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                Average Rating
              </h3>
              <TrendingUp size={20} style={{ color: theme.colors.success }} />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold" style={{ color: theme.colors.text }}>
                {stats.overall.averageRating.toFixed(1)}
              </p>
              <div className="flex">
                <Star size={24} fill={theme.colors.warning.main} stroke="none" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3
                className="text-sm font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                Total Ratings
              </h3>
              <Users size={20} style={{ color: theme.colors.primary.main }} />
            </div>
            <p className="text-4xl font-bold" style={{ color: theme.colors.text }}>
              {stats.overall.totalRatings}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3
                className="text-sm font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                Star Distribution
              </h3>
              <MessageSquare size={20} style={{ color: theme.colors.info.main }} />
            </div>
            {renderStarDistribution()}
          </Card>
        </div>
      )}

      {/* Category Stats */}
      {stats && stats.byCategory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Ratings by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.byCategory.map((cat) => (
              <div key={cat._id} className="text-center">
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {cat._id}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                    {cat.averageRating.toFixed(1)}
                  </span>
                  <Star size={16} fill={theme.colors.warning.main} stroke="none" />
                </div>
                <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  {cat.count} ratings
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} style={{ color: theme.colors.text }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            <option value="">All Categories</option>
            <option value="overall">Overall</option>
            <option value="usability">Usability</option>
            <option value="design">Design</option>
            <option value="performance">Performance</option>
            <option value="features">Features</option>
          </select>

          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange("minRating", e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            <option value="">Min Rating</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            <option value="createdAt">Date</option>
            <option value="rating">Rating</option>
            <option value="userName">User Name</option>
          </select>

          <select
            value={filters.order}
            onChange={(e) => handleFilterChange("order", e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <Button
            onClick={() =>
              setFilters({
                category: "",
                minRating: "",
                maxRating: "",
                sortBy: "createdAt",
                order: "desc",
                page: 1,
                limit: 20,
              })
            }
            variant="secondary"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Ratings List */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary.main }}></div>
          </div>
        ) : ratings.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare
              size={48}
              className="mx-auto mb-4"
              style={{ color: theme.colors.text.secondary }}
            />
            <p style={{ color: theme.colors.text.secondary }}>
              No ratings found matching your filters
            </p>
          </Card>
        ) : (
          <>
            {ratings.map(renderRatingCard)}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => handleFilterChange("page", filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <div
                  className="flex items-center px-4"
                  style={{ color: theme.colors.text }}
                >
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleFilterChange("page", filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WebsiteRatingsAdmin;
