import React from "react";
import theme from "../theme";

const Card = ({
  children,
  hover = false,
  glass = false,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const getCardStyles = () => {
    let baseStyles = { ...theme.components.card.base };

    if (glass) {
      baseStyles = {
        ...baseStyles,
        ...theme.components.card.glass,
      };
    }

    return {
      ...baseStyles,
      ...style,
    };
  };

  const handleMouseEnter = (e) => {
    if (hover) {
      const hoverStyles = theme.components.card.hover;
      Object.assign(e.target.style, hoverStyles);
    }
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      // Reset to base styles
      const baseStyles = getCardStyles();
      e.target.style.transform = baseStyles.transform || "none";
      e.target.style.boxShadow = baseStyles.boxShadow;
    }
  };

  return (
    <div
      style={getCardStyles()}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
