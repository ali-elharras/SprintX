import React, { useState, useEffect } from 'react';
import { applicationServices } from '../../services/api';
import theme from '../../theme';

const styles = {
  mapContainer: {
    width: '100%',
    maxWidth: '400px',
    margin: '20px auto',
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: '8px',
    position: 'relative',
    backgroundColor: theme.colors.neutral.gray100,
    overflow: 'hidden',
  },
  svg: {
    display: 'block',
  },
  platform: {
    fill: theme.colors.neutral.gray200,
    stroke: theme.colors.border.main,
    strokeWidth: 2,
  },
  booth: {
    fill: theme.colors.primary.light,
    stroke: theme.colors.primary.main,
    strokeWidth: 1,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
  selectedBooth: {
    fill: theme.colors.primary.main,
    stroke: theme.colors.primary.dark,
    strokeWidth: 2,
  },
  occupiedBooth: {
    fill: theme.colors.error.light,
    stroke: theme.colors.error.main,
    strokeWidth: 1,
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  entryExit: {
    fill: theme.colors.success.main,
    stroke: theme.colors.success.dark,
    strokeWidth: 1,
  },
  label: {
    fontSize: '10px',
    fill: theme.colors.text.primary,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  instructionText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
  },
  conflictWarning: {
    backgroundColor: theme.colors.error.light,
    color: theme.colors.error.dark,
    padding: theme.spacing[2],
    borderRadius: '4px',
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing[2],
    border: `1px solid ${theme.colors.error.main}`,
  },
};

const BoothMapSelector = ({ onSelectBooth, selectedBoothId, startDate, durationWeeks }) => {
  const platformWidth = 300;
  const platformHeight = 200;
  const boothSize = 20;
  const padding = 10;

  const [occupiedBooths, setOccupiedBooths] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Define booth positions (example: 15 booths around the edges)
  const boothPositions = [
    // Top edge
    { id: 'B1', x: padding, y: padding },
    { id: 'B2', x: padding + boothSize + padding, y: padding },
    { id: 'B3', x: padding + 2 * (boothSize + padding), y: padding },
    { id: 'B4', x: padding + 3 * (boothSize + padding), y: padding },
    // Right edge
    { id: 'B5', x: platformWidth - padding - boothSize, y: padding },
    { id: 'B6', x: platformWidth - padding - boothSize, y: padding + boothSize + padding },
    { id: 'B7', x: platformWidth - padding - boothSize, y: padding + 2 * (boothSize + padding) },
    { id: 'B8', x: platformWidth - padding - boothSize, y: padding + 3 * (boothSize + padding) },
    // Bottom edge
    { id: 'B9', x: platformWidth - padding - boothSize, y: platformHeight - padding - boothSize },
    { id: 'B10', x: platformWidth - 2 * (boothSize + padding), y: platformHeight - padding - boothSize },
    { id: 'B11', x: platformWidth - 3 * (boothSize + padding), y: platformHeight - padding - boothSize },
    { id: 'B12', x: platformWidth - 4 * (boothSize + padding), y: platformHeight - padding - boothSize },
    // Left edge
    { id: 'B13', x: padding, y: platformHeight - padding - boothSize },
    { id: 'B14', x: padding, y: platformHeight - 2 * (boothSize + padding) },
    { id: 'B15', x: padding, y: platformHeight - 3 * (boothSize + padding) },
  ];

  useEffect(() => {
    if (startDate && durationWeeks) {
      checkBoothConflicts();
    } else {
      setOccupiedBooths(new Set());
    }
  }, [startDate, durationWeeks]);

  const checkBoothConflicts = async () => {
    if (!startDate || !durationWeeks) return;

    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (durationWeeks * 7));

      const response = await applicationServices.getBoothConflicts({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      if (response.success) {
        setOccupiedBooths(new Set(response.data.occupiedBooths || []));
      }
    } catch (error) {
      console.error('Error checking booth conflicts:', error);
      setOccupiedBooths(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleBoothClick = (boothId) => {
    if (occupiedBooths.has(boothId)) {
      return; // Don't allow selection of occupied booths
    }
    onSelectBooth(boothId);
  };

  const getBoothStyle = (boothId) => {
    if (occupiedBooths.has(boothId)) {
      return { ...styles.booth, ...styles.occupiedBooth };
    }
    if (selectedBoothId === boothId) {
      return { ...styles.booth, ...styles.selectedBooth };
    }
    return styles.booth;
  };

  return (
    <div style={styles.mapContainer}>
      <p style={styles.instructionText}>
        Select your preferred booth location{startDate && durationWeeks ? ' (conflicts checked)' : ''}:
      </p>

      {loading && (
        <p style={{ textAlign: 'center', color: theme.colors.text.secondary }}>
          Checking availability...
        </p>
      )}

      <svg width={platformWidth} height={platformHeight} style={styles.svg}>
        {/* Platform */}
        <rect
          x={0}
          y={0}
          width={platformWidth}
          height={platformHeight}
          style={styles.platform}
        />

        {/* Entry/Exit (example: bottom center) */}
        <rect
          x={platformWidth / 2 - 20}
          y={platformHeight - 5}
          width={40}
          height={5}
          style={styles.entryExit}
        />
        <text x={platformWidth / 2} y={platformHeight - 10} textAnchor="middle" style={styles.label}>Entry/Exit</text>

        {/* Booths */}
        {boothPositions.map((booth) => (
          <g key={booth.id} onClick={() => handleBoothClick(booth.id)}>
            <rect
              x={booth.x}
              y={booth.y}
              width={boothSize}
              height={boothSize}
              style={getBoothStyle(booth.id)}
            />
            <text
              x={booth.x + boothSize / 2}
              y={booth.y + boothSize / 2 + 3} // Adjust for vertical centering
              textAnchor="middle"
              style={styles.label}
            >
              {booth.id}
            </text>
          </g>
        ))}
      </svg>

      {occupiedBooths.size > 0 && (
        <div style={styles.conflictWarning}>
          ⚠️ Some booths are occupied during your requested period
        </div>
      )}
    </div>
  );
};

export default BoothMapSelector;
