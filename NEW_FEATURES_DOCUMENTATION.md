# New Features Implementation Guide

## 1. Event Registration Waiting List

### Overview
When an event reaches maximum capacity, users can now join a waiting list instead of being turned away. If someone cancels their registration, the first person on the waiting list is automatically promoted.

### Backend Implementation

#### Models Updated
- **Event Model** (`backend/models/Event.js`):
  - Added `waitingList` array field containing user information and join timestamp
  - Each entry stores: user reference, email, firstName, lastName, universityId, and joinedAt date

- **Registration Model** (`backend/models/Registration.js`):
  - Added `waitlisted` status to the status enum
  - Added `waitlistPosition` field

#### API Endpoints

**Add to Waiting List**
- Automatically handled in `POST /api/registrations`
- When event is full, user is added to waiting list instead of rejected
- Returns: `{ onWaitingList: true, waitingListPosition: number }`

**View Waiting List**
- `GET /api/events/:id/waiting-list`
- Access: Admin, Events Office, or Event Organizer
- Returns list of users on waiting list with their positions

#### Controller Logic
- **Registration Controller** (`registrationController.js`):
  - Modified `registerForEvent()` to check capacity and add to waiting list if full
  - Modified `cancelRegistration()` to promote first person from waiting list when someone cancels

### Frontend Implementation

#### Components Created
- **WaitingListStatus.js**: Displays user's position on waiting list with helpful information
- Can be integrated into event detail pages and user registration views

### Usage Example

```javascript
// User tries to register for full event
const response = await registrationAPI.registerForEvent(data);

if (response.data.onWaitingList) {
  // Show waiting list status
  <WaitingListStatus 
    position={response.data.waitingListPosition}
    eventTitle={event.title}
  />
}
```

---

## 2. Daily Reward System

### Overview
Users earn reward points by logging in daily. The more consecutive days they log in, the more points they earn. Points can be redeemed for discounts on paid events (like trips).

### Reward Structure
- **First login (or streak broken)**: 10 points
- **Consecutive days**: +2 points per day
- **Maximum**: 30 points per day (at 11+ day streak)
- **Conversion**: 10 points = 1 EGP discount
- **Maximum discount**: 50% of event cost

### Backend Implementation

#### Models Updated
- **User Model** (`backend/models/User.js`):
  - `rewardPoints`: Total accumulated points
  - `lastDailyReward`: Timestamp of last reward claim
  - `consecutiveDays`: Current login streak

#### API Endpoints

**Get Reward Info**
- `GET /api/rewards/me`
- Returns: current points, streak, next reward amount, and time until next reward

**Calculate Discount**
- `POST /api/rewards/calculate-discount`
- Body: `{ eventCost, pointsToUse }`
- Returns: discount amount, final cost, points remaining

**Leaderboard**
- `GET /api/rewards/leaderboard`
- Returns: top users by points and current user's rank

#### Controller Logic

**Auth Controller** (`authController.js`):
- Added `processDailyReward()` function that:
  - Checks if user already claimed today
  - Calculates consecutive days
  - Awards appropriate points
  - Returns reward info

**Rewards Controller** (`rewardsController.js`):
- Handles reward queries and discount calculations
- Validates point availability before redemption

**Registration Controller** (`registrationController.js`):
- Modified to accept `useRewardPoints` and `pointsToRedeem` parameters
- Calculates final cost with discount before payment
- Deducts points from user after successful registration

### Frontend Implementation

#### Components Created

1. **RewardsDashboard.js**: Full dashboard showing:
   - Current points and streak
   - Next reward information
   - Leaderboard
   - How-it-works guide

2. **DailyRewardNotification.js**: Pop-up notification on login showing:
   - Points earned
   - Total points
   - Current streak
   - Motivational message

3. **RewardPointsRedemption.js**: Component for event registration showing:
   - Available points
   - Points to use input
   - Real-time discount calculation
   - Final price breakdown

### Usage Example

#### Show Daily Reward on Login
```javascript
// In your login success handler
const { data } = await authAPI.login(credentials);

if (data.dailyReward && data.dailyReward.claimed) {
  // Show notification
  <DailyRewardNotification 
    dailyReward={data.dailyReward}
    onClose={() => setShowReward(false)}
  />
}
```

#### Display Rewards Dashboard
```javascript
// Add to your app's navigation or profile page
<Route path="/rewards" element={<RewardsDashboard />} />
```

