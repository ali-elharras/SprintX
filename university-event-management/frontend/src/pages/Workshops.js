import React, { useState, useMemo, useCallback } from 'react';

// --- Styles (Standard CSS) ---
const styles = `
.container {
  min-height: 100vh;
  background-color: #f9fafb; /* gray-50 */
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
}
@media (min-width: 640px) { /* sm */
    .container {
        padding: 2rem;
    }
}
@media (min-width: 1024px) { /* lg */
    .container {
        padding: 4rem;
    }
}
.max-w-7xl {
  max-width: 80rem; /* max-w-7xl */
  margin-left: auto;
  margin-right: auto;
}
.header-area {
  margin-bottom: 2.5rem;
}
.header-content {
  display: flex;
  flex-direction: column; 
  justify-content: space-between;
  align-items: flex-start;
}
@media (min-width: 640px) { /* sm breakpoint */
  .header-content {
    flex-direction: row;
    align-items: center;
  }
}
.title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 800; /* font-extrabold */
  color: #111827; /* gray-900 */
  margin-bottom: 1rem;
}
@media (min-width: 640px) {
  .title {
    margin-bottom: 0;
  }
}
.create-button {
  display: flex;
  align-items: center;
  background-color: #4f46e5; /* indigo-600 */
  color: white;
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.create-button:hover {
  background-color: #4338ca; /* indigo-700 */
  transform: scale(1.02);
}
.search-bar {
  margin-top: 1.5rem;
}
.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s, box-shadow 0.15s;
  font-size: 1rem;
}
.search-input:focus {
  outline: none;
  border-color: #6366f1; /* indigo-500 */
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); /* custom ring */
}

/* --- Card Styles (Primary View) --- */
.card-grid {
  display: grid;
  grid-template-columns: 1fr; /* Default: 1 column */
  gap: 1.5rem; /* gap-6 */
}
@media (min-width: 640px) { /* sm breakpoint (Mobile/Tablet) */
  .card-grid {
    grid-template-columns: repeat(2, 1fr); 
  }
}
@media (min-width: 1024px) { /* lg breakpoint (Desktop) */
  .card-grid {
    grid-template-columns: repeat(3, 1fr); 
  }
}

.workshop-card {
  background-color: white;
  padding: 1.5rem; /* p-6 */
  border-radius: 1rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb; /* gray-200 */
  transition: box-shadow 0.3s, transform 0.3s;
  display: flex;
  flex-direction: column;
  /* Status border strip setup */
  border-top-width: 6px; 
  border-top-style: solid;
  border-top-color: #9ca3af; /* Default gray for a neutral status */
}
.workshop-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Custom Border Colors based on Status */
.card-border-published {
    border-top-color: #065f46; /* green-800 */
}
.card-border-draft {
    /* Yellowish/amber color */
    border-top-color: #f59e0b; /* amber-500 */
}
.card-border-pending {
    /* NEW: Blue color for Pending (blue-500) */
    border-top-color: #3b82f6; 
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem; 
}
.card-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700; /* font-bold */
  color: #111827; /* gray-900 */
  line-height: 1.4;
}
.card-description {
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* gray-600 */
  margin-bottom: 1rem; 
}

/* --- Details Grouping --- */
.card-details-container {
    flex-grow: 1; 
}

.card-details-group {
    border-top: 1px solid #f3f4f6; /* gray-100 */
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    margin-top: 0.25rem;
}
/* Ensure the first (unconditionally rendered) group does not have a top border */
.card-details-group:first-child {
    border-top: none;
}
.card-details-group h4 {
    font-size: 0.875rem; /* text-sm */
    font-weight: 600;
    color: #4f46e5; /* indigo-600 */
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
}
.card-details-group h4 svg {
    margin-right: 0.25rem;
    width: 14px;
    height: 14px;
}
.card-details-group p {
    font-size: 0.875rem;
    line-height: 1.4;
    color: #374151; /* gray-700 */
    margin-bottom: 0.25rem;
}
.card-details-group strong {
    color: #1f2937; /* gray-800 */
    font-weight: 600;
}


.card-actions {
  margin-top: 1rem; /* mt-4 */
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb; /* gray-200 */
  display: flex;
  justify-content: space-between; 
  align-items: center;
  gap: 0.75rem; 
}

/* Group for Edit button (only one button now) */
.action-group {
    display: flex;
    gap: 0.75rem;
}

.card-btn-base {
  padding: 0.35rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 0.15s;
  cursor: pointer;
  border: 1px solid transparent; /* Ensure consistent height */
}
.card-btn-edit {
  color: #4f46e5; /* indigo-600 */
  border-color: #4f46e5;
  background-color: transparent;
}
.card-btn-edit:hover {
  background-color: #eef2ff; /* indigo-50 */
}
.card-btn-view-toggle {
  color: #4f46e5; /* indigo-600 */
  background-color: #eef2ff; /* indigo-50 */
  border: none;
  font-weight: 600;
  padding: 0.5rem 1rem; /* Slightly larger button */
  display: flex;
  align-items: center;
  border-color: transparent;
}
.card-btn-view-toggle:hover {
    background-color: #c7d2fe; /* indigo-200 */
}
.card-btn-view-toggle svg {
    margin-left: 0.5rem;
    width: 16px;
    height: 16px;
}
/* Ensure the action group justifies to the right when only one button is present */
.card-actions {
    justify-content: space-between;
}


/* --- Status Badge Styles (Utility) --- */
.badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem; /* text-xs */
  font-weight: 600;
  border-radius: 9999px; /* rounded-full */
}
.badge-published {
  background-color: #d1fae5; /* green-100 */
  color: #065f46; /* green-800 */
}
.badge-draft {
  /* Yellowish/amber color */
  background-color: #fef9c3; /* yellow-100 */
  color: #a16207; /* yellow-700 */
}
.badge-pending {
  /* NEW: Blue color for Pending (blue-50/700) */
  background-color: #eff6ff; 
  color: #1d4ed8; 
}
.badge-default {
  background-color: #f3f4f6; /* gray-100 */
  color: #374151; /* gray-800 */
}

/* --- Empty State --- */
.empty-state {
  text-align: center;
  padding: 3rem 0; /* py-12 */
  background-color: white;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6; /* gray-100 */
}
.empty-state p {
  font-size: 1.125rem; /* text-lg */
  color: #4b5563; /* gray-600 */
}
`;


