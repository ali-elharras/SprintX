import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConferenceModal from '../pages/ConferenceModal'; // Import the modals
import CreateTripModal from './CreateTripModal'; // Import the trip modal
import theme from '../theme';

const CreateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false); // Trip modal state
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { 
    isAdmin, 
    isEventsOffice, 
    isProfessor, 
    user 
  } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle conference creation success
  const handleConferenceSuccess = () => {
    setShowConferenceModal(false);
    console.log('Conference created successfully!');
    // Optionally navigate to conferences list
    // navigate('/conferences');
  };

  // Handle trip creation success
  const handleTripSuccess = () => {
    setShowTripModal(false);
    console.log('Trip created successfully!');
    // Optionally navigate to trips list or events page
    // navigate('/trips');
  };

  // Get creation options based on user role
  const getCreationOptions = () => {
    const options = [];

    // Professor options
    if (isProfessor) {
      options.push({
        label: 'Workshop',
        icon: '📚',
        onClick: () => navigate('/create-workshop'),
        description: 'Create a new workshop for students'
      });
    }

    // Events Office options
    if (isEventsOffice) {
      options.push(
        {
          label: 'Bazaar',
          icon: '🎪',
          onClick: () => navigate('/events?createBazaar=true'),
          description: 'Organize a bazaar event'
        },
        {
          label: 'Conference',
          icon: '🎤',
          onClick: () => {
            setShowConferenceModal(true);
            setIsOpen(false);
          },
          description: 'Schedule a conference'
        },
        {
          label: 'Trip',
          icon: '🚌',
          onClick: () => {
            setShowTripModal(true); // Open trip modal
            setIsOpen(false);
          },
          description: 'Organize a trip'
        }
      );
    }

    // Admin options
    if (isAdmin) {
      options.push(
        {
          label: 'Create Admin',
          icon: '👑',
          onClick: () => navigate('/admin-users?create=admin'),
          description: 'Create new admin account'
        },
        {
          label: 'Create Events Office',
          icon: '🏢',
          onClick: () => navigate('/admin-users?create=events_office'),
          description: 'Create new events office account'
        }
      );
    }

    return options;
  };

  const creationOptions = getCreationOptions();

  // Don't show the button if user has no creation permissions
  if (creationOptions.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        {/* Main Create Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            backgroundColor: theme.colors.primary.main,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: theme.shadows.md,
            position: 'relative',
            zIndex: 1001,
          }}
          onMouseEnter={() => setIsOpen(true)}
        >
          <span style={{ fontSize: '1.2em' }}>+</span>
          Create
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '0.9em'
          }}>
            ▼
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: theme.spacing[2],
              backgroundColor: theme.colors.background.paper,
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              minWidth: '280px',
              zIndex: 1000,
              overflow: 'hidden',
            }}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Header */}
            <div
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                borderBottom: `1px solid ${theme.colors.border.light}`,
                backgroundColor: theme.colors.background.default,
              }}
            >
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary
              }}>
                Create New...
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.xs, 
                color: theme.colors.text.secondary,
                marginTop: theme.spacing[1]
              }}>
                Choose what you want to create
              </div>
            </div>

            {/* Options List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {creationOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: theme.spacing[3],
                    borderBottom: index < creationOptions.length - 1 
                      ? `1px solid ${theme.colors.border.light}` 
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.colors.background.default;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.5em', flexShrink: 0 }}>{option.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1]
                    }}>
                      {option.label}
                    </div>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                      lineHeight: 1.4
                    }}>
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                borderTop: `1px solid ${theme.colors.border.light}`,
                backgroundColor: theme.colors.background.default,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Based on your role: {user?.role}
            </div>
          </div>
        )}
      </div>

      {/* Conference Modal */}
      <ConferenceModal
        isOpen={showConferenceModal}
        onClose={() => setShowConferenceModal(false)}
        onSuccess={handleConferenceSuccess}
      />

      {/* Trip Modal */}
      <CreateTripModal
        open={showTripModal}
        onClose={() => setShowTripModal(false)}
        onCreated={handleTripSuccess}
        currentUser={user}
      />
    </>
  );
};

export default CreateDropdown;