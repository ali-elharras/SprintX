import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';
import { eventAPI } from '../services/api';

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    overflow: 'auto',
  },
  container: {
    background: theme.colors.background.paper, borderRadius: theme.borderRadius.lg, padding: theme.spacing[6], minWidth: '360px', maxWidth: '90vw',
    maxHeight: '90vh', overflowY: 'auto', boxShadow: theme.shadows.xl,
  },
  title: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing[3] },
  label: { fontWeight: 600, marginBottom: 6 },
  input: { padding: theme.spacing[2], border: `1px solid ${theme.colors.border.main}`, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing[3], width: '100%' },
  textarea: { padding: theme.spacing[2], border: `1px solid ${theme.colors.border.main}`, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing[3], width: '100%', minHeight: 100 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: theme.spacing[3], marginTop: theme.spacing[2] },
};

const CreateTripModal = ({ open, onClose, onCreated, currentUser }) => {
  const [form, setForm] = useState({
    name: '', description: '', location: '', cost: 0, startDate: '', endDate: '', maxParticipants: 1, registrationDeadline: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ if (!open) setForm({ name: '', description: '', location: '', cost: 0, startDate: '', endDate: '', maxParticipants: 1, registrationDeadline: '' }); }, [open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length === 0) e.name = 'Trip name is required';
    if (!form.description || form.description.trim().length === 0) e.description = 'Short description is required';
    if (!form.location || form.location.trim().length === 0) e.location = 'Location is required';
    if (!form.startDate) e.startDate = 'Start date and time required';
    if (!form.endDate) e.endDate = 'End date and time required';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) e.endDate = 'End must be after start';
    if (!form.registrationDeadline) e.registrationDeadline = 'Registration deadline required';
    if (form.registrationDeadline && form.startDate && new Date(form.registrationDeadline) >= new Date(form.startDate)) e.registrationDeadline = 'Registration deadline must be before the trip start';
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) e.maxParticipants = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: 'trip',
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        location: form.location,
        registrationRequired: true,
        registrationDeadline: new Date(form.registrationDeadline),
        maxParticipants: Number(form.maxParticipants),
        cost: Number(form.cost) || 0,

        ...(currentUser && currentUser._id ? { organizer: currentUser._id } : {}),
      };
      const resp = await eventAPI.createEvent(payload);
      onCreated && onCreated(resp.data?.data || resp.data);
      onClose && onClose();
    } catch (err) {
      console.error('Create trip failed', err);
      const resp = err?.response?.data;
      if (resp && resp.errors) {
        const map = {};
        Object.keys(resp.errors).forEach(k => { map[k] = resp.errors[k].message || resp.errors[k]; });
        setErrors(map);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.title}>Create Trip</div>
        <form onSubmit={handleSubmit}>
          <label style={modalStyles.label}>Trip name</label>
          <input style={modalStyles.input} value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
          {errors.name && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.name}</div>}

          <label style={modalStyles.label}>Short description</label>
          <textarea style={modalStyles.textarea} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} />
          {errors.description && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.description}</div>}

          <label style={modalStyles.label}>Location</label>
          <input style={modalStyles.input} value={form.location} onChange={(e)=>setForm(f=>({...f,location:e.target.value}))} />
          {errors.location && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.location}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Start (local)</label>
              <input type="datetime-local" style={modalStyles.input} value={form.startDate} onChange={(e)=>setForm(f=>({...f,startDate:e.target.value}))} />
              {errors.startDate && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.startDate}</div>}
            </div>
            <div>
              <label style={modalStyles.label}>End (local)</label>
              <input type="datetime-local" style={modalStyles.input} value={form.endDate} onChange={(e)=>setForm(f=>({...f,endDate:e.target.value}))} />
              {errors.endDate && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.endDate}</div>}
            </div>
          </div>

          <label style={modalStyles.label}>Registration deadline</label>
          <input type="datetime-local" style={modalStyles.input} value={form.registrationDeadline} onChange={(e)=>setForm(f=>({...f,registrationDeadline:e.target.value}))} />
          {errors.registrationDeadline && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.registrationDeadline}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Capacity</label>
              <input type="number" style={modalStyles.input} value={form.maxParticipants} onChange={(e)=>setForm(f=>({...f,maxParticipants:e.target.value}))} />
              {errors.maxParticipants && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.maxParticipants}</div>}
            </div>
            <div>
              <label style={modalStyles.label}>Price (USD)</label>
              <input type="number" step="0.01" style={modalStyles.input} value={form.cost} onChange={(e)=>setForm(f=>({...f,cost:e.target.value}))} />
              {errors.cost && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.cost}</div>}
            </div>
          </div>

          <div style={modalStyles.actions}>
            <button type="button" onClick={onClose} style={{ ...theme.components.button.secondary }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...theme.components.button.primary }}>{submitting ? 'Creating...' : 'Create Trip'}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
};

export default CreateTripModal;
