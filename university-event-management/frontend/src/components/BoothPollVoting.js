import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { boothPollAPI } from '../services/api';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

const BoothPollVoting = () => {
  const { auth } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingStates, setVotingStates] = useState({});

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await boothPollAPI.getAllPolls({ status: 'active' });
      setPolls(response.data?.data || []);

      // Initialize voting states from current user votes
      const states = {};
      (response.data?.data || []).forEach((poll) => {
        if (poll.userVote !== null && poll.userVote !== undefined) {
          states[poll._id] = poll.userVote;
        }
      });
      setVotingStates(states);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, vendorIndex) => {
    if (!auth?.user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      await boothPollAPI.voteOnPoll(pollId, vendorIndex);
      setVotingStates((prev) => ({
        ...prev,
        [pollId]: vendorIndex,
      }));
      toast.success('Vote recorded!');
      // Refresh polls to see updated vote counts
      fetchPolls();
    } catch (error) {
      console.error('Voting error:', error);
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: theme.spacing[6] }}>
        <p>Loading polls...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: theme.spacing[4] }}>
      <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing[4] }}>
        Booth Vendor Polls
      </h2>

      {polls.length === 0 ? (
        <div
          style={{
            background: theme.colors.background.paper,
            padding: theme.spacing[6],
            borderRadius: theme.borderRadius.lg,
            textAlign: 'center',
            color: theme.colors.text.secondary,
          }}
        >
          <p>No active polls at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: theme.spacing[4] }}>
          {polls.map((poll) => (
            <div
              key={poll._id}
              style={{
                background: theme.colors.background.paper,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                overflow: 'hidden',
              }}
            >
              {/* Poll Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: theme.spacing[4],
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{poll.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                  {poll.description}
                </p>
              </div>

              {/* Poll Details */}
              <div style={{ padding: theme.spacing[4] }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: theme.spacing[3], marginBottom: theme.spacing[4] }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      Location
                    </div>
                    <div style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                      {poll.location}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      Booth Size
                    </div>
                    <div style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                      {poll.boothSize}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      Duration
                    </div>
                    <div style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                      {poll.durationWeeks} week{poll.durationWeeks > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      Voting Ends
                    </div>
                    <div style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                      {new Date(poll.pollEndDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {votingStates[poll._id] !== undefined && (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #6ee7b7',
                      borderRadius: theme.borderRadius.sm,
                      padding: theme.spacing[2],
                      marginBottom: theme.spacing[4],
                      color: '#047857',
                      fontSize: '0.875rem',
                    }}
                  >
                    ✓ You voted for {poll.vendors[votingStates[poll._id]]?.companyName}
                  </div>
                )}

                {/* Vendor Options */}
                <div style={{ display: 'grid', gap: theme.spacing[3] }}>
                  {poll.vendors.map((vendor, index) => {
                    const isSelected = votingStates[poll._id] === index;
                    const totalVotes = poll.vendors.reduce((sum, v) => sum + v.votes, 0);
                    const votePercentage = totalVotes > 0 ? (vendor.votes / totalVotes * 100).toFixed(1) : 0;

                    return (
                      <div
                        key={index}
                        onClick={() => handleVote(poll._id, index)}
                        style={{
                          cursor: 'pointer',
                          padding: theme.spacing[3],
                          border: isSelected ? `3px solid ${theme.colors.primary.main}` : `2px solid ${theme.colors.border.light}`,
                          borderRadius: theme.borderRadius.sm,
                          background: isSelected ? '#eef2ff' : 'white',
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Vote Progress Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            background: isSelected ? theme.colors.primary.main : '#e5e7eb',
                            width: `${votePercentage}%`,
                            opacity: 0.15,
                            transition: 'width 0.3s',
                            zIndex: 0,
                          }}
                        />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <h4 style={{ margin: '0 0 0.25rem 0', color: theme.colors.text.primary }}>
                                {vendor.companyName}
                              </h4>
                              {vendor.description && (
                                <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                                  {vendor.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <span
                                style={{
                                  background: theme.colors.primary.main,
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                Your Vote
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  background: '#e5e7eb',
                                  height: '6px',
                                  borderRadius: '9999px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    background: isSelected ? theme.colors.primary.main : '#6b7280',
                                    width: `${votePercentage}%`,
                                    transition: 'width 0.3s',
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ minWidth: '60px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: theme.colors.text.primary }}>
                              {vendor.votes} vote{vendor.votes !== 1 ? 's' : ''} ({votePercentage}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Votes */}
                <div style={{ marginTop: theme.spacing[3], paddingTop: theme.spacing[3], borderTop: `1px solid ${theme.colors.border.light}`, fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                  Total votes: {poll.votes.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoothPollVoting;
