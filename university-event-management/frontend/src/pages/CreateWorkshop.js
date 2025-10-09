import React, { useState } from 'react';

// A simplified theme object inspired by the reference code and image.
const theme = {
  colors: {
    primary: '#6A5ACD', // A shade of purple from the welcome card
    primaryDark: '#5A4BAD', // A slightly darker purple for hover
    background: {
      default: '#F8F9FA', // Light grey background
      card: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      white: '#FFFFFF',
    },
    border: '#DEE2E6',
    inputFocus: '#80bdff',
  },
  spacing: {
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
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


/**
 * A React component for creating a new workshop, styled to match the
 * Campus Events Hub design.
 */
const CreateWorkshop = () => {
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
    registrationDeadline: ''
  });

  // State to track if the submit button is being hovered over
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkshopData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Workshop Data Submitted:', workshopData);
    alert('Workshop created successfully! Check the console for the form data.');
    // Reset form after submission
    setWorkshopData({
        workshopName: '', location: 'GUC Cairo', startDate: '', endDate: '',
        shortDescription: '', fullAgenda: '', facultyResponsible: 'MET',
        professors: '', requiredBudget: '', fundingSource: 'GUC',
        extraResources: '', capacity: '', registrationDeadline: ''
    });
  };

  // --- Style Objects ---

  const pageStyles = {
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text.primary,
    minHeight: '100vh',
    padding: theme.spacing[6],
  };

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const formContainerStyles = {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
    padding: theme.spacing[6],
  };

  const headerStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  };

  const formGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing[5],
  };
  
  const formGroupStyles = {
    display: 'flex',
    flexDirection: 'column',
  };
  
  const labelStyles = {
    display: 'block',
    marginBottom: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  };

  const inputStyles = {
    width: '100%',
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const submitButtonStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.primary,
    color: theme.colors.text.white,
    border: 'none',
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing[4],
    boxShadow: theme.boxShadow,
    // Smooth transition for all properties
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease, box-shadow 0.2s ease',
  };

  // Additional styles to apply on hover
  const submitButtonHoverStyles = {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.colors.primaryDark,
  };


  return (
    <div style={pageStyles}>
      <div style={containerStyles}>
        <h1 style={headerStyles}>Create New Workshop</h1>
        <div style={formContainerStyles}>
          <form onSubmit={handleSubmit} style={formGridStyles}>
            
            <div style={formGroupStyles}>
              <label htmlFor="workshopName" style={labelStyles}>Workshop Name</label>
              <input type="text" id="workshopName" name="workshopName" value={workshopData.workshopName} onChange={handleChange} required style={inputStyles} />
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="location" style={labelStyles}>Location</label>
              <select id="location" name="location" value={workshopData.location} onChange={handleChange} style={inputStyles}>
                <option value="GUC Cairo">GUC Cairo</option>
                <option value="GUC Berlin">GUC Berlin</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing[4] }}>
              <div style={formGroupStyles}>
                <label htmlFor="startDate" style={labelStyles}>Start Date & Time</label>
                <input type="datetime-local" id="startDate" name="startDate" value={workshopData.startDate} onChange={handleChange} required style={inputStyles} />
              </div>
              <div style={formGroupStyles}>
                <label htmlFor="endDate" style={labelStyles}>End Date & Time</label>
                <input type="datetime-local" id="endDate" name="endDate" value={workshopData.endDate} onChange={handleChange} required style={inputStyles} />
              </div>
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="shortDescription" style={labelStyles}>Short Description</label>
              <textarea id="shortDescription" name="shortDescription" value={workshopData.shortDescription} onChange={handleChange} rows="3" style={inputStyles} />
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="fullAgenda" style={labelStyles}>Full Agenda</label>
              <textarea id="fullAgenda" name="fullAgenda" value={workshopData.fullAgenda} onChange={handleChange} rows="5" style={inputStyles} />
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="facultyResponsible" style={labelStyles}>Faculty Responsible</label>
              <select id="facultyResponsible" name="facultyResponsible" value={workshopData.facultyResponsible} onChange={handleChange} style={inputStyles}>
                <option value="MET">Media Engineering and Technology</option>
                <option value="IET">Information Engineering and Technology</option>
                <option value="MGT">Management Technology</option>
                <option value="PHT">Pharmacy and Biotechnology</option>
                <option value="LAW">Law and Legal Studies</option>
                <option value="AET">Applied Sciences and Arts</option>
              </select>
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="professors" style={labelStyles}>Professor(s) Participating</label>
              <input type="text" id="professors" name="professors" value={workshopData.professors} onChange={handleChange} style={inputStyles} placeholder="e.g., Dr. John Doe, Dr. Jane Smith"/>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing[4] }}>
              <div style={formGroupStyles}>
                <label htmlFor="requiredBudget" style={labelStyles}>Required Budget ($)</label>
                <input type="number" id="requiredBudget" name="requiredBudget" value={workshopData.requiredBudget} onChange={handleChange} min="0" style={inputStyles} />
              </div>
              <div style={formGroupStyles}>
                <label htmlFor="fundingSource" style={labelStyles}>Funding Source</label>
                <select id="fundingSource" name="fundingSource" value={workshopData.fundingSource} onChange={handleChange} style={inputStyles}>
                  <option value="GUC">GUC</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="extraResources" style={labelStyles}>Extra Required Resources</label>
              <textarea id="extraResources" name="extraResources" value={workshopData.extraResources} onChange={handleChange} rows="3" style={inputStyles} placeholder="e.g., Projectors, specific software, lab access"/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing[4] }}>
                <div style={formGroupStyles}>
                  <label htmlFor="capacity" style={labelStyles}>Capacity</label>
                  <input type="number" id="capacity" name="capacity" value={workshopData.capacity} onChange={handleChange} min="1" style={inputStyles} />
                </div>
                <div style={formGroupStyles}>
                  <label htmlFor="registrationDeadline" style={labelStyles}>Registration Deadline</label>
                  <input type="date" id="registrationDeadline" name="registrationDeadline" value={workshopData.registrationDeadline} onChange={handleChange} required style={inputStyles} />
                </div>
            </div>

            <button 
              type="submit" 
              style={{
                ...submitButtonStyles,
                // Apply hover styles conditionally
                ...(isButtonHovered ? submitButtonHoverStyles : {})
              }}
              // Set hover state to true on mouse enter
              onMouseEnter={() => setIsButtonHovered(true)}
              // Set hover state to false on mouse leave
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              Create Workshop
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshop;