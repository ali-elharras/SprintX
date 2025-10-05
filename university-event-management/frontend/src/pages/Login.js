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

// Function to detect if email is vendor email
const isVendorEmail = (email) => {
  const vendorPattern =
    /^[a-zA-Z0-9._%+-]+@(?!student\.|staff\.|ta\.|professor\.|admin\.|eventsoffice\.).+$/;
  const universityPattern =
    /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor|admin|eventsoffice)\.[a-zA-Z0-9.-]+$/;
  return vendorPattern.test(email) && !universityPattern.test(email);
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
  const detectedUserType = isVendorEmail(watchedEmail) ? "vendor" : "user";

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Detect user type from email domain
      const userType = isVendorEmail(data.email) ? "vendor" : "user";

      let result;
      if (userType === "vendor") {
        result = await loginVendor({
          email: data.email,
          password: data.password,
        });
      } else {
        result = await loginUser({
          email: data.email,
          password: data.password,
        });
      }

      if (result.success) {
        const accountType = userType === "vendor" ? "vendor" : "user";
        const accountData = result.data[accountType];

        toast.success(
          `Welcome back, ${
            userType === "vendor"
              ? accountData.companyName
              : `${accountData.firstName} ${accountData.lastName}`
          }!`
        );

        // Navigate to intended destination or dashboard
        navigate(from, { replace: true });
      } else {
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

  const getUserTypeDescription = () => {
    if (detectedUserType === "vendor") {
      return {
        title: "Vendor Login",
        subtitle: "Access your vendor dashboard to manage event participation",
        accountNote:
          "Note: Vendor accounts require admin approval before full access.",
      };
    }
    return {
      title: "University Login",
      subtitle:
        "Access your account to discover and participate in campus events",
      accountNote:
        "Use your university email (@student, @staff, @ta, or @professor domain)",
    };
  };

  const { title, subtitle, accountNote } = getUserTypeDescription();

  return (
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
            placeholder={`Enter your ${
              detectedUserType === "vendor" ? "company" : "university"
            } email`}
            required
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Show detected account type */}
          {watchedEmail && (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color:
                  detectedUserType === "vendor"
                    ? theme.colors.eventTypes.bazaar.main
                    : theme.colors.primary.main,
                marginTop: `-${theme.spacing[3]}`,
                marginBottom: theme.spacing[2],
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              ✓ Detected:{" "}
              {detectedUserType === "vendor"
                ? "Vendor Account"
                : "University Member Account"}
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

          {/* Registration Links */}
          <div style={{ display: "grid", gap: theme.spacing[3] }}>
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

            <Link to="/signup/vendor" style={{ textDecoration: "none" }}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                style={{ width: "100%" }}
              >
                Register as Vendor
              </Button>
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
  );
};

export default Login;
