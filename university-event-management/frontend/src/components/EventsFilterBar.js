import React from 'react';
import theme from '../theme';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const EventsFilterBar = ({
  filters,
  onFilterChange,
  totalEvents,
  filteredCount,
  onClearFilters,
  onRefresh,
  eventTypeOptions,
  viewOptions,
}) => {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: theme.colors.background.default,
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        marginBottom: theme.spacing[6],
      }}
    >
      <div
        style={{
          background: theme.colors.background.paper,
          padding: theme.spacing[4],
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Search Bar - Full Width */}
        <div style={{ marginBottom: theme.spacing[3] }}>
          <Input
            label=""
            placeholder="🔍 Search events by title, description, or location..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            style={{
              fontSize: theme.typography.fontSize.base,
              padding: theme.spacing[3],
            }}
          />
        </div>

        {/* Filter Row - Compact */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: theme.spacing[3],
            alignItems: "end",
          }}
        >
          <Select
            label="Type"
            options={eventTypeOptions}
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
          />
          <Select
            label="Status"
            options={viewOptions}
            value={filters.view}
            onChange={(e) => onFilterChange("view", e.target.value)}
          />
          <Input
            label="From"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom}
            onChange={(e) => onFilterChange("dateTo", e.target.value)}
          />
          <Select
            label="Sort"
            options={[
              { value: "asc", label: "↑ Earliest" },
              { value: "desc", label: "↓ Latest" },
            ]}
            value={filters.sortOrder}
            onChange={(e) => onFilterChange("sortOrder", e.target.value)}
          />
        </div>

        {/* Active Filters Summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: theme.spacing[3],
            paddingTop: theme.spacing[3],
            borderTop: `1px solid ${theme.colors.border}`,
            flexWrap: "wrap",
            gap: theme.spacing[2],
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            Showing <strong style={{ color: theme.colors.primary.main }}>{filteredCount}</strong> of <strong>{totalEvents}</strong> events
          </span>
          <div style={{ display: "flex", gap: theme.spacing[2], alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="outline"
              onClick={onClearFilters}
              style={{
                fontSize: theme.typography.fontSize.xs,
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsFilterBar;
