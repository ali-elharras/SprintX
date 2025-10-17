import React from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme";
import Card from "../components/Card";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";

const VerificationSuccess = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
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
          <div style={iconStyles}>✅</div>

          <h1 style={titleStyles}>Registration Submitted Successfully!</h1>

          <p style={messageStyles}>
            Thank you for submitting your registration. Your account is now in
            the review process.
          </p>

          <div style={stepStyles}>
            <h3 style={stepTitleStyles}>What happens next?</h3>
            <div style={stepTextStyles}>
              <strong>Step 1:</strong> Your account will be reviewed by an
              administrator
              <br />
              <strong>Step 2:</strong> Once approved, you'll receive a
              verification email
              <br />
              <strong>Step 3:</strong> Access the verification email to complete
              your sign-in process
            </div>
          </div>

          <div
            style={{
              backgroundColor: theme.colors.background.light,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing[8],
              border: `1px solid ${theme.colors.border.light}`,
            }}
          >
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              💡 <strong>Important:</strong> Please check your email regularly
              after approval. You'll need to access the verification email we
              send to complete your account setup.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            style={{
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Continue to Login
          </Button>

          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.muted,
              marginTop: theme.spacing[4],
            }}
          >
            Have questions? Contact your system administrator for assistance.
          </p>
        </Card>
      </div>
    </>
  );
};

export default VerificationSuccess;
