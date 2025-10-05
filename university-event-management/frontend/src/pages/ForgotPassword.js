import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authAPI } from "../services/auth";

// Validation schema
const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const watchedEmail = watch("email") || "";

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const response = await authAPI.forgotPassword(data.email);

      if (response.success) {
        setEmailSent(true);
        toast.success("Password reset email sent! Please check your inbox.");
      } else {
        toast.error(
          response.message || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Forgot password error:", error);
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

  const successMessageStyles = {
    padding: theme.spacing[6],
    textAlign: "center",
    backgroundColor: theme.colors.success.light,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.success.main}`,
    marginBottom: theme.spacing[6],
  };

  const successTitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success.dark,
    marginBottom: theme.spacing[3],
  };

  const successTextStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.success.dark,
    lineHeight: 1.6,
  };

  if (emailSent) {
    return (
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>Check Your Email</h1>
          </div>

          <div style={successMessageStyles}>
            <h2 style={successTitleStyles}>Email Sent Successfully!</h2>
            <p style={successTextStyles}>
              We've sent a password reset link to{" "}
              <strong>{watchedEmail}</strong>
            </p>
            <p style={successTextStyles}>
              Please check your inbox and click the link to reset your password.
              The link will expire in 1 hour for security purposes.
            </p>
          </div>

          <div style={linkStyles}>
            Didn't receive the email?{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                setIsSubmitting(false);
              }}
              style={{
                ...linkAnchorStyles,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Try again
            </button>
          </div>

          <div style={linkStyles}>
            Remember your password?{" "}
            <Link to="/login" style={linkAnchorStyles}>
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Card style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Forgot Password?</h1>
          <p style={subtitleStyles}>
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <div style={linkStyles}>
            Remember your password?{" "}
            <Link to="/login" style={linkAnchorStyles}>
              Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
