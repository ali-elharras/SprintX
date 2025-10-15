
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import theme, { getEventTypeColor } from "../theme";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import ConferenceModal from "./ConferenceModal";
import LoadingScreen from "../components/LoadingScreen";
import api, { eventAPI, workshopAPI, createCancelTokenSource } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import CreateDropdownButton from '../components/CreateDropdownButton';

// --- Modal Styles (copied from CreateWorkshop.js) ---
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
    fontSize: '1.5rem', fontWeight: 800, color: theme.colors.primary, marginBottom: '1rem', textAlign: 'center',
  },
  label: {
    fontWeight: 600, color: theme.colors.text.primary, marginBottom: '0.25rem', fontSize: '1rem',
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
    backgroundColor: theme.colors.primary, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
    fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem',
    boxShadow: '0 2px 6px rgba(79,70,229,0.15)', transition: 'background 0.2s',
  },
  cancelButton: {
    backgroundColor: theme.colors.background.default, color: theme.colors.text.primary, padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
    fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem',
  }
};

function CreateWorkshopModal({ open, onClose, onCreated, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState(initialData ? {
    workshopName: initialData.workshopName || initialData.name || '',
    location: initialData.location || 'GUC Cairo',
    startDate: initialData.startDate ? initialData.startDate.slice(0, 16) : '',
    endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : '',
    shortDescription: initialData.shortDescription || '',
    fullAgenda: initialData.fullAgenda || '',
    facultyResponsible: initialData.facultyResponsible || 'MET',
    professors: initialData.professorsParticipating ? initialData.professorsParticipating.join(', ') : (initialData.professors || ''),
    requiredBudget: initialData.requiredBudget ? String(initialData.requiredBudget) : '',
    fundingSource: initialData.fundingSource || 'GUC',
    extraResources: initialData.extraRequiredResources || '',
    capacity: initialData.capacity ? String(initialData.capacity) : '',
    registrationDeadline: initialData.registrationDeadline ? initialData.registrationDeadline.slice(0, 16) : '',
  } : {
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
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData(initialData ? {
        workshopName: initialData.workshopName || initialData.name || '',
        location: initialData.location || 'GUC Cairo',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 16) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : '',
        shortDescription: initialData.shortDescription || '',
        fullAgenda: initialData.fullAgenda || '',
        facultyResponsible: initialData.facultyResponsible || 'MET',
        professors: initialData.professorsParticipating ? initialData.professorsParticipating.join(', ') : (initialData.professors || ''),
        requiredBudget: initialData.requiredBudget ? String(initialData.requiredBudget) : '',
        fundingSource: initialData.fundingSource || 'GUC',
        extraResources: initialData.extraRequiredResources || '',
        capacity: initialData.capacity ? String(initialData.capacity) : '',
        registrationDeadline: initialData.registrationDeadline ? initialData.registrationDeadline.slice(0, 16) : '',
      } : {
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
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [open, initialData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const professorsArray = formData.professors
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    const payload = {
      workshopName: formData.workshopName,
      shortDescription: formData.shortDescription,
      fullAgenda: formData.fullAgenda,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      facultyResponsible: formData.facultyResponsible,
      professorsParticipating: professorsArray,
      capacity: Number(formData.capacity),
      registrationDeadline: formData.registrationDeadline,
      requiredBudget: Number(formData.requiredBudget),
      fundingSource: formData.fundingSource,
      extraRequiredResources: formData.extraResources,
    };
    try {
      let response;
      if (isEdit && initialData && initialData._id) {
        // Only send changed fields for PATCH
        const changedFields = {};
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== (initialData[key] || (key === 'professorsParticipating' ? initialData.professorsParticipating : undefined))) {
            changedFields[key] = payload[key];
          }
        });
        response = await workshopAPI.updateWorkshop(initialData._id, changedFields);
        if (response.status === 200 || response.data?.success) {
          setIsSubmitting(false);
          setErrorMsg('');
          onCreated && onCreated();
          onClose();
          toast.success('Workshop updated successfully!');
        } else {
          throw new Error(response.data?.message || 'Failed to update workshop');
        }
      } else {
        response = await workshopAPI.createWorkshop(payload);
        if (response.status === 201 || response.data?.success) {
          setIsSubmitting(false);
          setErrorMsg('');
          onCreated && onCreated();
          onClose();
          toast.success('Workshop created successfully!');
        } else {
          throw new Error(response.data?.message || 'Failed to create workshop');
        }
      }
    } catch (error) {
      setErrorMsg(error.message || (isEdit ? 'Failed to update workshop' : 'Failed to create workshop'));
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={{ ...modalStyles.overlay }}>
      <div style={{ ...modalStyles.container, width: '900px', maxWidth: '98vw' }}>
        <div style={modalStyles.title}>{isEdit ? 'Edit Workshop' : 'Create Workshop'}</div>
        {errorMsg && (
          <div style={{ color: theme.colors.text.danger, background: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={modalStyles.label}>Workshop Name</label>
          <input
            style={modalStyles.input}
            name="workshopName"
            value={formData.workshopName}
            onChange={handleChange}
            placeholder="Workshop Name"
          />
          <label style={modalStyles.label}>Short Description</label>
          <textarea
            style={modalStyles.textarea}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Short Description"
            maxLength={200}
          />
          <label style={modalStyles.label}>Full Agenda</label>
          <textarea
            style={modalStyles.textarea}
            name="fullAgenda"
            value={formData.fullAgenda}
            onChange={handleChange}
            placeholder="Full Agenda"
          />
          <label style={modalStyles.label}>Location</label>
          <select
            style={modalStyles.input}
            name="location"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="GUC Cairo">GUC Cairo</option>
            <option value="GUC Berlin">GUC Berlin</option>
          </select>
          <label style={modalStyles.label}>Start Date</label>
          <input
            style={modalStyles.input}
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
          <label style={modalStyles.label}>End Date</label>
          <input
            style={modalStyles.input}
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
          <label style={modalStyles.label}>Faculty Responsible</label>
          <select
            style={modalStyles.input}
            name="facultyResponsible"
            value={formData.facultyResponsible}
            onChange={handleChange}
          >
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
            name="professors"
            value={formData.professors}
            onChange={handleChange}
            placeholder="Professors Participating"
          />
          <label style={modalStyles.label}>Capacity</label>
          <input
            style={modalStyles.input}
            type="number"
            name="capacity"
            min={1}
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Capacity"
          />
          <label style={modalStyles.label}>Registration Deadline</label>
          <input
            style={modalStyles.input}
            type="datetime-local"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
          />
          <label style={modalStyles.label}>Extra Required Resources</label>
          <textarea
            style={modalStyles.textarea}
            name="extraResources"
            value={formData.extraResources}
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
            value={formData.requiredBudget}
            onChange={handleChange}
            placeholder="Required Budget"
          />
          <label style={modalStyles.label}>Funding Source</label>
          <select
            style={modalStyles.input}
            name="fundingSource"
            value={formData.fundingSource}
            onChange={handleChange}
          >
            <option value="GUC">GUC</option>
            <option value="External">External</option>
            <option value="Joint">Joint</option>
          </select>
          <button type="submit" style={modalStyles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : (isEdit ? 'Save Changes' : 'Create Workshop')}
          </button>
          <button type="button" style={modalStyles.cancelButton} onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>,
    document.body
  );
}

const BazaarManagementCard = ({ bazaar, onEdit, onDelete }) => {
  const cardStyle = {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.card,
    boxShadow: theme.shadows.card,
    overflow: "hidden",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${getEventTypeColor('bazaar')} 0%, ${getEventTypeColor('bazaar')}dd 100%)`,
    padding: theme.spacing[4],
    color: theme.colors.text.white,
  };

  const labelStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: 'inline-block',
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.tight,
    margin: 0,
    marginTop: theme.spacing[2],
  };

  const now = new Date();
  const hasStarted = new Date(bazaar.startDate) <= now;
  const hasEnded = new Date(bazaar.endDate) < now;

  return (
    <div style={cardStyle}>
      <div>
        <div style={headerStyle}>
          <div style={labelStyle}>
            Bazaar
          </div>
          <h3 style={titleStyle}>
            {bazaar.title || bazaar.name}
          </h3>
        </div>

        <div style={{ padding: theme.spacing[5] }}>
          <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: theme.typography.fontSize.sm }}>
            {new Date(bazaar.startDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <p style={{ color: theme.colors.text.secondary, margin: `${theme.spacing[1]} 0`, fontSize: theme.typography.fontSize.sm }}>
            📍 {bazaar.location}
          </p>
          <p style={{ color: theme.colors.text.primary, marginTop: theme.spacing[4], fontSize: theme.typography.fontSize.base, maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {bazaar.description}
          </p>
        </div>
      </div>

      <div style={{ padding: `0 ${theme.spacing[5]} ${theme.spacing[5]}` }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          color: theme.colors.text.secondary, 
          fontSize: theme.typography.fontSize.sm, 
          marginBottom: theme.spacing[4], 
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: theme.spacing[4] 
        }}>
          <span>Participants</span>
          <span style={{ fontWeight: "bold" }}>
            {bazaar.currentParticipants} / {bazaar.maxParticipants}
          </span>
        </div>
        <div style={{ display: "flex", gap: theme.spacing[2], width: "100%" }}>
          {!hasStarted ? (
            <>
              <Button variant="primary" onClick={() => onEdit(bazaar)} style={{ flex: 1 }}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(bazaar._id)} style={{ flex: 1 }}>
                Delete
              </Button>
            </>
          ) : hasEnded ? (
            <Button variant="secondary" disabled style={{ width: "100%" }}>
              Event Ended
            </Button>
          ) : (
            <Button variant="secondary" disabled style={{ width: "100%" }}>
              Event Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const navigate = useNavigate();
  const { isEventsOffice } = useAuth();
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [editingConference, setEditingConference] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    upcoming: false,
  });

  const cancelTokenRef = useRef(null);

  const [pendingWorkshops, setPendingWorkshops] = useState([]);
  const [showCreateWorkshopModal, setShowCreateWorkshopModal] = useState(false);
  const [editWorkshopModalOpen, setEditWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

  const [selectedPending, setSelectedPending] = useState(null);
  const [publishCandidate, setPublishCandidate] = useState(null);
  const [rejectCandidate, setRejectCandidate] = useState(null);
  const [requestEditsCandidate, setRequestEditsCandidate] = useState(null);
  const [requestEditsMessage, setRequestEditsMessage] = useState("");

  const [createBazaarOpen, setCreateBazaarOpen] = useState(false);
  const [bazaarData, setBazaarData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "University Courtyard",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  const [editingBazaar, setEditingBazaar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBazaarData, setEditBazaarData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    theme: "",
    maxParticipants: "50",
    registrationDeadline: "",
  });

  const fetchEvents = async () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled due to new request');
    }

    cancelTokenRef.current = createCancelTokenSource();
    const currentCancelToken = cancelTokenRef.current;

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching events...");
      const response = await eventAPI.getEvents(
        { upcoming: "false" },
        currentCancelToken
      );
      
      console.log("API Response:", response);
      console.log("Events data:", response.data?.data);
      
      let allEvents = response.data?.data || [];
      
      const visibleStatuses = ["published", "accepted", "approved", "upcoming", "active", "completed", "pending", "needs_revision"];
      allEvents = allEvents.filter(event => visibleStatuses.includes(event.status));
      
      // Don't filter out published workshops - they should be visible to all users for registration
      // Only filter out non-published workshops (pending, needs_revision, rejected)
      allEvents = allEvents.filter(event => {
        if (event.type !== 'workshop') return true; // Keep all non-workshop events
        // For workshops: only show published ones to regular users
        // Events Office will see pending workshops in a separate section
        if (auth?.isEventsOffice) return event.status === 'published'; // Events Office sees published workshops in main grid
        return event.status === 'published'; // All other users (students, staff, TAs, professors) see published workshops
      });
      
      console.log("Filtered events:", allEvents);

      // Fetch workshops for Events Office (pending approvals)
      if (auth?.isEventsOffice) {
        try {
          const [pendingResp, revisionResp, userBazaarsResponse] = await Promise.all([
            api.get('/workshops?status=pending', {
              cancelToken: currentCancelToken.token
            }),
            api.get('/workshops?status=needs_revision', {
              cancelToken: currentCancelToken.token
            }),
            api.get('/bazaars', {
              cancelToken: currentCancelToken.token
            })
          ]);
          
          const pendingWorkshopsData = pendingResp.data || [];
          const revisionWorkshops = revisionResp.data || [];
          
          setPendingWorkshops([...pendingWorkshopsData, ...revisionWorkshops]);

          const allBazaars = userBazaarsResponse.data?.data || [];
          const userBazaars = allBazaars.filter(bazaar => {
            const isOwner = (typeof bazaar.organizer === "object" && bazaar.organizer?._id === auth.user?.id) || (typeof bazaar.organizer === "string" && bazaar.organizer === auth.user?.id);
            return isOwner;
          });

          const eventsMap = new Map();
          allEvents.forEach(event => eventsMap.set(event._id, event));
          userBazaars.forEach(bazaar => eventsMap.set(bazaar._id, bazaar));

          allEvents = Array.from(eventsMap.values());

        } catch (err) {
          if (!err.isCancelled && err.name !== 'CanceledError') {
            console.warn('Could not fetch additional Events Office data', err);
          }
        }
      }

      // Fetch workshops for Professors (their own workshops with all statuses)
      if (auth?.user?.role === 'professor') {
        try {
          const workshopsResponse = await api.get('/workshops', {
            cancelToken: currentCancelToken.token
          });
          
          const allWorkshops = workshopsResponse.data || [];
          // Filter to show only workshops created by this professor
          const myWorkshops = allWorkshops.filter(workshop => {
            const isOwner = (typeof workshop.createdBy === "object" && workshop.createdBy?._id === auth.user?.id) || 
                           (typeof workshop.createdBy === "string" && workshop.createdBy === auth.user?.id);
            return isOwner;
          });
          
          setProfessorWorkshops(myWorkshops);
        } catch (err) {
          if (!err.isCancelled && err.name !== 'CanceledError') {
            console.warn('Could not fetch professor workshops', err);
          }
        }
      }
      
      setEvents(allEvents);

    } catch (err) {
      if (err.isCancelled || err.name === 'CanceledError') {
        return;
      }
      
      console.error("Fetch error:", err);
      setError(err);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    const handleStorageChange = (e) => {
      if (e.key === 'workshop_deleted' && e.newValue) {
        console.log('Workshop deleted in another tab, refreshing events...');
        fetchEvents();
        localStorage.removeItem('workshop_deleted');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      
      if (cancelTokenRef.current) {
        try {
          cancelTokenRef.current.cancel('Component unmounting');
        } catch (error) {
          // Ignore cancellation errors
        }
      }
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const applyFilters = () => {
    let filtered = [...events];
    
    if (filters.type) {
      filtered = filtered.filter((e) => e.type === filters.type);
    }
    
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((e) => {
        const title = (e.title || e.name || "").toLowerCase();
        const description = (e.description || "").toLowerCase();
        const location = (e.location || "").toLowerCase();
        const instructor = (e.instructor || e.professorName || "").toLowerCase();
        
        return (
          title.includes(s) ||
          description.includes(s) ||
          location.includes(s) ||
          instructor.includes(s)
        );
      });
    }
    
    if (filters.upcoming) {
      const now = new Date();
      filtered = filtered.filter((e) => new Date(e.startDate) > now);
    }
    
    setFilteredEvents(filtered);
  };

  // Workshop Action Handlers
  const handleEditWorkshop = useCallback((id, title) => {
    const workshop = professorWorkshops.find(w => (w._id || w.id) === id);
    setEditingWorkshop(workshop);
    setEditWorkshopModalOpen(true);
  }, [professorWorkshops]);

  const handleWorkshopModalSubmit = async (changedFields) => {
    if (!editingWorkshop || !editingWorkshop._id) return;
    setWorkshopsLoading(true);
    setWorkshopsError(null);
    try {
      const updatedFields = { ...changedFields };
      if (editingWorkshop.status === 'needs_revision') {
        updatedFields.status = 'pending';
      }
      
      await api.patch(`/workshops/${editingWorkshop._id}`, updatedFields);
      
      if (editingWorkshop.status === 'needs_revision') {
        toast.success('✅ Workshop resubmitted successfully! It is now pending approval from the Events Office.');
      } else {
        toast.success('Workshop updated successfully!');
      }
      
      setEditWorkshopModalOpen(false);
      setEditingWorkshop(null);
      fetchEvents();
    } catch (e) {
      setWorkshopsError(e.message || 'Failed to update workshop');
      toast.error(e.message || 'Failed to update workshop');
    } finally {
      setWorkshopsLoading(false);
    }
  };

  const handleDeleteWorkshop = useCallback(async (id, title) => {
    setDeleteWorkshopCandidate({ id, title });
  }, []);

  const confirmDeleteWorkshop = async () => {
    const { id, title } = deleteWorkshopCandidate;
    setDeleteWorkshopCandidate(null);
    setWorkshopsError(null);
    setWorkshopsLoading(true);
    try {
      await api.delete(`/workshops/${id}`);
      localStorage.setItem('workshop_deleted', Date.now().toString());
      toast.success('Workshop deleted successfully!');
      fetchEvents();
    } catch (e) {
      console.error('Delete error:', e);
      
      // Check if the error is due to existing registrations
      const errorMessage = e.response?.data?.message || e.message;
      
      if (errorMessage.includes('students have already registered')) {
        setWorkshopsError('Cannot delete workshop - students have already registered');
        toast.error('Cannot delete workshop - students have already registered', { duration: 5000 });
      } else {
        setWorkshopsError(`Could not delete workshop. Error: ${errorMessage}`);
        toast.error(`Could not delete workshop. Error: ${errorMessage}`);
      }
      setWorkshopsLoading(false);
    }
  };

  const filteredProfessorWorkshops = useMemo(() => {
    if (!auth?.user?.role === 'professor') return [];
    const searchLower = workshopSearchTerm.toLowerCase();
    const results = professorWorkshops.filter(workshop => {
      if (!workshop) return false;
      const nameMatch = workshop.workshopName && workshop.workshopName.toLowerCase().includes(searchLower);
      const descriptionMatch = workshop.shortDescription && workshop.shortDescription.toLowerCase().includes(searchLower);
      const locationMatch = workshop.location && workshop.location.toLowerCase().includes(searchLower);
      const facultyMatch = workshop.facultyResponsible && workshop.facultyResponsible.toLowerCase().includes(searchLower);
      const statusMatch = workshop.status && workshop.status.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch || locationMatch || facultyMatch || statusMatch;
    });
    return results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); 
  }, [workshopSearchTerm, professorWorkshops, auth]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegistrationSuccess = () => {
    fetchEvents();
  };

  const handleDeleteBazaar = async (bazaarId) => {
    if (!window.confirm("Are you sure you want to permanently delete this bazaar?")) {
      return;
    }
    try {
      await api.delete(`/bazaars/${bazaarId}`);
      toast.success("Bazaar deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete bazaar:", error);
      toast.error(error.response?.data?.message || "Failed to delete bazaar.");
    }
  };

  const handleOpenEditModal = (bazaar) => {
    const formatForInput = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };
    setEditingBazaar(bazaar);
    setEditBazaarData({
      title: bazaar.title || bazaar.name,
      description: bazaar.description,
      startDate: formatForInput(bazaar.startDate),
      endDate: formatForInput(bazaar.endDate),
      location: bazaar.location,
      theme: bazaar.tags?.join(", ") || "",
      maxParticipants: bazaar.maxParticipants?.toString() || "50",
      registrationDeadline: formatForInput(bazaar.registrationDeadline),
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBazaar(null);
  };

  const handleUpdateBazaar = async () => {
    if (!editingBazaar) return;
    if (
      !editBazaarData.title ||
      !editBazaarData.description ||
      !editBazaarData.startDate ||
      !editBazaarData.endDate ||
      !editBazaarData.registrationDeadline ||
      !editBazaarData.theme ||
      !editBazaarData.location ||
      !editBazaarData.maxParticipants
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (
      new Date(editBazaarData.registrationDeadline) >= 
      new Date(editBazaarData.startDate)
    ) {
      toast.error("Registration deadline must be before the event's start date.");
      return;
    }
    try {
      const updatedEventData = {
        title: editBazaarData.title,
        description: editBazaarData.description,
        startDate: new Date(editBazaarData.startDate).toISOString(),
        endDate: new Date(editBazaarData.endDate).toISOString(),
        location: editBazaarData.location,
        maxParticipants: Number(editBazaarData.maxParticipants),
        registrationDeadline: new Date(editBazaarData.registrationDeadline).toISOString(),
        tags: editBazaarData.theme ? [editBazaarData.theme] : [],
      };
      await api.put(`/bazaars/${editingBazaar._id}`, updatedEventData);
      toast.success("Bazaar updated successfully!");
      handleCloseEditModal();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bazaar.");
    }
  };

  const eventTypeOptions = [
    { value: "", label: "All Types" },
    { value: "workshop", label: "Workshops" },
    { value: "trip", label: "Trips" },
    { value: "bazaar", label: "Bazaars" },
    { value: "booth", label: "Booths" },
    { value: "conference", label: "Conferences" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: theme.colors.background.default }}>
      <Navbar />
      <LoadingScreen type="events" />
      <CreateWorkshopModal open={showCreateWorkshopModal} onClose={() => setShowCreateWorkshopModal(false)} onCreated={fetchEvents} />
      {editWorkshopModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '900px',
            maxWidth: '98vw',
            background: 'white',
            borderRadius: '1rem',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CreateWorkshopModal
              open={true}
              onClose={() => { setEditWorkshopModalOpen(false); setEditingWorkshop(null); }}
              onCreated={fetchEvents}
              initialData={editingWorkshop}
              isEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          animation: "slide-down 0.3s ease-out",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 20000,
          display: "flex",
          justifyContent: "center",
          paddingTop: theme.spacing[6],
        }}
        onClick={handleCloseEditModal}
      >
        <div
          style={{
            width: "800px",
            maxWidth: "95%",
            background: theme.colors.background.paper,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            padding: theme.spacing[6],
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4] }}>
            Edit Bazaar
          </h2>
          <div style={{ display: "grid", gap: theme.spacing[4] }}>
            <Input
              label="Bazaar Name *"
              value={editBazaarData.title}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, title: e.target.value })
              }
            />
            <Input
              label="Theme *"
              value={editBazaarData.theme}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, theme: e.target.value })
              }
            />
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing[2],
                  color: theme.colors.text.secondary,
                }}
              >
                Description *
              </label>
              <textarea
                rows="4"
                value={editBazaarData.description}
                onChange={(e) =>
                  setEditBazaarData({ ...editBazaarData, description: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: theme.spacing[3],
                  fontSize: theme.typography.fontSize.base,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.base,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing[4],
              }}
            >
              <Input
                label="Start Date *"
                type="datetime-local"
                value={editBazaarData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  const updatedData = {
                    ...editBazaarData,
                    startDate: newStartDate,
                  };
                  if (updatedData.endDate && newStartDate > updatedData.endDate)
                    updatedData.endDate = "";
                  if (
                    updatedData.registrationDeadline &&
                    newStartDate <= updatedData.registrationDeadline
                  )
                    updatedData.registrationDeadline = "";
                  setEditBazaarData(updatedData);
                }}
              />
              <Input
                label="End Date *"
                type="datetime-local"
                value={editBazaarData.endDate}
                min={editBazaarData.startDate}
                onChange={(e) =>
                  setEditBazaarData({ ...editBazaarData, endDate: e.target.value })
                }
              />
            </div>
            <Input
              label="Location *"
              value={editBazaarData.location}
              onChange={(e) =>
                setEditBazaarData({ ...editBazaarData, location: e.target.value })
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing[4],
              }}
            >
              <Input
                label="Max Participants *"
                type="number"
                min="1"
                value={editBazaarData.maxParticipants}
                onChange={(e) =>
                  setEditBazaarData({
                    ...editBazaarData,
                    maxParticipants: e.target.value,
                  })
                }
              />
              <Input
                label="Registration Deadline *"
                type="datetime-local"
                value={editBazaarData.registrationDeadline}
                max={editBazaarData.startDate}
                onChange={(e) =>
                  setEditBazaarData({
                    ...editBazaarData,
                    registrationDeadline: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing[3],
              marginTop: theme.spacing[5],
            }}
          >
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateBazaar}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.default,
          padding: theme.spacing[6],
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: theme.spacing[8] }}>
            <h1
              style={{
                fontSize: theme.typography.fontSize["3xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
                textAlign: "center",
              }}
            >
              University Events
            </h1>
            <p
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary,
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Discover and register for workshops, trips, and other exciting events
              happening at our university.
            </p>
          </div>

          {/* Professor's Own Workshops Dashboard */}
          {auth?.user?.role === 'professor' && professorWorkshops.length > 0 && (
            <div style={{ marginBottom: theme.spacing[6], backgroundColor: '#f9fafb', padding: theme.spacing[5], borderRadius: theme.borderRadius.lg }}>
              <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: theme.spacing[6] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[4] }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: themeColors.gray900, margin: 0 }}>
                    My Workshops Dashboard
                  </h2>
                  <button
                    style={{ 
                      display: 'flex', alignItems: 'center', backgroundColor: themeColors.indigo600, color: 'white', 
                      padding: '0.65rem 1.25rem', borderRadius: '0.75rem', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                    onClick={() => navigate('/create-workshop')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create New Workshop
                  </button>
                </div>

                <div style={{ marginTop: theme.spacing[4], marginBottom: theme.spacing[5] }}>
                  <input
                    type="text"
                    placeholder="Search workshops by title, description, location, or faculty..."
                    value={workshopSearchTerm}
                    onChange={(e) => setWorkshopSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', 
                      borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                      transition: 'border-color 0.15s, box-shadow 0.15s', fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
                {workshopsLoading && (
                  <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Loading workshops from database... ⏳</p>
                  </div>
                )}

                {workshopsError && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: themeColors.red50, borderRadius: '0.75rem', border: `1px solid ${themeColors.red600}` }}>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: themeColors.red600 }}>Error: {workshopsError}</p>
                  </div>
                )}

                {!workshopsLoading && !workshopsError && filteredProfessorWorkshops.length === 0 && workshopSearchTerm === '' ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>
                      No workshops found. Start by creating a new one!
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '1.5rem', 
                  }}>
                    {filteredProfessorWorkshops.map((workshop) => (
                      <WorkshopCard 
                        key={workshop._id || workshop.id} 
                        workshop={workshop} 
                        onEdit={handleEditWorkshop}
                        onDelete={handleDeleteWorkshop}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {auth.isEventsOffice && pendingWorkshops.length > 0 && (
            <div
              style={{
                background: theme.colors.background.paper,
                padding: theme.spacing[5],
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                marginBottom: theme.spacing[6],
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: theme.spacing[3],
                  color: theme.colors.text.primary,
                }}
              >
                Pending Workshop Approvals
              </h2>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
                These workshops were submitted by professors and are awaiting approval.
              </p>

              <div style={{ display: "grid", gap: theme.spacing[4] }}>
                {pendingWorkshops.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: theme.spacing[4],
                      borderRadius: theme.borderRadius.base,
                      background: theme.colors.background.default,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div style={{ maxWidth: "75%" }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[1] }}>
                        <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 600 }}>
                          {w.workshopName || w.name}
                        </div>
                        {w.status && <StatusBadge status={w.status} />}
                      </div>
                      <div style={{ color: theme.colors.text.secondary, marginTop: theme.spacing[1] }}>
                        <strong>Professor:</strong> {w.createdBy ? `${w.createdBy.firstName} ${w.createdBy.lastName}` : (w.professorName || 'N/A')} • <strong>Date:</strong>{" "}
                        {new Date(w.startDate).toLocaleString()} • <strong>Location:</strong> {w.location}
                      </div>
                      <div style={{ marginTop: theme.spacing[2], color: theme.colors.text.primary }}>
                        {w.shortDescription}
                      </div>
                      
                      {/* Show edit requests if any */}
                      {w.editRequests && w.editRequests.length > 0 && w.status === 'needs_revision' && (
                        <div style={{ 
                          marginTop: theme.spacing[2],
                          backgroundColor: '#fef3c7', 
                          border: '1px solid #fbbf24', 
                          borderRadius: theme.borderRadius.base, 
                          padding: theme.spacing[2]
                        }}>
                          <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: '#92400e', marginBottom: theme.spacing[1] }}>
                            ✏️ Edit Request Sent
                          </div>
                          {w.editRequests.map((editReq, index) => (
                            <div key={index}>
                              <p style={{ fontSize: theme.typography.fontSize.sm, color: '#78350f', margin: 0 }}>
                                <strong>Message:</strong> {editReq.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: theme.spacing[3] }}>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setPublishCandidate(w);
                        }}
                      >
                        Accept & Publish
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setSelectedPending(w)}
                      >
                        View Details
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setRequestEditsCandidate(w);
                          setRequestEditsMessage("");
                        }}
                      >
                        Request Edits
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => {
                          setRejectCandidate(w);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {requestEditsCandidate && (
            <div
              role="dialog"
              aria-modal="true"
                            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                zIndex: 10000,
              }}
              onClick={() => setRequestEditsCandidate(null)}
            >
              <div
                style={{
                  width: "560px",
                  maxWidth: "95%",
                  background: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[5],
                  boxShadow: theme.shadows.lg,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2] }}>
                  Request Edits for "{requestEditsCandidate.name}"
                </h3>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                  Provide a short message that will be sent back to the professor explaining what needs to be changed.
                </p>

                <Input
                  label="Edit message"
                  name="requestEditsMessage"
                  value={requestEditsMessage}
                  onChange={(e) => setRequestEditsMessage(e.target.value)}
                  placeholder="Please make the agenda clearer and include contact info..."
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setRequestEditsCandidate(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      const w = requestEditsCandidate;

                      if (!requestEditsMessage || requestEditsMessage.trim().length < 3) {
                        toast.error("Please enter a short message to request edits.");
                        return;
                      }

                      try {
                        // Fixed: Remove the undefined variables 'existing' and 'key'
                        // Store edit request in localStorage if needed
                        const editRequestsKey = 'workshop_edit_requests';
                        const existingRequests = JSON.parse(localStorage.getItem(editRequestsKey) || '{}');
                        
                        existingRequests[w.id || w._id || `local-${Date.now()}`] = {
                          eventId: w._id || w.id,
                          message: requestEditsMessage.trim(),
                          requestedBy: {
                            name: auth.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName}` : "Events Office",
                            id: auth.user?.id || null,
                          },
                          requestedAt: new Date().toISOString(),
                          status: "needs_revision",
                        };
                        
                        localStorage.setItem(editRequestsKey, JSON.stringify(existingRequests));
                      } catch (err) {
                        console.error("Failed to persist edit request locally:", err);
                      }

                      setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));

                      if (w._id) {
                        try {
                          await eventAPI.updateEventStatus(w._id, "needs_revision", requestEditsMessage.trim());
                          toast.success(`Requested edits for "${w.name}" (professor notified)`);
                          // Remove from pending list locally
                          setPendingWorkshops((prev) => prev.filter((p) => p._id !== w._id));

                          // Call backend API to request edits
                          await workshopAPI.requestEditWorkshop(w._id, requestEditsMessage.trim());
                          toast.success("Edit request sent successfully!");
                        } catch (err) {
                          console.error("Failed to send edit request:", err);
                          toast.error("Failed to send edit request. Please try again.");
                        }
                      } else {
                        toast.success("Edit request sent successfully!");
                      }

                      setRequestEditsCandidate(null);
                      setRequestEditsMessage("");
                    }}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[5],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              marginBottom: theme.spacing[6],
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto auto auto",
                gap: theme.spacing[4],
                alignItems: "end",
              }}
            >
              <Input
                label="Search Events"
                placeholder="Search by title, description, or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <Select
                label="Event Type"
                options={eventTypeOptions}
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
              <Button
                variant={filters.upcoming ? "primary" : "secondary"}
                onClick={() => handleFilterChange("upcoming", !filters.upcoming)}
              >
                {filters.upcoming ? "Upcoming Only" : "All Events"}
              </Button>
              <Button variant="outline" onClick={fetchEvents}>
                Refresh
              </Button>
              <CreateDropdownButton 
                onConferenceModalOpen={() => setShowConferenceModal(true)} 
                onBazaarModalOpen={() => setCreateBazaarOpen(true)} 
              />
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: theme.spacing[6],
              }}
            >
              {filteredEvents.map((event) => {
                const isOwner = (typeof event.organizer === "object" && event.organizer?._id === auth.user?.id) || (typeof event.organizer === "string" && event.organizer === auth.user?.id);
                if (event.type === 'bazaar' && auth.isEventsOffice && isOwner) {
                  return (
                    <BazaarManagementCard
                      key={event._id}
                      bazaar={event}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteBazaar}
                    />
                  );
                }
                if (event.type === 'workshop') {
                  return (
                    <div key={event._id} style={{ position: 'relative' }}>
                      {/* Purple strip */}
                      <div style={{ height: '8px', background: theme.colors.primary, borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }} />
                      {/* Edit button */}
                      <button
                        style={{ position: 'absolute', top: '100px', right: '16px', background: theme.colors.primary, color: 'black', border: 'none', borderRadius: '6px', padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', zIndex: 2 }}
                        onClick={() => { setEditingWorkshop(event); setEditWorkshopModalOpen(true); }}
                        title="Edit Workshop"
                      >
                        Edit
                      </button>
                      <EventCard
                        event={event}
                        onRegistrationSuccess={handleRegistrationSuccess}
                        onEventUpdate={fetchEvents}
                        onEditConference={(conference) => {
                          setEditingConference(conference);
                          setShowConferenceModal(true);
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <EventCard
                    key={event._id}
                    event={event}
                    onRegistrationSuccess={handleRegistrationSuccess}
                    onEventUpdate={fetchEvents}
                    onEditConference={(conference) => {
                      setEditingConference(conference);
                      setShowConferenceModal(true);
                    }}
                  />
                );
              })}
      {/* Edit Workshop Modal */}
      {editWorkshopModalOpen && (
        <CreateWorkshopModal
          open={editWorkshopModalOpen}
          onClose={() => { setEditWorkshopModalOpen(false); setEditingWorkshop(null); }}
          onCreated={fetchEvents}
          initialData={editingWorkshop}
          isEdit={true}
        />
      )}
            </div>
          ) : (
            <div
              style={{
                background: theme.colors.background.paper,
                padding: theme.spacing[12],
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize["4xl"],
                  marginBottom: theme.spacing[4],
                }}
              >
                📅
              </div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[2],
                }}
              >
                No Events Found
              </h3>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing[4],
                }}
              >
                {filters.search || filters.type
                  ? "Try adjusting your filters to see more events."
                  : "There are no events at the moment."}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ type: "", search: "", upcoming: false })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div
              style={{
                marginTop: theme.spacing[8],
                padding: theme.spacing[4],
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.base,
                textAlign: "center",
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Showing {filteredEvents.length} of {events.length} events
            </div>
          )}

          {error && !loading && filteredEvents.length === 0 && (
            <div
              style={{
                background: theme.colors.background.paper,
                padding: theme.spacing[8],
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                textAlign: "center",
                border: `2px solid ${theme.colors.status.error}`,
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize["2xl"],
                  marginBottom: theme.spacing[4],
                  color: theme.colors.status.error,
                }}
              >
                ⚠️
              </div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[2],
                }}
              >
                Failed to Load Events
              </h3>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing[4],
                }}
              >
                {error.message || "There was an error loading events. Please try again."}
              </p>
              <Button variant="primary" onClick={fetchEvents}>
                Retry
              </Button>
            </div>
          )}
          {selectedPending && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
                zIndex: 9999,
              }}
              onClick={() => setSelectedPending(null)}
            >
              <div
                style={{
                  width: "800px",
                  maxWidth: "95%",
                  maxHeight: "90%",
                  overflow: "auto",
                  background: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[6],
                  boxShadow: theme.shadows.lg,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0 }}>{selectedPending.workshopName || selectedPending.name}</h2>
                  <div style={{ display: "flex", gap: theme.spacing[3] }}>
                    <Button variant="outline" onClick={() => setSelectedPending(null)}>
                      Close
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: theme.spacing[4], color: theme.colors.text.secondary }}>
                  <p><strong>Professor / Instructor:</strong> {selectedPending.createdBy ? `${selectedPending.createdBy.firstName} ${selectedPending.createdBy.lastName}` : (selectedPending.professorName || selectedPending.instructor || 'N/A')}</p>
                  <p>
                    <strong>Date:</strong> {new Date(selectedPending.startDate).toLocaleString()} - {new Date(selectedPending.endDate).toLocaleString()}
                  </p>
                  <p><strong>Location:</strong> {selectedPending.location}</p>
                  <p style={{ marginTop: theme.spacing[3] }}>{selectedPending.shortDescription || selectedPending.description}</p>

                  <hr style={{ margin: `${theme.spacing[4]} 0`, borderColor: theme.colors.border }} />

                  <h3>Full Details</h3>
                  <p><strong>Agenda</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap', background: theme.colors.background.default, padding: theme.spacing[3], borderRadius: theme.borderRadius.sm }}>{selectedPending.fullAgenda || selectedPending.details?.agenda || 'No agenda provided'}</pre>

                  <p><strong>Faculty Responsible:</strong> {selectedPending.facultyResponsible || selectedPending.details?.facultyResponsible || 'N/A'}</p>
                  <p><strong>Budget:</strong> {selectedPending.requiredBudget || selectedPending.details?.budget || 'N/A'}</p>
                  <p><strong>Funding Source:</strong> {selectedPending.fundingSource || selectedPending.details?.fundingSource || 'N/A'}</p>
                  <p><strong>Contact Email:</strong> {selectedPending.contactEmail || selectedPending.details?.contactEmail || 'N/A'}</p>
                  <p><strong>Extra Resources:</strong> {selectedPending.extraRequiredResources || selectedPending.details?.materials || 'N/A'}</p>
                  <p><strong>Professors Participating:</strong> {selectedPending.professorsParticipating || selectedPending.details?.prerequisites || 'N/A'}</p>
                  <p><strong>Registration Deadline:</strong> {selectedPending.registrationDeadline ? new Date(selectedPending.registrationDeadline).toLocaleString() : 'N/A'}</p>
                  <p><strong>Capacity:</strong> {selectedPending.capacity || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          {publishCandidate && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                zIndex: 10000,
              }}
              onClick={() => setPublishCandidate(null)}
            >
              <div
                style={{
                  width: "520px",
                  maxWidth: "95%",
                  background: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[5],
                  boxShadow: theme.shadows.lg,
                  transition: "transform 180ms ease, opacity 180ms ease",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2] }}>
                  Are you sure you want to publish this workshop?
                </h3>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
                  This will make the workshop publicly available for registration.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setPublishCandidate(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      const w = publishCandidate;

                      setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));
                      
                      try {
                        // Call the backend API to publish the workshop
                        const response = await workshopAPI.publishWorkshop(w._id);
                        
                        if (response.data.success && response.data.event) {
                          const publishedEvent = response.data.event;
                          
                          // Remove from pending workshops
                          setPendingWorkshops((prev) => prev.filter((p) => p._id !== w._id));
                          
                          // Add to events list
                          setEvents((prev) => [publishedEvent, ...prev]);
                          
                          // Show success message with workshop name
                          toast.success(`Workshop "${w.workshopName || w.name || 'successfully'}" published!`);
                        } else {
                          toast.error("Failed to publish workshop. Please try again.");
                        }
                      } catch (err) {
                        console.error("Failed to publish workshop:", err);
                        toast.error(err.response?.data?.message || "Failed to publish workshop on server.");
                      }

                      setPublishCandidate(null);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}
          {rejectCandidate && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                zIndex: 10000,
              }}
              onClick={() => setRejectCandidate(null)}
            >
              <div
                style={{
                  width: "520px",
                  maxWidth: "95%",
                  background: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[5],
                  boxShadow: theme.shadows.lg,
                  transition: "transform 180ms ease, opacity 180ms ease",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2], color: theme.colors.danger }}>
                  Reject Workshop Submission?
                </h3>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2], lineHeight: 1.6 }}>
                  Are you sure you want to reject this workshop? This action will:
                </p>
                <ul style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4], paddingLeft: theme.spacing[5], lineHeight: 1.8 }}>
                  <li>Permanently delete the workshop submission</li>
                  <li>Notify the professor of the rejection</li>
                  <li>Remove it from the pending approvals list</li>
                </ul>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4], fontWeight: 600 }}>
                  <strong>Note:</strong> If you want the professor to make changes instead, consider using "Request Edits" option.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setRejectCandidate(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const w = rejectCandidate;

                      setPendingWorkshops((prev) => prev.filter((p) => p.id !== w.id));

                      if (w._id) {
                        try {
                          await workshopAPI.rejectWorkshop(w._id);
                          toast.success(`Workshop successfully rejected!`);
                        } catch (err) {
                          console.error("Failed to reject workshop:", err);
                          toast.error("Failed to reject workshop on server. See console for details.");
                        }
                      } else {
                        toast.success(`Workshop successfully rejected!`);
                      }

                      setRejectCandidate(null);
                    }}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Workshop Confirmation Modal */}
          {deleteWorkshopCandidate && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                zIndex: 10000,
              }}
              onClick={() => setDeleteWorkshopCandidate(null)}
            >
              <div
                style={{
                  width: "480px",
                  maxWidth: "95%",
                  background: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[5],
                  boxShadow: theme.shadows.lg,
                  transition: "transform 180ms ease, opacity 180ms ease",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, marginBottom: theme.spacing[2], color: theme.colors.danger }}>
                  Delete Workshop?
                </h3>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2], lineHeight: 1.6 }}>
                  Are you sure you want to permanently delete this workshop?
                </p>
                <p style={{ color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontWeight: 600, fontSize: '1.05em' }}>
                  "{deleteWorkshopCandidate.title}"
                </p>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
                  <strong>This action cannot be undone.</strong> All registrations and related data will be permanently removed.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3] }}>
                  <Button variant="outline" onClick={() => setDeleteWorkshopCandidate(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmDeleteWorkshop}
                  >
                    Delete Workshop
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {createBazaarOpen && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 20000,
              display: "flex",
              justifyContent: "center",
              paddingTop: theme.spacing[6],
            }}
            onClick={() => setCreateBazaarOpen(false)}
          >
            <div
              style={{
                width: "800px",
                maxWidth: "95%",
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.lg,
                padding: theme.spacing[6],
                animation: "slide-down 0.3s ease-out",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4] }}>
                Create New Bazaar
              </h2>
              
              <div style={{ display: "grid", gap: theme.spacing[4] }}>
                <Input
                  label="Bazaar Name *"
                  placeholder="e.g., Annual Spring Fair"
                  value={bazaarData.title}
                  onChange={(e) => setBazaarData({ ...bazaarData, title: e.target.value })}
                />
                <Input
                  label="Theme *"
                  placeholder="e.g., 80s Retro, Sci-Fi, etc."
                  value={bazaarData.theme}
                  onChange={(e) => setBazaarData({ ...bazaarData, theme: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing[2], color: theme.colors.text.secondary }}>Description *</label>
                  <textarea
                    rows="4"
                    placeholder="A brief summary of the bazaar, what vendors can expect, and any special attractions."
                    value={bazaarData.description}
                    onChange={(e) => setBazaarData({ ...bazaarData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: theme.spacing[3],
                      fontSize: theme.typography.fontSize.base,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.base,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                  <Input
                    label="Start Date *"
                    type="datetime-local"
                    value={bazaarData.startDate}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      const updatedData = { ...bazaarData, startDate: newStartDate };

                      if (updatedData.endDate && newStartDate > updatedData.endDate) {
                        updatedData.endDate = "";
                      }

                      if (
                        updatedData.registrationDeadline &&
                        newStartDate <= updatedData.registrationDeadline
                      ) {
                        updatedData.registrationDeadline = "";
                      }

                      setBazaarData(updatedData);
                    }}
                  />
                  <Input
                    label="End Date *"
                    type="datetime-local"
                    value={bazaarData.endDate}
                    min={bazaarData.startDate}
                    onChange={(e) => setBazaarData({ ...bazaarData, endDate: e.target.value })}
                  />
                </div>
                <Input
                  label="Location *"
                  value={bazaarData.location}
                  onChange={(e) => setBazaarData({ ...bazaarData, location: e.target.value })}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                  <Input
                    label="Max Participants *"
                    type="number"
                    placeholder="50"
                    min="1"
                    value={bazaarData.maxParticipants}
                    onChange={(e) => setBazaarData({ ...bazaarData, maxParticipants: e.target.value })}
                  />
                  <Input
                    label="Registration Deadline *"
                    type="datetime-local"
                    value={bazaarData.registrationDeadline}
                    max={bazaarData.startDate}
                    onChange={(e) => setBazaarData({ ...bazaarData, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
                <Button variant="outline" onClick={() => setCreateBazaarOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBazaarData({ title: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" });
                    toast.success("Form fields cleared");
                  }}
                >
                  Clear Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      if (!bazaarData.title || !bazaarData.description || !bazaarData.theme || !bazaarData.startDate || !bazaarData.endDate || !bazaarData.maxParticipants || !bazaarData.registrationDeadline) {
                        toast.error("Please fill all required fields: Name, Description, Theme, Dates, Max Participants, and Registration Deadline.");
                        return;
                      }

                      if (new Date(bazaarData.registrationDeadline) >= new Date(bazaarData.startDate)) {
                        toast.error("Registration deadline must be set before the event's start date.");
                        return;
                      }

                      const eventData = {
                        title: bazaarData.title,
                        description: bazaarData.description,
                        startDate: new Date(bazaarData.startDate).toISOString(),
                        endDate: new Date(bazaarData.endDate).toISOString(),
                        location: bazaarData.location,
                        maxParticipants: Number(bazaarData.maxParticipants),
                        registrationDeadline: new Date(bazaarData.registrationDeadline).toISOString(),
                        registrationRequired: true,
                        tags: bazaarData.theme ? [bazaarData.theme] : [],
                        status: 'published',
                      };

                      await api.post("/bazaars", eventData);

                      toast.success(`Bazaar "${bazaarData.title}" has been published!`);
                      setCreateBazaarOpen(false);
                      setBazaarData({ title: "", description: "", theme: "", startDate: "", endDate: "", location: "University Courtyard", maxParticipants: "50", registrationDeadline: "" });
                      fetchEvents();
                    } catch (error) {
                      console.error("Failed to create bazaar:", error);
                      toast.error(error.data?.message || error.message || "Failed to create bazaar. Please try again.");
                    }
                  }}
                >
                  Publish Bazaar
                </Button>
              </div>
            </div>
          </div>
        )}
        <ConferenceModal
          isOpen={showConferenceModal}
          onClose={() => {
            setShowConferenceModal(false);
            setEditingConference(null);
          }}
          conference={editingConference}
          onSuccess={() => {
            fetchEvents();
            setEditingConference(null);
          }}
        />
        {renderEditModal()}
        <EditWorkshopModal
          open={editWorkshopModalOpen}
          workshop={editingWorkshop}
          onClose={() => { 
            setEditWorkshopModalOpen(false); 
            setEditingWorkshop(null); 
          }}
          onSubmit={handleWorkshopModalSubmit}
        />
      </div>
    </>
  );
};

export default EventsPage;