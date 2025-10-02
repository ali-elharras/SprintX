# University Event Management System

A comprehensive MERN stack application for managing university events, allowing students, staff, TAs, professors, and vendors to interact with campus activities.

## Features Implemented

### User Stories Completed:

- **US#1**: Student/Staff/TA/Professor sign up (2.5 marks) ✅
- **US#2**: Vendor sign up (2 marks) ✅
- **US#9**: Login functionality (3 marks) ✅
- **US#10**: Logout functionality (3 marks) ✅

## Project Structure

```
university-event-management/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB models (User, Vendor)
│   ├── routes/             # API routes (auth)
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication & error handling
│   ├── config/            # Database configuration
│   └── server.js          # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (AuthContext)
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Utility functions
│   │   └── theme.js       # Design system theme
│   └── public/
└── README.md
```

## Design System

The application uses a comprehensive design system with:

- **Color System**: Primary brand colors, event-type specific colors, semantic colors, role-based colors
- **Typography**: Font families, sizes, weights, and spacing
- **Components**: Styled buttons, cards, inputs, navigation, modals, and more
- **Theme Integration**: Consistent styling across all components

## Key Features

### Authentication System

- **JWT-based authentication** with secure token management
- **Role-based access control** for different user types
- **Password hashing** using bcryptjs
- **Form validation** with yup and react-hook-form
- **Protected routes** with React Router

### User Management

- **Multi-role support**: Student, Staff, TA, Professor, Admin, Events Office
- **Vendor registration** with business verification workflow
- **Profile management** with role-specific fields
- **Account status tracking** and verification

### UI/UX

- **Responsive design** with mobile-first approach
- **Theme-based styling** using the provided design system
- **Interactive components** with hover effects and animations
- **Toast notifications** for user feedback
- **Loading states** and error handling

## Technology Stack

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** and security middleware

### Frontend

- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Hook Form** for form management
- **Yup** for validation schemas
- **Axios** for API communication
- **React Hot Toast** for notifications

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy `.env` file and update with your MongoDB URI and JWT secret
   - Set `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL`

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Update `.env` with your backend API URL (`REACT_APP_API_URL`)

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication Routes

- `POST /api/auth/register/user` - Register university member
- `POST /api/auth/register/vendor` - Register vendor
- `POST /api/auth/login` - Login user/vendor
- `POST /api/auth/logout` - Logout (protected)
- `GET /api/auth/me` - Get current profile (protected)

## User Roles and Permissions

### University Members

- **Student**: Register for events, view campus activities
- **Staff**: Access staff events and training sessions
- **TA**: Find TA-specific workshops and development opportunities
- **Professor**: Propose academic events and manage workshops
- **Admin**: Full system management capabilities
- **Events Office**: Oversee event planning and approvals

### Vendors

- **Registration**: Submit business information and documentation
- **Verification**: Await admin approval for account activation
- **Participation**: Apply for relevant campus events once approved

## Security Features

- **Password Requirements**: Minimum 8 characters with mixed case and numbers
- **JWT Token Management**: Secure token storage and automatic cleanup
- **Input Validation**: Both client-side and server-side validation
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers

## Design System Usage

```javascript
import theme, { getEventTypeColor, getRoleColor } from './theme';

// Using colors
<div style={{ background: theme.colors.primary.gradient }}>

// Using button styles
<button style={{
  ...theme.components.button.primary,
  fontSize: theme.typography.fontSize.base
}}>

// Using helper functions
const color = getEventTypeColor('bazaar'); // Returns #10b981
const roleColor = getRoleColor('student'); // Returns role-specific color
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
