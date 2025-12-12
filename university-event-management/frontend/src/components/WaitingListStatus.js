import React from 'react';
import Card from './Card';

const WaitingListStatus = ({ position, eventTitle }) => {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">⏳</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              You're on the Waiting List
            </h3>
            <p className="text-gray-700 mb-4">
              {eventTitle || 'This event'} is currently full. You've been added to the waiting list.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Position:</span>
                <span className="text-3xl font-bold text-orange-600">
                  #{position}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  You'll be automatically notified if a spot becomes available
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  If someone cancels, users are promoted in order from the waiting list
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  You can cancel your waiting list position at any time
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Keep checking back! Spots often open up as the event date approaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WaitingListStatus;
