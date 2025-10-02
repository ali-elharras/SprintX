import React, { useState } from "react";
import theme from "../theme";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  style = {},
  ...props
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputId = `input-${name}`;

  const getInputStyles = () => {
    let baseStyles = { ...theme.components.input.base };

    // Only show error styles if the user has interacted with the field
    if (error && hasInteracted) {
      baseStyles = {
        ...baseStyles,
        ...theme.components.input.error,
      };
    }

    return {
      ...baseStyles,
      fontFamily: theme.typography.fontFamily.primary,
      width: "100%",
      ...style,
    };
  };

  const getLabelStyles = () => ({
    display: "block",
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color:
      error && hasInteracted
        ? theme.colors.error.main
        : theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
  });

  const getErrorStyles = () => ({
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    fontFamily: theme.typography.fontFamily.primary,
  });

  const handleFocus = (e) => {
    const focusStyles = theme.components.input.base.focus;
    Object.assign(e.target.style, focusStyles);
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setHasValue(inputValue.length > 0);

    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setHasInteracted(true);

    // Reset focus styles
    const shouldShowError = error && hasInteracted;
    e.target.style.borderColor = shouldShowError
      ? theme.colors.error.main
      : theme.colors.border.light;
    e.target.style.boxShadow = "none";

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={className} style={{ marginBottom: theme.spacing[4] }}>
      {label && (
        <label htmlFor={inputId} style={getLabelStyles()}>
          {label}
          {required && (
            <span style={{ color: theme.colors.error.main, marginLeft: "4px" }}>
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={getInputStyles()}
        {...props}
      />

      {error && hasInteracted && <div style={getErrorStyles()}>{error}</div>}
    </div>
  );
};

export default Input;
