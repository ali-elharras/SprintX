// theme.js - SprintX Design System
// For MERN Stack Application

const theme = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Primary Brand Colors
    primary: {
      main: "#667eea",
      light: "#8b9cf6",
      dark: "#4c63d2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },

    secondary: {
      main: "#764ba2",
      light: "#9b6fc9",
      dark: "#5a3780",
    },

    // Event Type Colors
    eventTypes: {
      bazaar: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
        bg: "#d1fae5",
      },
      trip: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
        bg: "#fef3c7",
      },
      workshop: {
        main: "#8b5cf6",
        light: "#a78bfa",
        dark: "#7c3aed",
        bg: "#ede9fe",
      },
      competition: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
        bg: "#dbeafe",
      },
      conference: {
        main: "#ec4899",
        light: "#f472b6",
        dark: "#db2777",
        bg: "#fce7f3",
      },
    },

    // Neutral Colors
    neutral: {
      white: "#ffffff",
      gray50: "#f9fafb",
      gray100: "#f3f4f6",
      gray200: "#e5e7eb",
      gray300: "#d1d5db",
      gray400: "#9ca3af",
      gray500: "#6b7280",
      gray600: "#4b5563",
      gray700: "#374151",
      gray800: "#1f2937",
      gray900: "#111827",
      black: "#000000",
    },

    // Semantic Colors
    success: {
      main: "#10b981",
      light: "#d1fae5",
      dark: "#065f46",
    },
    warning: {
      main: "#f59e0b",
      light: "#fef3c7",
      dark: "#92400e",
    },
    error: {
      main: "#ef4444",
      light: "#fee2e2",
      dark: "#991b1b",
    },
    info: {
      main: "#3b82f6",
      light: "#dbeafe",
      dark: "#1e40af",
    },

    // Background Colors
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      gradientLight: "linear-gradient(135deg, #8b9cf6 0%, #9b6fc9 100%)",
      dark: "#1f2937",
    },

    // Text Colors
    text: {
      primary: "#111827",
      secondary: "#4b5563",
      disabled: "#9ca3af",
      white: "#ffffff",
    },

    // Border Colors
    border: {
      light: "#e5e7eb",
      main: "#d1d5db",
      dark: "#9ca3af",
    },

    // Status Colors
    status: {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444",
      draft: "#6b7280",
      active: "#3b82f6",
      completed: "#8b5cf6",
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      primary: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
      secondary: "'Poppins', 'Helvetica Neue', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },

    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    letterSpacing: {
      tight: "-0.02em",
      normal: "0",
      wide: "0.02em",
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    base: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    full: "9999px",
    card: "15px",
    button: "25px",
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    card: "0 5px 25px rgba(0, 0, 0, 0.1)",
    cardHover: "0 10px 40px rgba(0, 0, 0, 0.15)",
    button: "0 5px 20px rgba(102, 126, 234, 0.4)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    duration: {
      fast: "150ms",
      base: "300ms",
      slow: "500ms",
    },
    timing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
      spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // ============================================
  // COMPONENT STYLES
  // ============================================
  components: {
    // Button Variants
    button: {
      primary: {
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "#ffffff",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        letterSpacing: "0.025em",
        textTransform: "none",
        hover: {
          transform: "translateY(-1px)",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
        },
      },
      secondary: {
        background: "#ffffff",
        color: "#4f46e5",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        fontWeight: 600,
        border: "1px solid #d1d5db",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        letterSpacing: "0.025em",
        textTransform: "none",
        hover: {
          background: "#f9fafb",
          borderColor: "#4f46e5",
          transform: "translateY(-1px)",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        },
      },
      outline: {
        background: "transparent",
        color: "#4f46e5",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        fontWeight: 600,
        border: "1px solid #4f46e5",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        letterSpacing: "0.025em",
        textTransform: "none",
        hover: {
          background: "#4f46e5",
          color: "#ffffff",
          transform: "translateY(-1px)",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        },
      },
      ghost: {
        background: "transparent",
        color: "#6b7280",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        fontWeight: 500,
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        letterSpacing: "0.025em",
        textTransform: "none",
        hover: {
          background: "#f3f4f6",
          color: "#374151",
          transform: "translateY(-1px)",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        },
      },
      success: {
        background: "#10b981",
        color: "#ffffff",
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
        letterSpacing: "0.025em",
        hover: {
          background: "#059669",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
        },
      },
      danger: {
        background: "#ef4444",
        color: "#ffffff",
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
        letterSpacing: "0.025em",
        hover: {
          background: "#dc2626",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(239, 68, 68, 0.35)",
        },
      },
      sizes: {
        xs: {
          padding: "0.375rem 0.75rem",
          fontSize: "0.75rem", // 12px
          minHeight: "30px",
          fontWeight: "500",
        },
        sm: {
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          minHeight: "36px",
          fontWeight: "500",
        },
        md: {
          padding: "0.75rem 1.5rem",
          fontSize: "0.875rem",
          minHeight: "42px",
          fontWeight: "600",
        },
        lg: {
          padding: "1rem 2rem",
          fontSize: "1rem",
          minHeight: "48px",
          fontWeight: "600",
        },
      },
    },

    // Card Styles
    card: {
      base: {
        background: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 5px 25px rgba(0, 0, 0, 0.1)",
        padding: "1.5rem",
        transition: "all 0.3s ease",
      },
      hover: {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      },
      glass: {
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      },
    },

    // Input Styles
    input: {
      base: {
        padding: "0.75rem 1rem",
        border: "2px solid #e5e7eb",
        borderRadius: "0.5rem",
        fontSize: "1rem",
        transition: "all 0.3s ease",
        focus: {
          borderColor: "#667eea",
          outline: "none",
          boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
        },
      },
      search: {
        padding: "0.75rem 1.5rem",
        border: "2px solid #e5e7eb",
        borderRadius: "25px",
        fontSize: "1rem",
      },
      error: {
        borderColor: "#ef4444",
      },
    },

    // Badge/Chip Styles
    badge: {
      base: {
        padding: "0.4rem 0.8rem",
        borderRadius: "15px",
        fontSize: "0.8rem",
        fontWeight: 600,
        display: "inline-block",
      },
      outlined: {
        background: "transparent",
        border: "2px solid",
      },
    },

    // Navigation
    navbar: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
      padding: "1rem 2rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },

    // Modal
    modal: {
      backdrop: {
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)",
      },
      container: {
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        maxWidth: "600px",
        padding: "2rem",
      },
    },

    // Toast/Alert
    toast: {
      success: {
        background: "#d1fae5",
        color: "#065f46",
        border: "1px solid #10b981",
      },
      error: {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #ef4444",
      },
      warning: {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #f59e0b",
      },
      info: {
        background: "#dbeafe",
        color: "#1e40af",
        border: "1px solid #3b82f6",
      },
    },

    // Table
    table: {
      header: {
        background: "#f9fafb",
        fontWeight: 600,
        color: "#374151",
        padding: "1rem",
        borderBottom: "2px solid #e5e7eb",
      },
      row: {
        padding: "1rem",
        borderBottom: "1px solid #e5e7eb",
        hover: {
          background: "#f9fafb",
        },
      },
    },
  },

  // ============================================
  // LAYOUT
  // ============================================
  layout: {
    containerMaxWidth: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
    sidebar: {
      width: "280px",
      collapsedWidth: "80px",
    },
    navbar: {
      height: "70px",
    },
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    fadeIn: "fadeIn 0.3s ease-in",
    slideInLeft: "slideInLeft 0.3s ease-out",
    slideInRight: "slideInRight 0.3s ease-out",
    slideInUp: "slideInUp 0.3s ease-out",
    bounce: "bounce 0.5s ease",
    pulse: "pulse 2s infinite",
    spin: "spin 1s linear infinite",
  },
};

