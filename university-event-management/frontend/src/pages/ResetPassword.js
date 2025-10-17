import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";
import { authAPI } from "../services/auth";

// Validation schema
const resetPasswordSchema = yup.object({
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
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsChecking(true);
        const response = await authAPI.verifyResetToken(token);
        setIsValidToken(response.success);
        if (!response.success) {
          toast.error("Invalid or expired reset link");
        }
      } catch (error) {
        setIsValidToken(false);
        toast.error("Invalid or expired reset link");
      } finally {
        setIsChecking(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsValidToken(false);
      setIsChecking(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const response = await authAPI.resetPassword(token, data.password);

      if (response.success) {
        toast.success(
          "Password reset successfully! You can now login with your new password."
        );
        navigate("/");
      } else {
        toast.error(
          response.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", error);
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
    gap: theme.spacing[6],
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

  const errorMessageStyles = {
    padding: theme.spacing[6],
    textAlign: "center",
    backgroundColor: theme.colors.error.light,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.error.main}`,
    marginBottom: theme.spacing[6],
  };

  const errorTitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error.dark,
    marginBottom: theme.spacing[3],
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error.dark,
    lineHeight: 1.6,
  };

  const loadingStyles = {
    textAlign: "center",
    padding: theme.spacing[8],
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  };

  if (isChecking) {
    return (
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={loadingStyles}>Verifying reset link...</div>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>Invalid Reset Link</h1>
          </div>

          <div style={errorMessageStyles}>
            <h2 style={errorTitleStyles}>Link Expired or Invalid</h2>
            <p style={errorTextStyles}>
              This password reset link is invalid or has expired. Reset links
              are only valid for 1 hour for security purposes.
            </p>
          </div>

          <div style={linkStyles}>
            <Link to="/forgot-password" style={linkAnchorStyles}>
              Request a new reset link
            </Link>
          </div>

          <div style={linkStyles}>
            Remember your password?{" "}
            <Link to="/" style={linkAnchorStyles}>
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PreLoginNavbar />
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>Reset Your Password</h1>
            <p style={subtitleStyles}>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              required
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              required
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </Button>

            <div style={linkStyles}>
              Remember your password?{" "}
              <Link to="/" style={linkAnchorStyles}>
                Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default ResetPassword;
