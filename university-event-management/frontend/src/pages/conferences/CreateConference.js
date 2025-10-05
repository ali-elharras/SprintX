import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import ConferenceForm from '../../components/conference_components/ConferenceForm';
import theme from '../../theme';

const CreateConference = () => {
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

  return (
    <div style={containerStyles}>
      <Navbar />
      <div style={contentWrapperStyles}>
        <div style={innerContainerStyles}>
          {/* Title and Date above the card */}
          <div style={headerStyles}>
            <h1 style={titleStyles}>Create New Conference</h1>
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
            <ConferenceForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateConference;