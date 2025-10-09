import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

// --- STYLES as a JavaScript Object (Centralized Styles) ---
const themeColors = {
    indigo600: '#4f46e5',
    indigo50: '#eef2ff',
    orange600: '#ea580c',
    fuchsia600: '#c026d3',
    gray100: '#f3f4f6',
    gray900: '#111827',
    gray500: '#6b7280',
};

const styleSheet = {
    // --- Card Border Styles ---
    'card-border-MET': { borderTopColor: themeColors.indigo600 },
    'card-border-IET': { borderTopColor: themeColors.orange600 },
    'card-border-ART': { borderTopColor: themeColors.fuchsia600 },
    
    // --- Faculty Badge Styles ---
    'badge-MET': { backgroundColor: themeColors.indigo50, color: themeColors.indigo600 },
    'badge-IET': { backgroundColor: '#fff7ed', color: '#c2410c' },
    'badge-ART': { backgroundColor: '#fae8ff', color: '#a215b9' },
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
        case 'ART': styleKey = 'badge-ART'; break;
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


// --- REVISED WorkshopCard with Hover Simulation ---
const WorkshopCard = ({ workshop, onEdit }) => { 
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isToggleHovered, setIsToggleHovered] = useState(false);
    const [isEditHovered, setIsEditHovered] = useState(false);

    const getBorderClassKey = (faculty) => {
        switch (faculty) {
            case 'MET': return 'card-border-MET';
            case 'IET': return 'card-border-IET';
            case 'ART': return 'card-border-ART';
            default: return '';
        }
    };
    const borderStyle = styleSheet[getBorderClassKey(workshop.facultyResponsible)] || {};
    const uniqueId = workshop._id || workshop.id;
    
    // Base styles for card elements
    const cardBaseStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        // Hover simulation: Change box shadow and scale slightly on hover
        boxShadow: isHovered 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.3s, transform 0.3s',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        borderTopWidth: '6px', 
        borderTopStyle: 'solid',
        borderTopColor: '#9ca3af',
        cursor: 'default'
    };

    const professorsList = Array.isArray(workshop.professorsParticipating) 
                           ? workshop.professorsParticipating 
                           : (workshop.professors || []); 

    return (
        <div 
            style={{ ...cardBaseStyle, ...borderStyle }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: themeColors.gray900, lineHeight: 1.4 }}>
                    {workshop.workshopName}
                </h3>
                <FacultyBadge faculty={workshop.facultyResponsible} />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                {workshop.shortDescription}
            </p>
            
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
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}>
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

                {/* Edit Button */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                        Edit Workshop
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const Workshops = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [workshops, setWorkshops] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5000/api/workshops'; 
    
    // --- Data Fetching Logic (Unchanged) ---
    const fetchWorkshops = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
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
    }, [API_URL]);

    useEffect(() => {
        fetchWorkshops();
    }, [fetchWorkshops]); 

    const handleEditWorkshop = useCallback((id, title) => {
        console.log(`[EDIT ACTION] Navigating to edit workshop ID: ${id} (${title})`);
        navigate(`/edit-workshop/${id}`);
    }, [navigate]);

    // --- Filtering Logic (Corrected in previous step, ensuring safety) ---
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
                                // Hover effect for main button
                                transform: 'scale(1)',
                                ':hover': { transform: 'scale(1.05)', backgroundColor: '#3e38c2' } // Simple hover simulation
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
                    {/* Display Loading / Error State (Unchanged) */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Loading workshops from database... ⏳</p>
                        </div>
                    )}
                    {/* ... (Error State) ... */}

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
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Workshops;