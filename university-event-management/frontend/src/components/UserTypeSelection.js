import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import universityAnimation from "../assets/animations/universityMemberAnimation.json";
import vendorAnimation from "../assets/animations/vendorAnimation.json";
import { useAuth } from "../context/AuthContext";
import Input from "./Input";
import Button from "./Button";
import "./UserTypeSelection.css";

// Validation schema for login
const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup.string().required("Password is required"),
});

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const { loginUser, loginVendor, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState(null); // 'university' or 'vendor'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserTypeSelection = (userType) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedType(userType);
      reset(); // Clear form when switching types
    }, 300); // Match CSS transition duration
  };

  const handleBackToSelection = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedType(null);
      setIsTransitioning(false);
      reset();
    }, 300);
  };

  // Function to detect university role from email
  const getUniversityRole = (email) => {
    const match = email.match(
      /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/
    );
    if (match) {
      const role = match[1];
      if (role === "eventsoffice") return "Events Office";
      if (role === "ta") return "TA";
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
    return null;
  };

  // Function to detect if email is vendor email
  const isVendorEmail = (email) => {
    // First check if it's a complete email with proper domain extension
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return false;
    }

    const vendorPattern =
      /^[a-zA-Z0-9._%+-]+@(?!student\.|staff\.|ta\.|professor\.|admin\.|eventsoffice\.).+$/;
    const universityPattern =
      /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/;
    return vendorPattern.test(email) && !universityPattern.test(email);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validate email format first
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(data.email)) {
        toast.error("Please enter a valid email address with domain extension");
        setIsSubmitting(false);
        return;
      }

      if (selectedType === "university") {
        // University login validation
        const universityPattern =
          /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/;
        if (!universityPattern.test(data.email)) {
          toast.error(
            "Please use your university email address (@student, @staff, @ta, @professor, @admin, or @eventsoffice)"
          );
          setIsSubmitting(false);
          return;
        }

        const result = await loginUser({
          email: data.email,
          password: data.password,
        });

        if (result.success) {
          const accountData = result.data.user;
          toast.success(
            `Welcome back, ${accountData.firstName} ${accountData.lastName}!`
          );
          navigate("/dashboard", { replace: true });
        } else {
          toast.error(
            result.error || "Login failed. Please check your credentials."
          );
        }
      } else if (selectedType === "vendor") {
        // Vendor login validation
        const universityPattern =
          /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/;
        if (universityPattern.test(data.email)) {
          toast.error(
            "Please use your company email address. University emails should use the University Member login."
          );
          setIsSubmitting(false);
          return;
        }

        const result = await loginVendor({
          email: data.email,
          password: data.password,
        });

        if (result.success) {
          const accountData = result.data.vendor;
          toast.success(`Welcome back, ${accountData.companyName}!`);
          navigate("/dashboard", { replace: true });
        } else {
          toast.error(
            result.error || "Login failed. Please check your credentials."
          );
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedEmail = watch("email");
  const detectedRole =
    selectedType === "university" ? getUniversityRole(watchedEmail) : null;
  const isValidVendorEmail =
    selectedType === "vendor" ? isVendorEmail(watchedEmail) : false;

  return (
    <div className="user-type-selection">
      <div
        className={`selection-container ${selectedType ? "has-selection" : ""}`}
      >
        {/* Title - hides when selection is made */}
        <h1 className={`selection-title ${selectedType ? "hidden" : ""}`}>
          Choose Your Access Type
        </h1>

        {/* Main Content Area */}
        <div className="main-content">
          {/* University Member Card */}
          <div
            className={`user-type-card university-card ${
              selectedType === "university"
                ? "selected slide-left"
                : selectedType === "vendor"
                ? "hidden"
                : ""
            }`}
            onClick={() =>
              !selectedType && handleUserTypeSelection("university")
            }
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
                Students, TAs, Professors and Staff
              </p>
            </div>
            {!selectedType && (
              <div className="card-overlay">
                <span className="click-text">Click to Login</span>
              </div>
            )}
          </div>

          {/* Vendor Card */}
          <div
            className={`user-type-card vendor-card ${
              selectedType === "vendor"
                ? "selected slide-right"
                : selectedType === "university"
                ? "hidden"
                : ""
            }`}
            onClick={() => !selectedType && handleUserTypeSelection("vendor")}
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
            {!selectedType && (
              <div className="card-overlay">
                <span className="click-text">Click to Login</span>
              </div>
            )}
          </div>
        </div>

        {/* Login Forms that slide in */}
        {selectedType === "university" && (
          <div
            className={`login-form-container university-theme slide-in-right ${
              detectedRole ? "with-role-detection" : ""
            }`}
          >
            <h2 className="login-title">University Member Login</h2>
            {detectedRole && (
              <div className="role-detection">
                <span className="role-label">
                  Detected Role: {detectedRole}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your university email"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || isLoading}
                className="login-button university-button"
              >
                {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <button
                  className="link-button university-link"
                  onClick={() => navigate("/signup/user")}
                >
                  Sign up here
                </button>
              </p>
              <p>
                <button
                  className="link-button university-link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </button>
              </p>
            </div>
          </div>
        )}

        {selectedType === "vendor" && (
          <div className="login-form-container vendor-theme slide-in-left">
            <h2 className="login-title">Vendor Login</h2>
            {isValidVendorEmail && watchedEmail && (
              <div className="role-detection">
                <span className="role-label">✓ Valid Company Email</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your company email"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || isLoading}
                className="login-button vendor-button"
              >
                {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <button
                  className="link-button vendor-link"
                  onClick={() => navigate("/signup/vendor")}
                >
                  Register as Vendor
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Back Button - positioned under login forms */}
        {selectedType && (
          <button className="back-button" onClick={handleBackToSelection}>
            Back to Selection
          </button>
        )}
      </div>
    </div>
  );
};

export default UserTypeSelection;
