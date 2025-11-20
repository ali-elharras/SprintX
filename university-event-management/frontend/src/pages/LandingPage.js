import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/Landing/HeroSection.jsx";
import { EventTypesSection } from "../components/Landing/EventTypesSection.jsx";
import { UserTypeSection } from "../components/Landing/UserTypeSection.jsx";
import { KeyFeaturesSection } from "../components/Landing/KeyFeaturesSection.jsx";
import { StatsSection } from "../components/Landing/StatsSection.jsx";
import { CTASection } from "../components/Landing/CTASection.jsx";
import { Footer } from "../components/Landing/Footer.jsx";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onGetStarted={() => navigate("/login")} />
      <EventTypesSection />
      <UserTypeSection 
        onStudentSignup={() => navigate("/signup/user")}
        onFacultySignup={() => navigate("/signup/user")}
        onPartnerSignup={() => navigate("/signup/vendor")}
      />
      <KeyFeaturesSection />
      <StatsSection />
      <CTASection onGetStarted={() => navigate("/login")} />
      <Footer />
    </div>
  );
};

export default LandingPage;
