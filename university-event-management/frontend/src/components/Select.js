import React from "react";
import theme from "../theme";

const Select = React.forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = "Select an option",
      error,
      required = false,
      disabled = false,
      className = "",
      style = {},
      ...props
    },
    ref
  ) => {
    const selectId = `select-${name}`;

    const getSelectStyles = () => {
      let baseStyles = {
        ...theme.components.input.base,
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 0.5rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "2.5rem",
        appearance: "none",
      };

      if (error) {
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
      color: error ? theme.colors.error.main : theme.colors.text.primary,
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

    const handleBlur = (e) => {
      // Reset focus styles
      e.target.style.borderColor = error
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
          <label htmlFor={selectId} style={getLabelStyles()}>
            {label}
            {required && (
              <span
                style={{ color: theme.colors.error.main, marginLeft: "4px" }}
              >
                *
              </span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={getSelectStyles()}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <div style={getErrorStyles()}>{error}</div>}
      </div>
    );
  }
);

export default Select;
