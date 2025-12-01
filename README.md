# University Event Management System

A comprehensive MERN stack application for managing university events, sports facilities, conferences, workshops, and vendor participation. The system provides a complete platform for students, staff, TAs, professors, vendors, and administrators to interact with campus activities.

## 🚀 Features Overview

### Core Functionality
- **Event Management**: Create, browse, register, and manage diverse campus events
- **Payment Processing**: Integrated Stripe payment system with automated receipts
- **QR Code System**: Automated QR code generation for event access
- **Gym & Sports**: Court reservations and gym session management
- **Conference & Workshops**: Academic event planning and registration
- **Vendor Management**: Bazaar applications, booth rentals, and vendor verification
- **Wallet System**: Digital wallet for transactions and refunds
- **Loyalty Program**: Rewards system for active participants
- **Rating & Reviews**: Event feedback and rating system
- **Notifications**: Real-time alerts and email notifications
- **Admin Dashboard**: Comprehensive management and analytics tools

## 📋 Detailed Features

### 👤 Authentication & User Management
- **Multi-role Registration**: Students, Staff, TAs, Professors, Admins, Events Office
- **Vendor Registration**: Business verification workflow with admin approval
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Account activation via email
- **Password Management**: Forgot password, reset password functionality
- **Account Status**: Active, banned, pending verification states
- **Profile Management**: Role-specific profile fields and preferences

### 🎫 Event System
- **Event Types**: 
  - General Campus Events
  - Bazaars & Markets
  - Sports Events
  - Conferences
  - Workshops
  - Trips & Excursions
- **Event Features**:
  - Event creation with rich details
  - Category and tag-based organization
  - Capacity management
  - Date and location tracking
  - Image uploads (ImageKit integration)
  - Registration system with waitlist
  - Event ratings and reviews
  - Favorites/bookmarking
  - Event search and filtering

### 💳 Payment & Financial Management
- **Stripe Integration**: 
  - Secure payment processing
  - Test mode and live mode support
  - Multiple payment methods
- **Automated Receipts**: 
  - Professional email receipts
  - Unique receipt numbers
  - Transaction tracking
- **Digital Wallet**: 
  - User balance management
  - Transaction history
  - Refund processing
  - Payment for events and services
- **Loyalty Program**:
  - Points accumulation
  - Rewards system
  - Special offers for active users

### 🎫 QR Code System
- **Automatic Generation**: Unique QR codes for event attendees
- **Email Distribution**: Personalized QR code emails with event details
- **Security Features**: SHA-256 hashed verification tokens
- **Event Access**: QR codes for entry verification
- **Professional Templates**: Beautiful HTML email designs

### 🏋️ Sports & Recreation
- **Court Reservations**:
  - Basketball, Tennis, Volleyball courts
  - Time slot booking system
  - Conflict detection
  - Automated reminders
- **Gym Sessions**:
  - Session scheduling
  - Capacity management
  - Registration tracking
  - Attendance monitoring

### 🎓 Academic Events
- **Conference Management**:
  - Conference proposals
  - Speaker management
  - Attendee registration
  - Session scheduling
- **Workshops**:
  - Workshop creation
  - Skill-based categorization
  - Certificate tracking
  - Materials distribution

### 🏪 Vendor & Bazaar Management
- **Vendor Applications**:
  - Bazaar participation requests
  - Booth rental applications
  - Visitor email registration
  - Application status tracking
- **Admin Approval Workflow**:
  - Application review
  - Approval/rejection system
  - Comment and feedback
- **Booth Polling**: Community voting on booth selections
- **Payment Integration**: Automated payment processing for approved applications

### 📧 Communication System
- **Email Service**: 
  - Nodemailer integration
  - Professional email templates
  - Registration confirmations
  - Payment receipts
  - QR code delivery
  - Event reminders
  - Password reset emails
- **Notifications**:
  - In-app notifications
  - Email alerts
  - Event updates
  - Payment confirmations

### 📊 Admin & Reporting
- **Admin Dashboard** (`/admin-dashboard`):
  - **Application Management**: Central hub for managing vendor applications
  - **Real-time Statistics**: Total, pending, approved, and rejected applications
  - **Dual Application Types**: Bazaar and booth applications
  - **Filtering System**: Filter by status (pending/approved/rejected) and type (bazaar/booth)
  - **Application Actions**: 
    - Approve applications with admin comments
    - Reject applications with feedback
    - View detailed application information
  - **Application Details Display**:
    - Business/vendor information
    - Event details and dates
    - Financial information (booth fees, expected revenue)
    - Visitor email lists for booth applications
    - Application timestamps and status history
  - **Responsive Design**: Modern gradient UI with statistics cards

