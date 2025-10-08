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

const VendorLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginVendor, isLoading } = useAuth();
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
  const isValidVendorEmail = isVendorEmail(watchedEmail);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validate email format first
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(data.email)) {
        toast.error(
          "Please enter a valid email address with domain extension (e.g., name@company.com)"
        );
        setIsSubmitting(false);
        return;
      }

      // Validate that this is not a university email
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

  // Red/Orange theme overrides
  const vendorTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: {
        main: "#ea580c", // orange-600
        light: "#fb923c", // orange-400
        dark: "#c2410c", // orange-700
      },
      background: {
        gradient:
          "linear-gradient(135deg, #fed7d7 0%, #fb923c 50%, #ea580c 100%)", // red-orange gradient
      },
    },
  };

  const containerStyles = {
    minHeight: "100vh",
    background: vendorTheme.colors.background.gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vendorTheme.spacing[4],
    fontFamily: vendorTheme.typography.fontFamily.primary,
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: vendorTheme.spacing[8],
  };

  const titleStyles = {
    fontSize: vendorTheme.typography.fontSize["4xl"],
    fontWeight: vendorTheme.typography.fontWeight.bold,
    color: vendorTheme.colors.text.primary,
    marginBottom: vendorTheme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: vendorTheme.typography.fontSize.lg,
    color: vendorTheme.colors.text.secondary,
    marginBottom: vendorTheme.spacing[4],
  };

  const formStyles = {
    display: "grid",
    gap: vendorTheme.spacing[5],
  };

  const linkStyles = {
    textAlign: "center",
    marginTop: vendorTheme.spacing[6],
    fontSize: vendorTheme.typography.fontSize.sm,
    color: vendorTheme.colors.text.secondary,
  };

  const linkAnchorStyles = {
    color: vendorTheme.colors.primary.main,
    textDecoration: "none",
    fontWeight: vendorTheme.typography.fontWeight.medium,
  };

  const dividerStyles = {
    display: "flex",
    alignItems: "center",
    margin: `${vendorTheme.spacing[6]} 0`,
    color: vendorTheme.colors.text.secondary,
    fontSize: vendorTheme.typography.fontSize.sm,
  };

  const dividerLineStyles = {
    flex: 1,
    height: "1px",
    backgroundColor: vendorTheme.colors.border.light,
  };

  return (
    <div style={containerStyles}>
      {/* University Access Button */}
      <Link
        to="/login"
        style={{
          position: "absolute",
          top: vendorTheme.spacing[6],
          right: vendorTheme.spacing[6],
          textDecoration: "none",
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          style={{
            fontSize: vendorTheme.typography.fontSize.sm,
            padding: `${vendorTheme.spacing[2]} ${vendorTheme.spacing[4]}`,
            color: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${vendorTheme.colors.border.light}`,
          }}
        >
          University Member Access
        </Button>
      </Link>

      <Card style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Vendor Login</h1>
          <p style={subtitleStyles}>
            Access your vendor dashboard to manage event participation
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
          {/* Email */}
          <Input
            label="Company Email Address"
            type="email"
            placeholder="Enter your company email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

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
            style={{
              marginTop: vendorTheme.spacing[4],
              background: vendorTheme.colors.primary.main,
              backgroundColor: vendorTheme.colors.primary.main,
              borderColor: vendorTheme.colors.primary.main,
              color: "white",
              backgroundImage: "none",
            }}
          >
            {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div style={dividerStyles}>
            <div style={dividerLineStyles}></div>
            <span style={{ margin: `0 ${vendorTheme.spacing[4]}` }}>
              Don't have an account?
            </span>
            <div style={dividerLineStyles}></div>
          </div>

          {/* Registration Link */}
          <Link to="/signup/vendor" style={{ textDecoration: "none" }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              style={{
                width: "100%",
                borderColor: vendorTheme.colors.primary.main,
                color: vendorTheme.colors.primary.main,
                background: "transparent",
                backgroundColor: "transparent",
                backgroundImage: "none",
              }}
            >
              Register as Vendor
            </Button>
          </Link>
        </form>
      </Card>
    </div>
  );
};

export default VendorLogin;
