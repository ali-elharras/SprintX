import React, { useState, useEffect } from 'react';
import { applicationServices } from '../../services/api';
import theme from '../../theme';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
  mapContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#f8fafc', // Slate-50
    borderRadius: '12px',
    border: `1px solid ${theme.colors.border.main}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '20px',
    overflow: 'hidden',
  },
  svg: {
    display: 'block',
    margin: '0 auto',
  },
  platform: {
    fill: '#e2e8f0', // Slate-200
    stroke: '#cbd5e1', // Slate-300
    strokeWidth: 2,
    rx: 8, // Rounded corners for the platform rect
  },
  booth: {
    fill: '#ffffff',
    stroke: theme.colors.primary.main,
    strokeWidth: 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    rx: 4, // Rounded corners for booths
  },
  boothHover: {
    fill: theme.colors.primary.light,
  },
  selectedBooth: {
    fill: theme.colors.primary.main,
    stroke: theme.colors.primary.dark,
    strokeWidth: 2,
    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
  },
  occupiedBooth: {
    fill: '#fee2e2', // Red-100
    stroke: '#ef4444', // Red-500
    strokeWidth: 1,
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  entryExit: {
    fill: '#22c55e', // Green-500
    stroke: '#16a34a', // Green-600
    strokeWidth: 1,
    rx: 2,
  },
  label: {
    fontSize: '10px',
    fontWeight: '600',
    fill: theme.colors.text.primary,
    pointerEvents: 'none',
    userSelect: 'none',
    fontFamily: 'sans-serif',
    dominantBaseline: 'middle',
    textAnchor: 'middle',
  },
  selectedLabel: {
    fill: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '16px',
    width: '100%',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: theme.colors.text.secondary,
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: theme.colors.text.secondary,
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  conflictWarning: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '16px',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
  },
};

const BoothMapSelector = ({ onSelectBooth, selectedBoothId, startDate, durationWeeks }) => {
  const platformWidth = 400;
  const platformHeight = 280;
  const boothSize = 28;
  const padding = 24;
  const spacing = 8;

  const [occupiedBooths, setOccupiedBooths] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [hoveredBooth, setHoveredBooth] = useState(null);

  // Define booth positions with better spacing
  const boothPositions = [
    // Top edge
    { id: 'B1', x: padding, y: padding },
    { id: 'B2', x: padding + boothSize + spacing, y: padding },
    { id: 'B3', x: padding + 2 * (boothSize + spacing), y: padding },
    { id: 'B4', x: padding + 3 * (boothSize + spacing), y: padding },
    // Right edge
    { id: 'B5', x: platformWidth - padding - boothSize, y: padding },
    { id: 'B6', x: platformWidth - padding - boothSize, y: padding + boothSize + spacing },
    { id: 'B7', x: platformWidth - padding - boothSize, y: padding + 2 * (boothSize + spacing) },
    { id: 'B8', x: platformWidth - padding - boothSize, y: padding + 3 * (boothSize + spacing) },
    // Bottom edge
    { id: 'B9', x: platformWidth - padding - boothSize, y: platformHeight - padding - boothSize },
    { id: 'B10', x: platformWidth - padding - boothSize - (boothSize + spacing), y: platformHeight - padding - boothSize },
    { id: 'B11', x: platformWidth - padding - boothSize - 2 * (boothSize + spacing), y: platformHeight - padding - boothSize },
    { id: 'B12', x: platformWidth - padding - boothSize - 3 * (boothSize + spacing), y: platformHeight - padding - boothSize },
    // Left edge
    { id: 'B13', x: padding, y: platformHeight - padding - boothSize },
    { id: 'B14', x: padding, y: platformHeight - padding - boothSize - (boothSize + spacing) },
    { id: 'B15', x: padding, y: platformHeight - padding - boothSize - 2 * (boothSize + spacing) },
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
    if (hoveredBooth === boothId) {
      return { ...styles.booth, ...styles.boothHover };
    }
    return styles.booth;
  };

  const getLabelStyle = (boothId) => {
    if (selectedBoothId === boothId) {
      return { ...styles.label, ...styles.selectedLabel };
    }
    return styles.label;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Select Booth Location</div>
        <div style={styles.subtitle}>
          {loading ? 'Checking availability...' :
            startDate && durationWeeks ? 'Availability checked for your dates' :
              'Select dates to check availability'}
        </div>
      </div>

      <div style={styles.mapContainer}>
        <svg width="100%" height="100%" viewBox={`0 0 ${platformWidth} ${platformHeight}`} style={styles.svg}>
          {/* Platform Background */}
          <rect
            x={0}
            y={0}
            width={platformWidth}
            height={platformHeight}
            style={styles.platform}
          />

          {/* Entry/Exit Indicator */}
          <g transform={`translate(${platformWidth / 2}, ${platformHeight - 8})`}>
            <rect
              x={-24}
              y={0}
              width={48}
              height={6}
              style={styles.entryExit}
            />
            <text x={0} y={-5} textAnchor="middle" style={{ ...styles.label, fontSize: '10px', fill: '#64748b' }}>ENTRY</text>
          </g>

          {/* Booths */}
          {boothPositions.map((booth) => (
            <g
              key={booth.id}
              onClick={() => handleBoothClick(booth.id)}
              onMouseEnter={() => setHoveredBooth(booth.id)}
              onMouseLeave={() => setHoveredBooth(null)}
              style={{ cursor: occupiedBooths.has(booth.id) ? 'not-allowed' : 'pointer' }}
            >
              <rect
                x={booth.x}
                y={booth.y}
                width={boothSize}
                height={boothSize}
                style={getBoothStyle(booth.id)}
              />
              <text
                x={booth.x + boothSize / 2}
                y={booth.y + boothSize / 2}
                style={getLabelStyle(booth.id)}
              >
                {booth.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={styles.legendContainer}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#ffffff', borderColor: theme.colors.primary.main }}></div>
          <span>Available</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.dark }}></div>
          <span>Selected</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#fee2e2', borderColor: '#ef4444' }}></div>
          <span>Occupied</span>
        </div>
      </div>

      {occupiedBooths.size > 0 && (
        <div style={styles.conflictWarning}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span>Some booths are occupied during your requested period</span>
        </div>
      )}
    </div>
  );
};

export default BoothMapSelector;
