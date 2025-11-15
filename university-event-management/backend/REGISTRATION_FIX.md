# Registration Duplicate Key Error - Fixed

## Problem
Users were encountering a MongoDB duplicate key error when attempting to register for events:
```
MongoServerError: E11000 duplicate key error collection: university-events.registrations 
index: event_1_email_1 dup key: { event: ObjectId('...'), email: "..." }
```

## Root Causes

1. **Old Database Indexes**: The database had simple unique indexes (`event_1_email_1` and `event_1_universityId_1`) without partial filters, preventing any duplicate combinations even for cancelled registrations.

2. **Pending Registrations**: When users attempted to register for paid events but didn't complete payment, "pending" registrations remained in the database and blocked future registration attempts.

3. **Index Mismatch**: The Registration model defined partial unique indexes that should only apply to active registrations, but the database still had the old simple indexes.

## Solution Applied

### 1. Fixed Database Indexes
- **Dropped old indexes**: Removed `event_1_email_1` and `event_1_universityId_1`
- **Applied partial indexes**: New indexes only enforce uniqueness for registrations with status "confirmed" or "attended"
- **Script**: `backend/scripts/fixRegistrationIndexes.js`

### 2. Updated Registration Controller
- Enhanced duplicate check to include "pending" status
- Added specific error message for pending registrations
- File: `backend/controllers/registrationController.js`

### 3. Cleaned Up Pending Registrations
- Removed stale pending registrations that were blocking new attempts
- Script: `backend/scripts/deleteRegistration.js`

## How It Works Now

### For Free Events
1. User submits registration form
2. Backend checks for existing registrations (pending, confirmed, attended)
3. If no duplicates, registration is created with status "confirmed"
4. User is immediately registered

### For Paid Events
1. User submits registration form
2. Backend checks for existing registrations (pending, confirmed, attended)
3. If no duplicates, registration data is returned (NOT saved to DB yet)
4. Payment modal opens
5. **Only after successful payment** is the registration created with status "confirmed"
6. If payment fails/is cancelled, no registration record is created

### Re-registration After Cancellation
Users can now re-register for events after cancelling because:
- Cancelled registrations don't trigger the unique index (only confirmed/attended do)
- The controller only checks for active registrations

## Prevention of Duplicates

The system prevents duplicates through:

1. **Database Level**: Partial unique indexes on `(event, email)` and `(event, universityId)` for confirmed/attended registrations only

2. **Application Level**: Backend controller checks for existing pending, confirmed, or attended registrations before allowing new registration attempts

3. **User Experience**: Clear error messages guide users:
   - "You have a pending registration..." - prompts completion of payment
   - "You are already registered..." - indicates active registration exists

## Scripts Available

### Diagnostic Scripts
- `findRegistration.js <email> <eventId>` - Find registrations for specific user/event
- `checkDuplicateRegistrations.js` - Scan for duplicate registrations
- `checkRegistrations.js` - General registration statistics

### Maintenance Scripts  
- `fixRegistrationIndexes.js` - Fix database indexes (already run)
- `deleteRegistration.js <registrationId>` - Delete specific registration
- `cleanupPendingRegistrations.js` - Auto-cleanup old pending registrations (>24hrs)
- `cleanupCancelledRegistrations.js` - Remove old cancelled registrations

## Ongoing Maintenance

### Automatic Cleanup (Recommended)
Set up a cron job or scheduled task to run `cleanupPendingRegistrations.js` daily:
```bash
# Example cron (runs daily at 2 AM)
0 2 * * * cd /path/to/backend && node scripts/cleanupPendingRegistrations.js
```

### Manual Cleanup
If users report registration issues:
1. Run `findRegistration.js` with their email and event ID
2. Check for pending registrations
3. Delete old pending registrations with `deleteRegistration.js`

## Testing the Fix

1. Try to register for a free event - should work immediately
2. Try to register for a paid event:
   - Should show payment modal
   - Cancel payment - no registration should be created
   - Try again - should work (no duplicate error)
3. Register and complete payment - should succeed
4. Try to register again - should show "already registered" message

## Important Notes

- The fix has been applied and indexes are now correct
- Pending registrations are temporary and should be cleaned up regularly
- The system now properly handles the payment flow without creating database records until payment is complete
- Users can re-register after cancelling (cancelled registrations don't block future attempts)

## Files Modified

1. `backend/controllers/registrationController.js` - Enhanced duplicate checking
2. `backend/scripts/fixRegistrationIndexes.js` - New script to fix indexes
3. `backend/scripts/findRegistration.js` - New diagnostic script
4. `backend/scripts/deleteRegistration.js` - New maintenance script
5. `backend/scripts/checkDuplicateRegistrations.js` - New diagnostic script

## Status: ✅ RESOLVED

The duplicate key error has been fixed. Users can now:
- Register for events without encountering duplicate key errors
- Re-register after cancelling
- Complete payment flows without database conflicts
