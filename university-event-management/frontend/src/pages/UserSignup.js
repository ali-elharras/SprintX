import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";

// Email domain to role mapping
const emailDomainRoleMap = {
  student: "student",
  staff: "staff",
  ta: "ta",
  professor: "professor",
};

// Function to check if email is GUC email
const isGUCEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  try {
    return /^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i.test(email);
  } catch (error) {
    console.warn("Error parsing email:", error);
    return false;
  }
};

// Validation schema
const userSchema = yup.object({
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
      "Email must use GUC domain (@guc.edu.eg)",
      function (value) {
        if (!value) return false;
        return isGUCEmail(value);
      }
    ),
  requestedRole: yup
    .string()
    .required("Please select your role")
    .oneOf(["student", "staff", "ta", "professor"], "Invalid role selected"),
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
      /^[A-Za-z0-9\-_\.]+$/,
      "University ID can only contain letters, numbers, and symbols (-, _, .)"
    ),
  department: yup
    .string()
    .max(100, "Department name must be less than 100 characters")
    .nullable(),
  yearOfStudy: yup
    .mixed()
    .nullable()
    .when("requestedRole", {
      is: "student",
      then: (schema) =>
        schema.test(
          "valid-year",
          "Please select a valid year of study",
          (value) => {
            if (!value) return true; // Optional for students too
            const num = parseInt(value);
            return !isNaN(num) && num >= 1 && num <= 10;
          }
        ),
      otherwise: (schema) => schema.nullable(),
    }),
  phoneNumber: yup
    .string()
    .nullable()
    .test(
      "phone-format",
      "Please enter a valid phone number",
      function (value) {
        // If empty or null, it's valid (optional field)
        if (!value || value.trim() === "") return true;
        // If has value, validate format
        return /^[\+]?[\d\s\-\(\)]{10,}$/.test(value);
      }
    ),
});

const UserSignup = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm({
    resolver: yupResolver(userSchema),
    mode: "onSubmit", // Only validate on form submission
    reValidateMode: "onChange", // After first submission, validate on change
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      requestedRole: "",
      password: "",
      confirmPassword: "",
      universityId: "",
      department: "",
      yearOfStudy: null,
      phoneNumber: "",
    },
  });

  const watchedEmail = watch("email") || "";
  const watchedRequestedRole = watch("requestedRole") || "";
  const isGUCEmailDetected = isGUCEmail(watchedEmail);

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: i + 1,
    label: `Year ${i + 1}`,
  }));

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Remove confirmPassword from data and pass requestedRole to backend
      const { confirmPassword, ...submitData } = data;

      // Handle role assignment logic:
      // If requestedRole is "student", assign "student" to role field for immediate access
      // Otherwise, send requestedRole to backend for admin verification
      if (data.requestedRole === "student") {
        submitData.role = "student";
      }
      // requestedRole is always sent to backend for processing

      // Convert yearOfStudy to number if it exists and is not empty
      if (submitData.yearOfStudy && submitData.yearOfStudy !== "") {
        submitData.yearOfStudy = parseInt(submitData.yearOfStudy);
      } else {
        // Remove yearOfStudy from submitData if it's empty or null
        delete submitData.yearOfStudy;
      }

      // Clean up empty string fields that might cause backend validation issues
      if (submitData.department === "") {
        delete submitData.department;
      }
      if (submitData.phoneNumber === "") {
        delete submitData.phoneNumber;
      }

      console.log(
        "🔍 [DEBUG] Submitting user data:",
        JSON.stringify(submitData, null, 2)
      );

      // Proceed with registration
      const result = await registerUser(submitData);

      if (result.success) {
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

        // For students and complete registrations
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
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyles = {
    minHeight: "100vh",
    background: theme.colors.background.gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[4],
    fontFamily: theme.typography.fontFamily.primary,
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: theme.spacing[8],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  };

  const formStyles = {
    display: "grid",
    gap: theme.spacing[4],
  };

  const rowStyles = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing[4],
  };

  const linkStyles = {
    textAlign: "center",
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const linkAnchorStyles = {
    color: theme.colors.primary.main,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
  };

  return (
    <>
      <PreLoginNavbar />
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>Join SprintX</h1>
            <p style={subtitleStyles}>
              Sign up as a {watchedRequestedRole || "university member"} to
              discover and participate in campus events
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
            {/* Name Fields */}
            <div style={rowStyles}>
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

            {/* Email */}
            <Input
              label="University Email Address"
              type="email"
              placeholder="e.g., john.doe@guc.edu.eg"
              required
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Show GUC email detection */}
            {isGUCEmailDetected && (
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.primary.main,
                  marginTop: `-${theme.spacing[3]}`,
                  marginBottom: theme.spacing[2],
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                ✓ GUC Email Detected
              </div>
            )}

            {/* Requested Role Selection */}
            <Select
              label="Requested Role"
              placeholder="Select your role"
              options={[
                { value: "student", label: "Student" },
                { value: "staff", label: "Staff" },
                { value: "ta", label: "Teaching Assistant" },
                { value: "professor", label: "Professor" },
              ]}
              required
              error={errors.requestedRole?.message}
              {...register("requestedRole")}
            />

            {/* Password Fields */}
            <div style={rowStyles}>
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

            {/* University ID */}
            <Input
              label="University ID"
              type="text"
              placeholder="Enter your university ID"
              required
              error={errors.universityId?.message}
              {...register("universityId")}
            />

            {/* Department and Phone Number */}
            <div style={rowStyles}>
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

            {/* Year of Study (for students only) */}
            {watchedRequestedRole === "student" && (
              <Select
                label="Year of Study"
                placeholder="Select your year"
                options={yearOptions}
                error={errors.yearOfStudy?.message}
                {...register("yearOfStudy")}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              style={{ marginTop: theme.spacing[4] }}
            >
              {isSubmitting || isLoading
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            {/* Login Link */}
            <div style={linkStyles}>
              Already have an account?{" "}
              <Link to="/" style={linkAnchorStyles}>
                Sign in here
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default UserSignup;
