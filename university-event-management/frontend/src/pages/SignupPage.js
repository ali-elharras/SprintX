import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Briefcase,
  Package,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import PreLoginNavbar from "../components/PreLoginNavbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import FileUpload from "../components/FileUpload";

// Email domain to role mapping
const isGUCEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  try {
    return /^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i.test(email);
  } catch (error) {
    console.warn("Error parsing email:", error);
    return false;
  }
};

// Check if email is student domain
const isStudentEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  try {
    return /^[a-zA-Z0-9._%+-]+@student\.guc\.edu\.eg$/i.test(email);
  } catch (error) {
    console.warn("Error parsing email:", error);
    return false;
  }
};

// Check if email is valid for the given role
const isValidUniversityEmail = (email, role) => {
  if (!email) return false;
  // For students, allow both @guc.edu.eg and @student.guc.edu.eg
  if (role === "student") {
    return isGUCEmail(email) || isStudentEmail(email);
  }
  // For all other roles, only allow @guc.edu.eg
  return isGUCEmail(email);
};

// Function to create user schema based on role
const getUserSchema = (role) => {
  return yup.object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .test(
        "university-domain",
        role === "student"
          ? "Email must use GUC domain (@guc.edu.eg or @student.guc.edu.eg)"
          : "Email must use GUC domain (@guc.edu.eg)",
        function (value) {
          if (!value) return false;
          return isValidUniversityEmail(value, role);
        }
      ),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
    universityId: yup
      .string()
      .required("University ID is required")
      .matches(
        /^[A-Za-z0-9\-_.]+$/,
        "University ID can only contain letters, numbers, and symbols (-, _, .)"
      ),
    department: yup
      .string()
      .max(100, "Department name must be less than 100 characters")
      .nullable(),
    yearOfStudy: yup.mixed().nullable(),
    phoneNumber: yup
      .string()
      .nullable()
      .test(
        "phone-format",
        "Please enter a valid phone number",
        function (value) {
          if (!value || value.trim() === "") return true;
          return /^[+]?[\d\s\-()]{10,}$/.test(value);
        }
      ),
  });
};

const vendorSchema = yup.object({
  companyName: yup
    .string()
    .required("Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  contactPersonFirstName: yup
    .string()
    .max(50, "First name must be less than 50 characters")
    .nullable(),
  contactPersonLastName: yup
    .string()
    .max(50, "Last name must be less than 50 characters")
    .nullable(),
  email: yup
    .string()
    .required("Email is required")
    .test(
      "email-format",
      "Please enter a valid email address with domain extension (e.g., name@company.com)",
      function (value) {
        if (!value) return true;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(value);
      }
    )
    .test(
      "not-university",
      "Please use your company email address. University emails should use the University Member registration.",
      function (value) {
        if (!value) return true;
        const universityPattern =
          /^[a-zA-Z0-9._%+-]+@(student\.)?guc\.edu\.eg$/i;
        return !universityPattern.test(value);
      }
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  businessRegistrationNumber: yup.string().nullable(),
  industry: yup
    .string()
    .max(100, "Industry must be less than 100 characters")
    .nullable(),
  companySize: yup
    .string()
    .nullable()
    .oneOf(
      [null, "", "startup", "small", "medium", "large", "enterprise"],
      "Please select a valid company size"
    ),
  phoneNumber: yup
    .string()
    .nullable()
    .test(
      "phone-format",
      "Please enter a valid phone number",
      function (value) {
        if (!value || value.trim() === "") return true;
        return /^[+]?[\d\s\-()]{10,}$/.test(value);
      }
    ),
  website: yup
    .string()
    .nullable()
    .test(
      "website-format",
      "Please enter a valid website URL (e.g., https://company.com)",
      function (value) {
        if (!value || value.trim() === "") return true;
        // eslint-disable-next-line no-useless-escape
        const urlPattern =
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(value) || urlPattern.test(`https://${value}`);
      }
    ),
  companyDescription: yup
    .string()
    .max(500, "Company description must be less than 500 characters")
    .nullable(),
  streetAddress: yup.string().max(200).nullable(),
  city: yup.string().max(100).nullable(),
  stateProvince: yup.string().max(100).nullable(),
  zipPostalCode: yup.string().max(20).nullable(),
  country: yup.string().max(100).nullable(),
});

// Role options
const roles = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    description: "Access and register for events",
    color: "from-[#667eea] to-[#764ba2]",
  },
  {
    id: "professor",
    label: "Professor",
    icon: BookOpen,
    description: "Manage academic events",
    color: "from-[#764ba2] to-[#5a3780]",
  },
  {
    id: "ta",
    label: "Teaching Assistant",
    icon: Users,
    description: "Support event coordination",
    color: "from-[#667eea] to-[#4c63d2]",
  },
  {
    id: "staff",
    label: "Staff",
    icon: Briefcase,
    description: "Assist with operations",
    color: "from-[#8b9cf6] to-[#667eea]",
  },
  {
    id: "vendor",
    label: "Vendor",
    icon: Package,
    description: "Provide event services",
    color: "from-[#764ba2] to-[#9b6fc9]",
  },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { registerUser, registerVendor, isLoading } = useAuth();

  const [selectedRoleIndex, setSelectedRoleIndex] = useState(() => {
    const savedIndex = localStorage.getItem("signupRoleIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const [showRegistrationState, setShowRegistrationState] = useState(() => {
    const saved = localStorage.getItem("signupFormVisible");
    return saved === "true";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload states for vendors
  const [taxCard, setTaxCard] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  // Wrapper to persist showRegistration state
  const setShowRegistration = (value) => {
    localStorage.setItem("signupFormVisible", String(value));
    setShowRegistrationState(value);
  };

  const showRegistration = showRegistrationState;

  const selectedRole = roles[selectedRoleIndex];
  const isVendor = selectedRole.id === "vendor";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(
      isVendor ? vendorSchema : getUserSchema(selectedRole.id)
    ),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchedEmail = watch("email") || "";
  const isGUCEmailDetected = isValidUniversityEmail(
    watchedEmail,
    selectedRole.id
  );

  const handlePrevious = () => {
    setSelectedRoleIndex((prev) => {
      const newIndex = prev === 0 ? roles.length - 1 : prev - 1;
      localStorage.setItem("signupRoleIndex", String(newIndex));
      return newIndex;
    });
    reset();
    setTaxCard(null);
    setCompanyLogo(null);
  };

  const handleNext = () => {
    setSelectedRoleIndex((prev) => {
      const newIndex = prev === roles.length - 1 ? 0 : prev + 1;
      localStorage.setItem("signupRoleIndex", String(newIndex));
      return newIndex;
    });
    reset();
    setTaxCard(null);
    setCompanyLogo(null);
  };

  const handleFileChange = (e, setter) => {
    // FileUpload component provides base64 string in e.target.value
    const base64Value = e.target.value;
    if (base64Value) {
      setter(base64Value);
    } else {
      setter(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      if (isVendor) {
        // Validate required files
        if (!taxCard) {
          toast.error("Tax Card is required");
          setIsSubmitting(false);
          return;
        }
        if (!companyLogo) {
          toast.error("Company Logo is required");
          setIsSubmitting(false);
          return;
        }

        // Vendor registration
        const formData = new FormData();

        // Add all vendor data
        formData.append("companyName", data.companyName);
        formData.append("email", data.email);
        formData.append("password", data.password);

        if (data.contactPersonFirstName)
          formData.append(
            "contactPersonFirstName",
            data.contactPersonFirstName
          );
        if (data.contactPersonLastName)
          formData.append("contactPersonLastName", data.contactPersonLastName);
        if (data.businessRegistrationNumber)
          formData.append(
            "businessRegistrationNumber",
            data.businessRegistrationNumber
          );
        if (data.industry) formData.append("industry", data.industry);
        if (data.companySize) formData.append("companySize", data.companySize);
        if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
        if (data.website) formData.append("website", data.website);
        if (data.companyDescription)
          formData.append("companyDescription", data.companyDescription);
        if (data.streetAddress)
          formData.append("streetAddress", data.streetAddress);
        if (data.city) formData.append("city", data.city);
        if (data.stateProvince)
          formData.append("stateProvince", data.stateProvince);
        if (data.zipPostalCode)
          formData.append("zipPostalCode", data.zipPostalCode);
        if (data.country) formData.append("country", data.country);

        // Add files as base64 strings with correct field names
        if (taxCard) formData.append("taxCard", taxCard);
        if (companyLogo) formData.append("logo", companyLogo);

        const result = await registerVendor(formData);

        if (result.success) {
          localStorage.removeItem("signupFormVisible");
          localStorage.removeItem("signupRoleIndex");
          toast.success("Vendor registration successful! Welcome to SprintX!");
          navigate("/vendor-dashboard");
        } else {
          toast.error(result.error || "Registration failed. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // User registration
        const { confirmPassword, ...submitData } = data;

        // Set requestedRole
        submitData.requestedRole = selectedRole.id;

        // If student, assign role immediately
        if (selectedRole.id === "student") {
          submitData.role = "student";
        }

        // Convert yearOfStudy to number if it exists
        if (submitData.yearOfStudy && submitData.yearOfStudy !== "") {
          submitData.yearOfStudy = parseInt(submitData.yearOfStudy);
        } else {
          delete submitData.yearOfStudy;
        }

        // Clean up empty fields
        if (submitData.department === "") delete submitData.department;
        if (submitData.phoneNumber === "") delete submitData.phoneNumber;

        const result = await registerUser(submitData);

        if (result.success) {
          localStorage.removeItem("signupFormVisible");
          localStorage.removeItem("signupRoleIndex");
          // Check if verification email is required
          if (
            result.requiresVerificationEmail ||
            result.data?.requiresVerificationEmail
          ) {
            navigate("/verification-email-selection", {
              state: {
                userData: result.data?.userData || submitData,
                userId: result.data?.userId,
              },
            });
            return;
          }

          toast.success("Registration successful! Welcome to SprintX!");
          navigate("/dashboard");
        } else {
          // Handle case where backend returns requiresVerificationEmail in error response
          if (
            result.requiresVerificationEmail ||
            result.data?.requiresVerificationEmail
          ) {
            navigate("/verification-email-selection", {
              state: {
                userData: result.data?.userData || submitData,
                userId: result.data?.userId,
              },
            });
            return;
          }

          toast.error(result.error || "Registration failed. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: i + 1,
    label: `Year ${i + 1}`,
  }));

  return (
    <>
      <PreLoginNavbar align="left" />
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing[4],
          fontFamily: theme.typography.fontFamily.primary,
        }}
      >
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: "center",
              marginBottom: theme.spacing[8],
            }}
          >
            <h1
              style={{
                fontSize: theme.typography.fontSize["4xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.white,
                marginBottom: theme.spacing[2],
              }}
            >
              Join SprintX
            </h1>
            {!showRegistration && (
              <p
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.text.white,
                  opacity: 0.9,
                }}
              >
                Choose your account type to get started
              </p>
            )}
          </motion.div>

          {/* Main Content */}
          <Card
            style={{
              padding: theme.spacing[8],
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            {!showRegistration ? (
              /* Role Selection */
              <div>
                {/* Role Carousel */}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `${theme.spacing[8]} 0`,
                  }}
                >
                  {/* Previous Arrow */}
                  <motion.button
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.15, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: "absolute",
                      left: theme.spacing[8],
                      zIndex: 10,
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: theme.colors.primary.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: theme.shadows.lg,
                      }}
                    >
                      <ChevronLeft size={32} color={theme.colors.text.white} />
                    </div>
                  </motion.button>

                  {/* Main Role Circle */}
                  <div
                    style={{
                      position: "relative",
                      width: "160px",
                      height: "160px",
                      margin: `0 ${theme.spacing[32]}`,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedRole.id}
                        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                        transition={{
                          duration: 0.5,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <motion.div
                          onClick={() => {
                            localStorage.setItem(
                              "signupRoleIndex",
                              String(selectedRoleIndex)
                            );
                            setShowRegistration(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: "160px",
                            height: "160px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${
                              selectedRole.color.split(" ")[1]
                            } 0%, ${selectedRole.color.split(" ")[3]} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: theme.shadows["2xl"],
                            cursor: "pointer",
                            border: `4px solid ${theme.colors.primary.light}`,
                          }}
                        >
                          {React.createElement(selectedRole.icon, {
                            size: 80,
                            stroke: "#000000",
                            strokeWidth: 2.5,
                            fill: "none",
                            absoluteStrokeWidth: false,
                          })}
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Next Arrow */}
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.15, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: "absolute",
                      right: theme.spacing[8],
                      zIndex: 10,
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: theme.colors.primary.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: theme.shadows.lg,
                      }}
                    >
                      <ChevronRight size={32} color={theme.colors.text.white} />
                    </div>
                  </motion.button>
                </div>

                {/* Role Indicators */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: theme.spacing[3],
                    marginBottom: theme.spacing[8],
                  }}
                >
                  {roles.map((role, index) => {
                    const RoleIcon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleIndex(index)}
                        style={{
                          position: "relative",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          outline: "none",
                          padding: 0,
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background:
                              index === selectedRoleIndex
                                ? `linear-gradient(135deg, ${
                                    role.color.split(" ")[1]
                                  } 0%, ${role.color.split(" ")[3]} 100%)`
                                : theme.colors.neutral.gray200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow:
                              index === selectedRoleIndex
                                ? theme.shadows.lg
                                : theme.shadows.md,
                            border:
                              index === selectedRoleIndex
                                ? `2px solid ${theme.colors.primary.main}`
                                : "none",
                          }}
                        >
                          {React.createElement(RoleIcon, {
                            size: 24,
                            stroke:
                              index === selectedRoleIndex
                                ? "#000000"
                                : theme.colors.text.secondary,
                            strokeWidth: 2.5,
                            fill: "none",
                            absoluteStrokeWidth: false,
                          })}
                        </motion.div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Role Info */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRole.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: "center" }}
                  >
                    <h2
                      style={{
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing[2],
                      }}
                    >
                      {selectedRole.label}
                    </h2>
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing[6],
                      }}
                    >
                      {selectedRole.description}
                    </p>

                    <div
                      onClick={() => {
                        localStorage.setItem(
                          "signupRoleIndex",
                          String(selectedRoleIndex)
                        );
                        setShowRegistration(true);
                      }}
                      style={{
                        background: theme.colors.primary.gradient,
                        color: "#ffffff",
                        border: "none",
                        borderRadius: theme.borderRadius.button,
                        padding: `${theme.spacing[3]} ${theme.spacing[8]}`,
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: theme.typography.fontWeight.semibold,
                        fontFamily: theme.typography.fontFamily.primary,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: theme.spacing[2],
                        boxShadow: theme.shadows.button,
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = theme.shadows.xl;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = theme.shadows.button;
                      }}
                    >
                      Register as {selectedRole.label}
                      <ChevronRight
                        size={20}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Back to Login Link */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: theme.spacing[8],
                    paddingTop: theme.spacing[6],
                    borderTop: `1px solid ${theme.colors.border.light}`,
                  }}
                >
                  <span style={{ color: theme.colors.text.secondary }}>
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/login"
                    onClick={() => {
                      localStorage.removeItem("signupFormVisible");
                      localStorage.removeItem("signupRoleIndex");
                    }}
                    style={{
                      color: theme.colors.primary.main,
                      textDecoration: "none",
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    Sign in here
                  </Link>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: "800px", margin: "0 auto" }}
              >
                {/* Header */}
                <div style={{ marginBottom: theme.spacing[8] }}>
                  <button
                    onClick={() => {
                      localStorage.removeItem("signupFormVisible");
                      localStorage.removeItem("signupRoleIndex");
                      setShowRegistration(false);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: theme.colors.text.secondary,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing[2],
                      marginBottom: theme.spacing[4],
                      fontSize: theme.typography.fontSize.base,
                      outline: "none",
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back to role selection
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing[4],
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${
                          selectedRole.color.split(" ")[1]
                        } 0%, ${selectedRole.color.split(" ")[3]} 100%)`,
                        border: `4px solid ${theme.colors.primary.main}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: theme.shadows.lg,
                      }}
                    >
                      {React.createElement(selectedRole.icon, {
                        size: 32,
                        stroke: "#000000",
                        strokeWidth: 2.5,
                        fill: "none",
                        absoluteStrokeWidth: false,
                      })}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: theme.typography.fontSize["2xl"],
                          fontWeight: theme.typography.fontWeight.bold,
                          color: theme.colors.text.primary,
                          marginBottom: theme.spacing[1],
                        }}
                      >
                        {selectedRole.label} Registration
                      </h2>
                      <p style={{ color: theme.colors.text.secondary }}>
                        {selectedRole.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  {isVendor ? (
                    /* Vendor Form */
                    <div style={{ display: "grid", gap: theme.spacing[6] }}>
                      {/* Section 1: Company Information */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: theme.spacing[3],
                            marginBottom: theme.spacing[4],
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: theme.borderRadius.lg,
                              background: theme.colors.primary.gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.colors.text.white,
                              fontWeight: theme.typography.fontWeight.bold,
                            }}
                          >
                            1
                          </div>
                          <h3
                            style={{
                              fontSize: theme.typography.fontSize.xl,
                              fontWeight: theme.typography.fontWeight.bold,
                              color: theme.colors.text.primary,
                            }}
                          >
                            Company Information
                          </h3>
                        </div>

                        <div style={{ display: "grid", gap: theme.spacing[4] }}>
                          <Input
                            label="Company Name"
                            type="text"
                            placeholder="Enter your company name"
                            required
                            error={errors.companyName?.message}
                            {...register("companyName")}
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="Business Registration Number"
                              type="text"
                              placeholder="Registration number"
                              error={errors.businessRegistrationNumber?.message}
                              {...register("businessRegistrationNumber")}
                            />

                            <Select
                              label="Company Size"
                              placeholder="Select company size"
                              options={[
                                {
                                  value: "startup",
                                  label: "Startup (1-10 employees)",
                                },
                                {
                                  value: "small",
                                  label: "Small (11-50 employees)",
                                },
                                {
                                  value: "medium",
                                  label: "Medium (51-200 employees)",
                                },
                                {
                                  value: "large",
                                  label: "Large (201-1000 employees)",
                                },
                                {
                                  value: "enterprise",
                                  label: "Enterprise (1000+ employees)",
                                },
                              ]}
                              error={errors.companySize?.message}
                              {...register("companySize")}
                            />
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="Industry"
                              type="text"
                              placeholder="e.g., Technology, Food & Beverage"
                              error={errors.industry?.message}
                              {...register("industry")}
                            />

                            <Input
                              label="Website"
                              type="url"
                              placeholder="https://www.example.com"
                              error={errors.website?.message}
                              {...register("website")}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.medium,
                                color: theme.colors.text.primary,
                                marginBottom: theme.spacing[2],
                              }}
                            >
                              Company Description
                            </label>
                            <textarea
                              placeholder="Tell us about your company, products, and services..."
                              {...register("companyDescription")}
                              style={{
                                width: "100%",
                                minHeight: "120px",
                                padding: theme.spacing[3],
                                border: `1px solid ${theme.colors.border.light}`,
                                borderRadius: theme.borderRadius.md,
                                fontSize: theme.typography.fontSize.base,
                                fontFamily: theme.typography.fontFamily.primary,
                                resize: "vertical",
                              }}
                            />
                            {errors.companyDescription && (
                              <p
                                style={{
                                  color: theme.colors.error.main,
                                  fontSize: theme.typography.fontSize.sm,
                                  marginTop: theme.spacing[1],
                                }}
                              >
                                {errors.companyDescription.message}
                              </p>
                            )}
                          </div>

                          {/* File Uploads */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <FileUpload
                              label="Tax Card"
                              file={taxCard}
                              onChange={(e) => handleFileChange(e, setTaxCard)}
                              onClear={() => setTaxCard(null)}
                              required
                            />

                            <FileUpload
                              label="Company Logo"
                              file={companyLogo}
                              onChange={(e) =>
                                handleFileChange(e, setCompanyLogo)
                              }
                              onClear={() => setCompanyLogo(null)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: `1px solid ${theme.colors.border.light}`,
                        }}
                      />

                      {/* Section 2: Contact Information */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: theme.spacing[3],
                            marginBottom: theme.spacing[4],
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: theme.borderRadius.lg,
                              background: theme.colors.primary.gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.colors.text.white,
                              fontWeight: theme.typography.fontWeight.bold,
                            }}
                          >
                            2
                          </div>
                          <h3
                            style={{
                              fontSize: theme.typography.fontSize.xl,
                              fontWeight: theme.typography.fontWeight.bold,
                              color: theme.colors.text.primary,
                            }}
                          >
                            Contact Information
                          </h3>
                        </div>

                        <div style={{ display: "grid", gap: theme.spacing[4] }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="Contact Person First Name"
                              type="text"
                              placeholder="First name"
                              error={errors.contactPersonFirstName?.message}
                              {...register("contactPersonFirstName")}
                            />

                            <Input
                              label="Contact Person Last Name"
                              type="text"
                              placeholder="Last name"
                              error={errors.contactPersonLastName?.message}
                              {...register("contactPersonLastName")}
                            />
                          </div>

                          <Input
                            label="Email Address"
                            type="email"
                            placeholder="contact@company.com"
                            required
                            error={errors.email?.message}
                            {...register("email")}
                          />

                          <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            error={errors.phoneNumber?.message}
                            {...register("phoneNumber")}
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="Password"
                              type="password"
                              placeholder="Create a strong password"
                              required
                              error={errors.password?.message}
                              {...register("password")}
                            />

                            <Input
                              label="Confirm Password"
                              type="password"
                              placeholder="Confirm your password"
                              required
                              error={errors.confirmPassword?.message}
                              {...register("confirmPassword")}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: `1px solid ${theme.colors.border.light}`,
                        }}
                      />

                      {/* Section 3: Business Address */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: theme.spacing[3],
                            marginBottom: theme.spacing[4],
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: theme.borderRadius.lg,
                              background: theme.colors.primary.gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.colors.text.white,
                              fontWeight: theme.typography.fontWeight.bold,
                            }}
                          >
                            3
                          </div>
                          <h3
                            style={{
                              fontSize: theme.typography.fontSize.xl,
                              fontWeight: theme.typography.fontWeight.bold,
                              color: theme.colors.text.primary,
                            }}
                          >
                            Business Address
                          </h3>
                        </div>

                        <div style={{ display: "grid", gap: theme.spacing[4] }}>
                          <Input
                            label="Street Address"
                            type="text"
                            placeholder="1234 Main Street, Suite 100"
                            error={errors.streetAddress?.message}
                            {...register("streetAddress")}
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="City"
                              type="text"
                              placeholder="City name"
                              error={errors.city?.message}
                              {...register("city")}
                            />

                            <Input
                              label="State/Province"
                              type="text"
                              placeholder="State or province"
                              error={errors.stateProvince?.message}
                              {...register("stateProvince")}
                            />
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: theme.spacing[4],
                            }}
                          >
                            <Input
                              label="Zip/Postal Code"
                              type="text"
                              placeholder="12345"
                              error={errors.zipPostalCode?.message}
                              {...register("zipPostalCode")}
                            />

                            <Input
                              label="Country"
                              type="text"
                              placeholder="Country name"
                              error={errors.country?.message}
                              {...register("country")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* University Member Form */
                    <div style={{ display: "grid", gap: theme.spacing[4] }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: theme.spacing[4],
                        }}
                      >
                        <Input
                          label="First Name"
                          type="text"
                          placeholder="Enter your first name"
                          required
                          error={errors.firstName?.message}
                          {...register("firstName")}
                        />

                        <Input
                          label="Last Name"
                          type="text"
                          placeholder="Enter your last name"
                          required
                          error={errors.lastName?.message}
                          {...register("lastName")}
                        />
                      </div>

                      <Input
                        label="University Email Address"
                        type="email"
                        placeholder={
                          selectedRole.id === "student"
                            ? "e.g., john.doe@student.guc.edu.eg"
                            : "e.g., john.doe@guc.edu.eg"
                        }
                        required
                        error={errors.email?.message}
                        {...register("email")}
                      />

                      {isGUCEmailDetected && (
                        <div
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.primary.main,
                            marginTop: `-${theme.spacing[3]}`,
                            fontWeight: theme.typography.fontWeight.medium,
                          }}
                        >
                          ✓ GUC Email Detected
                        </div>
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: theme.spacing[4],
                        }}
                      >
                        <Input
                          label="Password"
                          type="password"
                          placeholder="Create a strong password"
                          required
                          error={errors.password?.message}
                          {...register("password")}
                        />

                        <Input
                          label="Confirm Password"
                          type="password"
                          placeholder="Confirm your password"
                          required
                          error={errors.confirmPassword?.message}
                          {...register("confirmPassword")}
                        />
                      </div>

                      <Input
                        label="University ID"
                        type="text"
                        placeholder="Enter your university ID"
                        required
                        error={errors.universityId?.message}
                        {...register("universityId")}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: theme.spacing[4],
                        }}
                      >
                        <Input
                          label="Department"
                          type="text"
                          placeholder="Enter your department"
                          error={errors.department?.message}
                          {...register("department")}
                        />

                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="Enter your phone number"
                          error={errors.phoneNumber?.message}
                          {...register("phoneNumber")}
                        />
                      </div>

                      {selectedRole.id === "student" && (
                        <Select
                          label="Year of Study"
                          placeholder="Select your year"
                          options={yearOptions}
                          error={errors.yearOfStudy?.message}
                          {...register("yearOfStudy")}
                        />
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting || isLoading}
                    disabled={isSubmitting || isLoading}
                    style={{
                      marginTop: theme.spacing[6],
                      width: "100%",
                      background: theme.colors.primary.gradient,
                      border: "none",
                      color: theme.colors.text.white,
                    }}
                  >
                    {isSubmitting || isLoading
                      ? "Creating Account..."
                      : "Create Account"}
                    <ChevronRight size={20} style={{ marginLeft: "8px" }} />
                  </Button>

                  {/* Additional Options */}
                  <div
                    style={{
                      marginTop: theme.spacing[6],
                      paddingTop: theme.spacing[6],
                      borderTop: `1px solid ${theme.colors.border.light}`,
                      textAlign: "center",
                    }}
                  >
                    <span style={{ color: theme.colors.text.secondary }}>
                      Already have an account?{" "}
                    </span>
                    <Link
                      to="/login"
                      onClick={() => {
                        localStorage.removeItem("signupFormVisible");
                        localStorage.removeItem("signupRoleIndex");
                      }}
                      style={{
                        color: theme.colors.primary.main,
                        textDecoration: "none",
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      Sign in here
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