// --- Dummy Data (Used for Initial State) ---
const INITIAL_WORKSHOPS = [
  {
    id: 1,
    title: 'Advanced React Hooks Masterclass',
    description: 'Deep dive into custom hooks, memoization, and performance optimization in React.',
    fullAgenda: 'Module 1: Custom Hooks. Module 2: Memoization. Module 3: State Management. Module 4: Performance optimization.',
    location: 'GUC Cairo',
    startDate: '2025-11-15',
    startTime: '10:00 AM',
    endDate: '2025-11-15',
    endTime: '12:00 PM',
    duration: '2 hours',
    facultyResponsible: 'MET',
    professors: ['Dr. Sarah Johnson'],
    capacity: 60,
    attendees: 45,
    registrationDeadline: '2025-11-10',
    requiredBudget: '15,000 EGP',
    fundingSource: 'GUC',
    extraResources: 'Laptop with Node.js installed, React development environment.',
    status: 'Published',
  },
  {
    id: 2,
    title: 'Tailwind CSS for Rapid Prototyping',
    description: 'Learn utility-first CSS principles to build beautiful, responsive UIs quickly.',
    fullAgenda: 'Section 1: Setup. Section 2: Utility-First. Section 3: Responsive Design. Section 4: Customization.',
    location: 'GUC Berlin',
    startDate: '2025-12-01',
    startTime: '2:00 PM',
    endDate: '2025-12-01',
    endTime: '3:30 PM',
    duration: '1.5 hours',
    facultyResponsible: 'IET',
    professors: ['Prof. Max Schmidt'],
    capacity: 30,
    attendees: 0,
    registrationDeadline: '2025-11-25',
    requiredBudget: '5,000 EUR',
    fundingSource: 'External',
    extraResources: 'None.',
    status: 'Draft',
  },
  {
    id: 3,
    title: 'Introduction to Serverless Functions (Cloud)',
    description: 'A beginner-friendly guide to deploying backend logic without managing servers.',
    fullAgenda: 'Part 1: Concepts. Part 2: Setup (AWS Lambda/Firebase). Part 3: Deploying a simple function.',
    location: 'GUC Cairo',
    startDate: '2026-01-10',
    startTime: '9:00 AM',
    endDate: '2026-01-10',
    endTime: '12:00 PM',
    duration: '3 hours',
    facultyResponsible: 'MET',
    professors: ['Dr. Mona Helmy', 'Eng. Youssef Fayed'],
    capacity: 100,
    attendees: 12,
    registrationDeadline: '2026-01-05',
    requiredBudget: '20,000 EGP',
    fundingSource: 'GUC',
    extraResources: 'AWS or GCP free tier account.',
    status: 'Pending', 
  },
  {
    id: 4,
    title: 'State Management with Zustand',
    description: 'Explore a minimalistic and highly effective state management library for React.',
    fullAgenda: 'Lesson 1: Stores. Lesson 2: Middleware. Lesson 3: Asynchronous Actions.',
    location: 'GUC Cairo',
    startDate: '2026-02-05',
    startTime: '4:30 PM',
    endDate: '2026-02-05',
    endTime: '5:30 PM',
    duration: '1 hour',
    facultyResponsible: 'MET',
    professors: ['Dr. Sarah Johnson'],
    capacity: 120,
    attendees: 78,
    registrationDeadline: '2026-02-01',
    requiredBudget: '8,000 EGP',
    fundingSource: 'External',
    extraResources: 'None.',
    status: 'Published',
  },
  {
    id: 5,
    title: 'Design Principles for Developers',
    description: 'A practical session on typography, color theory, and layout for better UIs.',
    fullAgenda: 'Topic 1: Typography. Topic 2: Color Theory. Topic 3: Spacing and Layout. Topic 4: Accessibility basics.',
    location: 'GUC Berlin',
    startDate: '2026-03-20',
    startTime: '1:00 PM',
    endDate: '2026-03-20',
    endTime: '3:00 PM',
    duration: '2 hours',
    facultyResponsible: 'ART',
    professors: ['Prof. Elias Weber'],
    capacity: 40,
    attendees: 55, 
    registrationDeadline: '2026-03-15',
    requiredBudget: '12,000 EUR',
    fundingSource: 'GUC',
    extraResources: 'Figma or Sketch account (optional).',
    status: 'Draft',
  },
];

