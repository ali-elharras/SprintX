import React, { useState, useEffect } from 'react';
import Card from './Card';
import api from '../services/api';

const RewardsDashboard = () => {
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewards();
    fetchLeaderboard();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rewards/me');
      setRewards(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/rewards/leaderboard');
      setLeaderboard(response.data.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return null;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Rewards Card */}
      <Card
        className="text-white"
        style={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #764ba2 100%)',
          borderRadius: '15px',
          boxShadow: '0 5px 25px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Reward Points</h2>
              <p className="text-white/90">
                {rewards.consecutiveDays > 0
                  ? `${rewards.consecutiveDays} day streak! 🔥`
                  : 'Start your streak today!'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{rewards.rewardPoints}</div>
              <div className="text-sm text-white/80">points</div>
            </div>
          </div>

          <div className="bg-purple-800/20 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Next Reward:</span>
              <span className="font-semibold text-white">
                +{rewards.nextRewardAmount} points
              </span>
            </div>

            {!rewards.canClaimToday && rewards.nextRewardIn && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Available in:</span>
                <span className="font-semibold text-white">
                  {formatTime(rewards.nextRewardIn)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-white/20">
              <p className="text-xs text-white/80">
                💰 {rewards.pointsToMoneyRatio}
              </p>
              <p className="text-xs text-white/80">
                🎯 Max {rewards.maxDiscountPercent}% discount per event
              </p>
            </div>
          </div>

          {rewards.canClaimToday && (
            <div className="mt-4 text-center">
              <div className="bg-green-400 text-green-900 font-semibold py-2 px-4 rounded-lg inline-block">
                ✅ Daily reward claimed at login!
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Leaderboard */}
      {leaderboard && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
            
            {/* Current User Position */}
            <div className="bg-card border border-card/10 rounded-lg p-4 mb-4 text-card-foreground">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-card-foreground/70">Your Rank</div>
                  <div className="font-bold text-lg">#{leaderboard.currentUser.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-card-foreground/70">Your Points</div>
                  <div className="font-bold text-lg text-card-foreground">
                    {leaderboard.currentUser.points}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-card-foreground/70">Streak</div>
                  <div className="font-bold text-lg">
                    {leaderboard.currentUser.streak} 🔥
                  </div>
                </div>
              </div>
            </div>

            {/* Top Users */}
            <div className="space-y-2">
              {leaderboard.leaderboard.map((user, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    index < 3 ? 'bg-card/5 border border-card/10' : 'bg-card/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                          ? 'bg-gray-300 text-gray-700'
                          : index === 2
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.streak} day streak 🔥
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg text-card-foreground">
                    {user.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold">Daily Login Rewards</div>
                <div className="text-gray-600">
                  Log in every day to earn points. The longer your streak, the more points you earn!
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-semibold">Build Your Streak</div>
                <div className="text-gray-600">
                  Day 1: 10 points → Day 2: 12 points → Day 3: 14 points... up to 30 points/day!
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-semibold">Redeem for Discounts</div>
                <div className="text-gray-600">
                  Use your points for discounts on paid events. 10 points = 1 EGP discount (up to 50% off)
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold">Don't Break the Streak</div>
                <div className="text-gray-600">
                  Miss a day and your streak resets to 1. Keep logging in to maintain your rewards!
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RewardsDashboard;
