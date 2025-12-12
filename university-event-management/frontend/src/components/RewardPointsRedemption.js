import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RewardPointsRedemption = ({ eventCost, onPointsChange }) => {
  const [rewards, setRewards] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (pointsToUse > 0 && eventCost > 0) {
      calculateDiscount();
    } else {
      setDiscount(null);
      if (onPointsChange) {
        onPointsChange({ pointsToUse: 0, discount: 0, finalCost: eventCost });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsToUse, eventCost]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rewards/me');
      setRewards(response.data.data);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async () => {
    if (pointsToUse === 0) return;

    try {
      setCalculating(true);
      const response = await api.post('/rewards/calculate-discount', {
        eventCost,
        pointsToUse: parseInt(pointsToUse),
      });

      const discountData = response.data.data;
      setDiscount(discountData);

      if (onPointsChange) {
        onPointsChange({
          pointsToUse: discountData.pointsUsed,
          discount: discountData.discount,
          finalCost: discountData.finalCost,
        });
      }
    } catch (err) {
      console.error('Failed to calculate discount:', err);
      setDiscount(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleUseMaxPoints = () => {
    if (rewards) {
      const maxUsable = Math.min(rewards.rewardPoints, Math.floor(eventCost * 5)); // 50% max
      setPointsToUse(maxUsable);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!rewards || rewards.rewardPoints === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 You don't have any reward points yet. Log in daily to earn points and get discounts on events!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">
          🎁 Use Reward Points
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Available Points</div>
          <div className="text-2xl font-bold text-blue-600">
            {rewards.rewardPoints}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Points to Redeem
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            min="0"
            max={rewards.rewardPoints}
            value={pointsToUse}
            onChange={(e) => setPointsToUse(Math.min(parseInt(e.target.value) || 0, rewards.rewardPoints))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter points to use"
          />
          <button
            type="button"
            onClick={handleUseMaxPoints}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Use Max
          </button>
        </div>
        <p className="text-xs text-gray-500">
          10 points = 1 EGP discount (up to 50% off)
        </p>
      </div>

      {calculating && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {discount && !calculating && (
        <div className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Original Price:</span>
            <span className="line-through text-gray-400">{eventCost} EGP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Points Used:</span>
            <span className="font-semibold text-blue-600">
              {discount.pointsUsed} points
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="font-semibold text-green-600">
              -{discount.discount.toFixed(2)} EGP
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">Final Price:</span>
              <span className="text-2xl font-bold text-blue-600">
                {discount.finalCost.toFixed(2)} EGP
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Points Remaining:</span>
            <span>{discount.pointsRemaining}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardPointsRedemption;
