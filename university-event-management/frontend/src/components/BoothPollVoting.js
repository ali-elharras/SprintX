import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { boothPollAPI } from '../services/api';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

const BoothPollVoting = ({ refreshTrigger }) => {
  const { user, isAuthenticated } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingStates, setVotingStates] = useState({});

  useEffect(() => {
    fetchPolls();
  }, [refreshTrigger]);

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
    if (!isAuthenticated || !user) {
      toast.error('Please log in to vote');
      return;
    }

    // Prevent Events Office from voting
    if (user.role === 'events_office' || user.role === 'admin') {
      toast.error('Events Office and Admin users cannot vote on polls');
      return;
    }

    // If clicking on the same vendor, remove the vote
    if (votingStates[pollId] === vendorIndex) {
      handleRemoveVote(pollId);
      return;
    }

    try {
      const response = await boothPollAPI.voteOnPoll(pollId, vendorIndex);
      
      // Update voting state immediately from the response
      setVotingStates((prev) => ({
        ...prev,
        [pollId]: vendorIndex,
      }));
      
      toast.success('Vote recorded!');
      
      // Refresh polls to see updated vote counts
      await fetchPolls();
    } catch (error) {
      console.error('Voting error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to record vote';
      toast.error(errorMessage);
    }
  };

  const handleRemoveVote = async (pollId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to remove vote');
      return;
    }

    try {
      await boothPollAPI.removeVoteFromPoll(pollId);
      
      // Remove vote from state immediately
      setVotingStates((prev) => {
        const newStates = { ...prev };
        delete newStates[pollId];
        return newStates;
      });
      
      toast.success('Vote removed!');
      
      // Refresh polls to see updated vote counts
      await fetchPolls();
    } catch (error) {
      console.error('Remove vote error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove vote';
      toast.error(errorMessage);
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
          {polls.map((poll) => {
            const hasVoted = votingStates[poll._id] !== undefined;
            const canVote = isAuthenticated && user && user.role !== 'events_office' && user.role !== 'admin';
            
            return (
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

                {/* Voting Instructions */}
                {canVote && !hasVoted && (
                  <div
                    style={{
                      background: '#f0f9ff',
                      border: '2px solid #7dd3fc',
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing[3],
                      marginBottom: theme.spacing[4],
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="#0284c7"/>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0284c7', marginBottom: '0.25rem' }}>
                        Cast Your Vote
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                        Click on any vendor option below to vote. Click again on the same option to remove your vote, or click another to change your vote.
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Message - Already Voted */}
                {hasVoted && (
                  <div
                    style={{
                      background: '#faf5ff',
                      border: '2px solid #c4b5fd',
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing[3],
                      marginBottom: theme.spacing[4],
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing[3], flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], flex: '1 1 auto', minWidth: '250px' }}>
                        <span style={{ fontSize: '1.25rem' }}>✓</span>
                        <div>
                          <div style={{ fontWeight: 600, color: '#7c3aed', marginBottom: '0.25rem' }}>
                            You voted for {poll.vendors[votingStates[poll._id]]?.companyName}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6d28d9' }}>
                            Click the same vendor again to remove your vote, click another to change it, or use the button below.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVote(poll._id);
                        }}
                        style={{
                          padding: '0.625rem 1.25rem',
                          background: 'white',
                          border: '2px solid #c4b5fd',
                          borderRadius: theme.borderRadius.sm,
                          color: '#7c3aed',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#faf5ff';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ✕ Remove Vote
                      </button>
                    </div>
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
                        onClick={() => canVote && handleVote(poll._id, index)}
                        style={{
                          cursor: canVote ? 'pointer' : 'default',
                          padding: theme.spacing[4],
                          border: isSelected ? `3px solid #7c3aed` : `2px solid ${theme.colors.border.light}`,
                          borderRadius: theme.borderRadius.md,
                          background: isSelected ? '#faf5ff' : 'white',
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          if (canVote && !isSelected) {
                            e.currentTarget.style.borderColor = '#c4b5fd';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canVote && !isSelected) {
                            e.currentTarget.style.borderColor = theme.colors.border.light;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                      >
                        {/* Vote Progress Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            background: isSelected ? 'linear-gradient(to right, #e9d5ff, #f3e8ff)' : '#f3f4f6',
                            width: `${votePercentage}%`,
                            opacity: 0.5,
                            transition: 'width 0.3s',
                            zIndex: 0,
                          }}
                        />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.text.primary, fontSize: '1.125rem', fontWeight: 600 }}>
                                {vendor.companyName}
                              </h4>
                              {vendor.description && (
                                <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.text.secondary, lineHeight: 1.5 }}>
                                  {vendor.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                  color: 'white',
                                  padding: '0.375rem 0.875rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.025em',
                                  textTransform: 'uppercase',
                                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                                  marginLeft: theme.spacing[3],
                                  flexShrink: 0,
                                }}
                              >
                                ✓ Your Vote
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center', marginTop: theme.spacing[3] }}>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  background: '#e5e7eb',
                                  height: '8px',
                                  borderRadius: '9999px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    background: isSelected ? 'linear-gradient(to right, #7c3aed, #6d28d9)' : '#9ca3af',
                                    width: `${votePercentage}%`,
                                    transition: 'width 0.3s',
                                    boxShadow: isSelected ? '0 0 8px rgba(124, 58, 237, 0.5)' : 'none',
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ minWidth: '100px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#7c3aed' : theme.colors.text.primary }}>
                              {vendor.votes} vote{vendor.votes !== 1 ? 's' : ''} ({votePercentage}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Votes */}
                <div style={{ marginTop: theme.spacing[4], paddingTop: theme.spacing[3], borderTop: `1px solid ${theme.colors.border.light}`, fontSize: '0.875rem', color: theme.colors.text.secondary, fontWeight: 500 }}>
                  Total votes cast: {poll.votes.length}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default BoothPollVoting;
