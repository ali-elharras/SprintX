import React from "react";
import theme from "../theme";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  style = {},
  ...props
}) => {
  // Generate unique class name for this button instance
  const buttonId = React.useId().replace(/:/g, "");

  const getButtonStyles = () => {
    const variantStyles = theme.components.button[variant] || theme.components.button.primary;
    const sizeStyles = theme.components.button.sizes[size] || theme.components.button.sizes.md;

    const baseStyle = {
      ...variantStyles,
      ...sizeStyles,
      fontFamily: theme.typography.fontFamily.primary,
      fontSize: sizeStyles.fontSize || theme.typography.fontSize.base,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      outline: "none",
      position: "relative",
      overflow: "hidden",
      width: "100%",
      ...style,
    };

    // Remove hover styles from base styles as we'll handle them via CSS
    delete baseStyle.hover;

    if (disabled || loading) {
      return {
        ...baseStyle,
        opacity: 0.6,
        cursor: "not-allowed",
        pointerEvents: "none",
      };
    }

    return baseStyle;
  };

  // Create CSS for hover effects
  const createHoverStyles = () => {
    const hoverStyles = theme.components.button[variant].hover;
    if (!hoverStyles) return "";

    const hoverCSS = Object.entries(hoverStyles)
      .map(([property, value]) => {
        // Convert camelCase to kebab-case
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join(" ");

    return `
      .btn-${buttonId}:hover:not(:disabled) {
        ${hoverCSS}
      }
      .btn-${buttonId}:active:not(:disabled) {
        transform: translateY(-1px) scale(0.98);
      }
      .btn-${buttonId}:focus-visible {
        outline: 2px solid ${theme.colors.primary.main};
        outline-offset: 2px;
      }
    `;
  };

  React.useEffect(() => {
    // Inject hover styles and animations
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      ${createHoverStyles()}
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .btn-${buttonId} {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [variant]);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={getButtonStyles()}
      className={`btn-${buttonId} ${className}`}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: "16px",
            height: "16px",
            border: "2px solid transparent",
            borderTop: "2px solid currentColor",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginRight: "8px",
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
