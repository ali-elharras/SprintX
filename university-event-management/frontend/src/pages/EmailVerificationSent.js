import React from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme";
import Card from "../components/Card";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";

const EmailVerificationSent = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/login");
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
    color: theme.colors.primary.main,
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
    marginBottom: theme.spacing[8],
  };

  const stepStyles = {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
    border: `1px solid ${theme.colors.border.light}`,
  };

  const stepTitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[2],
  };

  const stepTextStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: "1.5",
  };

  return (
    <>
      <PreLoginNavbar />
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={iconStyles}>📧</div>

          <h1 style={titleStyles}>Verification Email Sent!</h1>

          <p style={messageStyles}>
            We've sent a verification email to your selected email address.
            Please check your inbox to verify your account.
          </p>

          <div style={stepStyles}>
            <h3 style={stepTitleStyles}>What to do next?</h3>
            <div style={stepTextStyles}>
              <strong>Step 1:</strong> Check your email inbox (and spam folder)
              <br />
              <strong>Step 2:</strong> Click the verification link in the email
              <br />
              <strong>Step 3:</strong> Once verified, you can log in to your
              account
            </div>
          </div>

          <div
            style={{
              padding: theme.spacing[4],
              backgroundColor: theme.colors.background.light,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing[6],
              border: `1px solid ${theme.colors.border.light}`,
            }}
          >
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
              }}
            >
              💡 <strong>Didn't receive the email?</strong> Check your spam
              folder or wait a few minutes for the email to arrive. The
              verification link is valid for 24 hours.
            </p>
          </div>

          <Button
            onClick={handleContinue}
            style={{
              width: "100%",
              padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
              fontSize: theme.typography.fontSize.lg,
            }}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    </>
  );
};

export default EmailVerificationSent;
