import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

const CreateDropdownButton = ({ onConferenceModalOpen }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Determine which options to show based on role
  const getCreateOptions = () => {
    const options = [];

    if (auth.isEventsOffice) {
      options.push(
        { 
          label: 'Conference', 
          icon: '🎤', 
          onClick: () => { 
            setIsOpen(false);
            if (onConferenceModalOpen) {
              onConferenceModalOpen();
            }
          } 
        }
      );
      options.push(
        { 
          label: 'Bazaars', 
          icon: '🛍️', 
          onClick: () => { 
            setIsOpen(false); 
            navigate('/create-bazaar');
          } 
        }
      );
      options.push(
        { 
          label: 'Trips', 
          icon: '🚌', 
          onClick: () => { 
            setIsOpen(false); 
            navigate('/create-trip');
          } 
        }
      );
    }

    if (auth.isAdmin) {
      options.push(
        { 
          label: 'Admin/Events Office Account', 
          icon: '👤', 
          onClick: () => { 
            setIsOpen(false); 
            navigate('/admin-users'); 
          } 
        }
      );
    }

    if (auth.user?.role === 'professor') {
      options.push(
        { 
          label: 'Workshop', 
          icon: '🎓', 
          onClick: () => { 
            setIsOpen(false); 
            navigate('/create-workshop'); 
          } 
        }
      );
    }

    return options;
  };

  const createOptions = getCreateOptions();

  // Don't render if user has no create permissions
  if (createOptions.length === 0) {
    return null;
  }

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            backgroundColor: theme.colors.primary.main,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            boxShadow: theme.shadows.md,
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary.light;
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary.main;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = theme.shadows.md;
          }}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span>
          <span>Create</span>
          <span style={{
            fontSize: '0.75rem',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            ▼
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              backgroundColor: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              border: `1px solid ${theme.colors.border}`,
              minWidth: '220px',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'slideDown 0.2s ease',
            }}
          >
            {createOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onClick}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  transition: 'background-color 0.15s ease',
                  borderBottom: index < createOptions.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{option.icon}</span>
                <span style={{ fontWeight: theme.typography.fontWeight.medium }}>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default CreateDropdownButton;