#### Use Points During Registration
```javascript
// In registration form
const [rewardInfo, setRewardInfo] = useState(null);

<RewardPointsRedemption
  eventCost={event.cost}
  onPointsChange={(info) => setRewardInfo(info)}
/>

// Then when submitting registration:
const regData = {
  ...otherData,
  useRewardPoints: rewardInfo?.pointsToUse > 0,
  pointsToRedeem: rewardInfo?.pointsToUse || 0,
};
```

---

## Integration Notes

### Authentication Flow
The daily reward is automatically processed during login in the `authController`. The response includes:
```javascript
{
  user: { ...userData, rewardPoints, consecutiveDays },
  dailyReward: {
    claimed: true,
    pointsEarned: 10,
    totalPoints: 150,
    consecutiveDays: 5,
    message: "5 day streak! Keep it up!"
  }
}
```

### Event Registration Flow
1. User selects event with cost > 0
2. RewardPointsRedemption component shows available points
3. User selects points to use
4. System calculates discount (max 50%)
5. User proceeds to payment with reduced price
6. Points are deducted after successful registration

### Waiting List Flow
1. User tries to register for full event
2. System adds user to waiting list
3. User sees WaitingListStatus component with position
4. When someone cancels:
   - First person in waiting list is promoted
   - They receive notification (to be implemented)
   - Next person becomes #1 on list

---

## Future Enhancements

### For Waiting List:
- [ ] Email notifications when promoted from waiting list
- [ ] Automatic registration window (24 hours to complete registration)
- [ ] Waiting list management dashboard for admins
- [ ] Remove from waiting list functionality

### For Rewards System:
- [ ] Weekly/monthly bonus points
- [ ] Achievements and badges
- [ ] Bonus points for attending events
- [ ] Referral rewards
- [ ] Gift points to friends
- [ ] Special events with double points

---

## Testing Checklist

### Waiting List
- [ ] User can join waiting list when event is full
- [ ] User sees correct position in waiting list
- [ ] User is promoted when someone cancels
- [ ] Admin/organizer can view waiting list
- [ ] Multiple users are handled in correct order

### Daily Rewards
- [ ] User receives points on first login
- [ ] Consecutive logins increase points
- [ ] Streak resets after missing a day
- [ ] Points are correctly calculated (max 30)
- [ ] Discount calculation is accurate
- [ ] Max 50% discount is enforced
- [ ] Points are deducted after successful registration
- [ ] Leaderboard shows correct rankings

---

## Database Migrations

No migrations are strictly required as Mongoose will add the new fields automatically, but if you want to initialize existing users:

```javascript
// Script to initialize reward fields for existing users
db.users.updateMany(
  { rewardPoints: { $exists: false } },
  { 
    $set: { 
      rewardPoints: 0,
      consecutiveDays: 0,
      lastDailyReward: null
    }
  }
);

// Script to initialize waiting list for existing events
db.events.updateMany(
  { waitingList: { $exists: false } },
  { $set: { waitingList: [] } }
);
```

---

## API Documentation

### Rewards Endpoints

#### GET /api/rewards/me
Get current user's reward information.

**Response:**
```json
{
  "success": true,
  "data": {
    "rewardPoints": 150,
    "consecutiveDays": 5,
    "lastDailyReward": "2025-01-15T08:30:00Z",
    "canClaimToday": false,
    "nextRewardIn": 43200000,
    "nextRewardAmount": 20,
    "pointsToMoneyRatio": "10 points = 1 EGP discount",
    "maxDiscountPercent": 50
  }
}
```

#### POST /api/rewards/calculate-discount
Calculate discount for given points.

**Request Body:**
```json
{
  "eventCost": 100,
  "pointsToUse": 250
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalCost": 100,
    "pointsRequested": 250,
    "pointsUsed": 250,
    "discount": 25,
    "finalCost": 75,
    "pointsRemaining": 125
  }
}
```

#### GET /api/rewards/leaderboard?limit=10
Get top users by points.

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "name": "John Doe",
        "points": 500,
        "streak": 25
      }
    ],
    "currentUser": {
      "rank": 15,
      "name": "Jane Smith",
      "points": 150,
      "streak": 5
    }
  }
}
```

### Waiting List Endpoints

#### GET /api/events/:id/waiting-list
Get waiting list for an event (Admin/Organizer only).

**Response:**
```json
{
  "success": true,
  "data": {
    "eventTitle": "Annual Trip to Alexandria",
    "count": 5,
    "waitingList": [
      {
        "user": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "universityId": "12345",
        "joinedAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

## Conclusion

Both features are now fully integrated into the backend with working API endpoints. Frontend components are created and ready to be integrated into your existing UI. The waiting list provides a better user experience for popular events, while the daily rewards system encourages regular engagement with the platform.
