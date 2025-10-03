import React from "react";
import RegistrationForm from "../components/RegistrationForm";
import EventCard from "../components/EventCard";
import theme from "../theme";

// Mock event data for testing
const mockEvent = {
  _id: "mock-event-id",
  title: "React Workshop: Building Modern Web Applications",
  description: "Learn the fundamentals of React.js and build your first modern web application. This hands-on workshop covers components, state management, hooks, and more. Perfect for beginners and intermediate developers looking to enhance their skills.",
  type: "workshop",
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
  location: "Computer Science Building, Room 201",
  venue: "CS Building Lab",
  registrationRequired: true,
  registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 25,
  currentParticipants: 12,
  eligibleRoles: ["student", "staff", "ta", "professor"],
  status: "published",
  instructor: "Dr. Sarah Johnson",
  duration: 4,
  cost: 0,
  prerequisites: "Basic knowledge of HTML, CSS, and JavaScript",
  materials: "Laptop required. Development environment setup instructions will be provided.",
  tags: ["react", "web development", "javascript", "frontend"],
};

const mockTrip = {
  _id: "mock-trip-id",
  title: "University Trip to Tech Valley",
  description: "Join us for an exciting educational trip to Tech Valley to visit major technology companies including Google, Apple, and several innovative startups. This trip includes company tours, networking sessions, and career guidance talks.",
  type: "trip",
  startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
  location: "Silicon Valley, California",
  venue: "Various Tech Companies",
  registrationRequired: true,
  registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 30,
  currentParticipants: 18,
  eligibleRoles: ["student", "ta", "professor"],
  status: "published",
  itinerary: "Day 1: Google HQ tour and tech talk, Day 2: Apple campus visit and innovation workshop, Day 3: Startup visits and networking events",
  transportation: "Charter bus with Wi-Fi and refreshments provided",
  cost: 350,
  tags: ["tech", "industry visit", "networking", "career development"],
};

const TestRegistrationPage = () => {
  const [showWorkshopForm, setShowWorkshopForm] = React.useState(false);
  const [showTripForm, setShowTripForm] = React.useState(false);

  const handleRegistrationSuccess = (registrationData) => {
    console.log("Registration successful:", registrationData);
    alert("Registration successful! (This is just a UI test)");
    setShowWorkshopForm(false);
    setShowTripForm(false);
  };

  if (showWorkshopForm) {
    return (
      <div style={{ padding: theme.spacing[6], background: theme.colors.background.default, minHeight: "100vh" }}>
        <RegistrationForm
          event={mockEvent}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowWorkshopForm(false)}
        />
      </div>
    );
  }

  if (showTripForm) {
    return (
      <div style={{ padding: theme.spacing[6], background: theme.colors.background.default, minHeight: "100vh" }}>
        <RegistrationForm
          event={mockTrip}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowTripForm(false)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background.default,
        padding: theme.spacing[6],
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: theme.typography.fontSize["3xl"],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            textAlign: "center",
            marginBottom: theme.spacing[8],
          }}
        >
          Registration UI Test Page
        </h1>

        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text.secondary,
            textAlign: "center",
            marginBottom: theme.spacing[8],
          }}
        >
          Click "Register Now" on either event to test the registration form UI
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: theme.spacing[6],
            marginBottom: theme.spacing[8],
          }}
        >
          <div>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
                textAlign: "center",
              }}
            >
              Workshop Registration Test
            </h2>
            <EventCard
              event={mockEvent}
              showRegistration={true}
              onRegistrationSuccess={() => setShowWorkshopForm(true)}
            />
          </div>

          <div>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
                textAlign: "center",
              }}
            >
              Trip Registration Test
            </h2>
            <EventCard
              event={mockTrip}
              showRegistration={true}
              onRegistrationSuccess={() => setShowTripForm(true)}
            />
          </div>
        </div>

        <div
          style={{
            background: theme.colors.background.paper,
            padding: theme.spacing[6],
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.md,
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Test Instructions:
          </h3>
          <ul
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}
          >
            <li>Click "Register Now" on either event to see the registration form</li>
            <li>Test form validation by submitting empty or invalid data</li>
            <li>Try different roles (student, staff, ta, professor) to see field changes</li>
            <li>Check that year of study appears only for students</li>
            <li>Test phone number and email validation</li>
            <li>The form won't actually submit since backend isn't connected</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestRegistrationPage;