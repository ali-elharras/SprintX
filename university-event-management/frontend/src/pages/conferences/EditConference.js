import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import ConferenceForm from '../../components/conference_components/ConferenceForm.js';
import { conferenceService } from '../../services/conference';
import theme from '../../theme';

const EditConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const response = await conferenceService.getConference(id);
        if (!response.success) {
          throw new Error('Conference not found');
        }
        setConference(response.data);
      } catch (error) {
        console.error('Error:', error.message);
        navigate('/conferences');
      } finally {
        setLoading(false);
      }
    };

    fetchConference();
  }, [id, navigate]);

  const containerStyles = {
    minHeight: "100vh",
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const contentWrapperStyles = {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  };

  const innerContainerStyles = {
    width: "100%",
    maxWidth: "700px",
    position: "relative",
  };

  const headerStyles = {
    marginBottom: theme.spacing[6],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing[2],
  };

  const dateStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const loadingStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  };

  const spinnerStyles = {
    width: "48px",
    height: "48px",
    border: "3px solid transparent",
    borderTop: `3px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <Navbar />
        <div style={contentWrapperStyles}>
          <div style={innerContainerStyles}>
            <div style={headerStyles}>
              <h1 style={titleStyles}>Edit Conference</h1>
              <p style={dateStyles}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div style={loadingStyles}>
              <div style={spinnerStyles}></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Navbar />
      <div style={contentWrapperStyles}>
        <div style={innerContainerStyles}>
          {/* Title and Date above the card */}
          <div style={headerStyles}>
            <h1 style={titleStyles}>Edit Conference</h1>
            <p style={dateStyles}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ConferenceForm conference={conference} isEdit={true} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditConference;