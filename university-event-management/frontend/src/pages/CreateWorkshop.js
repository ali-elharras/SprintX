import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

// --- Configuration ---
const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/workshops`;

// A simplified theme object (Ensured to be complete)
const theme = {
  colors: {
    primary: '#4f46e5', // Indigo-600
    primaryDark: '#3e38c2', // Darker indigo
    background: {
      default: '#f9fafb',
      card: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6C757D',
      white: '#FFFFFF',
      danger: '#dc3545',
      placeholder: '#9ca3af',
    },
    border: '#e5e7eb',
    inputFocus: '#a5b4fc',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: {
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      regular: 400,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

// --- Custom Input Components ---
const InputBaseStyles = {
  padding: theme.spacing[3],
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius,
  fontSize: theme.typography.fontSize.base,
  color: theme.colors.text.primary,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: theme.typography.fontFamily,
};

const FocusStyles = {
  borderColor: theme.colors.primary,
  boxShadow: `0 0 0 3px ${theme.colors.inputFocus}90`,
  outline: 'none',
};

const Input = ({ type = 'text', style, ...props }) => {
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
      }}
      {...props}
    />
  );
};

const Textarea = ({ style, rows = 3, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...InputBaseStyles,
        resize: 'vertical',
        ...style,
        ...(isFocused ? FocusStyles : {}),
      }}
      {...props}
    />
  );
};

const Select = ({ style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <select
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...InputBaseStyles,
        ...style,
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `right ${theme.spacing[3]} center`,
        paddingRight: '2.5rem',
        ...(isFocused ? FocusStyles : {}),
      }}
      {...props}
    />
  );
};

// --- Style Definitions ---
const pageStyles = {
  minHeight: '100vh',
  backgroundColor: theme.colors.background.default,
  padding: `${theme.spacing[8]} 0`,
  fontFamily: theme.typography.fontFamily,
};

const containerStyles = {
  maxWidth: '60rem',
  margin: '0 auto',
  padding: `0 ${theme.spacing[4]}`,
};

const formContainerStyles = {
  backgroundColor: theme.colors.background.card,
  padding: theme.spacing[6],
  borderRadius: '1rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.colors.border}`,
};

const headerStyles = {
  fontSize: theme.typography.fontSize['2xl'],
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.primary,
  marginBottom: theme.spacing[6],
  textAlign: 'center',
};

const formGridStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[5],
};

const formGroupStyles = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyles = {
  marginBottom: theme.spacing[2],
  fontSize: '0.95rem',
  fontWeight: theme.typography.fontWeight.semibold,
  color: '#374151',
};

const submitButtonStyles = {
  marginTop: theme.spacing[6],
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  fontSize: theme.typography.fontSize.lg,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.white,
  backgroundColor: theme.colors.primary,
  borderRadius: '0.75rem',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
  width: '100%',
};

const submitButtonHoverStyles = {
  backgroundColor: theme.colors.primaryDark,
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 14px rgba(79,70,229,0.35)',
};

const submitButtonDisabledStyles = {
  opacity: 0.6,
  cursor: 'not-allowed',
  transform: 'none',
  backgroundColor: theme.colors.primary,
};

const errorStyles = {
  backgroundColor: '#fef2f2',
  color: theme.colors.text.danger,
  padding: theme.spacing[3],
  borderRadius: theme.borderRadius,
  marginBottom: theme.spacing[4],
  border: `1px solid ${theme.colors.text.danger}`,
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: '0.95rem',
};
// --- END Style Definitions ---

