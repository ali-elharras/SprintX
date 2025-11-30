import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import theme from '../theme';
import Navbar from '../components/Navbar';
import BoothPollManager from '../components/BoothPollManager';
import BoothPollVoting from '../components/BoothPollVoting';
import Button from '../components/Button';

const BoothPolls = () => {
  const { user } = useAuth();
  const isEventsOffice = user?.role === 'events_office';
  const [pollsManagerOpen, setPollsManagerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePollCreated = () => {
    setPollsManagerOpen(false);
    toast.success("Booth poll created successfully!");
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.default,
          padding: theme.spacing[6],
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Page Header */}
          <div style={{ marginBottom: theme.spacing[6] }}>
            <h1
              style={{
                margin: 0,
                marginBottom: theme.spacing[2],
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
              }}
            >
              Booth Vendor Polls
            </h1>
            <p
              style={{
                margin: 0,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
              }}
            >
              {isEventsOffice 
                ? 'Create and manage polls to select vendors for booth events' 
                : 'Vote for your preferred booth vendors'}
            </p>
          </div>

      {/* Events Office: Poll Creation Section */}
      {isEventsOffice && (
        <div
          style={{
            background: theme.colors.background.paper,
            padding: theme.spacing[5],
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.md,
            marginBottom: theme.spacing[6],
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[4] }}>
            <h2
              style={{
                margin: 0,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Manage Polls
            </h2>
            <Button
              variant="primary"
              onClick={() => setPollsManagerOpen(!pollsManagerOpen)}
            >
              {pollsManagerOpen ? 'Cancel' : '+ Create New Poll'}
            </Button>
          </div>
          
          {pollsManagerOpen && (
            <div style={{ marginBottom: theme.spacing[4], padding: theme.spacing[4], backgroundColor: theme.colors.background.default, borderRadius: theme.borderRadius.base }}>
              <BoothPollManager
                onPollCreated={handlePollCreated}
                onCancel={() => setPollsManagerOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* All Users: Voting Section */}
      <div
        style={{
          background: theme.colors.background.paper,
          padding: theme.spacing[5],
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: theme.spacing[4],
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          Active Polls
        </h2>
        <BoothPollVoting refreshTrigger={refreshTrigger} />
      </div>
    </div>
      </div>
    </>
  );
};

export default BoothPolls;
