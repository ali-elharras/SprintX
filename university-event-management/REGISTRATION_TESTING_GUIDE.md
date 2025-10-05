# Event Registration Feature - Testing Guide

This document provides instructions for testing the newly implemented event registration feature for workshops and trips.

## Features Implemented

### Backend
- **Event Model**: Complete event management with support for workshops, trips, and other event types
- **Registration Model**: User registration system with validation and event linking
- **API Endpoints**: 
  - `/api/events` - Event management endpoints
  - `/api/registrations` - Registration management endpoints
- **Validation**: Comprehensive input validation using express-validator
- **Authorization**: Role-based access control for different user types

### Frontend
- **Registration Form**: Complete form with validation for user registration
- **Event Display**: Event cards showing details with registration capabilities
- **Events Page**: Comprehensive events listing with filtering and search
- **Navigation**: Updated navbar with events navigation

## Testing Instructions

### 1. Backend Setup and Testing

1. **Install Dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   - Ensure your `.env` file has:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     FRONTEND_URL=http://localhost:3000
     ```

3. **Start the Backend**:
   ```bash
   npm run dev
   ```

4. **Seed Sample Events** (Optional but recommended):
   ```bash
   node seedEvents.js
   ```

5. **Test API Endpoints** using tools like Postman or curl:

   **Get Events:**
   ```bash
   curl http://localhost:5000/api/events
   ```

   **Register for Event (example):**
   ```bash
   curl -X POST http://localhost:5000/api/registrations \
     -H "Content-Type: application/json" \
     -d '{
       "eventId": "EVENT_ID_HERE",
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe@university.edu",
       "universityId": "STU123456",
       "role": "student",
       "department": "Computer Science",
       "yearOfStudy": 3
     }'
   ```

### 2. Frontend Setup and Testing

1. **Install Dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**:
   - Create `.env` file in frontend directory:
     ```env
     REACT_APP_API_URL=http://localhost:5000/api
     ```

3. **Start the Frontend**:
   ```bash
   npm start
   ```

4. **Test User Registration Flow**:
   - Navigate to `http://localhost:3000`
   - Create a user account via the signup process
   - Log in with your credentials

### 3. End-to-End Testing

1. **Browse Events**:
   - After logging in, you should be redirected to the Events page
   - Verify that events are displayed correctly
   - Test the search and filter functionality

2. **Register for an Event**:
   - Click "Register Now" on any available event
   - Fill out the registration form with valid information:
     - First Name: Your first name
     - Last Name: Your last name
     - Email: Valid email address
     - University/Staff ID: Alphanumeric ID (e.g., STU123456)
     - Role: Select appropriate role (student, staff, ta, professor)
     - Department: Your department
     - Year of Study: (required for students)
     - Additional fields as needed
   - Submit the form

3. **Verify Registration**:
   - Check for success toast notification
   - Verify that the event's participant count increases
   - Check that the registration is recorded in the database

### 4. Test Cases to Verify

#### Registration Validation
- [ ] Required fields validation (first name, last name, email, university ID, role)
- [ ] Email format validation
- [ ] University ID format validation (alphanumeric only)
- [ ] Year of study required for students
- [ ] Phone number format validation (if provided)

#### Event Business Rules
- [ ] Cannot register for events that are full
- [ ] Cannot register for events past registration deadline
- [ ] Cannot register for events not open to user's role
- [ ] Cannot register for events not open to user's department (if specified)
- [ ] Cannot register twice for the same event

#### User Experience
- [ ] Form displays relevant fields based on role selection
- [ ] Error messages are clear and helpful
- [ ] Success feedback is provided
- [ ] Navigation between pages works correctly
- [ ] Events display correctly with proper formatting

#### API Functionality
- [ ] GET /api/events returns published events
- [ ] POST /api/registrations creates new registrations
- [ ] Proper error handling for invalid data
- [ ] Authentication works for protected endpoints

### 5. Sample Test Data

Use these sample registration data for testing:

**Student Registration:**
```json
{
  "eventId": "EVENT_ID",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@university.edu",
  "universityId": "STU789012",
  "role": "student",
  "department": "Computer Science",
  "yearOfStudy": 2,
  "phoneNumber": "+1-555-0123"
}
```

**Staff Registration:**
```json
{
  "eventId": "EVENT_ID",
  "firstName": "Bob",
  "lastName": "Smith",
  "email": "bob.smith@university.edu",
  "universityId": "STF456789",
  "role": "staff",
  "department": "Information Technology",
  "phoneNumber": "+1-555-0456"
}
```

### 6. Common Issues and Solutions

1. **CORS Issues**: Ensure FRONTEND_URL is set correctly in backend .env
2. **Database Connection**: Verify MongoDB connection string and database accessibility
3. **Authentication Issues**: Check JWT_SECRET configuration
4. **Validation Errors**: Review the error messages in browser console for detailed information

### 7. Database Verification

To verify registrations in MongoDB:

```javascript
// Connect to your MongoDB and run:
db.registrations.find().pretty()
db.events.find({}, {title: 1, currentParticipants: 1, maxParticipants: 1})
```

## Next Steps

After successful testing, consider implementing:
- Email notifications for successful registrations
- Registration cancellation functionality
- Event management interface for admins
- Payment processing for paid events
- Check-in system for event day
- Reporting and analytics for events

## Troubleshooting

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify database connectivity
4. Ensure all environment variables are set correctly
5. Clear browser cache and localStorage if needed

For additional support, refer to the API documentation or check the application logs for detailed error messages.