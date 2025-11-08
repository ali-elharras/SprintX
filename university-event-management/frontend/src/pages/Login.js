import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";

// Function to detect if email is GUC email format
const isGUCEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i.test(email);
};

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, loginVendor, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedEmail = watch("email");
  const isUniversityEmail = isGUCEmail(watchedEmail);

  const onSubmit = async (data) => {
    console.log("=== LOGIN FORM SUBMITTED ===", data);
    try {
      setIsSubmitting(true);

      // Validate email format first
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(data.email)) {
        toast.error(
          "Please enter a valid email address with domain extension (e.g., name@domain.com)"
        );
        setIsSubmitting(false);
        return;
      }

      let result;
      let isVendorLogin = false;

      // Try university login first if it's a GUC email
      if (isGUCEmail(data.email)) {
        console.log("=== TRYING UNIVERSITY LOGIN ===");
        result = await loginUser({
          email: data.email,
          password: data.password,
        });
        console.log("=== University LOGIN RESULT ===", result);
      } else {
        // Try vendor login for non-GUC emails
        console.log("=== TRYING VENDOR LOGIN ===");
        result = await loginVendor({
          email: data.email,
          password: data.password,
        });
        console.log("=== Vendor LOGIN RESULT ===", result);
        isVendorLogin = true;
      }

      if (result.success) {
        if (isVendorLogin) {
          // Vendor login successful
          const accountData = result.data.vendor;
          toast.success(
            `Welcome back, ${
              accountData.organizationName || accountData.email
            }!`
          );
          navigate("/vendor-dashboard", { replace: true });
        } else {
          // University member login successful
          const accountData = result.data.user;
          toast.success(
            `Welcome back, ${accountData.firstName} ${accountData.lastName}!`
          );

          // Route based on user role
          if (
            accountData.role === "admin" ||
            accountData.role === "events_office"
          ) {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }
      } else {
        // Handle university member verification issues
        if (!isVendorLogin) {
          console.log("Login result:", result);

          // Check if user has pending role (awaiting admin approval)
          if (result.isPending) {
            toast.error(
              result.error ||
                `Your ${
                  result.data?.requestedRole || "role"
                } request is pending admin approval. Please wait for approval to access your account.`,
              {
                duration: 6000,
              }
            );
            return;
          }

          // Check if verification email is required (incomplete registration)
          if (result.requiresVerificationEmail) {
            console.log("Navigating to verification-email-selection");
            navigate("/verification-email-selection", {
              state: {
                userData: result.data?.userData,
                userId: result.data?.userId,
              },
            });
            return;
          }

          // Check if verification email has been sent but user hasn't verified
          if (result.emailVerificationSent && result.canReapply) {
            console.log("Navigating to verification-pending with data:", {
              userId: result.data?.userId,
              email: result.data?.email,
              verificationEmail: result.data?.verificationEmail,
              message: result.error,
            });
            navigate("/verification-pending", {
              state: {
                userId: result.data?.userId,
                email: result.data?.email,
                verificationEmail: result.data?.verificationEmail,
                message: result.error,
              },
            });
            return;
          }
        }

        console.log("Showing toast error for result:", result);
        toast.error(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.log("=== LOGIN.JS CATCH BLOCK ===", error);
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
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
    maxWidth: "500px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: theme.spacing[8],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["4xl"],
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
    gap: theme.spacing[5],
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

  const title = "SprintX Login";
  const subtitle =
    "Access your account to discover and participate in campus events";

  return (
    <>
      <PreLoginNavbar />
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>{title}</h1>
            <p style={subtitleStyles}>{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              required
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Show if GUC email is detected */}
            {isUniversityEmail && (
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

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              style={{ marginTop: theme.spacing[4] }}
            >
              {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Signup Link */}
            <div style={linkStyles}>
              <span>Don't have an account? </span>
              <Link to="/signup" style={linkAnchorStyles}>
                Sign up here
              </Link>
            </div>

            {/* Help Links */}
            <div style={linkStyles}>
              <Link to="/forgot-password" style={linkAnchorStyles}>
                Forgot your password?
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Login;
