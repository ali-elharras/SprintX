import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';
import { eventAPI } from '../services/api';
import toast from 'react-hot-toast';

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

const EventEditModal = ({ open, event, onClose, onSaved }) => {
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(event ? {
      name: event.name || event.title || '',
      description: event.description || '',
      location: event.location || '',
      startDate: event.startDate ? String(event.startDate).slice(0,16) : '',
      endDate: event.endDate ? String(event.endDate).slice(0,16) : '',
      registrationDeadline: event.registrationDeadline ? String(event.registrationDeadline).slice(0,16) : '',
      maxParticipants: event.maxParticipants || event.capacity || 1,
      cost: event.cost || 0,
    } : {});
    setError(null);
  }, [event]);

  if (!open) return null;

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    // Validate all fields (same as CreateTripModal)
    if (!form.name || form.name.trim().length === 0) {
      setError('Trip name is required');
      return false;
    }
    if (!form.description || form.description.trim().length === 0) {
      setError('Short description is required');
      return false;
    }
    if (!form.location || form.location.trim().length === 0) {
      setError('Location is required');
      return false;
    }
    if (!form.startDate) {
      setError('Start date and time required');
      return false;
    }
    if (!form.endDate) {
      setError('End date and time required');
      return false;
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError('End must be after start');
      return false;
    }
    if (!form.registrationDeadline) {
      setError('Registration deadline required');
      return false;
    }
    if (form.registrationDeadline && form.startDate && new Date(form.registrationDeadline) >= new Date(form.startDate)) {
      setError('Registration deadline must be before the trip start');
      return false;
    }
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) {
      setError('Capacity must be at least 1');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e && e.preventDefault();
    if (!event) return;

    // Validate all fields before proceeding
    if (!validate()) {
      return;
    }

    // compute changed fields only
    const changed = {};
    Object.keys(form).forEach(k => {
      const original = (event.name && k === 'name') ? (event.name) : event[k];
      // normalized compare for dates
      const origVal = original ? (typeof original === 'string' && original.length > 10 ? original.slice(0,16) : original) : original;
      if ((form[k] || '') !== (origVal || '')) changed[k] = form[k];
    });

    if (Object.keys(changed).length === 0) {
      setError('No changes to save');
      return;
    }

    // If name changed, also update title to keep them in sync
    if (changed.name) {
      changed.title = changed.name;
    }

    setSaving(true);
    setError(null);
    try {
      await eventAPI.updateEvent(event._id || event.id, changed);
      toast.success('Trip updated successfully!');
      setSaving(false);
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error('Failed to update event', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save changes';
      setError(errorMsg);
      toast.error(errorMsg);
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.title}>Edit Trip</div>
        {error && <div style={{ color: theme.colors.error.main, marginBottom: theme.spacing[2] }}>{error}</div>}
        <form onSubmit={handleSave}>
          <label style={modalStyles.label}>Trip name <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input style={modalStyles.input} value={form.name} onChange={(e)=>handleChange('name', e.target.value)} />

          <label style={modalStyles.label}>Short description <span style={{ color: theme.colors.error.main }}>*</span></label>
          <textarea style={modalStyles.textarea} value={form.description} onChange={(e)=>handleChange('description', e.target.value)} />

          <label style={modalStyles.label}>Location <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input style={modalStyles.input} value={form.location} onChange={(e)=>handleChange('location', e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Start (local) <span style={{ color: theme.colors.error.main }}>*</span></label>
              <input type="datetime-local" style={modalStyles.input} value={form.startDate} onChange={(e)=>handleChange('startDate', e.target.value)} />
            </div>
            <div>
              <label style={modalStyles.label}>End (local) <span style={{ color: theme.colors.error.main }}>*</span></label>
              <input type="datetime-local" style={modalStyles.input} value={form.endDate} onChange={(e)=>handleChange('endDate', e.target.value)} />
            </div>
          </div>

          <label style={modalStyles.label}>Registration deadline <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input type="datetime-local" style={modalStyles.input} value={form.registrationDeadline} onChange={(e)=>handleChange('registrationDeadline', e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Capacity <span style={{ color: theme.colors.error.main }}>*</span></label>
              <input type="number" style={modalStyles.input} value={form.maxParticipants} onChange={(e)=>handleChange('maxParticipants', e.target.value)} />
            </div>
            <div>
              <label style={modalStyles.label}>Price (USD)</label>
              <input type="number" step="0.01" style={modalStyles.input} value={form.cost} onChange={(e)=>handleChange('cost', e.target.value)} />
            </div>
          </div>

          {/* Only the required trip fields are shown: name, description, location, start/end, registration deadline, capacity, cost */}

          <div style={modalStyles.actions}>
            <button type="button" onClick={onClose} style={{ ...theme.components.button.secondary }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...theme.components.button.primary }}>{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
};

export default EventEditModal;
