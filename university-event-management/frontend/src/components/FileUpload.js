import React, { useState } from "react";
import theme from "../theme";

const FileUpload = React.forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      accept = "image/*",
      maxSize = 5242880, // 5MB default
      className = "",
      style = {},
      helperText = "",
      ...props
    },
    ref
  ) => {
    const [hasInteracted, setHasInteracted] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState("");
    const inputId = `file-upload-${name}`;

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const handleFileChange = async (e) => {
      setHasInteracted(true);
      const file = e.target.files[0];

      if (!file) {
        setPreview(null);
        setFileName("");
        if (onChange) {
          onChange({ target: { name, value: null } });
        }
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        const sizeMB = (maxSize / 1048576).toFixed(1);
        if (onChange) {
          onChange({
            target: {
              name,
              value: null,
              error: `File size must be less than ${sizeMB}MB`,
            },
          });
        }
        return;
      }

      // Validate file type
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
      const mimeType = file.type;

      const isAccepted =
        acceptedTypes.includes(fileExtension) ||
        acceptedTypes.includes(mimeType) ||
        acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return mimeType.startsWith(baseType);
          }
          return false;
        });

      if (!isAccepted) {
        if (onChange) {
          onChange({
            target: {
              name,
              value: null,
              error: `Invalid file type. Accepted types: ${accept}`,
            },
          });
        }
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setPreview(base64);
        setFileName(file.name);

        if (onChange) {
          onChange({
            target: {
              name,
              value: base64,
              fileName: file.name,
            },
          });
        }
      } catch (error) {
        console.error("Error converting file to base64:", error);
        if (onChange) {
          onChange({
            target: {
              name,
              value: null,
              error: "Failed to process file",
            },
          });
        }
      }
    };

    const handleBlur = () => {
      setHasInteracted(true);
      if (onBlur) {
        onBlur({ target: { name, value } });
      }
    };

    const handleRemoveFile = () => {
      setPreview(null);
      setFileName("");
      if (onChange) {
        onChange({ target: { name, value: null } });
      }
      // Reset the file input
      const input = document.getElementById(inputId);
      if (input) input.value = "";
    };

    const getLabelStyles = () => ({
      display: "block",
      marginBottom: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: error ? theme.colors.error.main : theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
    });

    const getUploadBoxStyles = () => ({
      border: `2px dashed ${
        error ? theme.colors.error.main : theme.colors.border.light
      }`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[4],
      textAlign: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: disabled
        ? theme.colors.background.secondary
        : theme.colors.background.primary,
      transition: "all 0.3s ease",
      fontFamily: theme.typography.fontFamily.primary,
      opacity: disabled ? 0.6 : 1,
      position: "relative",
      display: "block",
      outline: "none",
      boxShadow: "none",
    });

    const getPreviewContainerStyles = () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing[3],
      border: `1px solid ${theme.colors.border.light}`,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
      marginTop: theme.spacing[2],
      fontFamily: theme.typography.fontFamily.primary,
    });

    const getErrorStyles = () => ({
      marginTop: theme.spacing[1],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error.main,
      fontFamily: theme.typography.fontFamily.primary,
    });

    const getHelperTextStyles = () => ({
      marginTop: theme.spacing[1],
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.primary,
    });

    return (
      <div
        className={className}
        style={{
          marginBottom: theme.spacing[4],
          position: "relative",
          ...style,
        }}
      >
        {label && (
          <label htmlFor={inputId} style={getLabelStyles()}>
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

        {!preview ? (
          <label
            htmlFor={inputId}
            style={getUploadBoxStyles()}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = theme.colors.primary.main;
                e.currentTarget.style.backgroundColor =
                  theme.colors.primary.light + "10";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = error
                  ? theme.colors.error.main
                  : theme.colors.border.light;
                e.currentTarget.style.backgroundColor =
                  theme.colors.background.primary;
              }
            }}
          >
            <input
              ref={ref}
              id={inputId}
              type="file"
              name={name}
              onChange={handleFileChange}
              onBlur={handleBlur}
              accept={accept}
              disabled={disabled}
              style={{ display: "none" }}
              {...props}
            />
            <div>
              <svg
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto",
                  marginBottom: theme.spacing[2],
                  color: theme.colors.text.secondary,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm,
                  marginBottom: theme.spacing[1],
                }}
              >
                <span
                  style={{
                    color: theme.colors.primary.main,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.xs,
                }}
              >
                {accept.includes("image")
                  ? "PNG, JPG, JPEG up to 5MB"
                  : accept.includes("pdf")
                  ? "PDF up to 5MB"
                  : `Accepted: ${accept}`}
              </p>
            </div>
          </label>
        ) : (
          <div style={getPreviewContainerStyles()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[3],
              }}
            >
              {preview.startsWith("data:image") && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: theme.borderRadius.sm,
                    border: `1px solid ${theme.colors.border.light}`,
                  }}
                />
              )}
              <div>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {fileName}
                </p>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.success.main,
                  }}
                >
                  ✓ File ready to upload
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                background: "transparent",
                border: "none",
                color: theme.colors.error.main,
                cursor: "pointer",
                padding: theme.spacing[2],
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                fontFamily: theme.typography.fontFamily.primary,
              }}
            >
              Remove
            </button>
          </div>
        )}

        {helperText && !error && (
          <div style={getHelperTextStyles()}>{helperText}</div>
        )}
        {error && <div style={getErrorStyles()}>{error}</div>}
      </div>
    );
  }
);

export default FileUpload;
