import React, { useEffect, useState } from 'react';

const DailyRewardNotification = ({ dailyReward, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dailyReward && dailyReward.claimed) {
      setShow(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyReward]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!dailyReward || !dailyReward.claimed || !show) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 max-w-sm border border-card/10">
        <div className="flex justify-between items-start mb-3">
          <div className="text-2xl">🎉</div>
          <button
            onClick={handleClose}
            className="text-card-foreground/80 hover:text-card-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-bold mb-2">Daily Reward Claimed!</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center bg-card/5 rounded-lg p-2">
            <span className="text-sm">Points Earned:</span>
            <span className="text-2xl font-bold">+{dailyReward.pointsEarned}</span>
          </div>

          <div className="flex justify-between items-center bg-card/5 rounded-lg p-2">
            <span className="text-sm">Total Points:</span>
            <span className="text-lg font-semibold">{dailyReward.totalPoints}</span>
          </div>

          <div className="flex justify-between items-center bg-card/5 rounded-lg p-2">
            <span className="text-sm">Streak:</span>
            <span className="text-lg font-semibold">{dailyReward.consecutiveDays} day{dailyReward.consecutiveDays > 1 ? 's' : ''} 🔥</span>
          </div>
        </div>

        {dailyReward.streakBroken && (
          <div className="bg-orange-500/50 rounded-lg p-2 mb-3 text-sm">
            ⚠️ Your streak was broken, but you've started a new one!
          </div>
        )}

        <div className="text-sm text-white/90 italic">
          {dailyReward.message}
        </div>

        <div className="mt-4 text-xs text-white/70">
          💡 Use your points for discounts on paid events!
        </div>
      </div>
    </div>
  );
};

export default DailyRewardNotification;
