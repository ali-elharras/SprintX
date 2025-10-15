import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- STYLES as a JavaScript Object (Centralized Styles) ---
const themeColors = {
    indigo600: '#4f46e5',
    indigo50: '#eef2ff',
    orange600: '#ea580c',
    fuchsia600: '#c026d3',
    gray100: '#f3f4f6',
    gray900: '#111827',
    gray500: '#6b7280',
    red600: '#dc2626', // New color for delete button
    red50: '#fef2f2', // New color for delete button
};

const styleSheet = {
    // --- Card Border Styles ---
    'card-border-MET': { borderTopColor: themeColors.indigo600 },
    'card-border-IET': { borderTopColor: themeColors.orange600 },
    'card-border-MGT': { borderTopColor: '#16a34a' },
    'card-border-PHAR': { borderTopColor: '#0ea5e9' },
    'card-border-ARCH': { borderTopColor: '#f59e42' },
    'card-border-ART': { borderTopColor: themeColors.fuchsia600 },
    'card-border-Other': { borderTopColor: themeColors.gray500 },

    // --- Faculty Badge Styles ---
    'badge-MET': { backgroundColor: themeColors.indigo50, color: themeColors.indigo600 },
    'badge-IET': { backgroundColor: '#fff7ed', color: '#c2410c' },
    'badge-MGT': { backgroundColor: '#dcfce7', color: '#16a34a' },
    'badge-PHAR': { backgroundColor: '#e0f2fe', color: '#0ea5e9' },
    'badge-ARCH': { backgroundColor: '#fef9c3', color: '#f59e42' },
    'badge-ART': { backgroundColor: '#fae8ff', color: '#a215b9' },
    'badge-Other': { backgroundColor: themeColors.gray100, color: themeColors.gray500 },
    'badge-default': { backgroundColor: themeColors.gray100, color: themeColors.gray500 },

    // --- Button Base Styles ---
    'card-btn-edit-default': { 
        color: themeColors.indigo600, 
        borderColor: themeColors.indigo600, 
        backgroundColor: 'transparent' 
    },
    'card-btn-view-toggle-default': { 
        color: themeColors.indigo600, 
        backgroundColor: themeColors.indigo50, 
        borderColor: 'transparent' 
    },
    // New Delete Button Base Style
    'card-btn-delete-default': {
        color: themeColors.red600,
        borderColor: themeColors.red600,
        backgroundColor: 'transparent',
    }
};

// --- Dummy Data (Fixed to use correct schema keys for safe fallback) ---
const FALLBACK_WORKSHOP = { 
    _id: 'fallback-123', 
    workshopName: '💡 Demo Workshop (Fallback)',
    shortDescription: 'This item is a placeholder. If you see it, your API fetch failed. Check your server!',
    fullAgenda: 'Check server connection and API route /api/workshops.',
    location: 'Local Dev Server',
    startDate: '2024-01-01',
    startTime: '12:00 PM',
    endDate: '2024-01-01',
    endTime: '1:00 PM',
    duration: '1 hour',
    facultyResponsible: 'DEFAULT', 
    professorsParticipating: ['API Error Handler'],
    capacity: 0,
    attendees: 0,
    registrationDeadline: 'N/A',
    requiredBudget: 'N/A',
    fundingSource: 'N/A',
    extraRequiredResources: 'Check the backend console for error details.',
    status: 'Failed', 
};


// --- Utility Components (Unchanged) ---
const FacultyBadge = ({ faculty }) => {
    let styleKey = '';
    switch (faculty) {
        case 'MET': styleKey = 'badge-MET'; break;
        case 'IET': styleKey = 'badge-IET'; break;
        case 'MGT': styleKey = 'badge-MGT'; break;
        case 'PHAR': styleKey = 'badge-PHAR'; break;
        case 'ARCH': styleKey = 'badge-ARCH'; break;
        case 'ART': styleKey = 'badge-ART'; break;
        case 'Other': styleKey = 'badge-Other'; break;
        default: styleKey = 'badge-default';
    }

    const baseStyle = {
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem', 
        fontWeight: 600,
        borderRadius: '9999px',
    };

    return (
        <span style={{ ...baseStyle, ...styleSheet[styleKey] }}>
            {faculty} 
        </span>
    );
};