// ============================================
// ROLE-BASED COLORS
// ============================================
export const roleColors = {
  student: {
    primary: "#3b82f6",
    light: "#dbeafe",
    dark: "#1e40af",
  },
  staff: {
    primary: "#10b981",
    light: "#d1fae5",
    dark: "#065f46",
  },
  doctor: {
    primary: "#8b5cf6",
    light: "#ede9fe",
    dark: "#6d28d9",
  },
  admin: {
    primary: "#ef4444",
    light: "#fee2e2",
    dark: "#991b1b",
  },
  vendor: {
    primary: "#f59e0b",
    light: "#fef3c7",
    dark: "#92400e",
  },
  eventsOffice: {
    primary: "#ec4899",
    light: "#fce7f3",
    dark: "#be185d",
  },
  events_office: {
    primary: "#ec4899",
    light: "#fce7f3",
    dark: "#be185d",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const getEventTypeColor = (eventType) => {
  const types = {
    bazaar: theme.colors.eventTypes.bazaar.main,
    trip: theme.colors.eventTypes.trip.main,
    workshop: theme.colors.eventTypes.workshop.main,
    competition: theme.colors.eventTypes.competition.main,
    conference: theme.colors.eventTypes.conference.main,
    gym: "#10b981", // Green color for gym sessions
    court: "#f59e0b", // Amber color for court reservations
  };
  return types[eventType.toLowerCase()] || theme.colors.primary.main;
};

export const getStatusColor = (status) => {
  const statuses = {
    pending: theme.colors.status.pending,
    approved: theme.colors.status.approved,
    rejected: theme.colors.status.rejected,
    draft: theme.colors.status.draft,
    active: theme.colors.status.active,
    completed: theme.colors.status.completed,
  };
  return statuses[status.toLowerCase()] || theme.colors.neutral.gray500;
};

export const getRoleColor = (role) => {
  return roleColors[role]?.primary || theme.colors.primary.main;
};

// Export default theme
export default theme;
