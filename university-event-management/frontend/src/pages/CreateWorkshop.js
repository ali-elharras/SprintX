import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { X, ArrowLeft } from "lucide-react";

// Helper functions to get tomorrow's date in local time (not UTC)
const getTomorrowDateTimeString = () => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const hours = String(tomorrow.getHours()).padStart(2, "0");
  const minutes = String(tomorrow.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getTomorrowDateString = () => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- Configuration ---
const API_URL = `${
  process.env.REACT_APP_API_URL || "http://localhost:8080/api"
}/workshops`;

// A simplified theme object (Ensured to be complete)
const theme = {
  colors: {
    primary: "#4f46e5", // Indigo-600
    primaryDark: "#3e38c2", // Darker indigo
    background: {
      default: "#f9fafb",
      card: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6C757D",
      white: "#FFFFFF",
      danger: "#dc3545",
      placeholder: "#9ca3af",
    },
    border: "#e5e7eb",
    inputFocus: "#a5b4fc",
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: {
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
    fontWeight: {
      regular: 400,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: "0.5rem",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

// --- Custom Styles for Validation ---

const invalidInputStyles = {
  borderColor: theme.colors.text.danger,
  boxShadow: `0 0 0 3px ${theme.colors.text.danger}40`,
};

const errorTextStyles = {
  color: theme.colors.text.danger,
  fontSize: "0.85rem",
  marginTop: theme.spacing[1],
  fontWeight: theme.typography.fontWeight.semibold,
};

const requiredAsteriskStyles = {
  color: theme.colors.text.danger,
  marginLeft: theme.spacing[1],
};

// --- Custom Input Components ---
const InputBaseStyles = {
  padding: theme.spacing[3],
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius,
  fontSize: theme.typography.fontSize.base,
  color: theme.colors.text.primary,
  transition: "border-color 0.2s, box-shadow 0.2s",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: theme.typography.fontFamily,
};

const FocusStyles = {
  borderColor: theme.colors.primary,
  boxShadow: `0 0 0 3px ${theme.colors.inputFocus}90`,
  outline: "none",
};

const Input = ({ type = "text", style, isInvalid = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <input
      type={type}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...InputBaseStyles,
        ...style,
        ...(isFocused ? FocusStyles : {}),
        ...(isInvalid ? invalidInputStyles : {}),
      }}
      {...props}
    />
  );
};

const Textarea = ({ style, rows = 3, isInvalid = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...InputBaseStyles,
        resize: "vertical",
        ...style,
        ...(isFocused ? FocusStyles : {}),
        ...(isInvalid ? invalidInputStyles : {}),
      }}
      {...props}
    />
  );
};

const Select = ({ style, isInvalid = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <select
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...InputBaseStyles,
        ...style,
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `right ${theme.spacing[3]} center`,
        paddingRight: "2.5rem",
        ...(isFocused ? FocusStyles : {}),
        ...(isInvalid ? invalidInputStyles : {}),
      }}
      {...props}
    />
  );
};

// --- Style Definitions ---
const pageStyles = {
  minHeight: "100vh",
  backgroundColor: theme.colors.background.default,
  padding: `${theme.spacing[8]} 0`,
  fontFamily: theme.typography.fontFamily,
};

const containerStyles = {
  maxWidth: "60rem",
  margin: "0 auto",
  padding: `0 ${theme.spacing[4]}`,
};

const formContainerStyles = {
  backgroundColor: theme.colors.background.card,
  padding: theme.spacing[6],
  borderRadius: "1rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  border: `1px solid ${theme.colors.border}`,
};

const headerStyles = {
  fontSize: theme.typography.fontSize["2xl"],
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.primary,
  marginBottom: theme.spacing[6],
  textAlign: "center",
};

const formGridStyles = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[5],
};

const formGroupStyles = {
  display: "flex",
  flexDirection: "column",
};

const labelStyles = {
  marginBottom: theme.spacing[2],
  fontSize: "0.95rem",
  fontWeight: theme.typography.fontWeight.semibold,
  color: "#374151",
};

const submitButtonStyles = {
  marginTop: theme.spacing[6],
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  fontSize: theme.typography.fontSize.lg,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.white,
  backgroundColor: theme.colors.primary,
  borderRadius: "0.75rem",
  border: "none",
  cursor: "pointer",
  transition: "all 0.25s ease",
  boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
  width: "100%",
};

const submitButtonHoverStyles = {
  backgroundColor: theme.colors.primaryDark,
  transform: "translateY(-2px)",
  boxShadow: "0 6px 14px rgba(79,70,229,0.35)",
};