const CreateWorkshop = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get authentication token

  const [workshopData, setWorkshopData] = useState({
    workshopName: '',
    location: 'GUC Cairo',
    startDate: '',
    endDate: '',
    shortDescription: '',
    fullAgenda: '',
    facultyResponsible: 'MET',
    professors: '',
    requiredBudget: '',
    fundingSource: 'GUC',
    extraResources: '',
    capacity: '',
    registrationDeadline: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkshopData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    setValidationError('');
    setIsSubmitting(true);

    // Validation: registrationDeadline must be <= startDate
    const startDate = new Date(workshopData.startDate);
    const regDeadline = new Date(workshopData.registrationDeadline);
    if (regDeadline > startDate) {
      setValidationError('Registration deadline must be on or before the start date.');
      setIsSubmitting(false);
      return;
    }

    // Validation: endDate must be after startDate
    const endDate = new Date(workshopData.endDate);
    if (endDate <= startDate) {
      setValidationError('End date must be after start date.');
      setIsSubmitting(false);
      return;
    }

    // You can add more required field checks here if needed

    const professorsArray = workshopData.professors
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const payload = {
      workshopName: workshopData.workshopName,
      shortDescription: workshopData.shortDescription,
      fullAgenda: workshopData.fullAgenda,
      location: workshopData.location,
      startDate: workshopData.startDate,
      endDate: workshopData.endDate,
      facultyResponsible: workshopData.facultyResponsible,
      professorsParticipating: professorsArray,
      capacity: Number(workshopData.capacity),
      registrationDeadline: workshopData.registrationDeadline,
      requiredBudget: Number(workshopData.requiredBudget),
      fundingSource: workshopData.fundingSource,
      extraRequiredResources: workshopData.extraResources,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add authentication token
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server responded with status ${response.status}.`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      toast.success('Workshop successfully created and waiting for approval!');
      // Navigate to events page to see the pending workshop
      navigate('/events');
    } catch (error) {
      console.error('Submission Error:', error.message);
      setSubmissionError(`Error submitting workshop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={pageStyles}>
        <div style={containerStyles}>
          <h1 style={headerStyles}>Create New Workshop</h1>
          <div style={formContainerStyles}>
            {submissionError && <div style={errorStyles}>{submissionError}</div>}
            {validationError && <div style={errorStyles}>{validationError}</div>}

            <form onSubmit={handleSubmit} style={formGridStyles}>
              {/* Basic Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="workshopName" style={labelStyles}>
                    Workshop Name
                  </label>
                  <Input
                    id="workshopName"
                    name="workshopName"
                    value={workshopData.workshopName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="location" style={labelStyles}>
                    Location
                  </label>
                  <Select
                    id="location"
                    name="location"
                    value={workshopData.location}
                    onChange={handleChange}
                  >
                    <option value="GUC Cairo">GUC Cairo</option>
                    <option value="GUC Berlin">GUC Berlin</option>
                  </Select>
                </div>
              </div>

              {/* Date/Time */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="startDate" style={labelStyles}>
                    Start Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={workshopData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="endDate" style={labelStyles}>
                    End Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={workshopData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div style={formGroupStyles}>
                <label htmlFor="shortDescription" style={labelStyles}>
                  Short Description
                </label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={workshopData.shortDescription}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="fullAgenda" style={labelStyles}>
                  Full Agenda
                </label>
                <Textarea
                  id="fullAgenda"
                  name="fullAgenda"
                  value={workshopData.fullAgenda}
                  onChange={handleChange}
                  rows="5"
                />
              </div>

              {/* Faculty/Professors */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="facultyResponsible" style={labelStyles}>
                    Faculty Responsible
                  </label>
                  <Select
                    id="facultyResponsible"
                    name="facultyResponsible"
                    value={workshopData.facultyResponsible}
                    onChange={handleChange}
                  >
                    <option value="MET">MET</option>
                    <option value="IET">IET</option>
                    <option value="MGT">MGT</option>
                    <option value="PHAR">PHAR</option>
                    <option value="ARCH">ARCH</option>
                    <option value="ART">ART</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="professors" style={labelStyles}>
                    Professor(s) Participating (Comma-separated)
                  </label>
                  <Input
                    id="professors"
                    name="professors"
                    value={workshopData.professors}
                    onChange={handleChange}
                    placeholder="e.g., Dr. John Doe, Dr. Jane Smith"
                  />
                </div>
              </div>

              {/* Finance */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="requiredBudget" style={labelStyles}>
                    Required Budget ($)
                  </label>
                  <Input
                    type="number"
                    id="requiredBudget"
                    name="requiredBudget"
                    value={workshopData.requiredBudget}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="fundingSource" style={labelStyles}>
                    Funding Source
                  </label>
                  <Select
                    id="fundingSource"
                    name="fundingSource"
                    value={workshopData.fundingSource}
                    onChange={handleChange}
                  >
                    <option value="GUC">GUC</option>
                    <option value="External">External</option>
                    <option value="Joint">Joint</option>
                  </Select>
                </div>
              </div>

              {/* Resources & Deadline */}
              <div style={formGroupStyles}>
                <label htmlFor="extraResources" style={labelStyles}>
                  Extra Required Resources
                </label>
                <Textarea
                  id="extraResources"
                  name="extraResources"
                  value={workshopData.extraResources}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g., Projectors, specific software, lab access"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: theme.spacing[4],
                }}
              >
                <div style={formGroupStyles}>
                  <label htmlFor="capacity" style={labelStyles}>
                    Capacity
                  </label>
                  <Input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={workshopData.capacity}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="registrationDeadline" style={labelStyles}>
                    Registration Deadline
                  </label>
                  <Input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={workshopData.registrationDeadline}
                    onChange={handleChange}
                    required
                  />
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
                {isSubmitting ? 'Submitting...' : 'Create Workshop'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateWorkshop;
