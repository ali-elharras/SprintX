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
import Select from "../components/Select";
import Button from "../components/Button";

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
  const detectedRole = getUniversityRole(watchedEmail);

  const onSubmit = async (data) => {
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

      // Validate that this is a university email
      const universityPattern =
        /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/;
      if (!universityPattern.test(data.email)) {
        toast.error(
          "Please use your university email address (@student, @staff, @ta, @professor, @admin, or @eventsoffice). For company emails, use Company Access."
        );
        setIsSubmitting(false);
        return;
      }

      // This is now university member login only
      const result = await loginUser({
        email: data.email,
        password: data.password,
      });

      console.log("Login result:", result);

      if (result.success) {
        const accountData = result.data.user;

        toast.success(
          `Welcome back, ${accountData.firstName} ${accountData.lastName}!`
        );

        // Navigate to intended destination or dashboard
        navigate(from, { replace: true });
      } else {
        // Check if verification email is required (incomplete registration)
        if (result.requiresVerificationEmail) {
          navigate("/verification-email-selection", {
            state: {
              userData: result.data?.userData,
              userId: result.data?.userId,
            },
          });
          return;
        }

        toast.error(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
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

  const dividerStyles = {
    display: "flex",
    alignItems: "center",
    margin: `${theme.spacing[6]} 0`,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  };

  const dividerLineStyles = {
    flex: 1,
    height: "1px",
    backgroundColor: theme.colors.border.light,
  };

  const title = "GUC Events Login";
  const subtitle =
    "Access your account to discover and participate in campus events";

  return (
    <div style={containerStyles}>
      {/* Vendor Access Button */}
      <Link
        to="/vendor-login"
        style={{
          position: "absolute",
          top: theme.spacing[6],
          right: theme.spacing[6],
          textDecoration: "none",
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          style={{
            fontSize: theme.typography.fontSize.sm,
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            color: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.colors.border.light}`,
          }}
        >
          Company Access
        </Button>
      </Link>

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
            placeholder="Enter your university email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Show detected role only when actually detected */}
          {detectedRole && (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.primary.main,
                marginTop: `-${theme.spacing[3]}`,
                marginBottom: theme.spacing[2],
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              ✓ Detected: {detectedRole}
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

          {/* Divider */}
          <div style={dividerStyles}>
            <div style={dividerLineStyles}></div>
            <span style={{ margin: `0 ${theme.spacing[4]}` }}>
              Don't have an account?
            </span>
            <div style={dividerLineStyles}></div>
          </div>

          {/* Registration Link */}
          <Link to="/signup/user" style={{ textDecoration: "none" }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              style={{ width: "100%" }}
            >
              Register as University Member
            </Button>
          </Link>

          {/* Help Links */}
          <div style={linkStyles}>
            <Link to="/forgot-password" style={linkAnchorStyles}>
              Forgot your password?
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