// Status Badge Component for Workshop Status
const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'pending':
                return { backgroundColor: '#fef3c7', color: '#d97706' }; // Yellow
            case 'published':
                return { backgroundColor: '#dcfce7', color: '#16a34a' }; // Green
            case 'rejected':
                return { backgroundColor: '#fecaca', color: '#dc2626' }; // Red
            case 'needs_revision':
                return { backgroundColor: '#dbeafe', color: '#2563eb' }; // Blue
            default:
                return { backgroundColor: '#f3f4f6', color: '#6b7280' }; // Gray
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'pending':
                return '⏳ Pending for Approval';
            case 'published':
                return '✅ Published';
            case 'rejected':
                return '❌ Rejected';
            case 'needs_revision':
                return '📝 Needs Revision';
            default:
                return status;
        }
    };

    const baseStyle = {
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: '9999px',
        display: 'inline-block',
        marginLeft: '0.5rem',
    };

    return (
        <span style={{ ...baseStyle, ...getStatusStyle() }}>
            {getStatusLabel()}
        </span>
    );
};

// Icons (using inline SVG for single-file component) - No change here
const IconMap = {
    // ... (Your SVG definitions) ...
    Location: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    People: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 17H10"/></svg>
    ),
    Agenda: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
    ),
    Finance: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    ChevronDown: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    ),
    ChevronUp: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    ),
    Trash: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
    )
};

const DetailSectionHeader = ({ title, icon }) => (
    <h4 style={{ 
        fontSize: '0.875rem', fontWeight: 600, color: themeColors.indigo600, marginBottom: '0.5rem', 
        display: 'flex', alignItems: 'center' 
    }}>
        <span style={{ marginRight: '0.25rem', width: '14px', height: '14px' }}>{icon}</span>
        {title}
    </h4>
);


