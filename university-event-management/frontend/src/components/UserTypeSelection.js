import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import universityAnimation from "../assets/animations/universityMemberAnimation.json";
import vendorAnimation from "../assets/animations/vendorAnimation.json";
import PreLoginNavbar from "./PreLoginNavbar";
import "./UserTypeSelection.css";

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUniversityClick = () => {
    navigate("/signup/user");
  };

  const handleVendorClick = () => {
    navigate("/signup/vendor");
  };

  return (
    <>
      <PreLoginNavbar />
      <div className="user-type-selection-container">
        <div className="header-section">
          <h1 className="main-title">
            Choose your account type to get started
          </h1>
          <p className="main-subtitle"></p>
        </div>

        <div className="cards-container">
          {/* University Member Card */}
          <div
            className="user-type-card university-card"
            onClick={handleUniversityClick}
          >
            <div className="animation-container">
              <Lottie
                animationData={universityAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="card-content">
              <h2 className="user-type-title">University Member</h2>
              <p className="user-type-description">
                Students, Staff, TAs, Professors & Admins
              </p>
            </div>
            <div className="card-overlay">
              <span className="click-text">Click to Register</span>
            </div>
          </div>

          {/* Vendor Card */}
          <div
            className="user-type-card vendor-card"
            onClick={handleVendorClick}
          >
            <div className="animation-container">
              <Lottie
                animationData={vendorAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="card-content">
              <h2 className="user-type-title">Vendor</h2>
              <p className="user-type-description">
                Business Partners & Service Providers
              </p>
            </div>
            <div className="card-overlay">
              <span className="click-text">Click to Register</span>
            </div>
          </div>
        </div>

        {/* Back to Login Link */}
        <div className="back-to-login">
          <span>Already have an account? </span>
          <Link to="/" className="login-link">
            Sign in here
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserTypeSelection;
