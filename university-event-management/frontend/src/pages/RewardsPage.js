import React from 'react';
import RewardsDashboard from '../components/RewardsDashboard';

const RewardsPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Rewards Program 🎁
        </h1>
        <p className="text-gray-600">
          Earn points by logging in daily and redeem them for discounts on events!
        </p>
      </div>
      <RewardsDashboard />
    </div>
  );
};

export default RewardsPage;
