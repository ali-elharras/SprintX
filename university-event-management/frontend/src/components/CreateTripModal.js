import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';
import { eventAPI } from '../services/api';
import { toast } from 'react-toastify';

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
  const [serverMessages, setServerMessages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    if (!open) setForm({ name: '', description: '', location: '', cost: 0, startDate: '', endDate: '', maxParticipants: 1, registrationDeadline: '' });
    // clear server messages/errors when modal opens/closes
    setErrors({});
    setServerMessages([]);
  }, [open]);

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
        title: form.name,
        description: form.description,
        type: 'trip',
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        location: form.location,
        registrationRequired: true,
        registrationDeadline: new Date(form.registrationDeadline),
        maxParticipants: Number(form.maxParticipants),
        cost: Number(form.cost) || 0
      };
      const resp = await eventAPI.createEvent(payload);
      // show success toast and call callbacks
      try { toast.success(resp?.data?.message || 'Trip created successfully'); } catch(e) {}
      setServerMessages([]);
      onCreated && onCreated(resp.data?.data || resp.data);
      onClose && onClose();
    } catch (err) {
      console.error('Create trip failed', err);
      const resp = err?.response?.data || err?.response || err;
      const map = {};
      const msgs = [];

      // Helper to push a message
      const pushMsg = (key, message) => {
        if (key) map[key] = message;
        msgs.push(key ? `${key}: ${message}` : message);
      };

      // Try several common shapes
      const tryArray = (arr) => {
        arr.forEach(item => {
            const m = item.msg || item.message || item.msg || String(item);
            const key = item.param || item.path || item.field || null;
            pushMsg(key, m);
          });
        };

        if (resp) {
          if (Array.isArray(resp.errors) && resp.errors.length > 0) {
            tryArray(resp.errors);
          } else if (Array.isArray(resp.data) && resp.data.length > 0 && resp.data[0] && resp.data[0].msg) {
            // some shapes put the array inside data
            tryArray(resp.data);
          } else if (resp.data && Array.isArray(resp.data.errors)) {
            tryArray(resp.data.errors);
          } else if (resp.errors && typeof resp.errors === 'object') {
            Object.keys(resp.errors).forEach(k => {
              const v = resp.errors[k];
              const m = (v && (v.message || v.msg)) || String(v);
              pushMsg(k, m);
            });
          } else if (resp.data && typeof resp.data === 'object' && resp.data.errors && typeof resp.data.errors === 'object') {
            Object.keys(resp.data.errors).forEach(k => {
              const v = resp.data.errors[k];
              const m = (v && (v.message || v.msg)) || String(v);
              pushMsg(k, m);
            });
          }

          if (resp.message && typeof resp.message === 'string') {
            // put server message at the top
            msgs.unshift(resp.message);
          }
        }

        // Fallbacks
        if (msgs.length === 0) {
          if (err?.message) msgs.push(err.message);
          else msgs.push('Failed to create trip');
        }

        setErrors(map);
        setServerMessages(msgs);
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.title}>Create Trip</div>
        <form onSubmit={handleSubmit}>
          {serverMessages && serverMessages.length > 0 && (
            <div style={{ background: '#fff5f5', border: `1px solid ${theme.colors.error.main}`, color: theme.colors.error.main, padding: theme.spacing[3], borderRadius: theme.borderRadius.md, marginBottom: theme.spacing[3] }}>
              <strong>Errors:</strong>
              <ul style={{ margin: '8px 0 0 16px' }}>
                {serverMessages.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          <label style={modalStyles.label}>Trip name <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input style={modalStyles.input} value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
          {errors.name && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.name}</div>}

          <label style={modalStyles.label}>Short description <span style={{ color: theme.colors.error.main }}>*</span></label>
          <textarea style={modalStyles.textarea} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} />
          {errors.description && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.description}</div>}

          <label style={modalStyles.label}>Location <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input style={modalStyles.input} value={form.location} onChange={(e)=>setForm(f=>({...f,location:e.target.value}))} />
          {errors.location && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.location}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Start (local) <span style={{ color: theme.colors.error.main }}>*</span></label>
              <input type="datetime-local" style={modalStyles.input} value={form.startDate} onChange={(e)=>setForm(f=>({...f,startDate:e.target.value}))} />
              {errors.startDate && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.startDate}</div>}
            </div>
            <div>
              <label style={modalStyles.label}>End (local) <span style={{ color: theme.colors.error.main }}>*</span></label>
              <input type="datetime-local" style={modalStyles.input} value={form.endDate} onChange={(e)=>setForm(f=>({...f,endDate:e.target.value}))} />
              {errors.endDate && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.endDate}</div>}
            </div>
          </div>

          <label style={modalStyles.label}>Registration deadline <span style={{ color: theme.colors.error.main }}>*</span></label>
          <input type="datetime-local" style={modalStyles.input} value={form.registrationDeadline} onChange={(e)=>setForm(f=>({...f,registrationDeadline:e.target.value}))} />
          {errors.registrationDeadline && <div style={{ color: theme.colors.error.main, marginTop: -8, marginBottom: theme.spacing[2] }}>{errors.registrationDeadline}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[3] }}>
            <div>
              <label style={modalStyles.label}>Capacity <span style={{ color: theme.colors.error.main }}>*</span></label>
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