const submitButtonDisabledStyles = {
  opacity: 0.6,
  cursor: "not-allowed",
  transform: "none",
  backgroundColor: theme.colors.primary,
};

const errorStyles = {
  backgroundColor: "#fef2f2",
  color: theme.colors.text.danger,
  padding: theme.spacing[3],
  borderRadius: theme.borderRadius,
  marginBottom: theme.spacing[4],
  border: `1px solid ${theme.colors.text.danger}`,
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: "0.95rem",
};
// --- END Style Definitions ---

const CreateWorkshop = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get authentication token

  const initialWorkshopData = {
    workshopName: "",
    location: "GUC Cairo",
    startDate: "",
    endDate: "",
    shortDescription: "",
    fullAgenda: "",
    facultyResponsible: "MET",
    professors: "",
    requiredBudget: "",
    fundingSource: "GUC",
    extraResources: "",
    capacity: "",
    registrationDeadline: "",
  };

  const [workshopData, setWorkshopData] = useState(initialWorkshopData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); // New state for field-specific errors
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const requiredFields = [
    "workshopName",
    "location",
    "startDate",
    "endDate",
    "shortDescription",
    "fullAgenda",
    "facultyResponsible",
    "professors",
    "requiredBudget",
    "fundingSource",
    "capacity",
    "registrationDeadline",
  ];

  const validateForm = (data) => {
    const errors = {};
    let isValid = true;

    // 1. Check for required fields
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        errors[field] = "This field is required.";
        isValid = false;
      }
    });

    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;
    const regDeadline = data.registrationDeadline
      ? new Date(data.registrationDeadline)
      : null;
    const capacity = data.capacity ? Number(data.capacity) : NaN;
    const requiredBudget = data.requiredBudget
      ? Number(data.requiredBudget)
      : NaN;

    // 2. Date validations
    if (startDate && endDate && endDate <= startDate) {
      errors.endDate = "End date/time must be after the start date/time.";
      isValid = false;
    }

    if (startDate && regDeadline && regDeadline > startDate) {
      errors.registrationDeadline =
        "Deadline must be on or before the start date/time.";
      isValid = false;
    }

    // 3. Number validations
    if (!isNaN(capacity) && capacity < 1) {
      errors.capacity = "Capacity must be at least 1.";
      isValid = false;
    }

    if (!isNaN(requiredBudget) && requiredBudget < 0) {
      errors.requiredBudget = "Budget cannot be negative.";
      isValid = false;
    }

    // 4. Max Length validation (shortDescription)
    if (data.shortDescription && data.shortDescription.length > 200) {
      errors.shortDescription =
        "Short description cannot exceed 200 characters.";
      isValid = false;
    }

    // 5. Max Length validation (extraResources)
    if (data.extraResources && data.extraResources.length > 500) {
      errors.extraResources =
        "Extra resources description cannot exceed 500 characters.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkshopData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error for the field being edited
    setFieldErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm(workshopData)) {
      // Toast for general error, fields are highlighted
      toast.error("Please correct the highlighted errors in the form.");
      // Scroll to the top of the form for visibility
      document
        .querySelector("#form-top")
        .scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    const professorsArray = workshopData.professors
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    // Convert datetime-local values to ISO strings to preserve the exact time chosen by user
    // datetime-local format: "2024-01-15T14:00" (no timezone info)
    // We convert it to a Date object which treats it as local time, then to ISO string
    const startDateISO = new Date(workshopData.startDate).toISOString();
    const endDateISO = new Date(workshopData.endDate).toISOString();

    // Registration deadline is a date input (type="date"), which gives us "2025-11-20"
    // We need to set it to end of day (23:59:59) so registrations are open until the end of that day
    const registrationDeadlineDate = new Date(
      workshopData.registrationDeadline
    );
    registrationDeadlineDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999
    const registrationDeadlineISO = registrationDeadlineDate.toISOString();

    const payload = {
      workshopName: workshopData.workshopName,
      shortDescription: workshopData.shortDescription,
      fullAgenda: workshopData.fullAgenda,
      location: workshopData.location,
      startDate: startDateISO,
      endDate: endDateISO,
      facultyResponsible: workshopData.facultyResponsible,
      professorsParticipating: professorsArray,
      capacity: Number(workshopData.capacity),
      registrationDeadline: registrationDeadlineISO,
      requiredBudget: Number(workshopData.requiredBudget),
      fundingSource: workshopData.fundingSource,
      extraRequiredResources: workshopData.extraResources,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server responded with status ${response.status}.`;
        let fieldErrorMap = {};

        // Detect MongoDB duplicate key error (E11000)
        if (
          errorText.includes("E11000") &&
          errorText.includes("workshopName")
        ) {
          fieldErrorMap.workshopName =
            "A workshop with this name already exists.";
          setFieldErrors((prev) => ({ ...prev, ...fieldErrorMap }));
          toast.error("Workshop name must be unique.");
          document
            .querySelector("#form-top")
            .scrollIntoView({ behavior: "smooth" });
          return;
        }

        try {
          const errorData = JSON.parse(errorText);
          // Attempt to extract Mongoose validation errors
          if (errorData.errors) {
            for (const key in errorData.errors) {
              fieldErrorMap[key] = errorData.errors[key].message;
            }
            setFieldErrors((prev) => ({ ...prev, ...fieldErrorMap }));
            errorMessage =
              errorData.message || "Validation failed on the server.";
            toast.error("Server validation failed. Please check your inputs.");
            document
              .querySelector("#form-top")
              .scrollIntoView({ behavior: "smooth" });
            return;
          } else {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (e) {
          errorMessage = errorText;
        }

        // For other errors, show a general error box
        throw new Error(errorMessage);
      }

      toast.success(
        "Workshop successfully created and waiting for approval! 🎉"
      );
      navigate("/my-workshops");
    } catch (error) {
      console.error("Submission Error:", error.message);
      setSubmissionError(`Error submitting workshop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if a field is invalid
  const isInvalid = (fieldName) => !!fieldErrors[fieldName];

  return (
    <>
      
      <div style={pageStyles}>
        <div style={containerStyles}>
          {/* Header with Back Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing[6],
            }}
          >
            <h1 style={headerStyles}>Create New Workshop</h1>
            <button
              type="button"
              onClick={() => navigate("/my-workshops")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[2],
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                background: "transparent",
                border: `2px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: theme.typography.fontFamily,
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.color = theme.colors.primary;
                e.target.style.background = `${theme.colors.primary}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = theme.colors.border;
                e.target.style.color = theme.colors.text.secondary;
                e.target.style.background = "transparent";
              }}
            >
              <ArrowLeft size={20} />
              Back to My Workshops
            </button>
          </div>
          <div style={formContainerStyles} id="form-top">
            {submissionError && (
              <div style={errorStyles}>{submissionError}</div>
            )}

            <form onSubmit={handleSubmit} style={formGridStyles}>
              {/* Basic Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="workshopName" style={labelStyles}>
                    Workshop Name<span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    id="workshopName"
                    name="workshopName"
                    value={workshopData.workshopName}
                    onChange={handleChange}
                    isInvalid={isInvalid("workshopName")}
                    required
                  />
                  {isInvalid("workshopName") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.workshopName}
                    </span>
                  )}
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="location" style={labelStyles}>
                    Location<span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Select
                    id="location"
                    name="location"
                    value={workshopData.location}
                    onChange={handleChange}
                    isInvalid={isInvalid("location")}
                  >
                    <option value="GUC Cairo">GUC Cairo</option>
                    <option value="GUC Berlin">GUC Berlin</option>
                  </Select>
                  {isInvalid("location") && (
                    <span style={errorTextStyles}>{fieldErrors.location}</span>
                  )}
                </div>
              </div>

              {/* Date/Time */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="startDate" style={labelStyles}>
                    Start Date & Time
                    <span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={workshopData.startDate}
                    onChange={handleChange}
                    isInvalid={isInvalid("startDate")}
                    required
                  />
                  {isInvalid("startDate") && (
                    <span style={errorTextStyles}>{fieldErrors.startDate}</span>
                  )}
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="endDate" style={labelStyles}>
                    End Date & Time<span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={workshopData.endDate}
                    onChange={handleChange}
                    isInvalid={isInvalid("endDate")}
                    min={workshopData.startDate}
                    required
                  />
                  {isInvalid("endDate") && (
                    <span style={errorTextStyles}>{fieldErrors.endDate}</span>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div style={formGroupStyles}>
                <label htmlFor="shortDescription" style={labelStyles}>
                  Short Description<span style={requiredAsteriskStyles}>*</span>
                  <span
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: theme.typography.fontWeight.regular,
                      marginLeft: theme.spacing[2],
                      fontSize: "0.9rem",
                    }}
                  >
                    (Max 200 characters)
                  </span>
                </label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={workshopData.shortDescription}
                  onChange={handleChange}
                  rows="3"
                  isInvalid={isInvalid("shortDescription")}
                  required
                  maxLength={200}
                />
                {isInvalid("shortDescription") && (
                  <span style={errorTextStyles}>
                    {fieldErrors.shortDescription}
                  </span>
                )}
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="fullAgenda" style={labelStyles}>
                  Full Agenda<span style={requiredAsteriskStyles}>*</span>
                </label>
                <Textarea
                  id="fullAgenda"
                  name="fullAgenda"
                  value={workshopData.fullAgenda}
                  onChange={handleChange}
                  rows="5"
                  isInvalid={isInvalid("fullAgenda")}
                  required
                />
                {isInvalid("fullAgenda") && (
                  <span style={errorTextStyles}>{fieldErrors.fullAgenda}</span>
                )}
              </div>

              {/* Faculty/Professors */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="facultyResponsible" style={labelStyles}>
                    Faculty Responsible
                    <span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Select
                    id="facultyResponsible"
                    name="facultyResponsible"
                    value={workshopData.facultyResponsible}
                    onChange={handleChange}
                    isInvalid={isInvalid("facultyResponsible")}
                  >
                    <option value="MET">MET</option>
                    <option value="IET">IET</option>
                    <option value="MGT">MGT</option>
                    <option value="PHAR">PHAR</option>
                    <option value="ARCH">ARCH</option>
                    <option value="ART">ART</option>
                    <option value="Other">Other</option>
                  </Select>
                  {isInvalid("facultyResponsible") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.facultyResponsible}
                    </span>
                  )}
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="professors" style={labelStyles}>
                    Professor(s) Participating (Comma-separated)
                    <span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    id="professors"
                    name="professors"
                    value={workshopData.professors}
                    onChange={handleChange}
                    placeholder="e.g., Dr. John Doe, Dr. Jane Smith"
                    isInvalid={isInvalid("professors")}
                    required
                  />
                  {isInvalid("professors") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.professors}
                    </span>
                  )}
                </div>
              </div>

              {/* Finance */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="requiredBudget" style={labelStyles}>
                    Required Budget ($)
                    <span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    type="number"
                    id="requiredBudget"
                    name="requiredBudget"
                    value={workshopData.requiredBudget}
                    onChange={handleChange}
                    isInvalid={isInvalid("requiredBudget")}
                    min="0"
                    required
                  />
                  {isInvalid("requiredBudget") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.requiredBudget}
                    </span>
                  )}
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="fundingSource" style={labelStyles}>
                    Funding Source<span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Select
                    id="fundingSource"
                    name="fundingSource"
                    value={workshopData.fundingSource}
                    onChange={handleChange}
                    isInvalid={isInvalid("fundingSource")}
                  >
                    <option value="GUC">GUC</option>
                    <option value="External">External</option>
                    <option value="Joint">Joint</option>
                  </Select>
                  {isInvalid("fundingSource") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.fundingSource}
                    </span>
                  )}
                </div>
              </div>

              {/* Resources & Deadline */}
              <div style={formGroupStyles}>
                <label htmlFor="extraResources" style={labelStyles}>
                  Extra Required Resources
                  <span
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: theme.typography.fontWeight.regular,
                      marginLeft: theme.spacing[2],
                      fontSize: "0.9rem",
                    }}
                  >
                    (Max 500 characters)
                  </span>
                </label>
                <Textarea
                  id="extraResources"
                  name="extraResources"
                  value={workshopData.extraResources}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g., Projectors, specific software, lab access"
                  isInvalid={isInvalid("extraResources")}
                  maxLength={500}
                />
                {isInvalid("extraResources") && (
                  <span style={errorTextStyles}>
                    {fieldErrors.extraResources}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="capacity" style={labelStyles}>
                    Capacity<span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={workshopData.capacity}
                    onChange={handleChange}
                    isInvalid={isInvalid("capacity")}
                    min="1"
                    required
                  />
                  {isInvalid("capacity") && (
                    <span style={errorTextStyles}>{fieldErrors.capacity}</span>
                  )}
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="registrationDeadline" style={labelStyles}>
                    Registration Deadline
                    <span style={requiredAsteriskStyles}>*</span>
                  </label>
                  <Input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={workshopData.registrationDeadline}
                    onChange={handleChange}
                    isInvalid={isInvalid("registrationDeadline")}
                    max={
                      workshopData.startDate
                        ? workshopData.startDate.slice(0, 10)
                        : undefined
                    }
                    required
                  />
                  {isInvalid("registrationDeadline") && (
                    <span style={errorTextStyles}>
                      {fieldErrors.registrationDeadline}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...submitButtonStyles,
                  ...(isSubmitting
                    ? submitButtonDisabledStyles
                    : isButtonHovered
                    ? submitButtonHoverStyles
                    : {}),
                }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
              >
                {isSubmitting ? "Submitting..." : "Create Workshop"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateWorkshop;