// --- Utility Components ---

const StatusBadge = ({ status }) => {
  let colorClass = '';

  switch (status) {
    case 'Published':
      colorClass = 'badge-published';
      break;
    case 'Draft':
      colorClass = 'badge-draft';
      break;
    case 'Pending': // Uses the new blue color
      colorClass = 'badge-pending';
      break;
    default:
      colorClass = 'badge-default';
  }

  return (
    <span className={`badge ${colorClass}`}>
      {status}
    </span>
  );
};

// Icons (using inline SVG for single-file component)
const IconMap = {
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
    <h4>
        {icon}
        {title}
    </h4>
);

const WorkshopCard = ({ workshop, onEdit }) => { 
  // State to manage card expansion
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to determine the status border class
  const getBorderClass = (status) => {
    switch (status) {
      case 'Published':
        return 'card-border-published';
      case 'Draft':
        return 'card-border-draft';
      case 'Pending': 
        return 'card-border-pending';
      default:
        return '';
    }
  };

  const borderClass = getBorderClass(workshop.status);

  return (
    <div className={`workshop-card ${borderClass}`}>
      <div className="card-header">
        <h3 className="card-title">
          {workshop.title}
        </h3>
        <StatusBadge status={workshop.status} />
      </div>
      <p className="card-description">{workshop.description}</p>
      
      {/* Container for details. Only the first group is visible when not expanded. */}
      <div className={`card-details-container ${isExpanded ? 'expanded' : ''}`}>
          
          {/* FACULTY & LOGISTICS (ALWAYS VISIBLE - GROUP 1) */}
          <div className="card-details-group">
              <DetailSectionHeader 
                  title="Faculty & Logistics" 
                  icon={IconMap.People}
              />
              <p><strong>Responsible Faculty:</strong> {workshop.facultyResponsible}</p>
              <p><strong>Professors:</strong> {workshop.professors.join(', ')}</p>
              <p><strong>Capacity:</strong> {workshop.attendees} / {workshop.capacity}</p>
              <p><strong>Required Resources:</strong> {workshop.extraResources}</p>
          </div>

          {/* HIDDEN DETAILS (LOCATION, AGENDA, FINANCE) - Visible when expanded */}
          {isExpanded && (
            <>
                {/* LOCATION & DATES */}
                <div className="card-details-group">
                    <DetailSectionHeader 
                        title="Location & Dates" 
                        icon={IconMap.Location}
                    />
                    <p><strong>Campus:</strong> {workshop.location}</p>
                    <p><strong>Start:</strong> {workshop.startDate} @ {workshop.startTime}</p>
                    <p><strong>End:</strong> {workshop.endDate} @ {workshop.endTime}</p>
                    <p><strong>Duration:</strong> {workshop.duration}</p>
                    <p><strong>Reg. Deadline:</strong> {workshop.registrationDeadline}</p>
                </div>
              
                {/* AGENDA */}
                <div className="card-details-group">
                    <DetailSectionHeader 
                        title="Agenda Summary" 
                        icon={IconMap.Agenda}
                    />
                    <p>{workshop.fullAgenda}</p>
                </div>

                {/* FINANCE */}
                <div className="card-details-group">
                    <DetailSectionHeader 
                        title="Finance" 
                        icon={IconMap.Finance}
                    />
                    <p><strong>Required Budget:</strong> {workshop.requiredBudget}</p>
                    <p><strong>Funding Source:</strong> {workshop.fundingSource}</p>
                </div>
            </>
          )}
      </div>

      {/* Card Actions (Toggle Button and Action buttons) */}
      <div className="card-actions">
        
        {/* Toggle Button */}
        <button 
          className="card-btn-base card-btn-view-toggle" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
          {isExpanded ? IconMap.ChevronUp : IconMap.ChevronDown}
        </button>

        {/* Edit Button is now the only action button */}
        <div className="action-group">
            <button 
                className="card-btn-base card-btn-edit" 
                onClick={() => onEdit(workshop.id, workshop.title)} 
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
  const [workshops, setWorkshops] = useState(INITIAL_WORKSHOPS); 

  // Handler for starting the edit process
  const handleEditWorkshop = useCallback((id, title) => {
    console.log(`[EDIT ACTION] Attempting to edit workshop ID: ${id} (${title})`);
    alert(`[ACTION] Editing workshop: ${title}. Check the console for ID.`);
  }, []);


  const filteredWorkshops = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    // Use the state variable for filtering
    const results = workshops.filter(workshop =>
      workshop.title.toLowerCase().includes(searchLower) ||
      workshop.description.toLowerCase().includes(searchLower) ||
      workshop.location.toLowerCase().includes(searchLower) ||
      workshop.facultyResponsible.toLowerCase().includes(searchLower)
    );
    
    // Sort by date (oldest first)
    return results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); 
  }, [searchTerm, workshops]); 

  return (
    <div className="container">
      {/* Inject Styles */}
      <style>{styles}</style>
      
      {/* Page Header and Actions */}
      <div className="max-w-7xl header-area">
        <div className="header-content">
          <h1 className="title">
            My Workshops Dashboard
          </h1>
          <button
            className="create-button"
            onClick={() => alert('New Workshop creation initiated (placeholder).')}
          >
            {/* Plus icon (Inline SVG for simplicity) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Workshop
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search workshops by title, description, location, or faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="max-w-7xl">
        {filteredWorkshops.length === 0 ? (
          <div className="empty-state">
            <p>
              No workshops found matching your search term.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard 
                key={workshop.id} 
                workshop={workshop} 
                onEdit={handleEditWorkshop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workshops;