// --- REVISED WorkshopCard with Delete Button ---
const WorkshopCard = ({ workshop, onEdit, onDelete }) => { // Added onDelete prop
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isToggleHovered, setIsToggleHovered] = useState(false);
    const [isEditHovered, setIsEditHovered] = useState(false);
    const [isDeleteHovered, setIsDeleteHovered] = useState(false); // New hover state

    const getBorderClassKey = (faculty) => {
        switch (faculty) {
            case 'MET': return 'card-border-MET';
            case 'IET': return 'card-border-IET';
            case 'MGT': return 'card-border-MGT';
            case 'PHAR': return 'card-border-PHAR';
            case 'ARCH': return 'card-border-ARCH';
            case 'ART': return 'card-border-ART';
            case 'Other': return 'card-border-Other';
            default: return 'card-border-Other';
        }
    };
    const borderStyle = styleSheet[getBorderClassKey(workshop.facultyResponsible)] || {};
    const uniqueId = workshop._id || workshop.id;
    
    // Determine if workshop is rejected
    const isRejected = workshop.status === 'rejected';
    
    // Base styles for card elements
    const cardBaseStyle = {
        backgroundColor: isRejected ? '#fef2f2' : 'white', // Light red background for rejected
        padding: '1.5rem',
        borderRadius: '1rem',
        // Hover simulation: Change box shadow and scale slightly on hover
        boxShadow: isHovered 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        border: isRejected ? '2px solid #ef4444' : '1px solid #e5e7eb', // Red border for rejected
        transition: 'box-shadow 0.3s, transform 0.3s',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        borderTopWidth: isRejected ? '6px' : '6px', 
        borderTopStyle: 'solid',
        borderTopColor: isRejected ? '#dc2626' : '#9ca3af', // Dark red top border for rejected
        cursor: 'default'
    };

    const professorsList = Array.isArray(workshop.professorsParticipating) 
                           ? workshop.professorsParticipating 
                           : (workshop.professors || []); 

    return (
        <div 
            style={{ 
                ...cardBaseStyle, 
                // Only apply faculty borderStyle if not rejected
                ...(isRejected ? {} : borderStyle)
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: themeColors.gray900, lineHeight: 1.4, marginRight: '0.5rem' }}>
                        {workshop.workshopName}
                    </h3>
                    {workshop.status && <StatusBadge status={workshop.status} />}
                </div>
                <FacultyBadge faculty={workshop.facultyResponsible} />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                {workshop.shortDescription}
            </p>
            
            {/* Edit Requests Section - Only show if there are edit requests */}
            {workshop.editRequests && workshop.editRequests.length > 0 && workshop.status === 'needs_revision' && (
                <div style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #fbbf24', 
                    borderRadius: '0.5rem', 
                    padding: '0.75rem', 
                    marginBottom: '1rem' 
                }}>
                    <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: '#92400e', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        ✏️ Edit Request
                    </h4>
                    {workshop.editRequests.map((editReq, index) => (
                        <div key={index} style={{ marginBottom: index < workshop.editRequests.length - 1 ? '0.5rem' : 0 }}>
                            <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                                <strong>Message:</strong> {editReq.message}
                            </p>
                            {editReq.requestedBy && editReq.requestedBy.name && (
                                <p style={{ fontSize: '0.75rem', color: '#92400e' }}>
                                    Requested by: {editReq.requestedBy.name}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{ flexGrow: 1 }}> 
                
                {/* FACULTY & LOGISTICS (ALWAYS VISIBLE - GROUP 1) */}
                <div style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}>
                    <DetailSectionHeader title="Faculty & Logistics" icon={IconMap.People} />
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Responsible Faculty:</strong> {workshop.facultyResponsible}
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Professors:</strong> {professorsList.join(', ')}
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Capacity:</strong> {workshop.attendees || 0} / {workshop.capacity}
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Required Resources:</strong> {workshop.extraRequiredResources}
                    </p>
                </div>

                {/* HIDDEN DETAILS (LOCATION, AGENDA, FINANCE) - Visible when expanded */}
                {isExpanded && (
                    <>
                        {/* LOCATION & DATES */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}>
                            <DetailSectionHeader title="Location & Dates" icon={IconMap.Location} />
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Campus:</strong> {workshop.location}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Start:</strong> {workshop.startDate} @ {workshop.startTime}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>End:</strong> {workshop.endDate} @ {workshop.endTime}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Duration:</strong> {workshop.duration}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Reg. Deadline:</strong> {workshop.registrationDeadline}
                            </p>
                        </div>
                        
                        {/* AGENDA */}
                        <div style={{ borderTop: '1px solid solid #f3f4f6', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}>
                            <DetailSectionHeader title="Agenda Summary" icon={IconMap.Agenda} />
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>{workshop.fullAgenda}</p>
                        </div>

                        {/* FINANCE */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}>
                            <DetailSectionHeader title="Finance" icon={IconMap.Finance} />
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Required Budget:</strong> {workshop.requiredBudget}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.4, color: '#374151', marginBottom: '0.25rem' }}>
                                <strong style={{ color: '#1f2937', fontWeight: 600 }}>Funding Source:</strong> {workshop.fundingSource}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Card Actions (Toggle Button and Action buttons) */}
            <div style={{ 
                marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' 
            }}>
                
                {/* Toggle Button */}
                <button 
                    style={{ 
                        ...styleSheet['card-btn-view-toggle-default'], 
                        padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, 
                        borderRadius: '0.5rem', transition: 'all 0.15s', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', border: 'none',
                        // Hover simulation
                        backgroundColor: isToggleHovered ? themeColors.indigo600 : themeColors.indigo50,
                        color: isToggleHovered ? 'white' : themeColors.indigo600,
                    }}
                    onMouseEnter={() => setIsToggleHovered(true)}
                    onMouseLeave={() => setIsToggleHovered(false)}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    <span style={{ marginLeft: '0.5rem', width: '16px', height: '16px' }}>
                        {isExpanded ? IconMap.ChevronUp : IconMap.ChevronDown}
                    </span>
                </button>

                {/* Edit and Delete Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    
                    {/* Edit Button */}
                    <button 
                        style={{ 
                            ...styleSheet['card-btn-edit-default'],
                            padding: '0.35rem 1rem', fontSize: '0.875rem', fontWeight: 500, 
                            borderRadius: '0.5rem', transition: 'all 0.15s', cursor: 'pointer',
                            border: `1px solid ${themeColors.indigo600}`, 
                            backgroundColor: isEditHovered ? themeColors.indigo600 : 'transparent',
                            color: isEditHovered ? 'white' : themeColors.indigo600,
                        }}
                        onMouseEnter={() => setIsEditHovered(true)}
                        onMouseLeave={() => setIsEditHovered(false)}
                        onClick={() => onEdit(uniqueId, workshop.workshopName)} 
                    >
                        Edit
                    </button>
                    
                    {/* DELETE Button (NEW) */}
                    <button 
                        style={{ 
                            ...styleSheet['card-btn-delete-default'],
                            padding: '0.35rem 1rem', fontSize: '0.875rem', fontWeight: 500, 
                            borderRadius: '0.5rem', transition: 'all 0.15s', cursor: 'pointer',
                            border: `1px solid ${themeColors.red600}`, 
                            backgroundColor: isDeleteHovered ? themeColors.red600 : 'transparent',
                            color: isDeleteHovered ? 'white' : themeColors.red600,
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}
                        onMouseEnter={() => setIsDeleteHovered(true)}
                        onMouseLeave={() => setIsDeleteHovered(false)}
                        onClick={() => onDelete(uniqueId, workshop.workshopName)} 
                    >
                        {IconMap.Trash}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};



// --- Edit Modal Component ---

const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        overflow: 'auto',
    },
    container: {
        background: 'white', borderRadius: '1rem', padding: '2rem', minWidth: '350px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', fontFamily: 'Inter, sans-serif',
        display: 'flex', flexDirection: 'column',
    },
    title: {
        fontSize: '1.5rem', fontWeight: 800, color: themeColors.indigo600, marginBottom: '1rem', textAlign: 'center',
    },
    label: {
        fontWeight: 600, color: themeColors.gray900, marginBottom: '0.25rem', fontSize: '1rem',
    },
    input: {
        padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', fontSize: '1rem', marginBottom: '0.75rem',
        width: '100%', boxSizing: 'border-box',
    },
    textarea: {
        padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', fontSize: '1rem', marginBottom: '0.75rem',
        width: '100%', minHeight: '80px', boxSizing: 'border-box',
    },
    button: {
        backgroundColor: themeColors.indigo600, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
        fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem',
        boxShadow: '0 2px 6px rgba(79,70,229,0.15)', transition: 'background 0.2s',
    },
    cancelButton: {
        backgroundColor: themeColors.gray100, color: themeColors.gray900, padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
        fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem',
    }
};

const EditWorkshopModal = ({ open, workshop, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(workshop || {});
    const [errorMsg, setErrorMsg] = useState('');
    useEffect(() => {
        setFormData(workshop || {});
        setErrorMsg('');
    }, [workshop]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorMsg('');
    };

    const validateForm = () => {
        // Required fields
        const requiredFields = [
            'workshopName', 'shortDescription', 'location', 'startDate', 'endDate',
            'fullAgenda', 'facultyResponsible', 'capacity', 'registrationDeadline', 'requiredBudget', 'fundingSource'
        ];
        for (const field of requiredFields) {
            if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
                setErrorMsg('Please fill in all required fields.');
                return false;
            }
        }
        // Date logic
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const regDeadline = new Date(formData.registrationDeadline);
        if (endDate <= startDate) {
            setErrorMsg('End date must be after start date.');
            return false;
        }
        if (regDeadline > startDate) {
            setErrorMsg('Registration deadline must be on or before the start date.');
            return false;
        }
        setErrorMsg('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        // Only send changed fields
        const changedFields = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== workshop[key]) {
                changedFields[key] = formData[key];
            }
        });
        onSubmit(changedFields);
    };

    return ReactDOM.createPortal(
        <div style={modalStyles.overlay}>
            <div style={modalStyles.container}>
                <div style={modalStyles.title}>Edit Workshop</div>
                {errorMsg && (
                    <div style={{ color: themeColors.red600, background: themeColors.red50, padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={modalStyles.label}>Workshop Name</label>
                    <input
                        style={modalStyles.input}
                        name="workshopName"
                        value={formData.workshopName || ''}
                        onChange={handleChange}
                        placeholder="Workshop Name"
                    />
                    <label style={modalStyles.label}>Short Description</label>
                    <textarea
                        style={modalStyles.textarea}
                        name="shortDescription"
                        value={formData.shortDescription || ''}
                        onChange={handleChange}
                        placeholder="Short Description"
                        maxLength={200}
                    />
                    <label style={modalStyles.label}>Full Agenda</label>
                    <textarea
                        style={modalStyles.textarea}
                        name="fullAgenda"
                        value={formData.fullAgenda || ''}
                        onChange={handleChange}
                        placeholder="Full Agenda"
                    />
                    <label style={modalStyles.label}>Location</label>
                    <select
                        style={modalStyles.input}
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Location</option>
                        <option value="GUC Cairo">GUC Cairo</option>
                        <option value="GUC Berlin">GUC Berlin</option>
                    </select>
                    <label style={modalStyles.label}>Start Date</label>
                    <input
                        style={modalStyles.input}
                        type="date"
                        name="startDate"
                        value={formData.startDate ? formData.startDate.slice(0,10) : ''}
                        onChange={handleChange}
                    />
                    <label style={modalStyles.label}>End Date</label>
                    <input
                        style={modalStyles.input}
                        type="date"
                        name="endDate"
                        value={formData.endDate ? formData.endDate.slice(0,10) : ''}
                        onChange={handleChange}
                    />
                    <label style={modalStyles.label}>Faculty Responsible</label>
                    <select
                        style={modalStyles.input}
                        name="facultyResponsible"
                        value={formData.facultyResponsible || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Faculty</option>
                        <option value="MET">MET</option>
                        <option value="IET">IET</option>
                        <option value="MGT">MGT</option>
                        <option value="PHAR">PHAR</option>
                        <option value="ARCH">ARCH</option>
                        <option value="ART">ART</option>
                        <option value="Other">Other</option>
                    </select>
                    <label style={modalStyles.label}>Professors Participating (comma separated)</label>
                    <input
                        style={modalStyles.input}
                        name="professorsParticipating"
                        value={Array.isArray(formData.professorsParticipating) ? formData.professorsParticipating.join(', ') : (formData.professorsParticipating || '')}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, professorsParticipating: e.target.value.split(',').map(s => s.trim()) }));
                        }}
                        placeholder="Professors Participating"
                    />
                    <label style={modalStyles.label}>Capacity</label>
                    <input
                        style={modalStyles.input}
                        type="number"
                        name="capacity"
                        min={1}
                        value={formData.capacity || ''}
                        onChange={handleChange}
                        placeholder="Capacity"
                    />
                    <label style={modalStyles.label}>Registration Deadline</label>
                    <input
                        style={modalStyles.input}
                        type="date"
                        name="registrationDeadline"
                        value={formData.registrationDeadline ? formData.registrationDeadline.slice(0,10) : ''}
                        onChange={handleChange}
                    />
                    <label style={modalStyles.label}>Extra Required Resources</label>
                    <textarea
                        style={modalStyles.textarea}
                        name="extraRequiredResources"
                        value={formData.extraRequiredResources || ''}
                        onChange={handleChange}
                        placeholder="Extra Required Resources"
                        maxLength={500}
                    />
                    <label style={modalStyles.label}>Required Budget</label>
                    <input
                        style={modalStyles.input}
                        type="number"
                        name="requiredBudget"
                        min={0}
                        value={formData.requiredBudget || ''}
                        onChange={handleChange}
                        placeholder="Required Budget"
                    />
                    <label style={modalStyles.label}>Funding Source</label>
                    <select
                        style={modalStyles.input}
                        name="fundingSource"
                        value={formData.fundingSource || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Funding Source</option>
                        <option value="External">External</option>
                        <option value="GUC">GUC</option>
                        <option value="Joint">Joint</option>
                    </select>
                    <button type="submit" style={modalStyles.button}>Save Changes</button>
                    <button type="button" style={modalStyles.cancelButton} onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>,
        document.body
    );
};

// --- Main Component ---
const Workshops = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [workshops, setWorkshops] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const navigate = useNavigate();
    const { token, user } = useAuth(); // Get auth token and user info

    // Use environment variable for API URL
    const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/workshops`; 
    
    // --- Data Fetching Logic with Authentication ---
    const fetchWorkshops = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            // Add authentication token if available
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(API_URL, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setWorkshops(data);
        } catch (e) {
            console.error('Fetch error. Displaying fallback workshop.', e);
            setError(e.message || 'Failed to connect to the server.');
            setWorkshops([FALLBACK_WORKSHOP]); 
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, token]);

    useEffect(() => {
        fetchWorkshops();
    }, [fetchWorkshops]); 

    // --- Action Handlers ---

    // 1. Edit Workshop Handler
    const handleEditWorkshop = useCallback((id, title) => {
        const workshop = workshops.find(w => (w._id || w.id) === id);
        setEditingWorkshop(workshop);
        setEditModalOpen(true);
    }, [workshops]);

    // Modal submit handler
    const handleModalSubmit = async (changedFields) => {
        if (!editingWorkshop || !editingWorkshop._id) return;
        setIsLoading(true);
        setError(null);
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // If workshop is being resubmitted after edit request, change status to pending
            const updatedFields = { ...changedFields };
            if (editingWorkshop.status === 'needs_revision') {
                updatedFields.status = 'pending';
            }
            
            const response = await fetch(`${API_URL}/${editingWorkshop._id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updatedFields),
            });
            if (!response.ok) throw new Error('Failed to update workshop');
            
            // Show success message for resubmission
            if (editingWorkshop.status === 'needs_revision') {
                alert('✅ Workshop resubmitted successfully! It is now pending approval from the Events Office.');
            }
            
            setEditModalOpen(false);
            setEditingWorkshop(null);
            fetchWorkshops();
        } catch (e) {
            setError(e.message || 'Failed to update workshop');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Delete Workshop Handler (NEW)
    const handleDeleteWorkshop = useCallback(async (id, title) => {
        if (!window.confirm(`Are you sure you want to permanently delete the workshop: "${title}"? This cannot be undone.`)) {
            return;
        }

        console.log(`[DELETE ACTION] Deleting workshop ID: ${id} (${title})`);
        setError(null);
        setIsLoading(true); // Can show loading state, but often deletion is quick

        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                throw new Error(`Failed to delete workshop: ${response.statusText}`);
            }

            // Notify other tabs/windows about the deletion via localStorage
            // This will trigger the EventsPage to refresh and remove the deleted workshop
            localStorage.setItem('workshop_deleted', Date.now().toString());

            // On successful deletion, refetch the list to update the UI
            fetchWorkshops(); 

        } catch (e) {
            console.error('Delete error:', e);
            setError(`Could not delete workshop. Error: ${e.message}`);
            setIsLoading(false); // Stop loading on error
        }
        // Note: fetchWorkshops will set isLoading(false) on success
    }, [API_URL, fetchWorkshops, token]); // Dependencies: API_URL, fetchWorkshops, and token

    // --- Filtering Logic (Unchanged) ---
    const filteredWorkshops = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        
        const results = workshops.filter(workshop => {
            if (!workshop) return false;
            
            // Use correct schema keys with safety checks
            const nameMatch = workshop.workshopName && workshop.workshopName.toLowerCase().includes(searchLower);
            const descriptionMatch = workshop.shortDescription && workshop.shortDescription.toLowerCase().includes(searchLower);
            
            const locationMatch = workshop.location && workshop.location.toLowerCase().includes(searchLower);
            const facultyMatch = workshop.facultyResponsible && workshop.facultyResponsible.toLowerCase().includes(searchLower);
            const statusMatch = workshop.status && workshop.status.toLowerCase().includes(searchLower);

            return nameMatch || descriptionMatch || locationMatch || facultyMatch || statusMatch;
        });
        
        if (results.length === 1 && results[0]._id === 'fallback-123') {
            return results;
        }

        return results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); 
    }, [searchTerm, workshops]); 

    // --- Main Component Render ---
    return (
        <>
            <Navbar />
            {/* CONTAINER: Max-width and background for main page */}
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#f9fafb', 
                padding: '1.5rem', 
                fontFamily: 'Inter, sans-serif' 
            }}>
                
                {/* Page Header and Actions - Centered and constrained */}
                <div style={{ 
                    maxWidth: '80rem', 
                    marginLeft: 'auto', 
                    marginRight: 'auto', 
                    marginBottom: '2.5rem',
                    paddingLeft: '1rem', // Add padding for smaller screens
                    paddingRight: '1rem',
                }}>
                    {/* Header and Button - Flex layout for spacing */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: themeColors.gray900 }}>
                            My Workshops Dashboard
                        </h1>
                        <button
                            style={{ 
                                display: 'flex', alignItems: 'center', backgroundColor: themeColors.indigo600, color: 'white', 
                                padding: '0.65rem 1.25rem', borderRadius: '0.75rem', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                // Note: Inline styles don't support pseudo-classes like :hover directly. 
                                // A custom component with state is needed for true hover on this element.
                                transform: 'scale(1)',
                            }}
                            onClick={() => navigate('/create-workshop')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create New Workshop
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search workshops by title, description, location, or faculty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                                transition: 'border-color 0.15s, box-shadow 0.15s', fontSize: '1rem',
                            }}
                        />
                    </div>
                </div>

                {/* Workshops Grid Container */}
                <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 1rem' }}>
                    
                    {/* Display Loading / Error State */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Loading workshops from database... ⏳</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: themeColors.red50, borderRadius: '0.75rem', border: `1px solid ${themeColors.red600}` }}>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: themeColors.red600 }}>Error: {error}</p>
                            <p style={{ fontSize: '0.875rem', color: themeColors.red600 }}>Check your server and refresh the page. Displaying fallback data.</p>
                        </div>
                    )}

                    {/* Display Workshops */}
                    {!isLoading && !error && filteredWorkshops.length === 0 && searchTerm === '' ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>
                                No workshops found in the database. Start by creating a new one!
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            // Grid Fix: Ensures 1 column on small screens and expands
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '1.5rem', 
                        }}>
                            {filteredWorkshops.map((workshop) => (
                                <WorkshopCard 
                                    key={workshop._id || workshop.id} 
                                    workshop={workshop} 
                                    onEdit={handleEditWorkshop}
                                    onDelete={handleDeleteWorkshop} // Passed the new delete handler
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <EditWorkshopModal
                open={editModalOpen}
                workshop={editingWorkshop}
                onClose={() => { setEditModalOpen(false); setEditingWorkshop(null); }}
                onSubmit={handleModalSubmit}
            />
        </>
    );
};

export default Workshops;