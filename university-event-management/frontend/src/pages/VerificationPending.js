import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import Card from "../components/Card";
import Button from "../components/Button";

const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reapplyVerification } = useAuth();
  const [isReapplying, setIsReapplying] = useState(false);

  // Get data from navigation state
  const { userId, email, verificationEmail, message } = location.state || {};

  // If no data, redirect to login
  if (!userId) {
    navigate("/");
    return null;
  }

  const handleReapply = async () => {
    try {
      setIsReapplying(true);

      const result = await reapplyVerification(userId);

      if (result.success) {
        toast.success(
          result.message ||
            "Verification request reset successfully. Please wait for administrator approval.",
          {
            duration: 5000,
          }
        );
        navigate("/");
      } else {
        toast.error(
          result.error ||
            "Failed to reapply for verification. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Reapply verification error:", error);
    } finally {
      setIsReapplying(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
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
    textAlign: "center",
  };

  const iconStyles = {
    fontSize: "4rem",
    color: theme.colors.warning.main,
    marginBottom: theme.spacing[6],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  };

  const messageStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    lineHeight: "1.6",
    marginBottom: theme.spacing[6],
  };

  const infoBoxStyles = {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[6],
    border: `1px solid ${theme.colors.border.light}`,
  };

  const emailStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const buttonContainerStyles = {
    display: "flex",
    gap: theme.spacing[3],
    justifyContent: "center",
    flexWrap: "wrap",
  };

  return (
    <div style={containerStyles}>
      <Card style={cardStyles}>
        <div style={iconStyles}>📧</div>

        <h1 style={titleStyles}>Verification Email Sent</h1>

        <p style={messageStyles}>
          {message ||
            "Verification email sent to your email. Please check your inbox and click the verification link to complete your account setup."}
        </p>

        <div style={infoBoxStyles}>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.muted,
              margin: 0,
              marginBottom: theme.spacing[2],
            }}
          >
            Verification email sent to:
          </p>
          <p style={emailStyles}>{verificationEmail || email}</p>
        </div>

        <div
          style={{
            backgroundColor: theme.colors.warning.light,
            padding: theme.spacing[4],
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing[6],
            border: `1px solid ${theme.colors.warning.border}`,
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.warning.dark,
              margin: 0,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            ⚠️ If you haven't received the email, check your spam folder or
            click the button below to request a new verification email.
          </p>
        </div>

        <div style={buttonContainerStyles}>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBackToLogin}
            style={{ minWidth: "150px" }}
          >
            Back to Login
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleReapply}
            loading={isReapplying}
            disabled={isReapplying}
            style={{ minWidth: "200px" }}
          >
            {isReapplying ? "Processing..." : "Reapply for Verification"}
          </Button>
        </div>

        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.muted,
            marginTop: theme.spacing[6],
          }}
        >
          Need help? Contact your system administrator for assistance.
        </p>
      </Card>
    </div>
  );
};

export default VerificationPending;
