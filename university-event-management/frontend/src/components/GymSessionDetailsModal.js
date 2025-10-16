import React from "react";
import Modal from "./Modal";
import theme from "../theme";
import EditSessionModal from "./EditSessionModal";

const styles = {
  header: { ...theme.typography.h4, marginBottom: theme.spacing[3] },
  meta: { color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
  section: { marginBottom: theme.spacing[3] },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: theme.spacing[2] },
};

const GymSessionDetailsModal = ({ session, isOpen, onClose, onSaved, isAdminOrEventsOffice = false, viewOnly = false }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  if (!isOpen || !session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Details for ${session.title}`}>
      <div>
        <h3 style={styles.header}>{session.title}</h3>
        <div style={styles.meta}>{session.type.replace('_', ' ')} • {session.skillLevel}</div>

        <div style={styles.section}>
          <strong>Schedule</strong>
          <div>{session.dayOfWeek !== undefined ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][session.dayOfWeek] : ''} {session.startTime} - {session.endTime}</div>
          <div>From: {session.startDate ? new Date(session.startDate).toLocaleDateString() : ''} To: {session.endDate ? new Date(session.endDate).toLocaleDateString() : ''}</div>
        </div>

        <div style={styles.section}>
          <strong>Instructor</strong>
          <div>{session.instructor?.name} {session.instructor?.certifications ? `• ${session.instructor.certifications.join(', ')}` : ''}</div>
          {session.instructor?.bio && <div style={{ marginTop: theme.spacing[2] }}>{session.instructor.bio}</div>}
        </div>

        <div style={styles.section}>
          <strong>Details</strong>
          {session.description && <p>{session.description}</p>}
          <div>Location: {session.location}{session.room ? ` (${session.room})` : ''}</div>
          <div>Capacity: {session.currentParticipants || 0} / {session.maxParticipants}</div>
          <div>Cost: {session.cost === 0 ? 'Free' : `$${session.cost}`}</div>
          {session.equipment && session.equipment.length > 0 && <div>Equipment: {session.equipment.join(', ')}</div>}
          {session.tags && session.tags.length > 0 && <div>Tags: {session.tags.join(', ')}</div>}
        </div>

        <div style={styles.section}>
          <strong>Eligibility</strong>
          <div>Eligible roles: {session.eligibleRoles?.join(', ')}</div>
          {session.ageRestriction && <div>Age: {session.ageRestriction.minAge} - {session.ageRestriction.maxAge}</div>}
        </div>

        <div style={styles.actions}>
          {isAdminOrEventsOffice && !viewOnly && (
            <button onClick={() => setIsEditOpen(true)} style={{ ...theme.components.button.primary }}>Edit</button>
          )}
          <button onClick={onClose} style={{ ...theme.components.button.secondary }}>Close</button>
        </div>

        {isAdminOrEventsOffice && !viewOnly && (
          <EditSessionModal session={session} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSaved={(id)=>{ setIsEditOpen(false); onSaved && onSaved(id); onClose && onClose(); }} />
        )}
      </div>
    </Modal>
  );
};

export default GymSessionDetailsModal;
