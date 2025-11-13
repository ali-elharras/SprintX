# Cleanup Pending Registrations

## Why This Script is Needed

After restructuring the payment flow, registrations are now only created **after successful payment**, not before. This means there should be no "pending" status registrations in the database.

This script removes any old pending registrations that were created before the payment flow was restructured.

## How to Run

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Run the cleanup script:
   ```bash
   node scripts/cleanupPendingRegistrations.js
   ```

3. The script will:
   - Connect to your MongoDB database
   - Find all registrations with `status: 'pending'` or `paymentStatus: 'pending'`
   - Display the count and details
   - Delete all pending registrations
   - Close the database connection

## What Gets Deleted

- All registrations with `status: 'pending'`
- All registrations with `paymentStatus: 'pending'`

## Important Notes

- Users who had pending registrations will need to re-register and complete payment
- This is a one-time cleanup script
- Future registrations will only be created after successful payment
- No pending registrations should exist going forward

## After Running the Script

The database will only contain:
- ✅ Confirmed registrations (payment completed)
- ✅ Attended registrations (user checked in)
- ❌ No pending registrations

This ensures a clean database state matching the new payment flow.
