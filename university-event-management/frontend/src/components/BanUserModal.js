import React, { useState } from 'react';
import theme from '../theme';
import Button from './Button';

const BanUserModal = ({ user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for banning this user');
      return;
    }
    if (reason.length > 500) {
      setError('Reason must be less than 500 characters');
      return;
    }
    onConfirm(reason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal,
        padding: theme.spacing[4],
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.paper,
          borderRadius: theme.borderRadius.xl,
          boxShadow: theme.shadows['2xl'],
          maxWidth: '600px',
          width: '100%',
          padding: theme.spacing[6],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing[4],
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
            }}
          >
            Ban User
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: theme.typography.fontSize['2xl'],
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[4],
          }}
        >
          Please provide a reason for banning this user
        </p>

        <div
          style={{
            backgroundColor: theme.colors.error.light,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing[4],
            marginBottom: theme.spacing[4],
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            {user.email}
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            Role: {user.role}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.colors.warning.light,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing[3],
            marginBottom: theme.spacing[4],
            display: 'flex',
            alignItems: 'flex-start',
            gap: theme.spacing[2],
          }}
        >
          <span style={{ fontSize: theme.typography.fontSize.lg }}>⚠️</span>
          <div>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                margin: 0,
                lineHeight: theme.typography.lineHeight.relaxed,
              }}
            >
              This user will be immediately blocked from accessing the platform.
              The reason you provide will be shown to them when they attempt to
              log in.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: theme.spacing[4] }}>
          <label
            style={{
              display: 'block',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            Ban Reason <span style={{ color: theme.colors.error.main }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="Enter the reason for banning this user..."
            rows={4}
            style={{
              width: '100%',
              padding: theme.spacing[3],
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.default,
              border: `2px solid ${error ? theme.colors.error.main : theme.colors.border.main}`,
              borderRadius: theme.borderRadius.md,
              outline: 'none',
              fontFamily: theme.typography.fontFamily.primary,
              resize: 'vertical',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = theme.colors.primary.main;
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.borderColor = theme.colors.border.main;
              }
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: theme.spacing[1],
            }}
          >
            {error ? (
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.error.main,
                }}
              >
                {error}
              </span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              {reason.length} / 500 characters
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: theme.spacing[3],
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outline"
            onClick={onCancel}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[6]}`,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[6]}`,
              backgroundColor: theme.colors.error.main,
              color: theme.colors.text.white,
            }}
          >
            Ban User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BanUserModal;