- **User Management** (`/admin-users`):
  - View all users with role-based filtering
  - Account activation/deactivation
  - Ban/unban functionality with modal confirmation
  - User search and filtering
  - Role management (Student, Staff, TA, Professor, Admin, Events Office)
  - Account status monitoring
  - Vendor verification status

- **Reports & Analytics** (`/reports`):
  - Event attendance reports
  - Revenue reports with financial summaries
  - User activity analytics
  - Registration statistics
  - Excel export functionality
  - Booth poll results and analytics

- **Admin Comments System** (`/admin-comments`):
  - Review and manage comments on applications
  - Track admin feedback history
  - Application decision documentation

### 🔒 Security Features
- **Password Security**: 
  - Bcrypt hashing
  - Minimum complexity requirements
  - Secure reset workflow
- **JWT Tokens**: 
  - Secure authentication
  - Token expiration
  - Automatic cleanup
- **Input Validation**: 
  - Server-side validation with express-validator
  - Client-side validation with yup
  - XSS protection
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin security
- **Helmet Security**: HTTP security headers

## 📁 Project Structure

```
university-event-management/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   ├── EventPayment.js
│   │   ├── EventRating.js
│   │   ├── Wallet.js
│   │   ├── Court.js
│   │   ├── CourtReservation.js
│   │   ├── GymSession.js
│   │   ├── GymRegistration.js
│   │   ├── Conference.js
│   │   ├── Workshop.js
│   │   ├── BazaarApplication.js
│   │   ├── BoothApplication.js
│   │   ├── BoothPoll.js
│   │   ├── LoyaltyProgram.js
│   │   └── Notification.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── createEvents.js
│   │   ├── registrations.js
│   │   ├── payments.js
│   │   ├── eventPayments.js
│   │   ├── wallet.js
│   │   ├── courts.js
│   │   ├── gym.js
│   │   ├── conference.js
│   │   ├── workshop.js
│   │   ├── bazaar.js
│   │   ├── applications.js
│   │   ├── boothPolls.js
│   │   ├── admin.js
│   │   ├── ratings.js
│   │   ├── favorites.js
│   │   ├── files.js
│   │   ├── report.js
│   │   ├── VendorRouter.js
│   │   ├── LoyaltyRoutes.js
│   │   └── notifications.js
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── CreateEvent.js
│   │   ├── registrationController.js
│   │   ├── paymentController.js
│   │   ├── eventPaymentController.js
│   │   ├── walletController.js
│   │   ├── courtController.js
│   │   ├── gymController.js
│   │   ├── conferenceController.js
│   │   ├── workshopController.js
│   │   ├── bazaarController.js
│   │   ├── applicationController.js
│   │   ├── boothPollController.js
│   │   ├── adminController.js
│   │   ├── eventReviewController.js
│   │   ├── favoritesController.js
│   │   ├── fileController.js
│   │   ├── reportController.js
│   │   ├── notificationController.js
│   │   ├── VendorController.js
│   │   └── LoyaltyProgramController.js
│   ├── middleware/         # Auth & error handling
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── services/           # Business logic & integrations
│   │   ├── emailService.js
│   │   ├── qrCodeService.js
│   │   ├── eventReminderService.js
│   │   └── workshopCertificateScheduler.js
│   ├── utils/              # Helper functions
│   │   └── imageKitUploader.js
│   ├── scripts/            # Database maintenance scripts
│   │   ├── createAdminAccounts.js
│   │   ├── checkRegistrations.js
│   │   ├── cleanupCancelledRegistrations.js
│   │   ├── cleanupPendingRegistrations.js
│   │   ├── fixRegistrationIndexes.js
│   │   └── seedAdminUsers.js
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.js
│   │   │   ├── AdminSidebar.js
│   │   │   ├── EventCard.js
│   │   │   ├── EventPaymentModal.js
│   │   │   ├── EventEditModal.js
│   │   │   ├── CourtCard.js
│   │   │   ├── GymSessionCard.js
│   │   │   ├── RatingModal.js
│   │   │   ├── NotificationCenter.js
│   │   │   ├── WalletDashboard.js
│   │   │   ├── BoothPollManager.js
│   │   │   ├── BanUserModal.js
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── LandingPage.js
│   │   │   ├── Login.js
│   │   │   ├── SignupPage.js
│   │   │   ├── VendorLogin.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EventsPage.js
│   │   │   ├── EventDetailsPage.js
│   │   │   ├── CourtsPage.js
│   │   │   ├── GymSchedulePage.js
│   │   │   ├── Workshops.js
│   │   │   ├── CreateWorkshop.js
│   │   │   ├── MyRegistrations.js
│   │   │   ├── WalletPage.js
│   │   │   ├── LoyaltyProgram.js
│   │   │   ├── FavoritesPage.js
│   │   │   ├── EventsRatings.js
│   │   │   ├── BoothPolls.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminUserManagement.js
│   │   │   ├── AdminComments.js
│   │   │   ├── ReportsPage.js
│   │   │   ├── VendorDashboard.jsx
│   │   │   ├── PaymentSuccess.js
│   │   │   └── UploadedFilesPage.js
│   │   ├── context/        # React context (AuthContext)
│   │   ├── services/       # API service layer
│   │   ├── lib/            # UI utilities
│   │   ├── styles/         # CSS styles
│   │   └── theme.js        # Design system theme
│   ├── public/             # Static assets
│   ├── build/              # Production build
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color System**: 
  - Primary brand colors (purple gradient)
  - Event-type specific colors
  - Semantic colors (success, warning, error)
  - Role-based colors
- **Typography**: 
  - Font families (Inter, SF Pro)
  - Responsive font sizes
  - Font weights and spacing
- **Components**: 
  - Styled buttons with variants
  - Cards and containers
  - Form inputs and validation
  - Navigation and menus
  - Modals and dialogs
  - Tooltips and popovers
  - Data tables
  - Charts and visualizations
- **UI Library**: Radix UI for accessible components
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icons
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

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Stripe** for payment processing
- **Nodemailer** for email services
- **QRCode** for QR code generation
- **ImageKit** for image hosting
- **express-validator** for input validation
- **node-cron** for scheduled tasks
- **helmet** for security headers
- **CORS** and rate limiting middleware

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form management
- **Yup** for validation schemas
- **Axios** for API communication
- **Stripe.js** for payment UI
- **Recharts** for data visualization
- **React Hot Toast** / **Sonner** for notifications
- **Lucide React** for icons
- **XLSX** for Excel export
- **Lottie React** for animations

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager
- Stripe account (for payment processing)
- ImageKit account (optional, for image hosting)

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

   Create a `.env` file in the backend directory with the following variables:
   
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/university-events
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university-events
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # URLs
   BACKEND_URL=http://localhost:8080
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration (Nodemailer)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   
   # Stripe Payment
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   
   # ImageKit (Optional)
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
   ```

   **Important Notes:**
   - For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
   - Get Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - ImageKit keys from [ImageKit Dashboard](https://imagekit.io/dashboard)

4. **macOS Port 5000 Conflict**: 
   
   If you encounter `EADDRINUSE` error on port 5000, use port 8080 instead (already set in example above), as macOS uses port 5000 for AirPlay Receiver.

5. Start the server:

   ```bash
   # Development mode with auto-reload
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

   Create a `.env` file in the frontend directory:
   
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## 🌐 Port Configuration

### Default Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Changing Ports

To run on different ports:

1. **Backend**: Update `PORT` in `backend/.env`
2. **Frontend**: Update `REACT_APP_API_URL` in `frontend/.env` to match your backend port

### macOS Port 5000 Conflict

On macOS Monterey and later, port 5000 is used by AirPlay Receiver. If you encounter this error:
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Recommended**: Use port 8080 by setting `PORT=8080` in `backend/.env`
2. **Alternative**: Disable AirPlay Receiver in System Preferences > Sharing > AirPlay Receiver

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/user` - Register university member
- `POST /api/auth/register/vendor` - Register vendor
- `POST /api/auth/login` - Login user/vendor
- `POST /api/auth/logout` - Logout (protected)
- `GET /api/auth/me` - Get current profile (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)
- `POST /api/events/:id/favorite` - Toggle favorite (protected)

### Registrations
- `GET /api/registrations` - Get user registrations (protected)
- `POST /api/registrations` - Register for event (protected)
- `DELETE /api/registrations/:id` - Cancel registration (protected)
- `GET /api/registrations/event/:eventId` - Get event registrations (admin)

### Payments & Wallet
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/verify` - Verify payment completion
- `GET /api/wallet/balance` - Get wallet balance (protected)
- `POST /api/wallet/add-funds` - Add funds to wallet (protected)
- `GET /api/wallet/transactions` - Get transaction history (protected)

### Courts & Gym
- `GET /api/courts` - Get all courts
- `POST /api/courts/reserve` - Reserve court (protected)
- `GET /api/courts/my-reservations` - Get user reservations (protected)
- `GET /api/gym/sessions` - Get gym sessions
- `POST /api/gym/register` - Register for gym session (protected)

### Conferences & Workshops
- `GET /api/conferences` - Get all conferences
- `POST /api/conferences` - Create conference (protected)
- `GET /api/workshops` - Get all workshops
- `POST /api/workshops` - Create workshop (protected)

### Bazaar & Vendor
- `POST /api/bazaar/apply` - Submit bazaar application (vendor)
- `GET /api/bazaar/applications` - Get vendor applications (vendor)
- `GET /api/bazaar/all-applications` - Get all applications (admin)
- `PUT /api/bazaar/:id/approve` - Approve application (admin)
- `PUT /api/bazaar/:id/reject` - Reject application (admin)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban user
- `PUT /api/admin/users/:id/unban` - Unban user
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/reports` - Generate reports

### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Loyalty Program
- `GET /api/loyalty/points` - Get user points (protected)
- `POST /api/loyalty/redeem` - Redeem points (protected)
- `GET /api/loyalty/rewards` - Get available rewards

## 👥 User Roles and Permissions

### University Members

- **Student**: 
  - Register for events and activities
  - Reserve sports facilities
  - Join gym sessions and workshops
  - Manage digital wallet
  - Rate and review events
  - Earn loyalty points
  
- **Staff**: 
  - Access staff-specific events
  - Participate in training sessions
  - All student permissions

- **TA**: 
  - Find TA-specific workshops
  - Access development opportunities
  - All student permissions

- **Professor**: 
  - Propose academic events
  - Create and manage workshops
  - Organize conferences
  - All student permissions

- **Admin**: 
  - Full system management
  - User account control (ban/unban)
  - Event approval and oversight
  - Vendor verification
  - System analytics and reports
  - Payment monitoring

- **Events Office**: 
  - Event planning and creation
  - Event approval workflow
  - Coordinate with vendors
  - Manage event logistics

### Vendors

- **Registration**: Submit business information and documentation
- **Application Process**: Apply for bazaars and booth rentals
- **Visitor Management**: Register visitor emails for QR code access
- **Verification**: Await admin approval for account activation
- **Payment**: Process payments for approved applications
- **Participation**: Access approved events and manage booth setup

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **JWT Token Management**: 
  - Secure token storage in httpOnly cookies
  - Automatic token cleanup on logout
  - Token expiration handling
  - Refresh token support
- **Input Validation**: 
  - Client-side validation with yup
  - Server-side validation with express-validator
  - SQL injection prevention
  - XSS protection
- **Rate Limiting**: API request throttling to prevent abuse
- **CORS Protection**: Configured cross-origin request security
- **Helmet Security**: Comprehensive HTTP security headers
- **Password Hashing**: Bcrypt with salt rounds
- **Email Verification**: Account activation requirement
- **Payment Security**: PCI-compliant Stripe integration
- **QR Code Verification**: SHA-256 hashed tokens for event access

## 🎨 Design System Usage

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

## 🚀 Quick Start Guide

### For First-Time Setup:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd university-event-management
   ```

2. **Set up MongoDB**
   - Install MongoDB locally OR create a MongoDB Atlas account
   - Create a database named `university-events`

3. **Configure Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with required variables (see Setup Instructions)
   npm run dev
   ```

4. **Configure Frontend**
   ```bash
   cd frontend
   npm install
   # Create .env file with API URL
   npm start
   ```

5. **Create Admin Account**
   - Register a user through the UI
   - Manually update the user's role to 'admin' in MongoDB

6. **Test Payment System**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

### Running the Application:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Access the application at `http://localhost:3000`

## 📚 Additional Documentation

- **[QR Code System Guide](./QR_CODE_SYSTEM_GUIDE.md)** - Complete guide to the QR code feature
- **[Receipt Email Guide](./RECEIPT_EMAIL_GUIDE.md)** - Payment receipt email documentation
- **[QR Code Fix](./QR_CODE_FIX.md)** - Technical details on QR code implementation

## 🧪 Testing

### Test Accounts

Create test accounts for different roles:

```javascript
// Student Account
{
  email: "student@university.edu",
  password: "Student123!",
  role: "student"
}

// Vendor Account
{
  email: "vendor@company.com",
  password: "Vendor123!",
  role: "vendor",
  businessName: "Test Company"
}

// Admin Account (requires manual database update)
{
  email: "admin@university.edu",
  password: "Admin123!",
  role: "admin"
}
```

### Test Payment Cards (Stripe)

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

Any future expiry date and any 3-digit CVC

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use (macOS)**
   - Solution: Use port 8080 instead of 5000 (see Port Configuration section)

2. **MongoDB connection error**
   - Check MongoDB is running: `mongod --version`
   - Verify connection string in `.env`
   - Ensure database name is correct

3. **Email not sending**
   - For Gmail, use App Password, not regular password
   - Check EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD in `.env`
   - For development, emails appear in console with preview URLs

4. **Stripe payment fails**
   - Verify STRIPE_SECRET_KEY in backend `.env`
   - Verify STRIPE_PUBLISHABLE_KEY in frontend `.env`
   - Use test mode keys for development

5. **CORS errors**
   - Check FRONTEND_URL in backend `.env` matches frontend port
   - Restart backend server after changing `.env`

6. **QR codes not generating**
   - Check that `qrcode` package is installed
   - Verify email service is configured
   - Check console logs for QR generation errors

## 📈 Performance Optimization

- **Database Indexing**: Key fields indexed for faster queries
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: ImageKit CDN integration
- **Caching**: API response caching where appropriate
- **Code Splitting**: React lazy loading for routes
- **Debouncing**: Search and filter operations debounced

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed
4. **Test your changes**
   - Ensure all existing features still work
   - Test edge cases
5. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of your changes"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Submit a pull request**
   - Describe your changes in detail
   - Reference any related issues
   - Wait for code review

### Code Style Guidelines:
- Use meaningful variable and function names
- Follow existing file structure
- Add JSDoc comments for functions
- Keep components small and focused
- Use async/await for asynchronous operations

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👨‍💻 Development Team

**SprintX University Event Management System**

Developed as part of the Advanced Computer Lab 2025 project at the German University in Cairo.

### Repository
- **GitHub**: [Advanced-Computer-Lab-2025/SprintX](https://github.com/Advanced-Computer-Lab-2025/SprintX)
- **Branch**: main

## 📞 Contact & Support

For questions, issues, or support:

- **Email**: support@sprintx.edu
- **GitHub Issues**: [Report an issue](https://github.com/Advanced-Computer-Lab-2025/SprintX/issues)
- **Documentation**: See guides in the repository

## 🎯 Future Enhancements

Planned features for future releases:

- [ ] Mobile application (React Native)
- [ ] Real-time chat support
- [ ] Advanced analytics dashboard
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Social media sharing
- [ ] Multi-language support
- [ ] Advanced search with filters
- [ ] Event recommendations based on user preferences
- [ ] Push notifications
- [ ] Attendance tracking with QR code scanning
- [ ] Vendor performance analytics
- [ ] Automated event reminders
- [ ] Video streaming for virtual events

## 🙏 Acknowledgments

- **MongoDB** for the robust database solution
- **Stripe** for secure payment processing
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **ImageKit** for image hosting and optimization
- **All open-source contributors** whose libraries made this project possible

---

## 📝 Version History

### v1.0.0 (Current)
- ✅ Complete authentication system
- ✅ Event management with multiple event types
- ✅ Payment integration with Stripe
- ✅ QR code system for event access
- ✅ Digital wallet functionality
- ✅ Sports facilities booking
- ✅ Vendor and bazaar management
- ✅ Admin dashboard with analytics
- ✅ Email notification system
- ✅ Loyalty program
- ✅ Rating and review system

---

**Built with ❤️ by the SprintX Team**

*Last Updated: December 2025*
